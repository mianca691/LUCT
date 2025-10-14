import pool from "../config/db.js";

export const getCourses = async (req, res) => {
  try {
    const coursesResult = await pool.query(
      `SELECT id AS course_id, code AS course_code, name AS course_name
       FROM courses
       ORDER BY name`
    );

    const courses = coursesResult.rows;

    for (const course of courses) {
      const classesResult = await pool.query(
        `SELECT cl.id, cl.class_name, cl.scheduled_time, cl.venue, cl.total_registered_students,
                u.name AS lecturer_name
         FROM classes cl
         LEFT JOIN users u ON cl.lecturer_id = u.id
         WHERE cl.course_id = $1
         ORDER BY cl.scheduled_time`,
        [course.course_id]
      );

      course.classes = classesResult.rows;
    }

    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { name, code, faculty_id } = req.body;
    if (!name || !code || !faculty_id) {
      return res.status(400).json({ error: "Name, code, and faculty_id are required" });
    }

    const result = await pool.query(
      `INSERT INTO courses (name, code, faculty_id)
       VALUES ($1, $2, $3)
       RETURNING id AS course_id, code AS course_code, name AS course_name`,
      [name, code, faculty_id]
    );

    const newCourse = { ...result.rows[0], classes: [] };

    res.status(201).json(newCourse);
  } catch (err) {
    console.error("Error adding course:", err);
    res.status(500).json({ error: "Failed to add course" });
  }
};

export const assignLecturerToClass = async (req, res) => {
  try {
    const { class_id, lecturer_id } = req.body;

    if (!class_id || !lecturer_id) {
      return res.status(400).json({ error: "class_id and lecturer_id are required" });
    }

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
