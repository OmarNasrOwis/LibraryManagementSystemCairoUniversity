import express from "express";
import {
  createUser,
  deleteUser,
  loginUser,
  getAllStudents,
  getStudentByIdentifier,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, role, email, fullname, studentid } = req.body;
  const missingFields = [];
  if (!username) missingFields.push("username");
  if (!password) missingFields.push("password");
  if (!role) missingFields.push("role");
  if (!email) missingFields.push("email");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required field(s): ${missingFields.join(", ")}`,
    });
  }

  try {
    const newUser = await createUser(
      username,
      password,
      role,
      email,
      fullname,
      studentid
    );
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
        fullname: newUser.fullname,
        studentid: newUser.studentid,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/delete/:username", async (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const result = await deleteUser(username);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: `User ${username} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/login", async (req, res) => {
  const { username: identifier, password } = req.body;

  try {
    const { studentid, token, role } = await loginUser(identifier, password);
    res.json({ message: "Login successful", token, studentid, role });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

router.get("/students", async (req, res) => {
  try {
    const students = await getAllStudents();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve students" });
  }
});

router.get("/students/:identifier", async (req, res) => {
  const identifier = req.params.identifier;
  try {
    const result = await getStudentByIdentifier(identifier);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
