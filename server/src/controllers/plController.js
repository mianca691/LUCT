import pool from "../config/db.js";

// ==================== COURSES ====================

// --- Get all courses ---
export const getCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id AS course_id, code AS course_code, name AS course_name, faculty_id
       FROM courses
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// --- Add a new course ---
export const addCourse = async (req, res) => {
  try {
    const { name, code, faculty_id } = req.body;
    if (!name || !code || !faculty_id) {
      return res.status(400).json({ error: "Course name, code, and faculty_id are required" });
    }

    const result = await pool.query(
      `INSERT INTO courses (name, code, faculty_id)
       VALUES ($1, $2, $3)
       RETURNING id AS course_id, code AS course_code, name AS course_name`,
      [name, code, faculty_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding course:", err);
    res.status(500).json({ error: "Failed to add course" });
  }
};

// --- Update a course ---
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: "Course name and code are required" });

    const result = await pool.query(
      `UPDATE courses
       SET name = $1, code = $2
       WHERE id = $3
       RETURNING id AS course_id, code AS course_code, name AS course_name`,
      [name, code, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Course not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Failed to update course" });
  }
};

// --- Delete a course ---
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM courses WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Course not found" });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: "Failed to delete course" });
  }
};

// ==================== FACULTIES ====================

// --- Fetch all faculties ---
export const getFaculties = async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name FROM faculties ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching faculties:", err);
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
};

// ==================== CLASSES ====================

// --- Get all classes ---
export const getClasses = async (req, res) => {
  try {
    const classesResult = await pool.query(`
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
      GROUP BY cl.id, c.id, u.name
      ORDER BY cl.class_name
    `);

    // Format time as HH:mm
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

// --- Create a new class ---
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

// --- Update a class ---
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

// --- Delete a class ---
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

// --- Assign lecturer to a class ---
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
