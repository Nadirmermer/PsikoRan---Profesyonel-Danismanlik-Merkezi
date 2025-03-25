import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// Derleme zamanında sürüm numarası oluşturma
const getBuildVersion = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }
};

// Derleme sonrası dosyaları kopyalama işlemi için plugin
const copyAssetsPlugin = () => {
  return {
    name: 'copy-assets-plugin',
    closeBundle: () => {
      // public klasöründen dist klasörüne dosyaları kopyala
      try {
        // clear-cache.js dosyasını kopyala
        if (fs.existsSync('public/clear-cache.js')) {
          fs.copyFileSync('public/clear-cache.js', 'dist/clear-cache.js');
          console.log('clear-cache.js dosyası dist klasörüne kopyalandı');
        }

        // assets klasörünü kopyala (varsa)
        if (fs.existsSync('public/assets')) {
          copyRecursiveSync('public/assets', 'dist/assets');
          console.log('assets klasörü dist klasörüne kopyalandı');
        }

        // SEO dosyalarını kopyala
        if (fs.existsSync('public/assets/meta/seo/robots.txt')) {
          fs.copyFileSync('public/assets/meta/seo/robots.txt', 'dist/robots.txt');
          console.log('robots.txt dosyası ana dizine kopyalandı');
        }

        if (fs.existsSync('public/assets/meta/seo/sitemap.xml')) {
          fs.copyFileSync('public/assets/meta/seo/sitemap.xml', 'dist/sitemap.xml');
          console.log('sitemap.xml dosyası ana dizine kopyalandı');
        }
      } catch (error) {
        console.error('Dosya kopyalama hatası:', error);
      }
    }
  };
};

// Klasörleri ve alt klasörleri kopyalama fonksiyonu
function copyRecursiveSync(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'PsikoRan - Profesyonel Danışmanlık Merkezi',
        short_name: 'PsikoRan',
        description: 'Psikologlar ve danışanlar için profesyonel danışmanlık yönetim sistemi.',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'assets/pwa/logo_2-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/pwa/logo_2-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'assets/pwa/logo_2-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'assets/pwa/logo_2-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        start_url: '.',
        orientation: 'portrait',
        categories: ['business', 'health', 'productivity'],
        screenshots: [
          {
            src: 'assets/screenshots/1.jpg',
            sizes: '1080x1920',
            type: 'image/jpeg'
          },
          {
            src: 'assets/screenshots/2.jpg',
            sizes: '1080x1920',
            type: 'image/jpeg'
          }
        ]
      },
      workbox: {
        // PWA önbelleğe alma limiti - varsayılan 2 MiB yerine 3 MiB olarak ayarla
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
        // Çakışan önbellek girişlerini önlemek için
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,ttf,woff,woff2}'],
        // WB_REVISION parametrelerini temizle ve çakışan girişleri önle
        dontCacheBustURLsMatching: /\.\w{8}\./,
        // Her asset'i bir kez ekle, revizyon isimleri olmayanları kullan
        runtimeCaching: [
          // Favicon gibi sık değişen dosyalar için özel önbellek stratejisi
          {
            urlPattern: /\.(ico|png|svg|jpg|jpeg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50, 
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 gün
              }
            }
          },
          // API çağrıları için ayrı önbellek stratejisi
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60 // 1 gün
              }
            }
          }
        ],
        // Çakışan önbellek girişlerini önlemek için ek ayarlar
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Sadece HTML sayfalarını önceden önbelleğe alma
        navigationPreload: true
      }
    }),
    copyAssetsPlugin() // Dosya kopyalama eklentisini ekle
  ],
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // JavaScript dosyalarının optimizasyonu için ek ayarlar
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // console.log ifadelerini kaldır
        drop_debugger: true, // debugger ifadelerini kaldır
      },
      format: {
        comments: false,     // yorum satırlarını kaldır
      },
    },
    rollupOptions: {
      output: {
        // Daha iyi chunk stratejisi uygula
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['framer-motion', '@headlessui/react', '@mantine/core', '@mantine/hooks'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-color', '@tiptap/extension-text-style'],
          'form': ['react-hook-form'],
          'utils': ['date-fns', 'dayjs', 'crypto-js']
        },
        // Dosya adları için hash uzunluğunu azalt
        entryFileNames: 'assets/[name]-[hash:8].js',
        chunkFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]'
      }
    },
    chunkSizeWarningLimit: 2500 // Chunk boyutu uyarı limitini 2.5 MB'a artır
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  }
});
