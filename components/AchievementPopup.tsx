import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { Zap, Trophy, Target, Flame, Star, Crown, X } from 'lucide-react';
import Confetti from 'react-dom-confetti';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const ICONS: Record<string, any> = {
  Zap, Trophy, Target, Flame, Star, Crown
};

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setTimeout(() => setShowConfetti(true), 100);
      
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!achievement) return null;

  const Icon = ICONS[achievement.iconName] || Star;

  return (
    <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none p-4 ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border-2 border-yellow-100 dark:border-yellow-900 w-full max-w-sm relative pointer-events-auto transform transition-all duration-500 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-20 scale-95'}`}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="absolute top-0 transform -translate-y-1/2">
             <div className="relative">
                <Confetti active={showConfetti} config={{ spread: 360, elementCount: 100 }} />
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${achievement.color.replace('text-', 'bg-')}`}>
                  <Icon size={40} className="text-white" fill="currentColor" />
                </div>
             </div>
          </div>

          <div className="mt-10">
            <h3 className="text-yellow-500 font-bold uppercase tracking-wider text-xs mb-1">Conquista Desbloqueada!</h3>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{achievement.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{achievement.description}</p>
            
            <div className="inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 rounded-full">
              <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">+{achievement.xpReward} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};