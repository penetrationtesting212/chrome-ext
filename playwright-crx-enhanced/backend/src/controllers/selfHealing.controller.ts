import { Request, Response } from 'express';
import { selfHealingService } from '../services/selfHealing/selfHealing.service';
import { AppError } from '../middleware/errorHandler';

/**
 * Record a locator failure
 */
export const recordFailure = async (req: Request, res: Response) => {
  try {
    const { scriptId, brokenLocator, validLocator } = req.body;

    if (!scriptId || !brokenLocator) {
      throw new AppError('scriptId and brokenLocator are required', 400);
    }

    const result = await selfHealingService.recordFailure(
      scriptId,
      brokenLocator,
      validLocator
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record locator failure'
    });
  }
};

/**
 * Get self-healing suggestions for a script
 */
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { scriptId } = req.params;
    const { status } = req.query;

    if (!scriptId) {
      throw new AppError('scriptId is required', 400);
    }

    const suggestions = await selfHealingService.getSuggestions(
      scriptId,
      status as string
    );

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get suggestions'
    });
  }
};

/**
 * Approve a self-healing suggestion
 */
export const approveSuggestion = async (req: Request, res: Response) => {
  try {
    const { suggestionId } = req.params;
    const _userId = (req as any).user.id; // Assuming auth middleware sets user

    if (!suggestionId) {
      throw new AppError('suggestionId is required', 400);
    }

    const result = await selfHealingService.approveSuggestion(
      suggestionId,
      _userId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to approve suggestion'
    });
  }
};

/**
 * Reject a self-healing suggestion
 */
export const rejectSuggestion = async (req: Request, res: Response) => {
  try {
    const { suggestionId } = req.params;
    const _userId = (req as any).user.id; // Assuming auth middleware sets user

    if (!suggestionId) {
      throw new AppError('suggestionId is required', 400);
    }

    const result = await selfHealingService.rejectSuggestion(
      suggestionId,
      _userId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject suggestion'
    });
  }
};

/**
 * Get locator strategies for fallback
 */
export const getLocatorStrategies = async (req: Request, res: Response) => {
  try {
    const _userId = (req as any).user.id; // Assuming auth middleware sets user

    const strategies = await selfHealingService.getLocatorStrategies(_userId);

    res.status(200).json({
      success: true,
      data: strategies
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get locator strategies'
    });
  }
};

/**
 * Update locator strategy priority
 */
export const updateStrategyPriority = async (req: Request, res: Response) => {
  try {
    const strategies = req.body.strategies;
    const _userId = (req as any).user.id; // Assuming auth middleware sets user

    if (!strategies || !Array.isArray(strategies)) {
      throw new AppError('strategies array is required', 400);
    }

    const result = await selfHealingService.updateStrategyPriority(
      _userId,
      strategies
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update strategy priority'
    });
  }
};