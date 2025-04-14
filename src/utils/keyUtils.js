// utils/keyUtils.js

export async function importPublicKey(base64Key) {
    const binaryKey = base64ToArrayBuffer(base64Key);
    return await window.crypto.subtle.importKey(
      "spki",
      binaryKey,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
  }
  
  export async function importPrivateKey(base64Key) {
    const binaryKey = base64ToArrayBuffer(base64Key);
    return await window.crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
    );
  }
  
  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }