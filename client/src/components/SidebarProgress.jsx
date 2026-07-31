import React from 'react';
import { Check } from 'lucide-react';

const SidebarProgress = ({ currentStep, maxVisitedStep, onStepClick }) => {
  const steps = [
    { label: 'Nominee Details', short: 'Nominee' },
    { label: 'Professional Profile', short: 'Professional' },
    { label: 'Award Category', short: 'Category' },
    { label: 'Category Details', short: 'Category Details' },
    { label: 'NEC Contribution', short: 'NEC Contribution' },
    { label: 'Supporting Documents', short: 'Documents' },
    { label: 'Nominator Details', short: 'Nominator' },
    { label: 'Declaration & Sign', short: 'Declaration' },
    { label: 'Review Details', short: 'Review' },
    { label: 'Final Submission', short: 'Submit' }
  ];

  return (
    <aside className="glass-card p-6 rounded-nec w-full lg:w-80 h-fit shrink-0">
      <h3 className="text-lg font-bold text-primary mb-6 font-heading border-b border-primary/10 pb-3">
        Nomination Progress
      </h3>
      <div className="relative flex flex-row lg:flex-col justify-between lg:justify-start gap-4 lg:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none">
        
        {/* Progress Line for Desktop */}
        <div className="absolute left-[27px] top-[30px] bottom-[30px] w-0.5 bg-gray-200 hidden lg:block -z-10" />

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isPlayable = stepNumber <= maxVisitedStep;

          return (
            <button
              key={idx}
              type="button"
              disabled={!isPlayable}
              onClick={() => onStepClick(stepNumber)}
              className={`flex items-center gap-3 text-left focus:outline-none transition-all duration-200 group w-full ${
                isPlayable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
            >
              {/* Step indicator circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 text-xs font-bold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-primary border-primary text-white shadow-glow'
                    : isActive
                    ? 'bg-white border-primary text-primary shadow-glow'
                    : 'bg-white border-gray-300 text-gray-400 group-hover:border-primary/50'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : stepNumber}
              </div>

              {/* Step Labels */}
              <div className="hidden lg:block">
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isActive ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  Step {stepNumber}
                </p>
                <h4
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-gray-900 font-bold'
                      : isCompleted
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step.short}
                </h4>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default SidebarProgress;
