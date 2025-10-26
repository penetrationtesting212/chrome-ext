import { Request, Response } from 'express';
import { selfHealingService } from '../services/selfHealing/selfHealing.service';
import { logger } from '../utils/logger';

export class SelfHealingController {
  async getSuggestions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { status } = req.query;
      const suggestions = await selfHealingService.getAllSuggestions(
        userId,
        status as string | undefined
      );

      res.json({ suggestions });
    } catch (error) {
      logger.error('Error getting self-healing suggestions:', error);
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  }

  async approveSuggestion(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const suggestion = await selfHealingService.approveSuggestion(id, userId);

      res.json({ success: true, suggestion });
    } catch (error: any) {
      logger.error('Error approving suggestion:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to approve suggestion' 
      });
    }
  }

  async rejectSuggestion(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const suggestion = await selfHealingService.rejectSuggestion(id, userId);

      res.json({ success: true, suggestion });
    } catch (error: any) {
      logger.error('Error rejecting suggestion:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to reject suggestion' 
      });
    }
  }

  async createDemoSuggestions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const suggestions = await selfHealingService.createDemoSuggestions(userId);

      res.json({ success: true, suggestions });
    } catch (error) {
      logger.error('Error creating demo suggestions:', error);
      res.status(500).json({ error: 'Failed to create demo suggestions' });
    }
  }

  async getStrategies(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const strategies = await selfHealingService.getLocatorStrategies(userId);

      res.json({ strategies });
    } catch (error) {
      logger.error('Error getting locator strategies:', error);
      res.status(500).json({ error: 'Failed to get strategies' });
    }
  }

  async updateStrategies(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { strategies } = req.body;
      if (!Array.isArray(strategies)) {
        return res.status(400).json({ error: 'Invalid strategies format' });
      }

      const updated = await selfHealingService.updateStrategyPriority(userId, strategies);

      res.json({ success: true, strategies: updated });
    } catch (error) {
      logger.error('Error updating strategies:', error);
      res.status(500).json({ error: 'Failed to update strategies' });
    }
  }
}

export const selfHealingController = new SelfHealingController();
