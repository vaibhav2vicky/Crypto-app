function validateMonoalphabeticKey(key) {
  if (typeof key !== 'string' || key.length !== 26) {
    throw new Error('Key must be a 26-character string');
  }

  const seen = new Set();
  for (const char of key.toLowerCase()) {
    if (!/[a-z]/.test(char)) {
      throw new Error('Key must contain only letters');
    }
    if (seen.has(char)) {
      throw new Error('Key must contain each letter exactly once');
    }
    seen.add(char);
  }
}

// Monoalphabetic Cipher Encryption
export function monoalphabeticEncrypt(text, key) {
  validateMonoalphabeticKey(key);
  key = key.toLowerCase();

  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // Uppercase A-Z
      return key[code - 65].toUpperCase();
    }
    if (code >= 97 && code <= 122) { // Lowercase a-z
      return key[code - 97];
    }
    return char; // Non-alphabetic characters remain unchanged
  }).join('');
}

// Monoalphabetic Cipher Decryption
export function monoalphabeticDecrypt(text, key) {
  validateMonoalphabeticKey(key);
  key = key.toLowerCase();

  // Create reverse mapping for decryption
  const reverseMap = {};
  for (let i = 0; i < 26; i++) {
    reverseMap[key[i]] = String.fromCharCode(97 + i);
  }

  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // Uppercase A-Z
      return reverseMap[char.toLowerCase()].toUpperCase();
    }
    if (code >= 97 && code <= 122) { // Lowercase a-z
      return reverseMap[char];
    }
    return char; // Non-alphabetic characters remain unchanged
  }).join('');
}