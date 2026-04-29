const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Car', 'Bike', 'Truck', 'Bus', 'Tractor', 'JCB'],
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 500,
    },
    availability: {
      type: Boolean,
      default: true,
      index: true,
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair'],
      default: 'Good',
      trim: true,
    },
        isDeleted: {
          type: Boolean,
          default: false,
          index: true,
        },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ category: 1, location: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
