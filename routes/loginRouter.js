// routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/db.js");
require("dotenv").config();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //to be used to hash a new password
  //console.log(await bcrypt.hash('test123456', 10))

  try {
    // Fetch user from DB
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Identify role
    const role = user.role || "student";

    // Generate token
    const token = jwt.sign(
      { username: user.username, role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token, role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
