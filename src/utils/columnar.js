// Helper function to prepare text
function prepareText(text) {
    return text.toUpperCase().replace(/[^A-Z]/g, '');
}

// Helper function to prepare key
function prepareKey(key) {
    return key.toUpperCase();
}

// Columnar Transposition Cipher Encryption
export function encryptColumnar(text, key) {
    text = prepareText(text);
    key = prepareKey(key);
    let cipher = "";
    let k_indx = 0;
    const msg_len = text.length;
    const msg_lst = Array.from(text);
    const key_lst = Array.from(key).sort();
    const col = key.length;
    const row = Math.ceil(msg_len / col);
    const fill_null = (row * col) - msg_len;
    for (let i = 0; i < fill_null; i++) {
        msg_lst.push('_');
    }
    
    const matrix = [];
    for (let i = 0; i < msg_lst.length; i += col) {
        matrix.push(msg_lst.slice(i, i + col));
    }
    
    for (let _ = 0; _ < col; _++) {
        const curr_idx = key.indexOf(key_lst[k_indx]);
        for (const row of matrix) {
            cipher += row[curr_idx];
        }
        k_indx++;
    }
    
    return cipher;
}

// Columnar Transposition Cipher Decryption
export function decryptColumnar(text, key) {
    key = prepareKey(key);
    let msg = "";
    let k_indx = 0;
    let msg_indx = 0;
    const msg_len = text.length;
    const msg_lst = Array.from(text);
    const col = key.length;
    const row = Math.ceil(msg_len / col);
    const key_lst = Array.from(key).sort();
    const dec_cipher = [];
    for (let i = 0; i < row; i++) {
        dec_cipher.push(Array(col).fill(null));
    }
    
    for (let _ = 0; _ < col; _++) {
        const curr_idx = key.indexOf(key_lst[k_indx]);
        for (let j = 0; j < row; j++) {
            dec_cipher[j][curr_idx] = msg_lst[msg_indx];
            msg_indx++;
        }
        k_indx++;
    }
    
    try {
        msg = dec_cipher.flat().join('');
    } catch (err) {
        throw new Error("This program cannot handle repeating words.");
    }
    
    const null_count = (msg.match(/_/g) || []).length;

    if (null_count > 0) {
        return msg.slice(0, -null_count);
    }

    return msg;
}