/// <reference types="vite/client" />
import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TIPOS
// ============================================================================

export interface PushNotificationState {
    /** Se o navegador suporta push notifications */
    isSupported: boolean;
    /** Permissão atual: 'granted', 'denied', 'default', ou null se não suportado */
    permission: NotificationPermission | null;
    /** Subscription ativa, ou null se não inscrito */
    subscription: PushSubscription | null;
    /** Se está processando uma operação */
    isLoading: boolean;
    /** Mensagem de erro, se houver */
    error: string | null;
    /** Se é dispositivo iOS (iPhone/iPad) */
    isIOS: boolean;
    /** Se o PWA está instalado (modo standalone) */
    isStandalone: boolean;
}

// ============================================================================
// CONSTANTES E UTILITÁRIOS DE LOCALSTORAGE
// ============================================================================

const STORAGE_KEY = 'habitflow_push_subscription';

/**
 * Salvar subscription no localStorage
 */
function saveSubscriptionToStorage(subscription: PushSubscription | null): void {
    try {
        if (subscription) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription.toJSON()));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch (e) {
        console.warn('[Push] Erro ao salvar subscription no localStorage:', e);
    }
}

/**
 * Recuperar subscription do localStorage
 */
function loadSubscriptionFromStorage(): PushSubscription | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            // localStorage retorna um objeto JSON serializado, não é um PushSubscription real
            // Vamos usar apenas como referência para validar
            return JSON.parse(stored) as PushSubscription;
        }
    } catch (e) {
        console.warn('[Push] Erro ao carregar subscription do localStorage:', e);
    }
    return null;
}

export interface PushNotificationActions {
    /** Solicitar permissão para notificações */
    requestPermission: () => Promise<NotificationPermission>;
    /** Criar subscription e enviar ao backend */
    subscribe: () => Promise<PushSubscription | null>;
    /** Cancelar subscription */
    unsubscribe: () => Promise<boolean>;
    /** Enviar notificação de teste local */
    sendTestNotification: () => void;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

// URL base da API (ajustar conforme ambiente)
// Usamos caminhos relativos por padrão para melhor portabilidade (ex: /api/subscribe)
const API_BASE_URL = (import.meta.env.VITE_API_URL || '')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');

// Chave pública VAPID (definir no .env ou hardcoded aqui)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BPS_9DN-ZfVBJPB8uoljutp7VKFLCsM9gbPJRy08UTuO9jjgiNm5wICNB6FoW8y4W4NEyCHCk2ejFIzdSHXyoO4';

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Converte string Base64 URL-safe para Uint8Array
 * Necessário para o applicationServerKey do PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

/**
 * Detecta se é dispositivo iOS (iPhone/iPad)
 */
function isIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detecta se o app está em modo standalone (instalado na tela inicial)
 */
function isStandaloneMode(): boolean {
    // iOS Safari - propriedade específica
    if ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone) {
        return true;
    }
    // Android Chrome e outros - media query
    return window.matchMedia('(display-mode: standalone)').matches;
}

// ============================================================================
// HOOK: usePushNotifications
// ============================================================================

/**
 * Hook para gerenciar notificações push no PWA
 * 
 * @example
 * ```tsx
 * const { isSupported, permission, subscribe, sendTestNotification } = usePushNotifications();
 * 
 * if (!isSupported) return <p>Notificações não suportadas</p>;
 * 
 * return (
 *   <button onClick={subscribe}>Ativar Notificações</button>
 * );
 * ```
 */
export function usePushNotifications(): PushNotificationState & PushNotificationActions {
    const [state, setState] = useState<PushNotificationState>({
        isSupported: false,
        permission: null,
        subscription: null,
        isLoading: false,
        error: null,
        isIOS: false,
        isStandalone: false
    });

    // ============================================================================
    // Verificar suporte e estado inicial ao montar
    // ============================================================================
    useEffect(() => {
        const checkSupport = async () => {
            const isIOS = isIOSDevice();
            const isStandalone = isStandaloneMode();

            // Verificar se todas as APIs necessárias existem
            const isSupported =
                'serviceWorker' in navigator &&
                'PushManager' in window &&
                'Notification' in window;

            // Obter permissão atual se suportado
            const permission = isSupported ? Notification.permission : null;

            // Tentar obter subscription existente
            let currentSubscription: PushSubscription | null = null;

            if (isSupported) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    currentSubscription = await registration.pushManager.getSubscription();
                    
                    // Log para debug
                    if (currentSubscription) {
                        console.log('[Push] Subscription recuperada do Service Worker:', currentSubscription.endpoint);
                        // Salvar no localStorage também
                        saveSubscriptionToStorage(currentSubscription);
                    } else {
                        console.log('[Push] Nenhuma subscription ativa encontrada no Service Worker');
                        // Tentar carregar do localStorage como fallback
                        const storedSubscription = loadSubscriptionFromStorage();
                        if (storedSubscription) {
                            console.log('[Push] Subscription recuperada do localStorage:', storedSubscription.endpoint);
                            currentSubscription = storedSubscription;
                        }
                    }
                } catch (e) {
                    console.error('[Push] Erro ao obter subscription:', e);
                    // Tentar localStorage como último recurso
                    const storedSubscription = loadSubscriptionFromStorage();
                    if (storedSubscription) {
                        console.log('[Push] Subscription recuperada do localStorage (fallback)');
                        currentSubscription = storedSubscription;
                    }
                }
            }

            setState(prev => ({
                ...prev,
                isSupported,
                permission,
                subscription: currentSubscription,
                isIOS,
                isStandalone
            }));
        };

        checkSupport();
    }, []);

    // ============================================================================
    // Sincronizar estado da subscription periodicamente
    // Garante que o estado permaneça correto mesmo se o Service Worker reiniciar
    // ============================================================================
    useEffect(() => {
        if (!state.isSupported) return;

        // Verificar subscription a cada 30 segundos
        const syncInterval = setInterval(async () => {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();

                setState(prev => {
                    // Só atualizar se houve mudança
                    if ((prev.subscription === null && subscription === null) ||
                        (prev.subscription && subscription && prev.subscription.endpoint === subscription.endpoint)) {
                        return prev; // Sem mudanças, não atualizar
                    }

                    if (subscription) {
                        console.log('[Push] Subscription sincronizada:', subscription.endpoint);
                    }

                    return {
                        ...prev,
                        subscription
                    };
                });
            } catch (e) {
                console.warn('[Push] Erro ao sincronizar subscription:', e);
            }
        }, 30000); // 30 segundos

        return () => clearInterval(syncInterval);
    }, [state.isSupported]);

    // ============================================================================
    // Solicitar permissão para notificações
    // ============================================================================
    const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
        if (!state.isSupported) {
            throw new Error('Push notifications não são suportadas neste navegador');
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const permission = await Notification.requestPermission();

            setState(prev => ({
                ...prev,
                permission,
                isLoading: false,
                error: permission === 'denied'
                    ? 'Permissão negada. Você pode habilitar nas configurações do navegador.'
                    : null
            }));

            return permission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao solicitar permissão';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            throw error;
        }
    }, [state.isSupported]);

    // ============================================================================
    // Criar subscription e enviar ao backend
    // ============================================================================
    const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
        if (!state.isSupported) {
            throw new Error('Push notifications não são suportadas neste navegador');
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // 1. Obter VAPID Public Key (ambiente, hardcoded ou backend)
            let vapidKey = VAPID_PUBLIC_KEY;

            if (!vapidKey) {
                try {
                    const keyResponse = await fetch(`${API_BASE_URL}/api/vapid-public-key`);
                    if (keyResponse.ok) {
                        const data = await keyResponse.json();
                        vapidKey = data.publicKey;
                    }
                } catch (err) {
                    console.error('Erro ao buscar chave VAPID:', err);
                }
            }

            if (!vapidKey) {
                const error = 'Chave VAPID não encontrada no ambiente nem na API.';
                setState(prev => ({ ...prev, isLoading: false, error }));
                throw new Error(error);
            }

            // 2. Garantir que temos permissão
            let permission = state.permission;
            if (permission !== 'granted') {
                permission = await requestPermission();
                if (permission !== 'granted') {
                    setState(prev => ({ ...prev, isLoading: false }));
                    return null;
                }
            }

            // 3. Obter registro do Service Worker (aguarda estar pronto)
            const registration = await navigator.serviceWorker.ready;

            // 4. Verificar se já existe uma subscription ativa
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Criar nova subscription com a chave VAPID
                const applicationServerKey = urlBase64ToUint8Array(vapidKey);

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true, // Obrigatório: garante que notificações serão visíveis
                    applicationServerKey: applicationServerKey as any // Cast para evitar incompatibilidade de tipos de buffer
                });

                console.log('[Push] Nova subscription criada');
                console.log('[Push] Endpoint:', subscription.endpoint);
            }

            // 5. Enviar subscription para o backend armazenar
            const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription.toJSON())
            });

            if (!response.ok) {
                throw new Error('Falha ao registrar subscription no servidor');
            }

            console.log('[Push] Subscription enviada ao backend com sucesso');

            // Salvar subscription no localStorage
            saveSubscriptionToStorage(subscription);

            setState(prev => ({
                ...prev,
                subscription,
                isLoading: false,
                error: null
            }));

            return subscription;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao criar subscription';
            console.error('[Push] Erro:', error);
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            throw error;
        }
    }, [state.isSupported, state.permission, requestPermission]);

    // ============================================================================
    // Cancelar subscription
    // ============================================================================
    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (!state.subscription) {
            return true; // Já não está inscrito
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Cancelar subscription no navegador
            await state.subscription.unsubscribe();

            // Notificar o backend (opcional mas recomendado)
            try {
                await fetch(`${API_BASE_URL}/api/unsubscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        endpoint: state.subscription.endpoint
                    })
                });
            } catch (e) {
                // Log mas não falha - backend pode limpar subscriptions expiradas depois
                console.warn('[Push] Erro ao notificar backend sobre unsubscribe:', e);
            }

            console.log('[Push] Subscription cancelada com sucesso');

            // Remover do localStorage
            saveSubscriptionToStorage(null);

            setState(prev => ({
                ...prev,
                subscription: null,
                isLoading: false
            }));

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar subscription';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return false;
        }
    }, [state.subscription]);

    // ============================================================================
    // Enviar notificação de teste local (não passa pelo backend)
    // ============================================================================
    const sendTestNotification = useCallback(() => {
        if (!state.isSupported) {
            alert('Push notifications não são suportadas neste navegador');
            return;
        }

        if (state.permission !== 'granted') {
            alert('Permissão para notificações não foi concedida');
            return;
        }

        // Criar notificação local para teste imediato
        new Notification('🎉 Teste de Notificação', {
            body: 'Parabéns! As notificações estão funcionando corretamente no HabitFlow!',
            icon: '/pwa-192x192.png',
            badge: '/badge.png',
            tag: 'test-notification',
            vibrate: [200, 100, 200]
        } as any);
    }, [state.isSupported, state.permission]);

    // Retornar estado e ações
    return {
        ...state,
        requestPermission,
        subscribe,
        unsubscribe,
        sendTestNotification
    };
}

export default usePushNotifications;
