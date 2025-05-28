import pool from "../config/db.js";

/*columns:
"published_date"
"availability"
"id"
"isbn"
"barcode"
"publisher"
"title"
"author"
*/
// POST /Books
const createBook = async (req, res) => {
  const {
    title,
    author,
    publisher,
    barcode,
    isbn,
    availability,
    published_date,
    quantity
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO books (title, author, publisher,barcode,isbn,availability, published_date) VALUES ($1, $2, $3, $4, $5, $6, $7,$8)",
      [title, author, publisher, barcode, isbn, availability, published_date,quantity]
    );
    res.status(201).send("Book created successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /Books
const getAllBooks = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET /Books/:id
const getBookByISBN = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books WHERE isbn = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) return res.status(404).send("Book not found");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// PUT /Books/:id
const updateBook = async (req, res) => {
  const { availability } = req.body;
  const isbn = req.params.id;

  try {
    // Check if the book exists by ISBN
    const result = await pool.query("SELECT * FROM books WHERE isbn = $1", [
      isbn,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Update book fields (example: availability only here, add more as needed)
    await pool.query("UPDATE books SET availability = $1 WHERE isbn = $2", [
      availability,
      isbn,
    ]);

    res.status(200).json({ message: "Book updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /Books/:id
const deleteBook = async (req, res) => {
  const isbn = req.params.id;

  try {
    // Check if the book exists
    const checkResult = await pool.query(
      "SELECT * FROM books WHERE isbn = $1",
      [isbn]
    );

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete the book
    await pool.query("DELETE FROM books WHERE isbn = $1", [isbn]);

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  createBook,
  getAllBooks,
  getBookByISBN,
  updateBook,
  deleteBook,
};
