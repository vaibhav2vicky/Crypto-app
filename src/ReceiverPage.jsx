import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { caesarCipherDecrypt } from './utils/caesarcipher';
import { xorDecrypt } from './utils/xor';
import { monoalphabeticDecrypt } from './utils/monoalphebatic';
import { vigenereDecrypt } from './utils/polyalphabatic';
import { hillDecrypt } from './utils/hill';
import { playfairDecrypt } from './utils/playfair';
import { decryptAES } from './utils/aes';
import { decryptotp } from './utils/otp';
import { decryptRailFence } from './utils/railfence';
import { decryptColumnar } from './utils/columnar';
import { decryptdes } from './utils/des';
import { decryptRC4 } from './utils/rc4';
import { decryptRSA } from './utils/rsa';
import { decryptECC } from './utils/ecc';
import './styles.css';

export default function ReceiverPage() {
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [decryptedImage, setDecryptedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessage = async () => {
    if (!key) {
      setError('Please enter a decryption key.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setDecryptedMessage('');
    setDecryptedImage(null);
    setImageUrl('');

    try {
      const response = await fetch('http://localhost:5000/api/receive');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log('Received data:', data);

      // Handle message decryption
      if (data.message) {
        let decrypted;
        switch (data.messageType) {
          case 'caesar':
            decrypted = caesarCipherDecrypt(data.message, key);
            break;
          case 'monoalphabetic':
            decrypted = monoalphabeticDecrypt(data.message, key);
            break;
          case 'polyalphabetic':
            decrypted = vigenereDecrypt(data.message, key);
            break;
          case 'xor':
            decrypted = xorDecrypt(data.message, key);
            break;
          case 'hill':
            decrypted = hillDecrypt(data.message, key);
            break;
          case 'playfair':
            decrypted = playfairDecrypt(data.message, key);
            break;
          case 'otp':
            decrypted = decryptotp(data.message, key);
            break;
          case 'railfence':
              decrypted = decryptRailFence(data.message, key);
              break;
          case 'des':
            decrypted = decryptdes(data.message, key);
            break;
          case 'columnar':
            decrypted = decryptColumnar(data.message, key);
            break;
          case 'rc4':
            decrypted = decryptRC4(data.message, key);
            break;
          case 'rsa':
            decrypted = await decryptRSA(key, data.message);
            break;
          case 'ecc':
              decrypted = await decryptECC(data.message, key);
            break;

          case 'aes':
            try {
              // Convert hex string to Uint8Array for AES decryption
              const encryptedData = new Uint8Array(
                data.message.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
              );
              decrypted = await decryptAES(encryptedData, key);
            } catch (aesError) {
              throw new Error(`AES decryption failed: ${aesError.message}`);
            }
            break;
          default:
            throw new Error('Unknown encryption type');
        }
        setDecryptedMessage(decrypted);
      }

      // Handle image decryption
      if (data.image) {
        try {
          const imageResponse = await fetch(`http://localhost:5000${data.image}`);
          if (!imageResponse.ok) throw new Error('Failed to fetch image');

          const imageBlob = await imageResponse.blob();

          if (data.encryptionType === 'aes') {
            const decryptedBlob = await decryptAES(imageBlob, key);
            setDecryptedImage(decryptedBlob);
            setImageUrl(URL.createObjectURL(decryptedBlob));
          } else {
            setDecryptedImage(imageBlob);
            setImageUrl(URL.createObjectURL(imageBlob));
          }
        } catch (imgError) {
          console.error('Image processing error:', imgError);
          setError('Image processing failed: ' + imgError.message);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to fetch or decrypt data. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!decryptedImage || !imageUrl) return;

    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `decrypted_${decryptedImage.name || 'image'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    document.title = "Receiver Page | Secure Message Encryption";

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className="container">
      <Helmet>
        <title>Receiver Page | Secure Message Encryption</title>
      </Helmet>

      <h1 className="title">Receiver Page</h1>

      <div className="field">
        <label>Decryption Key:</label>
        <input
          className="input"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter the decryption key"
        />
      </div>

      <button
        className="button"
        onClick={fetchMessage}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Fetch and Decrypt Message'}
      </button>

      {error && <p className="error">{error}</p>}

      <div className="results-section">
        <div className="message-result">
          <h2>Decrypted Message:</h2>
          <div className="decrypted-message">
            {decryptedMessage || 'No message decrypted yet'}
          </div>
        </div>

        {imageUrl && (
          <div className="image-result">
            <h2>Decrypted Image:</h2>
            <div className="image-container">
              <div className="image-wrapper">
                <img
                  src={imageUrl}
                  alt="Decrypted content"
                  className="decrypted-image"
                  onError={() => setError('Failed to load image')}
                />
              </div>
              <br />
              <button
                className="button download-button"
                onClick={handleDownloadImage}
              >
                Download Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}