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
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
    base: '/',
    plugins: [
      react({
        // Babel yapılandırmasını kaldırdık çünkü babel-plugin-transform-remove-console paketi eksik
        // Sadece terser kullanarak console.log'ları kaldıracağız
      }),
      copyAssetsPlugin()
    ],
    server: {
      port: 3000,
      host: true,
      open: true,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Production modunda source map'leri etkinleştiriyoruz
      // Bu, tarayıcı devtools'ta hata ayıklama yapılmasını kolaylaştırır
      // source map'ler, minifiye edilmiş kodları orijinal kodla eşleştirir
      sourcemap: isProd ? true : false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd ? true : false,
          drop_debugger: isProd ? true : false,
          pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug'] : [],
        },
        format: {
          comments: false,
        }
      },
      rollupOptions: {
        output: {
          // Daha iyi kod bölme için geliştirilmiş chunk stratejisi
          manualChunks: (id) => {
            // Temel node_modules için
            if (id.includes('node_modules')) {
              // React ve React DOM tek bir parçada olsun
              if (id.includes('react/') || id.includes('react-dom/')) {
                return 'vendor-react';
              }
              // Router ayrı bir parçada olsun
              if (id.includes('react-router-dom/')) {
                return 'vendor-router';
              }
              // UI kütüphaneleri kendi parçalarında olsun
              if (
                id.includes('framer-motion') || 
                id.includes('@headlessui') || 
                id.includes('@mantine') ||
                id.includes('@emotion')
              ) {
                return 'vendor-ui';
              }
              // Editör bileşenlerini ayrı bir parçaya koy
              if (
                id.includes('@tiptap/') || 
                id.includes('prosemirror-') ||
                id.includes('tinymce') ||
                id.includes('ckeditor')
              ) {
                return 'vendor-editor';
              }
              // Grafik ve görselleştirme
              if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
                return 'vendor-charts';
              }
              // Yardımcı kütüphaneler
              if (
                id.includes('date-fns') || 
                id.includes('dayjs') || 
                id.includes('crypto-js') ||
                id.includes('axios')
              ) {
                return 'vendor-utils';
              }
              // Diğer tüm node_modules
              return 'vendor-others';
            }
            
            // Özel kodumuz için kategori bazlı bölme
            if (id.includes('/src/components/')) {
              return 'components';
            }
            if (id.includes('/src/pages/')) {
              return 'pages';
            }
            if (id.includes('/src/lib/') || id.includes('/src/utils/')) {
              return 'lib';
            }
          },
          // Daha küçük JS dosyaları için modern çıktı formatı ayarları
          entryFileNames: 'assets/[name]-[hash:8].js',
          chunkFileNames: 'assets/[name]-[hash:8].js',
          assetFileNames: 'assets/[name]-[hash:8].[ext]'
        },
        // Daha iyi kod bölme için harici modülleri belirt
        external: [],
      },
      chunkSizeWarningLimit: 2500,
      // Ağ trafiğini azaltmak için agresif optimizasyonlar
      target: 'es2015',
      modulePreload: true,
      reportCompressedSize: false, // Derleme süresini hızlandırmak için
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      esbuildOptions: {
        target: 'es2020',
      }
    },
    // Code splitting ve lazy loading için ek ayarlar
    esbuild: {
      target: 'es2020',
      legalComments: 'none', // Lisans yorumlarını çıktıdan kaldır
    }
  };
});
