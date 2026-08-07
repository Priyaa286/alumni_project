import React from 'react';
import { Controller } from 'react-hook-form';
import SignaturePad from '../components/SignaturePad';

const Step8Declaration = ({ register, control, formState: { errors } }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary">Declaration</h2>
        <p className="text-xs text-slate-500 mt-1">Please confirm the accuracy of the details and provide a digital signature.</p>
      </div>

      {/* Declaration Checkbox */}
      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-nec cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('declaration.isDeclared', { 
              required: 'You must check the declaration box to proceed' 
            })}
            className="w-5 h-5 mt-0.5 text-primary border-slate-300 rounded focus:ring-primary"
          />
          <span className="text-sm font-semibold text-slate-700 leading-relaxed">
            I hereby declare that all the information provided in this nomination form is true, complete, and accurate to the best of my knowledge. I understand that any false declarations may lead to rejection.
          </span>
        </label>
        {errors?.declaration?.isDeclared && (
          <span className="text-xs text-red-500 font-bold px-1">{errors.declaration.isDeclared.message}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nominee Name (Signed By) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Nominee / Signee Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Confirm full name for signature"
            {...register('declaration.nomineeName', { required: 'Nominee/Signee name is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.declaration?.nomineeName ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.declaration?.nomineeName && (
            <span className="text-xs text-red-500 font-medium">{errors.declaration.nomineeName.message}</span>
          )}
        </div>

        {/* Date Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('declaration.date', { required: 'Date is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border bg-white ${
              errors?.declaration?.date ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.declaration?.date && (
            <span className="text-xs text-red-500 font-medium">{errors.declaration.date.message}</span>
          )}
        </div>

        {/* Place */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Place <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter location (e.g. Kovilpatti)"
            {...register('declaration.place', { required: 'Place is required' })}
            className={`w-full px-4 py-2.5 rounded-nec border ${
              errors?.declaration?.place ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
            } focus:outline-none focus:ring-4 transition-all`}
          />
          {errors?.declaration?.place && (
            <span className="text-xs text-red-500 font-medium">{errors.declaration.place.message}</span>
          )}
        </div>

        {/* Signature Pad */}
        <div className="col-span-1 md:col-span-2">
          <Controller
            name="declaration.signature"
            control={control}
            rules={{ required: 'Digital signature is required' }}
            render={({ field }) => (
              <SignaturePad 
                value={field.value} 
                onChange={field.onChange} 
              />
            )}
          />
          {errors?.declaration?.signature && (
            <span className="text-xs text-red-500 font-bold block mt-1">{errors.declaration.signature.message}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step8Declaration;
