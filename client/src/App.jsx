import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NominationForm from './pages/NominationForm';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-purplebg flex flex-col font-sans">
        {/* Main Header Banner */}
        <Header />
        
        {/* Router Pages Wrapper */}
        <main className="flex-1 w-full max-w-7xl mx-auto py-6">
          <Routes>
            <Route path="/" element={<NominationForm />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </main>
        
        {/* Footer info */}
        <footer className="w-full text-center py-6 text-xs text-gray-400 border-t border-primary/5 bg-white/20 backdrop-blur-sm print:hidden">
          &copy; {new Date().getFullYear()} National Engineering College Alumni Association. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
