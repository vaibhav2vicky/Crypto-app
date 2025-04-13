// Playfair Cipher Implementation

// Helper function to prepare the key
function preparePlayfairKey(key) {
  // Remove non-alphabetic characters and convert to uppercase
  let cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');

  // Replace J with I (standard Playfair practice)
  cleanKey = cleanKey.replace(/J/g, 'I');

  // Remove duplicate letters
  const uniqueLetters = [];
  for (const char of cleanKey) {
    if (!uniqueLetters.includes(char)) {
      uniqueLetters.push(char);
    }
  }

  // Add remaining alphabet letters (excluding J)
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  for (const char of alphabet) {
    if (!uniqueLetters.includes(char)) {
      uniqueLetters.push(char);
    }
  }

  // Create 5x5 matrix
  const matrix = [];
  for (let i = 0; i < 5; i++) {
    matrix.push(uniqueLetters.slice(i * 5, (i + 1) * 5));
  }

  return matrix;
}

// Helper function to prepare plaintext
function preparePlayfairText(text) {
  // Convert to uppercase and remove non-alphabetic characters
  let cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');

  // Replace J with I
  cleanText = cleanText.replace(/J/g, 'I');

  // Split into digraphs and handle double letters
  const digraphs = [];
  for (let i = 0; i < cleanText.length; i += 2) {
    let first = cleanText[i];
    let second = cleanText[i + 1] || 'X'; // Add X if odd length

    // If double letter, insert X between them
    if (first === second) {
      second = 'X';
      i--; // Back up one position to process the second letter again
    }

    digraphs.push(first + second);
  }

  return digraphs;
}

// Find position of a character in the Playfair matrix
function findPosition(matrix, char) {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (matrix[row][col] === char) {
        return { row, col };
      }
    }
  }
  throw new Error(`Character ${char} not found in matrix`);
}

// Playfair Cipher Encryption
export function playfairEncrypt(text, key) {
  const matrix = preparePlayfairKey(key);
  const digraphs = preparePlayfairText(text);
  let ciphertext = '';

  for (const digraph of digraphs) {
    const [a, b] = digraph.split('');
    const posA = findPosition(matrix, a);
    const posB = findPosition(matrix, b);

    // Same row
    if (posA.row === posB.row) {
      ciphertext += matrix[posA.row][(posA.col + 1) % 5];
      ciphertext += matrix[posB.row][(posB.col + 1) % 5];
    }
    // Same column
    else if (posA.col === posB.col) {
      ciphertext += matrix[(posA.row + 1) % 5][posA.col];
      ciphertext += matrix[(posB.row + 1) % 5][posB.col];
    }
    // Rectangle rule
    else {
      ciphertext += matrix[posA.row][posB.col];
      ciphertext += matrix[posB.row][posA.col];
    }
  }

  return ciphertext;
}

// Playfair Cipher Decryption
export function playfairDecrypt(text, key) {
  const matrix = preparePlayfairKey(key);
  const digraphs = [];

  // Split ciphertext into digraphs
  for (let i = 0; i < text.length; i += 2) {
    digraphs.push(text.substr(i, 2));
  }

  let plaintext = '';

  for (const digraph of digraphs) {
    const [a, b] = digraph.split('');
    const posA = findPosition(matrix, a);
    const posB = findPosition(matrix, b);

    // Same row
    if (posA.row === posB.row) {
      plaintext += matrix[posA.row][(posA.col - 1 + 5) % 5];
      plaintext += matrix[posB.row][(posB.col - 1 + 5) % 5];
    }
    // Same column
    else if (posA.col === posB.col) {
      plaintext += matrix[(posA.row - 1 + 5) % 5][posA.col];
      plaintext += matrix[(posB.row - 1 + 5) % 5][posB.col];
    }
    // Rectangle rule
    else {
      plaintext += matrix[posA.row][posB.col];
      plaintext += matrix[posB.row][posA.col];
    }
  }

  // Remove any padding X characters that don't make sense
  return plaintext.replace(/X$/, ''); // Remove trailing X
}


