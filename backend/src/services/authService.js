const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { USER_STATUS, USER_ROLES } = require('../config/constants');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, status: user.status },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

const register = async ({ name, email, password, phone, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  // Default to customer if role not specified
  const userRole = role || USER_ROLES.CUSTOMER;

  const user = await User.create({ 
    name, 
    email, 
    password, 
    phone,
    role: userRole
  });
  
  const token = generateToken(user);

  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Check if user status is active
  if (user.status !== USER_STATUS.ACTIVE) {
    const error = new Error(`Your account is ${user.status}. Please wait for admin approval.`);
    error.statusCode = 403;
    error.statusCode = 'ACCOUNT_INACTIVE';
    throw error;
  }

  const token = generateToken(user);
  return { user, token };
};

// Get all staff members pending approval
const getPendingStaff = async () => {
  const staff = await User.find({
    role: USER_ROLES.STAFF,
    status: USER_STATUS.PENDING
  }).select('-password');
  return staff;
};

// Get all staff members (active and pending)
const getAllStaff = async () => {
  const staff = await User.find({
    role: USER_ROLES.STAFF
  }).select('-password');
  return staff;
};

// Approve staff member
const approveStaff = async (staffId) => {
  const staff = await User.findByIdAndUpdate(
    staffId,
    { status: USER_STATUS.ACTIVE },
    { new: true }
  ).select('-password');
  
  if (!staff) {
    const error = new Error('Staff member not found');
    error.statusCode = 404;
    throw error;
  }

  return staff;
};

// Reject staff member
const rejectStaff = async (staffId) => {
  const staff = await User.findByIdAndUpdate(
    staffId,
    { status: USER_STATUS.REJECTED },
    { new: true }
  ).select('-password');
  
  if (!staff) {
    const error = new Error('Staff member not found');
    error.statusCode = 404;
    throw error;
  }

  return staff;
};

module.exports = { 
  register, 
  login, 
  getPendingStaff, 
  getAllStaff, 
  approveStaff, 
  rejectStaff 
};
