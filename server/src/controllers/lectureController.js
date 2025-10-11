import { pool } from "../config/db.js";

// Get all ratings for lecturer’s classes
export const getLecturerRatings = async (req, res) => {
  const lecturerId = req.user.id;

  try {
    const query = `
      SELECT 
        co.name AS course_name,
        AVG(r.rating) AS avg_rating,
        COUNT(r.id) AS total_ratings
      FROM ratings r
      JOIN classes c ON r.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE c.lecturer_id = $1
      GROUP BY co.name
      ORDER BY avg_rating DESC;
    `;

    const detailQuery = `
      SELECT 
        co.name AS course_name,
        r.rating,
        r.comment,
        r.created_at
      FROM ratings r
      JOIN classes c ON r.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE c.lecturer_id = $1
      ORDER BY r.created_at DESC;
    `;

    const [summary, details] = await Promise.all([
      pool.query(query, [lecturerId]),
      pool.query(detailQuery, [lecturerId]),
    ]);

    res.json({ summary: summary.rows, details: details.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
};
