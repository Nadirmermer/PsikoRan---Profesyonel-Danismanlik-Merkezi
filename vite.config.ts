import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo_2.png'],
      manifest: {
        name: 'PsikoRan - Profesyonel Danışmanlık Merkezi',
        short_name: 'PsikoRan',
        description: 'Ruh sağlığı uzmanları için randevu ve danışan yönetim sistemi',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo_2.png',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/png'
          },
          {
            src: 'logo_2.png',
            type: 'image/png',
            sizes: '192x192'
          },
          {
            src: 'logo_2.png',
            type: 'image/png',
            sizes: '512x512'
          },
          {
            src: 'logo_2.png',
            type: 'image/png',
            sizes: '1024x1024',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/hjfmevurucynhmdbxacd\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(js|css|png|jpg|jpeg|svg|gif)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
