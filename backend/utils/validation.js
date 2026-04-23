const crypto = require('crypto');

// 1. O(1) Extension Validation using Set
// The user specified a 5MB limit which we will enforce in multer, but here we enforce allowed types.
const ALLOWED_EXTENSIONS = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
]);

const isValidExtension = (mimeType) => {
  return ALLOWED_EXTENSIONS.has(mimeType);
};

// 2. Magic Number Validation
// Checks the first few bytes of the buffer to verify file integrity
const isValidMagicNumber = (buffer, mimeType) => {
  // Get first 8 bytes as hex string
  const header = buffer.toString('hex', 0, 8).toUpperCase();

  switch (mimeType) {
    case 'image/jpeg':
      return header.startsWith('FFD8FF');
    case 'image/png':
      return header.startsWith('89504E470D0A1A0A');
    case 'image/gif':
      return header.startsWith('47494638'); // GIF8
    case 'application/pdf':
      return header.startsWith('25504446'); // %PDF
    default:
      return false;
  }
};

// 3. File Deduplication (Hashing)
// Generate SHA-256 hash of the file buffer
const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

module.exports = {
  isValidExtension,
  isValidMagicNumber,
  generateFileHash,
};
