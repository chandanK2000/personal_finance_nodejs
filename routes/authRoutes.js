const express = require("express");
const { register, login } = require("../controllers/authController");
const {authenticateToken} = require("../middleware/authMiddleware");

const {authorizeRoles} = require("../middleware/roleMiddleware");


const router = express.Router();

router.post("/register", register);
router.post("/login", login);


router.get(
    "/profile",
    authenticateToken,
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Protected profile API",
            user: req.user
        });
    }
);

router.get(
    "/admin-test",
    authenticateToken,
    authorizeRoles("ADMIN"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Admin",
            user: req.user
        });
    }
);



module.exports = router;