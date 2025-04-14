// DES implementation in pure JavaScript

// Initial Permutation Table
const IP = [
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6,
    64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17, 9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7
  ];
  
  // Final Permutation (IP^-1)
  const FP = [
    40, 8, 48, 16, 56, 24, 64, 32,
    39, 7, 47, 15, 55, 23, 63, 31,
    38, 6, 46, 14, 54, 22, 62, 30,
    37, 5, 45, 13, 53, 21, 61, 29,
    36, 4, 44, 12, 52, 20, 60, 28,
    35, 3, 43, 11, 51, 19, 59, 27,
    34, 2, 42, 10, 50, 18, 58, 26,
    33, 1, 41, 9, 49, 17, 57, 25
  ];
  
  // Permuted Choice 1 (PC-1)
  const PC1 = [
    57, 49, 41, 33, 25, 17, 9,
    1, 58, 50, 42, 34, 26, 18,
    10, 2, 59, 51, 43, 35, 27,
    19, 11, 3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15,
    7, 62, 54, 46, 38, 30, 22,
    14, 6, 61, 53, 45, 37, 29,
    21, 13, 5, 28, 20, 12, 4
  ];
  
  // Permuted Choice 2 (PC-2)
  const PC2 = [
    14, 17, 11, 24, 1, 5,
    3, 28, 15, 6, 21, 10,
    23, 19, 12, 4, 26, 8,
    16, 7, 27, 20, 13, 2,
    41, 52, 31, 37, 47, 55,
    30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53,
    46, 42, 50, 36, 29, 32
  ];
  
  // Schedule of Left Shifts
  const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
  
  // Expansion (E)
  const E = [
    32, 1, 2, 3, 4, 5,
    4, 5, 6, 7, 8, 9,
    8, 9, 10, 11, 12, 13,
    12, 13, 14, 15, 16, 17,
    16, 17, 18, 19, 20, 21,
    20, 21, 22, 23, 24, 25,
    24, 25, 26, 27, 28, 29,
    28, 29, 30, 31, 32, 1
  ];
  
  // S-boxes
  const S = [
    [
      [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
      [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
      [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
      [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
    ],
    [
      [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
      [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
      [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
      [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
    ],
    [
      [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
      [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
      [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
      [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
    ],
    [
      [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
      [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
      [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
      [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
    ],
    [
      [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
      [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
      [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
      [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
    ],
    [
      [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
      [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
      [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
      [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
    ],
    [
      [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
      [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
      [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
      [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
    ],
    [
      [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
      [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
      [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
      [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
    ]
  ];
  
  // Permutation (P)
  const P = [
    16, 7, 20, 21,
    29, 12, 28, 17,
    1, 15, 23, 26,
    5, 18, 31, 10,
    2, 8, 24, 14,
    32, 27, 3, 9,
    19, 13, 30, 6,
    22, 11, 4, 25
  ];
  
  // Utility functions
  function stringToHex(str) {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex;
  }
  
  function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }
  
  function stringToBinary(str) {
    let binary = '';
    for (let i = 0; i < str.length; i++) {
      binary += str.charCodeAt(i).toString(2).padStart(8, '0');
    }
    return binary;
  }
  
  function binaryToString(binary) {
    let str = '';
    for (let i = 0; i < binary.length; i += 8) {
      str += String.fromCharCode(parseInt(binary.substr(i, 8), 2));
    }
    return str;
  }
  
  function hexToBinary(hex) {
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
      binary += parseInt(hex[i], 16).toString(2).padStart(4, '0');
    }
    return binary;
  }
  
  function binaryToHex(binary) {
    let hex = '';
    for (let i = 0; i < binary.length; i += 4) {
      hex += parseInt(binary.substr(i, 4), 2).toString(16);
    }
    return hex;
  }
  
  function permute(input, table) {
    let output = '';
    for (let i = 0; i < table.length; i++) {
      output += input[table[i] - 1];
    }
    return output;
  }
  
  function leftShift(input, shift) {
    return input.substr(shift) + input.substr(0, shift);
  }
  
  function xor(a, b) {
    let result = '';
    for (let i = 0; i < a.length; i++) {
      result += a[i] === b[i] ? '0' : '1';
    }
    return result;
  }
  
  function sBoxSubstitution(input) {
    let output = '';
    for (let i = 0; i < 8; i++) {
      const row = parseInt(input[i * 6] + input[i * 6 + 5], 2);
      const col = parseInt(input.substr(i * 6 + 1, 4), 2);
      output += S[i][row][col].toString(2).padStart(4, '0');
    }
    return output;
  }
  
  function generateSubkeys(key) {
    // Convert key to binary
    let binaryKey = stringToBinary(key);
    if (binaryKey.length < 64) {
      binaryKey = binaryKey.padEnd(64, '0');
    } else if (binaryKey.length > 64) {
      binaryKey = binaryKey.substr(0, 64);
    }
  
    // Permuted Choice 1
    const pc1Key = permute(binaryKey, PC1);
  
    // Split into C and D
    let C = pc1Key.substr(0, 28);
    let D = pc1Key.substr(28, 28);
  
    const subkeys = [];
    for (let i = 0; i < 16; i++) {
      // Left shift
      C = leftShift(C, SHIFTS[i]);
      D = leftShift(D, SHIFTS[i]);
  
      // Combine and permute with PC2 to get subkey
      const combined = C + D;
      const subkey = permute(combined, PC2);
      subkeys.push(subkey);
    }
  
    return subkeys;
  }
  
  function desRound(input, subkey) {
    // Split input into L and R
    const L = input.substr(0, 32);
    const R = input.substr(32, 32);
  
    // Expansion permutation
    const expandedR = permute(R, E);
  
    // XOR with subkey
    const xored = xor(expandedR, subkey);
  
    // S-box substitution
    const substituted = sBoxSubstitution(xored);
  
    // Permutation
    const permuted = permute(substituted, P);
  
    // XOR with L
    const newR = xor(L, permuted);
  
    // Return R + newR
    return R + newR;
  }
  
  function desEncryptBlock(block, subkeys) {
    // Initial permutation
    let permuted = permute(block, IP);
  
    // 16 rounds
    for (let i = 0; i < 16; i++) {
      permuted = desRound(permuted, subkeys[i]);
    }
  
    // Swap left and right halves
    const swapped = permuted.substr(32, 32) + permuted.substr(0, 32);
  
    // Final permutation
    const ciphertext = permute(swapped, FP);
  
    return ciphertext;
  }
  
  function desDecryptBlock(block, subkeys) {
    // Initial permutation
    let permuted = permute(block, IP);
  
    // 16 rounds in reverse order
    for (let i = 15; i >= 0; i--) {
      permuted = desRound(permuted, subkeys[i]);
    }
  
    // Swap left and right halves
    const swapped = permuted.substr(32, 32) + permuted.substr(0, 32);
  
    // Final permutation
    const plaintext = permute(swapped, FP);
  
    return plaintext;
  }
  
  // Padding function for input that's not a multiple of 8 bytes
  function padInput(input) {
    const padLength = 8 - (input.length % 8);
    const padding = String.fromCharCode(padLength).repeat(padLength);
    return input + padding;
  }
  
  // Remove padding from decrypted output
  function unpadInput(input) {
    const padLength = input.charCodeAt(input.length - 1);
    return input.substr(0, input.length - padLength);
  }
  
  // Main DES encryption function
 export function encryptdes(plaintext, key) {
    // Generate subkeys
    const subkeys = generateSubkeys(key);
  
    // Pad the input if necessary
    const padded = padInput(plaintext);
  
    let ciphertext = '';
  
    // Process each 64-bit block
    for (let i = 0; i < padded.length; i += 8) {
      const block = padded.substr(i, 8);
      const binaryBlock = stringToBinary(block);
      const encryptedBlock = desEncryptBlock(binaryBlock, subkeys);
      ciphertext += binaryToHex(encryptedBlock);
    }
  
    return ciphertext;
  }
  
  // Main DES decryption function
 export function decryptdes(ciphertext, key) {
    // Generate subkeys
    const subkeys = generateSubkeys(key);
  
    let plaintext = '';
  
    // Process each 64-bit block
    for (let i = 0; i < ciphertext.length; i += 16) {
      const hexBlock = ciphertext.substr(i, 16);
      const binaryBlock = hexToBinary(hexBlock);
      const decryptedBlock = desDecryptBlock(binaryBlock, subkeys);
      plaintext += binaryToString(decryptedBlock);
    }
  
    // Remove padding
    return unpadInput(plaintext);
  }
  
  // Example usage:
  // const plaintext = "Hello DES!";
  // const key = "secretkey";
  // const encrypted = desEncrypt(plaintext, key);
  // console.log("Encrypted:", encrypted);
  // const decrypted = desDecrypt(encrypted, key);
  // console.log("Decrypted:", decrypted);