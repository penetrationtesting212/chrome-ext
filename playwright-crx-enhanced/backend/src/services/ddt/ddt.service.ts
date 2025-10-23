import { PrismaClient } from '@prisma/client';
import * as Papa from 'papaparse';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, any>;
}

export class DDTService {
  /**
   * Upload and parse a CSV file
   */
  async uploadCSV(
    fileName: string,
    fileBuffer: Buffer,
    userId: string,
    scriptId?: string
  ) {
    try {
      const text = fileBuffer.toString('utf-8');
      
      // Parse CSV
      const parseResult = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      }) as any;

      if (parseResult.errors.length > 0) {
        throw new Error(`CSV parsing error: ${parseResult.errors[0].message}`);
      }

      const rows = parseResult.data as Array<Record<string, string>>;
      const columnNames = parseResult.meta.fields || [];

      // Create test data file
      const testDataFile = await prisma.testDataFile.create({
        data: {
          name: fileName.replace(/\.csv$/i, ''),
          fileName,
          fileType: 'csv',
          fileSize: fileBuffer.length,
          userId,
          scriptId,
          rowCount: rows.length,
          columnNames: columnNames
        }
      });

      // Create rows
      const rowsToCreate = rows.map((row, index) => ({
        fileId: testDataFile.id,
        rowNumber: index + 1,
        data: row
      }));

      await prisma.testDataRow.createMany({
        data: rowsToCreate
      });

      logger.info(`CSV file uploaded: ${fileName} (${rows.length} rows)`);

      return {
        file: testDataFile,
        rowCount: rows.length,
        columns: columnNames
      };
    } catch (error) {
      logger.error('Error uploading CSV:', error);
      throw error;
    }
  }

  /**
   * Upload and parse a JSON file
   */
  async uploadJSON(
    fileName: string,
    fileBuffer: Buffer,
    userId: string,
    scriptId?: string
  ) {
    try {
      const text = fileBuffer.toString('utf-8');
      const data = JSON.parse(text);

      // Validate JSON structure (should be an array)
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects');
      }

      if (data.length === 0) {
        throw new Error('JSON array is empty');
      }

      // Extract column names from first object
      const columnNames = Object.keys(data[0]);

      // Create test data file
      const testDataFile = await prisma.testDataFile.create({
        data: {
          name: fileName.replace(/\.json$/i, ''),
          fileName,
          fileType: 'json',
          fileSize: fileBuffer.length,
          userId,
          scriptId,
          rowCount: data.length,
          columnNames: columnNames
        }
      });

      // Create rows
      const rowsToCreate = data.map((row, index) => ({
        fileId: testDataFile.id,
        rowNumber: index + 1,
        data: row
      }));

      await prisma.testDataRow.createMany({
        data: rowsToCreate
      });

      logger.info(`JSON file uploaded: ${fileName} (${data.length} rows)`);

      return {
        file: testDataFile,
        rowCount: data.length,
        columns: columnNames
      };
    } catch (error) {
      logger.error('Error uploading JSON:', error);
      throw error;
    }
  }

  /**
   * Get all data files for a user or script
   */
  async getDataFiles(userId: string, scriptId?: string) {
    try {
      const where: any = { userId };
      
      if (scriptId) {
        where.scriptId = scriptId;
      }

      const files = await prisma.testDataFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { rows: true }
          }
        }
      });

      return files;
    } catch (error) {
      logger.error('Error getting data files:', error);
      throw error;
    }
  }

  /**
   * Get a specific data file with its rows
   */
  async getDataFile(fileId: string, userId: string) {
    try {
      const file = await prisma.testDataFile.findFirst({
        where: { id: fileId, userId },
        include: {
          rows: {
            orderBy: { rowNumber: 'asc' }
          }
        }
      });

      if (!file) {
        throw new Error('Data file not found');
      }

      return file;
    } catch (error) {
      logger.error('Error getting data file:', error);
      throw error;
    }
  }

  /**
   * Get rows from a data file
   */
  async getRows(fileId: string, userId: string, limit?: number, offset?: number) {
    try {
      // Verify user owns the file
      const file = await prisma.testDataFile.findFirst({
        where: { id: fileId, userId }
      });

      if (!file) {
        throw new Error('Data file not found');
      }

      const rows = await prisma.testDataRow.findMany({
        where: { fileId },
        orderBy: { rowNumber: 'asc' },
        take: limit,
        skip: offset
      });

      return {
        file: {
          id: file.id,
          name: file.name,
          fileType: file.fileType,
          rowCount: file.rowCount,
          columnNames: file.columnNames
        },
        rows: rows.map((r: any) => ({
          rowNumber: r.rowNumber,
          data: r.data
        })),
        total: file.rowCount
      };
    } catch (error) {
      logger.error('Error getting rows:', error);
      throw error;
    }
  }

  /**
   * Delete a data file
   */
  async deleteDataFile(fileId: string, userId: string) {
    try {
      // Verify user owns the file
      const file = await prisma.testDataFile.findFirst({
        where: { id: fileId, userId }
      });

      if (!file) {
        throw new Error('Data file not found');
      }

      // Delete file (cascade will delete rows)
      await prisma.testDataFile.delete({
        where: { id: fileId }
      });

      logger.info(`Data file deleted: ${fileId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting data file:', error);
      throw error;
    }
  }

  /**
   * Bind variables to test data
   * Used during test execution to replace ${variable} with actual data
   */
  substituteVariables(template: string, data: Record<string, any>): string {
    let result = template;

    // Replace ${variableName} with actual values
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(regex, String(data[key] || ''));
    });

    return result;
  }

  /**
   * Execute test with data-driven approach
   * Returns all rows for iteration
   */
  async prepareDataDrivenExecution(fileId: string, userId: string) {
    try {
      const { rows, file } = await this.getRows(fileId, userId);

      return {
        fileInfo: file,
        iterations: rows.map((r: any) => ({
          iteration: r.rowNumber,
          variables: r.data
        }))
      };
    } catch (error) {
      logger.error('Error preparing DDT execution:', error);
      throw error;
    }
  }
}

export const ddtService = new DDTService();
