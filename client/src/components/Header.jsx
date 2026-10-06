import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileText, Trophy } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication & admin status
  const isLoggedIn = Boolean(isAuthenticated && user);
  const isAdmin = isLoggedIn && user?.role === 'admin';
  const isFormPage = ['/nomination', '/admin/create-nomination'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully.');
    navigate('/login');
  };

  return (
    <header className="w-full glass-panel sticky top-0 z-50 py-3 shadow-premium border-b border-borderlight bg-white/95 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: National Engineering College Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-1 bg-white/80 rounded-xl shadow-sm border border-primary/10">
            <img
              src="/nec-logo.png"
              alt="National Engineering College Logo"
              className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-heading font-extrabold text-base md:text-lg text-primary tracking-tight leading-tight">
              NATIONAL ENGINEERING COLLEGE
            </h1>
            <p className="text-xs md:text-sm font-medium text-slate-500 tracking-wide">
              K.R. Nagar, Kovilpatti - 628 503
            </p>
          </div>
        </div>

        {/* Center: Admin Navigations OR Portal Span Banner */}
        <div className="text-center">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              {/* Leaderboard Navigation */}
              <Link
                to="/leaderboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-colors shadow-sm"
              >
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Leaderboard</span>
              </Link>

              {/* Admin Dashboard / Nomination Form Navigation */}
              {location.pathname === '/admin/responses' ? (
                <Link
                  to="/nomination"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-primary text-xs font-bold border border-primary/20 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Nomination Form</span>
                </Link>
              ) : (
                <Link
                  to="/admin/responses"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-primary text-xs font-bold border border-primary/20 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 shadow-sm">
              <span className="text-xs md:text-sm font-bold text-primary tracking-widest uppercase font-heading">
                Notable Alumni Award Nomination Portal
              </span>
            </div>
          )}
        </div>

        {/* Right: Alumni Association Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-1 bg-white/80 rounded-xl shadow-sm border border-primary/10">
            <img
              src="/alumni-logo.png"
              alt="NEC Alumni Association Logo"
              className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Logout button displayed for logged in admin */}
          {isAdmin && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition-colors cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
        
      </div>
    </header>
  );
};

export default Header;
