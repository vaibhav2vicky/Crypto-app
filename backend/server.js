const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const app = express();
const upload = multer({ dest: 'uploads/' });

let messageData = {};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.post('/api/send', upload.single('image'), (req, res) => {
  try {
    messageData = {
      message: req.body.message || null,
      messageType: req.body.messageType || null,
      encryptionType: req.body.encryptionType || null,
      timestamp: new Date().toISOString()
    };

    if (req.file) {
      const fileExtension = path.extname(req.file.originalname);
      const newFilename = `${req.file.filename}${fileExtension}`;
      const newPath = path.join('uploads', newFilename);
      
      // Rename file to include original extension
      fs.renameSync(req.file.path, newPath);
      
      // Store the image path with extension
      messageData.image = `/uploads/${newFilename}`;
      messageData.imageName = req.file.originalname;
      messageData.imageType = req.file.mimetype;
    }

    // Notify WebSocket clients about new data
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'data_update',
          hasMessage: !!messageData.message,
          hasImage: !!messageData.image
        }));
      }
    });

    res.status(200).json({ 
      success: true,
      message: 'Data received successfully',
      imageUrl: messageData.image 
    });
  } catch (err) {
    console.error('Error in /api/send:', err);
    
    // Clean up uploaded file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to process data',
      details: err.message 
    });
  }
});

app.get('/api/receive', (req, res) => {
  try {
    if (!messageData || (!messageData.message && !messageData.image)) {
      return res.status(404).json({ 
        error: 'No data available',
        available: false 
      });
    }
    if (messageData.messageType === 'ecc' && messageData.message) {
      messageData.message = messageData.message.replace(/'/g, '');
    }
    
    const responseData = { 
      ...messageData,
      available: true
    };
    
    // If image exists, verify it's still available
    if (messageData.image) {
      const imagePath = path.join(__dirname, messageData.image);
      if (!fs.existsSync(imagePath)) {
        responseData.image = null;
        responseData.imageError = 'Image no longer available on server';
      }
    }
    
    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error in /api/receive:', err);
    res.status(500).json({ 
      error: 'Failed to retrieve data',
      details: err.message 
    });
  }
});

// Serve uploaded files with proper headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    if (path.endsWith('.enc')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
  }
}));

// Clean up old files periodically
setInterval(() => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  if (messageData.timestamp && new Date(messageData.timestamp) < oneHourAgo) {
    // Clean up old image if exists
    if (messageData.image) {
      const imagePath = path.join(__dirname, messageData.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    messageData = {};
  }
}, 60 * 60 * 1000); // Run every hour

// WebSocket server
const clients = {};

wss.on('connection', (ws) => {
  let username = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'init') {
        username = data.username;
        clients[username] = ws;
        console.log(`${username} connected`);
        
        // Broadcast public key to other user
        Object.keys(clients).forEach(user => {
          if (user !== username && clients[user]) {
            clients[user].send(JSON.stringify({
              type: 'init',
              username: username,
              publicKey: data.publicKey,
              dsaPublicKey: data.dsaPublicKey
            }));
          }
        });
      } 
      else if (data.type === 'message') {
        const recipient = Object.keys(clients).find(user => user !== username);
        if (recipient && clients[recipient]) {
          clients[recipient].send(JSON.stringify({
            type: 'message',
            sender: username,
            message: data.message,
            signature: data.signature,
            dsaPublicKey: data.dsaPublicKey
          }));
        }
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    if (username) {
      delete clients[username];
      console.log(`${username} disconnected`);
      
      // Notify other clients
      Object.keys(clients).forEach(user => {
        if (clients[user]) {
          clients[user].send(JSON.stringify({
            type: 'user_disconnected',
            username: username
          }));
        }
      });
    }
  });
});

app.listen(5000, () => console.log('HTTP server running on port 5000'));
console.log('WebSocket server running on ws://localhost:8080');