const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';

const app = require('../src/server');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Vehicle = require('../src/models/Vehicle');
const { USER_ROLES } = require('../src/config/constants');

let staffToken;

beforeAll(async () => {
  await connectDB();
  await Promise.all([User.deleteMany({ email: /vehiclestaff@/ }), Vehicle.deleteMany({})]);

  const staff = await User.create({
    name: 'Vehicle Staff',
    email: 'vehiclestaff@trimurti.com',
    password: 'Staff@123',
    role: USER_ROLES.STAFF,
  });

  const res = await request(app).post('/api/auth/login').send({
    email: staff.email,
    password: 'Staff@123',
  });
  staffToken = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Vehicle APIs', () => {
  test('staff can create a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        name: 'Test Car',
        category: 'SUV',
        pricePerDay: 2000,
        location: 'Pune',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.vehicle).toHaveProperty('_id');
  });

  test('anyone can list vehicles (paginated)', async () => {
    const res = await request(app).get('/api/vehicles?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
