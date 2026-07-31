import React from 'react';

const Header = () => {
  return (
    <header className="glass-nav sticky top-0 z-50 w-full px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Left Side: National Engineering College Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/nec-logo.png"
            alt="National Engineering College Logo"
            className="h-20 md:h-24 w-auto object-contain filter drop-shadow-sm"
          />
          <div className="hidden lg:block">
            <h1 className="text-lg md:text-xl font-extrabold text-gray-800 font-heading tracking-tight leading-tight">
              NATIONAL ENGINEERING COLLEGE
            </h1>
            <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">
              K.R. Nagar, Kovilpatti - 628 503
            </p>
          </div>
        </div>

        {/* Center: Institution and Award Portal Headings */}
        <div className="text-center flex-1">

          <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-heading font-bold text-sm tracking-widest uppercase shadow-sm">
            Notable Alumni Award Nomination Portal
          </div>
        </div>

        {/* Right Side: Alumni Association Logo */}
        <div className="flex items-center gap-3">
          
          <img
            src="/alumni-logo.png"
            alt="NEC Alumni Association Logo"
            className="h-20 md:h-24 w-auto object-contain filter drop-shadow-sm"
          />
        </div>

      </div>
    </header>
  );
};

export default Header;
