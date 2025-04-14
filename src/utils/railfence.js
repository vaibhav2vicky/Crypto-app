function prepareText(text) {
    if (typeof text !== 'string') {
        throw new TypeError('Input must be a string');
    }
    return text.toUpperCase().replace(/[^A-Z]/g, '');
}


function createRailGrid(rows, cols) {
    return Array.from({ length: rows }, () => new Array(cols).fill(null));
}


export function encryptRailFence(text, key) {
    // Ensure the text is properly prepared
    const preparedText = text.toUpperCase().replace(/[^A-Z]/g, '');
    
    // If no valid characters remain after preparation
    if (!preparedText) return ''; 
    
    // Rest of your implementation...
    let rail = new Array(key).fill().map(() => new Array(preparedText.length).fill('\n'));
    
    let dir_down = false;
    let row = 0, col = 0;

    for (let i = 0; i < preparedText.length; i++) {
        if (row === 0 || row === key - 1) dir_down = !dir_down;
        rail[row][col++] = preparedText[i];
        dir_down ? row++ : row--;
    }

    let result = '';
    for (let i = 0; i < key; i++) {
        for (let j = 0; j < preparedText.length; j++) {
            if (rail[i][j] !== '\n') result += rail[i][j];
        }
    }

    return result;
}


export function decryptRailFence(text, key) {
    if (key <= 1) {
        throw new Error('Key must be greater than 1 for Rail Fence cipher');
    }

    const preparedText = prepareText(text);
    if (!preparedText) return '';
    
    const rail = createRailGrid(key, preparedText.length);
    const pattern = calculatePattern(key, preparedText.length);
    
    // Reconstruct the rail with characters in their positions
    let textIndex = 0;
    for (let row = 0; row < key; row++) {
        for (let col = 0; col < preparedText.length; col++) {
            if (pattern[col].row === row) {
                rail[row][col] = preparedText[textIndex++];
            }
        }
    }
    
    return pattern.map(pos => rail[pos.row][pos.col]).join('');
}


function calculatePattern(key, length) {
    const pattern = [];
    let row = 0;
    let direction = 1; // 1 for down, -1 for up
    
    for (let col = 0; col < length; col++) {
        pattern.push({ row, col });
        
        // Change direction at the top or bottom rail
        if (row === 0) {
            direction = 1;
        } else if (row === key - 1) {
            direction = -1;
        }
        
        row += direction;
    }
    
    return pattern;
}