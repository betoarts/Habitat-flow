import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente baseado no `mode`
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        // Usar strategy injectManifest para Service Worker customizado
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        injectRegister: 'auto',

        // Configuração do manifest
        manifest: {
          name: 'HabitFlow',
          short_name: 'HabitFlow',
          description: 'Seu rastreador de hábitos inteligente e gamificado.',
          theme_color: '#3B82F6',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },

        // Assets para incluir no precache
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'badge.png'],

        // Configuração do injectManifest
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
        },

        // Dev options para testar durante desenvolvimento
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    define: {
      // Polyfill process.env.API_KEY para o SDK Gemini
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY || '')
    },
    server: {
      host: true,
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    base: '/'
  };
});