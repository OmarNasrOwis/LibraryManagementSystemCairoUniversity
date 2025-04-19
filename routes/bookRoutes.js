const express = require('express');
const router = express.Router();
const BookController = require('../controllers/BookController');

router.post('/', BookController.createBook);
router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getBookById);
router.put('/:id', BookController.updateBook);
router.delete('/:id', BookController.deleteBook);

module.exports = router;
