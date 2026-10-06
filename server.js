require("dotenv").config();

const app = require("./app");
const { testDatabaseConnection } = require("./config/db");

const PORT = process.env.PORT || 8003;

const startServer = async () => {
    await testDatabaseConnection();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();