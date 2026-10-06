const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());




app.use(helmet());

app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Helmet test"
    });
});


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Personal Finance API is running"
    });
});

app.use("/api/auth", authRoutes);

module.exports = app;