import { supabase } from '../lib/supabase';
import { addDays, addHours, addMinutes, format, isAfter, isBefore } from 'date-fns';
import { tr } from 'date-fns/locale';
import logo1 from '../assets/logos/logo_1.webp';

// Bildirimleri kaydetmek için bir fonksiyon
export async function saveNotificationSubscription(
  subscription: any,
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
) {
  try {
    // Aboneliği veritabanına kaydet
    const { data, error } = await supabase
      .from('notification_subscriptions')
      .upsert({
        user_id: userId,
        user_type: userType,
        subscription: subscription,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,user_type' });

    if (error) {
      console.error('Bildirim aboneliği kaydedilirken hata oluştu:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bildirim aboneliği kaydedilirken beklenmeyen hata oluştu:', error);
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
    console.error('Bildirim aboneliği silinirken beklenmeyen hata oluştu:', error);
    return false;
  }
}

// Kullanıcının tüm bildirim aboneliklerini silmek için bir fonksiyon
export async function deleteAllNotificationSubscriptions(userId: string) {
  // Şu an devre dışı
  console.log('Bildirim silme işlemi devre dışı bırakıldı.');
  return false;
}

// Kullanıcıdan bildirim izni iste
export async function requestNotificationPermission(
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
): Promise<boolean> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.error('Tarayıcınız bildirimleri desteklemiyor.');
    return false;
  }
  
  // Bildirim izni kontrolü
  if (Notification.permission === 'denied') {
    console.warn('Bildirim izni reddedilmiş. Tarayıcı ayarlarından değiştirmeniz gerekiyor.');
    return false;
  }
  
  try {
    // İzin iste
    const permission = Notification.permission === 'granted' 
      ? 'granted' 
      : await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Bildirim izni alınamadı.');
      return false;
    }
    
    // Service Worker kaydı var mı kontrol et
    const swRegistration = await navigator.serviceWorker.ready;
    
    if (!swRegistration) {
      console.error('Service Worker kaydı bulunamadı.');
      return false;
    }
    
    // Kullanıcı bildirim aboneliğini kaydet
    const subscription = {
      userId,
      userType,
      browser: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    // Aboneliği kaydet
    const saved = await saveNotificationSubscription(subscription, userId, userType);
    
    if (!saved) {
      console.error('Bildirim aboneliği kaydedilemedi.');
      return false;
    }
    
    // Başarılı bildirim testi yap
    const testNotification = {
      title: 'Bildirim İzni Alındı',
      body: 'Artık randevularınız için hatırlatmalar alacaksınız.',
      icon: '/favicon.ico',
      badge: '/favicon-32x32.png',
      data: {
        url: '/appointments'
      }
    };
    
    // Test bildirimini gönder
    if ('Notification' in window) {
      const { title, ...options } = testNotification;
      new Notification(title, options);
    }
    
    return true;
  } catch (error) {
    console.error('Bildirim izni alınırken beklenmeyen hata oluştu:', error);
    return false;
  }
}

// Kullanıcıyı bildirimlerine abone et - devre dışı
async function subscribeUserToPush(
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
) {
  // Şu an devre dışı
  console.log('Push aboneliği devre dışı bırakıldı.');
  return false;
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
    console.error('Bildirim abonelikleri alınırken beklenmeyen hata oluştu:', error);
    return null;
  }
}

// Base64 string'i Uint8Array'e çeviren yardımcı fonksiyon
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
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
  
  // Mesajı alıcıya göre özelleştir
  let title = 'Yaklaşan Randevu Hatırlatması';
  let body = '';
  
  if (appointment.professional_id) {
    // Profesyonel için bildirim
    body = `${formattedDate} tarihinde saat ${formattedTime}'de ${appointment.client?.full_name || 'bir danışan'} ile randevunuz var.`;
  } else if (appointment.client_id) {
    // Danışan için bildirim
    body = `${formattedDate} tarihinde saat ${formattedTime}'de ${appointment.professional?.full_name || 'uzmanınız'} ile randevunuz var.`;
  }
  
  return {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon-32x32.png',
    data: {
      url: `/appointments/${appointment.id}`,
      appointmentId: appointment.id
    },
    requireInteraction: true,
    silent: false
  };
}

// Bildirim gönderme fonksiyonu
export async function sendNotification(userId: string, userType: 'professional' | 'assistant' | 'client', notification: any) {
  try {
    // Kullanıcının bildirim aboneliklerini al
    const { data: subscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .eq('user_type', userType);

    if (error) {
      console.error('Bildirim abonelikleri alınırken hata oluştu:', error);
      return false;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`${userType} ${userId} için bildirim aboneliği bulunamadı.`);
      return false;
    }

    // Tarayıcı bildirimini gönder
    if ('Notification' in window) {
      const { title, ...options } = notification;
      try {
        new Notification(title, options);
        return true;
      } catch (e) {
        console.error('Tarayıcı bildirimi gönderilemedi:', e);
      }
    }

    // Arka planda çalışan bir Service Worker varsa ona gönder
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        await navigator.serviceWorker.ready;
        navigator.serviceWorker.controller.postMessage({
          type: 'SEND_NOTIFICATION',
          notification
        });
        return true;
      } catch (e) {
        console.error('Service Worker bildirimi gönderilemedi:', e);
      }
    }

    return false;
  } catch (error) {
    console.error('Bildirim gönderilirken beklenmeyen hata oluştu:', error);
    return false;
  }
}

// Yaklaşan randevuları kontrol et ve bildirim gönder
export async function checkUpcomingAppointments(userId: string, userType: 'professional' | 'assistant' | 'client') {
  try {
    // Randevuları almak için sorgu
    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:clients(id, full_name),
        professional:professionals(id, full_name)
      `)
      .eq('status', 'scheduled')
      .gte('start_time', new Date().toISOString());
    
    if (userType === 'professional') {
      // Profesyonel için doğrudan kendi randevularını göster
      query = query.eq('professional_id', userId);
    } else if (userType === 'assistant') {
      // Asistan için yönettiği profesyonellerin randevularını göster
      try {
        // Önce asistanın yönettiği profesyonelleri bul
        const { data: managedProfessionals, error: profError } = await supabase
          .from('professionals')
          .select('id')
          .eq('assistant_id', userId);
          
        if (profError) throw profError;
        
        if (managedProfessionals && managedProfessionals.length > 0) {
          const professionalIds = managedProfessionals.map(p => p.id);
          query = query.in('professional_id', professionalIds);
        } else {
          // Eğer yönetilen profesyonel yoksa boş dizi dön
          return [];
        }
      } catch (error) {
        console.error('Yönetilen profesyoneller alınırken hata oluştu:', error);
        return [];
      }
    } else if (userType === 'client') {
      // Danışan için kendi randevularını göster
      query = query.eq('client_id', userId);
    }
    
    const { data: appointments, error } = await query;
    
    if (error) {
      console.error('Randevular alınırken hata oluştu:', error);
      return [];
    }
    
    if (!appointments || appointments.length === 0) {
      return [];
    }
    
    // Yaklaşan randevuları kontrol et ve bildirim gönder
    const now = new Date();
    const in30min = addMinutes(now, 30);
    const in1hour = addHours(now, 1);
    const in1day = addDays(now, 1);
    
    const sentNotifications = [];
    
    for (const appointment of appointments) {
      const appointmentStart = new Date(appointment.start_time);
      
      // Yaklaşan randevuları bildirmek için zaman eşikleri kontrolü
      if (isAfter(appointmentStart, now) && isBefore(appointmentStart, in30min)) {
        // 30 dakika içerisindeki randevular için bildirim
        const notificationContent = createReminderNotificationContent(appointment);
        notificationContent.title = "Randevunuz Yakında Başlayacak!";
        
        // Bildirimi gönder
        const sent = await sendNotification(userId, userType, notificationContent);
        if (sent) {
          sentNotifications.push({
            type: '30min',
            appointment,
            sent
          });
        }
      } else if (isAfter(appointmentStart, now) && isBefore(appointmentStart, in1hour)) {
        // 1 saat içerisindeki randevular için bildirim
        const notificationContent = createReminderNotificationContent(appointment);
        notificationContent.title = "1 Saat İçinde Randevunuz Var";
        
        // Bildirimi gönder
        const sent = await sendNotification(userId, userType, notificationContent);
        if (sent) {
          sentNotifications.push({
            type: '1hour',
            appointment,
            sent
          });
        }
      } else if (isAfter(appointmentStart, now) && isBefore(appointmentStart, in1day)) {
        // Aynı gün içerisindeki randevular için bildirim
        const notificationContent = createReminderNotificationContent(appointment);
        notificationContent.title = "Bugün Randevunuz Var";
        
        // Bildirimi gönder
        const sent = await sendNotification(userId, userType, notificationContent);
        if (sent) {
          sentNotifications.push({
            type: '1day',
            appointment,
            sent
          });
        }
      }
    }
    
    return { appointments, sentNotifications };
    
  } catch (error) {
    console.error('Yaklaşan randevular kontrol edilirken hata oluştu:', error);
    return { appointments: [], sentNotifications: [] };
  }
} 