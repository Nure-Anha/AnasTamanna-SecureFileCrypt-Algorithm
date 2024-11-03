const transpositionCipher = {
    encrypt: function (text, key) {
        const rows = key;
        const cols = Math.ceil(text.length / rows);

        let matrix = [];

        for (let i = 0; i < rows; i++) {
            matrix[i] = new Array(cols).fill(' ');
        }

        let index = 0;

        for (let j = 0; j < cols; j++) {
            for (let i = 0; i < rows; i++) {
                if (index < text.length) {
                    matrix[i][j] = text[index];
                    index++;
                }
            }
        }

        let encryptedText = '';
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                encryptedText += matrix[i][j];
            }
        }

        encryptedText = encryptedText.slice(0, text.length);

        return encryptedText;
    },


    decrypt: function (encryptedText, key) {
        const rows = key;
        const cols = Math.ceil(encryptedText.length / rows);

        let matrix = [];

        for (let i = 0; i < rows; i++) {
            matrix[i] = new Array(cols).fill(' ');
        }

        let index = 0;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (index < encryptedText.length) {
                    matrix[i][j] = encryptedText[index];
                    index++;
                }
            }
        }

        let decryptedText = '';
        for (let j = 0; j < cols; j++) {
            for (let i = 0; i < rows; i++) {
                decryptedText += matrix[i][j];
            }
        }

        return decryptedText;
    },
};

const substitutionCipher = {
    alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',

    substitutionMap: 'xmbpcqsetnvwzorgadihfjlkuyXMBPCQSETNVWZORGADIHFJLKUY9876543210',

    encrypt: function (text, key) {
        let encryptedText = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const index = this.alphabet.indexOf(char);
            if (index !== -1) {
                const substitutionMap2 = this.shuffleString(this.substitutionMap, key);
                const encryptedChar = substitutionMap2[index];
                encryptedText += encryptedChar;
            } else {
                encryptedText += char;
            }
        }
        return encryptedText;
    },

    decrypt: function (encryptedText, key) {
        let decryptedText = '';
        for (let i = 0; i < encryptedText.length; i++) {
            const char = encryptedText[i];
            const substitutionMap2 = this.shuffleString(this.substitutionMap, key);
            const index = substitutionMap2.indexOf(char);
            if (index !== -1) {
                const decryptedChar = this.alphabet[index];
                decryptedText += decryptedChar;
            } else {
                decryptedText += char;
            }
        }
        return decryptedText;
    },

    shuffleString: function (text, key = 1024) {
        const array = text.split('');
        let seed = key;
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    },

    shuffle: function (inputString) {
        var charArray = inputString.split("");
        for (var i = charArray.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = charArray[i];
            charArray[i] = charArray[j];
            charArray[j] = temp;
        }
        var shuffledString = charArray.join("");
        return shuffledString;
    }
};

const encryptPasswordIterations = 128;
const decryptPasswordIterations = 128;

async function encryptfile() {
    const inputFile = document.getElementById('encfileElem').files[0];
    const password = document.getElementById('txtEncpassphrase').value;

    if (inputFile && password) {
        try {
            const fileContent = await readFileAsync(inputFile);
            const encryptedContent = AnasTamannaEncryption(fileContent, password, encryptPasswordIterations);

            document.getElementById('aEncsavefile').setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(encryptedContent));
            document.getElementById('aEncsavefile').setAttribute('download', 'encrypted_file.txt');
            document.getElementById('aEncsavefile').classList.remove('hidden');
        } catch (error) {
            console.error('Encryption error:', error);
            alert('Error during encryption. Please try again.');
        }
    } else {
        alert('Please provide a file and password.');
    }
}

async function decryptfile() {
    const inputFile = document.getElementById('decfileElem').files[0];
    const password = document.getElementById('txtDecpassphrase').value;

    if (inputFile && password) {
        try {
            const fileContent = await readFileAsync(inputFile);
            const decryptedContent = AnasTamannaDecryption(fileContent, password, decryptPasswordIterations);

            console.log('Decrypted Content:', decryptedContent);

            document.getElementById('aDecsavefile').setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(decryptedContent));
            document.getElementById('aDecsavefile').setAttribute('download', 'decrypted_file.txt');
            document.getElementById('aDecsavefile').classList.remove('hidden');
        } catch (error) {
            console.error('Decryption error:', error);
            alert('Error during decryption. Please try again.');
        }
    } else {
        alert('Please provide a file and password.');
    }
}

function AnasTamannaEncryption(content, password, iterations) {
    let encryptedContent = content;
    for (let i = 0; i < iterations; i++) {

        const xorKey = createXORKey(password);
        encryptedContent = xorWithKey(encryptedContent, xorKey);
        encryptedContent = substitutionCipher.encrypt(encryptedContent, password);
        encryptedContent = transpositionCipher.encrypt(encryptedContent, password);
    }
    return encryptedContent;
}

function xorWithKey(input, key) {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        output += String.fromCharCode(charCode);
    }
    return output;
}

function createXORKey(password) {
    const xorKeyLength = Math.max(password.length, 1);
    let xorKey = '';
    for (let i = 0; i < xorKeyLength; i++) {
        xorKey += String.fromCharCode(password.charCodeAt(i % password.length));
    }
    return xorKey;
}


function AnasTamannaDecryption(content, password, iterations) {
    let decryptedContent = content;
    for (let i = 0; i < iterations; i++) {

        decryptedContent = transpositionCipher.decrypt(decryptedContent, password);
        decryptedContent = substitutionCipher.decrypt(decryptedContent, password);
        const xorKey = createXORKey(password);
        decryptedContent = xorWithKey(decryptedContent, xorKey);
    }
    return decryptedContent;
}

function xorWithKey(input, key) {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        output += String.fromCharCode(charCode);
    }
    return output;
}

function createXORKey(password) {
    const xorKeyLength = Math.max(password.length, 1);
    let xorKey = '';
    for (let i = 0; i < xorKeyLength; i++) {
        xorKey += String.fromCharCode(password.charCodeAt(i % password.length));
    }
    return xorKey;
}


function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            resolve(event.target.result);
        };

        reader.onerror = function (event) {
            reject(event.error);
        };

        reader.readAsText(file);
    });
}

function drop_handler(event) {
    event.preventDefault();

    const dropzoneId = event.target.id;
    const fileElemId = dropzoneId === 'encdropzone' ? 'encfileElem' : 'decfileElem';

    document.getElementById(dropzoneId).classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        selectfile(files);
    }
}

function dragover_handler(event) {
    event.preventDefault();
    const dropzoneId = event.target.id;
    document.getElementById(dropzoneId).classList.add('dragover');
}

function dragend_handler(event) {
    event.preventDefault();
    const dropzoneId = event.target.id;
    document.getElementById(dropzoneId).classList.remove('dragover');
}

function selectfile(files) {
    const fileElem = document.getElementById('encfileElem');
    const filenameSpan = document.getElementById('spnencfilename');

    if (files.length > 0) {
        const filename = files[0].name;
        fileElem.files = files;
        filenameSpan.textContent = 'Selected file: ' + filename;
    }
}