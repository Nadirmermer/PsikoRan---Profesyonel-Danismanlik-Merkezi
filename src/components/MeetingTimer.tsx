import React, { useState, useEffect, useRef } from 'react';
import { sendNotification } from '../utils/notificationUtils';
import { useAuth } from '../lib/auth';
import { Clock, BellOff, Bell } from 'react-feather'; // İkonları import et

interface MeetingTimerProps {
  startTime: Date;
  duration?: number; // Seans süresi (dakika), varsayılan 60 dakika
  appointmentId?: string; // Bildirim için kullanılacak randevu ID'si
}

const MeetingTimer: React.FC<MeetingTimerProps> = ({ 
  startTime, 
  duration = 60, // Varsayılan seans süresi: 60 dakika
  appointmentId
}) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const notified45Ref = useRef(false);
  const notified50Ref = useRef(false);
  const notified55Ref = useRef(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true); // Bildirimleri açma/kapama
  const { user, professional, assistant } = useAuth();

  useEffect(() => {
    // Görüşme başlangıç zamanından şimdiki zamana kadar geçen süre (saniye)
    const initialElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    setElapsedTime(initialElapsed > 0 ? initialElapsed : 0);

    const timerInterval = setInterval(() => {
      const newElapsedTime = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedTime(newElapsedTime);
      
      if (!notificationsEnabled) return;
      
      const elapsedMinutes = Math.floor(newElapsedTime / 60);
      
      if (elapsedMinutes >= 45 && !notified45Ref.current) {
        sendSessionNotification(15);
        notified45Ref.current = true;
      }
      
      if (elapsedMinutes >= 50 && !notified50Ref.current) {
        sendSessionNotification(10);
        notified50Ref.current = true;
      }
      
      if (elapsedMinutes >= 55 && !notified55Ref.current) {
        sendSessionNotification(5);
        notified55Ref.current = true;
      }
    }, 1000);

    // Temizleme
    return () => clearInterval(timerInterval);
  }, [startTime, notificationsEnabled]);

  // Seans süresi bildirimi gönderen fonksiyon
  const sendSessionNotification = async (remainingMinutes: number) => {
    if (!user) return;
    
    let userType: 'professional' | 'assistant' | 'client' = 'client';
    if (professional) {
      userType = 'professional';
    } else if (assistant) {
      userType = 'assistant';
    }
    
    const title = 'Seans Süresi Uyarısı';
    const body = `Seans süresinin bitmesine ${remainingMinutes} dakika kaldı.`;
    const notification = {
      title: 'Seans Sona Erdi',
      message: 'Görüşme süresi doldu. Randevu detaylarına gitmek ister misiniz?',
      // Eğer randevu id biliniyorsa randevu detayına, bilinmiyorsa randevular listesine yönlendir
      data: appointmentId 
        ? { url: `/randevu/${appointmentId}`, appointmentId }
        : { url: '/randevular' },
      sound: 'default',
      vibrate: true
    };
    
    // console.log(`Seans süresi bildirimi gönderiliyor: ${remainingMinutes} dakika kaldı`);
    await sendNotification(user.id, title, body, notification, userType);
  };

  // Bildirimleri açma/kapama
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  // Saniyeyi saat:dakika:saniye formatına dönüştür
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Sadece saat ve dakika göster (saat varsa)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Sadece dakika ve saniye göster (saat yoksa)
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Seans süresinin ne kadarının geçtiğini yüzde olarak hesapla
  const calculateProgress = () => {
    const totalSeconds = duration * 60;
    const percentage = Math.min((elapsedTime / totalSeconds) * 100, 100);
    return percentage;
  };

  // Kalan süreyi hesapla
  const getRemainingTime = () => {
    const totalSeconds = duration * 60;
    const remainingSeconds = Math.max(totalSeconds - elapsedTime, 0);
    return formatTime(remainingSeconds);
  };

  // İlerleme çubuğu rengi
  const getProgressColor = () => {
    const progress = calculateProgress();
    if (progress < 70) return 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700';
    if (progress < 90) return 'from-yellow-500 to-amber-500 dark:from-yellow-600 dark:to-amber-600';
    return 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700';
  };

  return (
    <div className="font-mono text-sm flex flex-col rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm p-3 border border-gray-200/20 dark:border-gray-700/20 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">Geçen: <span className="font-bold">{formatTime(elapsedTime)}</span></span>
        </div>
        <button
          onClick={toggleNotifications}
          title={notificationsEnabled ? "Bildirimleri Kapat" : "Bildirimleri Aç"}
          className={`p-1 rounded-full transition-colors ${
            notificationsEnabled 
              ? "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/30"
          }`}
        >
          {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 dark:text-gray-300">
          Kalan: <span className={`font-bold ${
            calculateProgress() > 90 ? 'text-red-600 dark:text-red-400 animate-pulse' : ''
          }`}>{getRemainingTime()}</span>
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(calculateProgress())}%
        </span>
      </div>
      
      {/* İlerleme çubuğu - Geliştirilmiş görünüm */}
      <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div 
          className={`h-2.5 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-300 ease-out`} 
          style={{ width: `${calculateProgress()}%` }}
        >
          {calculateProgress() > 90 && (
            <div className="h-full w-full animate-pulse opacity-80"></div>
          )}
        </div>
      </div>
      
      {/* Bildirim uyarıları */}
      {notificationsEnabled && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Bell size={12} className="mr-1" />
          <span>Bildirimler: 15, 10 ve 5 dk kala</span>
        </div>
      )}
    </div>
  );
};

export default MeetingTimer; 