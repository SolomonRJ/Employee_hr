import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin.includes('maps.googleapis.com'),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'maps-cache',
              },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 3,
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          suppressWarnings: true,
          navigateFallback: 'index.html',
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', '@tanstack/react-query', 'framer-motion'],
            charts: ['recharts'],
          },
        },
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
