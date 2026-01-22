/**
 * Servidor de Push Notifications para HabitFlow PWA
 * 
 * Este servidor gerencia as subscriptions de push e envia notificações
 * usando a Web Push API com autenticação VAPID.
 * 
 * Endpoints:
 * - POST /api/subscribe    - Registrar nova subscription
 * - POST /api/unsubscribe  - Remover subscription
 * - POST /api/send         - Enviar notificação para todos
 * - GET  /api/subscriptions - Listar subscriptions (debug)
 * - GET  /api/vapid-public-key - Obter chave pública VAPID
 * - GET  /health           - Health check
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import webpush from 'web-push';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Configurar __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env
config();

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Estrutura de uma subscription de push (formato padrão W3C)
 */
interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    expirationTime?: number | null;
}

/**
 * Payload para enviar notificação
 */
interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    vibrate?: number[];
    tag?: string;
}

/**
 * Resultado do envio de cada notificação
 */
interface SendResult {
    success: boolean;
    endpoint: string;
    error?: string;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Chaves VAPID (obrigatórias)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@habitflow.app';

// URL do cliente para CORS
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - permitir requisições do frontend
app.use(cors({
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'https://habitflow.servicestec.pro'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser JSON
app.use(express.json());

// Logger simples para requisições
app.use((req: Request, _res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// VALIDAR CONFIGURAÇÃO VAPID
// ============================================================================

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('');
    console.error('❌ ERRO: Chaves VAPID não configuradas!');
    console.error('');
    console.error('Execute o seguinte comando para gerar as chaves:');
    console.error('  npm run generate-vapid');
    console.error('');
    console.error('Depois configure no arquivo .env:');
    console.error('  VAPID_PUBLIC_KEY=sua_chave_publica');
    console.error('  VAPID_PRIVATE_KEY=sua_chave_privada');
    console.error('');
    process.exit(1);
}

// Configurar web-push com credenciais VAPID
webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
console.log('✅ VAPID configurado com sucesso');

// ============================================================================
// ARMAZENAMENTO DE SUBSCRIPTIONS (PERSISTENTE)
// ============================================================================

import fs from 'fs';

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'subscriptions.json');

// Garantir que o diretório existe
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Map para cache em memória
let subscriptions: Map<string, PushSubscription> = new Map();

/**
 * Carrega subscriptions do arquivo JSON
 */
function loadSubscriptions() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            const subs = JSON.parse(data) as PushSubscription[];
            subscriptions = new Map(subs.map(s => [s.endpoint, s]));
            console.log(`📂 Carregadas ${subscriptions.size} subscriptions do disco.`);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar subscriptions:', error);
    }
}

/**
 * Salva subscriptions no arquivo JSON
 */
function saveSubscriptions() {
    try {
        const subs = Array.from(subscriptions.values());
        fs.writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2), 'utf-8');
    } catch (error) {
        console.error('❌ Erro ao salvar subscriptions:', error);
    }
}

// Carregar ao iniciar
loadSubscriptions();

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * POST /api/subscribe
 * Registra uma nova subscription de push notification
 */
app.post('/api/subscribe', (req: Request, res: Response): void => {
    const subscription = req.body as PushSubscription;

    // Validar estrutura da subscription
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        res.status(400).json({
            success: false,
            error: 'Subscription inválida. Campos obrigatórios: endpoint, keys.p256dh, keys.auth'
        });
        return;
    }

    // Armazenar usando endpoint como chave única
    subscriptions.set(subscription.endpoint, subscription);

    // Persistir alterações
    saveSubscriptions();

    console.log(`📱 Nova subscription registrada`);
    console.log(`   Total de subscriptions: ${subscriptions.size}`);
    console.log(`   Endpoint: ${subscription.endpoint.substring(0, 60)}...`);

    res.status(201).json({
        success: true,
        message: 'Subscription registrada com sucesso',
        total: subscriptions.size
    });
});

/**
 * POST /api/unsubscribe
 * Remove uma subscription existente
 */
app.post('/api/unsubscribe', (req: Request, res: Response): void => {
    const { endpoint } = req.body;

    if (!endpoint) {
        res.status(400).json({
            success: false,
            error: 'Endpoint não fornecido'
        });
        return;
    }

    const deleted = subscriptions.delete(endpoint);

    // Persistir alterações se houve deleção
    if (deleted) {
        saveSubscriptions();
    }

    console.log(`🗑️ Subscription removida: ${deleted ? 'sim' : 'não encontrada'}`);
    console.log(`   Total restante: ${subscriptions.size}`);

    res.json({
        success: true,
        deleted,
        total: subscriptions.size
    });
});

/**
 * POST /api/send
 * Envia uma notificação push para todas as subscriptions registradas
 */
app.post('/api/send', async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as PushPayload;

    // Validar payload mínimo
    if (!payload?.title || !payload?.body) {
        res.status(400).json({
            success: false,
            error: 'Payload deve conter pelo menos "title" e "body"'
        });
        return;
    }

    // Verificar se há subscriptions
    if (subscriptions.size === 0) {
        res.status(200).json({
            success: true,
            message: 'Nenhuma subscription registrada',
            stats: { total: 0, sent: 0, failed: 0 }
        });
        return;
    }

    // Preparar payload da notificação (JSON string)
    const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/pwa-192x192.png',
        badge: payload.badge || '/badge.png',
        url: payload.url || '/',
        vibrate: payload.vibrate || [200, 100, 200],
        tag: payload.tag || 'habitflow-notification'
    });

    console.log(`📤 Enviando notificação para ${subscriptions.size} dispositivo(s)...`);
    console.log(`   Título: ${payload.title}`);
    console.log(`   Corpo: ${payload.body}`);

    // Enviar para todas as subscriptions em paralelo
    const results = await Promise.allSettled(
        Array.from(subscriptions.entries()).map(async ([endpoint, subscription]): Promise<SendResult> => {
            try {
                await webpush.sendNotification(subscription, notificationPayload);
                return { success: true, endpoint };
            } catch (error: unknown) {
                const err = error as { statusCode?: number; message?: string };

                // Se a subscription expirou ou é inválida (404/410), remover
                if (err.statusCode === 404 || err.statusCode === 410) {
                    subscriptions.delete(endpoint);
                    saveSubscriptions(); // Persistir remoção
                    console.log(`   🗑️ Subscription expirada removida: ${endpoint.substring(0, 50)}...`);
                }

                return {
                    success: false,
                    endpoint,
                    error: err.message || 'Erro desconhecido'
                };
            }
        })
    );

    // Calcular estatísticas
    const sent = results.filter(r =>
        r.status === 'fulfilled' && (r.value as SendResult).success
    ).length;
    const failed = results.length - sent;

    console.log(`   ✅ Enviadas: ${sent}`);
    console.log(`   ❌ Falhas: ${failed}`);

    res.json({
        success: true,
        message: `Notificação enviada para ${sent} de ${results.length} dispositivo(s)`,
        stats: {
            total: subscriptions.size,
            attempted: results.length,
            sent,
            failed
        }
    });
});

/**
 * GET /api/subscriptions
 * Retorna informações sobre subscriptions registradas (para debug)
 */
app.get('/api/subscriptions', (_req: Request, res: Response): void => {
    res.json({
        count: subscriptions.size,
        endpoints: Array.from(subscriptions.keys()).map(e => ({
            endpoint: e.substring(0, 60) + '...',
            // Não expor as chaves por segurança
        }))
    });
});

/**
 * GET /api/vapid-public-key
 * Retorna a chave pública VAPID para uso no cliente
 */
app.get('/api/vapid-public-key', (_req: Request, res: Response): void => {
    res.json({
        publicKey: VAPID_PUBLIC_KEY
    });
});

/**
 * GET /health
 * Endpoint de health check para monitoramento
 */
app.get('/health', (_req: Request, res: Response): void => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        subscriptions: subscriptions.size
    });
});

// ============================================================================
// SERVIR FRONTEND EM PRODUÇÃO (Fallback para SPA)
// ============================================================================

// Servir arquivos estáticos do diretório dist (frontend build)
// Assume que o servidor está rodando em /server/dist/ e o frontend em /dist/
// Ou ajustável via variável de ambiente
const FRONTEND_PATH = process.env.FRONTEND_PATH || path.join(__dirname, '../../dist');

app.use(express.static(FRONTEND_PATH));

/**
 * Handle SPA routing - retornar index.html para qualquer rota não-API
 * Deve ser a última rota antes do listen
 */
app.get('*', (req: Request, res: Response) => {
    // Se for requisição de API que não casou, retorna 404 JSON
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Endpoint da API não encontrado' });
        return;
    }
    // Caso contrário, serve o index.html do React
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ═══════════════════════════════════════════════════════════');
    console.log('   HabitFlow Push Notifications Server');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📍 Servidor rodando em: http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Endpoints disponíveis:');
    console.log('   POST /api/subscribe      → Registrar subscription');
    console.log('   POST /api/unsubscribe    → Remover subscription');
    console.log('   POST /api/send           → Enviar notificação');
    console.log('   GET  /api/subscriptions  → Listar subscriptions');
    console.log('   GET  /api/vapid-public-key → Obter chave VAPID pública');
    console.log('   GET  /health             → Health check');
    console.log('');
    console.log('🧪 Teste de envio via curl:');
    console.log(`   curl -X POST http://localhost:${PORT}/api/send \\`);
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"title":"Teste","body":"Notificação de teste!"}\'');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
});
