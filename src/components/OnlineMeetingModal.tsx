import React, { useState, useEffect } from 'react';
import { X } from 'react-feather';
import JitsiMeeting from './JitsiMeeting';

interface OnlineMeetingModalProps {
  show: boolean;
  onHide: () => void;
  meetingUrl?: string;
  appointmentDetails?: any;
}

const OnlineMeetingModal: React.FC<OnlineMeetingModalProps> = ({
  show,
  onHide,
  meetingUrl,
  appointmentDetails,
}) => {
  const [modalKey, setModalKey] = useState<number>(0);
  
  // Modal her açıldığında yeni bir key üret, bu sayede component yeniden render edilir
  useEffect(() => {
    if (show) {
      setModalKey(prev => prev + 1);
    }
  }, [show]);
  
  // JitsiMeet roomName'ini URL'den çıkar
  const extractRoomName = (url?: string): string => {
    if (!url) return '';
    
    try {
      // URL formatında ise
      if (url.startsWith('http')) {
        const urlObj = new URL(url);
        // Son path segment'ı al (örn: https://meet.jit.si/odaismi -> odaismi)
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        return pathParts[pathParts.length - 1] || '';
      } 
      // Direkt oda ismi ise
      return url;
    } catch (error) {
      console.error('Meeting URL çözümlenirken hata:', error);
      return url;
    }
  };

  const roomName = extractRoomName(meetingUrl);
  
  // istemci adını tanımla
  const clientName = appointmentDetails?.client_name || 'Misafir';

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Çevrimiçi Görüşme</h3>
          <button 
            onClick={onHide}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-0" key={`meeting-content-${modalKey}`}>
          {roomName ? (
            <JitsiMeeting
              roomName={roomName}
              displayName={clientName}
              height="60vh"
              onClose={onHide}
            />
          ) : (
            <div className="p-5 text-center">
              <p className="text-red-500">Geçerli bir toplantı URL'si bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineMeetingModal; 