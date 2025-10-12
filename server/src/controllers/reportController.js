import pool from "../config/db.js";

export const createReport = async (req, res) => {
  const {
    class_id,
    week,
    date,
    actual_students_present,
    topic,
    learning_outcomes,
    recommendations,
  } = req.body;
  const userId = req.user.id;

  try {
    const query = `INSERT INTO lecture_reports
      (class_id, week, date, actual_students_present, topic, learning_outcomes, recommendations, submitted_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
    const { rows } = await pool.query(query, [
      class_id,
      week,
      date,
      actual_students_present,
      topic,
      learning_outcomes,
      recommendations,
      userId,
    ]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReports = async (req, res) => {
  const { search } = req.query;

  try {
    const baseQuery = `
      SELECT
        r.id,
        r.week,
        r.date,
        r.actual_students_present,
        r.topic,
        r.learning_outcomes,
        r.recommendations,
        r.created_at,
        u.name AS lecturer_name,
        c.id AS class_id,
        c.class_name
      FROM lecture_reports r
      JOIN users u ON r.submitted_by = u.id
      JOIN classes c ON r.class_id = c.id
    `;

    const query = search
      ? `${baseQuery} WHERE r.topic ILIKE $1 OR r.learning_outcomes ILIKE $1 ORDER BY r.date DESC`
      : `${baseQuery} ORDER BY r.date DESC`;

    const values = search ? [`%${search}%`] : [];
    const { rows } = await pool.query(query, values);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEnrolledReports = async (req, res) => {
  const studentId = req.user.id;

  try {
    const query = `
      SELECT 
        lr.id,
        lr.class_id,
        lr.topic,
        lr.date,
        lr.week,
        lr.actual_students_present,
        lr.learning_outcomes,
        lr.recommendations,
        u.name AS lecturer_name,
        c.class_name,
        sa.status AS student_status
      FROM lecture_reports lr
      JOIN classes c ON lr.class_id = c.id
      JOIN users u ON lr.submitted_by = u.id
      LEFT JOIN student_attendance sa
        ON sa.report_id = lr.id AND sa.student_id = $1
      WHERE lr.class_id IN (
        SELECT class_id FROM student_enrolments WHERE student_id = $1
      )
      ORDER BY lr.date DESC
    `;

    const { rows } = await pool.query(query, [studentId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};