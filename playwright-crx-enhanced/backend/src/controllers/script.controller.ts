import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Get all scripts for a user
 */
export const getScripts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const scripts = await prisma.script.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        language: true,
        browserType: true,
        createdAt: true,
        updatedAt: true,
        projectId: true,
        project: {
          select: {
            name: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: scripts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get scripts'
    });
  }
};

/**
 * Get a specific script
 */
export const getScript = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const script = await prisma.script.findFirst({
      where: {
        id,
        userId
      },
      select: {
        id: true,
        name: true,
        description: true,
        language: true,
        code: true,
        browserType: true,
        viewport: true,
        testIdAttribute: true,
        selfHealingEnabled: true,
        createdAt: true,
        updatedAt: true,
        projectId: true,
        project: {
          select: {
            name: true
          }
        }
      }
    });

    if (!script) {
      throw new AppError('Script not found', 404);
    }

    res.status(200).json({
      success: true,
      data: script
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get script'
      });
    }
  }
};

/**
 * Create a new script
 */
export const createScript = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description, language, code, projectId } = req.body;

    // Validate required fields
    if (!name || !code) {
      throw new AppError('Name and code are required', 400);
    }

    const script = await prisma.script.create({
      data: {
        name,
        description,
        language: language || 'typescript',
        code,
        userId,
        projectId
      },
      select: {
        id: true,
        name: true,
        description: true,
        language: true,
        code: true,
        browserType: true,
        viewport: true,
        testIdAttribute: true,
        selfHealingEnabled: true,
        createdAt: true,
        updatedAt: true,
        projectId: true
      }
    });

    res.status(201).json({
      success: true,
      data: script
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create script'
      });
    }
  }
};

/**
 * Update a script
 */
export const updateScript = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { name, description, language, code, browserType, viewport, testIdAttribute, selfHealingEnabled } = req.body;

    // Check if script exists and belongs to user
    const existingScript = await prisma.script.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingScript) {
      throw new AppError('Script not found', 404);
    }

    const script = await prisma.script.update({
      where: { id },
      data: {
        name,
        description,
        language,
        code,
        browserType,
        viewport,
        testIdAttribute,
        selfHealingEnabled
      },
      select: {
        id: true,
        name: true,
        description: true,
        language: true,
        code: true,
        browserType: true,
        viewport: true,
        testIdAttribute: true,
        selfHealingEnabled: true,
        createdAt: true,
        updatedAt: true,
        projectId: true
      }
    });

    res.status(200).json({
      success: true,
      data: script
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update script'
      });
    }
  }
};

/**
 * Delete a script
 */
export const deleteScript = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // Check if script exists and belongs to user
    const existingScript = await prisma.script.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingScript) {
      throw new AppError('Script not found', 404);
    }

    await prisma.script.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Script deleted successfully'
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete script'
      });
    }
  }
};