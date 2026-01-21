import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Habit, User } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';
import { CheckCircle2, Circle, Plus, Flame, Bell, Clock, Sparkles, X, Share2, Pencil } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { useAppContext } from '../context/AppContext';

interface HomeProps {
  user: User;
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
}

const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 20,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

export const Home: React.FC<HomeProps> = ({ user, habits, onToggleHabit, onAddHabit, onEditHabit }) => {
  const { smartNotification, dismissNotification } = useAppContext();
  const [completedAnim, setCompletedAnim] = useState<string | null>(null);
  const [visibleRemindersId, setVisibleRemindersId] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  // Dynamic Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) return { text: 'Boa madrugada', icon: '🌙' };
    if (hour >= 6 && hour < 12) return { text: 'Bom dia', icon: '☀️' };
    if (hour >= 12 && hour < 18) return { text: 'Boa tarde', icon: '🌤️' };
    return { text: 'Boa noite', icon: '🌙' };
  };

  const { text: greetingText, icon: greetingIcon } = getGreeting();

  const progress = Math.round((habits.filter(h => h.completedDates.includes(today)).length / habits.length) * 100) || 0;

  const handleCheck = (id: string) => {
    setCompletedAnim(id);
    onToggleHabit(id);
    setTimeout(() => setCompletedAnim(null), 1000);
  };

  const toggleReminders = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setVisibleRemindersId(visibleRemindersId === id ? null : id);
  };

  const handleEdit = (e: React.MouseEvent, habit: Habit) => {
    e.stopPropagation();
    onEditHabit(habit);
  };

  const handleShare = async (e: React.MouseEvent, habit: Habit) => {
    e.stopPropagation();
    const text = `🔥 Estou mantendo uma sequência de ${habit.streak} dias no hábito "${habit.name}"! Junte-se a mim no HabitFlow. 🚀\n\nhttps://habitflow.servicestec.pro/`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Progresso no HabitFlow',
          text: text,
        });
      } catch (err) {
        console.log('User cancelled share');
      }
    } else {
      // Fallback for desktop or unsupported browsers
      navigator.clipboard.writeText(text);
      alert('Progresso copiado para a área de transferência!');
    }
  };

  return (
    <div className="relative h-full bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">

      {/* Header - Fixed Layer on Top - Increased z-index to 30 to stay above content elements */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 rounded-b-[2.5rem] shadow-md px-4 sm:px-6 pt-2 sm:pt-10 pb-5 sm:pb-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide first-letter:capitalize">{todayFormatted}</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{greetingText}, {user.name} {greetingIcon}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm">
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Daily Progress Card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Progresso Diário</p>
              <div className="text-3xl font-bold">{progress}%</div>
              <p className="text-xs text-blue-100 opacity-80 mt-1">
                {progress === 100 ? 'Parabéns! Tudo feito.' : 'Mantenha o foco!'}
              </p>
            </div>
            <div className="h-14 w-14 rounded-full border-4 border-white/30 flex items-center justify-center backdrop-blur-sm">
              <Flame className={`${progress > 0 ? 'text-yellow-300 fill-yellow-300' : 'text-white/50'}`} size={24} />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Area - Scrolls BEHIND the header */}
      <div className="h-full overflow-y-auto pt-[250px] sm:pt-[300px] pb-24 px-4 sm:px-6 scroll-smooth">

        {/* AI Smart Notification */}
        {smartNotification && (
          <div className="mb-4 animate-slide-up relative z-10">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-[1px] shadow-lg shadow-purple-200 dark:shadow-purple-900/30">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-xl"></div>

                <div className="flex items-start gap-3 relative z-10">
                  <div className="min-w-[32px] h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-0.5">Dica do Coach</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">
                      {smartNotification}
                    </p>
                  </div>
                  <button
                    onClick={dismissNotification}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Habits List Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-gray-800 dark:text-white">Hábitos de Hoje</h2>
          <button
            onClick={onAddHabit}
            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Habits Items */}
        <div className="space-y-3 pb-8">
          {habits.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <p>Nenhum hábito criado ainda.</p>
              <button onClick={onAddHabit} className="text-blue-500 font-semibold mt-2">Criar primeiro hábito</button>
            </div>
          ) : (
            habits.map((habit) => {
              const isCompleted = habit.completedDates.includes(today);
              const Icon = CATEGORY_ICONS[habit.category];
              const colorClass = CATEGORY_COLORS[habit.category];
              const hasReminders = habit.reminders && habit.reminders.length > 0;

              return (
                <div
                  key={habit.id}
                  onClick={() => handleCheck(habit.id)}
                  className={`group flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-300 active:scale-[0.98] relative overflow-visible
                    ${isCompleted ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : 'hover:shadow-md dark:hover:shadow-gray-900/30'}
                  `}
                >
                  {/* Icon Box */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${colorClass.replace('text-', 'bg-opacity-20 ')}`}>
                    <Icon size={22} className={colorClass.split(' ')[0]} />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-gray-800 dark:text-gray-100 transition-all ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                        {habit.name}
                      </h3>

                      {/* Action Buttons Container */}
                      <div className="flex items-center gap-1 ml-1">
                        {/* Share Button */}
                        <button
                          onClick={(e) => handleShare(e, habit)}
                          className="p-1.5 rounded-full text-gray-300 dark:text-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                          title="Compartilhar Progresso"
                        >
                          <Share2 size={14} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={(e) => handleEdit(e, habit)}
                          className="p-1.5 rounded-full text-gray-300 dark:text-gray-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                          title="Editar Hábito"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Reminder Bell & Tooltip */}
                        {hasReminders && (
                          <div className="relative">
                            <button
                              onClick={(e) => toggleReminders(e, habit.id)}
                              className={`p-1 rounded-full transition-all duration-300 ${visibleRemindersId === habit.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400'}`}
                            >
                              <Bell size={14} className={visibleRemindersId === habit.id ? 'fill-blue-600 dark:fill-blue-400' : ''} />
                            </button>

                            {visibleRemindersId === habit.id && (
                              <div
                                className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-700 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600 p-3 min-w-[140px] z-50 animate-fade-in"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-300 mb-2">
                                  <Clock size={12} />
                                  <span>Lembretes</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {habit.reminders.map((time, idx) => (
                                    <span key={idx} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md font-medium border border-blue-100 dark:border-blue-900/30">
                                      {time}
                                    </span>
                                  ))}
                                </div>
                                {/* Little Arrow */}
                                <div className="absolute -top-1 left-2 w-2 h-2 bg-white dark:bg-gray-700 border-t border-l border-gray-100 dark:border-gray-600 transform rotate-45"></div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 relative z-20">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                        {habit.goal}
                      </span>

                      {habit.streak > 0 && (
                        <span className="text-xs text-orange-500 flex items-center gap-0.5 font-medium">
                          <Flame size={10} className="fill-orange-500" /> {habit.streak}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="relative">
                    <div className="absolute center">
                      <Confetti active={completedAnim === habit.id} config={confettiConfig} />
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 size={28} className="text-green-500 fill-green-50" />
                    ) : (
                      <Circle size={28} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-400 dark:group-hover:text-blue-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};