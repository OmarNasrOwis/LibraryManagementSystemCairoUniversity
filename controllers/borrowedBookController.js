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
  try {
    const checkAvailabilityResult = await pool.query(`
      SELECT availability, isbn
      FROM books
      WHERE isbn = (
        SELECT isbn
        FROM borrowed_books
        WHERE id = $1
      )
    `, [request_id]);

    if (checkAvailabilityResult.rows.length === 0) {
      throw new Error("Book not found for the provided request ID.");
    }

    const bookAvailability = checkAvailabilityResult.rows[0].availability;

    if (bookAvailability === false || bookAvailability === "false" || bookAvailability === null) {
      throw new Error("Book is not available for borrowing.");
    }

    const result = await pool.query(`
      WITH updated_borrowed AS (
        UPDATE borrowed_books
        SET status = $1
        WHERE id = $2
        RETURNING borrowed_books.isbn
      )
      UPDATE books
      SET quantity = CASE
        WHEN books.quantity > 0 THEN books.quantity - 1
        ELSE books.quantity
      END,
      availability = CASE
        WHEN books.quantity - 1 = 0 THEN false  -- Make availability false if quantity becomes 0
        ELSE books.availability
      END
      FROM updated_borrowed
      WHERE books.isbn = updated_borrowed.isbn
      RETURNING books.isbn, books.quantity, books.availability
    `, [status, request_id]);

    if (result.rows.length === 0) {
      throw new Error("Failed to update borrow decision. Book may no longer be available.");
    }

    return result;
  } catch (err) {
    throw err; // Rethrow the error to be caught by the route handler
  }
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
