/**
 * PWA ile ilgili işlemleri yönetmek için yardımcı fonksiyonlar
 */

/**
 * Service Worker'ın kayıtlı olup olmadığını kontrol eder
 */
export const checkServiceWorkerRegistration = (): Promise<ServiceWorkerRegistration | null> => {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration()
        .then(registration => {
          resolve(registration);
        })
        .catch(() => {
          resolve(null);
        });
    } else {
      resolve(null);
    }
  });
};

/**
 * PWA yükleme koşullarını kontrol eder
 */
export const checkInstallConditions = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('serviceWorker' in navigator)) {
      resolve(false);
      return;
    }
    
    if (
      /iP(ad|hone|od)/.test(navigator.userAgent) || 
      (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document)
    ) {
      // iOS için A2HS için ayrı bir kontrol sağlamalıyız
      // iOS kullanıcıları için bir kılavuz gösterebiliriz
      resolve(
        !window.matchMedia('(display-mode: standalone)').matches && 
        !window.navigator.standalone
      );
      return;
    }

    // Android ve diğer platformlarda, tarayıcı PWA yükleme koşullarını otomatik olarak kontrol eder
    // ve 'beforeinstallprompt' olayını tetikler
    resolve(!!window.deferredPrompt);
  });
};

/**
 * PWA Yükleme isteğini gösterir
 */
let deferredPrompt: any;

export const listenForInstallPrompt = (): void => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Tarayıcının varsayılan davranışını önle
    e.preventDefault();
    // İstek nesnesini daha sonra kullanmak için sakla
    window.deferredPrompt = e;
    deferredPrompt = e;
  });
};

export const showInstallPrompt = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const promptEvent = deferredPrompt || window.deferredPrompt;
    
    if (!promptEvent) {
      resolve(false);
      return;
    }

    // Yükleme isteğini göster
    promptEvent.prompt();
    
    // Kullanıcının cevabını bekle
    promptEvent.userChoice.then((choiceResult: { outcome: string }) => {
      // Yükleme isteği kullanıldı, artık null yap
      window.deferredPrompt = null;
      deferredPrompt = null;
      
      // Kullanıcı kabul etti mi?
      resolve(choiceResult.outcome === 'accepted');
    }).catch(() => {
      resolve(false);
    });
  });
};

/**
 * Uygulamanın ne şekilde açıldığını kontrol et
 */
export const getDisplayMode = (): string => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.navigator.standalone) {
    return 'standalone-ios';
  }
  return 'browser';
};

/**
 * Çevrimiçi/Çevrimdışı durumunu kontrol et
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Ağ durumu değişikliklerini takip et
 */
export const listenForNetworkChanges = (
  onOnline: () => void, 
  onOffline: () => void
): () => void => {
  const handleOnline = () => {
    onOnline();
  };
  
  const handleOffline = () => {
    onOffline();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Cleanup fonksiyonu
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Base64 string'i Uint8Array'e çeviren yardımcı fonksiyon
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Push notification izinlerini kontrol et
 */
export const checkNotificationPermission = (): Promise<NotificationPermission> => {
  return new Promise((resolve) => {
    if (!('Notification' in window)) {
      resolve('denied');
      return;
    }
    
    resolve(Notification.permission);
  });
};

/**
 * Push notification izni iste
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Bildirim izni istenirken hata oluştu:', error);
    return false;
  }
};

/**
 * Push notification için abone ol
 */
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    
    // Web Push için izin kontrolü
    const permission = await requestNotificationPermission();
    if (!permission) {
      return null;
    }
    
    // Mevcut aboneliği kontrol et
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) {
      return subscription;
    }
    
    // VAPID Public Key çevresel değişkenlerden alınıyor
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    
    // VAPID public key'i uint8Array'e dönüştür
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    
    // Yeni abonelik oluştur
    const newSubscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
    
    // Aboneliği sunucuya kaydet
    await fetch('/api/push/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubscription),
    });
    
    return newSubscription;
  } catch (error) {
    console.error('Push bildirimlerine abone olurken hata oluştu:', error);
    return null;
  }
};

/**
 * Background sync için kayıt ol
 */
export const registerBackgroundSync = async (tag: string): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      return false;
    }
    
    const registration = await navigator.serviceWorker.ready;
    
    // TypeScript'in SyncManager'ı tanıması için kontrol ekleyelim
    if ('sync' in registration) {
      await (registration as any).sync.register(tag);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Background sync kaydedilirken hata oluştu:', error);
    return false;
  }
};

/**
 * Service Worker'ı güncelle
 */
export const updateServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  }
};

/**
 * Bekleyen Service Worker'ı etkinleştir (skipWaiting)
 */
export const activateUpdate = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (!registration.waiting) {
      console.log('Bekleyen bir Service Worker yok');
      return false;
    }
    
    // skipWaiting mesajını gönder
    registration.waiting.postMessage('SKIP_WAITING');
    
    // Sayfa yenileneceği için true döndür
    return true;
  } catch (error) {
    console.error('Service Worker aktivasyonu sırasında hata oluştu:', error);
    return false;
  }
};

/**
 * Service Worker güncellemelerini kontrol et
 */
export const checkForUpdates = async (registration: ServiceWorkerRegistration): Promise<boolean> => {
  try {
    // Önce manuel olarak bir güncelleme kontrolü yap
    await registration.update();
    
    // Yeni service worker var mı kontrol et
    if (registration.installing || registration.waiting) {
      // Yeni bir service worker kurulumda veya beklemede
      return true;
    }

    return false;
  } catch (error) {
    console.error('Güncelleme kontrolü sırasında hata oluştu:', error);
    return false;
  }
};

/**
 * Service worker güncellemesini dinle
 */
export const listenForUpdates = (onUpdateFound: () => void): () => void => {
  if (!('serviceWorker' in navigator)) {
    return () => {};
  }

  // Service worker güncellemelerini dinleme işlevi
  const checkForUpdate = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Güncellemeleri dinle
      registration.addEventListener('updatefound', () => {
        // Yeni service worker bulundu
        if (registration.installing) {
          // Yeni service worker'ın durumunu izle
          registration.installing.addEventListener('statechange', (event) => {
            // @ts-ignore - event.target için type hatası olabilir
            if (event.target && event.target.state === 'installed' && navigator.serviceWorker.controller) {
              // Service worker güncellendi ve bekliyor
              onUpdateFound();
            }
          });
        }
      });
      
      // Sayfayı yeniden yükleme durumlarında controller değişimini dinle
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Yeni service worker aktif hale geldi, sayfayı yenile
        window.location.reload();
      });
      
      // İlk kontrol
      await registration.update();
    } catch (error) {
      console.error('Service worker güncelleme dinleyicisi ayarlanırken hata oluştu:', error);
    }
  };

  // İlk kontrol yap
  checkForUpdate();
  
  // Periyodik olarak da kontrol et (her 60 dakikada bir)
  const interval = setInterval(checkForUpdate, 60 * 60 * 1000);
  
  // Temizleme işlevi
  return () => {
    clearInterval(interval);
  };
};

// Özel Window tipi tanımlaması
declare global {
  interface Window {
    deferredPrompt: any;
  }
  
  interface Navigator {
    standalone?: boolean;
  }
} 