const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { User } = require('../models/User');
const { connectDB, disconnectDB } = require('../config/database');

// Setup and teardown
beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication API', () => {
  describe('Traditional Authentication', () => {
    test('Should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body).toHaveProperty('token');
    });
    
    test('Should not register user with existing email', async () => {
      // Create a user first
      await User.create({
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'Test User'
      });
      
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Another User'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.code).toBe('EMAIL_EXISTS');
    });
    
    test('Should login with valid credentials', async () => {
      // Create a user first
      await User.create({
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'Test User'
      });
      
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });
    
    test('Should not login with invalid password', async () => {
      // Create a user first
      await User.create({
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'Test User'
      });
      
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword!'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
    
    test('Should lock account after 5 failed attempts', async () => {
      // Create a user first
      await User.create({
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'Test User',
        failedLoginAttempts: 4
      });
      
      // This should be the 5th attempt
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword!'
        });
      
      expect(res.statusCode).toBe(401);
      
      // Try again, should be locked now
      const res2 = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      expect(res2.statusCode).toBe(401);
      expect(res2.body).toHaveProperty('error');
      expect(res2.body.code).toBe('ACCOUNT_LOCKED');
    });
  });
});
