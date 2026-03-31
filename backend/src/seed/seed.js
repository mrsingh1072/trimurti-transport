require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { USER_ROLES } = require('../config/constants');

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'prajwalrajput2004@gmail.com',
      password: 'Prajwal@1100',
      role: USER_ROLES.ADMIN,
      status: 'active', // Explicitly set to active
    });

    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@trimurti.com',
      password: 'Staff@123',
      role: USER_ROLES.STAFF,
      status: 'active', // Explicitly set to active for testing
    });

    const customer = await User.create({
      name: 'Customer User',
      email: 'customer@trimurti.com',
      password: 'Customer@123',
      role: USER_ROLES.CUSTOMER,
    });

    const vehicles = await Vehicle.insertMany([
      {
        name: 'Toyota Fortuner',
        category: 'Car',
        pricePerDay: 2500,
        availability: true,
        condition: 'Good',
        location: 'Pune',
      },
      {
        name: 'Maruti Swift',
        category: 'Car',
        pricePerDay: 1500,
        availability: true,
        condition: 'Good',
        location: 'Pune',
      },
      {
        name: 'Tata Ace',
        category: 'Truck',
        pricePerDay: 1800,
        availability: true,
        condition: 'Good',
        location: 'Mumbai',
      },
      {
        name: 'Royal Enfield Bullet',
        category: 'Bike',
        pricePerDay: 800,
        availability: true,
        condition: 'Good',
        location: 'Pune',
      },
      {
        name: 'Tata Bus',
        category: 'Bus',
        pricePerDay: 3500,
        availability: false,
        condition: 'Average',
        location: 'Mumbai',
      },
      {
        name: 'JCB Excavator',
        category: 'JCB',
        pricePerDay: 5000,
        availability: true,
        condition: 'Good',
        location: 'Delhi',
      },
      {
        name: 'Mahindra Tractor',
        category: 'Tractor',
        pricePerDay: 2000,
        availability: true,
        condition: 'Good',
        location: 'Haryana',
      },
    ]);

    console.log('Seed completed:', {
      admin: admin.email,
      staff: staff.email,
      customer: customer.email,
      vehicles: vehicles.length,
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
