import { pool } from "../config/db.js";

export const createReport = async (req, res) => {
  const { class_id, week, date, actual_students_present, topic, learning_outcomes, recommendations } = req.body;
  const userId = req.user.id;

  try {
    const query = `INSERT INTO lecture_reports
      (class_id, week, date, actual_students_present, topic, learning_outcomes, recommendations, submitted_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
    const { rows } = await pool.query(query, [
      class_id, week, date, actual_students_present, topic, learning_outcomes, recommendations, userId
    ]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReports = async (req, res) => {
  const { search } = req.query;
  try {
    const baseQuery = `SELECT r.*, u.name as lecturer_name, c.id as class_id
                       FROM lecture_reports r
                       JOIN users u ON r.submitted_by = u.id
                       JOIN classes c ON r.class_id = c.id`;
    const query = search
      ? `${baseQuery} WHERE topic ILIKE $1 OR learning_outcomes ILIKE $1 ORDER BY date DESC`
      : `${baseQuery} ORDER BY date DESC`;
    const values = search ? [`%${search}%`] : [];
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
