import React from 'react';
import { Habit, HabitCategory } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay, parseISO, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';
import { Calendar, Zap, PieChart, TrendingUp } from 'lucide-react';

interface ProgressProps {
  habits: Habit[];
}

export const Progress: React.FC<ProgressProps> = ({ habits }) => {
  // 1. Weekly Data (Last 7 Days)
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStr = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'EEE', { locale: ptBR });
    
    const completedCount = habits.reduce((acc, habit) => {
      return acc + (habit.completedDates.includes(dayStr) ? 1 : 0);
    }, 0);

    return {
      name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      completed: completedCount,
    };
  });

  // Calculate Consistency Score (Last 7 days)
  const totalPossibleCompletions = habits.length * 7;
  const totalActualCompletions = weeklyData.reduce((acc, day) => acc + day.completed, 0);
  const consistencyScore = totalPossibleCompletions > 0 
    ? Math.round((totalActualCompletions / totalPossibleCompletions) * 100) 
    : 0;

  const scoreData = [
    { name: 'Score', value: consistencyScore, fill: '#8B5CF6' }
  ];

  // 2. Day of Week Performance (Historical)
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dayCounts = Array(7).fill(0);

  habits.forEach(habit => {
    habit.completedDates.forEach(dateStr => {
      const dayIndex = getDay(parseISO(dateStr));
      dayCounts[dayIndex]++;
    });
  });

  const dayPerformanceData = daysOfWeek.map((day, index) => ({
    name: day,
    value: dayCounts[index]
  }));

  const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
  const bestDayName = dayCounts[bestDayIndex] > 0 ? daysOfWeek[bestDayIndex] : '---';

  // 3. Category Distribution (Historical Effort)
  const categoryCounts: Record<string, number> = {};
  let totalCompletions = 0;

  habits.forEach(habit => {
    const count = habit.completedDates.length;
    categoryCounts[habit.category] = (categoryCounts[habit.category] || 0) + count;
    totalCompletions += count;
  });

  const categoryData = Object.entries(categoryCounts)
    .map(([key, value]) => ({
        name: key,
        value: value,
        percent: totalCompletions > 0 ? (value / totalCompletions) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  const dominantCategory = categoryData.length > 0 ? categoryData[0].name : '---';

  // 4. Heatmap Data
  const heatmapDays = eachDayOfInterval({
    start: subDays(new Date(), 89), // 90 days roughly
    end: new Date()
  });

  const longestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
  const currentTotalStreak = habits.reduce((acc, h) => acc + h.streak, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-24 transition-colors duration-300">
      <div className="px-6 pt-10 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estatísticas</h1>
      </div>

      {/* Score Dashboard & Stats */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/10 rounded-bl-full pointer-events-none"></div>

           {/* Left: Score Chart */}
           <div className="flex flex-col items-center justify-center w-1/2 relative z-10">
              <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="70%" 
                      outerRadius="100%" 
                      barSize={12} 
                      data={scoreData} 
                      startAngle={90} 
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background={{ fill: '#f3f4f6' }}
                        clockWise
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                 </ResponsiveContainer>
                 {/* Center Text */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{consistencyScore}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Score</span>
                 </div>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-[-10px]">Consistência Semanal</p>
           </div>

           {/* Right: Stats Column */}
           <div className="w-px h-24 bg-gray-100 dark:bg-gray-700 mx-2"></div>

           <div className="flex flex-col justify-center gap-4 w-1/2 pl-2 relative z-10">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl">
                 <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase">Recorde</span>
                 </div>
                 <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{longestStreak} <span className="text-xs font-normal text-gray-500">dias</span></p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl">
                 <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-400 uppercase">Foco Total</span>
                 </div>
                 <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{currentTotalStreak} <span className="text-xs font-normal text-gray-500">xp</span></p>
              </div>
           </div>
        </div>
      </div>

      {/* Behavioral Insights Cards */}
      <div className="px-6 mb-6">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Insights Comportamentais</h3>
          <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                      <Calendar size={16} />
                      <span className="text-xs font-bold uppercase">Dia Power</span>
                  </div>
                  <p className="text-xl font-bold">{bestDayName}</p>
                  <p className="text-[10px] opacity-70 leading-tight mt-1">Dia da semana com maior taxa de sucesso.</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg shadow-pink-200 dark:shadow-none">
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                      <Zap size={16} />
                      <span className="text-xs font-bold uppercase">Foco Principal</span>
                  </div>
                  <p className="text-xl font-bold truncate">{dominantCategory}</p>
                  <p className="text-[10px] opacity-70 leading-tight mt-1">Categoria onde você mais investe energia.</p>
              </div>
          </div>
      </div>

      {/* Weekly Chart */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Atividade Diária (7 dias)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff', color: '#1f2937' }}
                />
                <Bar dataKey="completed" radius={[6, 6, 6, 6]} barSize={32}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#3B82F6' : '#E5E7EB'} className="dark:fill-gray-600 dark:[&.recharts-bar-rectangle]:fill-blue-500" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Day of Week Performance Chart */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Performance Semanal Histórica</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayPerformanceData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#6B7280' }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
                   {dayPerformanceData.map((entry, index) => (
                    <Cell key={`cell-day-${index}`} fill="#8B5CF6" fillOpacity={0.6 + (index % 2) * 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Acumulado de todos os hábitos concluídos por dia da semana.</p>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="px-6 mb-6">
         <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <PieChart size={18} className="text-gray-400" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Distribuição de Esforço</h3>
            </div>
            
            {categoryData.length > 0 ? (
                <div className="space-y-4">
                    {categoryData.map((cat, idx) => {
                        const Icon = CATEGORY_ICONS[cat.name as HabitCategory];
                        const colorClass = CATEGORY_COLORS[cat.name as HabitCategory];
                        
                        return (
                            <div key={idx} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass.replace('text-', 'bg-opacity-20 ')}`}>
                                    {Icon && <Icon size={16} className={colorClass.split(' ')[0]} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{Math.round(cat.percent)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${colorClass.replace('text-', 'bg-').split(' ')[0]}`}
                                            style={{ width: `${cat.percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-400 text-sm py-4">Complete hábitos para ver sua distribuição.</p>
            )}
         </div>
      </div>

      {/* Heatmap */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Mapa de Foco (90 dias)</h3>
          <div className="flex flex-wrap gap-1 justify-center">
            {heatmapDays.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isToday = isSameDay(day, new Date());
              
              // Calculate intensity based on completions for this specific day
              const completionsOnDay = habits.reduce((acc, h) => acc + (h.completedDates.includes(dateStr) ? 1 : 0), 0);
              
              let bgClass = 'bg-gray-100 dark:bg-gray-700';
              if (completionsOnDay === 1) bgClass = 'bg-blue-300 dark:bg-blue-800';
              if (completionsOnDay >= 2) bgClass = 'bg-blue-500 dark:bg-blue-600';
              if (completionsOnDay >= 4) bgClass = 'bg-blue-700 dark:bg-blue-400';
              
              if (isToday) bgClass += ' ring-2 ring-offset-1 ring-black dark:ring-white dark:ring-offset-gray-900';

              return (
                <div 
                  key={idx} 
                  className={`w-3 h-3 rounded-sm transition-colors ${bgClass}`} 
                  title={`${format(day, 'dd/MM/yyyy')}: ${completionsOnDay} hábitos`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};