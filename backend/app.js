const express = require('express');
const mysql = require("mysql2/promise");
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the PUBLIC folder one level above backend
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/student", express.static(path.join(__dirname, "..", "student")));

let db; // will hold the connection

// Initialize DB and start server
async function initDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });
    console.log("✅ Connected to MySQL Database");

    // Start Server after DB connection
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ MySQL Connection Error:", err);
    process.exit(1);
  }
}

initDB(); // call it to connect

// HOME ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Signup route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT * FROM account WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO account (email, password_hash) VALUES (?, ?)",
      [email, hash || "user"]
    );

    res.json({ message: "Signup successful!" });

  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM account WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const account = rows[0];

    // Check password
    const match = await bcrypt.compare(password, account.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Redirect based on email
    if (email === "admin@thinkable.com") {
      return res.json({ redirect: "/admin/home.html" });
    } else {
      return res.json({ redirect: "/student/home.html" });
    }

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});


