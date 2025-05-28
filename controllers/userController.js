import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js"; // make sure your db.js also uses ES module syntax

export async function createUser(username, password, role, email) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (username, password, role, email) VALUES ($1, $2, $3, $4) RETURNING id, username, role, email",
    [username, hashedPassword, role, email]
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

export async function loginUser(username, password) {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  if (result.rows.length === 0) {
    throw new Error("Invalid username or password");
  }

  var studentid;
  const user = result.rows[0];
  console.log(user.studentid)
  if(user.studentid){
    var studentid= user.studentid
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid username or password");
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { studentid, role: user.role };
}

export async function getAllStudents() {
  const result = await pool.query("SELECT username,fullname,role,email ,studentid FROM users WHERE role = 'student'");
  return result.rows;
}

export async function getStudentByIdentifier(identifier) {
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1 OR email = $1",
    [identifier]
  );
  return result;
}
