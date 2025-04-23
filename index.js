import express from "express";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import borrowedBooks from "./routes/borrowedBookRoutes.js";
import dotenv from "dotenv";
const app = express();
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
const port = process.env.PORT || 3001;
app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});
