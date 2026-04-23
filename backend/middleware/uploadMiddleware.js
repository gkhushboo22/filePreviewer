const multer = require('multer');

// Configure Multer to use memory storage
// This is required so we have access to the file buffer for hashing and magic number validation
const storage = multer.memoryStorage();

// File upload middleware with 5MB limit (as requested by user)
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

module.exports = upload;
