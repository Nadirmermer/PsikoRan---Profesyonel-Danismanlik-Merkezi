import React, { useState, useEffect } from 'react';
import { 
  getDisplayMode, 
  isOnline, 
  checkServiceWorkerRegistration,
  checkNotificationPermission,
  requestNotificationPermission,
  checkInstallConditions,
  showInstallPrompt
} from '../../utils/pwa';
import { 
  Smartphone, 
  WifiOff, 
  Download, 
  Bell, 
  Info,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { 
  checkNotificationPermissionStatus, 
  isMobileDevice, 
  isPWA as checkIsPWA,
  sendNotification 
} from '../../utils/notificationUtils';

const PWASettings = () => {
  const { user, professional, assistant } = useAuth();
  const [displayMode, setDisplayMode] = useState<string>('browser');
  const [online, setOnline] = useState<boolean>(true);
  const [swRegistered, setSwRegistered] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [notificationsSupported, setNotificationsSupported] = useState<boolean>(true);
  const [requestingPermission, setRequestingPermission] = useState<boolean>(false);
  const [showNotificationTestResult, setShowNotificationTestResult] = useState<{success: boolean, message: string} | null>(null);
  
  // PWA durumunu tespit et
  const isPWA = displayMode === 'standalone' || displayMode === 'standalone-ios';
  
  // iOS tespiti
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  
  // Durumları yükle
  useEffect(() => {
    const loadStatus = async () => {
      // Cihaz tipini kontrol et
      setIsMobile(isMobileDevice());
      
      // PWA durumunu kontrol et
      const mode = getDisplayMode();
      setDisplayMode(mode);
      
      // Çevrimiçi durumunu kontrol et
      setOnline(isOnline());
      
      // Service Worker kaydını kontrol et
      const registration = await checkServiceWorkerRegistration();
      setSwRegistered(!!registration);
      
      // Bildirim izinlerini kontrol et
      const permStatus = await checkNotificationPermissionStatus();
      setNotificationsSupported(permStatus.isSupported);
      setNotificationPermission(permStatus.permission);

      // Uygulama yüklenebilir mi kontrol et
      if (mode === 'browser') {
        const installable = await checkInstallConditions();
        setCanInstall(installable);
      }
    };
    
    loadStatus();
    
    // Çevrimiçi/çevrimdışı durumunu dinle
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Bildirim izni iste
  const handleRequestNotifications = async () => {
    if (!user) return;
    if (notificationPermission === 'denied') return;
    
    setRequestingPermission(true);
    
    try {
      let userType: 'professional' | 'assistant' | 'client' = 'client';
      if (professional) {
        userType = 'professional';
      } else if (assistant) {
        userType = 'assistant';
      }
      
      const granted = await requestNotificationPermission(user.id, userType);
      
      // Durumu yeniden kontrol et
      const permStatus = await checkNotificationPermissionStatus();
      setNotificationPermission(permStatus.permission);
      
      if (granted) {
        setShowNotificationTestResult({
          success: true,
          message: "Bildirim izni başarıyla alındı!"
        });
        
        // Bildirim başarılı olduğunda test bildirimi gönder
        setTimeout(() => {
          sendNotification(
            user.id, 
            "Bildirim Testi", 
            "Bildirimler başarıyla etkinleştirildi! Artık önemli bildirimleri alabilirsiniz.", 
            { url: "/settings" },
            userType
          );
        }, 1500);
      } else {
        setShowNotificationTestResult({
          success: false,
          message: "Bildirim izni alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin."
        });
      }
    } catch (error) {
      setShowNotificationTestResult({
        success: false,
        message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      });
    } finally {
      setRequestingPermission(false);
      
      // 5 saniye sonra test sonucunu gizle
      setTimeout(() => {
        setShowNotificationTestResult(null);
      }, 5000);
    }
  };

  // Uygulamayı yükle
  const handleInstallApp = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      await showInstallPrompt();
    }
  };
  
  // iOS için kurulum talimatları
  const renderIOSInstructions = () => {
    if (!showIOSInstructions || !isIOS) return null;
    
    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">iPhone/iPad Cihazınıza Kolayca Ekleyin</h4>
        <ol className="text-xs text-blue-700 dark:text-blue-400 list-decimal pl-4 space-y-1">
          <li>Safari tarayıcısının altındaki <span className="inline-flex items-center">"Paylaş" <svg className="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></span> düğmesine dokunun</li>
          <li>"Ana Ekrana Ekle" seçeneğine dokunun</li>
          <li>"Ekle" düğmesine dokunun</li>
        </ol>
        <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
          Böylece PsikoRan ana ekranınızda diğer uygulamalar gibi hızlıca erişebileceğiniz bir simge olarak görünecek.
        </p>
        <button 
          onClick={() => setShowIOSInstructions(false)}
          className="mt-3 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/70 px-3 py-1 rounded"
        >
          Tamam, Anladım
        </button>
      </div>
    );
  };
  
  // Bildirim test sonucu
  const renderNotificationTestResult = () => {
    if (!showNotificationTestResult) return null;
    
    return (
      <div className={`mt-4 p-3 rounded-lg ${
        showNotificationTestResult.success 
          ? 'bg-green-50 dark:bg-green-900/20' 
          : 'bg-yellow-50 dark:bg-yellow-900/20'
      }`}>
        <div className="flex items-start">
          {showNotificationTestResult.success ? (
            <Info className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm ${
              showNotificationTestResult.success 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-yellow-700 dark:text-yellow-400'
            }`}>
              {showNotificationTestResult.message}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
          <Smartphone className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
          Uygulama Ayarları
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          PsikoRan uygulamanızı cihazınıza kurun ve mobil uygulama gibi kullanın
        </p>
      </div>
      
      {/* Cihaz Bilgisi */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">Cihaz Türü:</span> {isMobile ? 'Mobil Cihaz' : 'Masaüstü Bilgisayar'}
          {isIOS && <span className="ml-1">(iOS)</span>}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          <span className="font-medium">Görüntüleme Modu:</span> {isPWA ? 'Ana Ekran Uygulaması' : 'Web Tarayıcı'}
        </p>
      </div>
      
      {/* Ana Kurulum Butonu - PWA değilse ve kurulabiliyorsa göster */}
      {!isPWA && canInstall && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-800/30 p-2 rounded-full">
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                PsikoRan'ı cihazınıza yükleyin
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Daha hızlı erişim, bildirimler ve çevrimdışı kullanım için
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallApp}
            className="ml-4 px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium flex items-center"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Yükle
          </button>
        </div>
      )}
      
      {renderIOSInstructions()}
      {renderNotificationTestResult()}
      
      {/* PWA Durum Kartı */}
      <div className="bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col space-y-4">
            {/* Uygulama Modu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Görüntüleme Modu</span>
              </div>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isPWA 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {isPWA ? 'Ana Ekran Uygulaması' : 'Web Tarayıcı'}
              </span>
            </div>
            
            {/* Çevrimiçi Durumu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <WifiOff className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">İnternet Bağlantısı</span>
              </div>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                online 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {online ? 'Bağlı' : 'Bağlantı Yok'}
              </span>
            </div>
            
            {/* Çevrimdışı Erişim */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Çevrimdışı Erişim</span>
              </div>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                swRegistered 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {swRegistered ? 'Etkin' : 'Devre Dışı'}
              </span>
            </div>
            
            {/* Bildirimler */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bildirimler</span>
              </div>
              <div>
                {!notificationsSupported ? (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Desteklenmiyor
                  </span>
                ) : notificationPermission === 'granted' ? (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Etkin
                  </span>
                ) : (
                  <button
                    onClick={handleRequestNotifications}
                    disabled={notificationPermission === 'denied' || requestingPermission}
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      notificationPermission === 'denied'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 cursor-not-allowed'
                        : requestingPermission
                        ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 cursor-wait'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200'
                    }`}
                  >
                    {notificationPermission === 'denied' 
                      ? 'Engellendi' 
                      : requestingPermission 
                      ? 'İşleniyor...' 
                      : 'İzin Ver'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Avantajlar Bölümü */}
      <div className="mt-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-medium text-slate-900 dark:text-white mb-4">Uygulama Avantajları</h3>
          
          <div className="space-y-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Kolay Erişim</span> - Telefon veya bilgisayarınızın ana ekranına ekleyebilirsiniz
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Anında Bildirimler</span> - Önemli randevu hatırlatıcıları ve bildirimler alabilirsiniz
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Daha Hızlı Açılış</span> - Normal uygulamalar gibi hızlı açılış ve cihazla entegrasyon
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Çevrimdışı Çalışma</span> - İnternet bağlantısı olmadan da temel özellikleri kullanabilirsiniz
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Zaten PWA olarak kurulmuşsa bilgilendirme mesajı */}
      {isPWA && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-300">Kurulum Tamamlandı</h4>
              <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                PsikoRan şu anda ana ekranınıza kurulmuş ve uygulamanın tüm özelliklerini kullanabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobil cihazlarda bildirim önerisi */}
      {isMobile && !isPWA && notificationsSupported && notificationPermission !== 'granted' && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Mobil Cihazlarda Bildirimler</h4>
              <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                Mobil cihazınızda daha güvenilir bildirimler almak için, uygulamayı ana ekranınıza ekleyin ve ardından bildirim izni verin.
              </p>
              {!isPWA && canInstall && (
                <button
                  onClick={handleInstallApp}
                  className="mt-2 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 dark:hover:bg-yellow-900/70 px-3 py-1 rounded flex items-center space-x-1"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  <span>Uygulamayı Yükle</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWASettings; 