const bcrypt = require('bcryptjs'); // consistent with your controller
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');

class AuthService {
  // Registration
  async register({ username, email, password }) {
    // Check if user already exists by email
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await userRepo.create({ username, email, passwordHash });

    // Sign JWT
    const token = jwt.sign(
      { id: user.user_id, role: user.role_name }, // or role_name if you prefer
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { token, user };
  }

  // Login
  async login({ username, password }) {
    // Find user by username
    const user = await userRepo.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new Error('Invalid credentials');
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.user_id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { token, user };
  }
}

module.exports = new AuthService();
