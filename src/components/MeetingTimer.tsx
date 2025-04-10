import React, { useState, useEffect } from 'react';
import { sendNotification } from '../utils/notificationUtils';
import { useAuth } from '../lib/auth';

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
  const [notified50Min, setNotified50Min] = useState<boolean>(false);
  const [notified55Min, setNotified55Min] = useState<boolean>(false);
  const { user, professional, assistant } = useAuth();

  useEffect(() => {
    // Görüşme başlangıç zamanından şimdiki zamana kadar geçen süre (saniye)
    const initialElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    setElapsedTime(initialElapsed > 0 ? initialElapsed : 0);

    // Zamanlayıcıyı başlat
    const timerInterval = setInterval(() => {
      const newElapsedTime = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedTime(newElapsedTime);
      
      // Seans süresi bildirimleri
      const elapsedMinutes = Math.floor(newElapsedTime / 60);
      
      // 50 dakika bildirim kontrolü
      if (elapsedMinutes >= 50 && elapsedMinutes < 51 && !notified50Min) {
        sendSessionNotification(10); // 10 dakika kaldı bildirimi
        setNotified50Min(true);
      }
      
      // 55 dakika bildirim kontrolü
      if (elapsedMinutes >= 55 && elapsedMinutes < 56 && !notified55Min) {
        sendSessionNotification(5); // 5 dakika kaldı bildirimi
        setNotified55Min(true);
      }
    }, 1000);

    // Bileşenden çıkıldığında zamanlayıcıyı temizle
    return () => clearInterval(timerInterval);
  }, [startTime, notified50Min, notified55Min]);

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

  return (
    <div className="font-mono text-sm flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <span>Geçen: {formatTime(elapsedTime)}</span>
        <span>Kalan: {getRemainingTime()}</span>
      </div>
      
      {/* İlerleme çubuğu */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            calculateProgress() < 80 
              ? 'bg-green-500 dark:bg-green-600' 
              : calculateProgress() < 95 
              ? 'bg-yellow-500 dark:bg-yellow-600' 
              : 'bg-red-500 dark:bg-red-600'
          }`} 
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>
    </div>
  );
};

export default MeetingTimer; 