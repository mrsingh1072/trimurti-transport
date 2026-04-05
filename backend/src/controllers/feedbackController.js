const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');

// CUSTOMER: Submit feedback for a completed booking
const submitFeedback = async (req, res) => {
  try {
    const { bookingId, message, rating } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      const error = new Error('Rating must be between 1 and 5');
      error.statusCode = 400;
      throw error;
    }

    // Validate message
    if (!message || message.trim().length < 10) {
      const error = new Error('Feedback message must be at least 10 characters');
      error.statusCode = 400;
      throw error;
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (booking.user.toString() !== userId.toString()) {
      const error = new Error('Cannot submit feedback for another user\'s booking');
      error.statusCode = 403;
      throw error;
    }

    // Verify return is processed
    if (booking.returnStatus !== 'processed') {
      const error = new Error('Can only submit feedback for completed returns');
      error.statusCode = 400;
      throw error;
    }

    // Check if feedback already exists for this booking
    const existingFeedback = await Feedback.findOne({ booking: bookingId });
    if (existingFeedback) {
      const error = new Error('Feedback already submitted for this booking');
      error.statusCode = 409;
      throw error;
    }

    // Create feedback
    const feedback = await Feedback.create({
      user: userId,
      booking: bookingId,
      message: message.trim(),
      rating: parseInt(rating),
    });

    // Populate for response
    await feedback.populate('user', 'name email');
    await feedback.populate('booking', 'vehicle');

    console.log(`✅ Feedback submitted by user ${userId} for booking ${bookingId}: ${rating} stars`);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error.message);
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

// ADMIN/STAFF: Get all feedback
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email phone')
      .populate('booking', 'vehicle')
      .sort({ createdAt: -1 });

    // Populate vehicle details
    for (let feedback of feedbacks) {
      if (feedback.booking && feedback.booking.vehicle) {
        feedback.booking.vehicle = await feedback.booking.populate('booking.vehicle');
      }
    }

    console.log(`📋 Retrieved ${feedbacks.length} feedbacks for admin/staff`);

    res.json({
      message: 'All feedback retrieved successfully',
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.error('❌ Error retrieving feedback:', error.message);
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

// PUBLIC: Get latest 3 feedback (for landing page)
const getLatestFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name')
      .populate({
        path: 'booking',
        select: 'vehicle',
        populate: {
          path: 'vehicle',
          select: 'name category',
        },
      })
      .sort({ createdAt: -1 })
      .limit(3);

    console.log(`⭐ Retrieved ${feedbacks.length} latest feedbacks for landing page`);

    res.json({
      message: 'Latest feedback retrieved successfully',
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.error('❌ Error retrieving latest feedback:', error.message);
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

// OPTIONAL: Get average rating
const getAverageRating = async (req, res) => {
  try {
    const result = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalFeedbacks: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.json({
        averageRating: 0,
        totalFeedbacks: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      });
    }

    const data = result[0];
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    // Count distribution
    data.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    console.log(`📊 Average rating: ${data.averageRating.toFixed(2)} (${data.totalFeedbacks} feedbacks)`);

    res.json({
      averageRating: parseFloat(data.averageRating.toFixed(2)),
      totalFeedbacks: data.totalFeedbacks,
      ratingDistribution: distribution,
    });
  } catch (error) {
    console.error('❌ Error calculating average rating:', error.message);
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getLatestFeedback,
  getAverageRating,
};
