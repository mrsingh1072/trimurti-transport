const authService = require('../services/authService');

const register = async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({
    message: 'User registered successfully',
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
};

const login = async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({
    message: 'Logged in successfully',
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
};

module.exports = { register, login };
