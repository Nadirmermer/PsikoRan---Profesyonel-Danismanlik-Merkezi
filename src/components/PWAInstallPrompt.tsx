import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA yükleme olayını dinle
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    // PWA yüklendikten sonra olayı dinle
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
    };

    // Kullanıcı daha önce PWA'yı yüklemiş mi kontrol et
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Yükleme isteğini göster
    await installPrompt.prompt();

    // Kullanıcının seçimini bekle
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('Kullanıcı PWA yüklemeyi kabul etti');
      setIsInstalled(true);
    } else {
      console.log('Kullanıcı PWA yüklemeyi reddetti');
    }

    // Yükleme isteğini sıfırla
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Kullanıcının tercihini localStorage'a kaydet
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Eğer kullanıcı PWA'yı zaten yüklediyse veya istek gösterilmiyorsa, hiçbir şey gösterme
  if (isInstalled || !isVisible || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <img src="/logo192.png" alt="PsiRan Logo" className="w-10 h-10 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">PsiRan Uygulaması</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Uygulamayı ana ekranınıza ekleyin
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-3 flex justify-end space-x-2">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Daha sonra
        </button>
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors"
        >
          Yükle
        </button>
      </div>
    </div>
  );
} 