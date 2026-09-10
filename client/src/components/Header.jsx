import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, ShieldCheck, LayoutDashboard, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="w-full glass-panel sticky top-0 z-50 px-4 py-3 md:px-8 md:py-4 shadow-premium border-b border-borderlight bg-white/90 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
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

        {/* Center: Branding & Subtitle */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 shadow-sm">
            <span className="text-xs md:text-sm font-bold text-primary tracking-widest uppercase font-heading">
              Notable Alumni Award Nomination Portal
            </span>
          </div>
        </div>

        {/* Right: NEC Alumni Association Logo & User Auth Controls */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center p-1 bg-white/80 rounded-xl shadow-sm border border-primary/10">
            <img
              src="/alumni-logo.png"
              alt="NEC Alumni Association Logo"
              className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* User Auth Indicator & Navigation Buttons */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              {user.role === 'admin' ? (
                location.pathname === '/admin/responses' ? (
                  <Link
                    to="/nomination"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-primary text-xs font-bold border border-primary/20 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Nomination Form</span>
                  </Link>
                ) : (
                  <Link
                    to="/admin/responses"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-primary text-xs font-bold border border-primary/20 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )
              ) : (
                <Link
                  to="/nomination"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-primary text-xs font-bold border border-primary/20 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Nomination Form</span>
                </Link>
              )}

              {/* User Avatar / Profile Details */}
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || user.email}
                    className="w-8 h-8 rounded-full border border-primary/30 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                )}

                <div className="hidden lg:block text-right">
                  <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
                    {user.name || user.email}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      user.role === 'admin'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="pl-3 border-l border-slate-200">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary to-purple-700 hover:from-primary/95 hover:to-purple-800 text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Portal Login</span>
              </Link>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};

export default Header;
