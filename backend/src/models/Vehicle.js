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
      min: 0,
    },
    availability: {
      type: Boolean,
      default: true,
      index: true,
    },
    condition: {
      type: String,
      enum: ['Good', 'Average', 'Poor'],
      default: 'Good',
      trim: true,
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
