const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';

const app = require('../src/server');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({ email: /testuser@/ });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth APIs', () => {
  const email = 'testuser@trimurti.com';
  const password = 'Test@1234';

  test('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email,
      password,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(email.toLowerCase());
  });

  test('should login registered user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email,
      password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
