import cron from "node-cron";
import nodemailer from "nodemailer";
import pool from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

var transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Daily at 9am
// for testing use */10 * * * * *"
//for deploying use "0 7 * * *"
cron.schedule("0 7 * * *", async () => {
  console.log("Running daily reminder job...");

  try {
    const today = new Date().toISOString().split("T")[0];

    const result = await pool.query(
      `SELECT u.username, u.email, b.isbn, b.due_date
      FROM users u
      JOIN borrowed_books b ON u.username = b.username
      WHERE b.due_date < $1
      AND b.returned = false`,
      [today]
    );
    console.log(result.rows);
    //console.log(result.rows)
    if (result.rows.length === 0) {
      console.log("No overdue books today.");
      return;
    }

    for (const record of result.rows) {
      const mailOptions = {
        from: `"Library Bot" <${process.env.EMAIL_USER}>`,
        to: record.user_email,
        subject: "📚 Book Return Reminder",
        text: `Hi there,

You borrowed "${record.book_title}" which was due on ${record.due_date}.
Please return it to the library as soon as possible.

Thank you!
Library Team`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Reminder sent to ${record.user_email}`);
    }
  } catch (err) {
    console.error("Scheduler error:", err.message);
  }
});

export default cron;
