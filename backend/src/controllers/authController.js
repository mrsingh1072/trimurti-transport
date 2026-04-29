const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        status: user.status,
        phone: user.phone
      },
      token,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      message: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.json({
      success: true,
      message: 'Logged in successfully',
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        status: user.status,
        phone: user.phone
      },
      token,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      message: error.message 
    });
  }
};

// Admin: Get pending staff
const getPendingStaff = async (req, res) => {
  try {
    const staff = await authService.getPendingStaff();
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all staff
const getAllStaff = async (req, res) => {
  try {
    const staff = await authService.getAllStaff();
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve staff
const approveStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await authService.approveStaff(staffId);
    res.json({ 
      message: 'Staff approved successfully',
      staff 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      message: error.message 
    });
  }
};

// Admin: Reject staff
const rejectStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await authService.rejectStaff(staffId);
    res.json({ 
      message: 'Staff rejected',
      staff 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      message: error.message 
    });
  }
};

module.exports = { 
  register, 
  login,
  getPendingStaff,
  getAllStaff,
  approveStaff,
  rejectStaff
};
