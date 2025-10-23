import { Router } from 'express';
import {
  recordFailure,
  getSuggestions,
  approveSuggestion,
  rejectSuggestion,
  getLocatorStrategies,
  updateStrategyPriority
} from '../controllers/selfHealing.controller';

const router = Router();

// Record a locator failure
router.post('/record-failure', recordFailure);

// Get self-healing suggestions for a script
router.get('/suggestions/:scriptId', getSuggestions);

// Approve a self-healing suggestion
router.put('/approve/:suggestionId', approveSuggestion);

// Reject a self-healing suggestion
router.put('/reject/:suggestionId', rejectSuggestion);

// Get locator strategies for fallback
router.get('/strategies', getLocatorStrategies);

// Update locator strategy priority
router.put('/strategies', updateStrategyPriority);

export default router;
