import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const handshake = async (req: Request, res: Response) => {
  try {
    const { extensionVersion, browserInfo } = req.body;
    logger.info('Extension handshake received', { extensionVersion, browserInfo });
    
    res.json({
      success: true,
      serverVersion: '1.0.0',
      capabilities: {
        selfHealing: true,
        dataDriverTesting: true,
        testExecution: true,
        scriptStorage: true,
      },
      config: {
        maxFileSize: 10485760,
        supportedLanguages: ['typescript', 'javascript', 'python', 'java', 'csharp', 'robot'],
      },
    });
  } catch (error) {
    logger.error('Handshake error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const heartbeat = async (req: Request, res: Response) => {
  try {
    const { timestamp, status } = req.body;
    logger.debug('Extension heartbeat', { timestamp, status });
    
    res.json({
      success: true,
      serverTime: new Date().toISOString(),
      serverStatus: 'healthy',
    });
  } catch (error) {
    logger.error('Heartbeat error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const saveScriptFromExtension = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, description, language, code, browserType } = req.body;

    const script = await prisma.script.create({
      data: {
        userId,
        name,
        description,
        language,
        code,
        browserType: browserType || 'chromium',
      },
    });

    logger.info('Script saved from extension', { scriptId: script.id, userId });
    res.json({ success: true, script });
  } catch (error) {
    logger.error('Save script error:', error);
    res.status(500).json({ success: false, error: 'Failed to save script' });
  }
};

export const getConfigForExtension = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      config: {
        supportedLanguages: [
          { id: 'typescript', name: 'TypeScript', extension: '.ts' },
          { id: 'javascript', name: 'JavaScript', extension: '.js' },
          { id: 'python', name: 'Python', extension: '.py' },
          { id: 'java', name: 'Java', extension: '.java' },
          { id: 'java-junit', name: 'Java (JUnit)', extension: '.java' },
          { id: 'csharp', name: 'C#', extension: '.cs' },
          { id: 'robot', name: 'Robot Framework', extension: '.robot' },
        ],
        defaultLanguage: 'typescript',
        testIdAttribute: 'data-testid',
        browserTypes: ['chromium', 'firefox', 'webkit'],
        maxFileSize: 10485760,
      },
    });
  } catch (error) {
    logger.error('Get config error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const postExtensionLogs = async (req: Request, res: Response) => {
  try {
    const { level, message, metadata } = req.body;
    logger.log(level || 'info', `[Extension] ${message}`, metadata);
    res.json({ success: true });
  } catch (error) {
    logger.error('Log error:', error);
    res.status(500).json({ success: false, error: 'Failed to log message' });
  }
};