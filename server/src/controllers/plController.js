import pool from "../config/db.js";

export const getCourses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id AS course_id,
        c.code AS course_code,
        c.name AS course_name,
        COUNT(cl.id) AS classes_count,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', u.id, 'name', u.name)
          ) FILTER (WHERE u.id IS NOT NULL), '[]'
        ) AS lecturers
      FROM courses c
      LEFT JOIN classes cl ON cl.course_id = c.id
      LEFT JOIN users u ON cl.lecturer_id = u.id
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { name, code } = req.body;
    const facultyId = req.user?.faculty_id || req.body.faculty_id;

    if (!name || !code || !facultyId) {
      return res.status(400).json({
        error: "Course name, code, and faculty_id are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO courses (name, code, faculty_id)
       VALUES ($1, $2, $3)
       RETURNING id AS course_id, code AS course_code, name AS course_name, faculty_id`,
      [name.trim(), code.trim(), facultyId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding course:", err);
    res.status(500).json({ error: "Failed to add course" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: "Course name and code are required" });
    }

    const result = await pool.query(
      `UPDATE courses
       SET name = $1, code = $2
       WHERE id = $3
       RETURNING id AS course_id, code AS course_code, name AS course_name`,
      [name.trim(), code.trim(), id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Failed to update course" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM courses WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: "Failed to delete course" });
  }
};

export const getFaculties = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT id, name 
      FROM faculties
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching faculties:", err);
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
};



export const getClasses = async (req, res) => {
  try {
    const { faculty_id } = req.query; // get faculty filter from query
    let query = `
      SELECT 
        cl.id,
        cl.class_name,
        cl.course_id,
        c.code AS course_code,
        c.name AS course_name,
        cl.lecturer_id,
        u.name AS lecturer_name,
        cl.scheduled_time,
        cl.venue,
        COUNT(se.student_id) AS total_registered_students
      FROM classes cl
      INNER JOIN courses c ON cl.course_id = c.id
      LEFT JOIN users u ON cl.lecturer_id = u.id
      LEFT JOIN student_enrolments se ON cl.id = se.class_id
    `;

    const params = [];
    if (faculty_id) {
      query += ` WHERE c.faculty_id = $1`;
      params.push(faculty_id);
    }

    query += `
      GROUP BY cl.id, c.id, u.name
      ORDER BY cl.class_name
    `;

    const classesResult = await pool.query(query, params);

    const formattedClasses = classesResult.rows.map((cls) => ({
      ...cls,
      scheduled_time: cls.scheduled_time ? cls.scheduled_time.slice(0, 5) : null,
    }));

    res.json(formattedClasses);
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};


export const createClass = async (req, res) => {
  try {
    const { class_name, course_id, scheduled_time, venue } = req.body;
    if (!class_name || !course_id) return res.status(400).json({ error: "Class name and course_id are required" });

    const timeValue = scheduled_time ? scheduled_time.slice(0, 5) : null;

    const result = await pool.query(
      `INSERT INTO classes (class_name, course_id, scheduled_time, venue)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [class_name, course_id, timeValue, venue || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({ error: "Failed to create class" });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_name, course_id, scheduled_time, venue, lecturer_id } = req.body;

    const timeValue = scheduled_time ? scheduled_time.slice(0, 5) : null;

    const result = await pool.query(
      `UPDATE classes
       SET class_name = $1,
           course_id = $2,
           scheduled_time = $3,
           venue = $4,
           lecturer_id = $5
       WHERE id = $6
       RETURNING *`,
      [class_name, course_id, timeValue, venue || null, lecturer_id || null, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Class not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating class:", err);
    res.status(500).json({ error: "Failed to update class" });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM classes WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Class not found" });

    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error("Error deleting class:", err);
    res.status(500).json({ error: "Failed to delete class" });
  }
};

export const assignLecturerToClass = async (req, res) => {
  try {
    const { class_id, lecturer_id } = req.body;
    if (!class_id || !lecturer_id) return res.status(400).json({ error: "class_id and lecturer_id are required" });

    const result = await pool.query(
      `UPDATE classes
       SET lecturer_id = $1
       WHERE id = $2
       RETURNING id, class_name, lecturer_id`,
      [lecturer_id, class_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error assigning lecturer:", err);
    res.status(500).json({ error: "Failed to assign lecturer" });
  }
};

export const getClassesForCourse = async (req, res) => {
  const courseId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT id, class_name AS name, course_id
       FROM classes
       WHERE course_id = $1
       ORDER BY class_name`,
      [courseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching classes for course:", err);
    res.status(500).json({ message: "Failed to load classes for this course." });
  }
};

export const getLecturerDetails = async (req, res) => {
  try {
    // First fetch lecturers only once with aggregated data
    const lecturersQuery = `
      SELECT
        u.id,
        u.name,
        u.email,
        (
          SELECT f.name
          FROM courses c
          JOIN faculties f ON f.id = c.faculty_id
          JOIN classes cl ON cl.course_id = c.id
          WHERE cl.lecturer_id = u.id
          LIMIT 1
        ) AS faculty_name,
        (
          SELECT COUNT(DISTINCT c2.id)
          FROM courses c2
          JOIN classes cl2 ON cl2.course_id = c2.id
          WHERE cl2.lecturer_id = u.id
        ) AS courses_count,
        (
          SELECT COUNT(*)
          FROM classes cl3
          WHERE cl3.lecturer_id = u.id
        ) AS classes_count,
        (
          SELECT ROUND(AVG(r.rating)::numeric, 2)
          FROM ratings r
          JOIN classes cl4 ON cl4.id = r.class_id
          WHERE cl4.lecturer_id = u.id
        ) AS rating
      FROM users u
      WHERE u.role = 'lecturer'
      ORDER BY u.name;
    `;

    const { rows } = await pool.query(lecturersQuery);

    // Attach classes + courses
    const lecturerDetails = await Promise.all(
      rows.map(async (lect) => {
        const coursesRes = await pool.query(
          `SELECT DISTINCT c.id, c.name
           FROM courses c
           JOIN classes cl ON cl.course_id = c.id
           WHERE cl.lecturer_id = $1`,
          [lect.id]
        );

        const classesRes = await pool.query(
          `SELECT id, class_name AS name
           FROM classes
           WHERE lecturer_id = $1`,
          [lect.id]
        );

        return {
          ...lect,
          faculty_name: lect.faculty_name || "Unknown",
          rating: lect.rating || "Not Rated",
          courses: coursesRes.rows,
          classes: classesRes.rows
        };
      })
    );

    res.json(lecturerDetails);
  } catch (err) {
    console.error("Error fetching lecturers:", err);
    res.status(500).json({ message: "Failed to load lecturers." });
  }
};

export const getRatings = async (req, res) => {
  try {
    const { search, class_id, lecturer_id, week } = req.query;

    let query = `
      SELECT r.id, r.rating, r.comment, r.created_at,
             c.class_name, c.course_id,
             co.name AS course_name,
             u.name AS lecturer_name, u.id AS lecturer_id,
             c.id AS class_id, lr.week
      FROM ratings r
      JOIN classes c ON r.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN lecture_reports lr ON lr.class_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.class_name ILIKE $${params.length} OR co.name ILIKE $${params.length} OR u.name ILIKE $${params.length})`;
    }
    if (class_id) {
      params.push(class_id);
      query += ` AND c.id = $${params.length}`;
    }
    if (lecturer_id) {
      params.push(lecturer_id);
      query += ` AND u.id = $${params.length}`;
    }
    if (week) {
      params.push(week);
      query += ` AND lr.week = $${params.length}`;
    }

    query += " ORDER BY r.created_at DESC";

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get metrics for Ratings Dashboard
 */
export const getMetrics = async (req, res) => {
  try {
    const totalRatings = await pool.query("SELECT COUNT(*) FROM ratings");
    const avgRating = await pool.query("SELECT AVG(rating) FROM ratings");
    const totalLecturers = await pool.query(`
      SELECT COUNT(DISTINCT u.id) FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE u.role='lecturer'
    `);
    const totalClasses = await pool.query("SELECT COUNT(DISTINCT class_id) FROM ratings");

    res.json({
      total_ratings: Number(totalRatings.rows[0].count) || 0,
      avg_rating: parseFloat(avgRating.rows[0].avg) || 0,
      total_lecturers: Number(totalLecturers.rows[0].count) || 0,
      total_classes: Number(totalClasses.rows[0].count) || 0,
    });
  } catch (err) {
    console.error("Error fetching metrics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Submit a new rating
 */
export const submitRating = async (req, res) => {
  try {
    const { class_id, user_id, rating, comment } = req.body;

    // Basic validation
    if (!class_id || !user_id || !rating) {
      return res.status(400).json({ error: "class_id, user_id, and rating are required" });
    }

    const result = await pool.query(
      "INSERT INTO ratings (class_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [class_id, user_id, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error submitting rating:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get rating by ID
 */
export const getRatingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT r.*, c.class_name, co.name AS course_name, u.name AS lecturer_name
       FROM ratings r
       JOIN classes c ON r.class_id = c.id
       JOIN courses co ON c.course_id = co.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Rating not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching rating:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};