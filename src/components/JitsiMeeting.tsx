import React, { useEffect, useRef, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Monitor, MessageSquare, Phone, ExternalLink } from 'react-feather';

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
}

const JitsiMeeting: React.FC<JitsiMeetingProps> = ({
  roomName,
  displayName = '',
  width = '100%',
  height = '600px',
  userInfo,
  onClose,
}) => {
  // Yeni sekmede açma fonksiyonu
  const openInNewTab = () => {
    const url = `https://meet.jit.si/${roomName}`;
    window.open(url, '_blank');
  };

  // Yeni sekmede açılacak URL'yi hazırla
  const getJitsiUrl = () => {
    const domain = 'meet.jit.si';
    let url = `https://${domain}/${roomName}?`;
    
    // Parametreleri ekle
    const params = new URLSearchParams();
    
    // Kullanıcı bilgileri ekle
    if (userInfo?.displayName || displayName) {
      params.append('userInfo.displayName', userInfo?.displayName || displayName);
    }
    if (userInfo?.email) {
      params.append('userInfo.email', userInfo.email);
    }
    
    // Otomatik katılım için
    params.append('config.prejoinPageEnabled', 'false');
    params.append('config.startWithAudioMuted', 'false');
    params.append('config.startWithVideoMuted', 'false');
    params.append('config.disableDeepLinking', 'true');
    
    // UI ayarları
    params.append('interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS', 'true');
    params.append('interfaceConfig.MOBILE_APP_PROMO', 'false');
    params.append('interfaceConfig.SHOW_CHROME_EXTENSION_BANNER', 'false');
    params.append('interfaceConfig.HIDE_INVITE_MORE_HEADER', 'true');
    
    return url + params.toString();
  };

  return (
    <div 
      className="jitsi-meeting-container rounded-xl overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 text-white flex flex-col"
      style={{ width, height }}
    >
      {/* Başlık */}
      <div className="bg-black/30 p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Görüşme Odası: {roomName}</h3>
          <p className="text-sm text-blue-200">
            {userInfo?.displayName || displayName}
          </p>
        </div>
        <button
          onClick={openInNewTab}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          title="Yeni sekmede aç"
        >
          <ExternalLink className="mr-2 h-5 w-5" />
          <span>Yeni Sekmede Aç</span>
        </button>
      </div>
      
      {/* Ana içerik */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-black/20 rounded-2xl p-8 max-w-lg w-full">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-12 h-12" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Görüşme Hazır</h2>
          <div className="text-blue-200 space-y-4 mb-8">
            <p>
              Jitsi Meet üzerinden çevrimiçi görüşmeniz hazır. Güvenlik nedeniyle görüşme doğrudan burada gösterilemiyor.
            </p>
            <p className="text-sm bg-blue-800/30 p-3 rounded-lg">
              <strong>Oda Bilgisi:</strong> {roomName}
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={openInNewTab}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Görüşmeye Katıl
            </button>
            
            <button 
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white/90 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Phone className="mr-2 h-5 w-5 transform rotate-135" />
              İptal Et
            </button>
          </div>
        </div>
      </div>
      
      {/* Alt Kontroller */}
      <div className="bg-black/30 p-4 flex justify-between items-center">
        <div className="text-sm text-blue-200">
          <span>Görüşmeyi daha sonra başlatmak için pencerenizi kapatabilirsiniz.</span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={onClose}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors flex items-center"
          >
            <Phone className="h-5 w-5 transform rotate-135" />
            <span className="sr-only">Kapat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JitsiMeeting; 