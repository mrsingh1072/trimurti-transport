const VehicleTracking = require('../models/VehicleTracking');
const Booking = require('../models/Booking');

// Constants for status detection
const STATUS_THRESHOLDS = {
  IDLE_TIME: 30000, // 30 seconds in milliseconds
  OFFLINE_TIME: 60000, // 60 seconds in milliseconds
  MOVEMENT_DISTANCE: 0.05 // 50 meters minimum to consider as movement (in km)
};

class TrackingService {
  /**
   * Initialize tracking for a booking
   */
  static async initializeTracking(bookingId, vehicleId, userId) {
    try {
      // Check if tracking already exists
      let tracking = await VehicleTracking.findOne({ booking: bookingId, isActive: true });

      if (!tracking) {
        tracking = new VehicleTracking({
          booking: bookingId,
          vehicle: vehicleId,
          user: userId,
          isActive: true,
          status: 'offline',
          trackingStarted: new Date()
        });

        await tracking.save();
        console.log(`✅ Tracking initialized for booking ${bookingId}`);
      }

      return tracking;
    } catch (error) {
      console.error('❌ Error initializing tracking:', error);
      throw error;
    }
  }

  /**
   * Update vehicle location
   */
  static async updateLocation(bookingId, lat, lng, speed = 0, accuracy = null) {
    try {
      const tracking = await VehicleTracking.findOne({ booking: bookingId, isActive: true });

      if (!tracking) {
        throw new Error(`Tracking not found for booking ${bookingId}`);
      }

      // Add location to history
      tracking.addLocation(lat, lng, speed, accuracy);

      // Check and update status
      await this.updateStatus(tracking);

      // Check geofence
      await this.checkGeofence(tracking);

      await tracking.save();

      return tracking;
    } catch (error) {
      console.error('❌ Error updating location:', error);
      throw error;
    }
  }

  /**
   * Detect and update status: moving, idle, offline
   */
  static async updateStatus(tracking) {
    try {
      const now = new Date();
      const timeSinceLastUpdate = tracking.lastUpdate ? now - tracking.lastUpdate : null;

      // Check if offline (no update for 60+ seconds)
      if (timeSinceLastUpdate && timeSinceLastUpdate > STATUS_THRESHOLDS.OFFLINE_TIME) {
        if (tracking.status !== 'offline') {
          tracking.status = 'offline';
          tracking.addTripEvent('offline', tracking.currentLocation, 0, 'No location update received');
        }
        return;
      }

      // Check if moving (speed > 0 or significant location change)
      if (tracking.currentSpeed > 0.5) {
        if (tracking.status !== 'moving') {
          tracking.status = 'moving';
          tracking.addTripEvent('moving', tracking.currentLocation, tracking.currentSpeed);
        }
      } else {
        // Check if idle (no movement for 30+ seconds)
        if (timeSinceLastUpdate && timeSinceLastUpdate > STATUS_THRESHOLDS.IDLE_TIME && tracking.currentSpeed === 0) {
          if (tracking.status !== 'idle') {
            tracking.status = 'idle';
            tracking.addTripEvent('idle', tracking.currentLocation, 0, 'Vehicle idle');
          }
        } else if (tracking.currentSpeed > 0) {
          tracking.status = 'moving';
        }
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
    }
  }

  /**
   * Set geofence boundary for tracking
   */
  static async setGeofence(bookingId, coordinates) {
    try {
      const tracking = await VehicleTracking.findOne({ booking: bookingId, isActive: true });

      if (!tracking) {
        throw new Error(`Tracking not found for booking ${bookingId}`);
      }

      tracking.geofenceBoundary = {
        type: 'Polygon',
        coordinates: coordinates
      };

      await tracking.save();
      console.log(`✅ Geofence set for booking ${bookingId}`);

      return tracking;
    } catch (error) {
      console.error('❌ Error setting geofence:', error);
      throw error;
    }
  }

  /**
   * Check if vehicle is within geofence
   */
  static async checkGeofence(tracking) {
    try {
      if (!tracking.geofenceBoundary || !tracking.currentLocation) {
        return;
      }

      const isInside = this.isPointInPolygon(
        tracking.currentLocation.lat,
        tracking.currentLocation.lng,
        tracking.geofenceBoundary.coordinates[0]
      );

      if (!isInside) {
        // Check if alert already exists for this location
        const recentAlert = tracking.geofenceAlerts.find(
          alert =>
            alert.alertType === 'outside' &&
            new Date() - alert.timestamp < 60000 // Within last minute
        );

        if (!recentAlert) {
          tracking.addGeofenceAlert(
            'outside',
            tracking.currentLocation,
            'Vehicle exited allowed boundary'
          );
        }
      }
    } catch (error) {
      console.error('❌ Error checking geofence:', error);
    }
  }

  /**
   * Point-in-polygon algorithm (Ray casting)
   */
  static isPointInPolygon(lat, lng, polygon) {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * End tracking for a booking
   */
  static async endTracking(bookingId) {
    try {
      const tracking = await VehicleTracking.findOne({ booking: bookingId, isActive: true });

      if (!tracking) {
        throw new Error(`Tracking not found for booking ${bookingId}`);
      }

      // Calculate total distance
      tracking.calculateDistance();

      // Calculate total moving time
      if (tracking.tripEvents.length > 0) {
        const startEvent = tracking.tripEvents[0];
        const endTime = new Date();
        tracking.totalMovingTime = Math.round((endTime - startEvent.timestamp) / 60000); // in minutes
      }

      tracking.status = 'offline';
      tracking.isActive = false;
      tracking.trackingEnded = new Date();
      tracking.addTripEvent('completed', tracking.currentLocation, 0, 'Tracking ended');

      await tracking.save();
      console.log(`✅ Tracking ended for booking ${bookingId}`);

      return tracking;
    } catch (error) {
      console.error('❌ Error ending tracking:', error);
      throw error;
    }
  }

  /**
   * Get active tracking for display
   */
  static async getActiveTracking() {
    try {
      const activeTracking = await VehicleTracking.find({ isActive: true })
        .populate('booking', 'startDate endDate status')
        .populate('vehicle', 'registrationNumber model')
        .populate('user', 'name email phone')
        .sort({ lastUpdate: -1 });

      return activeTracking;
    } catch (error) {
      console.error('❌ Error getting active tracking:', error);
      throw error;
    }
  }

  /**
   * Get tracking for a specific booking
   */
  static async getTrackingByBooking(bookingId) {
    try {
      const tracking = await VehicleTracking.findOne({ booking: bookingId })
        .populate('booking', 'startDate endDate status')
        .populate('vehicle', 'registrationNumber model')
        .populate('user', 'name email phone');

      return tracking;
    } catch (error) {
      console.error('❌ Error getting booking tracking:', error);
      throw error;
    }
  }

  /**
   * Get all active vehicles by status
   */
  static async getVehiclesByStatus(status) {
    try {
      const tracking = await VehicleTracking.find({ isActive: true, status })
        .populate('booking', 'startDate endDate status')
        .populate('vehicle', 'registrationNumber model')
        .populate('user', 'name email phone')
        .sort({ lastUpdate: -1 });

      return tracking;
    } catch (error) {
      console.error('❌ Error getting vehicles by status:', error);
      throw error;
    }
  }

  /**
   * Get trip summary for a completed ride
   */
  static async getTripSummary(bookingId) {
    try {
      const tracking = await VehicleTracking.findOne({ booking: bookingId });

      if (!tracking) {
        throw new Error(`Tracking not found for booking ${bookingId}`);
      }

      return {
        totalDistance: tracking.totalDistance,
        totalMovingTime: tracking.totalMovingTime,
        maxSpeed: tracking.maxSpeed,
        locationHistory: tracking.locationHistory,
        tripEvents: tracking.tripEvents,
        geofenceAlerts: tracking.geofenceAlerts,
        trackingStarted: tracking.trackingStarted,
        trackingEnded: tracking.trackingEnded
      };
    } catch (error) {
      console.error('❌ Error getting trip summary:', error);
      throw error;
    }
  }

  /**
   * Enable location sharing for a user
   * Auto-initializes tracking if not exists
   */
  static async enableLocationSharing(bookingId) {
    try {
      // Fetch booking to get vehicle and user info
      const booking = await Booking.findById(bookingId).populate('vehicle user');
      if (!booking) {
        throw new Error(`Booking not found for ${bookingId}`);
      }

      // Check if tracking exists, if not initialize it
      let tracking = await VehicleTracking.findOne({ booking: bookingId });
      
      if (!tracking) {
        console.log(`📍 Auto-initializing tracking for booking ${bookingId}`);
        tracking = await this.initializeTracking(bookingId, booking.vehicle._id, booking.user._id);
      }

      // Enable location sharing
      tracking.locationSharingEnabled = true;
      await tracking.save();

      console.log(`✅ Location sharing enabled for booking ${bookingId}`);
      return tracking;
    } catch (error) {
      console.error('❌ Error enabling location sharing:', error.message);
      throw error;
    }
  }

  /**
   * Disable location sharing for a user
   */
  static async disableLocationSharing(bookingId) {
    try {
      let tracking = await VehicleTracking.findOne({ booking: bookingId });

      if (!tracking) {
        // If tracking doesn't exist, just return success (idempotent)
        console.log(`ℹ️ Tracking not found, returning success (idempotent)`);
        return {
          _id: null,
          booking: bookingId,
          locationSharingEnabled: false
        };
      }

      // Disable location sharing
      tracking.locationSharingEnabled = false;
      await tracking.save();

      console.log(`✅ Location sharing disabled for booking ${bookingId}`);
      return tracking;
    } catch (error) {
      console.error('❌ Error disabling location sharing:', error.message);
      throw error;
    }
  }
}

module.exports = TrackingService;
