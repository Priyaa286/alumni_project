import React, { useState } from 'react';
import { uploadFile } from '../services/api';
import { toast } from 'react-toastify';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

const Step4CategoryDetails = ({ register, formState: { errors }, watch, setValue }) => {
  const category = watch('category');
  const categoryDetails = watch('categoryDetails') || {};
  const [uploadingField, setUploadingField] = useState(null);

  // File upload handler for Retired Service uploads
  const handleCategoryFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(fileExt)) {
      toast.error('Invalid file type. Only PDF, DOCX, PNG, and JPEG are allowed.');
      return;
    }

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds the maximum 10MB size limit.');
      return;
    }

    try {
      setUploadingField(fieldName);
      const res = await uploadFile(file);
      setValue(`categoryDetails.${fieldName}`, res.fileUrl, { shouldValidate: true });
      toast.success(`${file.name} uploaded successfully.`);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'File upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  const renderBusinessFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Annual Turnover (INR) <span className="text-red-500">*</span></label>
        <input
          type="text"
          placeholder="e.g. 5 Crores"
          {...register('categoryDetails.annualTurnover', { required: 'Annual Turnover is required for Business category' })}
          className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
        />
        {errors?.categoryDetails?.annualTurnover && (
          <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.annualTurnover.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Employee Strength <span className="text-red-500">*</span></label>
        <input
          type="number"
          min="1"
          placeholder="e.g. 50"
          {...register('categoryDetails.employeeStrength', { required: 'Employee Strength is required for Business category' })}
          className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
        />
        {errors?.categoryDetails?.employeeStrength && (
          <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.employeeStrength.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Operating Country <span className="text-red-500">*</span></label>
        <input
          type="text"
          placeholder="e.g. India"
          {...register('categoryDetails.country', { required: 'Operating Country is required for Business category' })}
          className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
        />
        {errors?.categoryDetails?.country && (
          <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.country.message}</span>
        )}
      </div>
    </div>
  );

  const renderAcademicFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Institution Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Anna University"
            {...register('categoryDetails.institution', { required: 'Institution is required for Academic category' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.institution && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.institution.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Academic Designation <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Associate Professor"
            {...register('categoryDetails.designation', { required: 'Designation is required for Academic category' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.designation && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.designation.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">NIRF Ranking (if applicable)</label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 45"
            {...register('categoryDetails.nirfRanking')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Staff Capacity / Guided Students <span className="text-red-500">*</span></label>
          <input
            type="number"
            min="0"
            placeholder="Number of staff or students under leadership"
            {...register('categoryDetails.staffCapacity', { required: 'Staff Capacity is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.staffCapacity && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.staffCapacity.message}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Leadership Achievement Details <span className="text-red-500">*</span></label>
        <textarea
          rows="3"
          placeholder="Enter leadership milestones, principal roles, or board memberships..."
          {...register('categoryDetails.leadershipAchievement', { required: 'Leadership achievements details are required' })}
          className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
        />
        {errors?.categoryDetails?.leadershipAchievement && (
          <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.leadershipAchievement.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Social Membership / Educational Trusts</label>
        <textarea
          rows="2"
          placeholder="Mention association memberships, education networks, etc."
          {...register('categoryDetails.socialMembership')}
          className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
        />
      </div>
    </div>
  );

  const renderScientificFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Scientific Organization <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. ISRO / CSIR"
            {...register('categoryDetails.organization', { required: 'Organization is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.organization && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.organization.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Designation <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Scientist G / Principal Scientist"
            {...register('categoryDetails.designation', { required: 'Designation is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.designation && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.designation.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Sector <span className="text-red-500">*</span></label>
          <select
            {...register('categoryDetails.sector', { required: 'Sector type is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none bg-white transition-all"
          >
            <option value="">Select Sector</option>
            <option value="Public">Public Sector / Govt.</option>
            <option value="Private">Private / Corporate R&D</option>
          </select>
          {errors?.categoryDetails?.sector && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.sector.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Organization Address <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="City, State"
            {...register('categoryDetails.address', { required: 'Address is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.address && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.address.message}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Publications (Journals, Conferences) <span className="text-red-500">*</span></label>
          <textarea
            rows="3"
            placeholder="List major indexed publication counts and titles..."
            {...register('categoryDetails.publications', { required: 'Publications are required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
          />
          {errors?.categoryDetails?.publications && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.publications.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Patents (Granted / Filed) <span className="text-red-500">*</span></label>
          <textarea
            rows="3"
            placeholder="Details of patents filed or granted..."
            {...register('categoryDetails.patents', { required: 'Patents details are required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
          />
          {errors?.categoryDetails?.patents && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.patents.message}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Research & Funding Projects</label>
          <textarea
            rows="3"
            placeholder="List projects completed or handled as Principal Investigator..."
            {...register('categoryDetails.research')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Awards & Technical Memberships</label>
          <textarea
            rows="3"
            placeholder="Prizes, society memberships (IEEE, ASME, etc.)..."
            {...register('categoryDetails.awards')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderSportsFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Sports Organization / Association <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Sports Authority of India / District Club"
            {...register('categoryDetails.organization', { required: 'Sports Association is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.organization && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.organization.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Designation / Role <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Player, Coach, Captain"
            {...register('categoryDetails.designation', { required: 'Role/Designation is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.designation && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.designation.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Level of Representation <span className="text-red-500">*</span></label>
          <select
            {...register('categoryDetails.level', { required: 'Level is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none bg-white transition-all"
          >
            <option value="">Select Level</option>
            <option value="District">District Level</option>
            <option value="State">State Level</option>
            <option value="National">National Level</option>
            <option value="International">International / Olympic Level</option>
          </select>
          {errors?.categoryDetails?.level && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.level.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Affiliation Address</label>
          <input
            type="text"
            placeholder="City, State"
            {...register('categoryDetails.address')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Achievement Details & Medals Won <span className="text-red-500">*</span></label>
        <textarea
          rows="3"
          placeholder="Mention gold medals, tournaments won, ranks secured, records set..."
          {...register('categoryDetails.achievement', { required: 'Sports achievements are required' })}
          className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
        />
        {errors?.categoryDetails?.achievement && (
          <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.achievement.message}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Publications / Articles (about the achievements)</label>
          <textarea
            rows="2"
            placeholder="News clippings, sports journal listings..."
            {...register('categoryDetails.publication')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Memberships / Associations</label>
          <textarea
            rows="2"
            placeholder="Affiliation to National Federations (e.g. BCCI, AIFF)..."
            {...register('categoryDetails.membership')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderSocialFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">NGO / Trust Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Rotary Club / HelpAge Trust"
            {...register('categoryDetails.trust', { required: 'Trust/NGO Name is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.trust && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.trust.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Type of Organization <span className="text-red-500">*</span></label>
          <select
            {...register('categoryDetails.sector', { required: 'Type is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none bg-white transition-all"
          >
            <option value="">Select Type</option>
            <option value="Non-Profit / NGO">Non-Profit / NGO</option>
            <option value="Government Body">Government Body</option>
            <option value="Corporate CSR">Corporate CSR</option>
          </select>
          {errors?.categoryDetails?.sector && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.sector.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Geographic Coverage <span className="text-red-500">*</span></label>
          <select
            {...register('categoryDetails.level', { required: 'Coverage level is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none bg-white transition-all"
          >
            <option value="">Select Coverage</option>
            <option value="Local / Gram Panchayat">Local / Gram Panchayat</option>
            <option value="District Level">District Level</option>
            <option value="State Level">State Level</option>
            <option value="National / International">National / International</option>
          </select>
          {errors?.categoryDetails?.level && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.level.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Organization Address <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Headquarters address"
            {...register('categoryDetails.address', { required: 'Organization Address is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.address && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.address.message}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Community Contribution & Achievements Summary <span className="text-red-500">*</span></label>
        <textarea
          rows="4"
          placeholder="Describe how the nominee has impacted society (e.g. disaster relief, tree planting, scholarships, child care)..."
          {...register('categoryDetails.achievement', { required: 'Contribution details are required' })}
          className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
        />
        {errors?.categoryDetails?.achievement && (
          <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.achievement.message}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Awards & Recognitions</label>
          <textarea
            rows="2"
            placeholder="State honors, municipal awards, CSR citations..."
            {...register('categoryDetails.awards')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Trust Memberships & Partnerships</label>
          <textarea
            rows="2"
            placeholder="Collaboration with external ministries, UN agencies, global trusts..."
            {...register('categoryDetails.membership')}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderPoliticalFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Current Affiliated Body / Party <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Public Administration / Party / Independent"
            {...register('categoryDetails.trust', { required: 'Affiliation body is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.trust && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.trust.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Political Designation <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Ward Councillor / MLA / Secretary"
            {...register('categoryDetails.designation', { required: 'Designation is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.designation && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.designation.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Activity Level <span className="text-red-500">*</span></label>
          <select
            {...register('categoryDetails.level', { required: 'Activity Level is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none bg-white transition-all"
          >
            <option value="">Select Level</option>
            <option value="Municipal / Town Panchayat">Municipal / Town Panchayat</option>
            <option value="District Level">District Level</option>
            <option value="State Level">State Level</option>
            <option value="National Level">National Level</option>
          </select>
          {errors?.categoryDetails?.level && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.level.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Constituency / Office Address <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Postal details"
            {...register('categoryDetails.address', { required: 'Office address is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.address && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.address.message}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Governance & Administrative Achievements <span className="text-red-500">*</span></label>
        <textarea
          rows="4"
          placeholder="List infrastructure policies passed, constituency developments introduced, public grievances solved..."
          {...register('categoryDetails.achievement', { required: 'Achievements details are required' })}
          className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
        />
        {errors?.categoryDetails?.achievement && (
          <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.achievement.message}</span>
        )}
      </div>
    </div>
  );

  const renderRetiredServiceFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Type */}
        <div className="flex flex-col gap-2 col-span-2">
          <label className="text-sm font-bold text-slate-700">Service Category <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap items-center gap-6 mt-1">
            {['Army', 'Navy', 'Air Force', 'CAPF'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  {...register('categoryDetails.serviceType', { required: 'Service Type is required' })}
                  className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
                />
                <span className="text-sm font-semibold text-slate-700">{type}</span>
              </label>
            ))}
          </div>
          {errors?.categoryDetails?.serviceType && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.serviceType.message}</span>
          )}
        </div>

        {/* Service Number */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Service Number <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. IC-76435X"
            {...register('categoryDetails.serviceNumber', { required: 'Service Number is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.serviceNumber && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.serviceNumber.message}</span>
          )}
        </div>

        {/* Rank */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Rank (At Retirement) <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Major / Wing Commander"
            {...register('categoryDetails.rank', { required: 'Rank is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.rank && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.rank.message}</span>
          )}
        </div>

        {/* Unit */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Unit / Regiment <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. 5th Rajputana Rifles"
            {...register('categoryDetails.unit', { required: 'Unit/Regiment is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.unit && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.unit.message}</span>
          )}
        </div>

        {/* Branch */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Branch <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Infantry / Flying Branch"
            {...register('categoryDetails.branch', { required: 'Branch is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.branch && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.branch.message}</span>
          )}
        </div>

        {/* Joining Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Commissioned / Joining Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            {...register('categoryDetails.joiningDate', { required: 'Joining Date is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.joiningDate && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.joiningDate.message}</span>
          )}
        </div>

        {/* Retirement Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Retirement Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            {...register('categoryDetails.retirementDate', { required: 'Retirement Date is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.retirementDate && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.retirementDate.message}</span>
          )}
        </div>

        {/* Years of Service */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Total Years of Service <span className="text-red-500">*</span></label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 20"
            {...register('categoryDetails.yearsOfService', { required: 'Years of Service is required' })}
            className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {errors?.categoryDetails?.yearsOfService && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.yearsOfService.message}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Honours & Gallantry Medals Received</label>
        <textarea
          rows="2"
          placeholder="Mention Param Vir Chakra, Sena Medal, VSM, etc..."
          {...register('categoryDetails.honours')}
          className="w-full px-4 py-2.5 rounded-nec border border-borderlight focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all resize-none"
        />
      </div>

      {/* Category Specific File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
        {/* Service Book Document */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Service Book Copy <span className="text-red-500">*</span>
          </label>
          <div className="relative border-2 border-dashed border-slate-300 hover:border-primary rounded-nec p-4 text-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center min-h-[120px]">
            <input
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={(e) => handleCategoryFileUpload(e, 'serviceBook')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingField === 'serviceBook'}
            />
            {uploadingField === 'serviceBook' ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs font-semibold text-slate-500">Uploading Service Book...</span>
              </div>
            ) : categoryDetails.serviceBook ? (
              <div className="flex flex-col items-center gap-2 text-green-600">
                <CheckCircle className="w-8 h-8" />
                <span className="text-xs font-bold truncate max-w-[200px]">Service Book Uploaded</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-xs font-semibold">Upload Service Book</span>
                <span className="text-[10px] text-slate-400">PDF, DOCX, PNG, JPEG up to 10MB</span>
              </div>
            )}
          </div>
          {/* hidden input for form validation */}
          <input
            type="hidden"
            {...register('categoryDetails.serviceBook', { required: 'Service Book Upload is required' })}
          />
          {errors?.categoryDetails?.serviceBook && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.serviceBook.message}</span>
          )}
        </div>

        {/* Ex-Service ID Card */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">
            Ex-Service ID Card Copy <span className="text-red-500">*</span>
          </label>
          <div className="relative border-2 border-dashed border-slate-300 hover:border-primary rounded-nec p-4 text-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center min-h-[120px]">
            <input
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={(e) => handleCategoryFileUpload(e, 'exServiceId')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingField === 'exServiceId'}
            />
            {uploadingField === 'exServiceId' ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs font-semibold text-slate-500">Uploading ID Card...</span>
              </div>
            ) : categoryDetails.exServiceId ? (
              <div className="flex flex-col items-center gap-2 text-green-600">
                <CheckCircle className="w-8 h-8" />
                <span className="text-xs font-bold truncate max-w-[200px]">Ex-Service ID Uploaded</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-xs font-semibold">Upload ID Card Copy</span>
                <span className="text-[10px] text-slate-400">PDF, DOCX, PNG, JPEG up to 10MB</span>
              </div>
            )}
          </div>
          {/* hidden input for form validation */}
          <input
            type="hidden"
            {...register('categoryDetails.exServiceId', { required: 'Ex-Service ID Upload is required' })}
          />
          {errors?.categoryDetails?.exServiceId && (
            <span className="text-xs text-red-500 font-medium">{errors.categoryDetails.exServiceId.message}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary">Dynamic Category Details</h2>
        <p className="text-xs text-slate-500 mt-1">
          Providing specialized profiles for <span className="font-bold text-primary">{category}</span>.
        </p>
      </div>

      {category === 'Business' && renderBusinessFields()}
      {category === 'Academic' && renderAcademicFields()}
      {category === 'Scientific' && renderScientificFields()}
      {category === 'Sports' && renderSportsFields()}
      {category === 'Social' && renderSocialFields()}
      {category === 'Political' && renderPoliticalFields()}
      {category === 'Retired Service Personnel' && renderRetiredServiceFields()}

      {!category && (
        <div className="text-center py-10 bg-amber-50 rounded-nec border border-amber-200 text-amber-800">
          Please complete Step 3: Choose Award Category before providing details here.
        </div>
      )}
    </div>
  );
};

export default Step4CategoryDetails;
