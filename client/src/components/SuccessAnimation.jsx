import React from 'react';
import { motion } from 'framer-motion';

const SuccessAnimation = () => {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="relative w-28 h-28">
        {/* Animated outer ring */}
        <motion.circle
          cx="56"
          cy="56"
          r="50"
          className="stroke-green-500 fill-none"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        
        {/* Glowing aura */}
        <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50 scale-75 animate-pulse" />
        
        {/* Green inner circle */}
        <motion.div
          className="absolute inset-2 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 100 }}
        >
          {/* Checkmark drawing */}
          <svg
            className="w-14 h-14 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3.5"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.6, duration: 0.4, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
