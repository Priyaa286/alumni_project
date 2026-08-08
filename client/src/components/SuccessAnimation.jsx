import React from 'react';
import { motion } from 'framer-motion';

const SuccessAnimation = () => {
  // Sparkle particle positions radiating outward
  const sparks = [
    { angle: 0, color: 'bg-amber-400', delay: 0.4 },
    { angle: 45, color: 'bg-purple-500', delay: 0.45 },
    { angle: 90, color: 'bg-emerald-400', delay: 0.5 },
    { angle: 135, color: 'bg-pink-500', delay: 0.55 },
    { angle: 180, color: 'bg-blue-400', delay: 0.6 },
    { angle: 225, color: 'bg-amber-300', delay: 0.65 },
    { angle: 270, color: 'bg-green-500', delay: 0.7 },
    { angle: 315, color: 'bg-purple-400', delay: 0.75 },
  ];

  return (
    <div className="flex items-center justify-center py-6">
      <div className="relative w-32 h-32 flex items-center justify-center">
        
        {/* Radiating Party Puff Spark Particles */}
        {sparks.map((spark, idx) => {
          const rad = (spark.angle * Math.PI) / 180;
          const distance = 58;
          const x = Math.cos(rad) * distance;
          const y = Math.sin(rad) * distance;

          return (
            <motion.div
              key={idx}
              className={`absolute w-3 h-3 rounded-full ${spark.color} shadow-sm`}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{ x, y, scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
              transition={{
                delay: spark.delay,
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 3.5,
                ease: 'easeOut'
              }}
            />
          );
        })}

        {/* Glowing aura */}
        <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-60 scale-90 animate-pulse" />
        
        {/* Green inner circle */}
        <motion.div
          className="relative z-10 w-24 h-24 bg-gradient-to-tr from-green-500 via-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 120 }}
        >
          {/* Checkmark drawing */}
          <svg
            className="w-12 h-12 text-white drop-shadow-md"
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
              transition={{ delay: 0.5, duration: 0.4, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
