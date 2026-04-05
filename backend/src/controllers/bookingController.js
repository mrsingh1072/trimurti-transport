const bookingService = require('../services/bookingService');

const createBooking = async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  res.status(201).json({ message: 'Booking created', booking });
};

const getMyBookings = async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user._id);
  res.json({ bookings });
};

const getBookingDetails = async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id);
  res.json({ booking });
};

const cancelBooking = async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
  res.json({ message: 'Booking cancelled', booking });
};

const getAllBookings = async (req, res) => {
  const bookings = await bookingService.getAllBookings();
  res.json({ bookings });
};

const getBookingStats = async (req, res) => {
  const stats = await bookingService.getBookingStats();
  res.json(stats);
};

// CUSTOMER REQUEST RETURN
const requestReturn = async (req, res) => {
  const booking = await bookingService.requestReturn(req.params.id, req.user._id);
  res.json({ message: 'Return requested successfully', booking });
};

// CUSTOMER REQUEST WAIVER
const requestWaiver = async (req, res) => {
  const { reason } = req.body;
  const booking = await bookingService.requestWaiver(req.params.id, req.user._id, reason);
  res.json({ message: 'Waiver request submitted', booking });
};

// STAFF/ADMIN PROCESS RETURN
const processReturn = async (req, res) => {
  const { actualReturnDate, damageFee } = req.body;
  const booking = await bookingService.processReturn(
    req.params.id,
    { actualReturnDate, damageFee },
    req.user.role
  );
  res.json({ message: 'Return processed successfully', booking });
};

// STAFF/ADMIN UPDATE PENALTY
const updatePenalty = async (req, res) => {
  const { lateFee, damageFee } = req.body;
  const booking = await bookingService.updatePenalty(
    req.params.id,
    { lateFee, damageFee },
    req.user.role
  );
  res.json({ message: 'Penalty updated successfully', booking });
};

// STAFF/ADMIN HANDLE WAIVER
const handleWaiver = async (req, res) => {
  const { approve } = req.body;
  const booking = await bookingService.handleWaiver(
    req.params.id,
    approve,
    req.user.role
  );
  const action = approve ? 'approved' : 'rejected';
  res.json({ message: `Waiver ${action}`, booking });
};

// STAFF/ADMIN: GET LATE BOOKINGS
const getLateBookings = async (req, res) => {
  const bookings = await bookingService.getLateBookings();
  res.json({ bookings });
};

// STAFF/ADMIN: GET PENDING RETURNS
const getPendingReturns = async (req, res) => {
  const bookings = await bookingService.getPendingReturnRequests();
  res.json({ bookings });
};

// STAFF/ADMIN: GET PENDING WAIVERS
const getPendingWaivers = async (req, res) => {
  const bookings = await bookingService.getPendingWaiverRequests();
  res.json({ bookings });
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
  getAllBookings,
  getBookingStats,
  requestReturn,
  requestWaiver,
  processReturn,
  updatePenalty,
  handleWaiver,
  getLateBookings,
  getPendingReturns,
  getPendingWaivers,
};
