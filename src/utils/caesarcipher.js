// utils/ciphertext.js
export function caesarCipherEncrypt(text, shift) {
  shift = parseInt(shift);
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // A-Z
      return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }
    if (code >= 97 && code <= 122) { // a-z
      return String.fromCharCode(((code - 97 + shift) % 26) + 97);
    }
    return char;
  }).join('');
}

export function caesarCipherDecrypt(text, shift) {
  shift = parseInt(shift);
  return caesarCipherEncrypt(text, (26 - shift) % 26);
}

