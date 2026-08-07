import React from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  FlaskConical, 
  Trophy, 
  Heart, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';

const Step3Category = ({ watch, setValue, register, formState: { errors } }) => {
  const selectedCategory = watch('category');

  const categories = [
    {
      id: 'Business',
      title: 'Business',
      icon: Briefcase,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      description: 'Entrepreneurs, startup founders, corporate leaders, and executives driving outstanding business and industry success.'
    },
    {
      id: 'Academic',
      title: 'Academic',
      icon: GraduationCap,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      description: 'Professors, educators, institution builders, and academic research guides elevating learning environments.'
    },
    {
      id: 'Scientific',
      title: 'Scientific',
      icon: FlaskConical,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      description: 'Scientists, innovators, patent holders, and technological pioneers contributing to global scientific advancements.'
    },
    {
      id: 'Sports',
      title: 'Sports',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      description: 'Athletes, players, trainers, and coaches representing at state, national, or international platforms.'
    },
    {
      id: 'Social',
      title: 'Social',
      icon: Heart,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      description: 'Dedicated individuals leading NGOs, social organizations, humanitarian drives, and rural community welfare.'
    },
    {
      id: 'Political',
      title: 'Political',
      icon: Building2,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      description: 'Public administrators, governance contributors, state/national policy designers, and political leaders.'
    },
    {
      id: 'Retired Service Personnel',
      title: 'Retired Service Personnel',
      icon: ShieldCheck,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      description: 'Veterans who served with honor in the Indian Armed Forces (Army, Navy, Air Force) or Central Armed Police Forces (CAPF).'
    }
  ];

  const handleSelect = (categoryId) => {
    setValue('category', categoryId, { shouldValidate: true });
    // Reset categoryDetails dynamic fields if the category changes
    setValue('categoryDetails', {});
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary">Award Category</h2>
        <p className="text-xs text-slate-500 mt-1">Select exactly one category representing the primary domain of the nominee's contributions.</p>
      </div>

      {/* Hidden input to hook into react-hook-form */}
      <input 
        type="hidden" 
        {...register('category', { required: 'Please select an award category' })} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className={`text-left p-5 rounded-nec border transition-all duration-300 flex flex-col justify-between h-full group ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-glow ring-2 ring-primary/20 scale-[1.02]'
                  : 'border-borderlight bg-white hover:border-slate-300 hover:shadow-premium'
              }`}
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.bgColor} ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-heading font-bold text-base transition-colors ${
                    isSelected ? 'text-primary' : 'text-slate-800'
                  }`}>
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Status Radio Check */}
              <div className="mt-4 flex items-center justify-end w-full">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary bg-primary' : 'border-slate-300'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {errors?.category && (
        <div className="text-sm text-red-500 font-semibold text-center mt-4 bg-red-50 p-2.5 rounded-xl border border-red-200">
          {errors.category.message}
        </div>
      )}
    </div>
  );
};

export default Step3Category;
