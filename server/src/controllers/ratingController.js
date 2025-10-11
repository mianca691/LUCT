import { pool } from "../config/db.js";

// Get all classes with course & lecturer info
export const getAvailableClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id AS class_id,
             co.name AS course_name,
             co.code AS course_code,
             u.name AS lecturer_name,
             c.venue,
             c.scheduled_time
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN users u ON c.lecturer_id = u.id
      ORDER BY co.name, c.scheduled_time
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};

// Create rating
export const createRating = async (req, res) => {
  const { class_id, rating, comment } = req.body;
  const userId = req.user.id;

  if (!class_id || !rating) return res.status(400).json({ message: "Class and rating required" });

  try {
    const result = await pool.query(`
      INSERT INTO ratings (class_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [class_id, userId, rating, comment]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting rating" });
  }
};

// Get student's past ratings
export const getMyRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT r.id, r.rating, r.comment,
             c.id AS class_id,
             co.name AS course_name,
             u.name AS lecturer_name,
             r.created_at
      FROM ratings r
      JOIN classes c ON r.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON c.lecturer_id = u.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
};
