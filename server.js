const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "vr@20212",
    database: "campus_social"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
    console.log("✅ MySQL connected...");
});

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "main.html"));
});

// Signup Route with error rate tracking
app.post("/api/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query("INSERT INTO users (email, password) VALUES (?, ?)", 
            [email, hashedPassword], 
            (err) => {
                if (err) {
                    console.error("Signup error:", err);
                    return res.status(400).json({ message: "User already exists" });
                }
                res.json({ message: "Signup successful" });
            });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Login Route with performance tracking
app.post("/api/login", (req, res) => {
    const startTime = Date.now();
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        const queryTime = Date.now() - startTime;
        console.log(`Login query time: ${queryTime}ms`);
        
        if (err || results.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, results[0].password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ 
            message: "Login successful", 
            user: results[0] 
        });
    });
});

// Content API with role validation
app.post("/api/update-content", (req, res) => {
    const { email, section, content } = req.body;

    if (!email.includes("admin@") && !email.match(/(1st|2nd|3rd|4th)@/)) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    const queryStart = Date.now();
    db.query(
        "INSERT INTO content (section, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = ?",
        [section, content, content],
        (err) => {
            console.log(`Update query time: ${Date.now() - queryStart}ms`);
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Content updated successfully" });
        }
    );
});

// New API endpoint for performance testing
app.get("/api/perf-metrics", (req, res) => {
    db.query("SELECT COUNT(*) as userCount FROM users", (err, results) => {
        if (err) {
            console.error("Perf metrics error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({
            metrics: {
                userCount: results[0].userCount,
                uptime: process.uptime()
            }
        });
    });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Open your browser at: http://localhost:${PORT}`);
});