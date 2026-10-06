const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const jwt = require("jsonwebtoken");


const register = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            address,
            city,
            state,
            country,
            openingBalance
        } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // 2. Check whether email already exists
        const [existingUser] = await pool.execute(
            "SELECT UserId FROM Users WHERE Email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // 3. Check whether any user already exists
        const [userCount] = await pool.execute(
            "SELECT COUNT(*) AS TotalUsers FROM Users"
        );

        const totalUsers = userCount[0].TotalUsers;

        // 4. Decide RoleId and Status
        let roleId;
        let status;
        let message;

        if (totalUsers === 0) {

            // First user will be ADMIN
            roleId = 1;
            status = "ACTIVE";
            message = "Admin registered successfully";

        } else {

            // From second user onwards:
            // USER + PENDING
            roleId = 2;
            status = "PENDING";
            message = "User registered successfully. Waiting for admin approval";
        }

        // 5. Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // 6. Insert user
        const [result] = await pool.execute(
            `INSERT INTO Users
            (
                Name,
                Email,
                Phone,
                PasswordHash,
                RoleId,
                Address,
                City,
                State,
                Country,
                OpeningBalance,
                Status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                email,
                phone || null,
                passwordHash,
                roleId,
                address || null,
                city || null,
                state || null,
                country || null,
                openingBalance || 0,
                status
            ]
        );

        return res.status(201).json({
            success: true,
            message,
            userId: result.insertId,
            roleId,
            status
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// login api


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const [users] = await pool.execute(
            `SELECT
                u.UserId,
                u.Name,
                u.Email,
                u.PasswordHash,
                u.RoleId,
                r.RoleName,
                u.Status
             FROM Users u
             INNER JOIN Roles r
                ON u.RoleId = r.RoleId
             WHERE u.Email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Check account status
        if (user.Status === "PENDING") {
            return res.status(403).json({
                success: false,
                message: "Your account is pending admin approval"
            });
        }

        if (user.Status === "REJECTED") {
            return res.status(403).json({
                success: false,
                message: "Your registration has been rejected"
            });
        }

        if (user.Status === "INACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }

        if (user.Status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Your account is not active"
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.PasswordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user.UserId,
                roleId: user.RoleId,
                roleName: user.RoleName
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                userId: user.UserId,
                name: user.Name,
                email: user.Email,
                roleId: user.RoleId,
                roleName: user.RoleName
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    register,
    login
};

