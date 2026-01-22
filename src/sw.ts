/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

// Declarar tipo do Service Worker corretamente
declare let self: ServiceWorkerGlobalScope & typeof globalThis;

// Interface para payload da notificação push
interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
    vibrate?: number[];
}

// Precaching automático dos assets gerados pelo Vite
// O __WB_MANIFEST será substituído automaticamente pelo vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Ícones padrão para notificações
const DEFAULT_ICON = '/pwa-192x192.png';
const DEFAULT_BADGE = '/badge.png';

// ============================================================================
// EVENTO: Receber Push Notification
// ============================================================================
self.addEventListener('push', (event: PushEvent) => {
    console.log('[SW] Push notification recebida:', event);

    // Payload padrão caso não venha dados
    let payload: PushNotificationPayload = {
        title: 'HabitFlow',
        body: 'Você tem uma nova notificação!',
        icon: DEFAULT_ICON,
        badge: DEFAULT_BADGE
    };

    // Tentar parsear payload JSON
    if (event.data) {
        try {
            const data = event.data.json();
            payload = {
                title: data.title || payload.title,
                body: data.body || payload.body,
                icon: data.icon || DEFAULT_ICON,
                badge: data.badge || DEFAULT_BADGE,
                url: data.url || '/',
                tag: data.tag,
                vibrate: data.vibrate || [200, 100, 200]
            };
        } catch (e) {
            // Se não for JSON, usar texto plain
            payload.body = event.data.text();
        }
    }

    // Opções completas da notificação
    const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        vibrate: payload.vibrate,
        tag: payload.tag || 'habitflow-notification',
        data: {
            url: payload.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Abrir App'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ],
        // Manter notificação até interação do usuário (Android)
        requireInteraction: true,
    } as any; // Cast para any pois vibrate pode não estar na definição padrão do TS

    // Mostrar a notificação
    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

// ============================================================================
// EVENTO: Clique na Notificação
// ============================================================================
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    console.log('[SW] Notificação clicada:', event.action);

    // Fechar a notificação
    event.notification.close();

    // Se clicou em "close", apenas fechar sem abrir nada
    if (event.action === 'close') {
        return;
    }

    // URL para abrir (padrão: raiz do app)
    const urlToOpen = event.notification.data?.url || '/';

    // Tentar focar janela existente ou abrir nova
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Verificar se já há uma janela do app aberta
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        // Navegar para a URL desejada e focar
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Se não há janela aberta, abrir uma nova
                return self.clients.openWindow(urlToOpen);
            })
    );
});

// ============================================================================
// EVENTO: Notificação Fechada (swipe away no Android)
// ============================================================================
self.addEventListener('notificationclose', (event: NotificationEvent) => {
    console.log('[SW] Notificação fechada pelo usuário:', event.notification.tag);
});

// ============================================================================
// EVENTO: Instalação do Service Worker
// ============================================================================
self.addEventListener('install', () => {
    console.log('[SW] Service Worker instalado com sucesso');
    // Ativar imediatamente sem esperar tabs antigas fecharem
    self.skipWaiting();
});

// ============================================================================
// EVENTO: Ativação do Service Worker
// ============================================================================
self.addEventListener('activate', (event: ExtendableEvent) => {
    console.log('[SW] Service Worker ativado');
    // Assumir controle de todos os clients imediatamente
    event.waitUntil(self.clients.claim());
});
