import express from "express";
import {
  getAllBorrowedBooks,
  createBorrowRequest,
  processBorrowDecision,
  getBorrowedBooksByStudent,
  getPendingBorrows,
  getRejectedBorrows,
  getApprovedBorrows,
} from "../controllers/borrowedBookController.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const books = await getAllBorrowedBooks();
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve borrowed books" });
  }
});

router.post("/borrow-request", async (req, res) => {
  const { student_id, isbn, request_start_date } = req.body;

  if (!student_id || !isbn) {
    return res.status(400).json({ error: "student_id and isbn are required" });
  }

  try {
    const result = await createBorrowRequest(student_id, isbn, request_start_date);
    res.status(201).json({ status: "Successful", request: result });
  } catch (err) {
    console.error("Error creating borrow request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/borrow-decision", async (req, res) => {
  const decisions = req.body;

  if (!Array.isArray(decisions)) {
    return res.status(400).json({ error: "Request body must be an array" });
  }

  try {
    const results = await Promise.all(
      decisions.map(({ request_id, status }) =>
        processBorrowDecision(request_id, status)
      )
    );

    const updated = results.map((result) => result.rows[0]).filter(Boolean);

    res.status(200).json({ status: "Successful", updated });
  } catch (err) {
    console.error("Error processing borrow decisions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await getBorrowedBooksByStudent(student_id);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No borrowed books found for this student." });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching borrowed books by student ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/borrow-decision/pending", async (req, res) => {
  try {
    const result = await getPendingBorrows();
    res.status(200).json({ status: "Successful", records: result.rows });
  } catch (err) {
    console.error("Error fetching pending borrow requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/borrow-decision/approved", async (req, res) => {
  try {
    const result = await getApprovedBorrows();
    res.status(200).json({ status: "Successful", records: result.rows });
  } catch (err) {
    console.error("Error fetching approved borrow requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/borrow-decision/rejected", async (req, res) => {
  try {
    const result = await getRejectedBorrows();
    res.status(200).json({ status: "Successful", records: result.rows });
  } catch (err) {
    console.error("Error fetching rejected borrow requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
