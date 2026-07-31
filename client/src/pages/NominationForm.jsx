import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API Services
import { nominationService } from '../services/api';

// Components
import SidebarProgress from '../components/SidebarProgress';

// Forms Steps
import Step1Nominee from '../forms/Step1Nominee';
import Step2Professional from '../forms/Step2Professional';
import Step3Category from '../forms/Step3Category';
import Step4CategoryDetails from '../forms/Step4CategoryDetails';
import Step5Contribution from '../forms/Step5Contribution';
import Step6Documents from '../forms/Step6Documents';
import Step7Nominator from '../forms/Step7Nominator';
import Step8Declaration from '../forms/Step8Declaration';
import Step9Review from '../forms/Step9Review';

const NominationForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from local storage draft if available
  const savedDraft = localStorage.getItem('nec_nomination_draft');
  const defaultValues = savedDraft
    ? JSON.parse(savedDraft)
    : {
        nomineeDetails: { registeredInPortal: 'No' },
        professionalProfile: { profileSummary: '' },
        awardCategory: '',
        categoryDetails: {},
        necContribution: { activities: [], details: '' },
        supportingDocuments: [],
        nominatorDetails: {},
        declaration: { declared: false, signature: '' }
      };

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    control,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange'
  });

  const formValues = watch();

  // Auto-save progress to local storage
  useEffect(() => {
    if (Object.keys(formValues).length > 0) {
      localStorage.setItem('nec_nomination_draft', JSON.stringify(formValues));
    }
  }, [formValues]);

  // Clear local storage and state for resets
  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear your current progress and start fresh?')) {
      localStorage.removeItem('nec_nomination_draft');
      window.location.reload();
    }
  };

  // Select fields to validate for each step
  const getFieldsForStep = (step) => {
    switch (step) {
      case 1:
        return [
          'nomineeDetails.name',
          'nomineeDetails.batch',
          'nomineeDetails.department',
          'nomineeDetails.mobile',
          'nomineeDetails.email',
          'nomineeDetails.city',
          'nomineeDetails.address',
          'nomineeDetails.state',
          'nomineeDetails.country',
          'nomineeDetails.registeredInPortal'
        ];
      case 2:
        return [
          'professionalProfile.designation',
          'professionalProfile.organization',
          'professionalProfile.experience',
          'professionalProfile.profileSummary'
        ];
      case 3:
        return ['awardCategory'];
      case 4:
        const category = watch('awardCategory');
        if (category === 'Business') {
          return ['categoryDetails.annualTurnover', 'categoryDetails.employeeStrength', 'categoryDetails.country'];
        }
        if (category === 'Academic') {
          return [
            'categoryDetails.institutionName',
            'categoryDetails.designation',
            'categoryDetails.nirfRanking',
            'categoryDetails.staffCapacity',
            'categoryDetails.leadershipAchievements'
          ];
        }
        if (category === 'Scientific') {
          return [
            'categoryDetails.orgName',
            'categoryDetails.designation',
            'categoryDetails.orgAddress',
            'categoryDetails.sector',
            'categoryDetails.publications',
            'categoryDetails.patents',
            'categoryDetails.researchContributions',
            'categoryDetails.achievementWriteup'
          ];
        }
        if (category === 'Sports') {
          return [
            'categoryDetails.orgName',
            'categoryDetails.designation',
            'categoryDetails.orgAddress',
            'categoryDetails.representation',
            'categoryDetails.level',
            'categoryDetails.sportsAchievement',
            'categoryDetails.achievementSummary'
          ];
        }
        if (category === 'Social') {
          return [
            'categoryDetails.orgAddress',
            'categoryDetails.sector',
            'categoryDetails.representation',
            'categoryDetails.charityTrust',
            'categoryDetails.level',
            'categoryDetails.achievementWriteup'
          ];
        }
        if (category === 'Political') {
          return [
            'categoryDetails.orgAddress',
            'categoryDetails.designation',
            'categoryDetails.sector',
            'categoryDetails.level',
            'categoryDetails.achievementWriteup'
          ];
        }
        if (category === 'Retired Service') {
          return [
            'categoryDetails.serviceType',
            'categoryDetails.serviceNumber',
            'categoryDetails.commissionType',
            'categoryDetails.branch',
            'categoryDetails.lastUnit',
            'categoryDetails.lastRank',
            'categoryDetails.joiningDate',
            'categoryDetails.retirementDate',
            'categoryDetails.yearsOfService',
            'categoryDetails.serviceBookUrl',
            'categoryDetails.exServicemanIdUrl'
          ];
        }
        return [];
      case 5:
        return ['necContribution.details'];
      case 6:
        return ['supportingDocuments'];
      case 7:
        return [
          'nominatorDetails.name',
          'nominatorDetails.batch',
          'nominatorDetails.department',
          'nominatorDetails.mobile',
          'nominatorDetails.email'
        ];
      case 8:
        return [
          'declaration.declared',
          'declaration.nomineeName',
          'declaration.date',
          'declaration.place',
          'declaration.signature'
        ];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    
    // Custom validation check for supporting documents on step 6
    if (currentStep === 6) {
      const documents = watch('supportingDocuments') || [];
      if (documents.length === 0) {
        setValue('supportingDocuments', null); // Trigger validation error
      }
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep > maxVisitedStep) {
        setMaxVisitedStep(nextStep);
      }
    } else {
      toast.error('Please fix validation errors before moving to the next step.');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSidebarStepClick = async (stepNum) => {
    // If the user wants to jump, validate current step first
    if (stepNum > currentStep) {
      const fieldsToValidate = getFieldsForStep(currentStep);
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        toast.error('Complete the current step with valid entries before proceeding.');
        return;
      }
    }
    setCurrentStep(stepNum);
  };

  // Submit entire form state to backend API
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await nominationService.submitNomination(data);
      if (response.success) {
        // Clear Local Storage draft on submission success
        localStorage.removeItem('nec_nomination_draft');
        toast.success('Nomination submitted successfully!');
        
        // Go to step 10 success page with response data
        setCurrentStep(10);
        setTimeout(() => {
          navigate('/success', { state: { nomination: response.data } });
        }, 1500);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error(error.response?.data?.message || 'Nomination submission failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic renderer for step views
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Nominee register={register} errors={errors} />;
      case 2:
        return <Step2Professional register={register} errors={errors} watch={watch} />;
      case 3:
        return (
          <Step3Category watch={watch} setValue={setValue} register={register} errors={errors} />
        );
      case 4:
        return (
          <Step4CategoryDetails
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      case 5:
        return <Step5Contribution register={register} errors={errors} />;
      case 6:
        return <Step6Documents watch={watch} setValue={setValue} errors={errors} />;
      case 7:
        return <Step7Nominator register={register} errors={errors} />;
      case 8:
        return <Step8Declaration register={register} errors={errors} control={control} />;
      case 9:
        return <Step9Review watch={watch} goToStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
      <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Progress Sidebar */}
        <SidebarProgress
          currentStep={currentStep}
          maxVisitedStep={maxVisitedStep}
          onStepClick={handleSidebarStepClick}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Top Wizard Steps Progress Bar */}
          <div className="glass-card p-4 rounded-nec flex items-center justify-between shadow-sm">
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              Step {currentStep} of 10
            </span>
            <div className="flex-1 max-w-xs mx-4 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full animate-progress"
                style={{ width: `${(currentStep / 10) * 100}%` }}
              />
            </div>
            <button
              onClick={handleClearDraft}
              type="button"
              className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors focus:outline-none"
            >
              Reset Draft
            </button>
          </div>

          {/* Form Wizard Container */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="glass-card p-6 md:p-8 rounded-nec shadow-md bg-white/95"
          >
            {/* Step Animated Transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-nec border border-primary/20 text-primary font-semibold hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 9 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-nec bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-glow transition-all duration-200 cursor-pointer"
                >
                  Next
                </button>
              ) : currentStep === 9 ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-nec bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-glow transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Nomination'
                  )}
                </button>
              ) : (
                <div />
              )}
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default NominationForm;
