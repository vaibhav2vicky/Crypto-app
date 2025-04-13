// Helper function to prepare the key
function prepareKey(key) {
    return key.toUpperCase().replace(/[^A-Z]/g, '');
}

// Encrypt function
export function encrypt(text, key) {
    text = text.toUpperCase().replace(/[^A-Z]/g, '');
    key = prepareKey(key);
    let cipherText = '';
    
    const cipher = [];
    for (let i = 0; i < key.length; i++) {
        cipher[i] = (text.charCodeAt(i) - 'A'.charCodeAt(0) + key.charCodeAt(i) - 'A'.charCodeAt(0)) % 26;
    }
    
    for (let i = 0; i < key.length; i++) {
        let x = cipher[i] + 'A'.charCodeAt(0);
        cipherText += String.fromCharCode(x);
    }
    
    return cipherText;
}

// Decrypt function
export function decrypt(text, key) {
    key = prepareKey(key);
    let plainText = '';
    
    const plain = [];
    for (let i = 0; i < key.length; i++) {
        plain[i] = (text.charCodeAt(i) - 'A'.charCodeAt(0) - (key.charCodeAt(i) - 'A'.charCodeAt(0)) + 26) % 26;
    }
    
    for (let i = 0; i < key.length; i++) {
        let x = plain[i] + 'A'.charCodeAt(0);
        plainText += String.fromCharCode(x);
    }
    
    return plainText;
}