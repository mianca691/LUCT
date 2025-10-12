import pool from "../config/db.js";

export const getMonitoringData = async (req, res) => {
  try {
    const query = `
      SELECT
        c.id AS class_id,
        co.name AS course_name,
        co.code AS course_code,
        u.name AS lecturer_name,
        c.total_registered_students,
        AVG(r.actual_students_present)::NUMERIC(5,2) AS avg_present,
        ROUND(
          (AVG(r.actual_students_present) / NULLIF(c.total_registered_students, 0)) * 100, 2
        ) AS attendance_percentage
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN users u ON c.lecturer_id = u.id
      LEFT JOIN lecture_reports r ON c.id = r.class_id
      GROUP BY c.id, co.name, co.code, u.name, c.total_registered_students
      ORDER BY co.name;
    `;

    const { rows } = await pool.query(query);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching monitoring data:", err);
    res.status(500).json({ message: "Server error fetching monitoring data" });
  }
};
