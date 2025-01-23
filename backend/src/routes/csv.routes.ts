import express from 'express';
import multer from 'multer';
import { csvController } from '../controllers/csv.controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload two CSV files
router.post('/upload', upload.array('files', 2), csvController.uploadFiles);

// Compare CSV files
router.post('/compare', csvController.compareFiles);

// Export merged data
router.post('/export', csvController.exportMerged);

export const csvRoutes = router;
