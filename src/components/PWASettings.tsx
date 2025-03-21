import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, X, Smartphone, WifiOff, Database, RefreshCw, Bell, BellOff, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { requestNotificationPermission } from '../utils/notificationUtils';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * PWA ayarları bileşeni
 * 
 * Bu bileşen, kullanıcıya PWA kurulumu için bilgi verir ve
 * PWA'yı cihaza yükleme seçeneği sunar
 */
export function PWASettings() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'active' | 'installing' | 'waiting' | 'none'>('none');
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [notificationSubscriptions, setNotificationSubscriptions] = useState<any[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const { user, professional, assistant } = useAuth();

  useEffect(() => {
    // PWA kurulu mu kontrol et
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsInstalled(isStandalone);
    };

    // PWA kurulum olayını dinle (sonradan kullanmak üzere)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
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

  // PWA'yı yüklemek için kullanılacak fonksiyon
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Eğer deferredPrompt yoksa (desteklenmeyen tarayıcı veya 
      // kullanıcı zaten kuruluma izin verdi), manuel talimatları göster
      setShowInstallModal(true);
      return;
    }

    // PWA kurulum promptunu göster
    deferredPrompt.prompt();
    
    // Kullanıcının yanıtını bekle
    const { outcome } = await deferredPrompt.userChoice;
    
    // Sonucu işle
    if (outcome === 'accepted') {
      console.log('PWA kurulumu başarılı');
      setIsInstalled(true);
      setIsInstallable(false);
    } else {
      console.log('PWA kurulumu reddedildi');
    }
    
    // İstem objesini temizle
    setDeferredPrompt(null);
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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Uygulama Kurulumu</h3>
        <div className="flex items-center">
          {isInstalled ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Kurulu
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <Smartphone className="w-3 h-3 mr-1" />
              Kurulmadı
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 mt-1">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          PsikoRan'ı cihazınıza bir uygulama olarak kurarak daha hızlı erişim sağlayabilir ve çevrimdışı özellikleri kullanabilirsiniz.
        </p>

        <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Smartphone className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-primary-800 dark:text-primary-300">Avantajlar</h4>
              <ul className="mt-2 text-sm text-primary-700 dark:text-primary-400 space-y-1 list-disc pl-5">
                <li>Cihazınızın ana ekranından doğrudan erişim</li>
                <li>Tarayıcıdan bağımsız tam ekran deneyimi</li>
                <li>Daha hızlı yükleme süreleri</li>
                <li>İnternet bağlantınız olmadığında bile temel özelliklere erişim</li>
                <li>Randevu bildirimleri alma</li>
              </ul>
            </div>
          </div>
        </div>

        {!isInstalled && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none transition-colors"
            disabled={!isInstallable && !navigator.userAgent.includes('Mobile')}
          >
            <Download className="h-4 w-4 mr-2" />
            {isInstallable ? "PsikoRan'ı Yükle" : "Kurulum Talimatlarını Göster"}
          </motion.button>
        )}

        {/* Kurulum ipuçları modalı */}
        {showInstallModal && (
          <PWAInstallPrompt 
            forcedOpen={true} 
            onClose={() => setShowInstallModal(false)} 
          />
        )}
      </div>
    </div>
  );
} 