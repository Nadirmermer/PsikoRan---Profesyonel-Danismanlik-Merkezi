import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      
      // Çevrimiçi olduğunda bildirimi 3 saniye daha göster, sonra kapat
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };

    // İlk yükleme durumunu kontrol et
    if (!navigator.onLine) {
      setIsVisible(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`flex items-center justify-center p-2 text-sm ${isOffline ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
        {isOffline ? (
          <div className="flex items-center">
            <WifiOff className="w-4 h-4 mr-2" />
            <span>Çevrimdışı mod - İnternet bağlantısı yok</span>
          </div>
        ) : (
          <span>İnternet bağlantısı yeniden kuruldu</span>
        )}
      </div>
    </div>
  );
} 