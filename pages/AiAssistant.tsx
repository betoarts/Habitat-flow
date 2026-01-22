import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Habit, User, SuggestedHabit, HabitCategory } from '../types';
import { chatWithAssistant, getBehavioralAnalysis } from '../services/aiService';
import { useAppContext } from '../context/AppContext';
import { Send, Bot, Sparkles, Plus, Check, PlayCircle, Trash2, Bell, X } from 'lucide-react';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import SEO from '../components/SEO';

interface AiAssistantProps {
  user: User;
  habits: Habit[];
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ user, habits }) => {
  const { addHabit } = useAppContext();

  // Initialize from LocalStorage or Default Welcome Message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('habitflow_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [{
      id: 'welcome',
      role: 'model',
      text: `Olá ${user.name}! Sou seu assistente de hábitos. Posso analisar sua rotina e criar novos hábitos para você.`,
      timestamp: Date.now()
    }];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedHabitIds, setAddedHabitIds] = useState<Set<string>>(new Set());
  const [quotaError, setQuotaError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Persist messages to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('habitflow_chat_history', JSON.stringify(messages));
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

    // Check for quota error or invalid key
    if (response.text === "QUOTA_EXCEEDED") {
      setQuotaError(true);
      setLoading(false);
      return;
    }

    if (response.text === "INVALID_KEY") {
      setMessages(prev => [...prev, {
        id: 'system-error-' + Date.now(),
        role: 'model',
        text: "🚫 API Key Inválida ou Expirada. Por favor, verifique sua chave nas configurações.",
        timestamp: Date.now()
      }]);
      setLoading(false);
      return;
    }

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

  const handleClearHistory = () => {
    if (window.confirm("Deseja apagar todo o histórico da conversa?")) {
      const resetMsg: ChatMessage = {
        id: 'welcome-' + Date.now(),
        role: 'model',
        text: `Histórico limpo! Como posso ajudar agora, ${user.name}?`,
        timestamp: Date.now()
      };
      setMessages([resetMsg]);
      localStorage.removeItem('habitflow_chat_history');
    }
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-24 relative transition-colors duration-300">
      <SEO
        title="IA Assistent | HabitFlow"
        description="Converse com sua IA pessoal para criar e otimizar seus hábitos."
      />
      <div className="px-6 pt-10 pb-4 bg-white dark:bg-gray-800 shadow-sm z-10 flex justify-between items-center transition-colors">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bot className="text-purple-600 dark:text-purple-400" />
          HabitFlow IA
        </h1>
        <button
          onClick={handleClearHistory}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
          title="Limpar histórico"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quota Error Banner */}
        {quotaError && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-[1px] shadow-lg animate-slide-up">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-xl"></div>

              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="min-w-[32px] h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Bell size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">Limite de Quota Atingido</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      Você atingiu o limite diário de 20 requisições da API gratuita do Gemini. A quota reseta em aproximadamente 24 horas.
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        🔑 Obter nova API Key
                      </a>
                      <span className="text-gray-400 mx-2">•</span>
                      <a
                        href="https://ai.dev/rate-limit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        📊 Verificar uso atual
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => setQuotaError(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed mb-1 shadow-sm
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
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
                  const Icon = CATEGORY_ICONS[habit.category] || Sparkles;
                  const colorClass = CATEGORY_COLORS[habit.category] || 'text-gray-500 bg-gray-100';

                  return (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden">
                      {/* Left colored bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass.replace('text-', 'bg-').split(' ')[0]}`}></div>

                      <div className="flex items-center gap-3 pl-2 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.replace('text-', 'bg-opacity-20 ')}`}>
                          <Icon size={18} className={colorClass.split(' ')[0]} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white text-sm">{habit.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{habit.goal} • <span className="italic">{habit.reason}</span></p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptHabit(habit, msg.id, idx)}
                        disabled={isAdded}
                        className={`p-2 rounded-full transition-all duration-300 flex items-center gap-1
                           ${isAdded
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default px-3'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/30'}
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
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700 flex gap-2">
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
          className="whitespace-nowrap px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border border-purple-100 dark:border-purple-800/30"
        >
          <Sparkles size={14} />
          Sugerir Hábitos
        </button>
        <button
          onClick={() => setInput("Crie um hábito de leitura para mim.")}
          disabled={loading}
          className="whitespace-nowrap px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800/30"
        >
          <PlayCircle size={14} />
          Começar Leitura
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ex: Crie um hábito para beber água..."
          className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};