import express from 'express';
const router = express.Router();

import BookController from '../controllers/bookController.js';


router.post('/', BookController.createBook);
router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getBookById);
router.put('/:id', BookController.updateBook);
router.delete('/:id', BookController.deleteBook);

export default router;
