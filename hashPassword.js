
const bcrypt = require("bcryptjs");

const password = "chandan";

const generateHash = async () => {
    const hash = await bcrypt.hash(password, 10);

    console.log("Original password:", password);
    console.log("Hashed password:", hash);
};

generateHash();