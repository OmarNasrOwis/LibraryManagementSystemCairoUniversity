import pool from "../config/db.js";

export const getAllBorrowedBooks = async () => {
  const result = await pool.query("SELECT * FROM borrowed_books");
  return result.rows;
};

export const createBorrowRequest = async (student_id, isbn) => {
  const result = await pool.query(
    "INSERT INTO borrowed_books (studentid, isbn, status) VALUES ($1, $2, $3) RETURNING *",
    [student_id, isbn, "0"]
  );
  return result.rows[0];
};

export const getBorrowedBooksByStudent = async (student_id) => {
  return await pool.query("SELECT * FROM borrowed_books WHERE studentid = $1", [student_id]);
};

export const processBorrowDecision = async (request_id, status) => {
  return await pool.query("UPDATE borrowed_books SET status = $1 WHERE id = $2 RETURNING *", [status, request_id]);
};

export const getPendingBorrows = async () => {
  return await pool.query("SELECT * FROM borrowed_books WHERE status = 2");
};

export const getApprovedBorrows = async () => {
  return await pool.query("SELECT * FROM borrowed_books WHERE status = 1");
};

export const getRejectedBorrows = async () => {
  return await pool.query("SELECT * FROM borrowed_books WHERE status = 0");
};
