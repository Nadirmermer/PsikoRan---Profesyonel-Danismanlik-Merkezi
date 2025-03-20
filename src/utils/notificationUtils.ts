import { supabase } from '../lib/supabase';
import { addDays, addHours, addMinutes, format, isAfter, isBefore } from 'date-fns';
import { tr } from 'date-fns/locale';

// Bildirimleri kaydetmek için bir fonksiyon
export async function saveNotificationSubscription(
  subscription: PushSubscription,
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
) {
  try {
    // Aboneliği veritabanına kaydet
    const { error } = await supabase.from('notification_subscriptions').upsert({
      user_id: userId,
      user_type: userType,
      subscription: JSON.stringify(subscription),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Bildirim aboneliği kaydedilirken hata oluştu:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bildirim aboneliği kaydedilirken hata oluştu:', error);
    return false;
  }
}

// Bildirim aboneliğini silmek için bir fonksiyon
export async function deleteNotificationSubscription(subscriptionId: string) {
  try {
    const { error } = await supabase
      .from('notification_subscriptions')
      .delete()
      .eq('id', subscriptionId);
    
    if (error) {
      console.error('Bildirim aboneliği silinirken hata oluştu:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Bildirim aboneliği silinirken hata oluştu:', error);
    return false;
  }
}

// Kullanıcının tüm bildirim aboneliklerini silmek için bir fonksiyon
export async function deleteAllNotificationSubscriptions(userId: string) {
  try {
    const { error } = await supabase
      .from('notification_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Bildirim abonelikleri silinirken hata oluştu:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Bildirim abonelikleri silinirken hata oluştu:', error);
    return false;
  }
}

// Kullanıcıdan bildirim izni iste
export async function requestNotificationPermission(
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
) {
  try {
    // Bildirimlere izin kontrolü yap
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirimleri desteklemiyor');
      return false;
    }

    // Eğer izin durumu zaten 'granted' ise
    if (Notification.permission === 'granted') {
      // Service worker'ı kaydet ve bildirim aboneliği oluştur
      return subscribeUserToPush(userId, userType);
    }

    // İzin iste
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Service worker'ı kaydet ve bildirim aboneliği oluştur
      return subscribeUserToPush(userId, userType);
    } else {
      console.warn('Bildirim izni verilmedi');
      return false;
    }
  } catch (error) {
    console.error('Bildirim izni istenirken hata oluştu:', error);
    return false;
  }
}

// Kullanıcıyı push bildirimlerine abone et
async function subscribeUserToPush(
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
) {
  try {
    // Service worker'ı kontrol et
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker desteklenmiyor');
      return false;
    }

    // Kayıtlı service worker'ları al
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length === 0) {
      console.warn('Kayıtlı service worker bulunamadı');
      return false;
    }

    // İlk service worker'ı kullan
    const registration = registrations[0];

    // VAPID public key (güvenli olmayan bir şekilde hard-coded, gerçek uygulama için güvenli bir şekilde saklanmalı)
    const vapidPublicKey = 'BIBfHLQ0WJB3Qg-9eBSJW9Iwy9HmGQVKmHXNCOwcZCHCWiRtAH6WQBw2Gh2cInH_3QIAUaKxl5hGj0VhvCH4VKk';
    
    // Public key'i Uint8Array'e çevir
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    
    // Push aboneliği oluştur
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    // Aboneliği veritabanına kaydet
    return saveNotificationSubscription(subscription, userId, userType);
  } catch (error) {
    console.error('Push aboneliği oluşturulurken hata oluştu:', error);
    return false;
  }
}

// Kullanıcının bildirim aboneliklerini getir
export async function getUserNotificationSubscriptions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Bildirim abonelikleri alınırken hata oluştu:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Bildirim abonelikleri alınırken hata oluştu:', error);
    return null;
  }
}

// Base64 string'i Uint8Array'e çeviren yardımcı fonksiyon
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Bildirim içeriği oluştur
export function createReminderNotificationContent(appointment: any) {
  const appointmentTime = new Date(appointment.start_time);
  const formattedDate = format(appointmentTime, 'PPP', { locale: tr });
  const formattedTime = format(appointmentTime, 'HH:mm', { locale: tr });
  
  return {
    title: 'Yaklaşan Randevu Hatırlatması',
    body: `${formattedDate} tarihinde saat ${formattedTime}'de ${appointment.client?.full_name} ile randevunuz var.`,
    icon: '/app-logo-md.png',
    badge: '/favicon.svg',
    data: {
      url: '/appointments',
      appointmentId: appointment.id
    }
  };
}

// Yaklaşan randevuları kontrol et ve bildirim gönder (client tarafında)
export async function checkUpcomingAppointments(userId: string, userType: 'professional' | 'assistant') {
  try {
    // Şu anki zamanı al
    const now = new Date();
    
    // Sonraki 24 saat içindeki randevuları kontrol et
    const tomorrow = addHours(now, 24);
    
    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:clients(
          id,
          full_name,
          email,
          phone
        ),
        professional:professionals(
          id,
          full_name,
          email,
          phone
        ),
        room:rooms(
          id,
          name
        )
      `)
      .gte('start_time', now.toISOString())
      .lte('start_time', tomorrow.toISOString())
      .eq('status', 'scheduled');
    
    // Kullanıcı tipine göre sorguyu filtrele
    if (userType === 'professional') {
      query = query.eq('professional_id', userId);
    } else if (userType === 'assistant') {
      // Asistanın yönettiği tüm profesyonellere ait randevuları getir
      const { data: professionalIds } = await supabase
        .from('professionals')
        .select('id')
        .eq('assistant_id', userId);
      
      if (professionalIds && professionalIds.length > 0) {
        query = query.in('professional_id', professionalIds.map(p => p.id));
      }
    }
    
    const { data: appointments, error } = await query;
    
    if (error) {
      console.error('Yaklaşan randevular kontrol edilirken hata oluştu:', error);
      return;
    }
    
    // Gösterilecek bildirimleri belirle
    if (appointments && appointments.length > 0) {
      for (const appointment of appointments) {
        const appointmentTime = new Date(appointment.start_time);
        
        // Randevuya 1 saat kala bildirim gönder
        const oneHourBefore = addHours(appointmentTime, -1);
        
        // Eğer şu anki zaman ile randevuya 1 saat kala arasındaysa bildirim gönder
        if (isAfter(now, addMinutes(oneHourBefore, -5)) && isBefore(now, addMinutes(oneHourBefore, 5))) {
          // Bildirim içeriğini oluştur
          const notificationContent = createReminderNotificationContent(appointment);
          
          // Eğer tarayıcıda değilsek ve bildirim izni varsa bildirim göster
          if (Notification.permission === 'granted' && document.visibilityState !== 'visible') {
            new Notification(notificationContent.title, {
              body: notificationContent.body,
              icon: notificationContent.icon,
              badge: notificationContent.badge,
              data: notificationContent.data
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Yaklaşan randevular kontrol edilirken hata oluştu:', error);
  }
} 