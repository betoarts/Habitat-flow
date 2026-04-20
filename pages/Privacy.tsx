import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Trash2, Database, Share2, Info, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { useAppContext } from '../context/AppContext';

interface PrivacyProps {
  onBack: () => void;
}

export const Privacy: React.FC<PrivacyProps> = ({ onBack }) => {
  const { clearAllData } = useAppContext();
  
  const handleDeleteAllData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os seus dados? Esta ação não pode ser desfeita.')) {
      clearAllData();
    }
  };

  const privacyPoints = [
    {
      icon: <Database className="text-blue-500" size={24} />,
      title: "Armazenamento Local",
      description: "Seus dados de hábitos, metas e progresso são armazenados exclusivamente no seu dispositivo. Não enviamos esses dados para nossos servidores."
    },
    {
      icon: <Lock className="text-purple-500" size={24} />,
      title: "Segurança de Dados",
      description: "Utilizamos as melhores práticas de segurança local para garantir que apenas você tenha acesso às suas informações dentro do aplicativo."
    },
    {
      icon: <Eye className="text-green-500" size={24} />,
      title: "Transparência",
      description: "Você tem total controle sobre seus dados. Não rastreamos seu comportamento fora do aplicativo nem vendemos suas informações para terceiros."
    },
    {
      icon: <Share2 className="text-orange-500" size={24} />,
      title: "Serviços de Terceiros",
      description: "Se você optar por usar recursos de IA (Gemini ou OpenAI), apenas os dados estritamente necessários para a funcionalidade (como prompts de chat) são enviados aos respectivos provedores."
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 animate-slide-up transition-colors duration-300">
      <SEO
        title="Privacidade & Dados | HabitFlow"
        description="Saiba como protegemos sua privacidade e gerenciamos seus dados no HabitFlow."
      />

      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-4 z-10 sticky top-0 transition-colors">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Privacidade & Dados</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
            <Shield size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sua privacidade em primeiro lugar</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
            No HabitFlow, acreditamos que seus dados pertencem a você. Veja como lidamos com sua privacidade.
          </p>
        </div>

        {/* Privacy Points */}
        <div className="space-y-6 mb-10">
          {privacyPoints.map((point, index) => (
            <div key={index} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="mt-1">{point.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{point.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Data Control Section */}
        <div className="mb-10">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Controle de Dados</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Você pode exportar seus dados de hábitos a qualquer momento (em breve).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A exclusão da conta ou do aplicativo remove permanentemente todos os dados locais.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Não compartilhamos seus dados com redes de publicidade.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Data Warning */}
        <div className="p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-3 mb-3 text-red-600 dark:text-red-400">
            <Trash2 size={20} />
            <h4 className="font-bold">Apagar todos os dados</h4>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Esta ação é irreversível e removerá todos os seus hábitos, streaks e configurações do dispositivo.
          </p>
          <button 
            onClick={handleDeleteAllData}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
          >
            Apagar Permanentemente
          </button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
          <Info size={14} />
          <span className="text-xs italic">Última atualização: Abril de 2024</span>
        </div>
      </div>
    </div>
  );
};
