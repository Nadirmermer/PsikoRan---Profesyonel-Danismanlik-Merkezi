import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PWAInstallPromptProps {
  /* Bileşen, ayarlardan da açılabilmesi için prop alabilir */
  forcedOpen?: boolean;
  onClose?: () => void;
}

/**
 * PWA Kurulum Hatırlatıcısı
 * 
 * Bu bileşen tarayıcı PWA kurulumu desteklendiğinde ve henüz kurulmadığında
 * kullanıcıya PWA'yı yükleme seçeneği sunar.
 */
export function PWAInstallPrompt({ forcedOpen = false, onClose }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(forcedOpen);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(() => {
    return localStorage.getItem('pwa_install_dismissed') === 'true';
  });

  // PWA kurulum olayını dinle
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Tarayıcının varsayılan PWA yükleme istemini engelle
      e.preventDefault();
      // İstem olayını daha sonra kullanmak üzere sakla
      setDeferredPrompt(e);
      // İstem tetiklendiğinde PWA kurulabilir
      setIsInstallable(true);
      
      // Kullanıcı daha önce reddetmediyse veya zorla açılmadıysa promptu göster
      if (!installDismissed && !forcedOpen) {
        setIsOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // PWA zaten kurulu mu kontrol et
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installDismissed, forcedOpen]);

  // forcedOpen prop'u değiştiğinde durumu güncelle
  useEffect(() => {
    setIsOpen(forcedOpen);
  }, [forcedOpen]);

  // PWA'yı yüklemek için kullanılacak fonksiyon
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // PWA kurulum promptunu göster
    deferredPrompt.prompt();
    
    // Kullanıcının yanıtını bekle
    const { outcome } = await deferredPrompt.userChoice;
    
    // Sonucu işle
    if (outcome === 'accepted') {
      console.log('PWA kurulumu başarılı');
      setIsInstallable(false);
    } else {
      console.log('PWA kurulumu reddedildi');
    }
    
    // İstem objesini temizle
    setDeferredPrompt(null);
    handleClose();
  };

  // Promptu kapat
  const handleClose = () => {
    setIsOpen(false);
    
    // Zorla açılmadıysa, kullanıcının reddettiğini hatırla
    if (!forcedOpen) {
      localStorage.setItem('pwa_install_dismissed', 'true');
      setInstallDismissed(true);
    }
    
    // onClose callback'i varsa çağır
    if (onClose) {
      onClose();
    }
  };

  // Kullanıcı PWA'yı kurmak istemiyorsa, daha sonra nasıl kurabileceklerini göster
  const handleShowInstallInstructions = () => {
    // İnstallInstructions komponenti açılabilir veya modal gösterilebilir
    // Bu örnekte basit bir bilgi modalı gösteriyoruz
    alert('PWA kurulumu için tarayıcınızın menüsünden "Ana Ekrana Ekle" veya "Uygulama olarak yükle" seçeneğini kullanabilirsiniz.');
  };

  // Eğer PWA kurulabilir değilse veya modal açık değilse render etme
  if ((!isInstallable && !forcedOpen) || !isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-0 right-0 mx-auto max-w-md px-4 z-50"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  PsikoRan'ı Yükle
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Daha hızlı erişim ve çevrimdışı çalışma özelliği için PsikoRan'ı cihazınıza yükleyin.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg text-sm font-medium flex items-center transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Şimdi Yükle
                  </button>
                  
                  <button
                    onClick={handleShowInstallInstructions}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center transition-colors"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Nasıl Yüklenir?
                  </button>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
                  Daha sonra kurmak isterseniz, <Link to="/settings" className="text-primary-600 dark:text-primary-400 hover:underline">Ayarlar</Link> sayfasından yükleme seçeneğine erişebilirsiniz.
                </p>
              </div>
              
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 p-1"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 