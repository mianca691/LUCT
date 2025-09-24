const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const { token, user } = await authService.register({ username, email, password });
      res.status(201).json({ token, user });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const { token, user } = await authService.login({ username, password });
      res.json({ token, user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
