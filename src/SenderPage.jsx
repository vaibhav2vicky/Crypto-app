import React, { useState } from 'react';
import './styles.css';
import { caesarCipherEncrypt } from './utils/caesarcipher';
import { xorEncrypt } from './utils/xor';
import { monoalphabeticEncrypt } from './utils/monoalphebatic';
import { generateMonoalphabeticKey, generateHillKey, generatePlayfairKey, generateAESKey } from './utils/keyGen';
import { vigenereEncrypt } from './utils/polyalphabatic';
import { hillEncrypt } from './utils/hill';
import { playfairEncrypt } from './utils/playfair';
import { calculateSHA256 } from './utils/sha256';
import { encryptAES } from './utils/aes';


export default function SenderPage() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [encryptionType, setEncryptionType] = useState('caesar');
  const [key, setKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [hash1, setHash1] = useState('');
  const [hash2, setHash2] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);



  const handleEncrypt = async () => {
    try {
      if (!message) {
        throw new Error('Please provide a plaintext message.');
      }
  
      if (!key) {
        throw new Error('Please provide a key.');
      }
  
      let encryptedMessage = '';
  
      if (encryptionType === 'caesar') {
        if (isNaN(Number(key))) {
          throw new Error('For Caesar cipher, key must be a number');
        }
        encryptedMessage = caesarCipherEncrypt(message, key);
      } else if (encryptionType === 'monoalphabetic') {
        encryptedMessage = monoalphabeticEncrypt(message, key);
      } else if (encryptionType === 'polyalphabetic') {
        encryptedMessage = vigenereEncrypt(message, key);
      } else if (encryptionType === 'xor') {
        encryptedMessage = xorEncrypt(message, key);
      } else if (encryptionType === 'hill') {
        encryptedMessage = hillEncrypt(message, key);
      } else if (encryptionType === 'playfair') {
        encryptedMessage = playfairEncrypt(message, key);
      } else if (encryptionType === 'aes') {
        // Convert the encrypted Uint8Array to hex string for display/storage
        const encryptedData = await encryptAES(message, key);
        encryptedMessage = Array.from(new Uint8Array(encryptedData))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
  
      setCiphertext(encryptedMessage);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCiphertext('');
    }
  };

  const handleSend = async () => {
    if (!ciphertext && !image) {
      setError('Please encrypt a message or upload an image before sending.');
      return;
    }
  
    setError(null);
    setIsSending(true);
  
    try {
      const formData = new FormData();
  
      if (ciphertext) {
        formData.append('message', ciphertext);
        formData.append('messageType', encryptionType);
      }
  
      if (image) {
        if (encryptionType === 'aes') {
          try {
            const encryptedImage = await encryptAES(image, key);
            formData.append('image', encryptedImage, image.name);
            formData.append('encryptionType', 'aes');
          } catch (encryptError) {
            throw new Error(`Image encryption failed: ${encryptError.message}`);
          }
        } else {
          formData.append('image', image);
          formData.append('encryptionType', 'none');
        }
      }
  
      const response = await fetch('http://localhost:5000/api/send', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send data');
      }
  
      const result = await response.json();
      alert(result.message || 'Data sent successfully!');
    } catch (err) {
      console.error('Full sending error:', err);
      setError(err.message || 'Failed to send data. Please check console for details.');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileComparison = async () => {
    if (!file1 || !file2) {
      setError('Please select both files to compare');
      return;
    }

    try {
      setComparisonResult(null);
      const hash1 = await calculateSHA256(file1);
      const hash2 = await calculateSHA256(file2);

      setHash1(hash1);
      setHash2(hash2);
      setComparisonResult(hash1 === hash2);
    } catch (err) {
      setError('Error calculating file hashes: ' + err.message);
    }
  };
  React.useEffect(() => {
    document.title = "Sender Page | Secure Message Encryption";
  }, []);


  return (

    <div className="container" >

      <h1 className="title">Sender</h1>
      {error && <p className="error">{error}</p>}

      <div className="field">
        <label>Technique:</label>
        <select
          className="select"
          value={encryptionType}
          onChange={(e) => setEncryptionType(e.target.value)}
        >
          <option value="caesar">Caesar Cipher</option>
          <option value="xor">XOR Encryption</option>
          <option value="monoalphabetic">Monoalphabetic Cipher</option>
          <option value="hill">Hill Cipher</option>
          <option value="playfair">Playfair Cipher</option>
          <option value="polyalphabetic">polyalphabetic Cipher</option>
          <option value="aes">AES Encryption</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          className="input"
          type="text"
          placeholder={
            encryptionType === 'caesar' ? 'Enter shift number' :
              encryptionType === 'monoalphabetic' ? 'Enter 26 unique letters' :
                encryptionType === 'polyalphabetic' ? 'Enter keyword (letters only)' :
                  encryptionType === 'hill' ? 'Enter 4 letters (e.g., "HILL")' :
                    encryptionType === 'playfair' ? 'Enter keyword (e.g., "PLAYFAIR")' :
                      encryptionType === 'aes' ? 'Enter or generate a strong key' :
                        'Enter encryption key'
          }
          value={key}
          onChange={(e) => setKey(e.target.value)}
          style={{ flex: 1, marginRight: '8px' }}
        />
        {['monoalphabetic', 'hill', 'playfair'].includes(encryptionType) && (
          <button
            className="button generate-key"
            onClick={() => {
              setKey(
                encryptionType === 'monoalphabetic' ? generateMonoalphabeticKey() :
                  encryptionType === 'hill' ? generateHillKey() :
                    generatePlayfairKey()
              );
            }}
          >
            Generate Key
          </button>
        )}
        {encryptionType === 'aes' && (
          <button
            className="button generate-key"
            onClick={() => {
              setKey(generateAESKey());
            }}
          >
            Generate Secure Key
          </button>
        )}
      </div>

      <div className="field">
        <label>Plaintext:</label>
        <textarea
          className="input"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button className="button" onClick={handleEncrypt}>
        Encrypt
      </button>

      <div className="field">
        <label>Ciphertext:</label>
        <textarea
          className="input"
          value={ciphertext}
          readOnly
          placeholder="Encrypted message will appear here"
        />
      </div>

      <div className="field">
        <label>Attach Image (optional):</label>
        <input
          type="file"
          className="inputFile"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      <button className="button" onClick={handleSend}>
        Send
      </button>
      <div>
        <div className="file-comparison-section" style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid #eee' }}>
          <h2>File Integrity Comparison</h2>
          <p>Compare two files using SHA-256 hashing</p>

          <div className="file-inputs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>File 1:</label>
              <input
                type="file"
                onChange={(e) => setFile1(e.target.files[0])}
                className="inputFile"
              />
              {file1 && <div style={{ fontSize: '0.8em', marginTop: '4px' }}>{file1.name}</div>}
            </div>

            <div className="field" style={{ flex: 1 }}>
              <label>File 2:</label>
              <input
                type="file"
                onChange={(e) => setFile2(e.target.files[0])}
                className="inputFile"
              />
              {file2 && <div style={{ fontSize: '0.8em', marginTop: '4px' }}>{file2.name}</div>}
            </div>
          </div>

          <button
            className="button"
            onClick={handleFileComparison}
            disabled={!file1 || !file2}
          >
            Compare Files
          </button>

          {comparisonResult !== null && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Comparison Result:</h4>
              <div style={{
                padding: '1rem',
                backgroundColor: comparisonResult ? '#e8f5e9' : '#ffebee',
                borderRadius: '4px'
              }}>
                <p style={{ fontWeight: 'bold', color: comparisonResult ? '#2e7d32' : '#c62828' }}>
                  {comparisonResult ? '✅ Files are identical' : '❌ Files are different'}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8em', marginBottom: '4px' }}>File 1 Hash:</p>
                    <code style={{
                      display: 'block',
                      wordBreak: 'break-all',
                      fontSize: '0.7em',
                      backgroundColor: '#f5f5f5',
                      padding: '0.5rem',
                      borderRadius: '4px'
                    }}>{hash1}</code>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8em', marginBottom: '4px' }}>File 2 Hash:</p>
                    <code style={{
                      display: 'block',
                      wordBreak: 'break-all',
                      fontSize: '0.7em',
                      backgroundColor: '#f5f5f5',
                      padding: '0.5rem',
                      borderRadius: '4px'
                    }}>{hash2}</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}

