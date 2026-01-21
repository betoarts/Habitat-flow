import React, { useEffect, useState } from 'react';
import { Infinity, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  useEffect(() => {
    // Start exit animation after 2.5s
    const timer = setTimeout(() => {
      setShouldFadeOut(true);
    }, 2500);

    // Unmount component after animation finishes (total 3s)
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-opacity duration-700 ease-in-out ${shouldFadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background Decor - Matches app accent colors (primary/secondary defined in tailwind config) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[50vh] h-[50vh] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60vh] h-[60vh] bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative flex flex-col items-center animate-scale-in">
        {/* Logo Mark */}
        <div className="relative mb-8">
          {/* Logo Background with Brand Gradient (Primary to Secondary) */}
          <div className="relative w-28 h-28 bg-gradient-to-tr from-primary to-secondary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 animate-float transform rotate-3">
             <Infinity size={56} className="text-white drop-shadow-md" strokeWidth={2.5} />
             <div className="absolute -top-3 -right-3">
                <Sparkles size={28} className="text-yellow-300 fill-yellow-300 animate-bounce" />
             </div>
          </div>
        </div>

        {/* Brand Name - Uses app text colors */}
        <h1 className="text-5xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-white">
          HabitFlow
        </h1>

        {/* Tagline */}
        <div className="flex flex-col items-center gap-2 opacity-90">
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500 dark:text-gray-400">
            Ritmo & Constância
            </p>
        </div>
      </div>

      {/* Footer loading indicator - Colored dots matching brand */}
      <div className="absolute bottom-12">
         <div className="flex gap-2">
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce delay-75"></div>
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-150"></div>
         </div>
      </div>
    </div>
  );
};