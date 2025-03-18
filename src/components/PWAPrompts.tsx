import { useState, useEffect } from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { NotificationPermission } from './NotificationPermission';

export function PWAPrompts() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    // Kullanıcının hangi bildirimlerle karşılaşacağını belirleyen zamanlayıcı
    const promptTimer = setTimeout(() => {
      checkAndEnablePrompts();
    }, 1500); // Sayfa yüklendikten 1,5 saniye sonra kontrol et

    return () => clearTimeout(promptTimer);
  }, []);

  const checkAndEnablePrompts = () => {
    // Kullanıcının PWA'yı yüklü olup olmadığını kontrol et
    const isPWAInstalled = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      localStorage.getItem('pwa-installed') === 'true';

    // Bildirim izni durumunu kontrol et
    const hasNotificationPermission = 
      ('Notification' in window) && Notification.permission === 'granted';

    // Sıralı gösterimi yönet
    if (!isPWAInstalled) {
      const lastDismissed = localStorage.getItem('pwa-install-dismissed');
      if (!lastDismissed || isTimeToShowAgain(lastDismissed, 259200000)) { // 3 gün
        setShowInstallPrompt(true);
        
        // Önce PWA yükleme istemini göster, sonra bildirim istemini göster
        if (!hasNotificationPermission) {
          setTimeout(() => {
            checkAndEnableNotificationPrompt();
          }, 60000); // PWA istemi göründükten 1 dakika sonra bildirim istemini kontrol et
        }
        return;
      }
    }

    // PWA yüklüyse veya reddedildiyse, doğrudan bildirim istemini kontrol et
    if (!hasNotificationPermission) {
      checkAndEnableNotificationPrompt();
    }
  };

  const checkAndEnableNotificationPrompt = () => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      const lastDismissed = localStorage.getItem('notification-permission-dismissed');
      if (!lastDismissed || isTimeToShowAgain(lastDismissed, 604800000)) { // 7 gün
        setShowNotificationPrompt(true);
      }
    }
  };

  // Belirli bir süre geçtiyse isteminin tekrar görüntülenip görüntülenmeyeceğini kontrol et
  const isTimeToShowAgain = (lastDismissedTime: string, timeoutMs: number) => {
    const dismissedTime = parseInt(lastDismissedTime, 10);
    const currentTime = Date.now();
    return (currentTime - dismissedTime) > timeoutMs;
  };

  return (
    <>
      {showInstallPrompt && <PWAInstallPrompt />}
      {showNotificationPrompt && <NotificationPermission />}
    </>
  );
} 