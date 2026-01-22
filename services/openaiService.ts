import OpenAI from "openai";
import { Habit, User, HabitCategory } from "../types";

// Helper keys for localStorage
const API_KEY_STORAGE = 'habitflow_openai_api_key';

// Helper function to get API key from localStorage or environment
const getApiKey = (): string | null => {
    if (typeof window !== 'undefined') {
        const savedKey = localStorage.getItem(API_KEY_STORAGE);
        if (savedKey) return savedKey;
    }
    return null; // OpenAI key is usually not in public env for security, but could add if needed
};

// Function to check if API key is available
export const hasOpenAiKey = (): boolean => {
    return !!getApiKey();
};

// Function to set API key in localStorage
export const setOpenAiKey = (key: string): void => {
    if (typeof window !== 'undefined') {
        if (key) {
            localStorage.setItem(API_KEY_STORAGE, key);
        } else {
            localStorage.removeItem(API_KEY_STORAGE);
        }
    }
};

// Function to get the current API key (for display purposes)
export const getCurrentOpenAiKey = (): string => {
    return getApiKey() || '';
};

// Create OpenAI client lazily
const getAiClient = (): OpenAI | null => {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    });
};

export const getBehavioralAnalysisOpenAi = async (habits: Habit[], user: User): Promise<string> => {
    const ai = getAiClient();
    if (!ai) {
        return "OpenAI: Configure sua API Key para receber análises.";
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

        const response = await ai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150
        });

        return response.choices[0]?.message?.content || "Não foi possível gerar análise no momento.";
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return "O assistente OpenAI está indisponível no momento.";
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

export const chatWithAssistantOpenAi = async (message: string, history: string, user: User, habits: Habit[]): Promise<ChatResponse> => {
    const ai = getAiClient();
    if (!ai) {
        return { text: "OpenAI: O modo chat requer uma API Key válida." };
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
      2. Se o usuário pedir para criar hábitos, sugerir rotinas ou se você identificar uma lacuna óbvia na rotina dele, PREENCHA o JSON de resposta com 'suggestedHabits'.
      3. As sugestões devem ser "hábitos atômicos" (fáceis de começar).
      4. Se for apenas uma conversa casual, deixe 'suggestedHabits' vazio.
      
      Histórico recente:
      ${history}
      
      Mensagem atual: ${message}

      RESPOSTA OBRIGATÓRIA EM JSON com o formato:
      {
        "text": "sua resposta aqui",
        "suggestedHabits": [ { "name": "...", "category": "HEALTH", "goal": "...", "reason": "..." } ]
      }
    `;

        const response = await ai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: contextPrompt }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
            return JSON.parse(content) as ChatResponse;
        }
        return { text: "Não entendi, pode repetir?" };

    } catch (error: any) {
        console.error("OpenAI Chat Error:", error);
        if (error?.status === 429) {
            return { text: "Limite de requisições excedido (Quota Exceeded)." };
        }
        return { text: "Erro de conexão com OpenAI." };
    }
};

interface OnboardingInsight {
    message: string;
    habitName: string;
    habitGoal: string;
}

export const generateOnboardingInsightOpenAi = async (userName: string, goals: HabitCategory[]): Promise<OnboardingInsight> => {
    const ai = getAiClient();
    if (!ai) {
        return new Promise(resolve => setTimeout(() => resolve({
            message: `Olá ${userName}! Excelente escolha focar em ${goals[0]}. (Modo Simulação OpenAI)`,
            habitName: "Caminhada Leve",
            habitGoal: "10 minutos"
        }), 1000));
    }

    try {
        const prompt = `
      O usuário ${userName} selecionou os seguintes objetivos de vida: ${goals.join(', ')}.
      
      Atue como um Coach de Hábitos especializado.
      1. Crie uma mensagem curta de boas-vindas (max 2 frases) motivadora e personalizada em Português do Brasil.
      2. Sugira APENAS UM hábito simples e "atômico" (fácil de começar) relacionado a esses objetivos.
      
      Retorne APENAS um objeto JSON válido com as chaves:
      - "message": A mensagem de boas-vindas.
      - "habitName": Nome curto do hábito.
      - "habitGoal": Meta específica e pequena.
    `;

        const response = await ai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
            return JSON.parse(content) as OnboardingInsight;
        }
        throw new Error("Empty response");
    } catch (error) {
        console.error("OpenAI Onboarding Error:", error);
        return {
            message: `Bem-vindo, ${userName}!`,
            habitName: "Planejar o Dia",
            habitGoal: "5 minutos"
        };
    }
};

export const editUserProfileImageOpenAi = async (base64Image: string, prompt: string): Promise<string> => {
    // DALL-E 2 edits require a mask and square PGNs under 4MB, which is complex to implement client-side purely 
    // without a backend proxying the file. 
    // DALL-E 3 does not support edits yet via API in the same way.
    // simpler fallback: Generate a NEW image based on description of user? 
    // Or just fail for now as "Not supported in OpenAI Direct Integration".

    // For now we will return an error explaining limitation or just implement generation.
    // Let's implement generation instead of edit for OpenAI for simplicity 

    const ai = getAiClient();
    if (!ai) throw new Error("API Key ausente");

    try {
        const response = await ai.images.generate({
            model: "dall-e-3",
            prompt: `Uma foto de perfil artística: ${prompt}`,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json"
        });

        const b64 = response.data?.[0]?.b64_json;
        if (b64) return `data:image/png;base64,${b64}`;
        throw new Error("Falha ao gerar imagem");
    } catch (err) {
        console.error("OpenAI Image Error", err);
        throw err;
    }
};

export const generateSmartNotificationOpenAi = async (userName: string, pendingHabits: Habit[]): Promise<string> => {
    const ai = getAiClient();
    if (!ai || pendingHabits.length === 0) return "";

    try {
        const timeOfDay = new Date().getHours() < 12 ? "manhã" : new Date().getHours() < 18 ? "tarde" : "noite";
        const prompt = `
      Você é o "Smart Notification System".
      Hora: ${timeOfDay}.
      Usuário: ${userName}.
      Hábitos pendentes: ${pendingHabits.map(h => h.name).join(', ')}.

      Tarefa: Notificação push curta (max 15 palavras). Motivadora.
      Responda APENAS o texto.
    `;

        const response = await ai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 50
        });

        return response.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
        return "";
    }
};
