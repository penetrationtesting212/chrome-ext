import * as Papa from 'papaparse';
import { logger } from '../../utils/logger';
import pool from '../../db';

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

      const fileId = crypto.randomUUID?.() ?? require('crypto').randomUUID();
      const { rows: fileRows } = await pool.query(
        `INSERT INTO "TestDataFile" (id, name, "fileName", "fileType", "fileSize", "userId", "scriptId", "rowCount", "columnNames", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 'csv', $4, $5, $6, $7, $8, now(), now())
         RETURNING *`,
        [fileId, fileName.replace(/\.csv$/i, ''), fileName, fileBuffer.length, userId, scriptId ?? null, rows.length, JSON.stringify(columnNames)]
      );
      const testDataFile = fileRows[0];

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (let i = 0; i < rows.length; i++) {
          await client.query(
            `INSERT INTO "TestDataRow" (id, "fileId", "rowNumber", data, "createdAt")
             VALUES ($1, $2, $3, $4::jsonb, now())`,
            [require('crypto').randomUUID(), testDataFile.id, i + 1, JSON.stringify(rows[i])]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }

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

      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects');
      }
      if (data.length === 0) {
        throw new Error('JSON array is empty');
      }

      const columnNames = Object.keys(data[0]);

      const fileId = crypto.randomUUID?.() ?? require('crypto').randomUUID();
      const { rows: fileRows } = await pool.query(
        `INSERT INTO "TestDataFile" (id, name, "fileName", "fileType", "fileSize", "userId", "scriptId", "rowCount", "columnNames", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 'json', $4, $5, $6, $7, $8, now(), now())
         RETURNING *`,
        [fileId, fileName.replace(/\.json$/i, ''), fileName, fileBuffer.length, userId, scriptId ?? null, data.length, JSON.stringify(columnNames)]
      );
      const testDataFile = fileRows[0];

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (let i = 0; i < data.length; i++) {
          await client.query(
            `INSERT INTO "TestDataRow" (id, "fileId", "rowNumber", data, "createdAt")
             VALUES ($1, $2, $3, $4::jsonb, now())`,
            [require('crypto').randomUUID(), testDataFile.id, i + 1, JSON.stringify(data[i])]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }

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

  async getDataFiles(userId: string, scriptId?: string) {
    try {
      const params: any[] = [userId];
      let where = 'WHERE "userId" = $1';
      if (scriptId) { where += ' AND "scriptId" = $2'; params.push(scriptId); }

      const { rows } = await pool.query(
        `SELECT tdf.*, (SELECT COUNT(*) FROM "TestDataRow" r WHERE r."fileId" = tdf.id) AS rows_count
         FROM "TestDataFile" tdf
         ${where}
         ORDER BY tdf."createdAt" DESC`, params
      );
      return rows.map(r => ({ ...r, _count: { rows: Number(r.rows_count) } }));
    } catch (error) {
      logger.error('Error getting data files:', error);
      throw error;
    }
  }

  async getDataFile(fileId: string, userId: string) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM "TestDataFile" WHERE id = $1 AND "userId" = $2`,
        [fileId, userId]
      );
      const file = rows[0];
      if (!file) throw new Error('Data file not found');

      const rowsRes = await pool.query(
        `SELECT "rowNumber", data FROM "TestDataRow" WHERE "fileId" = $1 ORDER BY "rowNumber" ASC`,
        [fileId]
      );

      return { ...file, rows: rowsRes.rows };
    } catch (error) {
      logger.error('Error getting data file:', error);
      throw error;
    }
  }

  async getRows(fileId: string, userId: string, limit?: number, offset?: number) {
    try {
      const fileRes = await pool.query(
        `SELECT id, name, "fileType", "rowCount", "columnNames" FROM "TestDataFile" WHERE id = $1 AND "userId" = $2`,
        [fileId, userId]
      );
      const file = fileRes.rows[0];
      if (!file) throw new Error('Data file not found');

      const rowsRes = await pool.query(
        `SELECT "rowNumber", data FROM "TestDataRow" WHERE "fileId" = $1 ORDER BY "rowNumber" ASC ${limit ? 'LIMIT ' + Number(limit) : ''} ${offset ? 'OFFSET ' + Number(offset) : ''}`,
        [fileId]
      );

      return {
        file: {
          id: file.id,
          name: file.name,
          fileType: file.fileType,
          rowCount: file.rowCount,
          columnNames: file.columnNames
        },
        rows: rowsRes.rows.map(r => ({ rowNumber: r.rowNumber, data: r.data })),
        total: file.rowCount
      };
    } catch (error) {
      logger.error('Error getting rows:', error);
      throw error;
    }
  }

  async deleteDataFile(fileId: string, userId: string) {
    try {
      const fileRes = await pool.query(
        `SELECT id FROM "TestDataFile" WHERE id = $1 AND "userId" = $2`,
        [fileId, userId]
      );
      if (!fileRes.rowCount) throw new Error('Data file not found');

      await pool.query(`DELETE FROM "TestDataFile" WHERE id = $1`, [fileId]);
      logger.info(`Data file deleted: ${fileId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting data file:', error);
      throw error;
    }
  }

  substituteVariables(template: string, data: Record<string, any>): string {
    let result = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(regex, String(data[key] || ''));
    });
    return result;
  }

  async prepareDataDrivenExecution(fileId: string, userId: string) {
    try {
      const { rows, file } = await this.getRows(fileId, userId) as any;
      return {
        fileInfo: file,
        iterations: rows.map((r: any) => ({ iteration: r.rowNumber, variables: r.data }))
      };
    } catch (error) {
      logger.error('Error preparing DDT execution:', error);
      throw error;
    }
  }
}

export const ddtService = new DDTService();

