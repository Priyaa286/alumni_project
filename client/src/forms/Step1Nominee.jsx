import React from 'react';

const Step1Nominee = ({ register, errors }) => {
  const departments = [
    'Mechanical Engineering',
    'Electronics and Communication Engineering',
    'Computer Science and Engineering',
    'Electrical and Electronics Engineering',
    'Electronics and Instrumentation Engineering',
    'Information Technology',
    'Civil Engineering'
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-primary/10 pb-4">
        <h3 className="text-xl font-bold text-gray-900 font-heading">Nominee Details</h3>
        <p className="text-sm text-gray-500 font-sans">Provide personal and contact information of the nominee.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alumni Name */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Alumni Name *</label>
          <input
            type="text"
            placeholder="Enter full name"
            {...register('nomineeDetails.name', { required: 'Name is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.name
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nomineeDetails?.name && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.name.message}
            </span>
          )}
        </div>

        {/* Batch */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Batch (e.g. 1996 - 2000) *</label>
          <input
            type="text"
            placeholder="e.g. 2004 - 2008"
            {...register('nomineeDetails.batch', { required: 'Batch is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.batch
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nomineeDetails?.batch && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.batch.message}
            </span>
          )}
        </div>

        {/* Department */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Department *</label>
          <select
            {...register('nomineeDetails.department', { required: 'Department is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.department
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          >
            <option value="">Select Department</option>
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.nomineeDetails?.department && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.department.message}
            </span>
          )}
        </div>

        {/* Mobile Number */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Mobile Number *</label>
          <input
            type="tel"
            placeholder="10-digit Indian Mobile Number"
            {...register('nomineeDetails.mobile', {
              required: 'Mobile number is required',
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: 'Enter a valid 10-digit Indian mobile number (starts with 6-9)'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.mobile
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nomineeDetails?.mobile && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.mobile.message}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Email ID *</label>
          <input
            type="email"
            placeholder="alumni@example.com"
            {...register('nomineeDetails.email', {
              required: 'Email ID is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.email
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nomineeDetails?.email && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.email.message}
            </span>
          )}
        </div>

        {/* Current City */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Current City *</label>
          <input
            type="text"
            placeholder="e.g. Chennai"
            {...register('nomineeDetails.city', { required: 'Current City is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.city
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nomineeDetails?.city && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.city.message}
            </span>
          )}
        </div>

        {/* State */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">State *</label>
          <input
            type="text"
            placeholder="e.g. Tamil Nadu"
            {...register('nomineeDetails.state', { required: 'State is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.state
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nomineeDetails?.state && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.state.message}
            </span>
          )}
        </div>

        {/* Country */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Country *</label>
          <input
            type="text"
            placeholder="e.g. India"
            {...register('nomineeDetails.country', { required: 'Country is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.country
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nomineeDetails?.country && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.country.message}
            </span>
          )}
        </div>

        {/* LinkedIn Profile */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">LinkedIn / Professional Profile URL</label>
          <input
            type="url"
            placeholder="https://linkedin.com/in/username"
            {...register('nomineeDetails.linkedin', {
              pattern: {
                value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                message: 'Enter a valid URL'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.linkedin
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nomineeDetails?.linkedin && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.linkedin.message}
            </span>
          )}
        </div>

        {/* Address */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Address *</label>
          <textarea
            rows="3"
            placeholder="Full contact address"
            {...register('nomineeDetails.address', { required: 'Address is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nomineeDetails?.address
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nomineeDetails?.address && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.address.message}
            </span>
          )}
        </div>

        {/* Registered in Alumni Portal */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Registered in Alumni Portal? *</label>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-2 cursor-pointer font-sans text-gray-700 font-medium">
              <input
                type="radio"
                value="Yes"
                {...register('nomineeDetails.registeredInPortal', { required: 'Selection is required' })}
                className="w-4 h-4 text-primary border-primary/30 focus:ring-primary focus:outline-none"
              />
              Yes
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-sans text-gray-700 font-medium">
              <input
                type="radio"
                value="No"
                {...register('nomineeDetails.registeredInPortal', { required: 'Selection is required' })}
                className="w-4 h-4 text-primary border-primary/30 focus:ring-primary focus:outline-none"
              />
              No
            </label>
          </div>
          {errors.nomineeDetails?.registeredInPortal && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nomineeDetails.registeredInPortal.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step1Nominee;
