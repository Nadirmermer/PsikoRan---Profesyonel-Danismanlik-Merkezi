import React, { useEffect, useRef, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Monitor, MessageSquare, Phone, ExternalLink, Maximize, X, AlertTriangle } from 'react-feather';

// Jitsi Meet API'si için tiplemeler
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetingProps {
  roomName: string;
  displayName?: string;
  width?: string | number;
  height?: string | number;
  userInfo?: {
    displayName: string;
    email?: string;
  };
  requireDisplayName?: boolean;
  onClose?: () => void;
  preferredMode?: 'embedded' | 'external'; // Tercih edilen mod parametresi
  isOpen: boolean; // Modal açık mı kapalı mı
}

// Jitsi toplantı modalını açmak için bir wrapper bileşen
export const JitsiMeetingLauncher: React.FC<Omit<JitsiMeetingProps, 'isOpen'>> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'embedded' | 'external'>(props.preferredMode || 'embedded');
  const [showModeSelection, setShowModeSelection] = useState(false);
  
  // Toplantı başlatma fonksiyonu
  const startMeeting = (mode: 'embedded' | 'external') => {
    setDisplayMode(mode);
    
    if (mode === 'external') {
      // Doğrudan yeni sekmede aç
      const url = `https://psikoran.xyz/${props.roomName}`;
      window.open(url, '_blank');
    } else {
      // Gömülü modda modal aç
      setIsModalOpen(true);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    if (props.onClose) props.onClose();
  };

  // Görüşme mod seçim ekranını göster
  const showJitsiOptions = () => {
    setShowModeSelection(true);
  };

  // Seçim menüsü
  if (showModeSelection) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl p-6 max-w-md w-full text-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Görüşme Katılım Seçenekleri</h2>
            <button 
              onClick={() => setShowModeSelection(false)}
              className="p-2 rounded-full hover:bg-black/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4 hover:bg-black/30 cursor-pointer transition-colors"
                 onClick={() => startMeeting('embedded')}>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <Video className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Bu Pencerede Katıl</h3>
                  <p className="text-sm text-blue-200">Görüşme bu sayfada gömülü olarak açılır</p>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4 hover:bg-black/30 cursor-pointer transition-colors"
                 onClick={() => startMeeting('external')}>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <ExternalLink className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Yeni Sekmede Katıl</h3>
                  <p className="text-sm text-blue-200">Görüşme yeni bir browser sekmesinde açılır</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-blue-200 bg-blue-800/20 p-3 rounded-lg">
            <p>Not: Tarayıcı güvenlik ayarlarınız nedeniyle gömülü mod çalışmazsa, yeni sekme modu otomatik olarak açılacaktır.</p>
          </div>
        </div>
      </div>
    );
  }

  // Doğrudan "Görüşmeye Katıl" butonu
  return (
    <>
      <button 
        onClick={showJitsiOptions}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
      >
        <Video className="mr-2 h-4 w-4" />
        <span>Görüşmeye Katıl</span>
      </button>
      
      {isModalOpen && (
        <JitsiMeeting 
          {...props} 
          isOpen={isModalOpen} 
          onClose={handleClose} 
          preferredMode="embedded"
        />
      )}
    </>
  );
};

const JitsiMeeting: React.FC<JitsiMeetingProps> = ({
  roomName,
  displayName = '',
  width = '100%',
  height = '90vh',
  userInfo,
  onClose,
  preferredMode = 'embedded',
  isOpen = false
}) => {
  // Modal açık değilse render etme
  if (!isOpen) return null;
  
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Jitsi görüşmesini yeni sekmede açma fonksiyonu
  const openInNewTab = () => {
    const url = `https://psikoran.xyz/${roomName}`;
    window.open(url, '_blank');
    if (onClose) onClose();
  };

  // CSP hatası için yardımcı fonksiyon
  const detectCSPError = () => {
    // CSP hatası oluştuğunda otomatik olarak yeni sekme açma seçeneğini göster
    console.warn('Jitsi API yüklenemedi - CSP hatası olabilir. Yeni sekme yöntemini deneyeceğiz.');
    setShowFallback(true);
  };

  // Tam ekran modunu değiştirme fonksiyonu
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Jitsi API'sini yükleme
  useEffect(() => {
    // Daha önce yüklenmişse tekrar yükleme
    if (isApiReady || isApiLoading) return;
    
    // Yüklü olup olmadığını kontrol et
    if (window.JitsiMeetExternalAPI) {
      setIsApiReady(true);
      return;
    }

    // 3 denemeden sonra fallback moda geç
    if (loadAttempts >= 3) {
      console.error('Jitsi API 3 deneme sonrası yüklenemedi, fallback moda geçiliyor');
      setShowFallback(true);
      return;
    }

    setIsApiLoading(true);

    // Jitsi API script dosyasını ekle
    const script = document.createElement('script');
    script.src = 'https://psikoran.xyz/external_api.js';
    script.async = true;
    
    const onScriptLoad = () => {
      console.log('Jitsi API başarıyla yüklendi');
      setIsApiReady(true);
      setIsApiLoading(false);
    };
    
    const onScriptError = (e: Event | string) => {
      console.error('Jitsi API yüklenemedi:', e);
      setIsApiLoading(false);
      setLoadAttempts(prev => prev + 1);
      
      // Hata CSP kaynaklı olabilir
      if (e instanceof Event && (e.target as HTMLScriptElement).src.includes('psikoran.xyz')) {
        detectCSPError();
      } else {
        // Diğer hatalar için yeni yükleme denemesi yap
        setTimeout(() => {
          if (loadAttempts < 3) {
            console.log(`Jitsi API için ${loadAttempts + 1}. deneme yapılıyor...`);
          }
        }, 1000);
      }
    };
    
    script.onload = onScriptLoad;
    script.onerror = onScriptError;
    
    // Security Policy hatasını yakalamak için
    window.addEventListener('error', (e) => {
      if (e.message && (
          e.message.includes('Content Security Policy') || 
          e.message.includes('CSP')
        ) && e.filename && e.filename.includes('psikoran.xyz')
      ) {
        detectCSPError();
      }
    }, { once: true });
    
    document.body.appendChild(script);
    
    return () => {
      try {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      } catch (e) {
        console.error('Script kaldırılırken hata oluştu:', e);
      }
      
      setIsApiLoading(false);
    };
  }, [isApiReady, isApiLoading, loadAttempts]);

  // Jitsi toplantısını başlat
  useEffect(() => {
    if (!isApiReady || !jitsiContainerRef.current) return;
    
    try {
      const domain = 'psikoran.xyz';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          MOBILE_APP_PROMO: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          HIDE_INVITE_MORE_HEADER: true,
          filmStripOnly: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'settings', 'raisehand', 'videoquality', 'tileview',
            'download', 'help', 'mute-everyone', 'security'
          ],
        },
        userInfo: {
          displayName: userInfo?.displayName || displayName || 'Kullanıcı',
          email: userInfo?.email || '',
        },
      };

      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
      setApi(jitsiApi);

      // Toplantı sona erdiğinde
      jitsiApi.addListener('readyToClose', () => {
        if (onClose) onClose();
      });

      // Hata durumunda
      jitsiApi.addListener('videoConferenceJoinFailed', () => {
        console.error('Görüşmeye katılma başarısız oldu');
        setShowFallback(true);
      });

      jitsiApi.addListener('connectionFailed', () => {
        console.error('Bağlantı başarısız oldu');
        setShowFallback(true);
      });

      return () => {
        if (jitsiApi) {
          jitsiApi.dispose();
        }
      };
    } catch (error) {
      console.error('Jitsi başlatılırken hata oluştu:', error);
      setShowFallback(true);
    }
  }, [isApiReady, roomName, displayName, userInfo]);

  // Tam ekran stillerini oluştur
  const containerStyles = {
    width: isFullscreen ? '100%' : width,
    height: isFullscreen ? '100vh' : height,
    position: isFullscreen ? 'fixed' : 'fixed',
    top: isFullscreen ? 0 : '50%',
    left: isFullscreen ? 0 : '50%',
    transform: isFullscreen ? 'none' : 'translate(-50%, -50%)',
    zIndex: 9999,
    borderRadius: isFullscreen ? 0 : '0.75rem',
  } as React.CSSProperties;

  // Hata durumunda yedek görünümü göster
  if (showFallback) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div 
        className="jitsi-meeting-container overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 text-white flex flex-col rounded-2xl shadow-xl"
        style={{width: '90%', maxWidth: '600px', height: 'auto'}}
    >
      {/* Başlık */}
      <div className="bg-black/30 p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Görüşme: {roomName}</h3>
          <p className="text-sm text-blue-200">
            {userInfo?.displayName || displayName}
          </p>
        </div>
          <div className="flex items-center space-x-2">
        <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm transition-colors"
              title="Kapat"
            >
              <X className="h-5 w-5" />
        </button>
          </div>
      </div>
      
      {/* Ana içerik */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-black/20 rounded-2xl p-8 max-w-lg w-full">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
              <h2 className="text-xl font-bold mb-4">API Yükleme Hatası</h2>
          <div className="text-blue-100 space-y-4 mb-8">
            <p>
                  Tarayıcı güvenlik kısıtlamaları nedeniyle Jitsi görüşme API'si yüklenemedi. Bu geliştirme ortamında normal bir durumdur.
            </p>
            <p className="text-sm bg-blue-800/30 p-3 rounded-lg">
                  <strong>Çözüm:</strong> Görüşmeyi yeni sekmede açarak devam edebilirsiniz.
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={openInNewTab}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
                  Yeni Sekmede Aç
            </button>
            
            <button 
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white/90 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <X className="mr-2 h-5 w-5" />
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
    );
  }

  // Normal görünüm - Jitsi iFrame'i için konteyner
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="jitsi-meeting-container overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 shadow-xl rounded-xl"
        style={containerStyles}
      >
        {/* Başlık bar */}
        <div className="bg-black/30 p-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
              <Video className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-white">Görüşme: {roomName}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg text-sm transition-colors"
              title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran yap"}
            >
              <Maximize className="h-5 w-5" />
            </button>
          <button 
            onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm transition-colors"
              title="Kapat"
          >
              <X className="h-5 w-5" />
          </button>
          </div>
        </div>

        {!isApiReady ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-semibold">Görüşme hazırlanıyor...</p>
            <p className="text-sm mt-2 text-blue-200">Bu işlem tarayıcı güvenlik ayarlarınıza bağlı olarak biraz zaman alabilir.</p>
            <div className="mt-6 flex space-x-3">
              <button 
                onClick={openInNewTab}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Yeni Sekmede Aç</span>
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                <span>İptal Et</span>
              </button>
            </div>
          </div>
        ) : (
          <div ref={jitsiContainerRef} className="w-full h-full"></div>
        )}
      </div>
    </div>
  );
};

export { JitsiMeeting };
export default JitsiMeetingLauncher;