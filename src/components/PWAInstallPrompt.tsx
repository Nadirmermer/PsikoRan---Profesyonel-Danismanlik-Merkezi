import { useState, useEffect } from 'react';
import { X, Download, Info, AlertCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    // PWA yükleme olayını dinle
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Kullanıcının daha önce bu pop-up'ı kapatıp kapatmadığını kontrol et
      const lastDismissed = localStorage.getItem('pwa-install-dismissed');
      if (lastDismissed) {
        const dismissedTime = parseInt(lastDismissed, 10);
        const currentTime = Date.now();
        
        // 3 gün (259200000 ms) geçtiyse tekrar göster
        if (currentTime - dismissedTime > 259200000) {
          setIsVisible(true);
        }
      } else {
        // İlk kez gösteriliyor
        setIsVisible(true);
      }
    };

    // PWA yüklendikten sonra olayı dinle
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      
      // Yüklendi bilgisini saklayalım
      localStorage.setItem('pwa-installed', 'true');
      
      // Başarılı yükleme mesajı göster
      showInstallationSuccessMessage();
    };

    // Kullanıcı platformunu tespit et
    const detectPlatform = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        setPlatform('ios');
      } else if (/android/i.test(userAgent)) {
        setPlatform('android');
      } else {
        setPlatform('desktop');
      }
    };

    // Kullanıcı daha önce PWA'yı yüklemiş mi kontrol et
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.matchMedia('(display-mode: fullscreen)').matches ||
          window.matchMedia('(display-mode: minimal-ui)').matches ||
          localStorage.getItem('pwa-installed') === 'true') {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    detectPlatform();
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
      localStorage.setItem('pwa-installed', 'true');
    } else {
      console.log('Kullanıcı PWA yüklemeyi reddetti');
      // Reddetti ama bir süre sonra tekrar gösterilecek
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
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

  // Yükleme başarılı mesajını göster
  const showInstallationSuccessMessage = () => {
    // Gelecekte bir başarı toast mesajı eklenebilir
    console.log('PWA başarıyla yüklendi!');
  };

  // Eğer kullanıcı PWA'yı zaten yüklediyse veya istek gösterilmiyorsa, hiçbir şey gösterme
  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">PsikoRan Uygulaması</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Uygulamayı cihazınıza kurarak hızlı erişim sağlayın
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p className="flex items-center">
              <Info className="w-4 h-4 mr-1 inline text-blue-500" />
              Uygulamayı yükledikten sonra internet bağlantınız olmasa bile kullanabilirsiniz.
            </p>
            
            {platform === 'ios' && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-600">
                <p className="flex items-center text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 mr-1 inline" />
                  iOS cihazlarda, Safari tarayıcısında "Ana Ekrana Ekle" seçeneğini kullanmalısınız.
                </p>
              </div>
            )}
            
            <p>Avantajlar:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Daha hızlı erişim</li>
              <li>Çevrimdışı çalışma</li>
              <li>Daha iyi performans</li>
              <li>Tam ekran deneyimi</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="mt-3 flex justify-between items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? 'Daha az göster' : 'Daha fazla bilgi'}
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Daha sonra
          </button>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors flex items-center"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Yükle
          </button>
        </div>
      </div>
    </div>
  );
} 