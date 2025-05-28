import express from "express";
import {
  getAllBorrowedBooks,
  createBorrowRequest,
  processBorrowDecision,
} from "../controllers/borrowedBookController.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const books = await getAllBorrowedBooks();
    if (books.length > 0) {
      res.status(200).json(books);
    } else {
      res.status(200).json("No Borrowed Books At the moment");
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve borrowed books" });
  }
});

// Create borrow request
router.post("/borrow-request", async (req, res) => {
  const { student_id, isbn } = req.body;

  if (!student_id || !isbn) {
    return res
      .status(400)
      .json({ error: "student_id and isbn are required" });
  }

  try {
    const result = await createBorrowRequest(student_id, isbn);
    res.status(200).json({ status: "Successful", request: result });
  } catch (err) {
    console.error("Error creating borrow request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin borrow decision
router.post("/borrow-decision", async (req, res) => {
  const { request_id, status } = req.body;

  

  try {
    const result = await processBorrowDecision(request_id, status);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json({ status: "Successful", updated: result.rows[0] });
  } catch (err) {
    console.error("Error processing borrow decision:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
