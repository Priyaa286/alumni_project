import React from 'react';

const Header = () => {
  return (
    <header className="w-full glass-panel sticky top-0 z-50 px-4 py-3 md:px-8 md:py-4 shadow-premium border-b border-borderlight">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: National Engineering College Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/nec-logo.png"
            alt="National Engineering College Logo"
            className="h-20 md:h-24 w-auto object-contain filter drop-shadow-sm"
          />
          <div className="hidden sm:block">
            <h1 className="font-heading font-extrabold text-lg md:text-1xl text-primary tracking-tight leading-tight">
            NATIONAL ENGINEERING COLLEGE
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 tracking-wide">
            K.R. Nagar, Kovilpatti - 628 503
          </p>
          </div>
        </div>

        {/* Center: Branding & Subtitle */}
        <div className="text-center">
          
          <div className="inline-flex items-center gap-2 mt-1 px-4 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-[14px] md:text-xm font-bold text-primary tracking-widest uppercase">
              Notable Alumni Award Nomination Portal
            </span>
          </div>
        </div>

        {/* Right: NEC Alumni Association Logo */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            
            
          </div>
          <img
            src="/alumni-logo.png"
            alt="NEC Alumni Association Logo"
            className="h-16 md:h-18 w-auto object-contain filter drop-shadow-sm"
          />
        </div>
        
      </div>
    </header>
  );
};

export default Header;
