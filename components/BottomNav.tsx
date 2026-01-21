import React from 'react';
import { House, ChartPie, Sparkles, User, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setTab }) => {
  const navItems = [
    { id: 'home', icon: House, label: 'Início' },
    { id: 'progress', icon: ChartPie, label: 'Stats' },
    { id: 'ai', icon: Sparkles, label: 'AI Coach' },
    { id: 'profile', icon: User, label: 'Perfil' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="absolute bottom-0 w-full z-50">
      {/* Gradient fade to integrate nav with content smoothly */}
      <div className="h-12 bg-gradient-to-t from-white/10 to-transparent dark:from-gray-900/10 pointer-events-none absolute -top-12 left-0 w-full"></div>
      
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 pb-safe pt-3 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
        <div className="flex justify-between items-center h-14 max-w-sm mx-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="relative flex flex-col items-center justify-center w-14 h-14 group focus:outline-none"
              >
                {/* Active Indicator Pill */}
                {isActive && (
                  <span className="absolute top-1 w-12 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-2xl -z-10 animate-scale-in" />
                )}

                <div className={`transition-all duration-300 ease-out-back transform ${isActive ? '-translate-y-0.5' : ''}`}>
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    // Use fill to make icons look solid when active (works best for House, User, etc)
                    fill={isActive ? "currentColor" : "none"}
                    className={`transition-colors duration-300 ${
                      isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`}
                  />
                </div>
                
                <span 
                  className={`text-[10px] font-bold mt-1 transition-all duration-300 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 opacity-100 translate-y-0' 
                      : 'text-gray-400 opacity-0 -translate-y-2 h-0 overflow-hidden'
                  }`}
                >
                  {item.label}
                </span>
                
                {/* Inactive Dot (Optional, shows when label is hidden) */}
                {!isActive && (
                    <span className="absolute bottom-2 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};