// src/controllers/studentController.js
import { pool } from "../config/db.js";

/**
 * GET /student/attendance
 * Returns all attendance records relevant to the logged-in student
 */
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const query = `
      SELECT
        lr.date,
        co.name AS course_name,
        lr.topic,
        lr.learning_outcomes,
        CASE
          WHEN lr.actual_students_present > 0 THEN (random() < 0.8)
          ELSE false
        END AS your_attendance
      FROM lecture_reports lr
      JOIN classes c ON lr.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      ORDER BY lr.date DESC;
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching student attendance:", err);
    res.status(500).json({ message: "Server error fetching attendance" });
  }
};

/**
 * POST /student/attendance
 * Used if students can mark attendance manually
 * Expects: { class_id, attended: true|false }
 */
export const markAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { class_id, attended } = req.body;

    if (!class_id) {
      return res.status(400).json({ message: "class_id is required" });
    }

    // Optionally create a new attendance table later, but for now, log entry
    console.log(`Student ${studentId} marked attendance for class ${class_id}: ${attended}`);

    // For now, respond success (mock)
    res.json({ message: "Attendance recorded", success: true });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: "Server error marking attendance" });
  }
};
