const mongoose = require('mongoose');

const walletCreditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [
      {
        transactionId: {
          type: String,
          unique: true,
          required: true,
        },
        type: {
          type: String,
          enum: ['credit', 'debit'],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        reason: {
          type: String,
          enum: [
            'referral_reward',
            'booking_discount',
            'refund',
            'cancellation_refund',
            'admin_credit',
            'promotion',
          ],
          required: true,
        },
        relatedBooking: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
          default: null,
        },
        relatedReferral: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ReferralReward',
          default: null,
        },
        description: {
          type: String,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastTransactionAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

walletCreditSchema.index({ user: 1 });
walletCreditSchema.index({ 'transactions.createdAt': -1 });

module.exports = mongoose.model('WalletCredit', walletCreditSchema);
