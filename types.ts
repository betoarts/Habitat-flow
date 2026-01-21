
export enum HabitCategory {
  HEALTH = 'Saúde',
  PRODUCTIVITY = 'Produtividade',
  MIND = 'Mente',
  FINANCE = 'Finanças',
  CREATIVITY = 'Criatividade',
}

export enum Frequency {
  DAILY = 'Diário',
  WEEKLY = 'X vezes na semana',
  SPECIFIC_DAYS = 'Dias Específicos',
}

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: Frequency;
  completedDates: string[]; // ISO date strings YYYY-MM-DD
  streak: number;
  bestStreak: number;
  goal: string; // e.g., "5 min", "10 pages"
  reminders: string[]; // Array of time strings "HH:mm"
  frequencyDays?: number[]; // 0 = Sunday, 1 = Monday, etc. Used for SPECIFIC_DAYS
  frequencyCount?: number; // Used for WEEKLY (e.g., 3 times a week)
}

export interface User {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  joinedDate: string;
  goals: HabitCategory[]; // Selected onboarding goals
  isOnboarded: boolean;
  unlockedAchievements: string[]; // Array of Achievement IDs
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: 'Zap' | 'Trophy' | 'Target' | 'Flame' | 'Star' | 'Crown';
  xpReward: number;
  color: string;
}

export interface SuggestedHabit {
  name: string;
  category: HabitCategory;
  goal: string;
  reason: string; // Why AI suggests this
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  suggestedHabits?: SuggestedHabit[];
}
