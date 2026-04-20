import { HabitCategory, Achievement } from './types';
import { Heart, Zap, Brain, Wallet, Palette } from 'lucide-react';

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  [HabitCategory.HEALTH]: 'text-red-500 bg-red-100',
  [HabitCategory.PRODUCTIVITY]: 'text-blue-500 bg-blue-100',
  [HabitCategory.MIND]: 'text-purple-500 bg-purple-100',
  [HabitCategory.FINANCE]: 'text-green-500 bg-green-100',
  [HabitCategory.CREATIVITY]: 'text-pink-500 bg-pink-100',
};

export const CATEGORY_ICONS: Record<HabitCategory, any> = {
  [HabitCategory.HEALTH]: Heart,
  [HabitCategory.PRODUCTIVITY]: Zap,
  [HabitCategory.MIND]: Brain,
  [HabitCategory.FINANCE]: Wallet,
  [HabitCategory.CREATIVITY]: Palette,
};

export const LEVELS = [
  { level: 1, xp: 0, title: 'Iniciante' },
  { level: 2, xp: 150, title: 'Aprendiz' },
  { level: 3, xp: 400, title: 'Praticante' },
  { level: 4, xp: 800, title: 'Consistente' },
  { level: 5, xp: 1500, title: 'Mestre do Foco' },
  { level: 6, xp: 2500, title: 'Guru da Rotina' },
  { level: 7, xp: 4000, title: 'Lenda Viva' },
  { level: 8, xp: 6000, title: 'Guerreiro da Disciplina' },
  { level: 9, xp: 8500, title: 'Estrategista de Hábitos' },
  { level: 10, xp: 12000, title: 'Inabalável' },
  { level: 11, xp: 16000, title: 'Sentinela do Progresso' },
  { level: 12, xp: 21000, title: 'Titã da Constância' },
  { level: 13, xp: 27000, title: 'Oráculo da Rotina' },
  { level: 14, xp: 35000, title: 'Arquiteto do Destino' },
  { level: 15, xp: 45000, title: 'Divindade do Hábito' },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Primeiro Passo',
    description: 'Complete seu primeiro hábito e inicie a jornada.',
    iconName: 'Star',
    xpReward: 50,
    color: 'text-yellow-500 bg-yellow-100'
  },
  {
    id: 'on_fire',
    title: 'Aquecendo',
    description: 'Mantenha um streak de 3 dias em qualquer hábito.',
    iconName: 'Flame',
    xpReward: 100,
    color: 'text-orange-500 bg-orange-100'
  },
  {
    id: 'week_warrior',
    title: '🔥 7 dias seguidos',
    description: 'Uma semana inteira de consistência pura!',
    iconName: 'Zap',
    xpReward: 350,
    color: 'text-blue-500 bg-blue-100'
  },
  {
    id: 'monthly_master',
    title: '🧠 30 dias de foco',
    description: 'Um mês de disciplina. Seu cérebro mudou.',
    iconName: 'Crown',
    xpReward: 1000,
    color: 'text-purple-500 bg-purple-100'
  },
  {
    id: 'habit_collector',
    title: 'Colecionador',
    description: 'Tenha 10 hábitos ativos simultaneamente.',
    iconName: 'Layers',
    xpReward: 500,
    color: 'text-indigo-500 bg-indigo-100'
  },
  {
    id: 'early_bird',
    title: 'Madrugador',
    description: 'Complete um hábito antes das 7:00 da manhã.',
    iconName: 'Sun',
    xpReward: 250,
    color: 'text-amber-500 bg-amber-100'
  },
  {
    id: 'perfect_week',
    title: 'Semana Perfeita',
    description: 'Complete todos os seus hábitos todos os dias por 7 dias.',
    iconName: 'CheckCircle',
    xpReward: 800,
    color: 'text-emerald-500 bg-emerald-100'
  },
  {
    id: 'century_club',
    title: 'Clube dos 100',
    description: 'Alcance um streak de 100 dias em qualquer hábito.',
    iconName: 'Trophy',
    xpReward: 5000,
    color: 'text-rose-500 bg-rose-100'
  },
  {
    id: 'multi_tasker',
    title: 'Multitarefa Real',
    description: 'Complete 10 hábitos em um único dia.',
    iconName: 'Activity',
    xpReward: 600,
    color: 'text-cyan-500 bg-cyan-100'
  },
  {
    id: 'high_five',
    title: 'High Five',
    description: 'Complete 5 hábitos diferentes em um único dia.',
    iconName: 'Target',
    xpReward: 200,
    color: 'text-green-500 bg-green-100'
  }
];

export const MOCK_HABITS = [
  {
    id: '1',
    name: 'Beber 2L de água',
    category: HabitCategory.HEALTH,
    frequency: 'Diário',
    completedDates: [],
    streak: 2,
    bestStreak: 5,
    goal: '2 Litros',
    reminders: ['09:00', '15:00']
  },
  {
    id: '2',
    name: 'Ler 10 páginas',
    category: HabitCategory.MIND,
    frequency: 'Diário',
    completedDates: [],
    streak: 12,
    bestStreak: 12,
    goal: '10 págs',
    reminders: ['21:00']
  },
];