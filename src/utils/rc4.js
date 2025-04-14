export function encryptRC4(plaintext, key) {
    // Convert inputs to byte arrays using UTF-8 encoding
    const plainBytes = new TextEncoder().encode(plaintext);
    const keyBytes = new TextEncoder().encode(key);
    
    // Initialize state array (S-box)
    const S = new Array(256);
    for (let i = 0; i < 256; i++) {
        S[i] = i;
    }
    
    // Key Scheduling Algorithm (KSA)
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + keyBytes[i % keyBytes.length]) % 256;
        // Swap S[i] and S[j]
        [S[i], S[j]] = [S[j], S[i]];
    }
    
    // Pseudo-Random Generation Algorithm (PRGA)
    let i = 0;
    j = 0;
    const cipherBytes = new Uint8Array(plainBytes.length);
    
    for (let k = 0; k < plainBytes.length; k++) {
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        // Swap S[i] and S[j]
        [S[i], S[j]] = [S[j], S[i]];
        const t = (S[i] + S[j]) % 256;
        cipherBytes[k] = plainBytes[k] ^ S[t];
    }
    
    // Convert cipher bytes to hex string
    return Array.from(cipherBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}


export function decryptRC4(ciphertextHex, key) {
    // Convert hex string to byte array
    const cipherBytes = new Uint8Array(
        ciphertextHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    const keyBytes = new TextEncoder().encode(key);
    
    // Initialize state array (S-box)
    const S = new Array(256);
    for (let i = 0; i < 256; i++) {
        S[i] = i;
    }
    
    // Key Scheduling Algorithm (KSA)
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + keyBytes[i % keyBytes.length]) % 256;
        // Swap S[i] and S[j]
        [S[i], S[j]] = [S[j], S[i]];
    }
    
    // Pseudo-Random Generation Algorithm (PRGA)
    let i = 0;
    j = 0;
    const plainBytes = new Uint8Array(cipherBytes.length);
    
    for (let k = 0; k < cipherBytes.length; k++) {
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        // Swap S[i] and S[j]
        [S[i], S[j]] = [S[j], S[i]];
        const t = (S[i] + S[j]) % 256;
        plainBytes[k] = cipherBytes[k] ^ S[t];
    }
    
    // Convert bytes back to string
    return new TextDecoder().decode(plainBytes);
}