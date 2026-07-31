import React from 'react';
import { PencilLine, FileText } from 'lucide-react';

const Step9Review = ({ watch, goToStep }) => {
  const allData = watch();
  
  const nominee = allData.nomineeDetails || {};
  const professional = allData.professionalProfile || {};
  const category = allData.awardCategory;
  const categoryDetails = allData.categoryDetails || {};
  const contribution = allData.necContribution || {};
  const documents = allData.supportingDocuments || [];
  const nominator = allData.nominatorDetails || {};
  const declaration = allData.declaration || {};

  const renderSectionHeader = (title, stepNum) => (
    <div className="flex justify-between items-center border-b border-primary/10 pb-2 mb-3 mt-6 first:mt-0">
      <h4 className="text-md font-bold text-primary font-heading uppercase tracking-wide">{title}</h4>
      <button
        type="button"
        onClick={() => goToStep(stepNum)}
        className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-primary transition-colors cursor-pointer border border-primary/20 hover:border-primary/50 px-2.5 py-1 rounded-nec bg-white/40 hover:bg-white"
      >
        <PencilLine className="w-3.5 h-3.5" />
        Edit Step {stepNum}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-primary/10 pb-4">
        <h3 className="text-xl font-bold text-gray-900 font-heading">Review Nomination</h3>
        <p className="text-sm text-gray-500">Review all details before submitting. You can edit any step by clicking its button.</p>
      </div>

      <div className="space-y-8 max-h-[550px] overflow-y-auto pr-2">

        {/* SECTION 1: NOMINEE DETAILS */}
        <div>
          {renderSectionHeader('Nominee Details', 1)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-white/40 p-4 rounded-nec border border-primary/10">
            <div><span className="text-gray-500 font-medium">Name:</span> <span className="font-semibold text-gray-800">{nominee.name}</span></div>
            <div><span className="text-gray-500 font-medium">Batch:</span> <span className="font-semibold text-gray-800">{nominee.batch}</span></div>
            <div><span className="text-gray-500 font-medium">Department:</span> <span className="font-semibold text-gray-800">{nominee.department}</span></div>
            <div><span className="text-gray-500 font-medium">Mobile Number:</span> <span className="font-semibold text-gray-800">{nominee.mobile}</span></div>
            <div><span className="text-gray-500 font-medium">Email ID:</span> <span className="font-semibold text-gray-800">{nominee.email}</span></div>
            <div><span className="text-gray-500 font-medium">Current City:</span> <span className="font-semibold text-gray-800">{nominee.city}</span></div>
            <div><span className="text-gray-500 font-medium">State:</span> <span className="font-semibold text-gray-800">{nominee.state}</span></div>
            <div><span className="text-gray-500 font-medium">Country:</span> <span className="font-semibold text-gray-800">{nominee.country}</span></div>
            <div className="md:col-span-2"><span className="text-gray-500 font-medium">Address:</span> <span className="font-semibold text-gray-800">{nominee.address}</span></div>
            <div className="md:col-span-2"><span className="text-gray-500 font-medium">LinkedIn Profile:</span> <span className="font-semibold text-gray-800 truncate block md:inline-block max-w-xs lg:max-w-md">{nominee.linkedin || 'N/A'}</span></div>
            <div><span className="text-gray-500 font-medium">Registered in Portal:</span> <span className="font-semibold text-gray-800">{nominee.registeredInPortal}</span></div>
          </div>
        </div>

        {/* SECTION 2: PROFESSIONAL PROFILE */}
        <div>
          {renderSectionHeader('Professional Profile', 2)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-white/40 p-4 rounded-nec border border-primary/10">
            <div><span className="text-gray-500 font-medium">Designation:</span> <span className="font-semibold text-gray-800">{professional.designation}</span></div>
            <div><span className="text-gray-500 font-medium">Organization:</span> <span className="font-semibold text-gray-800">{professional.organization}</span></div>
            <div><span className="text-gray-500 font-medium">Total Experience:</span> <span className="font-semibold text-gray-800">{professional.experience} Years</span></div>
            <div><span className="text-gray-500 font-medium">Website:</span> <span className="font-semibold text-gray-800">{professional.website || 'N/A'}</span></div>
            <div className="md:col-span-2 mt-2">
              <span className="text-gray-500 font-medium block mb-1">Brief Profile Summary:</span>
              <p className="font-sans text-gray-700 bg-white/50 p-3 rounded-lg border border-primary/5 whitespace-pre-wrap leading-relaxed">
                {professional.profileSummary}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: AWARD CATEGORY */}
        <div>
          {renderSectionHeader('Award Category', 3)}
          <div className="text-sm bg-white/40 p-4 rounded-nec border border-primary/10">
            <span className="text-gray-500 font-medium">Selected Category:</span>{' '}
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded-full font-heading">
              {category}
            </span>
          </div>
        </div>

        {/* SECTION 4: CATEGORY DETAILS */}
        {category && (
          <div>
            {renderSectionHeader('Category-Specific Details', 4)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-white/40 p-4 rounded-nec border border-primary/10">
              {Object.entries(categoryDetails).map(([key, val]) => {
                if (key.endsWith('Url')) {
                  return (
                    <div key={key} className="md:col-span-2 flex items-center gap-2">
                      <span className="text-gray-500 font-medium capitalize">{key.replace('Url', '')} Uploaded:</span>
                      <span className="text-green-600 font-bold flex items-center gap-1"><FileText className="w-4 h-4"/> Yes</span>
                    </div>
                  );
                }
                return (
                  <div key={key} className={typeof val === 'string' && val.length > 50 ? 'md:col-span-2' : ''}>
                    <span className="text-gray-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                    <span className="font-semibold text-gray-800 whitespace-pre-wrap">{val || 'N/A'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 5: NEC CONTRIBUTION */}
        <div>
          {renderSectionHeader('Contribution to NEC', 5)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-white/40 p-4 rounded-nec border border-primary/10">
            <div className="md:col-span-2">
              <span className="text-gray-500 font-medium block mb-1">Indicated Activities:</span>
              <div className="flex flex-wrap gap-2">
                {contribution.activities && contribution.activities.length > 0 ? (
                  contribution.activities.map((act, idx) => (
                    <span key={idx} className="bg-primary/5 text-primary text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/10">
                      {act}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-xs italic">No activities selected</span>
                )}
              </div>
            </div>
            <div className="md:col-span-2 mt-2">
              <span className="text-gray-500 font-medium block mb-1">Contribution Details:</span>
              <p className="font-sans text-gray-700 bg-white/50 p-3 rounded-lg border border-primary/5 whitespace-pre-wrap leading-relaxed">
                {contribution.details}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 6: SUPPORTING DOCUMENTS */}
        <div>
          {renderSectionHeader('Supporting Documents', 6)}
          <div className="bg-white/40 p-4 rounded-nec border border-primary/10 text-sm">
            {documents.length === 0 ? (
              <p className="text-gray-500 italic text-xs">No documents uploaded.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/5 bg-white/80">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-gray-800 text-xs truncate" title={doc.fileName}>{doc.fileName}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{doc.fieldName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 7: NOMINATOR DETAILS */}
        <div>
          {renderSectionHeader('Nominator Details', 7)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-white/40 p-4 rounded-nec border border-primary/10">
            <div><span className="text-gray-500 font-medium">Nominated By:</span> <span className="font-semibold text-gray-800">{nominator.name}</span></div>
            <div><span className="text-gray-500 font-medium">Batch:</span> <span className="font-semibold text-gray-800">{nominator.batch}</span></div>
            <div><span className="text-gray-500 font-medium">Department:</span> <span className="font-semibold text-gray-800">{nominator.department}</span></div>
            <div><span className="text-gray-500 font-medium">Mobile Number:</span> <span className="font-semibold text-gray-800">{nominator.mobile}</span></div>
            <div className="md:col-span-2"><span className="text-gray-500 font-medium">Email ID:</span> <span className="font-semibold text-gray-800">{nominator.email}</span></div>
          </div>
        </div>

        {/* SECTION 8: DECLARATION */}
        <div>
          {renderSectionHeader('Declaration & Signature', 8)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm bg-white/40 p-4 rounded-nec border border-primary/10">
            <div><span className="text-gray-500 font-medium">Nominee Name:</span> <span className="font-semibold text-gray-800">{declaration.nomineeName}</span></div>
            <div><span className="text-gray-500 font-medium">Date:</span> <span className="font-semibold text-gray-800">{declaration.date}</span></div>
            <div><span className="text-gray-500 font-medium">Place:</span> <span className="font-semibold text-gray-800">{declaration.place}</span></div>
            <div><span className="text-gray-500 font-medium">Declaration Agreed:</span> <span className="font-semibold text-green-600">Yes</span></div>
            
            <div className="md:col-span-2">
              <span className="text-gray-500 font-medium block mb-1">Digital Signature:</span>
              <div className="border border-primary/10 bg-white rounded-nec p-2 w-fit max-w-[250px]">
                {declaration.signature ? (
                  <img src={declaration.signature} alt="Signature Preview" className="h-14" />
                ) : (
                  <span className="text-xs text-red-500 font-semibold italic">Missing Signature</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Step9Review;
