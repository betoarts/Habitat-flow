import React from 'react';
import { Bell, BellOff, Loader2, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

/**
 * Componente para ativar/desativar notificações push
 * Inclui detecção de iOS e instruções específicas para cada plataforma
 * 
 * @example
 * ```tsx
 * // Na página de configurações
 * import { PushNotificationButton } from '../components/PushNotificationButton';
 * 
 * export const Settings = () => (
 *   <div>
 *     <h2>Notificações</h2>
 *     <PushNotificationButton />
 *   </div>
 * );
 * ```
 */
export const PushNotificationButton: React.FC = () => {
    const {
        isSupported,
        permission,
        subscription,
        isLoading,
        error,
        isIOS,
        isStandalone,
        subscribe,
        unsubscribe,
        sendTestNotification
    } = usePushNotifications();

    // ============================================================================
    // CASO 1: Navegador não suporta push notifications
    // ============================================================================
    if (!isSupported) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                        <p className="text-yellow-800 font-medium">Não Suportado</p>
                        <p className="text-yellow-700 text-sm">
                            Seu navegador não suporta notificações push. Tente usar Chrome, Edge, Firefox ou Safari.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // CASO 2: iOS não instalado na tela inicial
    // No iOS, push notifications SÓ funcionam se o PWA foi instalado
    // ============================================================================
    if (isIOS && !isStandalone) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                <div className="flex items-start gap-3">
                    <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-blue-800 font-medium mb-2">
                            📱 Adicione à Tela Inicial
                        </p>
                        <p className="text-blue-700 text-sm mb-3">
                            No iPhone/iPad, para receber notificações push, você precisa adicionar
                            o app à tela inicial primeiro:
                        </p>
                        <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1.5">
                            <li>
                                Toque no ícone de <strong>Compartilhar</strong>{' '}
                                <span className="text-xs">(quadrado com seta para cima)</span>
                            </li>
                            <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                            <li>Confirme tocando em <strong>"Adicionar"</strong></li>
                            <li>Abra o app a partir do ícone na tela inicial</li>
                            <li>Volte aqui e ative as notificações</li>
                        </ol>
                        <div className="mt-3 p-2 bg-blue-100 rounded text-blue-800 text-xs">
                            💡 <strong>Dica:</strong> Após adicionar à tela inicial, feche o Safari e abra
                            o app pelo novo ícone para que as notificações funcionem.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // CASO 3: Permissão foi negada/bloqueada
    // ============================================================================
    if (permission === 'denied') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                <div className="flex items-center gap-3">
                    <BellOff className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                        <p className="text-red-800 font-medium">Notificações Bloqueadas</p>
                        <p className="text-red-700 text-sm mt-1">
                            Você bloqueou as notificações para este site. Para ativar:
                        </p>
                        <ul className="text-red-700 text-sm mt-2 list-disc list-inside space-y-1">
                            <li>Acesse as configurações do navegador</li>
                            <li>Encontre as permissões de notificação</li>
                            <li>Permita notificações para este site</li>
                            <li>Recarregue a página</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // CASO 4: Já está inscrito - mostrar status e opções
    // ============================================================================
    if (subscription) {
        return (
            <div className="space-y-3 max-w-md">
                {/* Status de sucesso */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="text-green-800 font-medium">Notificações Ativadas ✓</p>
                            <p className="text-green-700 text-sm">
                                Você receberá lembretes e atualizações do HabitFlow diretamente no seu dispositivo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-3">
                    {/* Botão de teste */}
                    <button
                        onClick={sendTestNotification}
                        className="flex-1 flex items-center justify-center gap-2 
                       bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                       text-white font-medium py-2.5 px-4 rounded-lg shadow-sm 
                       transition-colors duration-200"
                    >
                        <Bell className="w-4 h-4" />
                        Testar
                    </button>

                    {/* Botão de desativar */}
                    <button
                        onClick={unsubscribe}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 
                       bg-gray-200 hover:bg-gray-300 active:bg-gray-400
                       text-gray-700 font-medium py-2.5 px-4 rounded-lg 
                       transition-colors duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <BellOff className="w-4 h-4" />
                        )}
                        Desativar
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================================
    // CASO 5: Não inscrito - mostrar botão para ativar
    // ============================================================================
    return (
        <div className="space-y-3 max-w-md">
            {/* Mensagem de erro, se houver */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </p>
                </div>
            )}

            {/* Botão principal para ativar notificações */}
            <button
                onClick={subscribe}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 
                   bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                   text-white font-medium py-3 px-6 rounded-lg shadow-md
                   transition-all duration-200 
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Ativando...
                    </>
                ) : (
                    <>
                        <Bell className="w-5 h-5" />
                        Ativar Notificações
                    </>
                )}
            </button>

            {/* Descrição */}
            <p className="text-gray-500 text-sm text-center">
                Receba lembretes para manter seus hábitos e atualizações importantes
                diretamente no seu dispositivo.
            </p>
        </div>
    );
};

export default PushNotificationButton;
