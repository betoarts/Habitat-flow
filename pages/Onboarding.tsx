import React, { useState } from 'react';
import { HabitCategory } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { ArrowRight, Check, Sparkles, Plus, Zap, Infinity, BarChart3 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateOnboardingInsight } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (goals: HabitCategory[]) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user, addHabit } = useAppContext();
  const [selectedGoals, setSelectedGoals] = useState<HabitCategory[]>([]);
  const [step, setStep] = useState(0);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{message: string, habitName: string, habitGoal: string} | null>(null);

  const toggleGoal = (goal: HabitCategory) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(prev => prev.filter(g => g !== goal));
    } else {
      setSelectedGoals(prev => [...prev, goal]);
    }
  };

  const handleGoalsSelected = async () => {
    setStep(2); // Go to AI Loading/Result step
    setLoadingAi(true);
    
    // Fetch AI Insight
    const insight = await generateOnboardingInsight(user.name, selectedGoals);
    setAiSuggestion(insight);
    setLoadingAi(false);
  };

  const handleFinish = (acceptSuggestion: boolean) => {
    if (acceptSuggestion && aiSuggestion) {
      addHabit({
        name: aiSuggestion.habitName,
        goal: aiSuggestion.habitGoal,
        category: selectedGoals[0] || HabitCategory.PRODUCTIVITY, // Default to first selected or Productivity
        frequency: 'Diário' as any,
        reminders: []
      });
    }
    onComplete(selectedGoals);
  };

  // Step 0: Friendly Welcome (Matches App Style)
  if (step === 0) {
    return (
      <div className="relative flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-blue-200 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-200 dark:bg-purple-900/20 rounded-full blur-[80px] opacity-60"></div>

        <div className="relative z-10 flex flex-col h-full px-8 pt-20 pb-10 justify-between">
          <div className="flex flex-col items-center text-center animate-slide-up">
            
            {/* Hero Icon Composition */}
            <div className="relative w-32 h-32 mb-10">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-[2.5rem] rotate-6 shadow-2xl shadow-blue-500/30 opacity-80"></div>
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-[2.5rem] -rotate-3 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                    <Infinity size={64} className="text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Sparkles size={20} className="text-white fill-white" />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
              Construa hábitos <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">que duram.</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-xs">
              Pequenos passos diários transformam sua rotina. Comece sua jornada hoje.
            </p>
          </div>

          <button 
            onClick={() => setStep(1)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 dark:shadow-blue-900/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Começar Agora
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: AI Coach (Clean & Modern)
  if (step === 2) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-6 justify-center items-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 dark:bg-purple-900/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl -z-10"></div>

        {loadingAi ? (
          <div className="flex flex-col items-center text-center z-10 animate-fade-in">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={32} className="text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Criando seu plano...</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Nossa IA está analisando o melhor caminho para você.</p>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full justify-between z-10 pt-10 pb-4 animate-slide-up">
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-center mb-6">
                 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20 text-white">
                    <Zap size={32} fill="currentColor" />
                 </div>
              </div>
              
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-8">
                Sugestão Personalizada
              </h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                 
                 <p className="text-gray-600 dark:text-gray-300 text-lg font-medium leading-relaxed mb-6 italic">
                   "{aiSuggestion?.message}"
                 </p>

                 <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                        <Plus size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">Primeiro Hábito</p>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{aiSuggestion?.habitName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{aiSuggestion?.habitGoal}</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-3 mt-8">
              <button 
                onClick={() => handleFinish(true)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
              >
                Aceitar Desafio
              </button>
              <button 
                onClick={() => handleFinish(false)}
                className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Criar meu próprio
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 1: Goal Selection (Clean & Consistent)
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="px-6 pt-12 pb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Qual seu foco?</h2>
        <p className="text-gray-500 dark:text-gray-400">Escolha as áreas que você deseja priorizar agora.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-24">
        {Object.values(HabitCategory).map((category) => {
          const isSelected = selectedGoals.includes(category);
          const Icon = CATEGORY_ICONS[category];
          
          return (
            <button
              key={category}
              onClick={() => toggleGoal(category)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 border-2
                ${isSelected 
                  ? 'bg-white dark:bg-gray-800 border-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/20 shadow-md' 
                  : 'bg-white dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                <Icon size={24} />
              </div>
              <div className="flex-1 text-left">
                <span className={`text-base font-bold block ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                    {category}
                </span>
              </div>
              
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                {isSelected && <Check size={14} strokeWidth={4} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleGoalsSelected}
          disabled={selectedGoals.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
            ${selectedGoals.length > 0 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
        >
          Continuar
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};