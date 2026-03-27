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
      email: 'admin@trimurti.com',
      password: 'Admin@123',
      role: USER_ROLES.ADMIN,
    });

    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@trimurti.com',
      password: 'Staff@123',
      role: USER_ROLES.STAFF,
    });

    const customer = await User.create({
      name: 'Customer User',
      email: 'customer@trimurti.com',
      password: 'Customer@123',
      role: USER_ROLES.CUSTOMER,
    });

    const vehicles = await Vehicle.insertMany([
      {
        name: 'Toyota Innova',
        category: 'SUV',
        pricePerDay: 2500,
        availability: true,
        condition: 'good',
        location: 'Pune',
      },
      {
        name: 'Maruti Swift',
        category: 'Hatchback',
        pricePerDay: 1500,
        availability: true,
        condition: 'good',
        location: 'Pune',
      },
      {
        name: 'Tata Ace',
        category: 'Commercial',
        pricePerDay: 1800,
        availability: true,
        condition: 'good',
        location: 'Mumbai',
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
