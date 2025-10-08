import db from "../config/db.js";

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT courses.*, faculties.name AS faculty_name
       FROM courses
       JOIN faculties ON faculties.id = courses.faculty_id
       ORDER BY courses.id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific course
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT courses.*, faculties.name AS faculty_name
       FROM courses
       JOIN faculties ON faculties.id = courses.faculty_id
       WHERE courses.id = $1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const { faculty_id, name, code } = req.body;

    if (!faculty_id || !name || !code)
      return res.status(400).json({ error: "Missing required fields" });

    const result = await db.query(
      `INSERT INTO courses (faculty_id, name, code)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [faculty_id, name, code]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_id, name, code } = req.body;

    const result = await db.query(
      `UPDATE courses
       SET faculty_id = $1, name = $2, code = $3
       WHERE id = $4
       RETURNING *`,
      [faculty_id, name, code, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM courses WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
