/*
// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

async function createUser(username, password, role, email) {
  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const result = await pool.query(
      "INSERT INTO users (username, password, role, email) VALUES ($1, $2, $3,$4) RETURNING id, username, role, email",
      [username, hashedPassword, role,email]
    );

    return result.rows[0]; // Return the newly created user
  } catch (err) {
    console.log(err);
    throw new Error("Error creating user: " + err.message);
  }
}

// Register a new user
router.post("/register", async (req, res) => {
  const { username, password, role, email } = req.body;

  // Check if all required fields are provided
  const missingFields = [];
  if (!username) missingFields.push("username");
  if (!password) missingFields.push("password");
  if (!role) missingFields.push("role");
  if (!email) missingFields.push("email");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required field(s): ${missingFields.join(", ")}`,
    });
  }

  try {
    // Create the new user
    const newUser = await createUser(username, password, role,email);
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        email:newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//delete User

router.delete("/delete/:username", async (req, res) => {
  const usernameToDelete = req.params.username; // Extract username from headers

  // If username is not provided in the header
  if (!usernameToDelete) {
    return res.status(400).json({ error: "Username header is required" });
  }

  try {
    // Perform the delete operation in PostgreSQL
    const deleteQuery = "DELETE FROM users WHERE username = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [usernameToDelete]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // If deletion is successful
    return res
      .status(200)
      .json({ message: `User ${usernameToDelete} deleted successfully` });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

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

//get all students

router.get("/students", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE role = 'student'"
    );
    const allStudents = result.rows;
    res.status(200).json(allStudents);
  } catch (error) {
    console.error("Error retrieving students:", err);
    res.status(500).json({ error: "Failed to retrieve students" });
  }
});

// GET student by either username or email
router.get("/students/:identifier", async (req, res) => {
  const identifier = req.params.identifier;

  try {
    // Query to fetch user by username or email
    const query = `SELECT * FROM users WHERE username = $1 OR email = $1`; // Assuming email field exists in the users table
    const result = await pool.query(query, [identifier]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user details as response
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
*/


import express from "express";
import {
  createUser,
  deleteUser,
  loginUser,
  getAllStudents,
  getStudentByIdentifier,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, role, email } = req.body;
  const missingFields = [];
  if (!username) missingFields.push("username");
  if (!password) missingFields.push("password");
  if (!role) missingFields.push("role");
  if (!email) missingFields.push("email");

  if (missingFields.length > 0) {
    return res
      .status(400)
      .json({ message: `Missing required field(s): ${missingFields.join(", ")}` });
  }

  try {
    const newUser = await createUser(username, password, role, email);
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/delete/:username", async (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const result = await deleteUser(username);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: `User ${username} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const { token, role } = await loginUser(username, password);
    res.json({ message: "Login successful", token, role });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

router.get("/students", async (req, res) => {
  try {
    const students = await getAllStudents();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve students" });
  }
});

router.get("/students/:identifier", async (req, res) => {
  const identifier = req.params.identifier;
  try {
    const result = await getStudentByIdentifier(identifier);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
