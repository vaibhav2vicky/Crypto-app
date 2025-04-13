class CryptoUtils {
  // AES Encryption (simplified implementation)
  static aesEncrypt(message, key) {
    // Simple XOR "encryption" for demonstration
    // In a real app, replace with proper AES implementation using Web Crypto API
    let result = '';
    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Base64 encode
  }

  static aesDecrypt(encrypted, key) {
    // Simple XOR "decryption" for demonstration
    const message = atob(encrypted);
    let result = '';
    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }

  // Generate random string for keys/IVs
  static generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Simple hash function for DSA (replacement for BigInt operations)
  static simpleHash(message) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = ((hash << 5) - hash) + message.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}

export default CryptoUtils;