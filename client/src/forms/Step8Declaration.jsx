import React from 'react';
import { Controller } from 'react-hook-form';
import SignaturePad from '../components/SignaturePad';

const Step8Declaration = ({ register, errors, control }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-primary/10 pb-4">
        <h3 className="text-xl font-bold text-gray-900 font-heading">Declaration</h3>
        <p className="text-sm text-gray-500 font-sans">Declare that all information provided is accurate and sign.</p>
      </div>

      <div className="space-y-6 font-sans text-gray-800">
        
        {/* Declaration Statement Card */}
        <div className="p-4 rounded-nec border border-primary/15 bg-white/40 leading-relaxed text-sm">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('declaration.declared', { required: 'You must agree to the declaration statement' })}
              className="mt-1 w-4 h-4 text-primary border-primary/30 rounded focus:ring-primary focus:outline-none"
            />
            <span className="font-sans font-medium text-gray-700">
              I hereby declare that the information furnished in this nomination form is true and correct to the best of my knowledge. I understand that the selection committee reserves the right to verify the information provided and reject the nomination if any information is found to be incorrect. *
            </span>
          </label>
          {errors.declaration?.declared && (
            <span className="text-xs text-red-500 mt-2 block font-semibold">
              {errors.declaration.declared.message}
            </span>
          )}
        </div>

        {/* Input Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nominee Name */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1.5">Nominee Name *</label>
            <input
              type="text"
              placeholder="Full name of the nominee"
              {...register('declaration.nomineeName', { required: 'Nominee Name is required' })}
              className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
                errors.declaration?.nomineeName ? 'border-red-500' : 'border-primary/20 focus:border-primary focus:shadow-glow'
              }`}
            />
            {errors.declaration?.nomineeName && (
              <span className="text-xs text-red-500 mt-1 font-semibold">
                {errors.declaration.nomineeName.message}
              </span>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
            <input
              type="date"
              {...register('declaration.date', { required: 'Date is required' })}
              className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
                errors.declaration?.date ? 'border-red-500' : 'border-primary/20 focus:border-primary focus:shadow-glow'
              }`}
            />
            {errors.declaration?.date && (
              <span className="text-xs text-red-500 mt-1 font-semibold">
                {errors.declaration.date.message}
              </span>
            )}
          </div>

          {/* Place */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1.5">Place *</label>
            <input
              type="text"
              placeholder="e.g. Kovilpatti"
              {...register('declaration.place', { required: 'Place is required' })}
              className={`w-full px-4 py-2.5 rounded-nec border bg-white/50 focus:bg-white focus:outline-none transition-all duration-200 ${
                errors.declaration?.place ? 'border-red-500' : 'border-primary/20 focus:border-primary focus:shadow-glow'
              }`}
            />
            {errors.declaration?.place && (
              <span className="text-xs text-red-500 mt-1 font-semibold">
                {errors.declaration.place.message}
              </span>
            )}
          </div>

          {/* Digital Signature Canvas */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 mb-1.5">Digital Signature *</label>
            <Controller
              control={control}
              name="declaration.signature"
              rules={{ required: 'Digital signature is required' }}
              render={({ field }) => (
                <SignaturePad onChange={field.onChange} value={field.value} />
              )}
            />
            {errors.declaration?.signature && (
              <span className="text-xs text-red-500 mt-1.5 font-semibold">
                {errors.declaration.signature.message}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Step8Declaration;
