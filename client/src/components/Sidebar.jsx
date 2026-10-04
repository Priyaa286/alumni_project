import React from 'react';

const Sidebar = ({ currentStep, onStepClick, steps = [] }) => {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0 progress-sidebar">
      {/* Container Card */}
      <div className="glass-card rounded-nec p-6 border border-borderlight shadow-premium">
        <h3 className="font-heading text-lg font-bold text-primary mb-6 hidden lg:block tracking-wide uppercase">
          Nomination Progress
        </h3>

        {/* Mobile Horizontal Progress Stepper */}
        <div className="flex lg:hidden overflow-x-auto pb-4 gap-4 scrollbar-thin scroll-smooth snap-x snap-mandatory">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isActive = step.number === currentStep;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => isCompleted && onStepClick(step.number)}
                disabled={!isCompleted}
                className={`flex items-center gap-2 flex-shrink-0 snap-center px-4 py-2 rounded-full border transition-all ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-glow scale-105'
                    : isCompleted
                    ? 'bg-green-50 text-green-700 border-green-200 cursor-pointer'
                    : 'bg-white text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white/20 border border-current">
                  {isCompleted ? '✔' : step.number}
                </span>
                <span className="text-xs font-semibold whitespace-nowrap">
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop Vertical Stepper */}
        <div className="hidden lg:flex flex-col gap-1 relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-6 top-3 bottom-9 w-0.5 bg-slate-200" />
          
          {steps.map((step, index) => {
            const isCompleted = step.number < currentStep;
            const isActive = step.number === currentStep;

            return (
              <div key={step.number} className="flex items-start gap-4 py-3 group">
                {/* Step Circle Indicator */}
                <button
                  type="button"
                  onClick={() => isCompleted && onStepClick(step.number)}
                  disabled={!isCompleted}
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border font-heading text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-glow scale-110'
                      : isCompleted
                      ? 'bg-green-500 text-white border-green-500 cursor-pointer hover:bg-green-600'
                      : 'bg-white text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-base">✔</span>
                  ) : (
                    <span>{step.number}</span>
                  )}
                </button>

                {/* Step Title Label */}
                <div className="flex flex-col justify-center min-h-[48px]">
                  <button
                    type="button"
                    onClick={() => isCompleted && onStepClick(step.number)}
                    disabled={!isCompleted}
                    className={`text-left font-sans text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-primary font-bold text-base'
                        : isCompleted
                        ? 'text-slate-700 hover:text-primary cursor-pointer'
                        : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {step.label}
                  </button>
                  <span className={`text-[11px] font-medium leading-none ${
                    isActive 
                      ? 'text-secondary' 
                      : isCompleted 
                      ? 'text-green-600' 
                      : 'text-slate-400'
                  }`}>
                    {isActive ? 'In Progress' : isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </aside>
  );
};

export default Sidebar;
