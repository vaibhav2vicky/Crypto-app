// utils/xor.js
export function xorEncrypt(data, key) {
  if (typeof data === 'object') { // For File objects
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] ^= key.charCodeAt(i % key.length);
        }
        resolve(bytes);
      };
      reader.readAsArrayBuffer(data);
    });
  } else { // For strings
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }
}

export function xorDecrypt(data, key) {
  return xorEncrypt(data, key); // XOR is symmetric
}