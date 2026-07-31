import React from 'react';
import {
  Briefcase,
  GraduationCap,
  FlaskConical,
  Trophy,
  HeartHandshake,
  Scale,
  ShieldCheck
} from 'lucide-react';

const categories = [
  {
    id: 'Business',
    title: 'Business & Entrepreneurship',
    desc: 'Business, Economic & Entrepreneurial Accomplishment',
    icon: Briefcase
  },
  {
    id: 'Academic',
    title: 'Academic Leadership',
    desc: 'Academic Leadership & Accomplishment',
    icon: GraduationCap
  },
  {
    id: 'Scientific',
    title: 'Scientific & Technological',
    desc: 'Scientific & Technological Development',
    icon: FlaskConical
  },
  {
    id: 'Sports',
    title: 'Cultural & Sports',
    desc: 'Cultural & Sports Achievement',
    icon: Trophy
  },
  {
    id: 'Social',
    title: 'Social & Humanitarian',
    desc: 'Social, Humanitarian & Voluntary Leadership',
    icon: HeartHandshake
  },
  {
    id: 'Political',
    title: 'Political & Legal',
    desc: 'Political, Legal & Governmental Affairs',
    icon: Scale
  },
  {
    id: 'Retired Service',
    title: 'Retired Service Personnel',
    desc: 'Retired Service Men & Women (Army/Navy/Air Force/CAPF)',
    icon: ShieldCheck
  }
];

const Step3Category = ({ watch, setValue, register, errors }) => {
  const selectedCategory = watch('awardCategory');

  const handleSelect = (categoryId) => {
    setValue('awardCategory', categoryId, { shouldValidate: true });
    // Reset categoryDetails whenever category changes to avoid data mismatch
    setValue('categoryDetails', {});
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-primary/10 pb-4">
        <h3 className="text-xl font-bold text-gray-900 font-heading">Award Category</h3>
        <p className="text-sm text-gray-500 font-sans">
          Select exactly one category that best represents the nominee's contributions.
        </p>
      </div>

      {/* Hidden input to bind into React Hook Form */}
      <input
        type="hidden"
        {...register('awardCategory', { required: 'Please select an award category' })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className={`flex flex-col text-left p-6 rounded-nec border transition-all duration-300 w-full glass-card-hover relative group ${
                isSelected
                  ? 'border-primary bg-primary/[0.08] shadow-glow ring-2 ring-primary/20'
                  : 'border-primary/15 bg-white/50 hover:bg-white'
              }`}
            >
              {/* Highlight Overlay Indicator */}
              <div
                className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary bg-primary text-white scale-110' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>

              {/* Icon */}
              <div
                className={`p-3 rounded-lg w-fit mb-4 transition-all ${
                  isSelected ? 'bg-primary text-white shadow-glow' : 'bg-primary/10 text-primary group-hover:bg-primary/25'
                }`}
              >
                <IconComponent className="w-6 h-6" />
              </div>

              {/* Category Info */}
              <h4 className="text-base font-bold text-gray-900 font-heading mb-1.5">{cat.title}</h4>
              <p className="text-xs text-gray-500 font-sans leading-relaxed">{cat.desc}</p>
            </button>
          );
        })}
      </div>

      {errors.awardCategory && (
        <div className="text-center">
          <span className="text-sm text-red-500 font-sans font-semibold">
            {errors.awardCategory.message}
          </span>
        </div>
      )}
    </div>
  );
};

export default Step3Category;
