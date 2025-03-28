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
  
  const checkCanInstall = async () => {
    // Eğer zaten PWA olarak çalışıyorsa, kurulum seçeneğini gösterme
    if (getDisplayMode() !== 'browser') {
      setCanInstall(false);
      return;
    }

    const installable = await checkInstallConditions();
    setCanInstall(installable);
  };

  useEffect(() => {
    // PWA yükleme olayını dinlemeye başla
    listenForInstallPrompt();
    
    // Kurulum koşullarını kontrol et
    checkCanInstall();
    
    // Düzenli aralıklarla kontrol et, çünkü tarayıcı kriterler karşılandığında 
    // herhangi bir zamanda beforeinstallprompt olayını tetikleyebilir
    const interval = setInterval(checkCanInstall, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

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

  if (!canInstall) {
    return null;
  }

  // Android için prompt göster
  if (!isIOS) {
    return (
      <div className={`pwa-install-card bg-white rounded-lg shadow-lg p-4 mb-4 ${className}`}>
        <div className="flex items-center">
          <div className="app-icon mr-4 flex-shrink-0">
            <img src="/assets/icons/icon-192x192.png" alt="PsikoRan" className="w-12 h-12 rounded-lg" />
          </div>
          
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-800">PsikoRan'ı Yükleyin</h3>
            <p className="text-sm text-gray-600">Daha hızlı erişim ve çevrimdışı özellikler için uygulamayı cihazınıza ekleyin.</p>
          </div>
          
          <button 
            onClick={handleInstallClick}
            className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-shrink-0"
          >
            Yükle
          </button>
        </div>
      </div>
    );
  }

  // iOS için talimatlar göster
  return (
    <div className={`pwa-install-card bg-white rounded-lg shadow-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="app-icon mr-4 flex-shrink-0">
          <img src="/assets/icons/icon-192x192.png" alt="PsikoRan" className="w-12 h-12 rounded-lg" />
        </div>
        
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800">PsikoRan'ı Ana Ekranınıza Ekleyin</h3>
          
          {!showIOSInstructions ? (
            <>
              <p className="text-sm text-gray-600 mb-2">Daha hızlı erişim ve çevrimdışı özellikler için uygulamayı cihazınıza ekleyin.</p>
              <button 
                onClick={handleInstallClick}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Nasıl yapılır?
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">iOS cihazınıza eklemek için:</p>
              <ol className="text-sm text-gray-600 list-decimal pl-4 space-y-1">
                <li>Safari tarayıcısının altındaki <span className="inline-flex items-center"><svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> Paylaş</span> düğmesine dokunun</li>
                <li>"Ana Ekrana Ekle" seçeneğine dokunun</li>
                <li>"Ekle" düğmesine dokunun</li>
              </ol>
              <button 
                onClick={() => setShowIOSInstructions(false)}
                className="mt-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Kapat
              </button>
            </>
          )}
        </div>
        
        {!showIOSInstructions && (
          <button 
            onClick={() => setCanInstall(false)}
            className="ml-2 text-gray-400 hover:text-gray-500 flex-shrink-0"
            aria-label="Kapat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt; 