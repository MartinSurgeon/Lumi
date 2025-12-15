import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { BookOpen, User, GraduationCap, Brain } from 'lucide-react';
import LumiAvatar from './LumiAvatar';

interface SetupModalProps {
  onComplete: (profile: StudentProfile) => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    grade: '',
    favoriteSubject: '',
    struggleTopic: '',
    learningStyle: 'visual',
  });

  const handleChange = (field: keyof StudentProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (profile.name && profile.grade) {
      onComplete(profile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden animate-slide-up transition-colors duration-300">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="relative w-12 h-12">
                <LumiAvatar size="sm" className="w-full h-full" />
            </div>
            <span>Welcome to Lumi</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Let's set up your personal study companion.</p>

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Child's Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g. Maya"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Grade Level</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g. 5th Grade"
                    value={profile.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={nextStep}
                  disabled={!profile.name || !profile.grade}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white px-6 py-2 rounded-full font-semibold transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Favorite Subject</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g. Science"
                    value={profile.favoriteSubject}
                    onChange={(e) => handleChange('favoriteSubject', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Topic needing help</label>
                <div className="relative">
                  <Brain className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g. Fractions, Photosynthesis"
                    value={profile.struggleTopic}
                    onChange={(e) => handleChange('struggleTopic', e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-between">
                <button 
                  onClick={prevStep}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
                >
                  Start Learning <LumiAvatar size="sm" className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupModal;