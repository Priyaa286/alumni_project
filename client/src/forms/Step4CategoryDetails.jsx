import React, { useState } from 'react';
import { nominationService } from '../services/api';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';

const Step4CategoryDetails = ({ register, errors, watch, setValue }) => {
  const category = watch('awardCategory');
  const categoryDetails = watch('categoryDetails') || {};
  const [uploadingField, setUploadingField] = useState(null);

  // File upload handler for retired service papers
  const handleFileUpload = async (e, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }

    setUploadingField(fieldKey);
    try {
      const response = await nominationService.uploadFile(file, fieldKey);
      if (response.success) {
        setValue(`categoryDetails.${fieldKey}`, response.data.filePath, { shouldValidate: true });
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingField(null);
    }
  };

  if (!category) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-semibold">Please select an award category in the previous step first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-primary/10 pb-4">
        <h3 className="text-xl font-bold text-gray-900 font-heading">
          Category-Specific Details: {category}
        </h3>
        <p className="text-sm text-gray-500 font-sans">
          Provide supplementary details specific to the selected award category.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ==================== BUSINESS CATEGORY ==================== */}
        {category === 'Business' && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Annual Turnover (INR in Crores) *</label>
              <input
                type="text"
                placeholder="e.g. 50 Crores"
                {...register('categoryDetails.annualTurnover', { required: 'Annual Turnover is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.annualTurnover && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.annualTurnover.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Employee Strength *</label>
              <input
                type="number"
                placeholder="e.g. 150"
                {...register('categoryDetails.employeeStrength', { required: 'Employee strength is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.employeeStrength && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.employeeStrength.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Country of Operations *</label>
              <input
                type="text"
                placeholder="e.g. India, USA, Singapore"
                {...register('categoryDetails.country', { required: 'Country is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.country && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.country.message}</span>
              )}
            </div>
          </>
        )}

        {/* ==================== ACADEMIC CATEGORY ==================== */}
        {category === 'Academic' && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Institution Name *</label>
              <input
                type="text"
                placeholder="e.g. IIT Madras"
                {...register('categoryDetails.institutionName', { required: 'Institution Name is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.institutionName && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.institutionName.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Designation *</label>
              <input
                type="text"
                placeholder="e.g. Professor & Dean"
                {...register('categoryDetails.designation', { required: 'Designation is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.designation && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.designation.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Institution NIRF Ranking (1 to 100) *</label>
              <input
                type="number"
                placeholder="e.g. 15"
                {...register('categoryDetails.nirfRanking', {
                  required: 'NIRF Ranking is required',
                  min: { value: 1, message: 'Ranking must be between 1 and 100' },
                  max: { value: 100, message: 'Ranking must be between 1 and 100' }
                })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.nirfRanking && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.nirfRanking.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Staff Capacity *</label>
              <input
                type="text"
                placeholder="e.g. 500+ faculty members"
                {...register('categoryDetails.staffCapacity', { required: 'Staff Capacity is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.staffCapacity && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.staffCapacity.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Leadership Achievements (Global/Nation/Community) *</label>
              <textarea
                rows="3"
                placeholder="Key milestones achieved as an academic leader..."
                {...register('categoryDetails.leadershipAchievements', { required: 'Leadership Achievements are required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.leadershipAchievements && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.leadershipAchievements.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Social Membership with Position</label>
              <input
                type="text"
                placeholder="e.g. IEEE Fellow (Member), ISTE Executive Committee Member"
                {...register('categoryDetails.socialMembership')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>
          </>
        )}

        {/* ==================== SCIENTIFIC CATEGORY ==================== */}
        {category === 'Scientific' && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Name of Organization *</label>
              <input
                type="text"
                placeholder="e.g. ISRO, DRDO"
                {...register('categoryDetails.orgName', { required: 'Organization name is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.orgName && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.orgName.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Designation (Senior Scientist & Above) *</label>
              <input
                type="text"
                placeholder="e.g. Scientist G / Director"
                {...register('categoryDetails.designation', { required: 'Designation is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.designation && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.designation.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Address of Organization *</label>
              <textarea
                rows="2"
                placeholder="Official office address"
                {...register('categoryDetails.orgAddress', { required: 'Organization Address is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.orgAddress && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.orgAddress.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Sector *</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" value="Public" {...register('categoryDetails.sector', { required: 'Sector is required' })} /> Public
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="Private" {...register('categoryDetails.sector', { required: 'Sector is required' })} /> Private
                </label>
              </div>
              {errors.categoryDetails?.sector && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.sector.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Publications (Details) *</label>
              <textarea
                rows="3"
                placeholder="Major publications in SCI/Scopus indexed journals..."
                {...register('categoryDetails.publications', { required: 'Publications detail is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.publications && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.publications.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Patents Filed/Granted *</label>
              <textarea
                rows="2"
                placeholder="List major patents (with application/grant numbers)..."
                {...register('categoryDetails.patents', { required: 'Patents are required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.patents && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.patents.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Research Contributions *</label>
              <textarea
                rows="2"
                placeholder="Summary of research breakthroughs..."
                {...register('categoryDetails.researchContributions', { required: 'Research contributions are required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.researchContributions && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.researchContributions.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Social Membership with Position</label>
              <input
                type="text"
                placeholder="e.g. Life Member, Indian Science Congress"
                {...register('categoryDetails.socialMembership')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Award / Recognition</label>
              <textarea
                rows="2"
                placeholder="National/International science awards..."
                {...register('categoryDetails.awards')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Project Details</label>
              <textarea
                rows="2"
                placeholder="Funded / sponsored research projects details..."
                {...register('categoryDetails.projectDetails')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Write Achievement *</label>
              <textarea
                rows="3"
                placeholder="Brief summary of outstanding scientific achievements..."
                {...register('categoryDetails.achievementWriteup', { required: 'Achievement writeup is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.achievementWriteup && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.achievementWriteup.message}</span>
              )}
            </div>
          </>
        )}

        {/* ==================== SPORTS & CULTURAL CATEGORY ==================== */}
        {category === 'Sports' && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Name of Organization *</label>
              <input
                type="text"
                placeholder="e.g. Sports Authority of India"
                {...register('categoryDetails.orgName', { required: 'Organization name is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.orgName && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.orgName.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Designation *</label>
              <input
                type="text"
                placeholder="e.g. Coach / Athlete"
                {...register('categoryDetails.designation', { required: 'Designation is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.designation && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.designation.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Address of Organization *</label>
              <textarea
                rows="2"
                placeholder="Organization address"
                {...register('categoryDetails.orgAddress', { required: 'Address is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.orgAddress && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.orgAddress.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Sector *</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" value="Public" {...register('categoryDetails.sector', { required: 'Sector is required' })} /> Public
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="Private" {...register('categoryDetails.sector', { required: 'Sector is required' })} /> Private
                </label>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Event Representation *</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" value="Individual" {...register('categoryDetails.representation', { required: 'Representation is required' })} /> Individual
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="Group" {...register('categoryDetails.representation', { required: 'Representation is required' })} /> Group
                </label>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Level *</label>
              <select
                {...register('categoryDetails.level', { required: 'Level is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              >
                <option value="">Select Level</option>
                <option value="International">International</option>
                <option value="National">National</option>
                <option value="State">State</option>
                <option value="District">District</option>
              </select>
              {errors.categoryDetails?.level && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.level.message}</span>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Sports / Cultural Achievement *</label>
              <textarea
                rows="2"
                placeholder="Awards, medals, performance metrics..."
                {...register('categoryDetails.sportsAchievement', { required: 'Sports/Cultural Achievement details are required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Publications / Media Highlights</label>
              <textarea
                rows="2"
                placeholder="News articles, press coverage, books or publications..."
                {...register('categoryDetails.publications')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Social Membership with Position</label>
              <input
                type="text"
                placeholder="Positions in sports boards or cultural associations..."
                {...register('categoryDetails.socialMembership')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Award / Recognition</label>
              <textarea
                rows="2"
                placeholder="e.g. Arjuna Award, State Awards..."
                {...register('categoryDetails.awards')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Write Achievement Summary *</label>
              <textarea
                rows="3"
                placeholder="Explain why this accomplishment is unique and notable..."
                {...register('categoryDetails.achievementSummary', { required: 'Achievement summary is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.achievementSummary && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.achievementSummary.message}</span>
              )}
            </div>
          </>
        )}

        {/* ==================== SOCIAL CATEGORY ==================== */}
        {category === 'Social' && (
          <>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Address of Organization *</label>
              <textarea
                rows="2"
                placeholder="NGO / Trust/ Foundation office address"
                {...register('categoryDetails.orgAddress', { required: 'Organization Address is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
              {errors.categoryDetails?.orgAddress && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.orgAddress.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Sector *</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" value="Public" {...register('categoryDetails.sector', { required: 'Sector is required' })} /> Public
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="Private" {...register('categoryDetails.sector', { required: 'Sector is required' })} /> Private
                </label>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Representation *</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" value="Individual" {...register('categoryDetails.representation', { required: 'Representation is required' })} /> Individual
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="Group" {...register('categoryDetails.representation', { required: 'Representation is required' })} /> Group
                </label>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Associated Charity / Trust *</label>
              <input
                type="text"
                placeholder="NGO or Trust Name"
                {...register('categoryDetails.charityTrust', { required: 'Charity/Trust name is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Level of Activity *</label>
              <select
                {...register('categoryDetails.level', { required: 'Level is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              >
                <option value="">Select Level</option>
                <option value="International">International</option>
                <option value="National">National</option>
                <option value="State">State</option>
                <option value="District">District</option>
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Social Membership with Position</label>
              <input
                type="text"
                placeholder="Official positions held in organizations..."
                {...register('categoryDetails.socialMembership')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Award / Recognition</label>
              <textarea
                rows="2"
                placeholder="Details of community awards..."
                {...register('categoryDetails.awards')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Writeup of Social Achievement *</label>
              <textarea
                rows="3"
                placeholder="Detailed summary of the social impact created by the nominee..."
                {...register('categoryDetails.achievementWriteup', { required: 'Achievement writeup is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>
          </>
        )}

        {/* ==================== POLITICAL CATEGORY ==================== */}
        {category === 'Political' && (
          <>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Address of Organization *</label>
              <textarea
                rows="2"
                placeholder="Office or administrative address"
                {...register('categoryDetails.orgAddress', { required: 'Address is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Designation *</label>
              <input
                type="text"
                placeholder="Official office designation"
                {...register('categoryDetails.designation', { required: 'Designation is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Sector *</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" value="Public" {...register('categoryDetails.sector', { required: 'Sector is required' })} /> Public
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="Private" {...register('categoryDetails.sector', { required: 'Sector is required' })} /> Private
                </label>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Level *</label>
              <select
                {...register('categoryDetails.level', { required: 'Level is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              >
                <option value="">Select Level</option>
                <option value="National">National / Central Government</option>
                <option value="State">State Government</option>
                <option value="Local">Local Administration</option>
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Social Membership with Position</label>
              <input
                type="text"
                placeholder="Committees or political panels..."
                {...register('categoryDetails.socialMembership')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Award / Recognition</label>
              <textarea
                rows="2"
                placeholder="Governmental or legal honors..."
                {...register('categoryDetails.awards')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Writeup of Achievements *</label>
              <textarea
                rows="3"
                placeholder="Administrative or political reforms, community impact..."
                {...register('categoryDetails.achievementWriteup', { required: 'Achievement writeup is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>
          </>
        )}

        {/* ==================== RETIRED SERVICE PERSONNEL ==================== */}
        {category === 'Retired Service' && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Service Category *</label>
              <select
                {...register('categoryDetails.serviceType', { required: 'Service Type is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              >
                <option value="">Select Service Type</option>
                <option value="Army">Army</option>
                <option value="Navy">Navy</option>
                <option value="Air Force">Air Force</option>
                <option value="Coast Guard">Coast Guard</option>
                <option value="CAPF">CAPF (Central Armed Police Forces)</option>
              </select>
              {errors.categoryDetails?.serviceType && (
                <span className="text-xs text-red-500 mt-1">{errors.categoryDetails.serviceType.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Service Number *</label>
              <input
                type="text"
                placeholder="e.g. IC-12345X"
                {...register('categoryDetails.serviceNumber', { required: 'Service Number is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Commission Type (PC/SSC) *</label>
              <select
                {...register('categoryDetails.commissionType', { required: 'Commission type is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              >
                <option value="">Select Type</option>
                <option value="PC">Permanent Commission (PC)</option>
                <option value="SSC">Short Service Commission (SSC)</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Branch of Service *</label>
              <input
                type="text"
                placeholder="e.g. Infantry / Flying Branch"
                {...register('categoryDetails.branch', { required: 'Branch is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Last Unit / Establishment *</label>
              <input
                type="text"
                placeholder="e.g. 12 Rajputana Rifles / Air Hq-Dit"
                {...register('categoryDetails.lastUnit', { required: 'Last unit details required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Last Rank Held *</label>
              <input
                type="text"
                placeholder="e.g. Colonel / Wing Commander"
                {...register('categoryDetails.lastRank', { required: 'Last Rank is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Date of Enrolment / Commission *</label>
              <input
                type="date"
                {...register('categoryDetails.joiningDate', { required: 'Joining date is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Date of Discharge / Retirement *</label>
              <input
                type="date"
                {...register('categoryDetails.retirementDate', { required: 'Retirement date is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Years of Service *</label>
              <input
                type="number"
                placeholder="e.g. 20"
                {...register('categoryDetails.yearsOfService', { required: 'Years of service is required' })}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Honours and Awards</label>
              <textarea
                rows="2"
                placeholder="e.g. Sena Medal, VSM..."
                {...register('categoryDetails.honours')}
                className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow"
              />
            </div>

            {/* Service Book Upload */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Service Book / Record Upload *</label>
              <div className="relative">
                <input
                  type="file"
                  id="serviceBook"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileUpload(e, 'serviceBookUrl')}
                />
                <label
                  htmlFor="serviceBook"
                  className="flex items-center gap-3 px-4 py-2.5 border border-dashed border-primary/40 rounded-nec cursor-pointer hover:bg-primary/5 transition-all text-sm font-medium text-gray-600 bg-white/40"
                >
                  {uploadingField === 'serviceBookUrl' ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : categoryDetails.serviceBookUrl ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Upload className="w-5 h-5 text-primary" />
                  )}
                  {categoryDetails.serviceBookUrl ? 'Uploaded Record' : 'Upload Service Book (PDF/JPG)'}
                </label>
              </div>
              <input
                type="hidden"
                {...register('categoryDetails.serviceBookUrl', { required: 'Service Book Upload is required' })}
              />
              {errors.categoryDetails?.serviceBookUrl && (
                <span className="text-xs text-red-500 mt-1">Please upload the Service Book document</span>
              )}
            </div>

            {/* Ex-Serviceman ID Upload */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Ex-Serviceman ID Card Upload *</label>
              <div className="relative">
                <input
                  type="file"
                  id="exServiceId"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileUpload(e, 'exServicemanIdUrl')}
                />
                <label
                  htmlFor="exServiceId"
                  className="flex items-center gap-3 px-4 py-2.5 border border-dashed border-primary/40 rounded-nec cursor-pointer hover:bg-primary/5 transition-all text-sm font-medium text-gray-600 bg-white/40"
                >
                  {uploadingField === 'exServicemanIdUrl' ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : categoryDetails.exServicemanIdUrl ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Upload className="w-5 h-5 text-primary" />
                  )}
                  {categoryDetails.exServicemanIdUrl ? 'Uploaded ID Card' : 'Upload Ex-Service ID Card (PDF/JPG)'}
                </label>
              </div>
              <input
                type="hidden"
                {...register('categoryDetails.exServicemanIdUrl', { required: 'Ex-Serviceman ID Card is required' })}
              />
              {errors.categoryDetails?.exServicemanIdUrl && (
                <span className="text-xs text-red-500 mt-1">Please upload the Ex-Serviceman ID Card</span>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Step4CategoryDetails;
