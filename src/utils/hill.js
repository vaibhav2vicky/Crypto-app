// Add these to your existing ciphertext.js file

// Helper function to convert letters to numbers (A=0, B=1, ..., Z=25)
function textToNumbers(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, '').split('').map(c => c.charCodeAt(0) - 65);
}

// Helper function to convert numbers to letters
function numbersToText(numbers) {
  return numbers.map(n => String.fromCharCode(n + 65)).join('');
}

// Helper function to create a square key matrix
function createKeyMatrix(key, size) {
  const numbers = textToNumbers(key);
  if (numbers.length !== size * size) {
    throw new Error(`Key must be exactly ${size * size} letters for ${size}x${size} matrix`);
  }

  const matrix = [];
  for (let i = 0; i < size; i++) {
    matrix.push(numbers.slice(i * size, (i + 1) * size));
  }
  return matrix;
}

// Helper function to calculate matrix determinant
function matrixDeterminant(matrix) {
  if (matrix.length === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }
  // For larger matrices (not implemented here)
  throw new Error('Only 2x2 matrices supported');
}

// Helper function to calculate modular inverse
function modInverse(a, m) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  throw new Error('No modular inverse exists');
}

// Helper function to create inverse key matrix
function createInverseKeyMatrix(keyMatrix) {
  const det = matrixDeterminant(keyMatrix);
  const detInv = modInverse(det, 26);

  const invMatrix = [
    [keyMatrix[1][1], -keyMatrix[0][1]],
    [-keyMatrix[1][0], keyMatrix[0][0]]
  ];

  return invMatrix.map(row =>
    row.map(val => ((val * detInv) % 26 + 26) % 26)
  );
}

// Hill Cipher Encryption (2x2 matrix)
export function hillEncrypt(text, key) {
  const keyMatrix = createKeyMatrix(key, 2);
  const textNums = textToNumbers(text);

  // Pad with 'X' if odd length
  if (textNums.length % 2 !== 0) textNums.push(23); // X=23

  const cipherNums = [];
  for (let i = 0; i < textNums.length; i += 2) {
    const a = (keyMatrix[0][0] * textNums[i] + keyMatrix[0][1] * textNums[i + 1]) % 26;
    const b = (keyMatrix[1][0] * textNums[i] + keyMatrix[1][1] * textNums[i + 1]) % 26;
    cipherNums.push(a, b);
  }

  return numbersToText(cipherNums);
}

// Hill Cipher Decryption (2x2 matrix)
export function hillDecrypt(text, key) {
  const keyMatrix = createKeyMatrix(key, 2);
  const invMatrix = createInverseKeyMatrix(keyMatrix);
  const textNums = textToNumbers(text);

  const plainNums = [];
  for (let i = 0; i < textNums.length; i += 2) {
    const a = (invMatrix[0][0] * textNums[i] + invMatrix[0][1] * textNums[i + 1]) % 26;
    const b = (invMatrix[1][0] * textNums[i] + invMatrix[1][1] * textNums[i + 1]) % 26;
    plainNums.push(a, b);
  }

  return numbersToText(plainNums);
}

// Generate random valid Hill cipher key (2x2 invertible matrix)
export function generateHillKey() {
  let keyMatrix;
  let det;

  do {
    const nums = [];
    for (let i = 0; i < 4; i++) {
      nums.push(Math.floor(Math.random() * 26));
    }
    keyMatrix = [
      [nums[0], nums[1]],
      [nums[2], nums[3]]
    ];
    det = matrixDeterminant(keyMatrix);
  } while (det === 0 || gcd(det, 26) !== 1);

  return numbersToText([...keyMatrix[0], ...keyMatrix[1]]);
}

// Helper function for GCD
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}