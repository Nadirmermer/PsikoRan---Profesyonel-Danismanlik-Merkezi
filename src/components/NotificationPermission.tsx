import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { requestNotificationPermission } from '../utils/notificationUtils';

export function NotificationPermission() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { professional, assistant, user } = useAuth();

  useEffect(() => {
    // Notification API kontrol et
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirim API\'sini desteklemiyor');
      return;
    }

    // İzin durumunu al
    setPermissionStatus(Notification.permission);

    // Eğer izin daha önce reddedilmediyse ve "granted" değilse, bildirimi göster
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      setIsVisible(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    try {
      if (!user) {
        console.warn('Kullanıcı oturum açmamış, bildirimler etkinleştirilemiyor');
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
      }
    } catch (error) {
      console.error('Bildirim izni istenirken hata oluştu:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    
    // İzni reddetmeyi tercih ettiğini localStorage'a kaydet
    localStorage.setItem('notification-permission-dismissed', Date.now().toString());
  };

  // Görünür değilse bileşeni gösterme
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Bildirimleri Etkinleştir</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Randevu hatırlatmaları için bildirimlere izin ver
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <BellOff className="w-5 h-5" />
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
          onClick={handleEnableNotifications}
          className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors"
        >
          Bildirimleri Etkinleştir
        </button>
      </div>
    </div>
  );
} 