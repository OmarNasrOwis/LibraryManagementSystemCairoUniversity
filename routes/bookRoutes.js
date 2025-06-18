import express from "express";
import BookController from "../controllers/bookController.js";

const router = express.Router();

router.post("/", BookController.createBook);
router.get("/", BookController.getAllBooks);
router.get("/:isbn", BookController.getBookByISBN);
router.put("/:isbn", BookController.updateBook);
router.delete("/:isbn", BookController.deleteBook);
router.get("/available/:id", BookController.getAvailableBooks);

export default router;
