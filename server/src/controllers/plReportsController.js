import pool from "../config/db.js";

export const getReportMetrics = async (req, res) => {
  try {
    const totalReportsQuery = `SELECT COUNT(*) AS total_reports FROM lecture_reports`;
    const avgAttendanceQuery = `
      SELECT ROUND(AVG(actual_students_present * 100.0 / cl.total_registered_students), 2) AS avg_attendance
      FROM lecture_reports lr
      LEFT JOIN classes cl ON lr.class_id = cl.id
      WHERE cl.total_registered_students > 0
    `;
    const avgRatingQuery = `
      SELECT ROUND(AVG(r.rating),2) AS avg_rating
      FROM ratings r
      LEFT JOIN classes cl ON r.class_id = cl.id
    `;
    const totalLecturersQuery = `SELECT COUNT(DISTINCT u.id) AS total_lecturers FROM users u WHERE u.role='LECTURER'`;
    const totalClassesQuery = `SELECT COUNT(*) AS total_classes FROM classes`;

    const [
      totalReportsRes,
      avgAttendanceRes,
      avgRatingRes,
      totalLecturersRes,
      totalClassesRes
    ] = await Promise.all([
      pool.query(totalReportsQuery),
      pool.query(avgAttendanceQuery),
      pool.query(avgRatingQuery),
      pool.query(totalLecturersQuery),
      pool.query(totalClassesQuery),
    ]);

    const total_reports = totalReportsRes.rows[0].total_reports;
    const avg_attendance = avgAttendanceRes.rows[0].avg_attendance;
    const avg_rating = avgRatingRes.rows[0].avg_rating;
    const total_lecturers = totalLecturersRes.rows[0].total_lecturers;
    const total_classes = totalClassesRes.rows[0].total_classes;

    res.json({
      total_reports,
      avg_attendance,
      avg_rating,
      total_lecturers,
      total_classes,
    });
  } catch (err) {
    console.error("Error fetching metrics:", err);
    res.status(500).json({ error: "Failed to fetch report metrics." });
  }
};

export const getReports = async (req, res) => {
  try {
    const query = `
      SELECT
        lr.id,
        lr.class_id,
        lr.date,
        lr.week,
        lr.topic,
        lr.learning_outcomes,
        lr.recommendations,
        cl.class_name,
        cl.total_registered_students,
        c.name AS course_name,
        u.name AS lecturer_name,
        prl.name AS prl_name,
        ROUND((lr.actual_students_present * 100.0 / cl.total_registered_students), 2) AS attendance_percentage
      FROM lecture_reports lr
      LEFT JOIN classes cl ON lr.class_id = cl.id
      LEFT JOIN courses c ON cl.course_id = c.id
      LEFT JOIN users u ON cl.lecturer_id = u.id
      LEFT JOIN users prl ON lr.submitted_by = prl.id
      ORDER BY lr.date DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Failed to fetch reports." });
  }
};

export const getReportById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT
        lr.id,
        lr.class_id,
        lr.date,
        lr.week,
        lr.topic,
        lr.learning_outcomes,
        lr.recommendations,
        cl.class_name,
        cl.total_registered_students,
        c.name AS course_name,
        u.name AS lecturer_name,
        prl.name AS prl_name,
        ROUND((lr.actual_students_present * 100.0 / cl.total_registered_students), 2) AS attendance_percentage
      FROM lecture_reports lr
      LEFT JOIN classes cl ON lr.class_id = cl.id
      LEFT JOIN courses c ON cl.course_id = c.id
      LEFT JOIN users u ON cl.lecturer_id = u.id
      LEFT JOIN users prl ON lr.submitted_by = prl.id
      WHERE lr.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (!rows.length) return res.status(404).json({ error: "Report not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ error: "Failed to fetch report." });
  }
};
