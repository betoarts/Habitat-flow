import { Habit, User, HabitCategory } from "../types";
import * as Gemini from "./geminiService";
import * as OpenAI from "./openaiService";

// Provider Types
export type AiProvider = 'GEMINI' | 'OPENAI';
const PROVIDER_STORAGE_KEY = 'habitflow_ai_provider';

// Provider Management
export const getAiProvider = (): AiProvider => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(PROVIDER_STORAGE_KEY);
        if (saved === 'OPENAI') return 'OPENAI';
    }
    return 'GEMINI'; // Default
};

export const setAiProvider = (provider: AiProvider) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
    }
};

// API Key Management (Delegates to specific service)
export const hasApiKey = (): boolean => {
    const provider = getAiProvider();
    return provider === 'GEMINI' ? Gemini.hasApiKey() : OpenAI.hasOpenAiKey();
};

// Unified AI Methods
export const getBehavioralAnalysis = async (habits: Habit[], user: User): Promise<string> => {
    const provider = getAiProvider();
    return provider === 'GEMINI'
        ? Gemini.getBehavioralAnalysis(habits, user)
        : OpenAI.getBehavioralAnalysisOpenAi(habits, user);
};

export const chatWithAssistant = async (message: string, history: string, user: User, habits: Habit[]): Promise<any> => {
    const provider = getAiProvider();
    return provider === 'GEMINI'
        ? Gemini.chatWithAssistant(message, history, user, habits)
        : OpenAI.chatWithAssistantOpenAi(message, history, user, habits);
};

export const generateOnboardingInsight = async (userName: string, goals: HabitCategory[]): Promise<any> => {
    const provider = getAiProvider();
    return provider === 'GEMINI'
        ? Gemini.generateOnboardingInsight(userName, goals)
        : OpenAI.generateOnboardingInsightOpenAi(userName, goals);
};

export const editUserProfileImage = async (base64Image: string, prompt: string): Promise<string> => {
    const provider = getAiProvider();
    return provider === 'GEMINI'
        ? Gemini.editUserProfileImage(base64Image, prompt)
        : OpenAI.editUserProfileImageOpenAi(base64Image, prompt);
};

export const generateSmartNotification = async (userName: string, pendingHabits: Habit[]): Promise<string> => {
    const provider = getAiProvider();
    return provider === 'GEMINI'
        ? Gemini.generateSmartNotification(userName, pendingHabits)
        : OpenAI.generateSmartNotificationOpenAi(userName, pendingHabits);
};
