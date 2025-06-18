import pool from "../config/db.js";

const handleError = (res, err, message = "Server Error") => {
  console.error(err);
  res.status(500).json({ error: message, details: err.message });
};

const createBook = async (req, res) => {
  const { title, author, publisher, barcode, isbn, availability, published_date, quantity, image } = req.body; 

  try {
    const query = `
      INSERT INTO books (title, author, publisher, barcode, isbn, availability, published_date, quantity, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [title, author, publisher, barcode, isbn, availability, published_date, quantity, image];

    await pool.query(query, values);

    res.status(201).send("Book created successfully");
  } catch (err) {
    handleError(res, err, "Error creating book");
  }
};

const getAllBooks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10; 
  const offset = (page - 1) * pageSize;

  try {
    const countResult = await pool.query("SELECT COUNT(*) FROM books");
    const totalBooks = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalBooks / pageSize); 

    const result = await pool.query(
      "SELECT * FROM books ORDER BY title LIMIT $1 OFFSET $2", 
      [pageSize, offset]
    );

    res.json({
      page,
      pageSize,
      totalPages,
      totalBooks,
      books: result.rows,
    });
  } catch (err) {
    handleError(res, err, "Error fetching books");
  }
};

const getBookByISBN = async (req, res) => {
  try {
    const { isbn } = req.params;
    const result = await pool.query("SELECT * FROM books WHERE isbn = $1", [isbn]);

    if (result.rows.length === 0) {
      return res.status(404).send("Book not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    handleError(res, err, "Error fetching book");
  }
};

const updateBook = async (req, res) => {
  const { isbn } = req.params;
  const updates = req.body; 
  const keys = Object.keys(updates);

  if (keys.length === 0) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
  const values = keys.map((key) => updates[key]);
  values.push(isbn); 

  try {
    const result = await pool.query("SELECT * FROM books WHERE isbn = $1", [isbn]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const query = `UPDATE books SET ${setClause} WHERE isbn = $${values.length}`;
    await pool.query(query, values);

    res.status(200).json({ message: "Book updated successfully" });
  } catch (err) {
    handleError(res, err, "Error updating book");
  }
};


const deleteBook = async (req, res) => {
  const { isbn } = req.params;

  try {
    const checkResult = await pool.query("SELECT * FROM books WHERE isbn = $1", [isbn]);

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    await pool.query("DELETE FROM books WHERE isbn = $1", [isbn]);

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    handleError(res, err, "Error deleting book");
  }
};

const getAvailableBooks = async (req, res) => {
  const studentId = req.params.id;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const query = `
      SELECT b.* 
      FROM books b
      WHERE b.availability = true 
        AND b.quantity > 1
        AND NOT EXISTS (
          SELECT 1 
          FROM borrowed_books bb
          WHERE bb.isbn = b.isbn
            AND bb.studentid = $1
            AND bb.request_start_date < $2
            AND (bb.return_date IS NULL OR bb.return_date > CURRENT_DATE)
        )
      ORDER BY b.title
    `;

    const { rows } = await pool.query(query, [studentId, sevenDaysFromNow]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No available books found for the specified student with the given criteria",
      });
    }

    res.status(200).json(rows);
  } catch (error) {
    handleError(res, error, "Error fetching available books");
  }
};

export default {
  createBook,
  getAllBooks,
  getBookByISBN,
  updateBook,
  deleteBook,
  getAvailableBooks,
};
