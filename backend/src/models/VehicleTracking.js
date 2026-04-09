const mongoose = require('mongoose');

const vehicleTrackingSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Location history - array of coordinates
    locationHistory: [
      {
        lat: {
          type: Number,
          required: true
        },
        lng: {
          type: Number,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        speed: {
          type: Number,
          default: 0 // in km/h
        },
        accuracy: {
          type: Number,
          default: null
        }
      }
    ],
    // Current location
    currentLocation: {
      lat: {
        type: Number,
        default: null
      },
      lng: {
        type: Number,
        default: null
      }
    },
    // Geo-fencing boundary
    geofenceBoundary: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon'
      },
      coordinates: [
        [
          [Number, Number] // [lng, lat] pairs
        ]
      ]
    },
    // Status tracking
    status: {
      type: String,
      enum: ['moving', 'idle', 'offline'],
      default: 'offline',
      index: true
    },
    // Speed tracking
    currentSpeed: {
      type: Number,
      default: 0
    },
    maxSpeed: {
      type: Number,
      default: 0
    },
    // Trip timeline - events
    tripEvents: [
      {
        eventType: {
          type: String,
          enum: ['started', 'moving', 'idle', 'resumed', 'completed']
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        location: {
          lat: Number,
          lng: Number
        },
        speed: {
          type: Number,
          default: 0
        },
        details: String
      }
    ],
    // Geo-fence alerts
    geofenceAlerts: [
      {
        alertType: {
          type: String,
          enum: ['outside', 'approaching']
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        location: {
          lat: Number,
          lng: Number
        },
        details: String
      }
    ],
    // Last update
    lastUpdate: {
      type: Date,
      default: null
    },
    // Duration in motion
    totalDistance: {
      type: Number,
      default: 0 // in km
    },
    totalMovingTime: {
      type: Number,
      default: 0 // in minutes
    },
    // Start/End of tracking
    trackingStarted: {
      type: Date,
      default: Date.now
    },
    trackingEnded: {
      type: Date,
      default: null
    },
    // Location sharing permission from user
    locationSharingEnabled: {
      type: Boolean,
      default: false
    },
    // Ride in progress
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    indexes: [
      { booking: 1, isActive: 1 },
      { vehicle: 1, isActive: 1 },
      { user: 1, isActive: 1 },
      { isActive: 1, lastUpdate: 1 }
    ]
  }
);

// Methods
vehicleTrackingSchema.methods.addLocation = function(lat, lng, speed = 0, accuracy = null) {
  this.locationHistory.push({
    lat,
    lng,
    timestamp: new Date(),
    speed,
    accuracy
  });
  
  this.currentLocation = { lat, lng };
  this.currentSpeed = speed;
  this.lastUpdate = new Date();
  
  if (speed > this.maxSpeed) {
    this.maxSpeed = speed;
  }
};

vehicleTrackingSchema.methods.addTripEvent = function(eventType, location, speed = 0, details = '') {
  this.tripEvents.push({
    eventType,
    timestamp: new Date(),
    location,
    speed,
    details
  });
};

vehicleTrackingSchema.methods.addGeofenceAlert = function(alertType, location, details = '') {
  this.geofenceAlerts.push({
    alertType,
    timestamp: new Date(),
    location,
    details
  });
};

vehicleTrackingSchema.methods.calculateDistance = function() {
  // Haversine formula to calculate distance between two points
  const R = 6371; // Earth's radius in km
  let totalDistance = 0;

  for (let i = 1; i < this.locationHistory.length; i++) {
    const lat1 = (this.locationHistory[i - 1].lat * Math.PI) / 180;
    const lat2 = (this.locationHistory[i].lat * Math.PI) / 180;
    const deltaLat = ((this.locationHistory[i].lat - this.locationHistory[i - 1].lat) * Math.PI) / 180;
    const deltaLng = ((this.locationHistory[i].lng - this.locationHistory[i - 1].lng) * Math.PI) / 180;

    const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }

  this.totalDistance = parseFloat(totalDistance.toFixed(2));
};

module.exports = mongoose.model('VehicleTracking', vehicleTrackingSchema);
