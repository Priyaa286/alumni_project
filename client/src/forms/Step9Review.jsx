import React from 'react';
import { Edit2, FileText, Image as ImageIcon } from 'lucide-react';

const Step9Review = ({ watch, onEditStep }) => {
  const allData = watch();

  const nominee = allData.nominee || {};
  const professional = allData.professional || {};
  const category = allData.category || '';
  const categoryDetails = allData.categoryDetails || {};
  const contribution = allData.necContribution || {};
  const documents = allData.documents || {};
  const nominator = allData.nominator || {};
  const declaration = allData.declaration || {};
  const nominationType = allData.nominationType || 'self';

  // Formatted category keys for readable output
  const renderDetailKey = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderFileIcon = (url) => {
    const isImage = /\.(jpeg|jpg|png)$/i.test(url);
    if (isImage) return <ImageIcon className="w-4 h-4 text-primary" />;
    return <FileText className="w-4 h-4 text-red-500" />;
  };

  const ReviewSection = ({ title, stepId, children }) => (
    <div className="border border-borderlight bg-white rounded-nec p-5 shadow-premium space-y-4 print-container">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
        <h3 className="font-heading text-base font-bold text-primary tracking-wide uppercase">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => onEditStep(stepId)}
          className="text-xs font-bold text-secondary hover:text-primary flex items-center gap-1 bg-secondary/10 hover:bg-secondary/20 px-3.5 py-1.5 rounded-full transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Section
        </button>
      </div>
      
      {/* Printable Title */}
      <h3 className="font-heading text-lg font-bold text-primary border-b-2 border-primary/20 pb-2 hidden print:block uppercase">
        {title}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {children}
      </div>
    </div>
  );

  const DataItem = ({ label, value }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="font-semibold text-slate-700 leading-relaxed">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="border-b border-borderlight pb-4 no-print">
        <h2 className="font-heading text-xl font-bold text-primary">Review Nomination Details</h2>
        <p className="text-xs text-slate-500 mt-1">Please review all submitted information carefully before final submission.</p>
      </div>

      {/* Step 1: Nominee */}
      <ReviewSection title="1. Nominee Details" stepId="nominee">
        <DataItem label="Full Name" value={nominee.name} />
        <DataItem label="Batch" value={nominee.batch} />
        <DataItem label="Department" value={nominee.department} />
        <DataItem label="Mobile Number" value={nominee.mobile ? `+91 ${nominee.mobile}` : ''} />
        <DataItem label="Email Address" value={nominee.email} />
        <DataItem label="Current City" value={nominee.city} />
        <div className="md:col-span-2">
          <DataItem label="Permanent/Communication Address" value={nominee.address} />
        </div>
        <DataItem label="State" value={nominee.state} />
        <DataItem label="Country" value={nominee.country} />
        <DataItem label="LinkedIn Profile" value={nominee.linkedin} />
        <DataItem label="Registered in NEC Alumni Portal?" value={nominee.isRegisteredAlumni} />
        <DataItem label="Nomination Type" value={nominationType === 'self' ? 'Self Nomination' : 'Nominate Others'} />
      </ReviewSection>

      {/* Step 2: Professional */}
      <ReviewSection title="2. Professional Profile" stepId="professional">
        <DataItem label="Current Designation" value={professional.designation} />
        <DataItem label="Organization Name" value={professional.organization} />
        <DataItem label="Total Work Experience" value={professional.experience ? `${professional.experience} Years` : ''} />
        <DataItem label="Organization Website" value={professional.website} />
        <div className="md:col-span-2">
          <DataItem label="Brief Professional Profile Summary" value={professional.profileSummary} />
        </div>
      </ReviewSection>

      {/* Step 3: Category Select */}
      <ReviewSection title="3. Selected Award Category" stepId="category">
        <div className="md:col-span-2">
          <DataItem label="Award Domain" value={category} />
        </div>
      </ReviewSection>

      {/* Step 4: Category Details */}
      <ReviewSection title={`4. Category Profile (${category || 'None'})`} stepId="categoryDetails">
        {Object.entries(categoryDetails).map(([key, val]) => {
          if (key === 'serviceBook' || key === 'exServiceId') {
            return (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{renderDetailKey(key)}</span>
                {val ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    {renderFileIcon(val)}
                    <a
                      href={val}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline truncate max-w-[200px]"
                    >
                      View Uploaded Document
                    </a>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-400">Not Uploaded</span>
                )}
              </div>
            );
          }
          return (
            <div key={key} className={typeof val === 'string' && val.length > 50 ? 'md:col-span-2' : ''}>
              <DataItem label={renderDetailKey(key)} value={String(val)} />
            </div>
          );
        })}
        {Object.keys(categoryDetails).length === 0 && (
          <div className="md:col-span-2 text-slate-400 italic">No additional category details provided.</div>
        )}
      </ReviewSection>

      {/* Step 5: Contributions */}
      <ReviewSection title="5. Contribution to NEC" stepId="necContribution">
        <div className="md:col-span-2">
          <DataItem 
            label="Contribution Areas Selected" 
            value={contribution.activities && contribution.activities.length > 0 
              ? contribution.activities.join(', ') 
              : 'None Selected'
            } 
          />
        </div>
        <div className="md:col-span-2 mt-2">
          <DataItem label="Detailed Contribution Activities" value={contribution.details} />
        </div>
      </ReviewSection>

      {/* Step 6: Documents */}
      <ReviewSection title="6. Uploaded Supporting Documents" stepId="documents">
        {Object.entries(documents).map(([key, files]) => (
          <div key={key} className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {renderDetailKey(key)}
            </span>
            {files && files.length > 0 ? (
              <div className="space-y-1 mt-1">
                {files.map((url, idx) => {
                  const name = url.slice(url.lastIndexOf('/') + 1);
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {renderFileIcon(url)}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-primary hover:underline truncate max-w-[220px]"
                      >
                        {name.slice(14) || `File-${idx + 1}`}
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-400 italic">No files uploaded</span>
            )}
          </div>
        ))}
      </ReviewSection>

      {/* Step 7: Nominator */}
      <ReviewSection title="7. Nominator Information" stepId="nominator">
        <DataItem label="Nominator Name" value={nominator.name} />
        <DataItem label="Nominator Batch" value={nominator.batch || 'Not Alumnus'} />
        <DataItem label="Department / Affiliation" value={nominator.department || 'External / Other'} />
        <DataItem label="Mobile Number" value={nominator.mobile ? `+91 ${nominator.mobile}` : ''} />
        <div className="md:col-span-2">
          <DataItem label="Email Address" value={nominator.email} />
        </div>
      </ReviewSection>

      {/* Step 8: Declaration */}
      <ReviewSection title="8. Declaration & Digital Signature" stepId="declaration">
        <DataItem label="Signee Name" value={declaration.nomineeName} />
        <DataItem label="Signing Place" value={declaration.place} />
        <DataItem label="Signing Date" value={declaration.date} />
        <div className="md:col-span-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Signature Image
          </span>
          {declaration.signature ? (
            <div className="border border-borderlight rounded-nec bg-white p-2 inline-block max-w-[260px] shadow-sm">
              <img
                src={declaration.signature}
                alt="Digital Signature"
                className="max-h-24 object-contain"
              />
            </div>
          ) : (
            <span className="text-xs text-red-500 italic font-bold">Signature missing</span>
          )}
        </div>
      </ReviewSection>
    </div>
  );
};

export default Step9Review;
