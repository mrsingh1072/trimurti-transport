const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
      unique: true, // One feedback per booking
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's feedback
feedbackSchema.index({ user: 1, createdAt: -1 });

// Compound index for latest feedback
feedbackSchema.index({ createdAt: -1, rating: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
