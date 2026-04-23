import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, File as FileIcon, Image as ImageIcon, X, CheckCircle, AlertCircle } from 'lucide-react';

const FilePreviewer = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile) => {
    setErrorMessage('');
    
    // Size Validation (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB limit.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage('Invalid file type. Only JPG, PNG, GIF, and PDF are allowed.');
      return;
    }

    setFile(selectedFile);
    
    // Generate Preview URL
    if (selectedFile.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else if (selectedFile.type === 'application/pdf') {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setUploadStatus('success');
      setTimeout(() => {
        clearFile();
        if (onUploadSuccess) onUploadSuccess(response.data.data);
      }, 2000);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to upload file.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="glass rounded-3xl p-8 transition-all duration-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Smart File Upload</h2>
        
        {!file ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group
              ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.gif,.pdf"
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-medium text-gray-700">
                Drag & Drop your file here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse (Max 5MB)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPG, PNG, GIF, PDF
              </p>
            </div>
          </div>
        ) : (
          <div className="relative border rounded-2xl p-6 bg-gray-50">
            <button
              onClick={clearFile}
              className="absolute -top-3 -right-3 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors z-10"
              disabled={uploadStatus === 'uploading'}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center space-y-4">
              {/* Preview Area */}
              <div className="w-full h-48 bg-white rounded-xl flex items-center justify-center overflow-hidden border shadow-inner">
                {file.type.startsWith('image/') && previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
                ) : file.type === 'application/pdf' && previewUrl ? (
                   <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full" title="PDF Preview" />
                ) : (
                  <FileIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* File Info */}
              <div className="text-center w-full">
                <p className="font-semibold text-gray-800 truncate px-4">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>

              {/* Action Button */}
              <button
                onClick={uploadFile}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
                className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 flex items-center justify-center space-x-2
                  ${uploadStatus === 'uploading' ? 'bg-primary/70 cursor-not-allowed' : 
                    uploadStatus === 'success' ? 'bg-green-500' : 
                    'bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5'}`}
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : uploadStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Uploaded Successfully!</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    <span>Upload to Cloudinary</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl flex items-start space-x-3 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreviewer;
