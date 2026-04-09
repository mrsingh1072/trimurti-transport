const { Server } = require('socket.io');
const trackingService = require('../services/trackingService');

// Store active connections
const activeConnections = new Map();

/**
 * Initialize Socket.IO server
 */
const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_URL || 'http://localhost:5173'
      ],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware to verify user
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const bookingId = socket.handshake.auth.bookingId;

    if (!token || !bookingId) {
      return next(new Error('Missing authentication'));
    }

    socket.userId = socket.handshake.auth.userId;
    socket.bookingId = bookingId;
    socket.role = socket.handshake.auth.role || 'customer';

    next();
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`\n✅ [SOCKET.IO] User connected: ${socket.userId}, Booking: ${socket.bookingId}`);

    // Store connection
    activeConnections.set(socket.id, {
      userId: socket.userId,
      bookingId: socket.bookingId,
      role: socket.role,
      connectedAt: new Date()
    });

    // Join room for this booking (allows multiple users to monitor same booking)
    socket.join(`booking-${socket.bookingId}`);
    socket.join(`user-${socket.userId}`);

    // If user is admin/staff, join admin room
    if (socket.role === 'admin' || socket.role === 'staff') {
      socket.join('admin-tracking');
    }

    console.log(`📊 Active connections: ${activeConnections.size}`);

    /**
     * Handle location update from vehicle/customer
     */
    socket.on('location-update', async (data) => {
      try {
        const { lat, lng, speed, accuracy } = data;

        console.log(`📍 Location update from ${socket.userId}:`, { lat, lng, speed });

        // Update location in database
        const tracking = await trackingService.updateLocation(
          socket.bookingId,
          lat,
          lng,
          speed || 0,
          accuracy || null
        );

        // Emit to all users monitoring this booking
        io.to(`booking-${socket.bookingId}`).emit('location-updated', {
          bookingId: socket.bookingId,
          currentLocation: tracking.currentLocation,
          status: tracking.status,
          speed: tracking.currentSpeed,
          lastUpdate: tracking.lastUpdate,
          locationHistory: tracking.locationHistory.slice(-10) // Send last 10 locations
        });

        // Emit to admin for dashboard
        if (socket.role === 'admin' || socket.role === 'staff') {
          io.to('admin-tracking').emit('vehicle-updated', {
            bookingId: socket.bookingId,
            userId: socket.userId,
            status: tracking.status,
            currentLocation: tracking.currentLocation,
            speed: tracking.currentSpeed,
            lastUpdate: tracking.lastUpdate
          });
        }

        socket.emit('location-ack', { success: true, timestamp: new Date() });
      } catch (error) {
        console.error('❌ Error updating location:', error.message);
        socket.emit('location-error', { error: error.message });
      }
    });

    /**
     * Request all active vehicles (admin/staff only)
     */
    socket.on('request-active-vehicles', async (callback) => {
      try {
        if (socket.role !== 'admin' && socket.role !== 'staff') {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        const vehicles = await trackingService.getActiveTracking();

        const formattedVehicles = vehicles.map(v => ({
          _id: v._id,
          bookingId: v.booking._id,
          vehicleId: v.vehicle._id,
          vehicleName: v.vehicle.model,
          registrationNumber: v.vehicle.registrationNumber,
          userName: v.user.name,
          userPhone: v.user.phone,
          status: v.status,
          currentLocation: v.currentLocation,
          currentSpeed: v.currentSpeed,
          maxSpeed: v.maxSpeed,
          lastUpdate: v.lastUpdate,
          totalDistance: v.totalDistance
        }));

        socket.emit('active-vehicles', { vehicles: formattedVehicles });

        if (callback) callback({ success: true });
      } catch (error) {
        console.error('❌ Error fetching active vehicles:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Get tracking for specific booking
     */
    socket.on('request-tracking', async (data, callback) => {
      try {
        const { bookingId } = data;
        const tracking = await trackingService.getTrackingByBooking(bookingId);

        if (!tracking) {
          return socket.emit('error', { message: 'Tracking not found' });
        }

        socket.emit('tracking-data', {
          tracking: {
            _id: tracking._id,
            status: tracking.status,
            currentLocation: tracking.currentLocation,
            locationHistory: tracking.locationHistory,
            currentSpeed: tracking.currentSpeed,
            maxSpeed: tracking.maxSpeed,
            totalDistance: tracking.totalDistance,
            tripEvents: tracking.tripEvents,
            lastUpdate: tracking.lastUpdate
          }
        });

        if (callback) callback({ success: true });
      } catch (error) {
        console.error('❌ Error fetching tracking:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Initialize tracking session
     */
    socket.on('start-tracking', async (data, callback) => {
      try {
        const { bookingId, vehicleId } = data;

        const tracking = await trackingService.initializeTracking(
          bookingId,
          vehicleId,
          socket.userId
        );

        socket.emit('tracking-started', {
          trackingId: tracking._id,
          status: tracking.status
        });

        if (callback) callback({ success: true });
      } catch (error) {
        console.error('❌ Error starting tracking:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * End tracking session
     */
    socket.on('end-tracking', async (data, callback) => {
      try {
        const { bookingId } = data;

        const tracking = await trackingService.endTracking(bookingId);

        socket.emit('tracking-ended', {
          trackingId: tracking._id,
          totalDistance: tracking.totalDistance,
          maxSpeed: tracking.maxSpeed
        });

        // Notify admin
        io.to('admin-tracking').emit('vehicle-tracking-ended', {
          bookingId: bookingId,
          totalDistance: tracking.totalDistance
        });

        if (callback) callback({ success: true });
      } catch (error) {
        console.error('❌ Error ending tracking:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Enable location sharing
     */
    socket.on('enable-location-sharing', async (data, callback) => {
      try {
        const { bookingId } = data;
        await trackingService.enableLocationSharing(bookingId);

        socket.emit('location-sharing-enabled', { bookingId });

        if (callback) callback({ success: true });
      } catch (error) {
        console.error('❌ Error enabling location sharing:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`\n❌ [SOCKET.IO] User disconnected: ${socket.userId}`);

      activeConnections.delete(socket.id);
      console.log(`📊 Active connections: ${activeConnections.size}`);

      // Notify admin that a vehicle tracking ended
      io.to('admin-tracking').emit('vehicle-disconnected', {
        userId: socket.userId,
        bookingId: socket.bookingId
      });
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error(`❌ [SOCKET.IO] Error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

module.exports = { initializeSocket, activeConnections };
