import React from 'react';

const Step7Nominator = ({ register, formState: { errors } }) => {
  const departments = [
    { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering (CSE)' },
    { value: 'Electronics and Communication Engineering', label: 'Electronics and Communication Engineering (ECE)' },
    { value: 'Electrical and Electronics Engineering', label: 'Electrical and Electronics Engineering (EEE)' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering (Mech)' },
    { value: 'Information Technology', label: 'Information Technology (IT)' },
    { value: 'Civil Engineering', label: 'Civil Engineering (Civil)' },
    { value: 'Electronics and Instrumentation Engineering', label: 'Electronics and Instrumentation Engineering (EIE)' },
    { value: 'Artificial Intelligence and Data Science', label: 'Artificial Intelligence and Data Science (AIDS)' },
    { value: 'Other', label: 'Other Faculty / External Person' }
  ];

  const currentYear = new Date().getFullYear();
  const batches = Array.from({ length: currentYear - 1987 }, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary">Nominator Details</h2>
        <p className="text-xs text-slate-500 mt-1">Please enter the contact information of the person submitting this nomination.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">Nomination Source <span className="text-red-500">*</span></label>
          <select {...register('nominator.source', { required: 'Select how the nominee was identified.' })} className="w-full rounded-nec border border-borderlight bg-white px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-primary/20">
            <option value="">Select source</option>
            <option value="Batch">Batch</option>
            <option value="Chapter">Chapter</option>
            <option value="Fellow Alumni">Fellow Alumni</option>
          </select>
          {errors?.nominator?.source && <span className="text-xs font-medium text-red-500">{errors.nominator.source.message}</span>}
        </div>

        {/* Nominated By */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Nominated By (Full Name) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            {...register('nominator.name', { required: 'Nominator Name is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.nominator?.name ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.nominator?.name && (
            <span className="text-xs text-red-500 font-medium">{errors.nominator.name.message}</span>
          )}
        </div>

        {/* Nominator Batch */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Batch (Graduation Year, if Alumnus)
          </label>
          <select
            {...register('nominator.batch')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none bg-white transition-all"
          >
            <option value="">Select Graduation Year (Optional)</option>
            {batches.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Nominator Department */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Department / Affiliation
          </label>
          <select
            {...register('nominator.department')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none bg-white transition-all"
          >
            <option value="">Select Department (Optional)</option>
            {departments.map(dept => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
        </div>

        {/* Nominator Mobile */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+91</span>
            <input
              type="tel"
              placeholder="9876543210"
              {...register('nominator.mobile', {
                required: 'Mobile Number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Enter a valid 10-digit Indian mobile number'
                }
              })}
              className={`w-full pl-14 pr-4 py-2.5 rounded-nec border ${
                errors?.nominator?.mobile ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
              } focus:outline-none focus:ring-4 transition-all`}
            />
          </div>
          {errors?.nominator?.mobile && (
            <span className="text-xs text-red-500 font-medium">{errors.nominator.mobile.message}</span>
          )}
        </div>

        {/* Nominator Email */}
        <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="nominator@domain.com"
            {...register('nominator.email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Enter a valid email address'
              }
            })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.nominator?.email ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.nominator?.email && (
            <span className="text-xs text-red-500 font-medium">{errors.nominator.email.message}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step7Nominator;
