import request from 'supertest';
import { app } from '../src/index';
import pool from '../src/db';

describe('Data-Driven Testing (DDT) API', () => {
  let authToken: string;
  let testUser: any;
  let testScript: any;

  beforeAll(async () => {
    const { rows: userRows } = await pool.query(
      `INSERT INTO "User" (id,email,password,name, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, now(), now())
       RETURNING id`,
      ['ddttest@example.com', 'hashed-password', 'DDT Test User']
    );
    testUser = { id: userRows[0].id };

    const { rows: scriptRows } = await pool.query(
      `INSERT INTO "Script" (id,name,code,language,"userId","browserType","createdAt","updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'chromium', now(), now())
       RETURNING *`,
      ['Test Script', 'console.log("test");', 'javascript', testUser.id]
    );
    testScript = scriptRows[0];

    authToken = 'mock-auth-token';
  });

  afterAll(async () => {
    await pool.query('DELETE FROM "Script" WHERE "userId" = $1', [testUser.id]);
    await pool.query('DELETE FROM "TestDataFile" WHERE "userId" = $1', [testUser.id]);
    await pool.query('DELETE FROM "User" WHERE email = $1', ['ddttest@example.com']);
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

      const { rows } = await pool.query(
        `INSERT INTO "TestDataFile" (id, name, "fileName", "fileType", "fileSize", "userId", "scriptId", "rowCount", "columnNames", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8::jsonb, now(), now())
         RETURNING id`,
        ['Test Data File', 'test.csv', 'csv', 100, testUser.id, testScript.id, 5, JSON.stringify(['col1','col2'])]
      );
      const testDataFileId = rows[0].id;

      await pool.query(
        `INSERT INTO "TestDataRow" (id, "fileId", "rowNumber", data, "createdAt") VALUES
         (gen_random_uuid()::text, $1, 1, $2::jsonb, now()),
         (gen_random_uuid()::text, $1, 2, $3::jsonb, now())`,
        [testDataFileId, JSON.stringify({ col1: 'value1', col2: 'value2' }), JSON.stringify({ col1: 'value3', col2: 'value4' })]
      );

      await request(app)
        .get(`/api/test-data/execute/${testDataFileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app)
        .get(`/api/test-data/execute/${testDataFileId}`)
        .expect(401);

      await pool.query('DELETE FROM "TestDataFile" WHERE id = $1', [testDataFileId]);
    });
  });
});
