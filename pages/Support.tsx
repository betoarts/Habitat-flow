import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, Mail, FileText, HelpCircle, ExternalLink, Bug } from 'lucide-react';
import SEO from '../components/SEO';

interface SupportProps {
  onBack: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Como funciona o cálculo de Streak?",
    answer: "O Streak (sequência) conta quantos dias consecutivos você completou um hábito. Se você configurou um hábito para 'Dias Específicos', o streak só conta nesses dias. Se perder um dia, a contagem reinicia!"
  },
  {
    question: "Como excluir ou editar um hábito?",
    answer: "Na tela inicial, toque no ícone de lápis (editar) ao lado do nome do hábito. Para excluir, dentro da tela de edição, clique no ícone de lixeira no canto superior."
  },
  {
    question: "O que são os Níveis e XP?",
    answer: "Você ganha XP (Experiência) ao completar hábitos e manter a constância. Subir de nível desbloqueia novas conquistas e emblemas no seu perfil."
  },
  {
    question: "A IA Coach é gratuita?",
    answer: "Sim! O HabitFlow usa inteligência artificial para analisar seus dados localmente e sugerir melhorias na sua rotina de forma gratuita."
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Absolutamente. Seus hábitos e progresso são armazenados localmente no seu dispositivo. Nenhuma informação pessoal é vendida a terceiros."
  }
];

export const Support: React.FC<SupportProps> = ({ onBack }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 animate-slide-up transition-colors duration-300">
      <SEO
        title="Ajuda e Suporte | HabitFlow"
        description="Central de ajuda do HabitFlow. Encontre respostas para dúvidas comuns ou entre em contato."
      />

      {/* Header */}
      <div className="px-6 pt-10 pb-4 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-4 z-10 sticky top-0 transition-colors">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ajuda e Suporte</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">

        {/* Hero Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
            <HelpCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Como podemos ajudar?</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
            Encontre respostas rápidas ou entre em contato com nosso time.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a
            href="https://wa.me/5554991680204?text=Preciso%20de%20ajuda"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
              <MessageCircle size={20} />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Falar com Suporte</span>
          </a>
          <button className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl">
              <Bug size={20} />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Reportar Bug</span>
          </button>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Perguntas Frequentes</h3>
          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 border 
                                ${isOpen ? 'border-blue-200 dark:border-blue-900 shadow-md' : 'border-gray-100 dark:border-gray-700 shadow-sm'}`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className={`font-medium text-sm ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-blue-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </button>

                  <div
                    className={`px-4 text-sm text-gray-500 dark:text-gray-400 overflow-hidden transition-all duration-300 ease-in-out
                                    ${isOpen ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legal Links */}
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4">
          <button className="w-full flex items-center justify-between py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Termos de Uso</span>
            </div>
            <ExternalLink size={14} />
          </button>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
          <button className="w-full flex items-center justify-between py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Política de Privacidade</span>
            </div>
            <ExternalLink size={14} />
          </button>
        </div>

        {/* Contact Email Fallback */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Ainda precisa de ajuda? Envie um email para
          </p>
          <a href="mailto:support@habitflow.app" className="text-sm font-bold text-blue-500 hover:underline mt-1 block">
            aracajuofertas@gmail.com
          </a>
        </div>

      </div>
    </div>
  );
};