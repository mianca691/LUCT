import { pool } from "../config/db.js";

// ✅ Get only classes that the logged-in student is enrolled in AND have a report
export const getAvailableClasses = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT DISTINCT
        c.id AS class_id,
        c.class_name,
        co.name AS course_name,
        co.code AS course_code,
        u.name AS lecturer_name,
        c.venue,
        c.scheduled_time
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN users u ON c.lecturer_id = u.id
      JOIN student_enrolments se ON se.class_id = c.id
      WHERE se.student_id = $1
        AND EXISTS (
          SELECT 1 FROM lecture_reports lr WHERE lr.class_id = c.id
        )
      ORDER BY co.name, c.class_name
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch available classes" });
  }
};

// ✅ Create rating, but validate that the student is enrolled and class has a report
export const createRating = async (req, res) => {
  const { class_id, rating, comment } = req.body;
  const userId = req.user.id;

  if (!class_id || !rating)
    return res.status(400).json({ message: "Class and rating are required." });

  try {
    // Verify that student is enrolled in the class and class has a report
    const validation = await pool.query(`
      SELECT 1
      FROM student_enrolments se
      JOIN classes c ON se.class_id = c.id
      WHERE se.student_id = $1
        AND se.class_id = $2
        AND EXISTS (SELECT 1 FROM lecture_reports lr WHERE lr.class_id = c.id)
      LIMIT 1
    `, [userId, class_id]);

    if (validation.rowCount === 0) {
      return res.status(403).json({
        message: "You can only rate classes you're enrolled in and that have reports.",
      });
    }

    // Insert rating
    const result = await pool.query(
      `
      INSERT INTO ratings (class_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [class_id, userId, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting rating" });
  }
};

// ✅ Get logged-in student's ratings
export const getMyRatings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        r.id, 
        r.rating, 
        r.comment,
        c.id AS class_id,
        c.class_name,
        co.name AS course_name,
        u.name AS lecturer_name,
        r.created_at
      FROM ratings r
      JOIN classes c ON r.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN users u ON c.lecturer_id = u.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
};
