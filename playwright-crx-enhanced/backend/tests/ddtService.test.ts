import { DDTService } from '../src/services/ddt/ddt.service';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
const mockPrisma = {
  testDataFile: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn()
  },
  testDataRow: {
    createMany: jest.fn(),
    findMany: jest.fn()
  },
  $transaction: jest.fn()
};

// Mock the prisma client
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma)
  };
});

describe('DDTService', () => {
  let ddtService: DDTService;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    ddtService = new DDTService();
  });

  describe('uploadCSV', () => {
    it('should upload and parse a CSV file', async () => {
      const mockTestDataFile = {
        id: 'test-file-id',
        name: 'test',
        fileName: 'test.csv',
        fileType: 'csv',
        fileSize: 100,
        userId: 'user-id',
        scriptId: 'script-id',
        rowCount: 2,
        columnNames: ['name', 'email'],
        createdAt: new Date()
      };

      // Mock the Prisma calls
      mockPrisma.testDataFile.create.mockResolvedValue(mockTestDataFile);
      mockPrisma.testDataRow.createMany.mockResolvedValue({ count: 2 });

      const fileBuffer = Buffer.from('name,email\\nJohn,john@example.com\\nJane,jane@example.com');
      const result = await ddtService.uploadCSV('test.csv', fileBuffer, 'user-id', 'script-id');

      expect(result).toHaveProperty('file');
      expect(result).toHaveProperty('rowCount', 2);
      expect(result).toHaveProperty('columns', ['name', 'email']);
      expect(mockPrisma.testDataFile.create).toHaveBeenCalled();
      expect(mockPrisma.testDataRow.createMany).toHaveBeenCalled();
    });

    it('should handle CSV parsing errors', async () => {
      const fileBuffer = Buffer.from('invalid,csv,content,with,errors');
      
      // Mock Papa.parse to return errors
      jest.mock('papaparse', () => ({
        parse: jest.fn().mockReturnValue({
          errors: [{ message: 'Parse error' }],
          data: [],
          meta: { fields: [] }
        })
      }));

      await expect(ddtService.uploadCSV('test.csv', fileBuffer, 'user-id', 'script-id'))
        .rejects
        .toThrow('CSV parsing error: Parse error');
    });
  });

  describe('uploadJSON', () => {
    it('should upload and parse a JSON file', async () => {
      const mockTestDataFile = {
        id: 'test-file-id',
        name: 'test',
        fileName: 'test.json',
        fileType: 'json',
        fileSize: 100,
        userId: 'user-id',
        scriptId: 'script-id',
        rowCount: 2,
        columnNames: ['name', 'email'],
        createdAt: new Date()
      };

      // Mock the Prisma calls
      mockPrisma.testDataFile.create.mockResolvedValue(mockTestDataFile);
      mockPrisma.testDataRow.createMany.mockResolvedValue({ count: 2 });

      const fileBuffer = Buffer.from('[{"name": "John", "email": "john@example.com"}, {"name": "Jane", "email": "jane@example.com"}]');
      const result = await ddtService.uploadJSON('test.json', fileBuffer, 'user-id', 'script-id');

      expect(result).toHaveProperty('file');
      expect(result).toHaveProperty('rowCount', 2);
      expect(result).toHaveProperty('columns', ['name', 'email']);
      expect(mockPrisma.testDataFile.create).toHaveBeenCalled();
      expect(mockPrisma.testDataRow.createMany).toHaveBeenCalled();
    });

    it('should handle invalid JSON', async () => {
      const fileBuffer = Buffer.from('invalid json content');
      
      await expect(ddtService.uploadJSON('test.json', fileBuffer, 'user-id', 'script-id'))
        .rejects
        .toThrow();
    });

    it('should handle empty JSON array', async () => {
      const fileBuffer = Buffer.from('[]');
      
      await expect(ddtService.uploadJSON('test.json', fileBuffer, 'user-id', 'script-id'))
        .rejects
        .toThrow('JSON array is empty');
    });
  });

  describe('getDataFiles', () => {
    it('should get all data files for a user', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          name: 'Test File 1',
          fileType: 'csv',
          rowCount: 10,
          createdAt: new Date(),
          _count: { rows: 10 }
        },
        {
          id: 'file-2',
          name: 'Test File 2',
          fileType: 'json',
          rowCount: 5,
          createdAt: new Date(),
          _count: { rows: 5 }
        }
      ];

      mockPrisma.testDataFile.findMany.mockResolvedValue(mockFiles);

      const result = await ddtService.getDataFiles('user-id');

      expect(result).toEqual(mockFiles);
      expect(mockPrisma.testDataFile.findMany).toHaveBeenCalled();
    });
  });

  describe('getDataFile', () => {
    it('should get a specific data file with its rows', async () => {
      const mockFile = {
        id: 'file-1',
        name: 'Test File',
        fileType: 'csv',
        rowCount: 2,
        columnNames: ['col1', 'col2'],
        rows: [
          { rowNumber: 1, data: { col1: 'value1', col2: 'value2' } },
          { rowNumber: 2, data: { col1: 'value3', col2: 'value4' } }
        ]
      };

      mockPrisma.testDataFile.findFirst.mockResolvedValue(mockFile);

      const result = await ddtService.getDataFile('file-1', 'user-id');

      expect(result).toEqual(mockFile);
      expect(mockPrisma.testDataFile.findFirst).toHaveBeenCalled();
    });

    it('should throw an error if file is not found', async () => {
      mockPrisma.testDataFile.findFirst.mockResolvedValue(null);

      await expect(ddtService.getDataFile('non-existent-file', 'user-id'))
        .rejects
        .toThrow('Data file not found');
    });
  });

  describe('getRows', () => {
    it('should get rows from a data file', async () => {
      const mockFile = {
        id: 'file-1',
        name: 'Test File',
        fileType: 'csv',
        rowCount: 2,
        columnNames: ['col1', 'col2']
      };

      const mockRows = [
        { rowNumber: 1, data: { col1: 'value1', col2: 'value2' } },
        { rowNumber: 2, data: { col1: 'value3', col2: 'value4' } }
      ];

      mockPrisma.testDataFile.findFirst.mockResolvedValue(mockFile);
      mockPrisma.testDataRow.findMany.mockResolvedValue(mockRows);

      const result = await ddtService.getRows('file-1', 'user-id');

      expect(result).toHaveProperty('file', mockFile);
      expect(result).toHaveProperty('rows', mockRows);
      expect(result).toHaveProperty('total', 2);
      expect(mockPrisma.testDataFile.findFirst).toHaveBeenCalled();
      expect(mockPrisma.testDataRow.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteDataFile', () => {
    it('should delete a data file', async () => {
      const mockFile = {
        id: 'file-1',
        name: 'Test File',
        userId: 'user-id'
      };

      mockPrisma.testDataFile.findFirst.mockResolvedValue(mockFile);
      mockPrisma.testDataFile.delete.mockResolvedValue({});

      const result = await ddtService.deleteDataFile('file-1', 'user-id');

      expect(result).toBe(true);
      expect(mockPrisma.testDataFile.findFirst).toHaveBeenCalled();
      expect(mockPrisma.testDataFile.delete).toHaveBeenCalled();
    });

    it('should throw an error if file is not found', async () => {
      mockPrisma.testDataFile.findFirst.mockResolvedValue(null);

      await expect(ddtService.deleteDataFile('non-existent-file', 'user-id'))
        .rejects
        .toThrow('Data file not found');
    });
  });

  describe('substituteVariables', () => {
    it('should substitute variables in a template', () => {
      const template = 'Hello ${name}, your email is ${email}';
      const data = { name: 'John', email: 'john@example.com' };

      const result = ddtService.substituteVariables(template, data);

      expect(result).toBe('Hello John, your email is john@example.com');
    });

    it('should handle missing variables', () => {
      const template = 'Hello ${name}, your age is ${age}';
      const data = { name: 'John' };

      const result = ddtService.substituteVariables(template, data);

      expect(result).toBe('Hello John, your age is ');
    });
  });

  describe('prepareDataDrivenExecution', () => {
    it('should prepare data-driven execution', async () => {
      const mockFile = {
        id: 'file-1',
        name: 'Test File',
        fileType: 'csv',
        rowCount: 2,
        columnNames: ['col1', 'col2']
      };

      const mockRows = [
        { rowNumber: 1, data: { col1: 'value1', col2: 'value2' } },
        { rowNumber: 2, data: { col1: 'value3', col2: 'value4' } }
      ];

      // Mock the getRows method
      const getRowsSpy = jest.spyOn(ddtService, 'getRows').mockResolvedValue({
        file: mockFile,
        rows: mockRows,
        total: 2
      });

      const result = await ddtService.prepareDataDrivenExecution('file-1', 'user-id');

      expect(result).toHaveProperty('fileInfo', mockFile);
      expect(result).toHaveProperty('iterations');
      expect(result.iterations).toHaveLength(2);
      expect(getRowsSpy).toHaveBeenCalledWith('file-1', 'user-id');
    });
  });
});