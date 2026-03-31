const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { USER_STATUS, USER_ROLES } = require('../config/constants');

const generateToken = (user) => {
  console.log('\n🔐 [GENERATE TOKEN] Creating JWT for user:', user.email);
  const tokenPayload = { 
    id: user._id.toString(), 
    role: user.role, 
    status: user.status 
  };
  console.log('   - Token payload:', tokenPayload);
  
  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  console.log('   - Token generated, length:', token.length);
  return token;
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
  console.log('\n🔑 [LOGIN] ATTEMPT - Email:', email);
  
  const user = await User.findOne({ email });
  if (!user) {
    console.log('❌ [LOGIN] USER NOT FOUND - Email:', email);
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  console.log('✅ [LOGIN] USER FOUND:');
  console.log('   - ID:', user._id.toString());
  console.log('   - Email:', user.email);
  console.log('   - Role:', user.role);
  console.log('   - Status:', user.status);

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    console.log('❌ [LOGIN] PASSWORD MISMATCH');
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  console.log('✅ [LOGIN] PASSWORD VERIFIED');

  // Check if user status is active
  if (user.status !== USER_STATUS.ACTIVE) {
    console.log('❌ [LOGIN] ACCOUNT NOT ACTIVE - Status:', user.status);
    const error = new Error(`Your account is ${user.status}. Please wait for admin approval.`);
    error.statusCode = 403;
    error.errorCode = 'ACCOUNT_INACTIVE';
    throw error;
  }

  console.log('✅ [LOGIN] ACCOUNT ACTIVE - Generating token');
  
  const token = generateToken(user);
  
  console.log('✅ [LOGIN] SUCCESS - Token generated');
  console.log('   - Returning user:', { 
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    status: user.status
  });
  
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
