import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { allureService } from '../services/allure.service';

const prisma = new PrismaClient();

/**
 * Get all test runs for a user
 */
export const getTestRuns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const testRuns = await prisma.testRun.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        script: {
          select: {
            name: true
          }
        },
        steps: {
          orderBy: {
            stepNumber: 'asc'
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: testRuns
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get test runs'
    });
  }
};

/**
 * Get a specific test run
 */
export const getTestRun = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const testRun = await prisma.testRun.findFirst({
      where: {
        id,
        userId
      },
      include: {
        script: {
          select: {
            name: true,
            language: true
          }
        },
        steps: {
          orderBy: {
            stepNumber: 'asc'
          }
        }
      }
    });

    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }

    res.status(200).json({
      success: true,
      data: testRun
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
        error: error.message || 'Failed to get test run'
      });
    }
  }
};

/**
 * Start a new test run
 */
export const startTestRun = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { scriptId, dataFileId: _dataFileId, environment, browser } = req.body;

    // Validate required fields
    if (!scriptId) {
      throw new AppError('Script ID is required', 400);
    }

    // Check if script exists and belongs to user
    const script = await prisma.script.findFirst({
      where: {
        id: scriptId,
        userId
      }
    });

    if (!script) {
      throw new AppError('Script not found', 404);
    }

    // Create test run record
    const testRun = await prisma.testRun.create({
      data: {
        scriptId,
        userId,
        status: 'queued',
        environment: environment || 'development',
        browser: browser || 'chromium'
      },
      include: {
        script: true
      }
    });

    // Initialize Allure test recording
    try {
      await allureService.startTest(testRun.id, script.name);
    } catch (error) {
      console.error('Failed to start Allure test:', error);
    }

    // Simulate test execution with mock steps for demonstration
    // In a real implementation, the extension or test runner would provide actual steps
    setTimeout(async () => {
      try {
        // Simulate some test steps
        const mockSteps = [
          { action: 'Navigate to page', status: 'passed' as const, duration: 500 },
          { action: 'Fill input field', status: 'passed' as const, duration: 300 },
          { action: 'Click submit button', status: 'passed' as const, duration: 200 },
          { action: 'Verify success message', status: 'passed' as const, duration: 150 }
        ];

        for (const step of mockSteps) {
          await allureService.recordStep(testRun.id, step.action, step.status, step.duration);
        }

        // End the test successfully
        await allureService.endTest(testRun.id, 'passed');

        // Update test run status to completed
        await prisma.testRun.update({
          where: { id: testRun.id },
          data: {
            status: 'passed',
            completedAt: new Date(),
            duration: mockSteps.reduce((sum, s) => sum + (s.duration || 0), 0)
          }
        });
      } catch (error) {
        console.error('Failed to complete mock test execution:', error);
      }
    }, 2000); // Simulate 2-second execution delay

    res.status(201).json({
      success: true,
      data: testRun
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
        error: error.message || 'Failed to start test run'
      });
    }
  }
};

/**
 * Stop a test run
 */
export const stopTestRun = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // Check if test run exists and belongs to user
    const testRun = await prisma.testRun.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }

    // Update test run status
    const updatedTestRun = await prisma.testRun.update({
      where: { id },
      data: {
        status: 'cancelled',
        completedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      data: updatedTestRun
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
        error: error.message || 'Failed to stop test run'
      });
    }
  }
};

/**
 * Get active test runs
 */
export const getActiveTestRuns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    // Since we don't have a proper active test runs tracking mechanism,
    // we'll return an empty array for now
    // In a real implementation, this would query active test runs
    
    const activeRuns = await prisma.testRun.findMany({
      where: { 
        userId,
        status: {
          in: ['running', 'queued']
        }
      },
      orderBy: { startedAt: 'desc' },
      include: {
        script: {
          select: {
            name: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: activeRuns
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get active test runs'
    });
  }
};

/**
 * Update test run status and complete
 */
export const updateTestRun = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { status, errorMsg, duration, steps } = req.body;

    // Check if test run exists and belongs to user
    const testRun = await prisma.testRun.findFirst({
      where: {
        id,
        userId
      },
      include: {
        script: true
      }
    });

    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }

    // Record steps to Allure if provided
    if (steps && Array.isArray(steps)) {
      for (const step of steps) {
        try {
          await allureService.recordStep(
            id,
            step.action || step.name || 'Step',
            step.status || 'passed',
            step.duration
          );
        } catch (error) {
          console.error('Failed to record Allure step:', error);
        }
      }
    }

    // End Allure test with final status
    if (status && ['passed', 'failed', 'error'].includes(status)) {
      try {
        await allureService.endTest(
          id,
          status === 'error' ? 'broken' : status,
          errorMsg
        );
      } catch (error) {
        console.error('Failed to end Allure test:', error);
      }
    }

    // Update test run in database
    const updatedTestRun = await prisma.testRun.update({
      where: { id },
      data: {
        status,
        errorMsg: errorMsg || null,
        duration: duration || null,
        completedAt: ['passed', 'failed', 'error', 'cancelled'].includes(status) ? new Date() : undefined
      },
      include: {
        script: true,
        steps: true
      }
    });

    res.status(200).json({
      success: true,
      data: updatedTestRun
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
        error: error.message || 'Failed to update test run'
      });
    }
  }
};

/**
 * Report a test result (create completed TestRun)
 */
export const reportTestResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      testName,
      status,
      duration,
      errorMsg,
      browser,
      environment,
      traceUrl,
      videoUrl,
      screenshotUrls
    } = req.body;

    if (!testName || !status) {
      throw new AppError('testName and status are required', 400);
    }

    // Find or create a script entry to associate with the run
    let script = await prisma.script.findFirst({
      where: { userId, name: testName }
    });

    if (!script) {
      script = await prisma.script.create({
        data: {
          name: testName,
          description: 'Auto-created from Playwright reporter',
          language: 'typescript',
          code: '// Recorded by Playwright reporter',
          userId
        }
      });
    }

    const testRun = await prisma.testRun.create({
      data: {
        scriptId: script.id,
        userId,
        status,
        duration: duration ?? null,
        errorMsg: errorMsg ?? null,
        environment: environment || 'development',
        browser: browser || 'msedge',
        traceUrl: traceUrl ?? null,
        videoUrl: videoUrl ?? null,
        screenshotUrls: screenshotUrls ?? null,
        completedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      data: testRun
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to report test result' });
    }
  }
};