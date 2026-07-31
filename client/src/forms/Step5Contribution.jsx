import React from 'react';

const Step5Contribution = ({ register, errors }) => {
  const contributionsList = [
    { id: 'Scholarship Support', label: 'Scholarship Support' },
    { id: 'Student Mentoring', label: 'Student Mentoring' },
    { id: 'Placement Assistance', label: 'Placement Assistance' },
    { id: 'Webinar Program / Guest Lecture', label: 'Webinar Program' },
    { id: 'Internship Support', label: 'Internship Support' },
    { id: 'Alumni Association Activities', label: 'Alumni Association Activities' },
    { id: 'Institutional Development Support', label: 'Institutional Development Support' }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-primary/10 pb-4">
        <h3 className="text-xl font-bold text-gray-900 font-heading">Contribution to NEC & Alumni Association</h3>
        <p className="text-sm text-gray-500 font-sans">
          Indicate how the nominee has supported and contributed back to the institution and alumni networks.
        </p>
      </div>

      <div className="space-y-6">
        {/* Contributions Checkboxes */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-3 font-sans">
            Please indicate your contributions (Select all that apply):
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contributionsList.map((item, idx) => (
              <label
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg border border-primary/10 bg-white/40 hover:bg-white cursor-pointer transition-colors duration-150 font-sans text-gray-700"
              >
                <input
                  type="checkbox"
                  value={item.id}
                  {...register('necContribution.activities')}
                  className="mt-1 w-4 h-4 text-primary border-primary/30 rounded focus:ring-primary focus:outline-none"
                />
                <span className="text-sm font-medium leading-tight">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Contribution Details Textarea */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">
            Details of Contribution *
          </label>
          <textarea
            rows="5"
            placeholder="Describe the nature of support provided, batches impacted, financial support figures if any, or events organized..."
            {...register('necContribution.details', { required: 'Please provide contribution details' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.necContribution?.details
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.necContribution?.details && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.necContribution.details.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step5Contribution;
