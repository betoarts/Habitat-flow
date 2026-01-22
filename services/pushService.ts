/**
 * Serviço para envio de notificações push do frontend para o backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type NotificationType = 'ACHIEVEMENT' | 'REMINDER' | 'COACH_TIP';

interface PushPayload {
    title: string;
    body: string;
    type: NotificationType;
    url?: string;
}

export const sendPushNotification = async ({ title, body, type, url }: PushPayload) => {
    try {
        // Escolher ícone baseado no tipo (usando emojis ou path se tivesse assets específicos)
        // O backend usa o icon padrão se não enviado, mas podemos customizar aqui se tivermos assets
        let icon = '/pwa-192x192.png';

        // Tentar enviar para o backend
        const response = await fetch(`${API_BASE_URL}/api/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                body,
                icon,
                tag: type.toLowerCase(), // Agrupar notificações do mesmo tipo
                url: url || '/',
                badge: '/badge.png'
            })
        });

        if (!response.ok) {
            console.warn('Falha ao enviar push notification:', await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro ao chamar serviço de push:', error);
        return false;
    }
};
