const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadFile, getFiles } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

// Route to get all files
router.get('/', protect, getFiles);

// Route to upload a file (uses multer upload middleware for single file 'file')
router.post('/upload', protect, upload.single('file'), uploadFile);

module.exports = router;
