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
        // SPA redirects dosyasını kopyala
        if (fs.existsSync('public/_redirects')) {
          fs.copyFileSync('public/_redirects', 'build/_redirects');
          console.log('_redirects dosyası build klasörüne kopyalandı');
        } else {
          console.warn('public/_redirects dosyası bulunamadı');
          // Eğer dosya yoksa, oluştur
          const redirectContent = '/* /index.html 200';
          fs.writeFileSync('build/_redirects', redirectContent);
          console.log('_redirects dosyası oluşturuldu ve build klasörüne yazıldı');
        }

        // robots.txt ve diğer SEO dosyalarını kopyala
        if (fs.existsSync('public/robots.txt')) {
          fs.copyFileSync('public/robots.txt', 'build/robots.txt');
          console.log('robots.txt dosyası build klasörüne kopyalandı');
        }
        
        if (fs.existsSync('public/sitemap.xml')) {
          fs.copyFileSync('public/sitemap.xml', 'build/sitemap.xml');
          console.log('sitemap.xml dosyası build klasörüne kopyalandı');
        }
        
        if (fs.existsSync('public/sitemap.xsl')) {
          fs.copyFileSync('public/sitemap.xsl', 'build/sitemap.xsl');
          console.log('sitemap.xsl dosyası build klasörüne kopyalandı');
        }

        // assets klasörünü kopyala (varsa)
        if (fs.existsSync('public/assets')) {
          copyRecursiveSync('public/assets', 'build/assets');
          console.log('assets klasörü build klasörüne kopyalandı');
        }

        // assets/pages klasörünü oluştur (varsa)
        if (!fs.existsSync('build/assets/pages')) {
          fs.mkdirSync('build/assets/pages', { recursive: true });
          console.log('build/assets/pages klasörü oluşturuldu');
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

// WebP optimizasyon plugin'i
const webpOptimizePlugin = () => {
  return {
    name: 'webp-optimize-plugin',
    writeBundle: async () => {
      try {
        console.log('WebP dönüşümü başlatılıyor...');
        
        // sharp paketini kullanarak PNG ve JPG dosyalarını WebP'ye dönüştür
        const { default: sharp } = await import('sharp');
        
        const assetsDir = 'public/assets';
        if (fs.existsSync(assetsDir)) {
          // PNG dosyalarını WebP'ye dönüştür
          const processImagesInDir = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
              const fullPath = resolve(dir, entry.name);
              
              if (entry.isDirectory()) {
                processImagesInDir(fullPath);
              } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
                // WebP dosyasının yolunu oluştur
                const webpPath = fullPath.replace(/\.(png|jpe?g)$/i, '.webp');
                
                // Eğer dosya zaten varsa işleme gerek yok
                if (!fs.existsSync(webpPath)) {
                  console.log(`Dönüştürülüyor: ${fullPath} -> ${webpPath}`);
                  sharp(fullPath)
                    .webp({ quality: 80 })
                    .toFile(webpPath)
                    .catch(err => console.error(`${entry.name} dönüştürülürken hata:`, err));
                }
              }
            }
          };
          
          processImagesInDir(assetsDir);
          console.log('WebP dönüşümü tamamlandı');
        } else {
          console.warn('Assets dizini bulunamadı');
        }
      } catch (error) {
        console.error('WebP dönüşüm hatası:', error);
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    copyAssetsPlugin(),
    webpOptimizePlugin()
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
