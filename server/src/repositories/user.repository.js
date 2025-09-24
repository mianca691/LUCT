const db = require('../config/db');

class UserRepository {
  async findAll() {
    const result = await db.query('SELECT * FROM UserAccount');
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(
      `SELECT ua.*, r.role_name, s.student_name, l.lecturer_name
       FROM UserAccount ua
       LEFT JOIN Role r ON ua.role_id = r.role_id
       LEFT JOIN Student s ON ua.student_id = s.student_id
       LEFT JOIN Lecturer l ON ua.lecturer_id = l.lecturer_id
       WHERE ua.user_id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findByUsername(username) {
    const result = await db.query(
      `SELECT ua.*, r.role_name
       FROM UserAccount ua
       LEFT JOIN Role r ON ua.role_id = r.role_id
       WHERE ua.username = $1`,
      [username]
    );
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await db.query(
      `SELECT ua.*, r.role_name
       FROM UserAccount ua
       LEFT JOIN Role r ON ua.role_id = r.role_id
       WHERE ua.email = $1`,
      [email]
    );
    return result.rows[0];
  }

  async create({ username, email, passwordHash, roleId = 1, studentId = null, lecturerId = null }) {
    const result = await db.query(
      `INSERT INTO UserAccount (username, password_hash, role_id, student_id, lecturer_id, email)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [username, passwordHash, roleId, studentId, lecturerId, email]  // ✅ fixed order
    );
    return result.rows[0];
  }

  async update(id, { username, passwordHash, roleId, studentId = null, lecturerId = null }) {
    const result = await db.query(
      `UPDATE UserAccount
       SET username = $1,
           password_hash = $2,
           role_id = $3,
           student_id = $4,
           lecturer_id = $5
       WHERE user_id = $6
       RETURNING *`,
      [username, passwordHash, roleId, studentId, lecturerId, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    await db.query('DELETE FROM UserAccount WHERE user_id = $1', [id]);
    return { message: 'User deleted successfully' };
  }
}

module.exports = new UserRepository();
