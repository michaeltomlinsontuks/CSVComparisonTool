import express from 'express';
import multer from 'multer';
import { csvController } from '../controllers/csv.controller';

const router = express.Router();

// Configure multer to store files with their original names
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({ storage });

// Upload two CSV files
router.post('/upload', upload.array('files', 2), csvController.uploadFiles);

// Compare CSV files
router.post('/compare', csvController.compareFiles);

// Approve changes
router.post('/approve', csvController.approveChanges);

// Approve all changes
router.post('/approve-all', csvController.approveAll);

// Delete rows
router.post('/delete', csvController.deleteRows);

// Export data
router.post('/export', csvController.exportData);

export const csvRoutes = router;
