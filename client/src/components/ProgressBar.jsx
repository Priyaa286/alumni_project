import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ currentStep, totalSteps = 10 }) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8 no-print">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
          Nomination Form Progress
        </span>
        <span className="text-sm font-bold font-heading text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      {/* Outer track */}
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner relative">
        {/* Animated fill */}
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Highlight sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default ProgressBar;
