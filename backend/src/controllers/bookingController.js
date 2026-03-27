const bookingService = require('../services/bookingService');

const createBooking = async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  res.status(201).json({ message: 'Booking created', booking });
};

const getMyBookings = async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user._id);
  res.json({ bookings });
};

const cancelBooking = async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
  res.json({ message: 'Booking cancelled', booking });
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
