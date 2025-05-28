import pool from "../config/db.js";

// Get all borrowed books
export const getAllBorrowedBooks = async () => {
  const result = await pool.query("SELECT * FROM borrowed_books");
  return result.rows;
};

// Create a borrow request
export const createBorrowRequest = async (student_id, isbn) => {
  const bookResults = await pool.query("SELECT * FROM books WHERE isbn = $1", [isbn]);
  
  const result = await pool.query(
    "INSERT INTO borrowed_books (studentid, isbn, status) VALUES ($1, $2, $3) RETURNING *",
    [student_id, isbn, "0"]
  );
  return result.rows[0];
};

//get all requested books by student id

export const getBorrowedBooksByStudent = async (student_id) => {
  const result = await pool.query(
    "SELECT * FROM borrowed_books WHERE studentid = $1",
    [student_id]
  );
  return result;
};
// Process borrow decision
export const processBorrowDecision = async (request_id, status) => {
  const result = await pool.query(
    "UPDATE borrowed_books SET status = $1 WHERE id = $2 RETURNING *",
    [status, request_id]
  );
  return result;
};

//get pending books
export const getneedDecidedBorrows = async () => {
  const result = await pool.query(
    "SELECT * FROM borrowed_books WHERE status = $1",
    [2]
  );
  return result;
};
