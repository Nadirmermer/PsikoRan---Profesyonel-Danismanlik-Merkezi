import { useState, useEffect } from 'react';
import { Bell, BellOff, X, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { requestNotificationPermission } from '../utils/notificationUtils';

export function NotificationPermission() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { professional, assistant, user } = useAuth();

  useEffect(() => {
    // Notification API kontrol et
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirim API\'sini desteklemiyor');
      return;
    }

    // İzin durumunu al
    setPermissionStatus(Notification.permission);

    // Eğer oturum açılmışsa ve izin daha önce reddedilmediyse/verilmediyse
    if (user && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // Kullanıcının daha önce bu pop-up'ı kapatıp kapatmadığını kontrol et
      const lastDismissed = localStorage.getItem('notification-permission-dismissed');
      if (lastDismissed) {
        const dismissedTime = parseInt(lastDismissed, 10);
        const currentTime = Date.now();
        
        // 7 gün (604800000 ms) geçtiyse tekrar göster
        if (currentTime - dismissedTime > 604800000) {
          // Sadece kullanıcı oturum açtıysa göster
          setIsVisible(true);
        }
      } else {
        // Kullanıcı oturum açtıysa göster
        setIsVisible(true);
      }
    }

    // Bildirim izin durumu değişikliklerini dinle
    const handlePermissionChange = () => {
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
        
        // İzin verildiyse pop-up'ı kapat
        if (Notification.permission === 'granted') {
          setIsVisible(false);
          showSuccessMessage();
        }
      }
    };

    // Sayfa yüklendiğinde ve görünürlük değiştiğinde izin durumunu kontrol et
    document.addEventListener('visibilitychange', handlePermissionChange);

    return () => {
      document.removeEventListener('visibilitychange', handlePermissionChange);
    };
  }, [user]);

  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        console.warn('Kullanıcı oturum açmamış, bildirimler etkinleştirilemiyor');
        setIsLoading(false);
        return;
      }

      let userType: 'professional' | 'assistant' | 'client' = 'client';
      
      if (professional) {
        userType = 'professional';
      } else if (assistant) {
        userType = 'assistant';
      }

      // Bildirim izni iste
      const success = await requestNotificationPermission(user.id, userType);
      
      // İzin durumunu güncelle
      setPermissionStatus(Notification.permission);
      
      // Başarılı olursa bildirimi gizle
      if (success) {
        setIsVisible(false);
        showSuccessMessage();
      }
    } catch (error) {
      console.error('Bildirim izni istenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    
    // İzni reddetmeyi tercih ettiğini localStorage'a kaydet
    localStorage.setItem('notification-permission-dismissed', Date.now().toString());
  };

  // Başarılı izin alma mesajını göster
  const showSuccessMessage = () => {
    // Gelecekte bir başarı toast mesajı eklenebilir
    console.log('Bildirim izni başarıyla alındı!');
  };

  // Görünür değilse bileşeni gösterme
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Bildirimleri Etkinleştir</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Randevu hatırlatmaları ve güncellemeler için bildirimlere izin ver
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
            <p className="flex items-start">
              <Info className="w-4 h-4 mr-1 mt-0.5 inline text-blue-500 flex-shrink-0" />
              <span>
                Bildirimleri etkinleştirdiğinizde, randevularınızın yaklaştığını size hatırlatabilir, 
                önemli güncellemeler hakkında sizi bilgilendirebiliriz.
              </span>
            </p>
            
            {permissionStatus === 'denied' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800/30">
                <p className="flex items-start text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 mr-1 mt-0.5 inline flex-shrink-0" />
                  <span>
                    Bildirimlere izin vermeyi daha önce reddettiniz. İzin vermek için tarayıcı ayarlarınızdan
                    bildirim izinlerini güncellemeniz gerekiyor.
                  </span>
                </p>
              </div>
            )}
            
            <p>Bildirim türleri:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Yaklaşan randevu hatırlatmaları</li>
              <li>Randevu değişiklikleri</li>
              <li>Yeni mesajlar</li>
              <li>Önemli güncellemeler</li>
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
            disabled={isLoading}
          >
            Daha sonra
          </button>
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading || permissionStatus === 'denied'}
            className={`px-3 py-1.5 text-xs text-white rounded-lg transition-colors flex items-center ${
              permissionStatus === 'denied' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 mr-1.5" />
                {permissionStatus === 'denied' ? 'Tarayıcı İzinlerini Ayarla' : 'Bildirimleri Etkinleştir'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 