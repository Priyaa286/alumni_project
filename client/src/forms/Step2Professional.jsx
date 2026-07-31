import React, { useEffect, useState } from 'react';

const Step2Professional = ({ register, errors, watch }) => {
  const profileSummary = watch('professionalProfile.profileSummary') || '';
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = profileSummary.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [profileSummary]);

  return (
    <div className="space-y-6">
      <div className="border-b border-primary/10 pb-4">
        <h3 className="text-xl font-bold text-gray-900 font-heading">Professional Profile</h3>
        <p className="text-sm text-gray-500 font-sans">Details about the nominee's professional career and accomplishments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Designation */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Current Designation *</label>
          <input
            type="text"
            placeholder="e.g. Chief Technical Officer"
            {...register('professionalProfile.designation', { required: 'Designation is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.professionalProfile?.designation
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.professionalProfile?.designation && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.professionalProfile.designation.message}
            </span>
          )}
        </div>

        {/* Organization Name */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Organization Name *</label>
          <input
            type="text"
            placeholder="e.g. Google India"
            {...register('professionalProfile.organization', { required: 'Organization name is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.professionalProfile?.organization
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.professionalProfile?.organization && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.professionalProfile.organization.message}
            </span>
          )}
        </div>

        {/* Experience */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Total Years of Experience *</label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 12"
            {...register('professionalProfile.experience', {
              required: 'Experience is required',
              min: { value: 0, message: 'Experience cannot be negative' }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.professionalProfile?.experience
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.professionalProfile?.experience && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.professionalProfile.experience.message}
            </span>
          )}
        </div>

        {/* Organization Website */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Organization Website URL</label>
          <input
            type="url"
            placeholder="https://example.com"
            {...register('professionalProfile.website', {
              pattern: {
                value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                message: 'Enter a valid URL'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.professionalProfile?.website
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.professionalProfile?.website && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.professionalProfile.website.message}
            </span>
          )}
        </div>

        {/* Brief Professional Profile */}
        <div className="flex flex-col md:col-span-2">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-gray-700 font-sans">Brief Professional Profile *</label>
            <span className={`text-xs font-semibold font-sans ${wordCount > 300 ? 'text-red-500' : 'text-primary'}`}>
              {wordCount} / 300 words
            </span>
          </div>
          <textarea
            rows="6"
            placeholder="Summarize professional accomplishments, landmarks, and highlights (max 300 words)..."
            {...register('professionalProfile.profileSummary', {
              required: 'Professional profile summary is required',
              validate: {
                maxWords: (value) => {
                  const words = value.trim().split(/\s+/).filter(Boolean);
                  return words.length <= 300 || 'Word limit of 300 words exceeded';
                }
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.professionalProfile?.profileSummary
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.professionalProfile?.profileSummary && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.professionalProfile.profileSummary.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Professional;
