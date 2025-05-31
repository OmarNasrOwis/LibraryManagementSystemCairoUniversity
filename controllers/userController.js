import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js"; // make sure your db.js also uses ES module syntax

export async function createUser(
  username,
  password,
  role,
  email,
  fullname,
  studentid
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (username, password, role, email, fullname, studentid)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, username, role, email, fullname, studentid`,
    [username, hashedPassword, role, email, fullname, studentid]
  );
  return result.rows[0];
}

export async function deleteUser(username) {
  const result = await pool.query(
    "DELETE FROM users WHERE username = $1 RETURNING *",
    [username]
  );
  return result;
}
export async function loginUser(identifier, password) {
  let result;

  // Check if identifier is numeric (assumed to be studentid)
  if (!isNaN(identifier)) {
    result = await pool.query("SELECT * FROM users WHERE studentid = $1", [
      identifier,
    ]);
  } else {
    result = await pool.query("SELECT * FROM users WHERE username = $1", [
      identifier,
    ]);
  }

  if (result.rows.length === 0) {
    throw new Error("Invalid username or password");
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid username or password");
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    studentid: user.studentid || null,
    token,
    role: user.role,
  };
}

export async function getAllStudents() {
  const result = await pool.query(
    "SELECT username,fullname,role,email ,studentid FROM users WHERE role = 'student'"
  );
  return result.rows;
}

export async function getStudentByIdentifier(identifier) {
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1 OR email = $1",
    [identifier]
  );
  return result;
}
