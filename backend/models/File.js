const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  hash: {
    type: String,
    required: true,
    unique: true, // Used for fast deduplication lookup
  },
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
