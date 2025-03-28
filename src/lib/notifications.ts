import { supabase } from './supabase';

export async function requestNotificationPermission(
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
): Promise<boolean> {
  try {
    // Bildirim desteği şu an devre dışı
    // console.log('Bildirim desteği şu anda devre dışı bırakıldı.');
    return false;
  } catch (error) {
    // console.error('Bildirim izni alınırken hata:', error);
    return false;
  }
}

export async function sendNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    // Notification API'sini kullan
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/images/icons/icon-192x192.webp',
        badge: '/images/icons/badge-72x72.webp',
        data: data || {}
      });
      
      // Bildirime tıklandığında URL'ye yönlendir
      notification.onclick = function() {
        if (data && data.url) {
          window.focus();
          window.location.href = data.url;
        }
      };
      
      // console.log('Bildirim gönderildi:', { title, body });
      return true;
    } else {
      // console.log('Bildirim gösterilemedi: İzin verilmemiş veya API desteklenmiyor');
      return false;
    }
  } catch (error) {
    // console.error('Bildirim gönderilirken hata:', error);
    return false;
  }
} 