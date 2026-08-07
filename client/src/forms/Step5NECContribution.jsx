import React from 'react';

const Step5NECContribution = ({ register, formState: { errors } }) => {
  const activitiesList = [
    { id: 'Scholarship', label: 'Financial Support / Scholarships to Students' },
    { id: 'Mentoring', label: 'Mentoring / Student Guidance' },
    { id: 'Placement', label: 'Placement Support / Training' },
    { id: 'Internship', label: 'Providing Internships to Students' },
    { id: 'Webinar', label: 'Conducting Webinars / Guest Lectures' },
    { id: 'Association Activities', label: 'Alumni Association Active Coordinator' },
    { id: 'Institution Development', label: 'Institution Infrastructure / R&D Development Support' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary">Contribution to NEC</h2>
        <p className="text-xs text-slate-500 mt-1">Please select the activities and provide detailed information about your contribution to National Engineering College.</p>
      </div>

      {/* Checkboxes List */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 mb-2">
          Select all areas of contribution:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activitiesList.map((activity) => (
            <label
              key={activity.id}
              className="flex items-start gap-3 p-4 rounded-nec border border-borderlight bg-white hover:bg-slate-50 cursor-pointer select-none transition-colors"
            >
              <input
                type="checkbox"
                value={activity.id}
                {...register('necContribution.activities')}
                className="w-5 h-5 mt-0.5 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-semibold text-slate-700 leading-tight">
                {activity.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Contribution Details Textarea */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">
          Details of Contribution <span className="text-red-500">*</span>
        </label>
        <textarea
          rows="6"
          placeholder="Describe your contributions in detail (e.g. amount funded, events conducted, placements coordinated, number of students mentored)..."
          {...register('necContribution.details', { required: 'Please provide detailed contribution descriptions' })}
          className={`w-full px-4 py-2.5 rounded-nec border ${
            errors?.necContribution?.details ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
          } focus:outline-none focus:ring-4 transition-all resize-none`}
        />
        {errors?.necContribution?.details && (
          <span className="text-xs text-red-500 font-medium">{errors.necContribution.details.message}</span>
        )}
      </div>
    </div>
  );
};

export default Step5NECContribution;
