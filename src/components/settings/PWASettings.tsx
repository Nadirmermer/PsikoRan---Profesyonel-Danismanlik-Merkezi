import React, { useState, useEffect } from 'react';
import { 
  getDisplayMode, 
  isOnline, 
  updateServiceWorker, 
  checkServiceWorkerRegistration,
  checkNotificationPermission,
  requestNotificationPermission,
  checkInstallConditions,
  showInstallPrompt,
  checkForUpdates,
  listenForUpdates,
  listenForNetworkChanges,
  activateUpdate
} from '../../utils/pwa';
import { Smartphone, WifiOff, Download, RefreshCw, Bell, Info, Plus } from 'lucide-react';
import { startAppointmentChecker } from '../../utils/notificationUtils';

const PWASettings = () => {
  const [displayMode, setDisplayMode] = useState<string>('browser');
  const [online, setOnline] = useState<boolean>(true);
  const [swRegistered, setSwRegistered] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [updating, setUpdating] = useState<boolean>(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [showNotificationHelp, setShowNotificationHelp] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [showInstallSuccess, setShowInstallSuccess] = useState<boolean>(false);
  
  // PWA durumunu tespit et
  const isPWA = displayMode === 'standalone' || displayMode === 'standalone-ios';
  
  // iOS tespiti
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  
  // Durumları yükle
  useEffect(() => {
    const loadStatus = async () => {
      // PWA durumunu kontrol et
      const mode = getDisplayMode();
      setDisplayMode(mode);
      
      // Çevrimiçi durumunu kontrol et
      setOnline(isOnline());
      
      // Service Worker kaydını kontrol et
      const registration = await checkServiceWorkerRegistration();
      setSwRegistered(!!registration);
      
      // Güncelleme var mı kontrol et
      if (registration) {
        const hasUpdate = await checkForUpdates(registration);
        setUpdateAvailable(hasUpdate);
      }
      
      // Bildirim izinlerini kontrol et
      const permission = await checkNotificationPermission();
      setNotificationPermission(permission);

      // Uygulama yüklenebilir mi kontrol et
      if (mode === 'browser') {
        const installable = await checkInstallConditions();
        setCanInstall(installable);
      }
    };
    
    loadStatus();
    
    // Güncellemeleri sürekli dinle
    const cleanupListener = listenForUpdates(() => {
      // Yeni bir güncelleme bulunduğunda
      setUpdateAvailable(true);
    });
    
    // Çevrimiçi/çevrimdışı durumunu dinle
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Bildirim kontrolünü başlat
    startAppointmentChecker();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanupListener(); // Dinleyiciyi temizle
    };
  }, []);
  
  // Uygulamayı güncelle
  const handleUpdateApp = async () => {
    setUpdating(true);
    try {
      // Bekleyen güncellemeleri etkinleştir
      const activated = await activateUpdate();
      
      if (activated) {
        // Etkinleştirme başarılı, controllerchange olayı sayfayı otomatik olarak yenileyecek
        setShowUpdateSuccess(true);
      } else {
        // Etkinleştirme başarısız, manuel güncelleme dene
        await updateServiceWorker();
        
        setTimeout(() => {
          setUpdating(false);
          setShowUpdateSuccess(true);
          // 3 saniye sonra otomatik olarak sayfayı yenile
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }, 1000);
      }
    } catch (error) {
      console.error('Uygulama güncellenirken hata oluştu:', error);
      setUpdating(false);
    }
  };
  
  // Bildirim izni iste
  const handleRequestNotifications = async () => {
    if (notificationPermission === 'denied') {
      // İzin reddedilmişse, tarayıcı ayarlarına yönlendirme modalı göster
      setShowNotificationHelp(true);
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationPermission('granted');
      }
    }
  };

  // Tarayıcı ayarlarına yönlendir
  const openBrowserSettings = () => {
    // Farklı tarayıcılar için ayarlar sayfası
    const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
    const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
    const isEdge = navigator.userAgent.indexOf("Edg") > -1;
    const isSafari = navigator.userAgent.indexOf("Safari") > -1 && !isChrome;

    let settingsURL = '';
    
    if (isChrome) {
      settingsURL = 'chrome://settings/content/notifications';
    } else if (isEdge) {
      settingsURL = 'edge://settings/content/notifications';
    } else if (isFirefox) {
      settingsURL = 'about:preferences#privacy';
    } else if (isSafari) {
      // Safari için doğrudan link yok, açıklamalar gösterilecek
      setShowNotificationHelp(true);
      return;
    }
    
    if (settingsURL) {
      // Tarayıcı ayarlarına yönlendir
      try {
        // Chrome, Edge gibi bazı tarayıcılarda güvenlik nedeniyle direkt açılamaz
        window.open(settingsURL, '_blank');
      } catch (e) {
        // Hata durumunda yardım modalını göster
        setShowNotificationHelp(true);
      }
    } else {
      // Desteklenmeyen tarayıcılar için yardım modalını göster
      setShowNotificationHelp(true);
    }
  };

  // Uygulamayı yükle
  const handleInstallApp = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      const installed = await showInstallPrompt();
      if (installed) {
        // Başarılı yükleme sonrası
        setCanInstall(false);
        // Başarılı kurulum bildirimi göster
        setShowInstallSuccess(true);
        setTimeout(() => {
          setShowInstallSuccess(false);
          window.location.reload();
        }, 3000);
      }
    }
  };
  
  // PWA kurulum yönergeleri
  const renderInstallInstructions = () => {
    if (isPWA) {
      return (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-300">Kurulum Tamamlandı</h4>
              <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                PsikoRan şu anda ana ekranınıza kurulmuş ve uygulamanın tüm özelliklerini kullanabilirsiniz.
              </p>
              <div className="mt-2 text-xs flex items-center text-green-700 dark:text-green-400">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Artık uygulamayı ana ekranınızdan açabilirsiniz
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (showIOSInstructions && isIOS) {
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
    }
    
    if (canInstall && !isPWA) {
      return (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Telefon/Bilgisayar Ana Ekranınıza Ekleyin</h4>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                PsikoRan'ı cihazınıza kurarak daha hızlı erişebilir ve internet bağlantınız olmadığında bile kullanabilirsiniz.
              </p>
              <button
                onClick={handleInstallApp}
                className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Uygulamayı Yükle
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Telefon/Bilgisayar Ana Ekranınıza Ekleyin</h4>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
              Sayfanın altında görünen "PsikoRan'ı Yükleyin" seçeneğine tıklayarak uygulamayı telefonunuzun ana ekranına veya bilgisayarınıza ekleyebilirsiniz. Böylece daha hızlı erişebilir ve internet bağlantınız olmadığında bile kullanabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Başarılı güncelleme mesajı
  const renderUpdateSuccessMessage = () => {
    if (!showUpdateSuccess) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-center text-slate-900 dark:text-white mb-2">Uygulama Güncellendi!</h3>
          <p className="text-center text-slate-600 dark:text-slate-300 mb-5">
            PsikoRan uygulamanız başarıyla güncellendi. En son özellikleri ve iyileştirmeleri kullanabilirsiniz.
          </p>
          <div className="flex justify-center">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full progress-bar" style={{width: '100%'}}></div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
            Sayfa otomatik olarak yenileniyor...
          </p>
        </div>
      </div>
    );
  };
  
  // Bildirim izinleri yardım modalı
  const renderNotificationHelpModal = () => {
    if (!showNotificationHelp) return null;
    
    // Tarayıcıya göre özel yönergeler
    const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
    const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
    const isEdge = navigator.userAgent.indexOf("Edg") > -1;
    const isSafari = navigator.userAgent.indexOf("Safari") > -1 && !isChrome;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Bildirim İzinlerini Etkinleştirme</h3>
            <button 
              onClick={() => setShowNotificationHelp(false)}
              className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            <p className="mb-3">Bildirim izinlerini tarayıcı ayarlarınızdan değiştirmeniz gerekiyor:</p>
            
            {isChrome && (
              <ol className="list-decimal pl-5 space-y-1">
                <li>Adres çubuğunun solundaki kilit ikonuna tıklayın</li>
                <li>"Site Ayarları"nı seçin</li>
                <li>"Bildirimler" ayarını "İzin Ver" olarak değiştirin</li>
                <li>Sayfayı yenileyin</li>
              </ol>
            )}
            
            {isFirefox && (
              <ol className="list-decimal pl-5 space-y-1">
                <li>Adres çubuğunun solundaki i veya kilit ikonuna tıklayın</li>
                <li>"İzinleri Düzenle" -&gt; "Bildirimler"i seçin</li>
                <li>"İzin Ver" seçeneğini işaretleyin</li>
                <li>Sayfayı yenileyin</li>
              </ol>
            )}
            
            {isEdge && (
              <ol className="list-decimal pl-5 space-y-1">
                <li>Adres çubuğunun solundaki kilit ikonuna tıklayın</li>
                <li>"Site izinleri"ni seçin</li>
                <li>"Bildirimler" ayarını değiştirin</li>
                <li>Sayfayı yenileyin</li>
              </ol>
            )}
            
            {isSafari && (
              <ol className="list-decimal pl-5 space-y-1">
                <li>Safari &gt; Tercihler &gt; Web Siteleri &gt; Bildirimler'e gidin</li>
                <li>PsikoRan web sitesini bulun ve izin verin</li>
                <li>Sayfayı yenileyin</li>
              </ol>
            )}
            
            {!isChrome && !isFirefox && !isEdge && !isSafari && (
              <ol className="list-decimal pl-5 space-y-1">
                <li>Tarayıcınızın site ayarlarını açın</li>
                <li>Bildirim izinleri bölümünü bulun</li>
                <li>PsikoRan için izni "İzin Ver" olarak değiştirin</li>
                <li>Sayfayı yenileyin</li>
              </ol>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowNotificationHelp(false)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-800"
            >
              Anladım
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Başarılı kurulum mesajı
  const renderInstallSuccessMessage = () => {
    if (!showInstallSuccess) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-center text-slate-900 dark:text-white mb-2">PsikoRan Kuruldu!</h3>
          <p className="text-center text-slate-600 dark:text-slate-300 mb-5">
            PsikoRan artık cihazınıza kuruldu. Ana ekranınızdan uygulamaya hızlıca erişebilirsiniz.
          </p>
          <div className="flex justify-center">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full progress-bar" style={{width: '100%'}}></div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
            Ana ekranınızdan yüklenen uygulamayı açabilirsiniz...
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {renderUpdateSuccessMessage()}
      {renderNotificationHelpModal()}
      {renderInstallSuccessMessage()}
      
      <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
          <Smartphone className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
          Uygulama Ayarları
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          PsikoRan uygulamanızı cihazınıza kurun ve mobil uygulama gibi kullanın
        </p>
      </div>
      
      {/* Ana Kurulum Butonu - PWA değilse ve kurulabiliyorsa göster */}
      {!isPWA && canInstall && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-800/30 p-2 rounded-full">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
      
      <div className="space-y-4">
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
            </div>
            
            <div className="mt-5">
              {updateAvailable ? (
                <button
                  onClick={handleUpdateApp}
                  disabled={updating || !swRegistered}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    updating 
                      ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-800'
                  }`}
                >
                  {updating ? (
                    <>
                      <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                      Yeni Sürümü Yükle
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Uygulama Güncel
                </div>
              )}
              <p className="mt-2 text-xs text-center text-slate-500 dark:text-slate-400">
                {updateAvailable 
                  ? 'Uygulamanızın yeni bir sürümü mevcut' 
                  : 'Tüm son özellikler ve iyileştirmelere erişebilirsiniz'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Bildirim İzinleri Kartı - Ayrı bir kart olarak */}
        <div className="bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-medium text-slate-900 dark:text-white mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
              Bildirim Ayarları
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                PsikoRan'dan randevu hatırlatıcıları, mesajlar ve diğer önemli bilgileri alabilmeniz için bildirim izinlerini etkinleştirin.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  notificationPermission === 'granted'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : notificationPermission === 'denied'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  <Bell className={`h-5 w-5 ${
                    notificationPermission === 'granted'
                      ? 'text-green-600 dark:text-green-400'
                      : notificationPermission === 'denied'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Bildirim Durumu: 
                    <span className={`ml-1 ${
                      notificationPermission === 'granted'
                        ? 'text-green-600 dark:text-green-400'
                        : notificationPermission === 'denied'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {notificationPermission === 'granted' 
                        ? 'İzin Verildi' 
                        : notificationPermission === 'denied'
                          ? 'Reddedildi'
                          : 'İzin Verilmedi'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {notificationPermission === 'granted'
                      ? 'Randevu hatırlatıcıları ve diğer bildirimler alacaksınız'
                      : notificationPermission === 'denied'
                        ? 'Bildirim izni tarayıcı ayarlarından düzenlenebilir'
                        : 'Bildirimlere izin vererek önemli hatırlatıcılar alın'}
                  </p>
                </div>
              </div>
              
              {notificationPermission !== 'granted' && (
                <button
                  onClick={notificationPermission === 'denied' ? openBrowserSettings : handleRequestNotifications}
                  className={`ml-4 px-4 py-2 rounded-md text-white text-sm font-medium flex items-center ${
                    notificationPermission === 'denied'
                      ? 'bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700'
                      : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:ring-primary-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
                >
                  <Bell className="mr-1.5 h-4 w-4" />
                  {notificationPermission === 'denied' ? 'Tarayıcı Ayarlarına Git' : 'İzin Ver'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* PWA Kurulum Talimatları */}
        {renderInstallInstructions()}
        
        {/* Özellikler Bilgi Kartı */}
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
                    <span className="font-medium">İnternetsiz Çalışma</span> - İnternet bağlantınız olmadığında bile uygulamayı kullanabilirsiniz
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
                    <span className="font-medium">Daima Güncel</span> - Uygulama otomatik olarak güncel kalır, her zaman son özelliklere erişirsiniz
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes progress {
          0% { width: 0% }
          10% { width: 10% }
          50% { width: 50% }
          100% { width: 100% }
        }
        .progress-bar {
          animation: progress 3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PWASettings; 