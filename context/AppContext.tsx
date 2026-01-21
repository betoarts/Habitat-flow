import React, { createContext, useContext, useState, useEffect } from 'react';
import { Habit, User, HabitCategory, Achievement } from '../types';
import { MOCK_HABITS, LEVELS, ACHIEVEMENTS } from '../constants';
import { format, subDays } from 'date-fns';
import { generateSmartNotification } from '../services/geminiService';

interface AppContextType {
  user: User;
  habits: Habit[];
  isOnboardingComplete: boolean;
  latestAchievement: Achievement | null;
  smartNotification: string | null;
  completeOnboarding: (goals: HabitCategory[]) => void;
  toggleHabit: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'bestStreak'>) => void;
  updateHabit: (habit: Habit) => void;
  updateUser: (updates: Partial<User>) => void;
  clearLatestAchievement: () => void;
  dismissNotification: () => void;
  deleteHabit: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_USER: User = {
  name: 'Humberto',
  avatar: 'https://i.pravatar.cc/300',
  xp: 150,
  level: 2,
  joinedDate: new Date().toISOString(),
  goals: [],
  isOnboarded: false,
  unlockedAchievements: []
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('habitflow_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habitflow_habits');
    return saved ? JSON.parse(saved) : MOCK_HABITS;
  });

  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null);
  const [smartNotification, setSmartNotification] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('habitflow_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('habitflow_habits', JSON.stringify(habits));
  }, [habits]);

  // Check for Smart Notification on mount
  useEffect(() => {
    const fetchNotification = async () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const pendingHabits = habits.filter(h => !h.completedDates.includes(today));
        
        if (pendingHabits.length > 0 && user.isOnboarded) {
            // Add a small delay to simulate app processing/loading
            const msg = await generateSmartNotification(user.name, pendingHabits);
            if (msg) {
                setSmartNotification(msg);
            }
        }
    };
    
    if (!smartNotification) {
        fetchNotification();
    }
  }, [user.name, user.isOnboarded]); 

  const completeOnboarding = (goals: HabitCategory[]) => {
    setUser(prev => ({ ...prev, goals, isOnboarded: true }));
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const dismissNotification = () => {
    setSmartNotification(null);
  };

  const checkAchievements = (currentUser: User, currentHabits: Habit[]) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const unlockedIds = new Set(currentUser.unlockedAchievements);
    const newUnlockeds: Achievement[] = [];

    // Logic for each achievement
    ACHIEVEMENTS.forEach(ach => {
      if (unlockedIds.has(ach.id)) return;

      let unlocked = false;

      switch (ach.id) {
        case 'first_step':
          // Check if any habit has at least 1 completion
          if (currentHabits.some(h => h.completedDates.length > 0)) unlocked = true;
          break;
        case 'on_fire':
          // Check if any habit has streak >= 3
          if (currentHabits.some(h => h.streak >= 3)) unlocked = true;
          break;
        case 'week_warrior':
           // Check if any habit has streak >= 7
           if (currentHabits.some(h => h.streak >= 7)) unlocked = true;
           break;
        case 'monthly_master':
           // Check if any habit has streak >= 30
           if (currentHabits.some(h => h.streak >= 30)) unlocked = true;
           break;
        case 'high_five':
           // Check if 5 habits completed today
           const completedToday = currentHabits.filter(h => h.completedDates.includes(today)).length;
           if (completedToday >= 5) unlocked = true;
           break;
      }

      if (unlocked) {
        newUnlockeds.push(ach);
      }
    });

    if (newUnlockeds.length > 0) {
       const ach = newUnlockeds[0];
       
       setUser(prev => {
         const newXp = prev.xp + ach.xpReward;
         const newLevel = LEVELS.slice().reverse().find(l => newXp >= l.xp)?.level || 1;

         return {
           ...prev,
           xp: newXp,
           level: newLevel,
           unlockedAchievements: [...prev.unlockedAchievements || [], ach.id]
         };
       });

       setLatestAchievement(ach);
    }
  };

  const toggleHabit = (id: string) => {
    let xpChange = 0;
    
    // We calculate the new state first to determine XP change based on consistency
    const updatedHabits = habits.map(habit => {
        if (habit.id !== id) return habit;

        const today = format(new Date(), 'yyyy-MM-dd');
        const isCompletedToday = habit.completedDates.includes(today);
        let newCompletedDates = [...habit.completedDates];

        if (isCompletedToday) {
          // UNDO ACTION
          newCompletedDates = newCompletedDates.filter(d => d !== today);
          
          // Remove XP: Base 10 + estimated streak bonus
          // We remove the bonus proportional to the streak they HAD
          const streakBonus = Math.min(habit.streak * 2, 50);
          xpChange = -(10 + streakBonus); 
        } else {
          // COMPLETE ACTION
          newCompletedDates.push(today);
        }

        // Recalculate Streak
        const sortedDates = [...newCompletedDates].sort();
        let currentStreak = 0;
        
        if (newCompletedDates.length > 0) {
           // We check if today or yesterday is present to start counting backwards
           const lastDate = sortedDates[sortedDates.length - 1];
           const todayStr = format(new Date(), 'yyyy-MM-dd');
           const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
           
           if (lastDate === todayStr || lastDate === yesterdayStr) {
               currentStreak = 1;
               // Iterate backwards to find consecutive days
               for (let i = 1; i < 365; i++) { 
                   const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
                   // Note: This logic assumes dates are in the array. 
                   // A more robust logic handles gaps for 'specific days' frequency, 
                   // but for MVP 'daily' logic this works.
                   if (newCompletedDates.includes(checkDate)) {
                       currentStreak++;
                   } else {
                       break;
                   }
               }
           }
        }

        // If we just completed it, calculate Positive XP with Constancy Bonus
        if (!isCompletedToday) {
            // Base XP: 10
            // Constancy Bonus: 2 XP per day of streak (Max 50 bonus)
            const streakBonus = Math.min(currentStreak * 2, 50);
            xpChange = 10 + streakBonus;
        }

        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: currentStreak,
          bestStreak: Math.max(habit.bestStreak, currentStreak)
        };
    });

    setHabits(updatedHabits);

    // Apply XP Change
    if (xpChange !== 0) {
        setUser(prev => {
            const newXp = Math.max(0, prev.xp + xpChange);
            const newLevel = LEVELS.slice().reverse().find(l => newXp >= l.xp)?.level || 1;
            return {
                ...prev,
                xp: newXp,
                level: newLevel
            };
        });
    }

    // Check achievements with the updated state
    setTimeout(() => {
        checkAchievements(user, updatedHabits);
    }, 100);
  };

  const addHabit = (newHabitData: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'bestStreak'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: Date.now().toString(),
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      reminders: newHabitData.reminders || [] // Ensure reminders array exists
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (updatedHabit: Habit) => {
    setHabits(prev => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const clearLatestAchievement = () => setLatestAchievement(null);

  return (
    <AppContext.Provider value={{ 
      user, 
      habits, 
      isOnboardingComplete: user.isOnboarded, 
      completeOnboarding, 
      toggleHabit, 
      addHabit,
      updateHabit,
      updateUser,
      deleteHabit,
      latestAchievement,
      clearLatestAchievement,
      smartNotification,
      dismissNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};