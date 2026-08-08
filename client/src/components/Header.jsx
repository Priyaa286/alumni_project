import React from 'react';

const Header = () => {
  return (
    <header className="w-full glass-panel sticky top-0 z-50 px-4 py-3 md:px-8 md:py-4 shadow-premium border-b border-borderlight">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: National Engineering College Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-1 bg-white/80 rounded-xl shadow-sm border border-primary/10">
            <img
              src="/nec-logo.png"
              alt="National Engineering College Logo"
              className="h-14 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
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

        {/* Right: NEC Alumni Association Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-1 bg-white/80 rounded-xl shadow-sm border border-primary/10">
            <img
              src="/alumni-logo.png"
              alt="NEC Alumni Association Logo"
              className="h-14 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
        
      </div>
    </header>
  );
};

export default Header;
