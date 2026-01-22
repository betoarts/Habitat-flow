/// <reference types="vite/client" />

// Estender interface ImportMetaEnv para incluir variáveis de ambiente do Vite
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_VAPID_PUBLIC_KEY: string;
    readonly API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Estender NotificationOptions para incluir vibrate (experimental mas suportado)
interface NotificationOptions {
    vibrate?: number[] | number;
}
