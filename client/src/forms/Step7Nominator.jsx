import React from 'react';

const Step7Nominator = ({ register, errors }) => {
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
        <h3 className="text-xl font-bold text-gray-900 font-heading">Nominator Details</h3>
        <p className="text-sm text-gray-500 font-sans">Provide info about the person nominating this alumnus.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nominated By */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Nominated By (Full Name) *</label>
          <input
            type="text"
            placeholder="Enter nominator's full name"
            {...register('nominatorDetails.name', { required: 'Nominator name is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nominatorDetails?.name
                ? 'border-red-500 focus:border-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nominatorDetails?.name && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nominatorDetails.name.message}
            </span>
          )}
        </div>

        {/* Batch */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Batch (e.g. 1996 - 2000) *</label>
          <input
            type="text"
            placeholder="e.g. 2000 - 2004"
            {...register('nominatorDetails.batch', { required: 'Nominator batch is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nominatorDetails?.batch
                ? 'border-red-500 focus:border-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nominatorDetails?.batch && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nominatorDetails.batch.message}
            </span>
          )}
        </div>

        {/* Department */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Department *</label>
          <select
            {...register('nominatorDetails.department', { required: 'Department is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nominatorDetails?.department
                ? 'border-red-500 focus:border-red-500'
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
          {errors.nominatorDetails?.department && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nominatorDetails.department.message}
            </span>
          )}
        </div>

        {/* Mobile Number */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Mobile Number *</label>
          <input
            type="tel"
            placeholder="10-digit Indian Mobile Number"
            {...register('nominatorDetails.mobile', {
              required: 'Mobile number is required',
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: 'Enter a valid 10-digit Indian mobile number (starts with 6-9)'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nominatorDetails?.mobile
                ? 'border-red-500 focus:border-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nominatorDetails?.mobile && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nominatorDetails.mobile.message}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">Email ID *</label>
          <input
            type="email"
            placeholder="nominator@example.com"
            {...register('nominatorDetails.email', {
              required: 'Email ID is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
              errors.nominatorDetails?.email
                ? 'border-red-500 focus:border-red-500'
                : 'border-primary/20 focus:border-primary focus:shadow-glow'
            }`}
          />
          {errors.nominatorDetails?.email && (
            <span className="text-xs text-red-500 mt-1 font-sans font-medium">
              {errors.nominatorDetails.email.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step7Nominator;
