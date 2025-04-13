// Helper function to prepare the text
function prepareText(text) {
    return text.toUpperCase().replace(/[^A-Z]/g, '');
}

// Encrypt function
export function encrypt(text, key) {
    text = prepareText(text);
    let rail = new Array(key).fill().map(() => new Array(text.length).fill('\n'));
    
    let dir_down = false;
    let row = 0, col = 0;
    
    for (let i = 0; i < text.length; i++) {
        if (row === 0 || row === key - 1) dir_down = !dir_down;
        rail[row][col++] = text[i];
        dir_down ? row++ : row--;
    }
    
    let result = '';
    for (let i = 0; i < key; i++) {
        for (let j = 0; j < text.length; j++) {
            if (rail[i][j] !== '\n') result += rail[i][j];
        }
    }
    
    return result;
}

// Decrypt function
export function decrypt(text, key) {
    let rail = new Array(key).fill().map(() => new Array(text.length).fill('\n'));
    
    let dir_down = false;
    let row = 0, col = 0;
    
    for (let i = 0; i < text.length; i++) {
        if (row === 0) dir_down = true;
        if (row === key - 1) dir_down = false;
        rail[row][col++] = '*';
        dir_down ? row++ : row--;
    }
    
    let index = 0;
    for (let i = 0; i < key; i++) {
        for (let j = 0; j < text.length; j++) {
            if (rail[i][j] === '*' && index < text.length) {
                rail[i][j] = text[index++];
            }
        }
    }
    
    let result = '';
    row = 0, col = 0;
    for (let i = 0; i < text.length; i++) {
        if (row === 0) dir_down = true;
        if (row === key - 1) dir_down = false;
        if (rail[row][col] !== '*') result += rail[row][col++];
        dir_down ? row++ : row--;
    }
    
    return result;
}