import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthUser } from './store/authSlice.js';

// Page imports
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProfileManager from './pages/ProfileManager.jsx';
import ResumeEditor from './pages/ResumeEditor.jsx';
import AIHub from './pages/AIHub.jsx';
import JobAnalyzer from './pages/JobAnalyzer.jsx';
import CompareResumes from './pages/CompareResumes.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, loading } = useSelector((state) => state.auth);
  
  if (loading && !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/portfolio/:username" element={<PortfolioPage />} />

        {/* Protected Client Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileManager />
          </ProtectedRoute>
        } />

        <Route path="/editor/:id" element={
          <ProtectedRoute>
            <ResumeEditor />
          </ProtectedRoute>
        } />

        <Route path="/ai-hub" element={
          <ProtectedRoute>
            <AIHub />
          </ProtectedRoute>
        } />

        <Route path="/job-analyzer" element={
          <ProtectedRoute>
            <JobAnalyzer />
          </ProtectedRoute>
        } />

        <Route path="/compare" element={
          <ProtectedRoute>
            <CompareResumes />
          </ProtectedRoute>
        } />

        {/* Protected Administrative Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={
          <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white px-4">
            <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">404</h1>
            <h2 className="mt-4 text-2xl font-bold">Page Not Found</h2>
            <p className="mt-2 text-slate-400 text-center max-w-md">The page you are looking for does not exist or has been relocated to another domain.</p>
            <a href="/" className="mt-6 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors">
              Return Home
            </a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
