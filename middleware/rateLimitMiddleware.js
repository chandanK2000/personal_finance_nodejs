const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 5, // Maximum 5 login requests

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many login attempts. Please try again after 5 minutes."
    }
});

module.exports = {
    loginLimiter
};