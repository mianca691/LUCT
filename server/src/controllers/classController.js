import db from "../config/db.js"; // Sequelize instance or pg client

// Get all classes
export const getAllClasses = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM classes ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single class
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM classes WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Class not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching class:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new class
export const createClass = async (req, res) => {
  try {
    const { course_id, lecturer_id, scheduled_time, venue } = req.body;
    const result = await db.query(
      `INSERT INTO classes (course_id, lecturer_id, scheduled_time, venue)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [course_id, lecturer_id, scheduled_time, venue]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update class
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, lecturer_id, scheduled_time, venue } = req.body;
    const result = await db.query(
      `UPDATE classes
       SET course_id = $1, lecturer_id = $2, scheduled_time = $3, venue = $4
       WHERE id = $5 RETURNING *`,
      [course_id, lecturer_id, scheduled_time, venue, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Class not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating class:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM classes WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Class not found" });
    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error("Error deleting class:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
