import React, { useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';

const Step8Declaration = ({ register, watch, setValue, formState: { errors }, backOffice = false }) => {
  const signature = watch('declaration.signature') || '';
  const signatureCanvasRef = useRef(null);
  const isDrawingSignatureRef = useRef(false);

  useEffect(() => {
    register('declaration.signature', {
      validate: (value) => Boolean(value) || 'Please sign the application before submitting.'
    });
    if (signature && signatureCanvasRef.current) {
      const image = new Image();
      image.onload = () => {
        const canvas = signatureCanvasRef.current;
        const context = canvas?.getContext('2d');
        if (context) context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = signature;
    }
  }, [register, signature]);

  const signaturePoint = (event) => {
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleSignaturePointerDown = (event) => {
    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext('2d');
    const point = signaturePoint(event);
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.strokeStyle = '#0f172a';
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    isDrawingSignatureRef.current = true;
  };

  const handleSignaturePointerMove = (event) => {
    if (!isDrawingSignatureRef.current) return;
    const point = signaturePoint(event);
    const context = signatureCanvasRef.current.getContext('2d');
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const handleSignaturePointerUp = () => {
    if (!isDrawingSignatureRef.current) return;
    isDrawingSignatureRef.current = false;
    setValue('declaration.signature', signatureCanvasRef.current.toDataURL('image/png'), { shouldValidate: true });
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setValue('declaration.signature', '', { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Declaration & Signature
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Please confirm the accuracy of the details and draw your signature below.
        </p>
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
            placeholder="Confirm full name for nomination"
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
        <div className="flex flex-col gap-2 md:col-span-2">
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
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-bold text-slate-700">Applicant Signature <span className="text-red-500">*</span></label>
          <button type="button" onClick={clearSignature} className="text-xs font-semibold text-primary hover:underline">Clear signature</button>
        </div>
        <canvas
          ref={signatureCanvasRef}
          width={960}
          height={180}
          onPointerDown={handleSignaturePointerDown}
          onPointerMove={handleSignaturePointerMove}
          onPointerUp={handleSignaturePointerUp}
          onPointerCancel={handleSignaturePointerUp}
          className="w-full rounded-xl border border-slate-300 bg-white touch-none"
          aria-label="Draw your signature here"
        />
        <p className="text-xs text-slate-500">Sign above using your mouse, touch screen, or trackpad. This signature is stored with the application.</p>
        {errors?.declaration?.signature && <span className="text-xs font-bold text-red-500">{errors.declaration.signature.message}</span>}
      </div>

      {backOffice && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          The nominee will receive an email to review and approve this back-office nomination before it is marked verified.
        </div>
      )}
    </div>
  );
};

export default Step8Declaration;
