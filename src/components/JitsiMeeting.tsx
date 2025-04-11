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
  const isMobile = window.innerWidth < 768;
  
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
    
    // Mod seçim ekranını kapat
    setShowModeSelection(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    if (props.onClose) props.onClose();
  };

  // Görüşme mod seçim ekranını göster
  const showJitsiOptions = () => {
    // Mobil cihazlarda otomatik olarak uygun modu seçelim
    if (isMobile) {
      // Mobil cihazlarda genellikle harici mod daha iyi çalışır
      startMeeting('external');
    } else {
      setShowModeSelection(true);
    }
  };

  // Seçim menüsü
  if (showModeSelection) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-blue-900/95 to-indigo-900/95 rounded-xl p-6 max-w-md w-full text-white shadow-xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Görüşme Katılım Seçenekleri</h2>
            <button 
              onClick={() => setShowModeSelection(false)}
              className="p-2 rounded-full hover:bg-black/20 transition-colors"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div 
              className="bg-black/20 hover:bg-black/30 rounded-lg p-4 cursor-pointer transition-all transform hover:scale-[1.02] border border-white/5 shadow-md"
              onClick={() => startMeeting('embedded')}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <Video className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Bu Pencerede Katıl</h3>
                  <p className="text-sm text-blue-200">Görüşme bu sayfada gömülü olarak açılır</p>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-black/20 hover:bg-black/30 rounded-lg p-4 cursor-pointer transition-all transform hover:scale-[1.02] border border-white/5 shadow-md"
              onClick={() => startMeeting('external')}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <ExternalLink className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Yeni Sekmede Katıl</h3>
                  <p className="text-sm text-blue-200">Görüşme yeni bir browser sekmesinde açılır</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-blue-200 bg-blue-800/40 p-3 rounded-lg border border-blue-700/30">
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
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Görüşmeye Katıl"
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
      // Başarılı yüklemeyi oturum depolamasında sakla
      sessionStorage.setItem('jitsiApiLoaded', 'true');
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
          // Performans iyileştirmeleri
          resolution: 720,
          constraints: {
            video: {
              height: {
                ideal: 720,
                max: 720,
                min: 240
              }
            }
          },
          // Düşük bant genişliği optimizasyonu
          enableLayerSuspension: true,
          p2p: {
            enabled: true,
            preferH264: true,
            disableH264: false
          },
          // Toplantı optimizasyonları
          disableAudioLevels: true,
          enableNoAudioDetection: false,
          enableNoisyMicDetection: true,
          startSilent: false
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
          // UI iyileştirmeleri
          DEFAULT_BACKGROUND: '#1A1B1D',
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
          VERTICAL_FILMSTRIP: true,
          CLOSE_PAGE_GUEST_HINT: false,
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
          VIDEO_LAYOUT_FIT: 'both'
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

      // Yeni olay dinleyicileri
      jitsiApi.addListener('participantJoined', (participant) => {
        console.log('Katılımcı katıldı:', participant);
      });

      jitsiApi.addListener('videoQualityChanged', (quality) => {
        console.log('Video kalitesi değişti:', quality);
      });

      jitsiApi.addListener('cameraError', (error) => {
        console.error('Kamera hatası:', error);
      });

      jitsiApi.addListener('micError', (error) => {
        console.error('Mikrofon hatası:', error);
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
  const isMobile = window.innerWidth < 768; // Mobil cihaz kontrolü
  
  const containerStyles = {
    width: isFullscreen || isMobile ? '100vw' : width,
    height: isFullscreen || isMobile ? '100vh' : height,
    position: 'fixed' as 'fixed',
    top: isFullscreen || isMobile ? 0 : '50%',
    left: isFullscreen || isMobile ? 0 : '50%',
    transform: isFullscreen || isMobile ? 'none' : 'translate(-50%, -50%)',
    zIndex: 99999,
    borderRadius: isFullscreen || isMobile ? 0 : '0.75rem',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    boxShadow: isFullscreen || isMobile ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  } as React.CSSProperties;

  // Jitsi container stili
  const jitsiContainerStyle = {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0, // Önemli: flex-shrink için
    position: 'relative' as const,
  };
  
  // Mobil için ekstra stiller
  const mobileHeaderStyle = isMobile ? {
    padding: '0.75rem',
  } : {};

  // Hata durumunda yedek görünümü göster
  if (showFallback) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 99999 }}>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center" style={{ zIndex: 99999 }}>
      <div 
        className="jitsi-meeting-container overflow-hidden bg-gradient-to-br from-blue-900/90 to-indigo-900/90 shadow-2xl rounded-xl dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-gray-800/90"
        style={containerStyles}
      >
        {/* Başlık bar - Mobil dostu */}
        <div className="bg-black/30 backdrop-blur-sm flex justify-between items-center" style={mobileHeaderStyle}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 flex items-center justify-center mr-2 shadow-lg">
              <Video className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-white dark:text-gray-100 truncate" style={{ maxWidth: isMobile ? '160px' : '300px' }}>
              Görüşme: {roomName}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Bağlantı durumu göstergesi */}
            <div className="hidden md:flex items-center mr-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              <span className="text-xs text-green-300">Bağlı</span>
            </div>
            
            {/* Butonlar */}
            <button
              onClick={toggleFullscreen}
              className="bg-gray-800/70 hover:bg-gray-700 dark:bg-gray-700/70 dark:hover:bg-gray-600 text-white p-2 rounded-lg text-sm transition-colors shadow-md"
              title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran yap"}
              aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekran yap"}
            >
              <Maximize className="h-5 w-5" />
            </button>
            
            <button 
              onClick={onClose}
              className="bg-red-600/90 hover:bg-red-700 dark:bg-red-500/90 dark:hover:bg-red-600 text-white p-2 rounded-lg text-sm transition-colors shadow-md"
              title="Görüşmeyi Sonlandır"
              aria-label="Görüşmeyi Sonlandır"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Yükleniyor veya Jitsi Görüşmesi */}
        {!isApiReady ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white dark:text-gray-100">
            <div className="w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-semibold animate-pulse">Görüşme hazırlanıyor...</p>
            <p className="text-sm mt-2 text-blue-200 dark:text-blue-300 max-w-md text-center">
              Bu işlem tarayıcı güvenlik ayarlarınıza bağlı olarak biraz zaman alabilir. Lütfen bekleyin.
            </p>
          </div>
        ) : (
          <>
            <div ref={jitsiContainerRef} style={jitsiContainerStyle}></div>
            
            {/* Mobil için ekstra kontroller - ekranın altında */}
            {isMobile && (
              <div className="bg-black/50 backdrop-blur-sm py-2 px-4 flex justify-center">
                <div className="flex space-x-3">
                  <button 
                    onClick={() => api?.executeCommand('toggleAudio')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white"
                    aria-label="Mikrofonu Aç/Kapat"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  
                  <button 
                    onClick={() => api?.executeCommand('toggleVideo')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white"
                    aria-label="Kamerayı Aç/Kapat"
                  >
                    <Video className="h-5 w-5" />
                  </button>
                  
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white"
                    aria-label="Görüşmeyi Sonlandır"
                  >
                    <Phone className="h-5 w-5 transform rotate-135" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export { JitsiMeeting };
export default JitsiMeetingLauncher;