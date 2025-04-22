// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js'; 
import dotenv from 'dotenv';

dotenv.config(); 

const router = express.Router();


async function createUser(username, password, role) {
  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role]
    );

    return result.rows[0]; // Return the newly created user
  } catch (err) {
    throw new Error('Error creating user: ' + err.message);
  }
}

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  // Check if all required fields are provided
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Please provide username, password, and role' });
  }

  try {
    // Create the new user
    const newUser = await createUser(username, password, role);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Error creating user' });
  }
});

export default router;