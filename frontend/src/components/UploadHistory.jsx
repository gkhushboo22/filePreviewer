import React from 'react';
import { FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

const UploadHistory = ({ files, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No files uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 w-full max-w-6xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-6 px-4">Recent Uploads</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {files.map((file) => (
          <div key={file._id} className="glass rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col">
            <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden relative">
              {file.mimeType.startsWith('image/') ? (
                <img
                  src={file.cloudinaryUrl}
                  alt={file.originalName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FileText className="w-12 h-12 mb-2" />
                  <span className="text-xs font-medium uppercase tracking-wider">PDF Document</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <a
                  href={file.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white text-gray-900 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="p-4 bg-white/50 backdrop-blur-sm flex-1 flex flex-col">
              <p className="font-semibold text-gray-800 text-sm truncate mb-1" title={file.originalName}>
                {file.originalName}
              </p>
              <div className="flex justify-between items-center mt-auto pt-2">
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadHistory;
