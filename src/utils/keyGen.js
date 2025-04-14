export function generateMonoalphabeticKey() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let shuffled = alphabet.split('');

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.join('');
}

//hill cipher functions
export function generateHillKey() {
  let keyMatrix;
  let det;

  do {
    const nums = [];
    for (let i = 0; i < 4; i++) {
      nums.push(Math.floor(Math.random() * 26));
    }
    keyMatrix = [
      [nums[0], nums[1]],
      [nums[2], nums[3]]
    ];
    det = matrixDeterminant(keyMatrix);
  } while (det === 0 || gcd(det, 26) !== 1);

  return numbersToText([...keyMatrix[0], ...keyMatrix[1]]);
}

// Helper function for GCD
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function numbersToText(numbers) {
  return numbers.map(n => String.fromCharCode(n + 65)).join('');
}
function matrixDeterminant(matrix) {
  if (matrix.length === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }
  // For larger matrices (not implemented here)
  throw new Error('Only 2x2 matrices supported');
}

// playfair matrix key Gen
export function generatePlayfairKey() {
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // No J
  let key = '';

  // Random length between 5 and 10 characters
  const length = Math.floor(Math.random() * 6) + 5;

  for (let i = 0; i < length; i++) {
    key += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return key;
}


// utils/keyGen.js
export function generateAESKey() {
  // Generate a random 256-bit (32-byte) key and return as hex string
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateDESKey() {
  // 8 random bytes (64 bits) as hex string
  const keyBytes = new Uint8Array(8);
  window.crypto.getRandomValues(keyBytes);
  return Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function generateRC4Key(length = 16) {
  // Generate a random key of the specified length (default 16 bytes)
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return key;
}


// utils/keyGen.js (add these to your existing file)

export async function generateRSAKeys(keySize = 2048) {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: keySize,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    const publicKey = await exportPublicKey(keyPair.publicKey);
    const privateKey = await exportPrivateKey(keyPair.privateKey);
    
    return {
      publicKeyObj: keyPair.publicKey,
      privateKeyObj: keyPair.privateKey,
      publicKey,
      privateKey
    };
  } catch (error) {
    console.error("Error generating RSA keys:", error);
    throw error;
  }
}

async function exportPublicKey(publicKey) {
  const exported = await window.crypto.subtle.exportKey("spki", publicKey);
  return arrayBufferToBase64(exported);
}

async function exportPrivateKey(privateKey) {
  const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey);
  return arrayBufferToBase64(exported);
}

export function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
//ECC
export async function generateECCKeys() {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256", // Using secp256r1 (NIST P-256)
      },
      true,
      ["deriveKey", "deriveBits"]
    );

    const publicKey = await exportPublicKey(keyPair.publicKey);
    const privateKey = await exportPrivateKey(keyPair.privateKey);

    return {
      publicKeyObj: keyPair.publicKey,
      privateKeyObj: keyPair.privateKey,
      publicKey,
      privateKey
    };
  } catch (error) {
    console.error("Error generating ECC keys:", error);
    throw error;
  }
}