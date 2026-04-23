import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import FilePreviewer from './components/FilePreviewer';
import UploadHistory from './components/UploadHistory';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthContext } from './context/AuthContext';
import { Layers, LogOut } from 'lucide-react';

function MainApp() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/files`);
      setFiles(response.data.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUploadSuccess = (newFile) => {
    setFiles((prev) => {
      const exists = prev.find(f => f.hash === newFile.hash);
      if (exists) return prev;
      return [newFile, ...prev];
    });
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-primary to-blue-400 rounded-lg text-white shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Smart File Previewer
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500">
              Welcome, {user?.name}
            </span>
            <button 
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 mt-8">
        <FilePreviewer onUploadSuccess={handleUploadSuccess} />
        
        <div className="mt-16 border-t border-gray-200/50 pt-8">
          <UploadHistory files={files} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
