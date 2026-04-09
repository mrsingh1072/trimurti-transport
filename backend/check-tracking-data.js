#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    console.log('\n🔍 CHECKING LIVE TRACKING DATA\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;
    const bookings = db.collection('bookings');

    const total = await bookings.countDocuments();
    const tracked = await bookings.countDocuments({ isTracking: true });
    const withCoords = await bookings.countDocuments({ 'currentLocation.latitude': { $ne: null } });

    console.log(`📊 Total bookings: ${total}`);
    console.log(`🟢 With isTracking=true: ${tracked}`);
    console.log(`📍 With coordinates: ${withCoords}\n`);

    if (tracked === 0) {
      console.log('❌ ISSUE: No customer has enabled tracking yet\n');
      console.log('✅ TO FIX:');
      console.log('   1. Login as CUSTOMER');
      console.log('   2. Click "My Bookings"');
      console.log('   3. Click purple toggle: "Start Live Tracking"');
      console.log('   4. Grant browser geolocation permission');
      console.log('   5. Wait 5-10 seconds for location');
      console.log('   6. Go to Admin/Staff Dashboard');
      console.log('   7. Should see vehicle in Live Tracking section\n');
    } else {
      console.log(`✅ Found ${tracked} tracked booking(s)\n`);
      const sample = await bookings.findOne({ isTracking: true });
      console.log('📋 Sample:');
      console.log(`   Booking ID: ${sample._id}`);
      console.log(`   Status: ${sample.status}`);
      console.log(`   Has Location: ${sample.currentLocation?.latitude ? 'YES ✓' : 'NO - waiting...'}`);
      if (sample.currentLocation?.latitude) {
        console.log(`   Lat/Lng: ${sample.currentLocation.latitude}, ${sample.currentLocation.longitude}`);
      }
      console.log();
    }

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

check();
