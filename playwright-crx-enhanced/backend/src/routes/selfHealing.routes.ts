import { Router } from 'express';
import { selfHealingController } from '../controllers/selfHealing.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get all suggestions for the authenticated user
router.get('/suggestions', authMiddleware, (req, res) => selfHealingController.getSuggestions(req, res));

// Approve a suggestion
router.post('/suggestions/:id/approve', authMiddleware, (req, res) => selfHealingController.approveSuggestion(req, res));

// Reject a suggestion
router.post('/suggestions/:id/reject', authMiddleware, (req, res) => selfHealingController.rejectSuggestion(req, res));

// Create demo suggestions for testing
router.post('/suggestions/demo', authMiddleware, (req, res) => selfHealingController.createDemoSuggestions(req, res));

// Get locator strategies
router.get('/strategies', authMiddleware, (req, res) => selfHealingController.getStrategies(req, res));

// Update locator strategies
router.put('/strategies', authMiddleware, (req, res) => selfHealingController.updateStrategies(req, res));

export default router;
