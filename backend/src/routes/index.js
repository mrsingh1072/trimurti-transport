const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const bookingRoutes = require('./bookingRoutes');
const returnRoutes = require('./returnRoutes');
const paymentRoutes = require('./paymentRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/bookings', bookingRoutes);
router.use('/returns', returnRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
