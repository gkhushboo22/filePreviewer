import React, { useState, useMemo } from 'react';
import { FileText, Image as ImageIcon, ExternalLink, ArrowUpDown, Filter, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'All Files', icon: '📁' },
  { key: 'image', label: 'Images', icon: '🖼️' },
  { key: 'pdf', label: 'PDFs', icon: '📄' },
  { key: 'video', label: 'Videos', icon: '🎬' },
  { key: 'audio', label: 'Audio', icon: '🎵' },
  { key: 'other', label: 'Other', icon: '📎' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'size-asc', label: 'Size: Small → Large' },
  { key: 'size-desc', label: 'Size: Large → Small' },
  { key: 'name-asc', label: 'Name: A → Z' },
  { key: 'name-desc', label: 'Name: Z → A' },
];

function getFileCategory(mimeType) {
  if (!mimeType) return 'other';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'other';
}

function getFileIcon(mimeType) {
  const category = getFileCategory(mimeType);
  switch (category) {
    case 'image': return <ImageIcon className="w-12 h-12 mb-2" />;
    case 'pdf': return <FileText className="w-12 h-12 mb-2" />;
    case 'video': return <span className="text-4xl mb-2">🎬</span>;
    case 'audio': return <span className="text-4xl mb-2">🎵</span>;
    default: return <FileText className="w-12 h-12 mb-2" />;
  }
}

function getFileLabel(mimeType) {
  const category = getFileCategory(mimeType);
  switch (category) {
    case 'image': return 'Image';
    case 'pdf': return 'PDF Document';
    case 'video': return 'Video';
    case 'audio': return 'Audio';
    default: return mimeType?.split('/')[1]?.toUpperCase() || 'File';
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const UploadHistory = ({ files, isLoading }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Compute category counts for the filter pills
  const categoryCounts = useMemo(() => {
    if (!files) return {};
    const counts = { all: files.length };
    files.forEach((file) => {
      const cat = getFileCategory(file.mimeType);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [files]);

  // Filter and sort files
  const processedFiles = useMemo(() => {
    if (!files) return [];

    let result = [...files];

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((f) => getFileCategory(f.mimeType) === activeCategory);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'size-asc': return a.size - b.size;
        case 'size-desc': return b.size - a.size;
        case 'name-asc': return a.originalName.localeCompare(b.originalName);
        case 'name-desc': return b.originalName.localeCompare(a.originalName);
        default: return 0;
      }
    });

    return result;
  }, [files, activeCategory, sortBy]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-4 gap-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
          Recent Uploads
          <span className="text-sm font-normal text-gray-400 ml-1">({files.length})</span>
        </h3>

        {/* Sort Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer appearance-none pr-4"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 px-4 mb-6">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.key] || 0;
          if (cat.key !== 'all' && count === 0) return null;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              id={`filter-${cat.key}`}
              onClick={() => setActiveCategory(cat.key)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300 border
                ${isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg shadow-indigo-500/25 scale-105'
                  : 'bg-white/60 text-gray-600 border-gray-200 hover:bg-white hover:border-indigo-300 hover:text-indigo-600'
                }
              `}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`
                ml-1 text-xs px-1.5 py-0.5 rounded-full
                ${isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results count when filtered */}
      {activeCategory !== 'all' && (
        <div className="px-4 mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          Showing {processedFiles.length} {processedFiles.length === 1 ? 'file' : 'files'} in{' '}
          <span className="font-semibold text-gray-700">
            {CATEGORIES.find((c) => c.key === activeCategory)?.label}
          </span>
          <button
            onClick={() => setActiveCategory('all')}
            className="ml-2 text-indigo-500 hover:text-indigo-700 underline underline-offset-2 font-medium transition-colors"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* File Grid */}
      {processedFiles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No files match the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {processedFiles.map((file) => (
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
                    {getFileIcon(file.mimeType)}
                    <span className="text-xs font-medium uppercase tracking-wider">{getFileLabel(file.mimeType)}</span>
                  </div>
                )}

                {/* Category badge */}
                <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-lg bg-black/50 text-white backdrop-blur-sm">
                  {CATEGORIES.find((c) => c.key === getFileCategory(file.mimeType))?.icon}{' '}
                  {getFileLabel(file.mimeType)}
                </span>

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
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadHistory;
