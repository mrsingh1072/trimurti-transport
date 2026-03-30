const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');

// Get all users (excluding current user's password)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get users by role (customer, staff, admin)
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const users = await User.find({ role }).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const [totalUsers, customers, staff, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: USER_ROLES.CUSTOMER }),
      User.countDocuments({ role: USER_ROLES.STAFF }),
      User.countDocuments({ role: USER_ROLES.ADMIN }),
    ]);

    const staffStats = await User.aggregate([
      { $match: { role: USER_ROLES.STAFF } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      customers,
      staff,
      admins,
      staffStats: staffStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUsersByRole,
  getUserStats,
  getUserById,
  deleteUser,
};
