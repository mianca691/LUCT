import pool from "../config/db.js";

export const getOverviewStats = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const classCount = await pool.query(
      `SELECT COUNT(*) AS total_classes
       FROM classes
       WHERE lecturer_id = $1;`,
      [lecturerId]
    );

    const reportCount = await pool.query(
      `SELECT COUNT(*) AS total_reports
       FROM lecture_reports
       WHERE submitted_by = $1;`,
      [lecturerId]
    );

    const studentCount = await pool.query(
      `SELECT COUNT(DISTINCT se.student_id) AS total_students
       FROM student_enrolments se
       JOIN classes c ON se.class_id = c.id
       WHERE c.lecturer_id = $1;`,
      [lecturerId]
    );

    res.json({
      totalClasses: parseInt(classCount.rows[0]?.total_classes || 0, 10),
      totalReports: parseInt(reportCount.rows[0]?.total_reports || 0, 10),
      totalStudents: parseInt(studentCount.rows[0]?.total_students || 0, 10),
    });
  } catch (err) {
    console.error("Error fetching lecturer stats:", err);
    res.status(500).json({ message: "Failed to load lecturer stats" });
  }
};

export const getRecentReports = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const reports = await pool.query(
      `SELECT 
          lr.id,
          lr.topic,
          lr.date,
          lr.week,
          lr.actual_students_present,
          lr.learning_outcomes,
          lr.recommendations,
          c.class_name,
          c.total_registered_students,
          ROUND(
            CASE 
              WHEN c.total_registered_students > 0 
              THEN (lr.actual_students_present::decimal / c.total_registered_students) * 100
              ELSE 0
            END, 1
          ) AS attendance_percentage
       FROM lecture_reports lr
       JOIN classes c ON lr.class_id = c.id
       WHERE lr.submitted_by = $1
       ORDER BY lr.date DESC
       LIMIT 5;`,
      [lecturerId]
    );

    res.json(reports.rows);
  } catch (err) {
    console.error("Error fetching recent reports:", err);
    res.status(500).json({ message: "Failed to load recent reports" });
  }
};

export const getLecturerClasses = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const result = await pool.query(
      `SELECT 
         c.id,
         c.class_name,
         c.venue,
         c.scheduled_time,
         COUNT(se.id) AS total_students,
         co.name AS course_name,
         co.code AS course_code
       FROM classes c
       LEFT JOIN courses co ON co.id = c.course_id
       LEFT JOIN student_enrolments se ON se.class_id = c.id
       WHERE c.lecturer_id = $1
       GROUP BY c.id, co.name, co.code
       ORDER BY c.class_name;`,
      [lecturerId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching lecturer classes:", err);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};

export const getLecturerReports = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const result = await pool.query(
      `SELECT 
         lr.id,
         lr.topic,
         lr.date,
         lr.week,
         lr.actual_students_present,
         lr.learning_outcomes,
         lr.recommendations,
         c.class_name,
         co.name AS course_name,
         ROUND(
           CASE 
             WHEN c.total_registered_students > 0 
             THEN (lr.actual_students_present::decimal / c.total_registered_students) * 100
             ELSE 0
           END, 1
         ) AS attendance_percentage
       FROM lecture_reports lr
       JOIN classes c ON lr.class_id = c.id
       LEFT JOIN courses co ON c.course_id = co.id
       WHERE c.lecturer_id = $1
       ORDER BY lr.date DESC;`,
      [lecturerId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all lecturer reports:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};
