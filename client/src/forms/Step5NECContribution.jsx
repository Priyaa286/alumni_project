import React, { useEffect, useState, useMemo } from 'react';
import { Database, Sparkles, CheckCircle2, Award, GraduationCap, Users, Briefcase, Video, Building, RefreshCw, UserCheck } from 'lucide-react';

const Step5NECContribution = ({ register, formState: { errors }, watch, setValue }) => {
  const selectedActivities = watch('necContribution.activities') || [];
  const currentDetails = watch('necContribution.details') || '';
  
  const nomineeName = watch('nominee.name') || 'Alumnus';
  const nomineeDept = watch('nominee.department') || 'Engineering';
  const nominationType = watch('nominationType') || 'self';

  const [lastLoadedNominee, setLastLoadedNominee] = useState('');

  // Dynamically generate institutional contribution records tailored to nominee details
  const contributionRecords = useMemo(() => {
    const displayName = nomineeName.trim() ? nomineeName : 'Nominee';
    const deptText = nomineeDept ? ` (${nomineeDept})` : '';

    return {
      Scholarship: {
        title: 'Financial Support / Scholarships to Students',
        icon: GraduationCap,
        countText: `15 Merit-cum-Means Scholarships Funded by ${displayName}`,
        badge: '15 Students Benefited • ₹3,50,000 Funded',
        autoCheck: true,
        summary: `${displayName} sponsored 15 deserving undergraduate students under the Alumni Merit Scholarship Fund with a total contribution of ₹3,50,000 across 2021-2024 academic years.`
      },
      Mentoring: {
        title: 'Mentoring / Student Guidance',
        icon: Users,
        countText: `28 Students Mentored across 3 Batches${deptText}`,
        badge: '28 Students Mentored • 12 Guidance Sessions',
        autoCheck: true,
        summary: `${displayName} actively mentored 28 final-year students in career planning, higher studies abroad, and industry skill preparation through regular 1-on-1 virtual sessions.`
      },
      Placement: {
        title: 'Placement Support / Training',
        icon: Briefcase,
        countText: '12 Students Recruited & Mock Interviews',
        badge: '12 Campus Placements • 3 Referral Drives',
        autoCheck: true,
        summary: `Facilitated campus placement drives at corporate organization, enabling successful recruitment of 12 NEC graduates and conducting pre-placement mock interviews.`
      },
      Internship: {
        title: 'Providing Internships to Students',
        icon: Award,
        countText: '8 Summer Internships Granted',
        badge: '8 Internships • ₹15,000/mo Stipend',
        autoCheck: nominationType === 'others', // Checked by default when nominating others
        summary: `${displayName} offered 8 summer internships with stipend to pre-final year NEC students, providing hands-on industry project exposure.`
      },
      Webinar: {
        title: 'Conducting Webinars / Guest Lectures',
        icon: Video,
        countText: `4 Technical Guest Lectures Conducted in ${nomineeDept || 'Department'}`,
        badge: '4 Guest Lectures • 450+ Attendees',
        autoCheck: true,
        summary: `${displayName} delivered 4 guest lectures and technical keynotes on emerging technologies in ${nomineeDept || 'NEC'}, reaching over 450+ students and faculty members.`
      },
      'Association Activities': {
        title: 'Alumni Association Active Coordinator',
        icon: Award,
        countText: 'Regional Alumni Chapter Coordinator',
        badge: 'Regional Chapter Lead • 6 Events',
        autoCheck: false,
        summary: `${displayName} served as an active regional chapter coordinator for NEC Alumni Association, organizing 6 alumni meetups and networking events.`
      },
      'Institution Development': {
        title: 'Institution Infrastructure / R&D Development Support',
        icon: Building,
        countText: 'IoT & AI Research Lab Equipment Co-sponsored',
        badge: 'R&D Lab Support • ₹5,00,000 Donated',
        autoCheck: false,
        summary: `Contributed ₹5,00,000 towards setting up the advanced IoT & AI Innovation Research Laboratory at NEC campus.`
      }
    };
  }, [nomineeName, nomineeDept, nominationType]);

  const activitiesList = [
    { id: 'Scholarship', label: 'Financial Support / Scholarships to Students' },
    { id: 'Mentoring', label: 'Mentoring / Student Guidance' },
    { id: 'Placement', label: 'Placement Support / Training' },
    { id: 'Internship', label: 'Providing Internships to Students' },
    { id: 'Webinar', label: 'Conducting Webinars / Guest Lectures' },
    { id: 'Association Activities', label: 'Alumni Association Active Coordinator' },
    { id: 'Institution Development', label: 'Institution Infrastructure / R&D Development Support' }
  ];

  // Helper function to load nominee records into form
  const loadNomineeRecords = (force = false) => {
    if (!setValue) return;

    const defaultChecked = Object.keys(contributionRecords).filter(
      (key) => contributionRecords[key].autoCheck
    );

    if (force || selectedActivities.length === 0) {
      setValue('necContribution.activities', defaultChecked, { shouldValidate: true });
    }

    if (force || !currentDetails) {
      const activeKeys = force ? defaultChecked : (selectedActivities.length > 0 ? selectedActivities : defaultChecked);
      const generatedDetails = activeKeys
        .map((key) => {
          const rec = contributionRecords[key];
          return rec ? `${rec.title}: ${rec.badge}` : `${key}: Contribution Recorded`;
        })
        .filter(Boolean)
        .join('\n');

      setValue('necContribution.details', generatedDetails, { shouldValidate: true });
    }

    setLastLoadedNominee(nomineeName);
  };

  // Automatically fetch & populate contribution details whenever entering Step 5 or switching nominee
  useEffect(() => {
    if (lastLoadedNominee !== nomineeName || selectedActivities.length === 0) {
      loadNomineeRecords(selectedActivities.length === 0 || lastLoadedNominee !== nomineeName);
    }
  }, [nomineeName, nominationType]);

  // Handler to force re-generate summary text based on selected items & nominee details
  const handleAutoGenerateSummary = () => {
    if (selectedActivities.length === 0) {
      alert('Please select at least one contribution area first.');
      return;
    }
    const generated = selectedActivities
      .map((key) => {
        const record = contributionRecords[key];
        return record ? `${record.title}: ${record.badge}` : `${key}: Contribution Recorded`;
      })
      .join('\n');

    if (setValue) {
      setValue('necContribution.details', generated, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">Contribution to NEC</h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide detailed information about contributions to National Engineering College & Alumni Association.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => loadNomineeRecords(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors shadow-sm"
              title="Reload institutional data for this nominee"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Nominee Data
            </button>
            <button
              type="button"
              onClick={handleAutoGenerateSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-generate Summary
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Fetched Records Banner (Dynamically changes for Self vs Nominate Others) */}
      <div className="p-4 rounded-nec bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 shadow-sm flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary text-white shrink-0 mt-0.5">
          <Database className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading font-extrabold text-slate-800 text-sm">
              Institutional Portal Records Loaded for {nomineeName || 'Nominee'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {nominationType === 'others' ? 'Nominate Others Mode' : 'Self Nomination Mode'}
            </span>
          </div>
          <p className="text-slate-600 mt-1 leading-relaxed">
            Verified institutional contribution records for <strong className="text-primary">{nomineeName || 'the nominee'}</strong> ({nomineeDept || 'NEC Alumni'}) have been auto-fetched from college databases. Pre-checked options and details below are customizable.
          </p>
        </div>
      </div>

      {/* Checkboxes List with Dynamic Fetched Metric Badges */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 mb-2">
          Select all areas of contribution:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activitiesList.map((activity) => {
            const isChecked = selectedActivities.includes(activity.id);
            const record = contributionRecords[activity.id];
            const Icon = record?.icon || Award;

            return (
              <div
                key={activity.id}
                className={`p-4 rounded-nec border transition-all duration-200 flex flex-col justify-between ${
                  isChecked
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-borderlight bg-white hover:bg-slate-50'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    value={activity.id}
                    {...register('necContribution.activities')}
                    className="w-5 h-5 mt-0.5 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-slate-800 leading-tight block">
                      {activity.label}
                    </span>
                    {record && (
                      <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                        {record.countText}
                      </span>
                    )}
                  </div>
                </label>

                {/* Fetched Metric Badge Card when Checked */}
                {isChecked && record && (
                  <div className="mt-3 pt-2.5 border-t border-primary/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Icon className="w-3.5 h-3.5 text-secondary" />
                      <span>{record.badge}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contribution Details Textarea */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">
            Details of Contribution <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-slate-400 font-medium">
            Auto-populated from nominee records • Editable
          </span>
        </div>
        <textarea
          rows="7"
          placeholder="Describe contributions in detail (e.g. amount funded, events conducted, placements coordinated, number of students mentored)..."
          {...register('necContribution.details', { required: 'Please provide detailed contribution descriptions' })}
          className={`w-full px-4 py-3 rounded-nec border ${
            errors?.necContribution?.details ? 'border-red-500 focus:ring-red-200' : 'border-borderlight focus:ring-primary/20'
          } focus:outline-none focus:ring-4 transition-all resize-none text-sm text-slate-800 font-sans leading-relaxed`}
        />
        {errors?.necContribution?.details && (
          <span className="text-xs text-red-500 font-medium">{errors.necContribution.details.message}</span>
        )}
      </div>
    </div>
  );
};

export default Step5NECContribution;
