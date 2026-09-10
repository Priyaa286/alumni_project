import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, XCircle, Clock, ShieldCheck, FileText, 
  ExternalLink, User, Briefcase, Award, HeartHandshake, AlertCircle, 
  Building2, GraduationCap, Mail, Phone, MapPin, Send, CheckSquare, Square, Eye, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getNomination, verifyNomination, getAllNominations } from '../services/api';

const NomineeVerification = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifiedDocs, setVerifiedDocs] = useState(new Set());
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  const fetchNominationData = async () => {
    setLoading(true);
    try {
      // 1. Try single item endpoint
      const res = await getNomination(id);
      if (res && res.success && res.data) {
        setNomination(res.data);
        if (res.data.verifiedDocuments) {
          setVerifiedDocs(new Set(res.data.verifiedDocuments));
        }
      } else {
        // Fallback: search in list
        const listRes = await getAllNominations();
        const found = listRes.data?.find(n => n._id === id || n.nominationId === id);
        if (found) {
          setNomination(found);
          if (found.verifiedDocuments) {
            setVerifiedDocs(new Set(found.verifiedDocuments));
          }
        } else {
          toast.error('Nomination details not found.');
        }
      }
    } catch (err) {
      console.warn('Error fetching nomination by ID:', err);
      toast.error('Failed to load nomination data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominationData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 space-y-4">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-base font-bold text-slate-700">Loading Nominee Details & Documents...</p>
      </div>
    );
  }

  if (!nomination) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Nomination Record Not Found</h2>
        <p className="text-sm text-slate-500">The requested nomination record does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/admin/responses')}
          className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </button>
      </div>
    );
  }

  const nominee = nomination.nominee || {};
  const professional = nomination.professional || {};
  const categoryDetails = nomination.categoryDetails || {};
  const contribution = nomination.necContribution || {};
  const documents = nomination.documents || {};
  const nominator = nomination.nominator || {};
  const declaration = nomination.declaration || {};
  const vStatus = nomination.verificationStatus || 'Not Verified';

  // Extract all uploaded document entries into flat array
  const allDocList = [];
  Object.entries(documents).forEach(([docKey, docUrls]) => {
    if (Array.isArray(docUrls)) {
      docUrls.forEach((url, idx) => {
        if (url) {
          const docName = url.slice(url.lastIndexOf('/') + 1) || `${docKey}-${idx + 1}`;
          allDocList.push({
            id: url,
            categoryKey: docKey,
            name: docName,
            url
          });
        }
      });
    }
  });

  const toggleDocVerification = (docUrl) => {
    setVerifiedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docUrl)) {
        next.delete(docUrl);
      } else {
        next.add(docUrl);
      }
      return next;
    });
  };

  const toggleAllDocs = () => {
    if (verifiedDocs.size === allDocList.length) {
      setVerifiedDocs(new Set());
    } else {
      setVerifiedDocs(new Set(allDocList.map(d => d.url)));
    }
  };

  // Decision Handler: Approve or Reject
  const handleDecision = async (verificationStatus) => {
    if (verificationStatus === 'Rejected' && !rejectionReason.trim()) {
      toast.error('Please enter a reason for rejecting the nomination.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await verifyNomination(id, {
        verificationStatus,
        rejectionReason: verificationStatus === 'Rejected' ? rejectionReason : '',
        verifiedDocuments: Array.from(verifiedDocs)
      });

      if (res && res.success) {
        toast.success(
          verificationStatus === 'Approved'
            ? "Nominee verified & approved successfully! Real-time approval email sent."
            : "Nomination rejected and rejection notification sent to nominee."
        );
        setIsRejectModalOpen(false);
        fetchNominationData();
      } else {
        toast.error(res.message || 'Failed to update verification status.');
      }
    } catch (err) {
      console.error('Error submitting decision:', err);
      toast.error(err.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/responses')}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Back to Admin Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl md:text-2xl font-extrabold text-slate-900">
                {nominee.name || nomination.nomineeName || 'Nominee Details'}
              </h1>
              <span className="font-mono text-xs text-primary font-bold px-2.5 py-1 bg-primary/10 rounded-full border border-primary/20">
                {nomination.nominationId || 'NOM-2026'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Batch {nominee.batch || 'N/A'}</span>
              <span>•</span>
              <span>{nominee.department || 'NEC Alumni'}</span>
            </p>
          </div>
        </div>

        {/* Verification Tag & Status */}
        <div className="flex items-center gap-3">
          {vStatus === 'Approved' ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Approved ✓
            </span>
          ) : vStatus === 'Rejected' ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
              <XCircle className="w-4 h-4 text-rose-600" />
              Rejected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <Clock className="w-4 h-4 text-amber-600" />
              Verification Pending
            </span>
          )}

          <button
            onClick={() => navigate('/leaderboard')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols wide) - Nominee Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Personal & Contact */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-primary" />
              1. Personal & Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Full Name</span>
                <span className="font-semibold text-slate-800">{nominee.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Graduation Batch</span>
                <span className="font-semibold text-slate-800">Batch {nominee.batch || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Department</span>
                <span className="font-semibold text-slate-800">{nominee.department || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Alumni Portal Registered?</span>
                <span className="font-semibold text-slate-800">{nominee.isRegisteredAlumni || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Email Address</span>
                <span className="font-semibold text-primary">{nominee.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Mobile Number</span>
                <span className="font-semibold text-slate-800">{nominee.mobile ? `+91 ${nominee.mobile}` : 'N/A'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs font-bold text-slate-400 block uppercase">Communication Address</span>
                <span className="font-semibold text-slate-800">{nominee.address || 'N/A'}, {nominee.city}, {nominee.state}, {nominee.country}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Professional Profile */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-4 h-4 text-primary" />
              2. Professional Profile & Experience
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Current Designation</span>
                <span className="font-semibold text-slate-800">{professional.designation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Organization</span>
                <span className="font-semibold text-slate-800">{professional.organization || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Total Experience</span>
                <span className="font-semibold text-slate-800">{professional.experience ? `${professional.experience} Years` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Website</span>
                <span className="font-semibold text-slate-800">{professional.website || 'N/A'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Profile Summary</span>
                <p className="text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                  {professional.profileSummary || 'No summary provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Award Category Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-4 h-4 text-primary" />
              3. Category Profile: <span className="text-purple-700">{nomination.category || 'General'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {Object.entries(categoryDetails).map(([key, val]) => (
                <div key={key} className={typeof val === 'string' && val.length > 60 ? 'md:col-span-2' : ''}>
                  <span className="text-xs font-bold text-slate-400 block uppercase">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-semibold text-slate-800">{String(val)}</span>
                </div>
              ))}
              {Object.keys(categoryDetails).length === 0 && (
                <div className="text-slate-400 italic text-xs">No extra category details provided.</div>
              )}
            </div>
          </div>

          {/* Card 4: Contributions to NEC */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <HeartHandshake className="w-4 h-4 text-primary" />
              4. Contributions to National Engineering College
            </h3>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 block uppercase">
                Selected Contribution Areas ({contribution.activities?.length || 0})
              </span>
              {contribution.activities && contribution.activities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contribution.activities.map((act) => (
                    <span key={act} className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
                      ✓ {act}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No contribution areas checked.</p>
              )}

              {contribution.details && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Detailed Notes</span>
                  <p className="text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                    {contribution.details}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide) - Document Verification & Decision Control */}
        <div className="space-y-6">
          
          {/* Document Verification Checkboxes Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Document Verification
              </h3>
              <button
                onClick={toggleAllDocs}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                {verifiedDocs.size === allDocList.length ? 'Uncheck All' : 'Check All'}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Please review each uploaded document. Mark the checkbox next to verified authentic documents before making a final decision.
            </p>

            {/* List of uploaded documents */}
            {allDocList.length > 0 ? (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {allDocList.map((doc) => {
                  const isChecked = verifiedDocs.has(doc.url);
                  return (
                    <div
                      key={doc.url}
                      className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3 ${
                        isChecked 
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div 
                        onClick={() => toggleDocVerification(doc.url)}
                        className="flex items-center gap-2.5 min-w-0 flex-1"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">{doc.categoryKey}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDoc(doc);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-primary text-xs font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer border border-purple-200"
                        title="View Document Inline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400 italic">
                No supporting documents were uploaded for this nomination.
              </div>
            )}

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 font-bold flex items-center justify-between">
              <span>Verified Documents:</span>
              <span className="text-sm font-extrabold text-primary">{verifiedDocs.size} / {allDocList.length}</span>
            </div>

            {/* Decision Buttons */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Admin Decision Actions
              </h4>

              {/* Accept & Reject Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDecision('Approved')}
                  disabled={submitting}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept & Approve
                </button>

                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={submitting}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Document Viewer Modal (No Download - View & Verify inline) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-4 md:px-6 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-purple-500/20 rounded-xl text-purple-300 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="font-heading font-extrabold text-sm md:text-base text-white truncate">
                    {viewingDoc.name}
                  </h3>
                  <span className="text-[10px] font-bold tracking-wider text-purple-300 uppercase block">
                    Category: {viewingDoc.categoryKey}
                  </span>
                </div>
              </div>

              {/* Verification Mark Toggle & Close Button */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleDocVerification(viewingDoc.url)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                    verifiedDocs.has(viewingDoc.url)
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400'
                      : 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-400'
                  }`}
                >
                  {verifiedDocs.has(viewingDoc.url) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified ✓</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      <span>Mark as Verified</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Document Viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Viewer Body */}
            <div className="flex-1 bg-slate-900 flex items-center justify-center overflow-auto p-2 min-h-[450px] relative">
              {(() => {
                const urlLower = viewingDoc.url.toLowerCase();
                const fullUrl = viewingDoc.url.startsWith('http') || viewingDoc.url.startsWith('/') 
                  ? viewingDoc.url 
                  : `/${viewingDoc.url}`;

                if (urlLower.match(/\.(jpeg|jpg|png|gif|webp|svg)($|\?)/)) {
                  return (
                    <img 
                      src={fullUrl} 
                      alt={viewingDoc.name} 
                      className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl" 
                    />
                  );
                }

                if (urlLower.match(/\.pdf($|\?)/)) {
                  return (
                    <iframe
                      src={fullUrl}
                      title={viewingDoc.name}
                      className="w-full h-[75vh] rounded-xl border-0 bg-white"
                    />
                  );
                }

                // Fallback for DOCX / DOC / Other format files (Google Docs Viewer embed or inline viewer)
                const targetHttpUrl = fullUrl.startsWith('http') ? fullUrl : `${window.location.origin}${fullUrl}`;
                const gdocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(targetHttpUrl)}&embedded=true`;

                return (
                  <div className="w-full h-[75vh] bg-white rounded-xl overflow-hidden relative flex flex-col">
                    <iframe
                      src={gdocsViewerUrl}
                      title={viewingDoc.name}
                      className="w-full h-full border-0"
                    />
                    <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-600 flex items-center justify-between px-6">
                      <span>Viewing document preview inline without download.</span>
                      <span className="font-semibold text-primary">{viewingDoc.name}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-semibold">
                  Verification Status: {verifiedDocs.has(viewingDoc.url) ? 'Verified Document (Checked)' : 'Not Yet Verified'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-rose-700 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Reject Nomination
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please enter the reason for rejecting or disqualifying this nomination. This reason will be sent to the nominee in a polite email notification.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (e.g. Uploaded service documents could not be verified against college records)."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDecision('Rejected')}
                disabled={submitting || !rejectionReason.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm Rejection & Send Mail'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NomineeVerification;
