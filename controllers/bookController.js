import pool from '../config/db.js';


// POST /Books
const createBook = async (req, res) => {
  const { title, author, genre, published_year } = req.body;
  try {
    await pool.query(
      'INSERT INTO books (title, author, genre, published_year) VALUES ($1, $2, $3, $4)',
      [title, author, genre, published_year]
    );
    res.status(201).send('Book created successfully');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET /Books
const getAllBooks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET /Books/:id
const getBookById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Book not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// PUT /Books/:id
const updateBook = async (req, res) => {
  const { name, email } = req.body;
  try {
    await pool.query('UPDATE books SET name = $1, email = $2 WHERE id = $3', [name, email, req.params.id]);
    res.send('Book updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// DELETE /Books/:id
const deleteBook = async (req, res) => {
  try {
    await pool.query('DELETE FROM books WHERE id = $1', [req.params.id]);
    res.send('Book deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export default {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
