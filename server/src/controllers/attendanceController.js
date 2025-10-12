import pool from "../config/db.js";

export const getAttendance = async (req, res) => {
  const studentId = req.user.id;
  const { reportId } = req.params;

  try {
    const query = `
      SELECT status
      FROM student_attendance
      WHERE student_id = $1 AND report_id = $2
    `;
    const { rows } = await pool.query(query, [studentId, reportId]);
    res.json(rows[0] || { status: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const markAttendance = async (req, res) => {
  const studentId = req.user.id;
  const { report_id, status } = req.body;

  if (!report_id || !["present", "absent"].includes(status)) {
    return res.status(400).json({ message: "Invalid report_id or status" });
  }

  try {
    const query = `
      INSERT INTO student_attendance(report_id, student_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (report_id, student_id) 
      DO UPDATE SET status = EXCLUDED.status
      RETURNING *
    `;
    const { rows } = await pool.query(query, [report_id, studentId, status]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
