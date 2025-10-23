import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  uploadCSV,
  uploadJSON,
  getDataFiles,
  getDataFile,
  getDataRows,
  deleteDataFile,
  prepareDDTExecution
} from '../controllers/ddt.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload CSV file
router.post('/upload/csv', authMiddleware, upload.single('file'), uploadCSV);

// Upload JSON file
router.post('/upload/json', authMiddleware, upload.single('file'), uploadJSON);

// Get all data files for a user or script
router.get('/files', authMiddleware, getDataFiles);

// Get a specific data file
router.get('/files/:fileId', authMiddleware, getDataFile);

// Get rows from a data file
router.get('/rows/:fileId', authMiddleware, getDataRows);

// Delete a data file
router.delete('/files/:fileId', authMiddleware, deleteDataFile);

// Prepare data-driven execution
router.get('/execute/:fileId', authMiddleware, prepareDDTExecution);

export default router;
