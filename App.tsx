import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Progress } from './pages/Progress';
import { AiAssistant } from './pages/AiAssistant';
import { Profile } from './pages/Profile';
import { Onboarding } from './pages/Onboarding';
import { Settings } from './pages/Settings';
import { Support } from './pages/Support';
import { SplashScreen } from './components/SplashScreen';
import { TestPushHook } from './components/TestPushHook';
import { AchievementPopup } from './components/AchievementPopup';
import { AppProvider, useAppContext } from './context/AppContext';
import { HabitCategory, Frequency, Habit } from './types';
import { Plus, X, Bell, Clock, Calendar, Repeat, Check, Trash2 } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainApp = () => {
  const {
    user,
    habits,
    isOnboardingComplete,
    completeOnboarding,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    latestAchievement,
    clearLatestAchievement
  } = useAppContext();

  const [currentTab, setCurrentTab] = useState(() => {
    // Check path for test harness
    if (window.location.pathname === '/test-usePushNotifications') {
      return 'test-push';
    }
    return 'home';
  });
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit State
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  // Form State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitGoal, setNewHabitGoal] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>(HabitCategory.HEALTH);

  // Frequency State
  const [frequencyType, setFrequencyType] = useState<Frequency>(Frequency.DAILY);
  const [frequencyDays, setFrequencyDays] = useState<number[]>([]); // 0=Sun, 6=Sat
  const [frequencyCount, setFrequencyCount] = useState<number>(3); // 3 times a week default

  // Reminder State
  const [reminders, setReminders] = useState<string[]>([]);
  const [tempReminder, setTempReminder] = useState('');

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('habitflow_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (!isOnboardingComplete) {
    return (
      <Layout>
        <Onboarding onComplete={completeOnboarding} />
      </Layout>
    );
  }

  const resetForm = () => {
    setNewHabitName('');
    setNewHabitGoal('');
    setReminders([]);
    setTempReminder('');
    setFrequencyType(Frequency.DAILY);
    setFrequencyDays([]);
    setFrequencyCount(3);
    setNewHabitCategory(HabitCategory.HEALTH);
    setEditingHabitId(null);
  };

  const handleCreateOrUpdateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName && newHabitGoal) {

      // Validation for specific days
      if (frequencyType === Frequency.SPECIFIC_DAYS && frequencyDays.length === 0) {
        alert("Selecione pelo menos um dia da semana.");
        return;
      }

      const habitData = {
        name: newHabitName,
        category: newHabitCategory,
        goal: newHabitGoal,
        frequency: frequencyType,
        reminders: reminders,
        frequencyDays: frequencyType === Frequency.SPECIFIC_DAYS ? frequencyDays : undefined,
        frequencyCount: frequencyType === Frequency.WEEKLY ? frequencyCount : undefined
      };

      if (editingHabitId) {
        const existingHabit = habits.find(h => h.id === editingHabitId);
        if (existingHabit) {
          updateHabit({
            ...existingHabit,
            ...habitData
          });
        }
      } else {
        addHabit(habitData);
      }

      resetForm();
      setShowAddModal(false);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setNewHabitName(habit.name);
    setNewHabitGoal(habit.goal);
    setNewHabitCategory(habit.category);
    setFrequencyType(habit.frequency);
    setReminders(habit.reminders || []);
    setFrequencyDays(habit.frequencyDays || []);
    setFrequencyCount(habit.frequencyCount || 3);
    setShowAddModal(true);
  };

  const handleDeleteHabit = () => {
    if (editingHabitId && window.confirm("Tem certeza que deseja excluir este hábito?")) {
      deleteHabit(editingHabitId);
      resetForm();
      setShowAddModal(false);
    }
  };

  const handleAddReminder = () => {
    if (tempReminder && !reminders.includes(tempReminder)) {
      setReminders([...reminders, tempReminder].sort());
      setTempReminder('');
    }
  };

  const removeReminder = (time: string) => {
    setReminders(reminders.filter(r => r !== time));
  };

  const toggleDay = (dayIndex: number) => {
    if (frequencyDays.includes(dayIndex)) {
      setFrequencyDays(frequencyDays.filter(d => d !== dayIndex));
    } else {
      setFrequencyDays([...frequencyDays, dayIndex]);
    }
  };

  const setWeekendsOnly = () => {
    setFrequencyType(Frequency.SPECIFIC_DAYS);
    setFrequencyDays([0, 6]); // Sun, Sat
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home user={user} habits={habits} onToggleHabit={toggleHabit} onAddHabit={() => setShowAddModal(true)} onEditHabit={handleEditHabit} />;
      case 'progress':
        return <Progress habits={habits} />;
      case 'ai':
        return <AiAssistant user={user} habits={habits} />;
      case 'profile':
        return <Profile user={user} habits={habits} onOpenSettings={() => setCurrentTab('settings')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentTab('profile')} onOpenSupport={() => setCurrentTab('support')} user={user} />;
      case 'support':
        return <Support onBack={() => setCurrentTab('settings')} />;
      case 'test-push':
        return <TestPushHook />;
      default:
        return <Home user={user} habits={habits} onToggleHabit={toggleHabit} onAddHabit={() => setShowAddModal(true)} onEditHabit={handleEditHabit} />;
    }
  };

  const WEEKDAYS = [
    { label: 'D', value: 0 },
    { label: 'S', value: 1 },
    { label: 'T', value: 2 },
    { label: 'Q', value: 3 },
    { label: 'Q', value: 4 },
    { label: 'S', value: 5 },
    { label: 'S', value: 6 },
  ];


  return (
    <Layout>
      <ErrorBoundary>
        {renderContent()}
      </ErrorBoundary>
      <BottomNav currentTab={currentTab} setTab={setCurrentTab} />

      {/* Achievement Popup */}
      <AchievementPopup achievement={latestAchievement} onClose={clearLatestAchievement} />

      {/* Add/Edit Habit Modal Overlay */}
      {showAddModal && (
        <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full sm:w-[90%] sm:rounded-2xl rounded-t-3xl p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingHabitId ? 'Editar Hábito' : 'Novo Hábito'}
              </h2>
              <div className="flex gap-2">
                {editingHabitId && (
                  <button onClick={handleDeleteHabit} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500 dark:text-red-400">
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={closeModal} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-300">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateOrUpdateHabit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Hábito</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  placeholder="Ex: Meditar, Beber Água..."
                  className="w-full p-4 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                  autoFocus={!editingHabitId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta (Descrição Curta)</label>
                <input
                  type="text"
                  value={newHabitGoal}
                  onChange={e => setNewHabitGoal(e.target.value)}
                  placeholder="Ex: 5 min, 1 cap..."
                  className="w-full p-4 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
                  {Object.values(HabitCategory).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                            ${newHabitCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
                         `}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Repeat size={16} className="text-gray-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequência</label>
                </div>

                {/* Frequency Type Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setFrequencyType(Frequency.DAILY)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${frequencyType === Frequency.DAILY ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    Todos os dias
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequencyType(Frequency.WEEKLY)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${frequencyType === Frequency.WEEKLY ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    X vezes/sem
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequencyType(Frequency.SPECIFIC_DAYS)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${frequencyType === Frequency.SPECIFIC_DAYS ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    Dias Fixos
                  </button>
                </div>

                {/* Logic for Weekly Count */}
                {frequencyType === Frequency.WEEKLY && (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setFrequencyCount(Math.max(1, frequencyCount - 1))} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-lg">-</button>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{frequencyCount}x</span>
                      <button type="button" onClick={() => setFrequencyCount(Math.min(7, frequencyCount + 1))} className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold text-lg">+</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">vezes por semana</p>
                  </div>
                )}

                {/* Logic for Specific Days */}
                {frequencyType === Frequency.SPECIFIC_DAYS && (
                  <div className="animate-fade-in">
                    <div className="flex justify-between mb-3">
                      {WEEKDAYS.map((day) => {
                        const isSelected = frequencyDays.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center
                                            ${isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                                : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'}
                                         `}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={setWeekendsOnly}
                        className="text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400"
                      >
                        Apenas fins de semana
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reminders Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lembretes</label>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="time"
                      value={tempReminder}
                      onChange={e => setTempReminder(e.target.value)}
                      className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddReminder}
                    disabled={!tempReminder}
                    className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {reminders.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reminders.map((time) => (
                      <div key={time} className="flex items-center gap-1 pl-3 pr-1 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium border border-yellow-100 dark:border-yellow-900/50">
                        <Bell size={12} className="fill-current" />
                        <span>{time}</span>
                        <button
                          type="button"
                          onClick={() => removeReminder(time)}
                          className="p-1 hover:bg-black/5 rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!newHabitName || !newHabitGoal}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 mt-4 hover:bg-blue-700 disabled:opacity-50"
              >
                {editingHabitId ? 'Salvar Alterações' : 'Criar Hábito'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;