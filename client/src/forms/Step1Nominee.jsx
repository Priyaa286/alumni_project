import React from 'react';

const Step1Nominee = ({ register, formState: { errors }, watch }) => {
  // Common departments at National Engineering College
  const departments = [
    { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering (CSE)' },
    { value: 'Electronics and Communication Engineering', label: 'Electronics and Communication Engineering (ECE)' },
    { value: 'Electrical and Electronics Engineering', label: 'Electrical and Electronics Engineering (EEE)' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering (Mech)' },
    { value: 'Information Technology', label: 'Information Technology (IT)' },
    { value: 'Civil Engineering', label: 'Civil Engineering (Civil)' },
    { value: 'Electronics and Instrumentation Engineering', label: 'Electronics and Instrumentation Engineering (EIE)' },
    { value: 'Artificial Intelligence and Data Science', label: 'Artificial Intelligence and Data Science (AIDS)' },
  ];

  // Batch options from 1988 (first graduating batch) to 2025
  const currentYear = new Date().getFullYear();
  const batches = Array.from({ length: currentYear - 1987 }, (_, i) => String(currentYear - i));
  const nominationType = watch('nominationType');

  return (
    <div className="space-y-6">
      <div className="border-b border-borderlight pb-4">
        <h2 className="font-heading text-xl font-bold text-primary">Nominee Details</h2>
        <p className="text-xs text-slate-500 mt-1">Please provide the personal and contact details of the alumnus being nominated.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alumni Name */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Alumni Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            {...register('nominee.name', { required: 'Alumni Name is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.nominee?.name ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.nominee?.name && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.name.message}</span>
          )}
        </div>

        {/* Batch */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Batch (Year of Graduation) <span className="text-red-500">*</span>
          </label>
          <select
            {...register('nominee.batch', { required: 'Batch is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white ${
              errors?.nominee?.batch ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          >
            <option value="">Select Graduation Year</option>
            {batches.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors?.nominee?.batch && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.batch.message}</span>
          )}
        </div>

        {/* Department */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            {...register('nominee.department', { required: 'Department is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white ${
              errors?.nominee?.department ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
          {errors?.nominee?.department && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.department.message}</span>
          )}
        </div>

        {/* Mobile Number */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Mobile Number (India) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+91</span>
            <input
              type="tel"
              placeholder="9876543210"
              {...register('nominee.mobile', {
                required: 'Mobile Number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Enter a valid 10-digit Indian mobile number starting with 6-9'
                }
              })}
              className={`w-full pl-14 pr-4 py-2.5 rounded-nec border ${
                errors?.nominee?.mobile ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
              } focus:outline-none focus:ring-4 transition-all`}
            />
          </div>
          {errors?.nominee?.mobile && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.mobile.message}</span>
          )}
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="example@domain.com"
            {...register('nominee.email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Enter a valid email address'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.nominee?.email ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.nominee?.email && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.email.message}</span>
          )}
        </div>

        {/* Current City */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Current City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter city name"
            {...register('nominee.city', { required: 'Current City is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.nominee?.city ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.nominee?.city && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.city.message}</span>
          )}
        </div>
      </div>

      {/* Address Textarea */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">
          Permanent / Communication Address <span className="text-red-500">*</span>
        </label>
        <textarea
          rows="3"
          placeholder="Enter detailed postal address"
          {...register('nominee.address', { required: 'Postal Address is required' })}
          className={`w-full px-4 py-2.5 rounded-nec border ${
            errors?.nominee?.address ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
          } focus:outline-none focus:ring-4 transition-all resize-none`}
        />
        {errors?.nominee?.address && (
          <span className="text-xs text-red-500 font-medium">{errors.nominee.address.message}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* State */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter state"
            {...register('nominee.state', { required: 'State is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.nominee?.state ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.nominee?.state && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.state.message}</span>
          )}
        </div>

        {/* Country */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter country"
            {...register('nominee.country', { required: 'Country is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.nominee?.country ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.nominee?.country && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.country.message}</span>
          )}
        </div>

        {/* LinkedIn Profile */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            LinkedIn Profile URL
          </label>
          <input
            type="url"
            placeholder="https://linkedin.com/in/username"
            {...register('nominee.linkedin', {
              pattern: {
                value: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
                message: 'Enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.nominee?.linkedin ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.nominee?.linkedin && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.linkedin.message}</span>
          )}
        </div>

        {/* Registered in Alumni Portal */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Registered in NEC Alumni Portal? <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-6 h-[46px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="Yes"
                {...register('nominee.isRegisteredAlumni', { required: 'Please specify if registered' })}
                className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
              />
              <span className="text-sm font-semibold text-slate-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="No"
                {...register('nominee.isRegisteredAlumni', { required: 'Please specify if registered' })}
                className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
              />
              <span className="text-sm font-semibold text-slate-700">No</span>
            </label>
          </div>
          {errors?.nominee?.isRegisteredAlumni && (
            <span className="text-xs text-red-500 font-medium">{errors.nominee.isRegisteredAlumni.message}</span>
          )}
        </div>
      </div>

      {/* Nomination Type selection section */}
      <div className="border-t border-borderlight pt-6 mt-6 flex flex-col gap-3">
        <label className="text-base font-bold text-primary">
          Nomination Type <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500">
          Choose whether you are nominating yourself (Self Nomination) or submitting a nomination on behalf of another alumnus (Nominate Others).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <label className={`w-full p-4 rounded-nec border-2 cursor-pointer transition-all flex items-center gap-3 ${
            nominationType === 'self'
              ? 'border-primary bg-primary/5 shadow-glow'
              : 'border-borderlight bg-white hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              value="self"
              {...register('nominationType', { required: 'Please select a nomination type' })}
              className="w-5 h-5 text-primary focus:ring-primary"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Self Nomination</span>
              <span className="text-xs text-slate-400">I am nominating myself for the award.</span>
            </div>
          </label>

          <label className={`w-full p-4 rounded-nec border-2 cursor-pointer transition-all flex items-center gap-3 ${
            nominationType === 'others'
              ? 'border-primary bg-primary/5 shadow-glow'
              : 'border-borderlight bg-white hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              value="others"
              {...register('nominationType', { required: 'Please select a nomination type' })}
              className="w-5 h-5 text-primary focus:ring-primary"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Nominate Others</span>
              <span className="text-xs text-slate-400">I am nominating another alumnus.</span>
            </div>
          </label>
        </div>
        {errors?.nominationType && (
          <span className="text-xs text-red-500 font-bold block mt-1">{errors.nominationType.message}</span>
        )}
      </div>
    </div>
  );
};

export default Step1Nominee;
