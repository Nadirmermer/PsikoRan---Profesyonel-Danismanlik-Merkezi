import { useState, useEffect } from 'react';
import { Download, Smartphone, WifiOff, Database, RefreshCw } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWASettings() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'active' | 'installing' | 'waiting' | 'none'>('none');

  useEffect(() => {
    // PWA yükleme olayını dinle
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Kullanıcı daha önce PWA'yı yüklemiş mi kontrol et
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsPWA(true);
      }
    };

    // Çevrimiçi durumunu dinle
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    // Depolama kullanımını kontrol et
    const checkStorageEstimate = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageEstimate({
            usage: estimate.usage || 0,
            quota: estimate.quota || 0
          });
        } catch (error) {
          console.error('Depolama tahmini alınamadı:', error);
        }
      }
    };

    // Service Worker durumunu kontrol et
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          
          if (registrations.length > 0) {
            const registration = registrations[0];
            
            if (registration.active) {
              setServiceWorkerStatus('active');
            } else if (registration.installing) {
              setServiceWorkerStatus('installing');
            } else if (registration.waiting) {
              setServiceWorkerStatus('waiting');
            }
          } else {
            setServiceWorkerStatus('none');
          }
        } catch (error) {
          console.error('Service Worker durumu alınamadı:', error);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    checkIfInstalled();
    checkStorageEstimate();
    checkServiceWorker();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
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
      setIsPWA(true);
    } else {
      console.log('Kullanıcı PWA yüklemeyi reddetti');
    }

    // Yükleme isteğini sıfırla
    setInstallPrompt(null);
  };

  const handleUpdateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          await registration.update();
        }
        
        // Service Worker durumunu yeniden kontrol et
        const updatedRegistrations = await navigator.serviceWorker.getRegistrations();
        
        if (updatedRegistrations.length > 0) {
          const registration = updatedRegistrations[0];
          
          if (registration.active) {
            setServiceWorkerStatus('active');
          } else if (registration.installing) {
            setServiceWorkerStatus('installing');
          } else if (registration.waiting) {
            setServiceWorkerStatus('waiting');
          }
        }
      } catch (error) {
        console.error('Service Worker güncellenemedi:', error);
      }
    }
  };

  // Byte'ı insan tarafından okunabilir formata dönüştür
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Uygulama Ayarları</h3>
        {!isPWA && installPrompt && (
          <button
            onClick={handleInstallClick}
            className="flex items-center px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Uygulamayı Yükle
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PWA Durumu */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Uygulama Durumu</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isPWA 
              ? "Uygulama yüklü ve çalışıyor" 
              : "Uygulama yüklü değil. Yüklemek için sağdaki butonu kullanabilirsiniz."}
          </p>
          {isPWA && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Uygulama ana ekranınızdan erişilebilir
            </div>
          )}
        </div>

        {/* Çevrimiçi Durumu */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <WifiOff className={`w-5 h-5 ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mr-2`} />
            <h4 className="font-medium text-gray-900 dark:text-white">Bağlantı Durumu</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isOnline 
              ? "Çevrimiçi - İnternet bağlantısı var" 
              : "Çevrimdışı - İnternet bağlantısı yok"}
          </p>
          {!isOnline && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Çevrimdışı modda sınırlı özellikler kullanılabilir
            </div>
          )}
        </div>

        {/* Depolama Bilgisi */}
        {storageEstimate && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Depolama Kullanımı</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Kullanılan:</span>
                <span className="text-gray-900 dark:text-white">{formatBytes(storageEstimate.usage)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Toplam:</span>
                <span className="text-gray-900 dark:text-white">{formatBytes(storageEstimate.quota)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full" 
                  style={{ width: `${(storageEstimate.usage / storageEstimate.quota) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Service Worker Durumu */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Uygulama Güncellemesi</h4>
            </div>
            <button 
              onClick={handleUpdateServiceWorker}
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Güncelle
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {serviceWorkerStatus === 'active' && "Uygulama güncel"}
            {serviceWorkerStatus === 'installing' && "Güncelleme yükleniyor..."}
            {serviceWorkerStatus === 'waiting' && "Güncelleme hazır, uygulamayı yeniden başlatın"}
            {serviceWorkerStatus === 'none' && "Service Worker bulunamadı"}
          </p>
        </div>
      </div>
    </div>
  );
} 