import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getScripts,
  getScript,
  createScript,
  updateScript,
  deleteScript
} from '../controllers/script.controller';

const router = Router();

// Get all scripts for a user
router.get('/', authMiddleware, getScripts);

// Get a specific script
router.get('/:id', authMiddleware, getScript);

// Create a new script
router.post('/', authMiddleware, createScript);

// Update a script
router.put('/:id', authMiddleware, updateScript);

// Delete a script
router.delete('/:id', authMiddleware, deleteScript);

export default router;
