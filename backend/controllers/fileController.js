const File = require('../models/File');
const { cloudinary } = require('../config/cloudinary');
const { isValidExtension, isValidMagicNumber, generateFileHash } = require('../utils/validation');
const streamifier = require('streamifier'); // Need to install this to pipe buffer to cloudinary

// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Public
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // 1. Validation: O(1) Extension Check
    if (!isValidExtension(mimetype)) {
      res.status(400);
      throw new Error('Invalid file extension');
    }

    // 2. Validation: Magic Number Check
    if (!isValidMagicNumber(buffer, mimetype)) {
      res.status(400);
      throw new Error('File validation failed: Magic number mismatch. File might be corrupted or spoofed.');
    }

    // 3. Validation: Hashing for Deduplication
    const fileHash = generateFileHash(buffer);
    const existingFile = await File.findOne({ hash: fileHash, user: req.user.id });

    if (existingFile) {
      // Deduplication: File exists! Link to it instead of re-uploading
      return res.status(200).json({
        success: true,
        message: 'File already exists. Linked to existing file.',
        data: existingFile,
      });
    }

    // 4. Upload to Cloudinary using stream
    // Since we use memory storage, we pipe the buffer to cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'smart-file-previewer',
        resource_type: 'auto', // Handles images, pdfs, etc.
      },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
        }

        // 5. Save to MongoDB
        try {
          const newFile = await File.create({
            user: req.user.id,
            originalName: originalname,
            fileName: result.public_id,
            mimeType: mimetype,
            cloudinaryUrl: result.secure_url,
            size,
            hash: fileHash,
          });

          res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: newFile,
          });
        } catch (dbError) {
          res.status(500).json({ success: false, message: 'Database save failed', error: dbError.message });
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);

  } catch (error) {
    // Pass to global error handler
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

// @desc    Get all uploaded files
// @route   GET /api/files
// @access  Private
const getFiles = async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadFile,
  getFiles,
};
