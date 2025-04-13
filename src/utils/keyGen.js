export function generateMonoalphabeticKey() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let shuffled = alphabet.split('');

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.join('');
}

//hill cipher functions
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

function numbersToText(numbers) {
  return numbers.map(n => String.fromCharCode(n + 65)).join('');
}
function matrixDeterminant(matrix) {
  if (matrix.length === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }
  // For larger matrices (not implemented here)
  throw new Error('Only 2x2 matrices supported');
}

// playfair matrix key Gen
export function generatePlayfairKey() {
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // No J
  let key = '';

  // Random length between 5 and 10 characters
  const length = Math.floor(Math.random() * 6) + 5;

  for (let i = 0; i < length; i++) {
    key += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return key;
}


// utils/keyGen.js
export function generateAESKey() {
  // Generate a random 256-bit (32-byte) key and return as hex string
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

