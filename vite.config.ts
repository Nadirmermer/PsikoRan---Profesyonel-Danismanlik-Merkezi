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
      // public klasöründen build klasörüne dosyaları kopyala
      try {
        // assets klasörünü kopyala (varsa)
        if (fs.existsSync('public/assets')) {
          copyRecursiveSync('public/assets', 'build/assets');
          console.log('assets klasörü build klasörüne kopyalandı');
        }

        // SEO dosyalarını kopyala
        if (fs.existsSync('public/assets/meta/seo/robots.txt')) {
          fs.copyFileSync('public/assets/meta/seo/robots.txt', 'build/robots.txt');
          console.log('robots.txt dosyası ana dizine kopyalandı');
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
    copyAssetsPlugin()
  ],
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false,
      }
    },
    rollupOptions: {
      output: {
        // Basit chunk stratejisi
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['framer-motion', '@headlessui/react', '@mantine/core', '@mantine/hooks'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-color', '@tiptap/extension-text-style'],
          'utils': ['date-fns', 'dayjs', 'crypto-js']
        },
        entryFileNames: 'assets/[name]-[hash:8].js',
        chunkFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]'
      }
    },
    chunkSizeWarningLimit: 2500
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  }
});
