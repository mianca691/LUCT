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

export const getMonitoringMetrics = async (req, res) => {
  try {
    const metricsQuery = `
      -- Total courses, classes, lecturers
      SELECT
        (SELECT COUNT(*) FROM courses) AS total_courses,
        (SELECT COUNT(*) FROM classes) AS total_classes,
        (SELECT COUNT(*) FROM users WHERE role = 'lecturer') AS total_lecturers,
        -- Average rating
        ROUND((SELECT AVG(rating) FROM ratings)::numeric, 2) AS avg_rating,
        -- Average attendance across all classes
        ROUND((
          SELECT AVG(attendance_pct)
          FROM (
            SELECT 
              CASE 
                WHEN cl.total_registered_students = 0 THEN 0
                ELSE (COUNT(sa.*)::decimal / cl.total_registered_students) * 100
              END AS attendance_pct
            FROM student_attendance sa
            JOIN lecture_reports lr ON lr.id = sa.report_id
            JOIN classes cl ON cl.id = lr.class_id
            GROUP BY cl.id, cl.total_registered_students
          ) t
        )::numeric, 2) AS avg_attendance
    `;

    const { rows } = await pool.query(metricsQuery);
    res.json({
      totalCourses: parseInt(rows[0].total_courses),
      totalClasses: parseInt(rows[0].total_classes),
      totalLecturers: parseInt(rows[0].total_lecturers),
      avgRating: rows[0].avg_rating ? parseFloat(rows[0].avg_rating) : 0,
      avgAttendance: rows[0].avg_attendance ? parseFloat(rows[0].avg_attendance) : 0,
    });
  } catch (err) {
    console.error("Error fetching monitoring metrics:", err);
    res.status(500).json({ message: "Failed to load metrics." });
  }
};


export const getMonitoringClasses = async (req, res) => {
  try {
    const classesQuery = `
      SELECT
        cl.id,
        cl.class_name,
        c.name AS course_name,
        u.name AS lecturer_name,
        cl.scheduled_time,
        cl.total_registered_students,
        ROUND((
          SELECT AVG(CASE WHEN sa.status='present' THEN 1 ELSE 0 END) * 100
          FROM student_attendance sa
          JOIN lecture_reports lr ON lr.id = sa.report_id
          WHERE lr.class_id = cl.id
        )::numeric, 2) AS avg_attendance
      FROM classes cl
      LEFT JOIN courses c ON c.id = cl.course_id
      LEFT JOIN users u ON u.id = cl.lecturer_id
      ORDER BY cl.class_name;
    `;

    const { rows } = await pool.query(classesQuery);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Failed to load classes." });
  }
};

export const getMonitoringLecturers = async (req, res) => {
  try {
    const lecturersQuery = `
      SELECT
        u.id,
        u.name,
        COUNT(DISTINCT c.id) AS courses_count,
        COUNT(DISTINCT cl.id) AS classes_count,
        ROUND(AVG(r.rating)::numeric, 2) AS rating
      FROM users u
      LEFT JOIN classes cl ON cl.lecturer_id = u.id
      LEFT JOIN courses c ON c.id = cl.course_id
      LEFT JOIN ratings r ON r.class_id = cl.id
      WHERE u.role = 'lecturer'
      GROUP BY u.id
      ORDER BY u.name;
    `;

    const { rows } = await pool.query(lecturersQuery);
    res.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      courses_count: parseInt(row.courses_count),
      classes_count: parseInt(row.classes_count),
      rating: row.rating ? parseFloat(row.rating) : null
    })));
  } catch (err) {
    console.error("Error fetching lecturers for monitoring:", err);
    res.status(500).json({ message: "Failed to load lecturer data." });
  }
};
