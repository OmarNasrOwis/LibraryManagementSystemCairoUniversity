// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();


export default router;

