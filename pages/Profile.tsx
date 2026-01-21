import React from 'react';
import { User, Habit } from '../types';
import { LEVELS, ACHIEVEMENTS } from '../constants';
import { Settings, Share2, LogOut, Zap, Trophy, Target, Flame, Star, Crown, ChevronRight, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ProfileProps {
  user: User;
  habits: Habit[];
  onOpenSettings: () => void;
}

const ICONS: Record<string, any> = {
  Zap, Trophy, Target, Flame, Star, Crown
};

export const Profile: React.FC<ProfileProps> = ({ user, habits, onOpenSettings }) => {
  const currentLevelInfo = LEVELS.find(l => l.level === user.level) || LEVELS[0];
  const nextLevelInfo = LEVELS.find(l => l.level === user.level + 1);
  
  const progressToNext = nextLevelInfo 
    ? ((user.xp - currentLevelInfo.xp) / (nextLevelInfo.xp - currentLevelInfo.xp)) * 100 
    : 100;

  const joinedDate = user.joinedDate 
    ? format(new Date(user.joinedDate), 'MMM yyyy', { locale: ptBR })
    : 'Recentemente';

  const handleExportJSON = () => {
    const dataToExport = {
        user,
        habits,
        exportDate: new Date().toISOString(),
        appName: 'HabitFlow',
        version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habitflow_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(59, 130, 246); // Blue Primary
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("HabitFlow", 14, 20);
    
    doc.setFontSize(12);
    doc.text("Relatório de Progresso", 14, 30);

    // User Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Usuário: ${user.name}`, 14, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Nível: ${user.level} (${currentLevelInfo.title})`, 14, 62);
    doc.text(`XP Total: ${user.xp}`, 14, 68);
    doc.text(`Data do Relatório: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 14, 74);

    // Stats Overview
    const longestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
    const totalHabits = habits.length;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 80, 196, 80);

    // Habits Table
    const tableBody = habits.map(h => [
        h.name,
        h.category,
        h.goal,
        `${h.streak} dias`,
        `${h.bestStreak} dias`,
        h.frequency === 'Dias Específicos' ? 'Dias Fixos' : h.frequency
    ]);

    autoTable(doc, {
        startY: 90,
        head: [['Hábito', 'Categoria', 'Meta', 'Atual', 'Recorde', 'Freq.']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold' } // Habit Name
        }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Gerado via HabitFlow Web App', 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`HabitFlow_Relatorio_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Immersive Header */}
      <div className="relative bg-white dark:bg-gray-800 pb-8 rounded-b-[2.5rem] shadow-sm z-10 transition-colors duration-300">
        {/* Top Actions */}
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={onOpenSettings}
            className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Background Decor */}
        <div className="absolute top-[-50px] left-[-20%] w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute top-[20px] right-[-10%] w-40 h-40 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
        
        {/* Avatar & Identity */}
        <div className="pt-12 px-6 flex flex-col items-center relative z-10">
          <div className="relative mb-3 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="w-28 h-28 rounded-full p-1 bg-white dark:bg-gray-800 relative">
               <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-gray-50 dark:border-gray-700" />
            </div>
            <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
              Lv. {user.level}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{currentLevelInfo.title}</p>
        </div>

        {/* Quick Stats Row */}
        <div className="flex justify-center gap-4 mt-6 px-4">
           <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl min-w-[90px]">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{user.level}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Nível</span>
           </div>
           <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl min-w-[90px]">
              <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">{user.xp}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Total XP</span>
           </div>
           <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl min-w-[90px]">
              <span className="text-gray-700 dark:text-gray-200 font-bold text-lg capitalize">{joinedDate}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Membro</span>
           </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-24">
        
        {/* Next Level Progress */}
        <section>
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Próximo Nível</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {Math.floor(nextLevelInfo ? nextLevelInfo.xp - user.xp : 0)} XP restantes
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
               <div 
                 className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm transition-all duration-700 ease-out"
                 style={{ width: `${progressToNext}%` }}
               />
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" />
              Conquistas
            </h3>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full">
               {user.unlockedAchievements?.length || 0} / {ACHIEVEMENTS.length}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = user.unlockedAchievements?.includes(ach.id);
              const Icon = ICONS[ach.iconName] || Star;
              
              return (
                <div 
                  key={ach.id}
                  className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col gap-2 relative overflow-hidden group
                    ${isUnlocked 
                      ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm' 
                      : 'bg-gray-50 dark:bg-gray-800/30 border-transparent opacity-60 grayscale'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUnlocked ? ach.color : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                      <Icon size={16} fill={isUnlocked ? 'currentColor' : 'none'} />
                    </div>
                    {isUnlocked && <span className="text-[10px] font-bold text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded">XP</span>}
                  </div>
                  
                  <div>
                    <p className={`font-bold text-xs ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{ach.title}</p>
                    <p className="text-[10px] text-gray-400 leading-tight mt-1 line-clamp-2">{ach.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Menu Options */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Dados & Conta</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             
             {/* PDF Export */}
             <button 
                onClick={handleExportPDF}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700"
             >
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400"><FileText size={18} /></div>
                 <span className="font-medium text-sm text-gray-700 dark:text-gray-200">Relatório em PDF</span>
               </div>
               <Download size={16} className="text-gray-300" />
             </button>

             {/* JSON Export */}
             <button 
                onClick={handleExportJSON}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700"
             >
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400"><Share2 size={18} /></div>
                 <span className="font-medium text-sm text-gray-700 dark:text-gray-200">Backup dos Dados (JSON)</span>
               </div>
               <ChevronRight size={16} className="text-gray-300" />
             </button>

             {/* Logout */}
             <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 dark:text-red-400"><LogOut size={18} /></div>
                 <span className="font-medium text-sm text-gray-700 dark:text-gray-200">Sair da Conta</span>
               </div>
               <ChevronRight size={16} className="text-gray-300" />
             </button>
          </div>
          <p className="text-center text-[10px] text-gray-300 dark:text-gray-600 mt-6 pb-2">
            HabitFlow v1.0 • Feito com 💙
          </p>
        </section>

      </div>
    </div>
  );
};