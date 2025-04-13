// Import CryptoJS library
const CryptoJS = require("crypto-js");

// Helper function to prepare key
function prepareKey(key) {
    if (!key || key.length !== 16) {
        throw new Error("Key must be a 16-character hexadecimal string.");
    }
    return CryptoJS.enc.Hex.parse(key);
}

// DES Encryption
export function encrypt(text, key) {
    key = prepareKey(key);

    const encrypted = CryptoJS.DES.encrypt(text, key, { mode: CryptoJS.mode.ECB });
    
    return encrypted.ciphertext.toString();
}

// DES Decryption
export function decrypt(ciphertext, key) {
    key = prepareKey(key);
    
    const ciphertextHex = CryptoJS.enc.Hex.parse(ciphertext);
    
    const decrypted = CryptoJS.DES.decrypt(
    { ciphertext: ciphertextHex }, key, { mode: CryptoJS.mode.ECB }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
}
