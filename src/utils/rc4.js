// RC4 Stream Cipher Implementation

// Helper function: Convert binary string to decimal array
function convertToDecimal(input, n) {
    return input.match(new RegExp(`.{1,${n}}`, "g")).map(bin => parseInt(bin, 2));
}

// Key Scheduling Algorithm (KSA)
function KSA(S, key_list) {
    let j = 0, N = S.length;
    for (let i = 0; i < N; i++) {
        j = (j + S[i] + key_list[i % key_list.length]) % N;
        [S[i], S[j]] = [S[j], S[i]];
    }
}

// Pseudo-Random Generation Algorithm (PRGA)
function PRGA(S, pt_length) {
    let i = 0, j = 0, key_stream = [];
    for (let k = 0; k < pt_length; k++) {
        i = (i + 1) % S.length;
        j = (j + S[i]) % S.length;
        [S[i], S[j]] = [S[j], S[i]];
        let t = (S[i] + S[j]) % S.length;
        key_stream.push(S[t]);
    }
    return key_stream;
}

// XOR Operation
function XOR(data, key_stream, n) {
    return data.map((val, idx) => key_stream[idx] ^ val)
               .map(num => num.toString(2).padStart(n, "0"))
               .join("");
}

// RC4 Encryption
export function encrypt(plain_text, key, n) {
    console.log("Plain text:", plain_text);
    console.log("Key:", key);
    console.log("n:", n);

    let S = [...Array(Math.pow(2, n)).keys()];
    let key_list = convertToDecimal(key, n);
    let pt = convertToDecimal(plain_text, n);

    KSA(S, key_list);
    let key_stream = PRGA(S, pt.length);
    let cipher_text = XOR(pt, key_stream, n);

    console.log("Cipher text:", cipher_text);
    return { cipher_text, key_stream };
}

// RC4 Decryption
export function decrypt(cipher_text, key, key_stream, n) {
    console.log("Cipher text:", cipher_text);

    let ct = convertToDecimal(cipher_text, n);
    let decrypted_text = XOR(ct, key_stream, n);

    console.log("Decrypted text:", decrypted_text);
    return decrypted_text;
}