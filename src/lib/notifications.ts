import { supabase } from './supabase';

export async function requestNotificationPermission(
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
): Promise<boolean> {
  try {
    // Tarayıcı desteğini kontrol et
    if (!('Notification' in window)) {
      console.error('Bu tarayıcı bildirim desteği sunmuyor');
      return false;
    }

    // Service Worker desteğini kontrol et
    if (!('serviceWorker' in navigator)) {
      console.error('Bu tarayıcı Service Worker desteği sunmuyor');
      return false;
    }

    // Bildirim izni iste
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Bildirim izni reddedildi');
      return false;
    }

    // Service Worker'ı kaydet
    const registration = await navigator.serviceWorker.ready;

    // Push aboneliği oluştur
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });

    // Aboneliği veritabanına kaydet
    const { error } = await supabase
      .from('notification_subscriptions')
      .insert([
        {
          user_id: userId,
          user_type: userType,
          endpoint: subscription.endpoint,
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
        }
      ]);

    if (error) {
      console.error('Abonelik kaydedilirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bildirim izni alınırken hata:', error);
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
    const { error } = await supabase.functions.invoke('send-notification', {
      body: {
        userId,
        notification: {
          title,
          body,
          data
        }
      }
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Bildirim gönderilirken hata:', error);
    return false;
  }
} 