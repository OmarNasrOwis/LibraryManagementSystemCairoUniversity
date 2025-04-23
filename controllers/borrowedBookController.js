import pool from "../config/db.js"; // make sure your db.js also uses ES module syntax


export async function getAllBorrowedBooks() {
  const result = await pool.query("SELECT * FROM borrowed_books");
  return result.rows;
}