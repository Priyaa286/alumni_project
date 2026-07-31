import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Download, Printer, Home, FileText, Landmark } from 'lucide-react';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const nomination = location.state?.nomination;

  useEffect(() => {
    // If accessed directly without form submission, redirect home
    if (!nomination) {
      navigate('/');
      return;
    }

    // Trigger success confetti explosion
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#8A2BE2', '#A64DFF', '#6C2BD9', '#FFD700']
    });
  }, [nomination, navigate]);

  if (!nomination) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-purplebg py-10 px-4 flex flex-col items-center justify-center font-sans">
      
      {/* ---------------- SCREEN VIEW ---------------- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-2xl w-full p-8 text-center rounded-nec relative overflow-hidden print:hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />

        {/* Large Tick Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6 shadow-md"
        >
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </motion.div>

        {/* Success Messages */}
        <h2 className="text-3xl font-extrabold text-gray-900 font-heading mb-2">Thank You!</h2>
        <p className="text-lg text-primary font-semibold font-heading mb-4">
          Your nomination has been submitted successfully.
        </p>

        {/* ID Card Display */}
        <div className="bg-white/70 border border-primary/20 rounded-nec p-6 max-w-sm mx-auto mb-8 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1">
            Nomination ID
          </span>
          <span className="text-2xl font-black text-gray-900 font-heading tracking-wider text-primary">
            {nomination.nominationId}
          </span>
          <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500 font-medium space-y-1">
            <p>Nominee: <strong className="text-gray-700">{nomination.nomineeDetails.name}</strong></p>
            <p>Category: <strong className="text-gray-700">{nomination.awardCategory}</strong></p>
            <p>Submitted On: <strong className="text-gray-700">{formatDate(nomination.createdAt)}</strong></p>
          </div>
        </div>

        {/* Help text */}
        <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          An email confirmation placeholder has been logged. You can download the PDF acknowledgement or print a copy of your entry for your records.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-3 rounded-nec bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-glow transition-all duration-200 cursor-pointer"
          >
            <Download className="w-5 h-5" /> Download PDF / Print
          </button>
          
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 rounded-nec border border-primary/20 bg-white hover:bg-primary/5 text-primary font-bold transition-all duration-200"
          >
            <Home className="w-5 h-5" /> Go Home
          </Link>
        </div>
      </motion.div>

      {/* ---------------- PRINT ACKNOWLEDGEMENT TEMPLATE (HIDDEN ON SCREEN) ---------------- */}
      <div className="hidden print:block w-full max-w-4xl bg-white p-10 font-sans text-gray-800">
        {/* Print Header */}
        <div className="flex items-center justify-between border-b-2 border-primary pb-6 mb-8">
          <div className="flex items-center gap-4">
            {/* Minimal SVG for print rendering */}
            <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center text-primary font-black text-2xl">
              NEC
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 uppercase">National Engineering College</h1>
              <p className="text-xs text-gray-500">K.R. Nagar, Kovilpatti - 628 503</p>
              <p className="text-xs text-gray-500">Autonomous Institution | Est. 1984</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-primary font-heading">NOTABLE ALUMNI AWARD</h2>
            <p className="text-xs text-gray-500">Nomination Portal Receipt</p>
            <p className="text-sm font-black text-primary mt-1">ID: {nomination.nominationId}</p>
          </div>
        </div>

        {/* Content Table Details */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-primary uppercase mb-3 border-b pb-1">1. Nominee Information</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2 text-gray-500 w-1/3">Alumni Name</td><td className="py-2 font-semibold">{nomination.nomineeDetails.name}</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">Batch</td><td className="py-2 font-semibold">{nomination.nomineeDetails.batch}</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">Department</td><td className="py-2 font-semibold">{nomination.nomineeDetails.department}</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">Contact Details</td><td className="py-2 font-semibold">{nomination.nomineeDetails.email} | {nomination.nomineeDetails.mobile}</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">Address</td><td className="py-2 font-semibold">{nomination.nomineeDetails.address}, {nomination.nomineeDetails.city}, {nomination.nomineeDetails.state}, {nomination.nomineeDetails.country}</td></tr>
                <tr><td className="py-2 text-gray-500">Registered in Portal</td><td className="py-2 font-semibold">{nomination.nomineeDetails.registeredInPortal}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-primary uppercase mb-3 border-b pb-1">2. Professional Profile</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2 text-gray-500 w-1/3">Designation</td><td className="py-2 font-semibold">{nomination.professionalProfile.designation}</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">Organization</td><td className="py-2 font-semibold">{nomination.professionalProfile.organization}</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">Experience</td><td className="py-2 font-semibold">{nomination.professionalProfile.experience} Years</td></tr>
                <tr><td className="py-2 text-gray-500">Profile Summary</td><td className="py-2 whitespace-pre-wrap">{nomination.professionalProfile.profileSummary}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-primary uppercase mb-3 border-b pb-1">3. Award Category Details</h3>
            <p className="text-sm font-semibold text-gray-800 mb-2">Category: {nomination.awardCategory}</p>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(nomination.categoryDetails).map(([key, val]) => {
                  if (key.endsWith('Url')) return null;
                  return (
                    <tr key={key} className="border-b">
                      <td className="py-2 text-gray-500 capitalize w-1/3">{key.replace(/([A-Z])/g, ' $1')}</td>
                      <td className="py-2 font-semibold">{String(val)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-primary uppercase mb-3 border-b pb-1">4. Contribution to NEC & Alumni</h3>
            <p className="text-sm font-semibold text-gray-800 mb-2">Activities: {nomination.necContribution.activities?.join(', ') || 'None'}</p>
            <p className="text-sm">{nomination.necContribution.details}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-primary uppercase mb-3 border-b pb-1">5. Nominator Details</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2 text-gray-500 w-1/3">Nominator Name</td><td className="py-2 font-semibold">{nomination.nominatorDetails.name}</td></tr>
                <tr className="border-b"><td className="py-2 text-gray-500">Batch & Dept</td><td className="py-2 font-semibold">{nomination.nominatorDetails.batch} - {nomination.nominatorDetails.department}</td></tr>
                <tr><td className="py-2 text-gray-500">Contact</td><td className="py-2 font-semibold">{nomination.nominatorDetails.email} | {nomination.nominatorDetails.mobile}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Signature and Declaration */}
          <div className="mt-12 flex justify-between items-end border-t pt-8">
            <div className="text-xs text-gray-500 space-y-1">
              <p>Place: {nomination.declaration.place}</p>
              <p>Date: {formatDate(nomination.declaration.date)}</p>
              <p className="font-semibold mt-4">Declared by Nominee: {nomination.declaration.nomineeName}</p>
            </div>
            <div className="text-center">
              {nomination.declaration.signature && (
                <img src={nomination.declaration.signature} alt="Signature" className="h-12 mx-auto mb-2 border border-gray-200 p-1" />
              )}
              <div className="w-48 border-t border-gray-400" />
              <p className="text-xs font-bold text-gray-600 mt-2">Digital Signature</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-xs text-gray-400 border-t pt-4">
          This is a computer-generated confirmation receipt. NEC Alumni Association, Kovilpatti.
        </div>
      </div>

    </div>
  );
};

export default SuccessPage;
