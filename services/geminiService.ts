import { GoogleGenAI, Type } from "@google/genai";
import { Habit, User, HabitCategory, ChatMessage } from "../types";

// Helper function to get API key from localStorage or environment
const getApiKey = (): string | null => {
  // Priority: localStorage > process.env
  if (typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('habitflow_gemini_api_key');
    if (savedKey) return savedKey;
  }
  return process.env.API_KEY || null;
};

// Function to check if API key is available
export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

// Function to set API key in localStorage
export const setApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    if (key) {
      localStorage.setItem('habitflow_gemini_api_key', key);
    } else {
      localStorage.removeItem('habitflow_gemini_api_key');
    }
  }
};

// Function to get the current API key (for display purposes)
export const getCurrentApiKey = (): string => {
  return getApiKey() || '';
};

// Create Gemini client lazily to use the latest API key
const getAiClient = (): GoogleGenAI | null => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getBehavioralAnalysis = async (habits: Habit[], user: User): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "Simulação: Configure sua API Key nas Configurações para receber análises reais. Com base nos seus dados simulados, você tem mantido uma boa constância em leitura, mas a hidratação precisa de atenção nos fins de semana.";
  }

  try {
    const prompt = `
      Atue como um especialista em comportamento e formação de hábitos.
      Analise os seguintes dados do usuário:
      Nome: ${user.name}
      Nível: ${user.level}
      Hábitos: ${JSON.stringify(habits.map(h => ({ name: h.name, streak: h.streak, category: h.category })))}

      Forneça um feedback curto (max 3 frases), motivador e personalizado.
      Se houver um hábito com streak baixo, sugira uma micro-mudança para facilitar.
      Fale em português do Brasil. Use emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar análise no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "O assistente está dormindo um pouco. Tente novamente mais tarde.";
  }
};

interface ChatResponse {
  text: string;
  suggestedHabits?: Array<{
    name: string;
    category: string;
    goal: string;
    reason: string;
  }>;
}

export const chatWithAssistant = async (message: string, history: string, user: User, habits: Habit[]): Promise<ChatResponse> => {
  const ai = getAiClient();
  if (!ai) {
    // Simulation fallback
    if (message.toLowerCase().includes('criar') || message.toLowerCase().includes('sugira')) {
      return {
        text: "Como estou em modo simulação, aqui está uma sugestão baseada no seu perfil:",
        suggestedHabits: [{
          name: "Meditação Matinal",
          category: HabitCategory.MIND,
          goal: "5 minutos",
          reason: "Para melhorar seu foco diário."
        }]
      };
    }
    return { text: "Simulação: O modo chat requer uma API Key válida. Eu posso ajudar a ajustar suas metas ou sugerir novos hábitos!" };
  }

  try {
    const contextPrompt = `
      Você é o HabitFlow AI, um coach comportamental.
      
      DADOS DO USUÁRIO:
      Nome: ${user.name}
      Hábitos Atuais: ${JSON.stringify(habits.map(h => h.name))}
      Interesses: ${user.goals.join(', ')}

      INSTRUÇÕES:
      1. Responda de forma amigável e motivadora em Português do Brasil.
      2. Se o usuário pedir para criar hábitos, sugerir rotinas ou se você identificar uma lacuna óbvia na rotina dele, PREENCHA o array 'suggestedHabits'.
      3. As sugestões devem ser "hábitos atômicos" (fáceis de começar).
      4. Se for apenas uma conversa casual, deixe 'suggestedHabits' vazio.
      
      Histórico recente:
      ${history}
      
      Mensagem atual: ${message}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contextPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "A resposta textual para o usuário." },
            suggestedHabits: {
              type: Type.ARRAY,
              description: "Lista opcional de hábitos sugeridos para adicionar.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, enum: Object.values(HabitCategory) },
                  goal: { type: Type.STRING },
                  reason: { type: Type.STRING, description: "Curta explicação do porquê sugeriu isso." }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ChatResponse;
    }
    return { text: "Não entendi, pode repetir?" };

  } catch (error: any) {
    console.error("Chat Error:", error);

    // Check if it's a quota error
    if (error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 'RESOURCE_EXHAUSTED') {
      return {
        text: "QUOTA_EXCEEDED",
        suggestedHabits: []
      };
    }

    return { text: "Tive um problema de conexão. Tente novamente." };
  }
};

interface OnboardingInsight {
  message: string;
  habitName: string;
  habitGoal: string;
}

export const generateOnboardingInsight = async (userName: string, goals: HabitCategory[]): Promise<OnboardingInsight> => {
  const ai = getAiClient();
  // Fallback for no API Key
  if (!ai) {
    return new Promise(resolve => setTimeout(() => resolve({
      message: `Olá ${userName}! Excelente escolha focar em ${goals[0]}. Vamos começar devagar para ir longe.`,
      habitName: "Caminhada Leve",
      habitGoal: "10 minutos"
    }), 2000));
  }

  try {
    const prompt = `
      O usuário ${userName} selecionou os seguintes objetivos de vida: ${goals.join(', ')}.
      
      Atue como um Coach de Hábitos especializado.
      1. Crie uma mensagem curta de boas-vindas (max 2 frases) motivadora e personalizada em Português do Brasil.
      2. Sugira APENAS UM hábito simples e "atômico" (fácil de começar) relacionado a esses objetivos.
      
      Retorne APENAS um objeto JSON (sem markdown) com as chaves:
      - "message": A mensagem de boas-vindas.
      - "habitName": Nome curto do hábito (ex: "Ler Livro").
      - "habitGoal": Meta específica e pequena (ex: "5 páginas").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            habitName: { type: Type.STRING },
            habitGoal: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as OnboardingInsight;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Onboarding AI Error:", error);
    return {
      message: `Bem-vindo, ${userName}! Vamos transformar seus objetivos em realidade.`,
      habitName: "Planejar o Dia",
      habitGoal: "5 minutos"
    };
  }
};

export const editUserProfileImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("API Key ausente. Configure nas Configurações.");
  }

  try {
    // Remove header data URL if present (data:image/png;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
    });

    // Iterate parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Nenhuma imagem gerada.");
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

export const generateSmartNotification = async (userName: string, pendingHabits: Habit[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai || pendingHabits.length === 0) {
    return "";
  }

  try {
    const timeOfDay = new Date().getHours() < 12 ? "manhã" : new Date().getHours() < 18 ? "tarde" : "noite";
    const prompt = `
      Você é o "Smart Notification System" do HabitFlow.
      Hora atual: ${timeOfDay}.
      Usuário: ${userName}.
      Hábitos pendentes hoje: ${pendingHabits.map(h => h.name).join(', ')}.

      Tarefa: Crie uma notificação push curta, inteligente e motivadora (max 15 palavras).
      Use contexto de tempo (ex: "Ainda dá tempo", "Comece o dia vencendo").
      Seja levemente provocativo ou encorajador. Use 1 emoji.
      Responda APENAS o texto da notificação.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Smart Notification Error:", error);
    return "";
  }
};