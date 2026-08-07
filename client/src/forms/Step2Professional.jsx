import React, { useEffect } from 'react';

const Step2Professional = ({ register, formState: { errors }, watch }) => {
  const profileSummary = watch('professional.profileSummary') || '';

  // Calculate word count dynamically
  const getWordCount = (text) => {
    const cleanText = text.trim();
    if (cleanText === '') return 0;
    return cleanText.split(/\s+/).length;
  };

  const wordCount = getWordCount(profileSummary);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary">Professional Profile</h2>
        <p className="text-xs text-slate-500 mt-1">Please enter details of your current employment status and professional history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Designation */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Current Designation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Senior Software Engineer / Director"
            {...register('professional.designation', { required: 'Current Designation is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.professional?.designation ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.professional?.designation && (
            <span className="text-xs text-red-500 font-medium">{errors.professional.designation.message}</span>
          )}
        </div>

        {/* Organization Name */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Google Inc. / IIT Madras"
            {...register('professional.organization', { required: 'Organization Name is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.professional?.organization ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.professional?.organization && (
            <span className="text-xs text-red-500 font-medium">{errors.professional.organization.message}</span>
          )}
        </div>

        {/* Total Experience */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Total Work Experience (Years) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g., 8.5"
            {...register('professional.experience', {
              required: 'Total Work Experience is required',
              min: { value: 0, message: 'Experience cannot be negative' }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.professional?.experience ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.professional?.experience && (
            <span className="text-xs text-red-500 font-medium">{errors.professional.experience.message}</span>
          )}
        </div>

        {/* Organization Website */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Organization Website
          </label>
          <input
            type="text"
            placeholder="e.g., https://organization.com"
            {...register('professional.website', {
              pattern: {
                value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/,
                message: 'Enter a valid website URL'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.professional?.website ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.professional?.website && (
            <span className="text-xs text-red-500 font-medium">{errors.professional.website.message}</span>
          )}
        </div>
      </div>

      {/* Brief Professional Profile */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">
            Brief Professional Profile <span className="text-red-500">*</span>
          </label>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            wordCount > 300 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {wordCount} / 300 words
          </span>
        </div>
        <textarea
          rows="6"
          placeholder="Summarize key milestones, career achievements, and professional highlights..."
          {...register('professional.profileSummary', {
            required: 'Brief Professional Profile is required',
            validate: {
              maxWords: (val) => getWordCount(val) <= 300 || 'Profile summary cannot exceed 300 words'
            }
          })}
          className={`w-full px-4 py-2.5 rounded-nec border ${
            errors?.professional?.profileSummary ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
          } focus:outline-none focus:ring-4 transition-all resize-none`}
        />
        {errors?.professional?.profileSummary && (
          <span className="text-xs text-red-500 font-medium">{errors.professional.profileSummary.message}</span>
        )}
      </div>
    </div>
  );
};

export default Step2Professional;
