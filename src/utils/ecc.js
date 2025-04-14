export async function encryptECC(publicKeyBase64, message) {
  try {
    // Generate ephemeral key pair
    const ephemeralKeyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey"]
    );

    // Import recipient's public key
    const recipientPublicKey = await importPublicKey(publicKeyBase64);

    // Derive shared secret
    const sharedSecret = await window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: recipientPublicKey,
      },
      ephemeralKeyPair.privateKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt"]
    );

    // Encrypt message with AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedMessage = new TextEncoder().encode(message);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      sharedSecret,
      encodedMessage
    );

    // Export ephemeral public key
    const ephemeralPublicKey = await exportPublicKey(ephemeralKeyPair.publicKey);

    const result = {
      ciphertext: arrayBufferToBase64(encrypted),
      iv: arrayBufferToBase64(iv),
      ephemeralPublicKey,
      algorithm: 'ECC-AES-GCM', // Add metadata
      timestamp: Date.now()
    };

    return toBase64(JSON.stringify(result));
  } catch (error) {
    console.error("Error encrypting with ECC:", error);
    throw error;
  }
}

// Helper functions with corrections
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  try {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error('Error decoding base64:', error);
    throw new Error('Invalid base64 string');
  }
}

function toBase64(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return arrayBufferToBase64(data);
}

function fromBase64(base64) {
  const buffer = base64ToArrayBuffer(base64);
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Updated decryptECC function
export async function decryptECC(encryptedData, privateKeyBase64) {
  try {
    // Parse and decode the input data
    const decoded = typeof encryptedData === 'string' ? fromBase64(encryptedData) : encryptedData;
    const data = typeof decoded === 'string' ? JSON.parse(decoded) : decoded;

    // Validate required fields
    if (!data.ciphertext || !data.iv || !data.ephemeralPublicKey) {
      throw new Error('Invalid encrypted data format');
    }

    // Import keys
    const privateKey = await importPrivateKey(privateKeyBase64);
    const ephemeralKey = await importPublicKey(data.ephemeralPublicKey);

    // Derive shared secret
    const sharedSecret = await window.crypto.subtle.deriveKey(
      { name: "ECDH", public: ephemeralKey },
      privateKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decrypt the message
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToArrayBuffer(data.iv) },
      sharedSecret,
      base64ToArrayBuffer(data.ciphertext)
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed: ' + error.message);
  }
}
// Helper functions (same as RSA)
async function exportPublicKey(publicKey) {
  const exported = await window.crypto.subtle.exportKey("spki", publicKey);
  return arrayBufferToBase64(exported);
}

async function exportPrivateKey(privateKey) {
  const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey);
  return arrayBufferToBase64(exported);
}

async function importPublicKey(base64Key) {
  const binaryKey = base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    "spki",
    binaryKey,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

async function importPrivateKey(base64Key) {
  const binaryKey = base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
}

