import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Moon, Bell, User, Trash2, Shield, ChevronRight, HelpCircle, LogOut, Camera, Save, Upload, Sparkles, Loader2, Check, Key, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';
import { useAppContext } from '../context/AppContext';
import { editUserProfileImage, setApiKey, getCurrentApiKey, hasApiKey } from '../services/geminiService';

interface SettingsProps {
  onBack: () => void;
  onOpenSupport: () => void;
  user: UserType;
}

export const Settings: React.FC<SettingsProps> = ({ onBack, onOpenSupport, user }) => {
  const { updateUser } = useAppContext();
  const [notifications, setNotifications] = useState(true);
  
  // Initialize from DOM state to stay in sync with App.tsx initialization
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [saveSuccess, setSaveSuccess] = useState(false); // State for save animation
  
  // AI Image Edit State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Key State
  const [apiKey, setApiKeyState] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  // Load API key status on mount
  useEffect(() => {
    setHasKey(hasApiKey());
    // Only show masked preview, not actual key
    const currentKey = getCurrentApiKey();
    if (currentKey) {
      setApiKeyState(''); // Don't expose the actual key
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('habitflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('habitflow_theme', 'light');
    }
  };

  const handleSaveProfile = () => {
    if (editName.trim()) {
      updateUser({ name: editName, avatar: editAvatar });
      
      // Trigger success animation
      setSaveSuccess(true);
      
      // Close after delay
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1500);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAiEdit = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const newImage = await editUserProfileImage(editAvatar, aiPrompt);
      setEditAvatar(newImage);
      setShowAiInput(false);
      setAiPrompt('');
    } catch (error) {
      alert("Erro ao editar imagem. Verifique sua API Key nas Configurações.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKey.trim());
    setApiKeySaved(true);
    setHasKey(!!apiKey.trim());
    setTimeout(() => {
      setApiKeySaved(false);
      setApiKeyState('');
    }, 2000);
  };

  const handleRemoveApiKey = () => {
    setApiKey('');
    setApiKeyState('');
    setHasKey(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 animate-slide-up transition-colors duration-300">
        <div className="px-6 pt-10 pb-4 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-4 z-10 sticky top-0">
          <button 
            onClick={() => setIsEditing(false)} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editar Perfil</h1>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto pb-24">
          <div className="flex flex-col items-center">
            <div 
              className="relative group cursor-pointer"
              onClick={triggerFileInput}
            >
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-xl relative overflow-hidden">
                 <img src={editAvatar} alt="Avatar Preview" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 bg-gray-200" />
                 
                 {isGenerating && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full z-20">
                     <Loader2 className="text-white animate-spin" size={32} />
                   </div>
                 )}

                 {/* Overlay on hover/active */}
                 <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={32} />
                 </div>
              </div>
              
              <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full border-4 border-white dark:border-gray-900 shadow-sm transition-transform group-active:scale-95">
                 <Upload size={18} />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
                <p className="text-sm text-blue-600 font-medium cursor-pointer hover:underline" onClick={triggerFileInput}>
                Upload
                </p>
                <span className="text-gray-300">|</span>
                <button 
                    onClick={() => setShowAiInput(!showAiInput)}
                    className="text-sm text-purple-600 font-medium cursor-pointer flex items-center gap-1 hover:text-purple-700"
                >
                    <Sparkles size={14} />
                    IA Magic Edit
                </button>
            </div>

            {/* AI Edit Input */}
            {showAiInput && (
                <div className="w-full mt-4 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 animate-fade-in">
                    <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-2 block">Transforme sua foto</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ex: Estilo cyberpunk, desenho animado..."
                            className="flex-1 text-sm p-2 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button 
                            onClick={handleAiEdit}
                            disabled={!aiPrompt || isGenerating}
                            className="bg-purple-600 text-white p-2 rounded-lg disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Hidden File Input */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome</label>
              <input 
                type="text" 
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Seu nome"
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3">
              <div className="text-blue-600 dark:text-blue-400">
                <Shield size={20} />
              </div>
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                Sua foto é armazenada localmente. Use a IA para criar versões artísticas do seu avatar atual.
              </p>
            </div>
          </div>

          <button 
            onClick={handleSaveProfile}
            disabled={saveSuccess}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-4 
              ${saveSuccess 
                ? 'bg-green-500 text-white shadow-green-200 scale-[1.02]' 
                : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
              }`}
          >
            {saveSuccess ? (
              <>
                <Check size={24} className="animate-bounce" />
                <span>Salvo!</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 animate-slide-up transition-colors duration-300">
      {/* Header */}
      <div className="px-6 pt-10 pb-4 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-4 z-10 sticky top-0 transition-colors duration-300">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configurações</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-10">
        
        {/* Account Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Conta</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700"
            >
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <User size={20} />
                 </div>
                 <div className="text-left">
                   <p className="font-medium text-gray-900 dark:text-white">Editar Perfil</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">{user.name}</p>
                 </div>
               </div>
               <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Shield size={20} />
                 </div>
                 <div className="text-left">
                   <p className="font-medium text-gray-900 dark:text-white">Privacidade & Dados</p>
                 </div>
               </div>
               <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Preferências</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
                    <Bell size={20} />
                 </div>
                 <span className="font-medium text-gray-900 dark:text-white">Notificações</span>
               </div>
               <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${notifications ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
               >
                 <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-200 shadow-sm ${notifications ? 'left-6' : 'left-1'}`} />
               </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <Moon size={20} />
                 </div>
                 <span className="font-medium text-gray-900 dark:text-white">Modo Escuro</span>
               </div>
                <button 
                onClick={toggleDarkMode}
                className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
               >
                 <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-200 shadow-sm ${darkMode ? 'left-6' : 'left-1'}`} />
               </button>
            </div>
          </div>
        </section>

        {/* AI Integrations Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Integrações IA</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            
            {/* API Key Status */}
            <div className="p-4 border-b border-gray-50 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasKey ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500'}`}>
                  <Key size={20} />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">Gemini API Key</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {hasKey ? '✓ Configurada' : 'Necessária para recursos de IA'}
                  </p>
                </div>
                {hasKey && (
                  <button
                    onClick={handleRemoveApiKey}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Remover
                  </button>
                )}
              </div>

              {/* API Key Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKeyState(e.target.value)}
                    placeholder={hasKey ? '••••••••••••••••' : 'Cole sua API Key aqui'}
                    className="w-full p-3 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim() || apiKeySaved}
                  className={`px-4 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 ${
                    apiKeySaved 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {apiKeySaved ? <Check size={16} /> : <Save size={16} />}
                  {apiKeySaved ? 'Salvo!' : 'Salvar'}
                </button>
              </div>

              {/* Help text */}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Obtenha sua API Key em <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">aistudio.google.com/apikey</a>
              </p>
            </div>

            {/* AI Features Info */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
              <div className="flex items-start gap-3">
                <Sparkles className="text-purple-500 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Recursos desbloqueados com API Key:</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-0.5">
                    <li>• Chat com AI Coach para sugestões personalizadas</li>
                    <li>• Análise comportamental inteligente</li>
                    <li>• Notificações motivacionais dinâmicas</li>
                    <li>• Edição de foto com IA</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support & About */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Mais</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
             <button 
               onClick={onOpenSupport}
               className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
             >
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-500">
                    <HelpCircle size={20} />
                 </div>
                 <span className="font-medium text-gray-900 dark:text-white">Ajuda e Suporte</span>
               </div>
               <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3 pt-2">
          <button className="w-full flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors gap-2">
             <LogOut size={20} />
             Sair da conta
          </button>
          
          <button className="w-full flex items-center justify-center p-4 rounded-2xl text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors gap-2">
             <Trash2 size={16} />
             Apagar todos os dados
          </button>
          
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">Versão 1.0.0 • HabitFlow</p>
        </section>

      </div>
    </div>
  );
};