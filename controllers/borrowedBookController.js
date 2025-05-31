import pool from "../config/db.js";

export const getAllBorrowedBooks = async () => {
  const result = await pool.query(`
    SELECT borrowed_books.*,books.*
    FROM borrowed_books
    JOIN books ON borrowed_books.isbn = books.isbn
  `);
  return result.rows;
};

export const createBorrowRequest = async (
  student_id,
  isbn,
  request_start_date
) => {
  const requestDate = new Date(request_start_date);
  const returnDate = new Date(requestDate);
  returnDate.setDate(returnDate.getDate() + 7); // Adds 7 days to the request date

  const result = await pool.query(
    `INSERT INTO borrowed_books (studentid, isbn, status, request_start_date, return_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [student_id, isbn, "2", requestDate, returnDate]
  );

  return result.rows[0];
};

export const getBorrowedBooksByStudent = async (student_id) => {
  return await pool.query(
    `
    SELECT borrowed_books.*, books.*
    FROM borrowed_books
    JOIN books ON borrowed_books.isbn = books.isbn
    WHERE borrowed_books.studentid = $1
  `,
    [student_id]
  );
};

export const processBorrowDecision = async (request_id, status) => {
  return await pool.query(
    "UPDATE borrowed_books SET status = $1 WHERE id = $2 RETURNING *",
    [status, request_id]
  );
};
export const getPendingBorrows = async () => {
  return await pool.query(`
    SELECT borrowed_books.*, books.*, users.fullname
    FROM borrowed_books
    JOIN users ON borrowed_books.studentid = users.studentid
    JOIN books ON borrowed_books.isbn = books.isbn
    WHERE borrowed_books.status = 2
  `);
};

export const getApprovedBorrows = async () => {
  return await pool.query(`
    SELECT borrowed_books.*, books.*, users.fullname
    FROM borrowed_books
    JOIN users ON borrowed_books.studentid = users.studentid
    JOIN books ON borrowed_books.isbn = books.isbn
    WHERE borrowed_books.status = 1
  `);
};

export const getRejectedBorrows = async () => {
  return await pool.query(`
    SELECT borrowed_books.*, books.*, users.fullname
    FROM borrowed_books
    JOIN users ON borrowed_books.studentid = users.studentid
    JOIN books ON borrowed_books.isbn = books.isbn
    WHERE borrowed_books.status = 0
  `);
};
