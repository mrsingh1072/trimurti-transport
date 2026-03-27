const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'cash',
    },
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
