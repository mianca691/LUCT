import { pool } from "../config/db.js";

// Get current student's attendance per class/course
export const getStudentAttendance = async (req, res) => {
  const studentId = req.user.id;

  try {
    // Fetch lecture reports with attendance info for this student
    const query = `
      SELECT 
        c.id AS class_id,
        co.name AS course_name,
        co.code AS course_code,
        u.name AS lecturer_name,
        lr.date,
        lr.topic,
        lr.learning_outcomes,
        CASE WHEN r.user_id IS NOT NULL THEN true ELSE false END AS your_attendance
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON c.lecturer_id = u.id
      JOIN lecture_reports lr ON lr.class_id = c.id
      LEFT JOIN ratings r ON r.class_id = c.id AND r.user_id = $1
      ORDER BY lr.date;
    `;

    const { rows } = await pool.query(query, [studentId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};
