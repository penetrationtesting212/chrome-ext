import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Data-Driven Testing (DDT) API', () => {
  let authToken: string;
  let testUser: any;
  let testScript: any;

  beforeAll(async () => {
    // Create a test user
    testUser = await prisma.user.create({
      data: {
        email: 'ddttest@example.com',
        password: 'hashed-password', // In real tests, this would be properly hashed
        name: 'DDT Test User'
      }
    });

    // Create a test script
    testScript = await prisma.script.create({
      data: {
        name: 'Test Script',
        code: 'console.log("test");',
        language: 'javascript',
        userId: testUser.id
      }
    });

    // For testing purposes, we'll mock the token
    authToken = 'mock-auth-token';
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.script.deleteMany({
      where: { userId: testUser.id }
    });
    
    await prisma.testDataFile.deleteMany({
      where: { userId: testUser.id }
    });
    
    await prisma.user.deleteMany({
      where: { email: 'ddttest@example.com' }
    });
    
    await prisma.$disconnect();
  });

  describe('POST /api/test-data/upload/csv', () => {
    it('should upload a CSV file', async () => {
      // Since we're not actually implementing file upload in this test,
      // we'll test that the endpoint exists and requires authentication
      await request(app)
        .post('/api/test-data/upload/csv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400); // Expect 400 because no file is provided

      // Test without authentication
      await request(app)
        .post('/api/test-data/upload/csv')
        .expect(401); // Expect 401 Unauthorized
    });
  });

  describe('POST /api/test-data/upload/json', () => {
    it('should upload a JSON file', async () => {
      // Since we're not actually implementing file upload in this test,
      // we'll test that the endpoint exists and requires authentication
      await request(app)
        .post('/api/test-data/upload/json')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400); // Expect 400 because no file is provided

      // Test without authentication
      await request(app)
        .post('/api/test-data/upload/json')
        .expect(401); // Expect 401 Unauthorized
    });
  });

  describe('GET /api/test-data/files', () => {
    it('should get all data files for a user', async () => {
      await request(app)
        .get('/api/test-data/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Test without authentication
      await request(app)
        .get('/api/test-data/files')
        .expect(401); // Expect 401 Unauthorized
    });
  });

  describe('GET /api/test-data/files/:fileId', () => {
    it('should get a specific data file', async () => {
      // Create a test data file first
      const testDataFile = await prisma.testDataFile.create({
        data: {
          name: 'Test Data File',
          fileName: 'test.csv',
          fileType: 'csv',
          fileSize: 100,
          userId: testUser.id,
          scriptId: testScript.id,
          rowCount: 5,
          columnNames: ['col1', 'col2']
        }
      });

      await request(app)
        .get(`/api/test-data/files/${testDataFile.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Test without authentication
      await request(app)
        .get(`/api/test-data/files/${testDataFile.id}`)
        .expect(401); // Expect 401 Unauthorized

      // Clean up
      await prisma.testDataFile.delete({
        where: { id: testDataFile.id }
      });
    });
  });

  describe('GET /api/test-data/rows/:fileId', () => {
    it('should get rows from a data file', async () => {
      // Create a test data file first
      const testDataFile = await prisma.testDataFile.create({
        data: {
          name: 'Test Data File',
          fileName: 'test.csv',
          fileType: 'csv',
          fileSize: 100,
          userId: testUser.id,
          scriptId: testScript.id,
          rowCount: 5,
          columnNames: ['col1', 'col2']
        }
      });

      await request(app)
        .get(`/api/test-data/rows/${testDataFile.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Test without authentication
      await request(app)
        .get(`/api/test-data/rows/${testDataFile.id}`)
        .expect(401); // Expect 401 Unauthorized

      // Clean up
      await prisma.testDataFile.delete({
        where: { id: testDataFile.id }
      });
    });
  });

  describe('DELETE /api/test-data/files/:fileId', () => {
    it('should delete a data file', async () => {
      // Create a test data file first
      const testDataFile = await prisma.testDataFile.create({
        data: {
          name: 'Test Data File',
          fileName: 'test.csv',
          fileType: 'csv',
          fileSize: 100,
          userId: testUser.id,
          scriptId: testScript.id,
          rowCount: 5,
          columnNames: ['col1', 'col2']
        }
      });

      await request(app)
        .delete(`/api/test-data/files/${testDataFile.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Test without authentication
      // Note: We can't test this easily since the file was already deleted
    });
  });

  describe('GET /api/test-data/execute/:fileId', () => {
    it('should prepare data-driven execution', async () => {
      // Create a test data file first
      const testDataFile = await prisma.testDataFile.create({
        data: {
          name: 'Test Data File',
          fileName: 'test.csv',
          fileType: 'csv',
          fileSize: 100,
          userId: testUser.id,
          scriptId: testScript.id,
          rowCount: 5,
          columnNames: ['col1', 'col2']
        }
      });

      // Create some test rows
      await prisma.testDataRow.createMany({
        data: [
          {
            fileId: testDataFile.id,
            rowNumber: 1,
            data: { col1: 'value1', col2: 'value2' }
          },
          {
            fileId: testDataFile.id,
            rowNumber: 2,
            data: { col1: 'value3', col2: 'value4' }
          }
        ]
      });

      await request(app)
        .get(`/api/test-data/execute/${testDataFile.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Test without authentication
      await request(app)
        .get(`/api/test-data/execute/${testDataFile.id}`)
        .expect(401); // Expect 401 Unauthorized

      // Clean up
      await prisma.testDataFile.delete({
        where: { id: testDataFile.id }
      });
    });
  });
});