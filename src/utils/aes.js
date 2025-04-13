// utils/aes.js
export async function encryptAES(data, password) {
  try {
    // Validate inputs
    if (!data) throw new Error('No data provided for encryption');
    if (!password) throw new Error('No encryption key provided');

    // Convert data to ArrayBuffer
    let dataBuffer;
    if (data instanceof Blob || data instanceof File) {
      dataBuffer = await data.arrayBuffer();
    } else if (typeof data === 'string') {
      const enc = new TextEncoder();
      dataBuffer = enc.encode(data).buffer;
    } else {
      dataBuffer = data;
    }

    // Prepare key material
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive key with salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBuffer
    );

    // Combine salt, IV and encrypted data
    const result = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedContent), salt.length + iv.length);

    // Return appropriate format
    if (data instanceof Blob || data instanceof File) {
      return new Blob([result], { type: data.type });
    }
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

export async function decryptAES(encryptedData, password) {
  try {
    if (!encryptedData) throw new Error('No encrypted data provided');
    if (!password) throw new Error('No decryption key provided');

    // Convert to ArrayBuffer
    const encryptedBuffer = encryptedData instanceof Blob 
      ? await encryptedData.arrayBuffer() 
      : encryptedData;
    
    const encryptedArray = new Uint8Array(encryptedBuffer);
    
    // Extract salt (first 16 bytes), IV (next 12 bytes), and ciphertext
    if (encryptedArray.length < 28) {
      throw new Error('Invalid encrypted data format');
    }
    
    const salt = encryptedArray.slice(0, 16);
    const iv = encryptedArray.slice(16, 28);
    const ciphertext = encryptedArray.slice(28);
    
    // Prepare key material
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    // Derive key
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );
    
    // Return appropriate format
    if (encryptedData instanceof Blob) {
      return new Blob([decryptedContent], { type: encryptedData.type });
    }
    
    // Check if decrypted content is text
    try {
      const dec = new TextDecoder();
      return dec.decode(decryptedContent);
    } catch {
      return new Uint8Array(decryptedContent);
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

// Helper functions for text-only operations
export async function encryptText(text, password) {
  const encrypted = await encryptAES(text, password);
  return Array.from(new Uint8Array(encrypted))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function decryptText(hexString, password) {
  const encrypted = new Uint8Array(
    hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
  return await decryptAES(encrypted, password);
}