import React, { useState, useEffect } from 'react';

interface MeetingTimerProps {
  startTime: Date;
}

const MeetingTimer: React.FC<MeetingTimerProps> = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    // Görüşme başlangıç zamanından şimdiki zamana kadar geçen süre (saniye)
    const initialElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    setElapsedTime(initialElapsed > 0 ? initialElapsed : 0);

    // Zamanlayıcıyı başlat
    const timerInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Bileşenden çıkıldığında zamanlayıcıyı temizle
    return () => clearInterval(timerInterval);
  }, [startTime]);

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

  return (
    <div className="font-mono text-sm">
      {formatTime(elapsedTime)}
    </div>
  );
};

export default MeetingTimer; 