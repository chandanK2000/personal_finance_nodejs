const crypto = require("crypto");

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

console.log("Encryption key:", key);

function encrypt(text) {

    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        key,
        iv
    );

    let encrypted = cipher.update(text, "utf8", "hex");

    encrypted += cipher.final("hex");

    return encrypted;
}

function decrypt(encryptedText) {

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        key,
        iv
    );

    let decrypted = decipher.update(
        encryptedText,
        "hex",
        "utf8"
    );

    decrypted += decipher.final("utf8");

    return decrypted;
}


// Original data
const data = "Chandan";


// Encryption
const encryptedData = encrypt(data);

console.log("Original:", data);
console.log("Encrypted:", encryptedData);


// Decryption
const decryptedData = decrypt(encryptedData);

console.log("Decrypted:", decryptedData);