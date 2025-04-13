// Add these to your existing ciphertext.js file

// Vigenère (Polyalphabetic) Cipher Encryption
export function vigenereEncrypt(text, key) {
  if (!/^[a-zA-Z]+$/.test(key)) {
    throw new Error('Vigenère key must contain only letters');
  }

  key = key.toLowerCase();
  let keyIndex = 0;

  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // Uppercase A-Z
      const shift = key.charCodeAt(keyIndex % key.length) - 97;
      const encrypted = ((code - 65 + shift) % 26) + 65;
      keyIndex++;
      return String.fromCharCode(encrypted);
    }
    if (code >= 97 && code <= 122) { // Lowercase a-z
      const shift = key.charCodeAt(keyIndex % key.length) - 97;
      const encrypted = ((code - 97 + shift) % 26) + 97;
      keyIndex++;
      return String.fromCharCode(encrypted);
    }
    return char; // Non-alphabetic characters remain unchanged
  }).join('');
}

// Vigenère (Polyalphabetic) Cipher Decryption
export function vigenereDecrypt(text, key) {
  if (!/^[a-zA-Z]+$/.test(key)) {
    throw new Error('Vigenère key must contain only letters');
  }

  key = key.toLowerCase();
  let keyIndex = 0;

  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // Uppercase A-Z
      const shift = key.charCodeAt(keyIndex % key.length) - 97;
      const decrypted = ((code - 65 - shift + 26) % 26) + 65;
      keyIndex++;
      return String.fromCharCode(decrypted);
    }
    if (code >= 97 && code <= 122) { // Lowercase a-z
      const shift = key.charCodeAt(keyIndex % key.length) - 97;
      const decrypted = ((code - 97 - shift + 26) % 26) + 97;
      keyIndex++;
      return String.fromCharCode(decrypted);
    }
    return char; // Non-alphabetic characters remain unchanged
  }).join('');
}