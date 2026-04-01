require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const { connectDB } = require('./config/db');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const { setupSwagger } = require('./config/swagger');

// Verify environment variables are loaded
console.log('\n🔧 [SERVER] Environment Configuration:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - PORT:', process.env.PORT);
console.log('   - MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
console.log('   - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('   - RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? `✅ ${process.env.RAZORPAY_KEY_ID.substring(0, 15)}...` : '❌ Missing');
console.log('   - RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? `✅ ${process.env.RAZORPAY_KEY_SECRET.substring(0, 15)}...` : '❌ Missing');
console.log('');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api', routes);

// Swagger docs
setupSwagger(app);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Trimurti Transport VRMS API' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app; // for testing
