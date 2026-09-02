const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
function getUserFromToken(req) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return null;
    }

    try {

        return jwt.verify(token, process.env.JWT_SECRET);

    } catch {

        return null;

    }

}
/*
==========================================
HEALTH CHECK
==========================================
*/

app.get("/", (req, res) => {
    res.json({
        message: "SimplePay API is running."
    });
});

/*
==========================================
REGISTER
==========================================
*/

app.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields."
            });
        }

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users(name,email,password)
             VALUES($1,$2,$3)
             RETURNING id,name,email`,
            [name, email, hashedPassword]
        );

        // Create account
        await pool.query(
            "INSERT INTO accounts(user_id,balance) VALUES($1,1000)",
            [result.rows[0].id]
        );

        res.status(201).json({
            message: "Registration successful.",
            user: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server error."
        });

    }

});

/*
==========================================
LOGIN
==========================================
*/

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password."
            });
        }

        // Find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        // Compare password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful.",
            token
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server error."
        });

    }

});
/*
==========================================
GET BALANCE
==========================================
*/

app.get("/balance", async (req, res) => {

    const user = getUserFromToken(req);

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {

        const result = await pool.query(
            `
            SELECT
                users.name,
                accounts.balance
            FROM users
            JOIN accounts
                ON users.id = accounts.user_id
            WHERE users.id = $1
            `,
            [user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Account not found."
            });
        }

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server error."
        });

    }

});
/*
==========================================
TRANSFER MONEY
==========================================
*/

app.post("/transfer", async (req, res) => {

    const user = getUserFromToken(req);

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {

        const { receiverEmail, amount } = req.body;

        if (!receiverEmail || !amount) {
            return res.status(400).json({
                message: "Receiver email and amount are required."
            });
        }

        // Sender account
        const sender = await pool.query(
            "SELECT * FROM accounts WHERE user_id = $1",
            [user.id]
        );

        // Receiver user
        const receiverUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [receiverEmail]
        );

        if (receiverUser.rows.length === 0) {
            return res.status(404).json({
                message: "Receiver not found."
            });
        }

        const receiverId = receiverUser.rows[0].id;

        // Receiver account
        const receiver = await pool.query(
            "SELECT * FROM accounts WHERE user_id = $1",
            [receiverId]
        );

        if (Number(sender.rows[0].balance) < Number(amount)) {
            return res.status(400).json({
                message: "Insufficient balance."
            });
        }

        // Update balances
        await pool.query(
            "UPDATE accounts SET balance = balance - $1 WHERE user_id = $2",
            [amount, user.id]
        );

        await pool.query(
            "UPDATE accounts SET balance = balance + $1 WHERE user_id = $2",
            [amount, receiverId]
        );

        // Save transaction
        await pool.query(
            `INSERT INTO transactions(sender_id,receiver_id,amount)
             VALUES($1,$2,$3)`,
            [user.id, receiverId, amount]
        );

        res.json({
            message: "Transfer successful."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server error."
        });

    }

});
/*
==========================================
TRANSACTIONS
==========================================
*/

app.get("/transactions", async (req, res) => {

    const user = getUserFromToken(req);

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {

        const result = await pool.query(
            `
            SELECT
                u1.name AS sender,
                u2.name AS receiver,
                t.amount,
                t.created_at
            FROM transactions t
            JOIN users u1 ON t.sender_id = u1.id
            JOIN users u2 ON t.receiver_id = u2.id
            WHERE t.sender_id = $1
               OR t.receiver_id = $1
            ORDER BY t.created_at DESC
            `,
            [user.id]
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server error."
        });

    }

});
/*
==========================================
START SERVER
==========================================
*/

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
