import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileText, LogIn, Trophy } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication & admin status
  const isLoggedIn = Boolean(isAuthenticated && user);
  const isAdmin = isLoggedIn && user?.role === 'admin';

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully.');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/nomination') {
      return location.pathname === '/' || location.pathname === '/nomination';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="w-full glass-panel sticky top-0 z-50 py-3 shadow-premium border-b border-borderlight bg-white/95 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: National Engineering College Logo */}
        <Link to={isAdmin ? "/admin/responses" : "/nomination"} className="flex items-center gap-3">
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
        </Link>

        {/* Center: Admin Navigations OR Portal Span Banner before login */}
        <div className="text-center">
          {isAdmin ? (
            <nav className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
              <Link
                to="/admin/responses"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  isActive('/admin')
                    ? 'bg-purple-900 text-white shadow-md scale-105'
                    : 'text-purple-700 hover:bg-purple-100/80'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>

              <Link
                to="/nomination"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  isActive('/nomination')
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'text-slate-600 hover:text-primary hover:bg-white/80'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Nomination Form</span>
              </Link>

              <Link
                to="/leaderboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  isActive('/leaderboard')
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'text-slate-600 hover:text-primary hover:bg-white/80'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Leaderboard</span>
              </Link>
            </nav>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 shadow-sm">
              <span className="text-xs md:text-sm font-bold text-primary tracking-widest uppercase font-heading">
                Notable Alumni Award Nomination Portal
              </span>
            </div>
          )}
        </div>

        {/* Right: Alumni Association Logo & Auth Options */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-1 bg-white/80 rounded-xl shadow-sm border border-primary/10">
            <img
              src="/alumni-logo.png"
              alt="NEC Alumni Association Logo"
              className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* User Auth Action (Logout if logged in, Login button if not) */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user?.name || user?.email}</span>
                <span className="text-[10px] uppercase font-extrabold text-primary tracking-wider">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition-colors cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            location.pathname !== '/login' && (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-purple-700 hover:from-primary/90 hover:to-purple-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </Link>
            )
          )}
        </div>
        
      </div>
    </header>
  );
};

export default Header;
