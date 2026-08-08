import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

import ProgressBar from '../components/ProgressBar';
import Sidebar from '../components/Sidebar';
import Step1Nominee from '../forms/Step1Nominee';
import Step2Professional from '../forms/Step2Professional';
import Step3Category from '../forms/Step3Category';
import Step4CategoryDetails from '../forms/Step4CategoryDetails';
import Step5NECContribution from '../forms/Step5NECContribution';
import Step6Documents from '../forms/Step6Documents';
import Step7Nominator from '../forms/Step7Nominator';
import Step8Declaration from '../forms/Step8Declaration';
import Step9Review from '../forms/Step9Review';
import Step10Submission from '../forms/Step10Submission';

import { submitNomination } from '../services/api';

const LOCAL_STORAGE_KEY = 'nec_nomination_draft';

const NominationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Load saved draft values from local storage, or fallback to empty structure
  const [defaultValues] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const { register, control, watch, setValue, trigger, formState, reset } = useForm({
    defaultValues,
    mode: 'onChange'
  });

  const { errors } = formState;
  const formValues = watch();

  const nominationType = watch('nominationType') || 'self';

  // Dynamic steps generator based on nominationType
  const getSteps = (type) => {
    const list = [
      { id: 'nominee', label: 'Nominee Details', component: Step1Nominee, fields: [
          'nominee.name', 'nominee.batch', 'nominee.department', 
          'nominee.mobile', 'nominee.email', 'nominee.city', 
          'nominee.address', 'nominee.state', 'nominee.country', 
          'nominee.linkedin', 'nominee.isRegisteredAlumni', 'nominationType'
        ] 
      },
      { id: 'professional', label: 'Professional Profile', component: Step2Professional, fields: [
          'professional.designation', 'professional.organization', 
          'professional.experience', 'professional.website', 'professional.profileSummary'
        ] 
      },
      { id: 'category', label: 'Award Category', component: Step3Category, fields: ['category'] },
      { id: 'categoryDetails', label: 'Category Details', component: Step4CategoryDetails, fields: ['categoryDetails'] },
      { id: 'necContribution', label: 'NEC Contribution', component: Step5NECContribution, fields: ['necContribution.activities', 'necContribution.details'] },
      { id: 'documents', label: 'Documents', component: Step6Documents, fields: ['documents'] },
    ];

    if (type === 'others') {
      list.push({ 
        id: 'nominator', 
        label: 'Nominator Details', 
        component: Step7Nominator, 
        fields: [
          'nominator.name', 'nominator.batch', 'nominator.department', 
          'nominator.mobile', 'nominator.email'
        ] 
      });
    }

    list.push({ 
      id: 'declaration', 
      label: 'Declaration', 
      component: Step8Declaration, 
      fields: [
        'declaration.isDeclared', 'declaration.nomineeName', 
        'declaration.date', 'declaration.place', 'declaration.signature'
      ] 
    });
    list.push({ id: 'review', label: 'Review', component: Step9Review, fields: [] });
    list.push({ id: 'submit', label: 'Submit', component: Step10Submission, fields: [] });

    return list.map((item, index) => ({
      ...item,
      number: index + 1
    }));
  };

  const activeSteps = getSteps(nominationType);

  // Sync nominee details to nominator details for Self Nomination
  const nomineeName = watch('nominee.name');
  const nomineeBatch = watch('nominee.batch');
  const nomineeDept = watch('nominee.department');
  const nomineeMobile = watch('nominee.mobile');
  const nomineeEmail = watch('nominee.email');

  useEffect(() => {
    if (nominationType === 'self') {
      setValue('nominator.name', nomineeName || '', { shouldValidate: true });
      setValue('nominator.batch', nomineeBatch || '', { shouldValidate: true });
      setValue('nominator.department', nomineeDept || '', { shouldValidate: true });
      setValue('nominator.mobile', nomineeMobile || '', { shouldValidate: true });
      setValue('nominator.email', nomineeEmail || '', { shouldValidate: true });
    }
  }, [nominationType, nomineeName, nomineeBatch, nomineeDept, nomineeMobile, nomineeEmail, setValue]);

  // Clear nominator fields when transitioning from self to others to prevent pre-filling
  const [prevNominationType, setPrevNominationType] = useState(defaultValues.nominationType || 'self');

  useEffect(() => {
    if (nominationType === 'others' && prevNominationType === 'self') {
      setValue('nominator.name', '');
      setValue('nominator.batch', '');
      setValue('nominator.department', '');
      setValue('nominator.mobile', '');
      setValue('nominator.email', '');
    }
    setPrevNominationType(nominationType);
  }, [nominationType, prevNominationType, setValue]);

  // Save form progress automatically to local storage whenever values change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formValues));
  }, [formValues]);

  // Real-time helper to verify step validity based on active step identifier
  const isStepValid = () => {
    const activeStep = activeSteps[currentStep - 1];
    if (!activeStep) return false;

    switch (activeStep.id) {
      case 'nominee':
        return (
          formValues.nominee?.name &&
          formValues.nominee?.batch &&
          formValues.nominee?.department &&
          /^[6-9]\d{9}$/.test(formValues.nominee?.mobile) &&
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formValues.nominee?.email) &&
          formValues.nominee?.city &&
          formValues.nominee?.address &&
          formValues.nominee?.state &&
          formValues.nominee?.country &&
          formValues.nominee?.isRegisteredAlumni &&
          formValues.nominationType
        );
      case 'professional':
        const profile = formValues.professional || {};
        const summary = profile.profileSummary || '';
        const words = summary.trim() === '' ? 0 : summary.trim().split(/\s+/).length;
        return (
          profile.designation &&
          profile.organization &&
          profile.experience &&
          summary &&
          words <= 300
        );
      case 'category':
        return !!formValues.category;
      case 'categoryDetails':
        const cat = formValues.category;
        const details = formValues.categoryDetails || {};
        if (cat === 'Business') {
          return details.annualTurnover && details.employeeStrength && details.country;
        } else if (cat === 'Academic') {
          return details.institution && details.designation && details.staffCapacity && details.leadershipAchievement;
        } else if (cat === 'Scientific') {
          return details.organization && details.designation && details.sector && details.address && details.publications && details.patents;
        } else if (cat === 'Sports') {
          return details.organization && details.designation && details.level && details.achievement;
        } else if (cat === 'Social') {
          return details.trust && details.sector && details.level && details.address && details.achievement;
        } else if (cat === 'Political') {
          return details.trust && details.designation && details.level && details.address && details.achievement;
        } else if (cat === 'Retired Service Personnel') {
          return (
            details.serviceType &&
            details.serviceNumber &&
            details.rank &&
            details.unit &&
            details.branch &&
            details.joiningDate &&
            details.retirementDate &&
            details.yearsOfService &&
            details.serviceBook &&
            details.exServiceId
          );
        }
        return false;
      case 'necContribution':
        return !!formValues.necContribution?.details;
      case 'documents':
        const docs = formValues.documents || {};
        return docs.certificates?.length > 0 && docs.achievements?.length > 0;
      case 'nominator':
        const nom = formValues.nominator || {};
        return (
          nom.name &&
          /^[6-9]\d{9}$/.test(nom.mobile) &&
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(nom.email)
        );
      case 'declaration':
        const decl = formValues.declaration || {};
        return decl.isDeclared && decl.nomineeName && decl.date && decl.place && decl.signature;
      case 'review':
      case 'submit':
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const activeStep = activeSteps[currentStep - 1];
    const isFormValid = await trigger(activeStep.fields);

    if (isFormValid && isStepValid()) {
      setCurrentStep((prev) => Math.min(prev + 1, activeSteps.length));
      window.scrollTo(0, 0);
    } else {
      toast.error('Please correct the validation errors in this step before proceeding.');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleManualSave = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formValues));
    toast.success('Progress saved as draft successfully.');
  };

  // Submit data to backend
  const handleSubmitNomination = async () => {
    try {
      setIsSubmitting(true);
      const result = await submitNomination(formValues);
      setSubmittedData(result.data);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear draft on successful submit
      toast.success('Nomination submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit nomination. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form and go back to step 1
  const handleReset = () => {
    reset({});
    setSubmittedData(null);
    setCurrentStep(1);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.info('Form cleared. Ready for new nomination.');
  };

  // Redirect to corresponding step on review edit request
  const handleEditStep = (stepId) => {
    const targetId = (stepId === 'nominator' && nominationType === 'self') ? 'nominee' : stepId;
    const foundStep = activeSteps.find(s => s.id === targetId);
    if (foundStep) {
      setCurrentStep(foundStep.number);
      window.scrollTo(0, 0);
    }
  };

  const activeStep = activeSteps[currentStep - 1] || activeSteps[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
      {/* ProgressBar */}
      <ProgressBar currentStep={currentStep} totalSteps={activeSteps.length} />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Stepper */}
        {submittedData === null && (
          <Sidebar currentStep={currentStep} onStepClick={setCurrentStep} steps={activeSteps} />
        )}

        {/* Form Container */}
        <div className="flex-1 w-full print-container">
          <div className="glass-card rounded-nec p-6 md:p-8 border border-borderlight shadow-premium relative min-h-[500px] flex flex-col justify-between">
            
            {/* Step Wizard Form Component with Slider Animations */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeStep.id === 'nominee' && <Step1Nominee register={register} formState={formState} watch={watch} />}
                  {activeStep.id === 'professional' && <Step2Professional register={register} formState={formState} watch={watch} />}
                  {activeStep.id === 'category' && <Step3Category watch={watch} setValue={setValue} register={register} formState={formState} />}
                  {activeStep.id === 'categoryDetails' && <Step4CategoryDetails register={register} formState={formState} watch={watch} setValue={setValue} />}
                  {activeStep.id === 'necContribution' && <Step5NECContribution register={register} formState={formState} watch={watch} setValue={setValue} />}
                  {activeStep.id === 'documents' && <Step6Documents watch={watch} setValue={setValue} />}
                  {activeStep.id === 'nominator' && <Step7Nominator register={register} formState={formState} />}
                  {activeStep.id === 'declaration' && <Step8Declaration register={register} control={control} formState={formState} />}
                  {activeStep.id === 'review' && <Step9Review watch={watch} onEditStep={handleEditStep} />}
                  {activeStep.id === 'submit' && (
                    <Step10Submission
                      isSubmitting={isSubmitting}
                      submittedData={submittedData}
                      onSubmit={handleSubmitNomination}
                      onReset={handleReset}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            {submittedData === null && (
              <div className="flex items-center justify-between border-t border-slate-200 mt-8 pt-6 form-wizard-nav no-print">
                {/* Back button */}
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm rounded-full flex items-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {/* Draft Manual Save Button */}
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="px-5 py-2.5 bg-white text-primary border border-borderlight hover:bg-slate-50 font-bold text-sm rounded-full flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>

                {/* Next button */}
                {currentStep < activeSteps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className={`px-6 py-2.5 font-bold text-sm rounded-full flex items-center gap-2 transition-all ${
                      isStepValid()
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-premium btn-glow'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominationForm;
