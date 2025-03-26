import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
