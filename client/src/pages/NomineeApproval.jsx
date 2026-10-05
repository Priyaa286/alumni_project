import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { getNomineeApproval, respondToNomineeApproval } from '../services/api';

const NomineeApproval = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [nomination, setNomination] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getNomineeApproval(token)
      .then((response) => {
        if (!cancelled) {
          setNomination(response.data);
          setStatus('ready');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(error.response?.data?.message || 'This approval link is invalid or has expired.');
          setStatus('error');
        }
      });
    return () => { cancelled = true; };
  }, [token]);

  const decide = async (decision) => {
    setStatus('saving');
    try {
      const response = await respondToNomineeApproval(token, decision);
      setMessage(response.message || 'Your response has been saved.');
      setStatus(decision === 'approve' ? 'approved' : 'declined');
    } catch (error) {
      setMessage(error.response?.data?.message || 'This approval link is invalid or has expired. Contact the Alumni Association office for a new link.');
      setStatus('error');
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="text-2xl font-extrabold text-slate-900">Nomination approval</h1>
        {status === 'loading' ? (
          <p className="mt-4 text-sm text-slate-600">Loading nomination details…</p>
        ) : status === 'ready' || status === 'saving' ? (
          <>
            <p className="mt-3 text-sm leading-6 text-slate-600">The NEC Alumni Association office has prepared a nomination using your alumni details. Choose whether you approve being nominated.</p>
            {nomination && <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left text-sm">
              <div><span className="text-xs font-bold uppercase text-slate-500">Nomination</span><p className="font-bold text-slate-900">{nomination.nominationId} · {nomination.category}</p></div>
              <div><span className="text-xs font-bold uppercase text-slate-500">Your details</span><p>{nomination.nominee?.name} · Batch {nomination.nominee?.batch} · {nomination.nominee?.department}</p><p>{nomination.professional?.designation} at {nomination.professional?.organization}</p></div>
              <div><span className="text-xs font-bold uppercase text-slate-500">Contact details</span><p>{nomination.nominee?.email} · {nomination.nominee?.mobile}</p><p>{[nomination.nominee?.city, nomination.nominee?.state, nomination.nominee?.country].filter(Boolean).join(', ')}</p></div>
              {nomination.professional?.profileSummary && <div><span className="text-xs font-bold uppercase text-slate-500">Professional profile</span><p className="whitespace-pre-wrap">{nomination.professional.profileSummary}</p></div>}
              {nomination.categoryDetails && <div><span className="text-xs font-bold uppercase text-slate-500">Award category details</span><dl className="mt-1 space-y-1">{Object.entries(nomination.categoryDetails).map(([key, value]) => <div key={key}><dt className="inline font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}: </dt><dd className="inline">{Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '')}</dd></div>)}</dl></div>}
              <div><span className="text-xs font-bold uppercase text-slate-500">Contribution summary</span><p className="whitespace-pre-wrap">{nomination.necContribution?.details || 'No contribution details provided.'}</p></div>
            </div>}
            {status === 'saving' && <p className="mt-4 text-sm font-semibold text-primary">Saving your response…</p>}
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => decide('approve')} disabled={status === 'saving'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />Approve nomination</button>
              <button type="button" onClick={() => decide('decline')} disabled={status === 'saving'} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 disabled:opacity-50"><XCircle className="h-4 w-4" />Decline</button>
            </div>
          </>
        ) : (
          <p className={`mt-4 text-sm leading-6 ${status === 'error' ? 'text-rose-700' : 'text-slate-600'}`}>{message}</p>
        )}
      </section>
    </main>
  );
};

export default NomineeApproval;
