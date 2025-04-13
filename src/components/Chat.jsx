import React, { useState, useEffect, useRef } from 'react';
import '../styles.css';
import CryptoUtils from '../utils/CryptoUtils';
import DH from '../utils/DH';
import DSA from '../utils/DSA';

const Chat = ({ username, otherUsername }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [sharedSecret, setSharedSecret] = useState(null);
  const dh = useRef(new DH());
  const dsa = useRef(new DSA());
  const [publicKey, setPublicKey] = useState(null);
  const [otherPublicKey, setOtherPublicKey] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send user info and public key
      ws.send(JSON.stringify({
        type: 'init',
        username,
        publicKey: dh.current.getPublicKey(),
        dsaPublicKey: dsa.current.privateKey // In real DSA, this would be different
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'init') {
        // Received other user's public key
        setOtherPublicKey(data.publicKey);
        // Compute shared secret
        const secret = dh.current.computeSharedSecret(data.publicKey);
        setSharedSecret(secret.toString());
        
        // In a real app, you'd derive an AES key from this secret
        console.log('Shared secret established:', secret);
      } else if (data.type === 'message') {
        // Decrypt the message
        const decrypted = CryptoUtils.aesDecrypt(data.message, sharedSecret);
        
        // Verify signature
        const isValid = dsa.current.verify(decrypted, data.signature, data.dsaPublicKey);
        
        setMessages(prev => [...prev, {
          sender: data.sender,
          text: decrypted,
          isValid: isValid
        }]);
      }
    };

    return () => {
      ws.close();
    };
  }, [username, sharedSecret]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket || !sharedSecret) return;
    
    // Encrypt the message
    const encrypted = CryptoUtils.aesEncrypt(inputMessage, sharedSecret);
    
    // Sign the message
    const signature = dsa.current.sign(inputMessage, dsa.current.privateKey);
    
    // Send through WebSocket
    socket.send(JSON.stringify({
      type: 'message',
      sender: username,
      message: encrypted,
      signature: signature,
      dsaPublicKey: dsa.current.privateKey // In real DSA, this would be different
    }));
    
    // Add to local messages
    setMessages(prev => [...prev, {
      sender: username,
      text: inputMessage,
      isValid: true
    }]);
    
    setInputMessage('');
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '500px', margin: '20px auto' }}>
      <h2>{username}'s Chat with {otherUsername}</h2>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #eee', marginBottom: '10px', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === username ? 'right' : 'left', margin: '5px' }}>
            <strong>{msg.sender}: </strong>
            <span>{msg.text}</span>
            {msg.isValid === false && <span style={{ color: 'red' }}> (Invalid signature!)</span>}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={{ borderRadius: '5px',width: '70%', padding: '8px' }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} class='button' style={{ width: '25%', padding: '8px', marginLeft: '5px' }} >
          Send
        </button>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        {sharedSecret ? (
          <p>Secure connection established. Shared secret: {sharedSecret}</p>
        ) : (
          <p>Establishing secure connection...</p>
        )}
      </div>
    </div>
  );
};

export default Chat;