const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Replace with your MySQL username
    password: "vr@20212", // Replace with your MySQL password
    database: "campus_social"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1); // Stop server if DB fails
    }
    console.log("✅ MySQL connected...");
});

// Signup Route
app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], (err) => {
        if (err) {
            return res.status(400).json({ message: "User already exists" });
        }
        res.json({ message: "Signup successful" });
    });
});

// Login Route
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, results[0].password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login successful", user: results[0] });
    });
});

// API to update content (Admins & Year-Based Admins)
app.post("/api/update-content", (req, res) => {
    const { email, section, content } = req.body;

    // Check if the user is an admin or a year-based admin
    if (!email.includes("admin@") && !email.match(/(1st|2nd|3rd|4th)@/)) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    db.query(
        "INSERT INTO content (section, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = ?",
        [section, content, content],
        (err) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Content updated successfully" });
        }
    );
});

// API to fetch all content
app.get("/api/get-content", (req, res) => {
    db.query("SELECT section, content FROM content", (err, results) => {
        if (err) {
            console.error("Error fetching content:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});

// Start Server
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
