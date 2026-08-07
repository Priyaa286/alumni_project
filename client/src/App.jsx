import React from 'react';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import NominationForm from './pages/NominationForm';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-purplebg text-slate-800">
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
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

      {/* Main Content Area */}
      <main className="flex-grow w-full py-4">
        <NominationForm />
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

export default App;
