import express from "express";
import cors from "cors";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import borrowedBooks from "./routes/borrowedBookRoutes.js";
import "./controllers/overdueAlertScheduler.js"
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

// Routes
//app.use('/api/books', bookRoutes);
app.use("/users", userRoutes);
app.use("/borrowed_books", borrowedBooks);
app.use("/books", bookRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to backend of Library Management System App.");
});
// Server
const port = process.env.PORT || 4000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port: ${port}`);
});
