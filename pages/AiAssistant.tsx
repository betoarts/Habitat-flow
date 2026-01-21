import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Habit, User, SuggestedHabit, HabitCategory } from '../types';
import { chatWithAssistant, getBehavioralAnalysis } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { Send, Bot, Sparkles, Plus, Check, PlayCircle } from 'lucide-react';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';

interface AiAssistantProps {
  user: User;
  habits: Habit[];
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ user, habits }) => {
  const { addHabit } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Olá ${user.name}! Sou seu assistente de hábitos. Posso analisar sua rotina e criar novos hábitos para você.`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedHabitIds, setAddedHabitIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const historyText = messages.map(m => `${m.role === 'user' ? 'Usuário' : 'IA'}: ${m.text}`).join('\n');
    
    // Pass User and Habits context to service
    const response = await chatWithAssistant(input, historyText, user, habits);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text,
      timestamp: Date.now(),
      suggestedHabits: response.suggestedHabits as SuggestedHabit[] | undefined
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const generateInsight = async () => {
    const prompt = "Analise meus hábitos atuais e sugira melhorias ou novos hábitos.";
    setInput(prompt);
    // Directly trigger logic as if user typed it, but we need to wait for state update in a real scenario. 
    // Simplified here by calling handleSend via effect or direct call logic.
    // For this implementation, let's just populate the input field for the user to confirm sending.
  };

  const handleAcceptHabit = (habit: SuggestedHabit, messageId: string, index: number) => {
    const uniqueId = `${messageId}-${index}`;
    if (addedHabitIds.has(uniqueId)) return;

    addHabit({
      name: habit.name,
      category: habit.category,
      goal: habit.goal,
      frequency: 'Diário' as any, // Default frequency for AI suggestions
      reminders: []
    });

    setAddedHabitIds(prev => new Set(prev).add(uniqueId));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 relative">
      <div className="px-6 pt-10 pb-4 bg-white shadow-sm z-10">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="text-purple-600" />
          HabitFlow IA
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed mb-1
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                }`}
            >
              {msg.text}
            </div>

            {/* Render Suggested Habits Cards if present */}
            {msg.suggestedHabits && msg.suggestedHabits.length > 0 && (
              <div className="flex flex-col gap-2 mt-2 w-full max-w-[85%] animate-fade-in">
                {msg.suggestedHabits.map((habit, idx) => {
                  const uniqueId = `${msg.id}-${idx}`;
                  const isAdded = addedHabitIds.has(uniqueId);
                  const Icon = CATEGORY_ICONS[habit.category];
                  const colorClass = CATEGORY_COLORS[habit.category];

                  return (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden">
                       {/* Left colored bar */}
                       <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass.replace('text-', 'bg-').split(' ')[0]}`}></div>
                       
                       <div className="flex items-center gap-3 pl-2 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.replace('text-', 'bg-opacity-20 ')}`}>
                             <Icon size={18} className={colorClass.split(' ')[0]} />
                          </div>
                          <div>
                             <p className="font-bold text-gray-800 text-sm">{habit.name}</p>
                             <p className="text-xs text-gray-500">{habit.goal} • <span className="italic">{habit.reason}</span></p>
                          </div>
                       </div>

                       <button 
                         onClick={() => handleAcceptHabit(habit, msg.id, idx)}
                         disabled={isAdded}
                         className={`p-2 rounded-full transition-all duration-300 flex items-center gap-1
                           ${isAdded 
                             ? 'bg-green-100 text-green-600 cursor-default px-3' 
                             : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'}
                         `}
                       >
                         {isAdded ? (
                           <>
                             <Check size={16} />
                             <span className="text-xs font-bold">Adicionado</span>
                           </>
                         ) : (
                           <Plus size={20} />
                         )}
                       </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            <span className="text-[10px] text-gray-400 px-2">
              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setInput("Analise minha rotina e sugira 2 novos hábitos.")}
          disabled={loading}
          className="whitespace-nowrap px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors border border-purple-100"
        >
          <Sparkles size={14} />
          Sugerir Hábitos
        </button>
        <button 
          onClick={() => setInput("Crie um hábito de leitura para mim.")}
          disabled={loading}
          className="whitespace-nowrap px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors border border-blue-100"
        >
          <PlayCircle size={14} />
          Começar Leitura
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ex: Crie um hábito para beber água..."
          className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};