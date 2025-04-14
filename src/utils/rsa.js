// utils/rsa.js

// Import the required functions from keyUtils.js
import { importPublicKey, importPrivateKey } from './keyUtils';
import { arrayBufferToBase64} from './keyGen'


export async function encryptRSA( publicKeyBase64, message) {
  try {
    const publicKey = await importPublicKey(publicKeyBase64);
    const encodedMessage = new TextEncoder().encode(message);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      encodedMessage
    );
    return arrayBufferToBase64(encrypted);
  } catch (error) {
    console.error("Error encrypting with RSA:", error);
    throw error;
  }
}


export async function decryptRSA(encryptedBase64, privateKeyBase64) {
  try {
    const privateKey = await importPrivateKey(privateKeyBase64);
    const encryptedData = base64ToArrayBuffer(encryptedBase64);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedData
    );
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Error decrypting with RSA:", error);
    throw error;
  }
}


function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}