import React, { useEffect, useState } from 'react';
import { Video, Users, Database, RefreshCw } from 'lucide-react';
import { lookupMemberByEmail } from '../services/api';

const activityTypes = [
  { id: 'Mentoring', label: 'Mentorship and student guidance', icon: Users },
  { id: 'Webinar', label: 'Webinars and guest lectures', icon: Video },
];

const describeRecord = (record) => [
  record.title,
  record.description,
  record.date,
  record.organization,
  record.venue,
  record.speakerName && `Speaker: ${record.speakerName}`,
  record.designation,
  record.participants ? `${record.participants} participants` : '',
].filter(Boolean).join(' — ');

const Step5NECContribution = ({ register, formState: { errors }, watch, setValue }) => {
  const nomineeEmail = watch('nominee.email') || '';
  const selectedActivities = watch('necContribution.activities') || [];
  const details = watch('necContribution.details') || '';
  const [records, setRecords] = useState({ mentoring: [], webinars: [] });
  const [loading, setLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!nomineeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nomineeEmail)) {
      setRecords({ mentoring: [], webinars: [] });
      setLookupMessage('Enter the nominee email in Step 1 to check available records.');
      return undefined;
    }

    setLoading(true);
    lookupMemberByEmail(nomineeEmail)
      .then((response) => {
        if (cancelled) return;
        const fetched = response.data?.contributions || {};
        const mentoring = Array.isArray(fetched.mentoring) ? fetched.mentoring : [];
        const webinars = Array.isArray(fetched.webinars) ? fetched.webinars : [];
        setRecords({ mentoring, webinars });
        setLookupMessage(mentoring.length || webinars.length
          ? 'Records were fetched from the alumni database. Review and correct them below.'
          : 'No mentorship or webinar records are available in the alumni database. Add any missing details manually.');

        const activityMap = { Mentoring: mentoring, Webinar: webinars };
        const existingActivities = watch('necContribution.activities') || [];
        const found = Object.entries(activityMap).filter(([, items]) => items.length).map(([name]) => name);
        if (found.length) {
          setValue('necContribution.activities', [...new Set([...existingActivities, ...found])], { shouldValidate: true });
          const fetchedText = Object.entries(activityMap)
            .filter(([, items]) => items.length)
            .map(([name, items]) => `${name}:\n${items.map(describeRecord).join('\n')}`)
            .join('\n\n');
          const existingText = watch('necContribution.details') || '';
          if (!existingText.includes(fetchedText)) {
            setValue('necContribution.details', existingText.trim() ? `${existingText.trim()}\n\n${fetchedText}` : fetchedText, { shouldValidate: true });
          }
        }
      })
      .catch(() => {
        if (!cancelled) setLookupMessage('Could not fetch alumni activity records. You can enter them manually.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [nomineeEmail, setValue, watch]);

  const allRecords = [...records.mentoring, ...records.webinars];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary">Contribution to NEC</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review database records and add any missing contributions. All details remain editable.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        {loading ? <RefreshCw className="mt-0.5 h-4 w-4 animate-spin text-primary" /> : <Database className="mt-0.5 h-4 w-4 text-primary" />}
        <span>{lookupMessage || (allRecords.length ? `${allRecords.length} activity record(s) found.` : 'Checking the alumni database…')}</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {activityTypes.map(({ id, label, icon: Icon }) => {
          const count = id === 'Mentoring' ? records.mentoring.length : records.webinars.length;
          return (
            <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${selectedActivities.includes(id) ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'}`}>
              <input type="checkbox" value={id} {...register('necContribution.activities')} className="h-4 w-4 accent-purple-700" />
              <Icon className="h-5 w-5 text-primary" />
              <span className="flex-1 text-sm font-semibold text-slate-800">{label}</span>
              <span className="text-xs text-slate-500">{count} records</span>
            </label>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700" htmlFor="nec-contribution-details">Contribution details <span className="text-red-500">*</span></label>
        <textarea
          id="nec-contribution-details"
          rows="8"
          placeholder="Describe mentorship, webinars, or other contributions. Correct any fetched details that are outdated."
          {...register('necContribution.details', { required: 'Please provide contribution details' })}
          className={`w-full rounded-xl border px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-4 ${errors?.necContribution?.details ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-primary/10'}`}
        />
        {errors?.necContribution?.details && <span className="text-xs font-medium text-red-500">{errors.necContribution.details.message}</span>}
        {allRecords.length > 0 && <p className="text-xs text-slate-500">Fetched activity details are editable and can be corrected before submission.</p>}
      </div>
    </div>
  );
};

export default Step5NECContribution;
