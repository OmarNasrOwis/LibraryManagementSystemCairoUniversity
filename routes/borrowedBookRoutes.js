import express from "express";
import { getAllBorrowedBooks } from "../controllers/borrowedBookController.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const borrowedBooksResult = await getAllBorrowedBooks();
    if (borrowedBooksResult.length > 0) {
      res.status(200).json(borrowedBooksResult);
    } else {
      res.status(200).json("No Borrowed Books At the moment");
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve borrowed Books" });
  }
});

export default router;
