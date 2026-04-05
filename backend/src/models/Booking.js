const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../config/constants');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
      index: true,
    },
    actualReturnDate: {
      type: Date,
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    damageFee: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    // NEW FIELDS FOR ENHANCED RENTAL WORKFLOW (BACKWARD COMPATIBLE)
    durationType: {
      type: String,
      enum: ['hours', 'days'],
      default: 'days',
    },
    durationValue: {
      type: Number,
      default: null, // Will be calculated from dates if not provided
    },
    pickupDateTime: {
      type: Date,
      default: null,
    },
    dropoffDateTime: {
      type: Date,
      default: null,
    },
    returnStatus: {
      type: String,
      enum: ['none', 'requested', 'processed'],
      default: 'none',
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    waiverRequested: {
      type: Boolean,
      default: false,
    },
    waiverReason: {
      type: String,
      default: '',
    },
    waiverApproved: {
      type: Boolean,
      default: false,
    },
    isFinePaid: {
      type: Boolean,
      default: false,
    },
    penaltyModifiedBy: {
      type: String,
      enum: ['staff', 'admin'],
      default: null,
    },
    penaltyModifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ returnStatus: 1 });
bookingSchema.index({ isLate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
