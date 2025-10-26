import { Request, Response } from 'express';
import { ddtService } from '../services/ddt/ddt.service';
import { AppError } from '../middleware/errorHandler';

/**
 * Upload a CSV file
 */
export const uploadCSV = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { scriptId } = req.body;
    const file = req.file;

    if (!file) {
      throw new AppError('File is required', 400);
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new AppError('Only CSV files are allowed', 400);
    }

    const result = await ddtService.uploadCSV(
      file.originalname,
      file.buffer,
      userId,
      scriptId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload CSV file'
    });
  }
};

/**
 * Upload a JSON file
 */
export const uploadJSON = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { scriptId } = req.body;
    const file = req.file;

    if (!file) {
      throw new AppError('File is required', 400);
    }

    if (file.mimetype !== 'application/json' && !file.originalname.endsWith('.json')) {
      throw new AppError('Only JSON files are allowed', 400);
    }

    const result = await ddtService.uploadJSON(
      file.originalname,
      file.buffer,
      userId,
      scriptId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload JSON file'
    });
  }
};

/**
 * Get all data files for a user or script
 */
export const getDataFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { scriptId } = req.query;

    const files = await ddtService.getDataFiles(
      userId,
      scriptId as string | undefined
    );

    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get data files'
    });
  }
};

/**
 * Get a specific data file with its rows
 */
export const getDataFile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fileId } = req.params;

    const file = await ddtService.getDataFile(
      fileId,
      userId
    );

    res.status(200).json({
      success: true,
      data: file
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get data file'
    });
  }
};

/**
 * Get rows from a data file
 */
export const getDataRows = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fileId } = req.params;
    const { limit, offset } = req.query;

    const result = await ddtService.getRows(
      fileId,
      userId,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get data rows'
    });
  }
};

/**
 * Delete a data file
 */
export const deleteDataFile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fileId } = req.params;

    const result = await ddtService.deleteDataFile(fileId, userId);

    res.status(200).json({
      success: true,
      data: { deleted: result }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete data file'
    });
  }
};

/**
 * Prepare data-driven execution
 */
export const prepareDDTExecution = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fileId } = req.params;

    const result = await ddtService.prepareDataDrivenExecution(fileId, userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to prepare DDT execution'
    });
  }
};
