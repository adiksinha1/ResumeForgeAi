import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Mock mongoose and DB connectivity
jest.mock('mongoose', () => {
  return {
    connect: jest.fn().mockImplementation(() => Promise.resolve({
      connection: { host: 'localhost' }
    })),
    Schema: class MockSchema {
      constructor() {}
      pre() {}
      methods() {}
    },
    model: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn()
    })
  };
});

jest.mock('../config/db.js', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => Promise.resolve())
  };
});

describe('Integration Tests - App Boot and Public APIs', () => {
  
  test('GET /health - should return health check JSON status OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.message).toContain('Server is running');
  });

  test('POST /api/auth/login - should fail without email and password parameters', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation failed');
  });

});
