import { useState, useEffect } from 'react';
import { Download, Smartphone, WifiOff, Database, RefreshCw, Bell, BellOff, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { requestNotificationPermission } from '../utils/notificationUtils';

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
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [notificationSubscriptions, setNotificationSubscriptions] = useState<any[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const { user, professional, assistant } = useAuth();

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

    // Bildirim durumunu kontrol et
    const checkNotificationStatus = () => {
      if ('Notification' in window) {
        setNotificationStatus(Notification.permission);
      }
    };

    // Bildirim aboneliklerini yükle
    const loadNotificationSubscriptions = async () => {
      if (user) {
        setIsLoadingSubscriptions(true);
        try {
          const { data, error } = await supabase
            .from('notification_subscriptions')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) {
            throw error;
          }
          
          setNotificationSubscriptions(data || []);
        } catch (error) {
          console.error('Bildirim abonelikleri yüklenirken hata oluştu:', error);
        } finally {
          setIsLoadingSubscriptions(false);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    checkIfInstalled();
    checkStorageEstimate();
    checkServiceWorker();
    checkNotificationStatus();
    loadNotificationSubscriptions();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [user]);

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

  const handleEnableNotifications = async () => {
    if (!user) return;

    let userType: 'professional' | 'assistant' | 'client' = 'client';
    
    if (professional) {
      userType = 'professional';
    } else if (assistant) {
      userType = 'assistant';
    }

    try {
      // Bildirim izni iste
      const success = await requestNotificationPermission(user.id, userType);
      
      // İzin durumunu güncelle
      if ('Notification' in window) {
        setNotificationStatus(Notification.permission);
      }

      // Abonelikleri yeniden yükle
      if (success) {
        const { data } = await supabase
          .from('notification_subscriptions')
          .select('*')
          .eq('user_id', user.id);
        
        setNotificationSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Bildirim izni istenirken hata oluştu:', error);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('notification_subscriptions')
        .delete()
        .eq('id', subscriptionId);
      
      if (error) {
        throw error;
      }
      
      // Abonelikleri yeniden yükle
      setNotificationSubscriptions(prevSubscriptions => 
        prevSubscriptions.filter(sub => sub.id !== subscriptionId)
      );
    } catch (error) {
      console.error('Abonelik silinirken hata oluştu:', error);
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

  // Bildirim durumuna göre durum mesajını formatla
  const getNotificationStatusText = (status: NotificationPermission) => {
    switch (status) {
      case 'granted':
        return 'Bildirimler etkin';
      case 'denied':
        return 'Bildirimler engellenmiş. Tarayıcı ayarlarından izin vermeniz gerekir.';
      default:
        return 'Bildirimler için izin verilmemiş';
    }
  };

  // Abonelik oluşturma tarihini formatla
  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

      {/* Bildirim Ayarları */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bildirim Ayarları</h3>
          {notificationStatus !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              className="flex items-center px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
              disabled={notificationStatus === 'denied'}
            >
              <Bell className="w-4 h-4 mr-2" />
              Bildirimleri Etkinleştir
            </button>
          )}
        </div>

        {/* Bildirim Durumu */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
          <div className="flex items-center mb-2">
            {notificationStatus === 'granted' ? (
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            ) : notificationStatus === 'denied' ? (
              <BellOff className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            )}
            <h4 className="font-medium text-gray-900 dark:text-white">Bildirim Durumu</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getNotificationStatusText(notificationStatus)}
          </p>
          {notificationStatus === 'denied' && (
            <div className="mt-3 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              Bildirimleri etkinleştirmek için tarayıcı ayarlarından izin vermeniz gerekiyor. Site ayarlarına giderek bildirimlere izin verebilirsiniz.
            </div>
          )}
        </div>

        {/* Kayıtlı Bildirim Abonelikleri */}
        {notificationStatus === 'granted' && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Kayıtlı Cihazlar</h4>
            
            {isLoadingSubscriptions ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Bildirim abonelikleri yükleniyor...</p>
              </div>
            ) : notificationSubscriptions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">Kayıtlı bildirim aboneliği bulunamadı.</p>
            ) : (
              <div className="space-y-3">
                {notificationSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {subscription.subscription?.endpoint ? 
                          `${subscription.subscription.endpoint.split('/').pop().substring(0, 10)}...` : 
                          'Abone bilgisi'
                        }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatCreatedAt(subscription.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSubscription(subscription.id)}
                      className="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
              <p>Bu cihazlar bildirim almak için kayıtlıdır. Cihaz kaydını kaldırırsanız, bu cihazda bildirim almazsınız.</p>
              <p className="mt-1">Not: Her tarayıcı ve cihaz için ayrı ayrı izin vermeniz gerekir.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 