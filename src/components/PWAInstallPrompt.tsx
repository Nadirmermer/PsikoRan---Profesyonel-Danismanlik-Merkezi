import React, { useState, useEffect } from 'react';
import { checkInstallConditions, showInstallPrompt, listenForInstallPrompt, getDisplayMode } from '../utils/pwa';

// İşletim sistemi tespiti
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
const isAndroid = /Android/.test(navigator.userAgent);

interface PWAInstallPromptProps {
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  
  const checkCanInstall = async () => {
    // Kullanıcı daha önce kapatmışsa gösterme
    if (dismissed) {
      setCanInstall(false);
      return;
    }

    // Eğer zaten PWA olarak çalışıyorsa, kurulum seçeneğini gösterme
    if (getDisplayMode() !== 'browser') {
      setCanInstall(false);
      return;
    }

    const installable = await checkInstallConditions();
    setCanInstall(installable);
  };

  useEffect(() => {
    // Eğer zaten PWA olarak çalışıyorsa, banneri hiç gösterme
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone || 
        document.referrer.includes('android-app://')) {
      setCanInstall(false);
      return;
    }
    
    // PWA yükleme olayını dinlemeye başla
    listenForInstallPrompt();
    
    // Kullanıcı daha önce kapatmış mı kontrol et
    const pwaPromptDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (pwaPromptDismissed) {
      setDismissed(true);
      return;
    }
    
    // Kurulum koşullarını kontrol et
    checkCanInstall();
    
    // PWA yüklenebilir olduğunda olayı dinle
    const handlePwaInstallable = () => {
      checkCanInstall();
    };
    
    window.addEventListener('pwaInstallable', handlePwaInstallable);
    
    // Düzenli aralıklarla kontrol et, çünkü tarayıcı kriterler karşılandığında 
    // herhangi bir zamanda beforeinstallprompt olayını tetikleyebilir
    const interval = setInterval(checkCanInstall, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('pwaInstallable', handlePwaInstallable);
    };
  }, [dismissed]);

  const handleInstallClick = async () => {
    // Android ve diğer platformlar için
    if (!isIOS) {
      const installed = await showInstallPrompt();
      if (installed) {
        setCanInstall(false);
      }
    } else {
      // iOS için talimatları göster
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setCanInstall(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!canInstall || dismissed) {
    return null;
  }

  // Ortak kart stil sınıfları - daha belirgin yapıldı
  const cardClasses = `pwa-install-card fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 dark:bg-gray-800 bg-white rounded-lg shadow-xl p-4 border-l-4 border-indigo-600 border border-indigo-200 dark:border-indigo-800 ${className}`;
  const buttonClasses = "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105";
  const closeButtonClasses = "ml-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 flex-shrink-0 focus:outline-none";

  // Android için prompt göster
  if (!isIOS) {
    return (
      <div className={cardClasses}>
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="app-icon mr-4 mb-2 md:mb-0 flex-shrink-0">
            <img src="/images/icons/icon-192x192.webp" alt="PsikoRan" className="w-12 h-12 rounded-lg shadow-sm" />
          </div>
          
          <div className="flex-grow mb-2 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">PsikoRan'ı Yükleyin</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Daha hızlı erişim ve çevrimdışı özellikler için uygulamayı cihazınıza ekleyin.</p>
          </div>
          
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
            <button 
              onClick={handleInstallClick}
              className={buttonClasses}
            >
              Yükle
            </button>
            
            <button 
              onClick={handleDismiss}
              className={closeButtonClasses}
              aria-label="Kapat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS için talimatlar göster
  return (
    <div className={cardClasses}>
      <div className="flex flex-col md:flex-row md:items-start">
        <div className="app-icon mr-4 mb-2 md:mb-0 flex-shrink-0">
          <img src="/images/icons/icon-192x192.webp" alt="PsikoRan" className="w-12 h-12 rounded-lg" />
        </div>
        
        <div className="flex-grow">
          <div className="flex items-start justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">PsikoRan'ı Ana Ekranınıza Ekleyin</h3>
            
            {!showIOSInstructions && (
              <button 
                onClick={handleDismiss}
                className={closeButtonClasses}
                aria-label="Kapat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {!showIOSInstructions ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Daha hızlı erişim ve çevrimdışı özellikler için uygulamayı cihazınıza ekleyin.</p>
              <button 
                onClick={handleInstallClick}
                className={buttonClasses}
              >
                Nasıl yapılır?
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">iOS cihazınıza eklemek için:</p>
              <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal pl-4 space-y-1">
                <li>Safari tarayıcısının altındaki <span className="inline-flex items-center"><svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> Paylaş</span> düğmesine dokunun</li>
                <li>"Ana Ekrana Ekle" seçeneğine dokunun</li>
                <li>"Ekle" düğmesine dokunun</li>
              </ol>
              <button 
                onClick={handleDismiss}
                className="mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Anladım
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt; 