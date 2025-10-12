import pool from "../config/db.js";

export const getReports = async (req, res) => {
  try {
    const prlId = req.user.id;

    const reports = await pool.query(
      `
      SELECT 
        lr.id,
        lr.topic,
        lr.date,
        lr.week,
        lr.actual_students_present,
        lr.learning_outcomes,
        lr.recommendations,
        lr.submitted_by,
        c.class_name,
        co.name AS course_name,
        u.name AS lecturer_name,
        f.comment AS existing_feedback,
        ROUND(
          CASE 
            WHEN c.total_registered_students > 0 
            THEN (lr.actual_students_present::decimal / c.total_registered_students) * 100
            ELSE 0
          END, 1
        ) AS attendance_percentage
      FROM lecture_reports lr
      JOIN classes c ON lr.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON lr.submitted_by = u.id
      LEFT JOIN feedback f ON f.report_id = lr.id AND f.prl_id = $1
      WHERE co.faculty_id IN (
        SELECT faculty_id 
        FROM users 
        WHERE id = $1
      )
      ORDER BY lr.date DESC
      `,
      [prlId]
    );

    res.json(reports.rows);
  } catch (err) {
    console.error("Error fetching PRL reports:", err);
    res.status(500).json({ message: "Failed to load reports" });
  }
};

export const addFeedback = async (req, res) => {
  try {
    const prlId = req.user.id;
    const { reportId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Feedback cannot be empty" });
    }

    const existing = await pool.query(
      `SELECT * FROM feedback WHERE report_id = $1 AND prl_id = $2`,
      [reportId, prlId]
    );

    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Feedback already submitted for this report" });
    }

    const result = await pool.query(
      `INSERT INTO feedback (report_id, prl_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [reportId, prlId, comment.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding feedback:", err);
    res.status(500).json({ message: "Failed to add feedback" });
  }
};

export async function fetchPRLCourses(req, res) {
  const prlId = req.user.id;

  try {
    const query = `
      SELECT 
        c.id AS course_id,
        c.name AS course_name,
        c.code AS course_code,
        COALESCE(
          json_agg(
            json_build_object(
              'id', cl.id,
              'class_name', cl.class_name,
              'lecturer_name', u.name,
              'scheduled_time', cl.scheduled_time,
              'venue', cl.venue,
              'total_registered_students', cl.total_registered_students
            ) ORDER BY cl.scheduled_time
          ) FILTER (WHERE cl.id IS NOT NULL),
          '[]'
        ) AS classes
      FROM courses c
      LEFT JOIN classes cl ON cl.course_id = c.id
      LEFT JOIN users u ON u.id = cl.lecturer_id
      WHERE c.faculty_id = (
        SELECT faculty_id FROM users WHERE id = $1
      )
      GROUP BY c.id
      ORDER BY c.name;
    `;
    const { rows } = await pool.query(query, [prlId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching PRL courses:", err);
    res.status(500).json({ message: "Failed to fetch courses." });
  }
}

export async function fetchMonitoring(req, res) {
  const prlId = req.user.id;

  try {
    const query = `
      SELECT 
        cl.id AS class_id,
        cl.class_name,
        c.name AS course_name,
        c.code AS course_code,
        u.name AS lecturer_name,
        COALESCE(
          ROUND(
            100.0 * SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) / NULLIF(COUNT(sa.id), 0), 2
          ), 0
        ) AS attendance_percentage,
        COUNT(DISTINCT lr.id) AS reports_submitted,
        COUNT(DISTINCT se.student_id) AS total_students
      FROM classes cl
      JOIN courses c ON c.id = cl.course_id
      LEFT JOIN users u ON u.id = cl.lecturer_id
      LEFT JOIN student_enrolments se ON se.class_id = cl.id
      LEFT JOIN lecture_reports lr ON lr.class_id = cl.id
      LEFT JOIN student_attendance sa ON sa.report_id = lr.id
      WHERE c.faculty_id = (
        SELECT faculty_id FROM users WHERE id = $1
      )
      GROUP BY cl.id, cl.class_name, c.name, c.code, u.name
      ORDER BY c.name, cl.class_name;
    `;

    const { rows } = await pool.query(query, [prlId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching PRL monitoring:", err);
    res.status(500).json({ message: "Failed to fetch monitoring data." });
  }
}

export async function fetchPRLRatings(req, res) {
  const prlId = req.user.id;

  try {
    const query = `
      SELECT
        r.id,
        r.rating,
        r.comment,
        s.name AS student_name,
        cl.id AS class_id,
        cl.class_name,
        co.id AS course_id,
        co.name AS course_name,
        co.code AS course_code,
        u.name AS lecturer_name
      FROM ratings r
      JOIN users s ON s.id = r.user_id
      JOIN classes cl ON cl.id = r.class_id
      JOIN courses co ON co.id = cl.course_id
      LEFT JOIN users u ON u.id = cl.lecturer_id
      WHERE co.faculty_id = (
        SELECT faculty_id FROM users WHERE id = $1
      )
      ORDER BY co.name, cl.class_name, s.name;
    `;
    const { rows } = await pool.query(query, [prlId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching PRL ratings:", err);
    res.status(500).json({ message: "Failed to fetch ratings." });
  }
}

export async function fetchPRLClasses(req, res) {
  const prlId = req.user.id;

  try {
    const query = `
      SELECT
        cl.id AS class_id,
        cl.class_name,
        co.name AS course_name,
        co.code AS course_code,
        u.name AS lecturer_name,
        COUNT(DISTINCT se.student_id) AS total_students,
        COALESCE(
          ROUND(
            100.0 * SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END)
            / NULLIF(COUNT(sa.id), 0),
            2
          ),
          0
        ) AS avg_attendance
      FROM classes cl
      JOIN courses co ON co.id = cl.course_id
      LEFT JOIN users u ON u.id = cl.lecturer_id
      LEFT JOIN student_enrolments se ON se.class_id = cl.id
      LEFT JOIN lecture_reports lr ON lr.class_id = cl.id
      LEFT JOIN student_attendance sa ON sa.report_id = lr.id
      WHERE co.faculty_id = (
        SELECT faculty_id FROM users WHERE id = $1
      )
      GROUP BY cl.id, co.name, co.code, u.name
      ORDER BY co.name, cl.class_name;
    `;

    const { rows } = await pool.query(query, [prlId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching PRL classes:", err);
    res.status(500).json({ message: "Failed to fetch classes data." });
  }
}
