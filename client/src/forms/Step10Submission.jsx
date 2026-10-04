import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Home, CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import SuccessAnimation from '../components/SuccessAnimation';
import { generateAcknowledgementPDF } from '../utils/pdfGenerator';

const Step10Submission = ({ isSubmitting, submittedData, onSubmit, onReset }) => {
  // Party Puff Blast sequence
  const firePartyPuff = useCallback(() => {
    // Stage 1: Central explosion pop
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ffd700'],
      disableForReducedMotion: true
    });

    // Stage 2: Left party cannon burst
    setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.65 },
        colors: ['#7c3aed', '#10b981', '#ffd700', '#3b82f6']
      });
    }, 200);

    // Stage 3: Right party cannon burst
    setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.65 },
        colors: ['#ec4899', '#f59e0b', '#ffd700', '#10b981']
      });
    }, 400);

    // Stage 4: Star shower rain burst
    setTimeout(() => {
      confetti({
        particleCount: 45,
        spread: 120,
        startVelocity: 35,
        decay: 0.92,
        scalar: 1.2,
        shapes: ['star'],
        colors: ['#ffd700', '#f59e0b', '#ec4899'],
        origin: { y: 0.4 }
      });
    }, 700);
  }, []);

  // Trigger party blast upon successful submission mount
  useEffect(() => {
    if (submittedData) {
      firePartyPuff();
    }
  }, [submittedData, firePartyPuff]);

  const handleDownload = () => {
    if (submittedData) {
      generateAcknowledgementPDF(submittedData);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (submittedData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 py-6 max-w-lg mx-auto print-container"
      >
        {/* Success Tick Drawing with Party Puff */}
        <SuccessAnimation />

        <div className="space-y-2">
          
          <h2 className="font-heading text-3xl font-extrabold text-green-600 tracking-tight">
            Thank You!
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            Your nomination has been submitted successfully.
          </p>
        </div>

        {/* Ticket Details Panel */}
        <div className="bg-slate-50 border border-borderlight rounded-nec p-5 shadow-sm space-y-3">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            Nomination ID
          </div>
          <div className="font-heading font-extrabold text-2xl md:text-3xl text-primary tracking-wider">
            {submittedData.nominationId || 'NOM-2026-0001'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium border-t border-slate-200/60 pt-3">
            An acknowledgment receipt has been created. Digital notifications have been queued to the nominee & nominator contact numbers.
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 no-print">
          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-bold text-sm rounded-full btn-glow flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          {/* Print Receipt */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-3 bg-white text-primary border border-primary/20 hover:bg-slate-50 font-bold text-sm rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>

          {/* Go Home */}
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 py-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-bold text-primary">Ready to Submit?</h2>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          You have completed all 9 steps of the nomination wizard. Please verify everything on the review sheet before confirming.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-nec p-4 text-xs font-semibold text-left leading-relaxed">
        IMPORTANT: Once submitted, you will not be able to modify the nomination. A final unique Nomination ID will be generated.
      </div>

      <div className="pt-4">
        {isSubmitting ? (
          <button
            type="button"
            disabled
            className="w-full py-3.5 bg-primary/80 text-white font-bold rounded-full flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting Nomination...
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-heading font-bold rounded-full shadow-premium btn-glow flex items-center justify-center gap-2"
          >
            Submit Nomination
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Step10Submission;
