import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import Login from './pages/Login';
import NominationForm from './pages/NominationForm';
import AdminResponses from './pages/AdminResponses';
import NomineeVerification from './pages/NomineeVerification';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-purplebg text-slate-800">
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Official Header */}
      <Header />

      {/* Main Content Area with Client Routing */}
      <main className="flex-grow w-full py-4">
        <Routes>
          {/* Public Nomination Form Route (Default landing page) */}
          <Route path="/" element={<NominationForm />} />
          <Route path="/nomination" element={<NominationForm />} />

          {/* Public Leaderboard Route */}
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Admin Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Dashboard Route (Protected - Admin Only) */}
          <Route
            path="/admin/responses"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminResponses />
              </ProtectedRoute>
            }
          />

          {/* Nominee Document Verification & Approval Route (Protected - Admin Only) */}
          <Route
            path="/admin/verify/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <NomineeVerification />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect to Nomination Form */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer Details */}
      <footer className="w-full bg-slate-900 text-slate-400 py-6 text-center border-t border-slate-800 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300">
            © {new Date().getFullYear()} National Engineering College Alumni Association. All Rights Reserved.
          </p>
          <p className="text-slate-500 font-medium">
            K.R. Nagar, Kovilpatti, Tamil Nadu - 628 503 | Designed with Purple & Lavender aesthetics.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
