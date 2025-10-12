import pool from "../config/db.js";

export const getEnrolledClasses = async (req, res) => {
  const studentId = req.user.id;

  try {
    const query = `
      SELECT se.id AS enrolment_id, c.id AS class_id, c.class_name, c.venue, c.scheduled_time, cr.name AS course_name
      FROM student_enrolments se
      JOIN classes c ON se.class_id = c.id
      JOIN courses cr ON c.course_id = cr.id
      WHERE se.student_id = $1
    `;
    const { rows } = await pool.query(query, [studentId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const enrollInClass = async (req, res) => {
  const studentId = req.user.id;
  const { class_id } = req.body;

  if (!class_id) return res.status(400).json({ message: "class_id is required" });

  try {
    const query = `
      INSERT INTO student_enrolments(student_id, class_id)
      VALUES ($1, $2)
      ON CONFLICT (student_id, class_id) DO NOTHING
      RETURNING *
    `;
    const { rows } = await pool.query(query, [studentId, class_id]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Already enrolled in this class" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
