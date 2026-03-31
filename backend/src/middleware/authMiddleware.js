const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('❌ TOKEN MISSING - Authorization header:', req.headers.authorization);
    const error = new Error('Not authorized, token missing');
    error.statusCode = 401;
    return next(error);
  }

  try {
    console.log('\n🔍 [AUTH MIDDLEWARE] TOKEN FOUND:', token.substring(0, 30) + '...');
    
    // Verify token and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [AUTH MIDDLEWARE] TOKEN DECODED:', { 
      id: decoded.id, 
      role: decoded.role, 
      status: decoded.status,
      iat: new Date(decoded.iat * 1000).toISOString(),
      exp: new Date(decoded.exp * 1000).toISOString()
    });

    // Validate that decoded.id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      console.log('❌ [AUTH MIDDLEWARE] INVALID MONGODB ID FORMAT:', decoded.id);
      const error = new Error('Invalid user ID in token');
      error.statusCode = 401;
      return next(error);
    }

    // Fetch user from database
    const userId = new mongoose.Types.ObjectId(decoded.id);
    console.log('🔎 [AUTH MIDDLEWARE] SEARCHING USER - ID:', userId.toString());
    
    req.user = await User.findById(userId).select('-password');
    
    if (!req.user) {
      console.log('❌ [AUTH MIDDLEWARE] USER NOT FOUND IN DB');
      console.log('📊 [AUTH MIDDLEWARE] DEBUGGING INFO:');
      console.log('   - Searched ID:', userId.toString());
      console.log('   - Token payload ID:', decoded.id);
      
      // List all users for debugging
      const allUsers = await User.find().select('_id email role status').limit(10);
      console.log('   - Users in DB:', allUsers.map(u => ({ 
        _id: u._id.toString(), 
        email: u.email, 
        role: u.role,
        status: u.status 
      })));
      
      const error = new Error('User not found for this token');
      error.statusCode = 401;
      return next(error);
    }

    console.log('✅ [AUTH MIDDLEWARE] USER FOUND:');
    console.log('   - ID:', req.user._id.toString());
    console.log('   - Email:', req.user.email);
    console.log('   - Role:', req.user.role);
    console.log('   - Status:', req.user.status);
    
    next();
  } catch (err) {
    console.log('❌ [AUTH MIDDLEWARE] TOKEN VERIFICATION FAILED:', err.message);
    const error = new Error('Not authorized, token invalid');
    error.statusCode = 401;
    next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  console.log('\n🔐 [AUTHORIZATION] CHECK - Required roles:', roles);
  console.log('   - User:', req.user?.email);
  console.log('   - User role:', req.user?.role);
  
  if (!req.user) {
    console.log('❌ [AUTHORIZATION] NO USER FOUND - req.user is undefined');
    const error = new Error('Not authorized - user not found');
    error.statusCode = 403;
    return next(error);
  }

  if (!roles.includes(req.user.role)) {
    console.log(`❌ [AUTHORIZATION] ROLE NOT ALLOWED - User role "${req.user.role}" not in allowed roles:`, roles);
    const error = new Error('Not authorized for this action');
    error.statusCode = 403;
    return next(error);
  }
  
  console.log('✅ [AUTHORIZATION] ACCESS GRANTED for:', req.user.email);
  next();
};

module.exports = { protect, authorize };
