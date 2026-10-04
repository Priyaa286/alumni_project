import React, { useRef, useState, useEffect } from 'react';

const SignaturePad = ({ value, onChange }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Initialize canvas with proper scale for high DPI screens
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set brush options
    ctx.strokeStyle = '#8A2BE2'; // primary color
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If an existing signature value is loaded (e.g. from local storage), load it on the canvas
    if (value) {
      const img = new Image();
      img.src = value;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      setIsEmpty(false);
    }
  }, [value]);

  // Handle window resizing or canvas container size alignment
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Support touch and mouse coordinates
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export the drawing as a base64 image string
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(''); // reset value in React Hook Form
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-bold text-slate-700 tracking-wide">
        Digital Signature <span className="text-red-500">*</span>
      </label>
      
      <div className="border border-borderlight rounded-nec overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          className="w-full h-[180px] bg-white cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-slate-400 italic">
          {isEmpty ? 'Sign inside the canvas box above' : 'Signature captured successfully'}
        </span>
        <button
          type="button"
          onClick={clearCanvas}
          className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors uppercase py-1 px-3 border border-red-200 hover:bg-red-50 rounded-full"
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
