import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';

const manifestForPlugin: Partial<VitePWAOptions> = {
  registerType: 'prompt',
  includeAssets: [
    'favicon.ico', 
    'assets/pwa/*.png', 
    'assets/favicons/*.png'
  ],
  manifest: {
    name: 'PsikoRan - Profesyonel Danışmanlık Merkezi',
    short_name: 'PsikoRan',
    description: 'Psikologlar ve danışanlar için profesyonel danışmanlık yönetim sistemi. Randevularınızı kolayca yönetin, dosyalarınızı organize edin.',
    icons: [
      {
        src: 'assets/pwa/logo_2-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'assets/pwa/logo_2-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'assets/pwa/logo_2-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'assets/pwa/logo_2-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon'
      },
      {
        src: 'assets/favicons/favicon-16x16.png',
        type: 'image/png',
        sizes: '16x16'
      },
      {
        src: 'assets/favicons/favicon-32x32.png',
        type: 'image/png',
        sizes: '32x32'
      }
    ],
    theme_color: '#4f46e5',
    background_color: '#ffffff',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    orientation: 'any',
    categories: ['health', 'productivity', 'medical'],
    shortcuts: [
      {
        name: 'Randevular',
        short_name: 'Randevular',
        url: '/appointments',
        description: 'Randevularınızı görüntüleyin ve yönetin',
        icons: [
          {
            src: 'assets/pwa/appointment-icon-96x96.png',
            sizes: '96x96'
          }
        ]
      },
      {
        name: 'Danışanlar',
        short_name: 'Danışanlar',
        url: '/clients',
        description: 'Danışanlarınızı görüntüleyin',
        icons: [
          {
            src: 'assets/pwa/client-icon-96x96.png',
            sizes: '96x96'
          }
        ]
      }
    ],
    lang: 'tr',
    related_applications: []
  },
  devOptions: {
    enabled: true,
    type: 'module',
    navigateFallback: 'index.html',
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    navigateFallbackDenylist: [
      /\.(?:license|json)$/,
      /^manifest.*\.js?$/,
      /^workbox-.*\.js?$/,
      /^sw\.js?$/
    ],
    runtimeCaching: [
      {
        urlPattern: ({ url }) => {
          return url.pathname.startsWith('/api');
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 // 1 gün
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: ({ url }) => {
          return url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif)$/);
        },
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'assets-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 gün
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: ({ url }) => {
          return url.href.includes('images.unsplash.com');
        },
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'unsplash-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7 // 7 gün
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: ({ url }) => {
          return url.href.includes('fonts.googleapis.com') || 
                url.href.includes('fonts.gstatic.com');
        },
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 yıl
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 // 1 gün
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA(manifestForPlugin)
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: '/index.html'
      }
    }
  }
});
