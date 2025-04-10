import { supabase } from '../lib/supabase';
import { addDays, addHours, addMinutes, format, isAfter, isBefore } from 'date-fns';
import { tr } from 'date-fns/locale';
import logo1 from '../assets/base-logo.webp';

// Web Push için VAPID anahtarları
// NOT: Bu anahtarı çevresel değişkenlerden alıyoruz
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BNbKwE3PEBs9qpwLlwJqPKLMur71NoYCUWzDeY9dAQEyNHUs0l3q6-nP4RxjrY8PX0vBeJVqXnYGiqACpV49U0s';

// Cihaz tipini tespit et (mobil veya masaüstü)
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// PWA olarak çalışıp çalışmadığını kontrol et
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (navigator.userAgent.includes('iPhone') && window.navigator.standalone === true);
};

// Base64 string'i Uint8Array'e çeviren yardımcı fonksiyon
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Bildirim aboneliğini kaydet
export async function saveNotificationSubscription(
  subscription: PushSubscription,
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
) {
  try {
    // Aboneliğin zaten var olup olmadığını kontrol et
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', subscription.endpoint)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // console.error('Mevcut abonelikler kontrol edilirken hata:', fetchError);
      return false;
    }

    // Eğer abonelik zaten varsa, güncellemeye gerek yok
    if (existingSubscription) {
      // console.log('Bu cihaz için bildirim aboneliği zaten var');
      return true;
    }

    // Yeni abonelik oluştur
    const { error } = await supabase
      .from('notification_subscriptions')
      .insert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: JSON.stringify(subscription).includes('keys') 
          ? subscription.toJSON().keys?.p256dh 
          : '',
        auth: JSON.stringify(subscription).includes('keys') 
          ? subscription.toJSON().keys?.auth 
          : '',
        user_type: userType,
        device_type: isMobileDevice() ? 'mobile' : 'desktop',
        is_pwa: isPWA(),
        created_at: new Date().toISOString()
      });

    if (error) {
      // console.error('Bildirim aboneliği kaydedilirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    // console.error('Bildirim aboneliği kaydedilirken hata:', error);
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
      // console.error('Bildirim aboneliği silinirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    // console.error('Bildirim aboneliği silinirken hata:', error);
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
      // console.error('Kullanıcının tüm bildirim abonelikleri silinirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    // console.error('Kullanıcının tüm bildirim abonelikleri silinirken hata:', error);
    return false;
  }
}

// Bildirim izni kontrolü
export async function checkNotificationPermissionStatus(): Promise<{
  isSupported: boolean;
  permission: NotificationPermission;
  isPushSupported: boolean;
}> {
  const result = {
    isSupported: false,
    permission: 'default' as NotificationPermission,
    isPushSupported: false
  };

  // Notification API desteği kontrolü
  if ('Notification' in window) {
    result.isSupported = true;
    result.permission = Notification.permission;
  }

  // Push API desteği kontrolü
  if ('PushManager' in window && 'serviceWorker' in navigator) {
    result.isPushSupported = true;
  }

  return result;
}

// Kullanıcıdan bildirim izni iste
export async function requestNotificationPermission(
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
) {
  const isMobile = isMobileDevice();
  const isPwaMode = isPWA();
  
  // Bildirim desteğini kontrol et
  if (!('Notification' in window)) {
    // console.log('Bu tarayıcı bildirimleri desteklemiyor');
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      // İzin zaten alınmış, push aboneliğini yap
      const result = await subscribeUserToPush(userId, userType);
      return result;
    }

    if (Notification.permission === 'denied') {
      // console.log('Bildirim izni reddedilmiş, tarayıcı ayarlarından değiştirilmeli');
      return false;
    }

    // Mobil cihazlarda ve PWA modunda özel davranış
    if (isMobile && isPwaMode) {
      try {
        // PWA modunda izin iste
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          return await subscribeUserToPush(userId, userType);
        }
        return false;
      } catch (mobileError) {
        // Mobil hata durumunda alternatif yöntem dene
        try {
          // Service worker üzerinden bildirimlere abone ol
          return await subscribeUserToPush(userId, userType);
        } catch (swError) {
          // console.error('Mobil PWA bildirim izni alınamadı:', swError);
          return false;
        }
      }
    } else {
      // Standart bildirim izni isteme
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // İzin alındı, push aboneliğini yap
        const result = await subscribeUserToPush(userId, userType);
        return result;
      } else {
        // console.log('Bildirim izni reddedildi');
        return false;
      }
    }
  } catch (error) {
    // console.error('Bildirim izni istenirken hata:', error);
    return false;
  }
}

// Kullanıcıyı bildirimlerine abone et
async function subscribeUserToPush(
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      // Mobil cihazlarda, PWA durumunda ve Service Worker/Push API desteği yoksa
      // sadece Notification API'si ile devam et
      if (isMobileDevice() && isPWA() && ('Notification' in window)) {
        // Mobil PWA için alternatif bildirim metodu
        return await registerMobilePwaNotification(userId, userType);
      }
      
      // console.log('Bu tarayıcı Push API veya Service Worker desteklemiyor');
      return false;
    }

    // Service Worker'ı kaydet/kontrol et
    const registration = await registerServiceWorker();
    if (!registration) {
      return false;
    }

    // Mevcut bir abonelik var mı kontrol et
    const existingSubscription = await registration.pushManager.getSubscription();
    
    // Eğer zaten abone olunmuşsa, veritabanına kaydetmeye çalış
    if (existingSubscription) {
      const saved = await saveNotificationSubscription(existingSubscription, userId, userType);
      return saved;
    }

    try {
      // Yeni bir abonelik oluştur
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Aboneliği veritabanına kaydet
      const saved = await saveNotificationSubscription(subscription, userId, userType);
      return saved;
    } catch (pushError) {
      // Push aboneliğinde hata - muhtemelen izin reddedildi veya desteklenmiyor
      if (isMobileDevice() && isPWA()) {
        // Mobil PWA için alternatif bildirim metodu
        return await registerMobilePwaNotification(userId, userType);
      }
      
      return false;
    }
  } catch (error) {
    // console.error('Push aboneliği oluşturulurken hata:', error);
    return false;
  }
}

// Mobil PWA için alternatif bildirim kaydı (Push API desteklenmiyorsa)
async function registerMobilePwaNotification(
  userId: string, 
  userType: 'professional' | 'assistant' | 'client'
) {
  try {
    // Basit bir "abonelik" nesnesi oluştur
    const dummySubscription = {
      endpoint: `mobile-pwa-${navigator.userAgent}-${Date.now()}`,
      toJSON: () => ({ 
        endpoint: `mobile-pwa-${navigator.userAgent}-${Date.now()}`,
        keys: { p256dh: 'mobile-pwa', auth: 'mobile-pwa' } 
      })
    } as unknown as PushSubscription;
    
    // Bu "aboneliği" veritabanına kaydet
    const saved = await saveNotificationSubscription(dummySubscription, userId, userType);
    return saved;
  } catch (error) {
    return false;
  }
}

// Service Worker'ı kaydet
async function registerServiceWorker() {
  try {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    // PWA zaten yüklü ve aktif ise SW kaydını kontrol et
    if (isPWA()) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration) {
          return registration;
        }
      } catch (swReadyError) {
        // SW ready değilse, yeni kayıt dene
      }
    }

    // Service Worker'ı kaydet
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      return registration;
    } catch (regError) {
      // Service Worker kaydedilemedi, PWA modunda alternatif deneme yap
      if (isPWA()) {
        try {
          // SW zaten aktif olabilir, kontrol et
          const existingReg = await navigator.serviceWorker.getRegistration();
          if (existingReg) return existingReg;
        } catch (existRegError) {
          return null;
        }
      }
      
      return null;
    }
  } catch (error) {
    return null;
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
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

// Kullanıcının bildirim tercihlerini getir
export async function getUserNotificationPreferences(userId: string) {
  try {
    // İlk olarak tablo var mı kontrol et
    const { error: tableCheckError } = await supabase
      .from('notification_preferences')
      .select('count')
      .limit(1);
    
    // Tablo yoksa veya başka bir hata varsa
    if (tableCheckError) {
      console.error('Bildirim tercihleri tablosu kontrolünde hata:', tableCheckError);
      // Varsayılan tercihleri döndür
      return {
        appointment_reminder_30min: true,
        appointment_reminder_1hour: true,
        appointment_reminder_1day: true,
        appointment_cancelled: true,
        appointment_rescheduled: true,
        new_message: true,
        payment_confirmations: true,
        newsletter: false,
        system_updates: true
      };
    }
    
    // Tablo varsa, kullanıcı kaydını kontrol et
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Kayıt bulunamadı - kullanıcı için yeni bir kayıt oluştur
        const defaultPrefs = {
          user_id: userId,
          appointment_reminder_30min: true,
          appointment_reminder_1hour: true,
          appointment_reminder_1day: true,
          appointment_cancelled: true,
          appointment_rescheduled: true,
          new_message: true,
          payment_confirmations: true,
          newsletter: false,
          system_updates: true,
          updated_at: new Date().toISOString()
        };
        
        // Tercih kaydını oluştur
        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert(defaultPrefs);
        
        if (insertError) {
          console.error('Bildirim tercihleri eklenirken hata:', insertError);
        }
        
        return defaultPrefs;
      }
      
      console.error('Bildirim tercihleri yüklenirken hata:', error);
      return {
        appointment_reminder_30min: true,
        appointment_reminder_1hour: true,
        appointment_reminder_1day: true,
        appointment_cancelled: true,
        appointment_rescheduled: true,
        new_message: true,
        payment_confirmations: true,
        newsletter: false,
        system_updates: true
      };
    }

    return data;
  } catch (error) {
    console.error('Bildirim tercihleri yüklenirken beklenmeyen hata:', error);
    return {
      appointment_reminder_30min: true,
      appointment_reminder_1hour: true,
      appointment_reminder_1day: true,
      appointment_cancelled: true,
      appointment_rescheduled: true,
      new_message: true,
      payment_confirmations: true,
      newsletter: false,
      system_updates: true
    };
  }
}

// Bildirim içeriği oluştur - Profesyonel randevu hatırlatması
export function createProfessionalReminderNotificationContent(appointment: any) {
  const appointmentTime = new Date(appointment.start_time);
  const formattedDate = format(appointmentTime, 'PPP', { locale: tr });
  const formattedTime = format(appointmentTime, 'HH:mm', { locale: tr });
  
  // Mesaj içeriğinde danışanın adı soyadı ve randevu saati
  return {
    title: 'Yaklaşan Randevu Hatırlatması',
    body: `${formattedDate} tarihinde saat ${formattedTime}'de ${appointment.client?.full_name || 'bir danışan'} ile randevunuz var.`,
    icon: '/images/icons/icon-192x192.webp',
    badge: '/images/icons/badge-72x72.webp',
    data: {
      url: '/randevular',
      appointmentId: appointment.id
    }
  };
}

// Bildirim içeriği oluştur - Danışan randevu hatırlatması
export function createClientReminderNotificationContent(appointment: any) {
  const appointmentTime = new Date(appointment.start_time);
  const formattedDate = format(appointmentTime, 'PPP', { locale: tr });
  const formattedTime = format(appointmentTime, 'HH:mm', { locale: tr });
  
  // Mesaj içeriğinde terapistin adı soyadı ve randevu saati
  return {
    title: 'Yaklaşan Randevu Hatırlatması',
    body: `${formattedDate} tarihinde saat ${formattedTime}'de ${appointment.professional?.full_name || 'terapistiniz'} ile randevunuz var.`,
    icon: '/images/icons/icon-192x192.webp',
    badge: '/images/icons/badge-72x72.webp',
    data: {
      url: '/randevular',
      appointmentId: appointment.id
    }
  };
}

// Bildirimleri gönder - İyileştirilmiş sürüm
export async function sendNotification(
  userId: string, 
  title: string, 
  body: string, 
  data: { [key: string]: any } = {},
  userType: 'professional' | 'assistant' | 'client' = 'client'
) {
  try {
    const isMobile = isMobileDevice();
    const isPwaMode = isPWA();
    
    // PWA modunda ve mobil cihazda özel davranış
    if (isMobile && isPwaMode) {
      try {
        // Yeni notification oluştur
        const notification = new Notification(title, {
          body,
          icon: '/images/icons/icon-192x192.webp',
          badge: '/images/icons/badge-72x72.webp',
          data,
          vibrate: [100, 50, 100], // Mobil cihazlarda titreşim
          requireInteraction: true // Kullanıcı etkileşimi gerektir (özellikle mobil için)
        });
        
        // Bildirime tıklandığında yönlendirme için olay dinleyicisi ekle
        notification.onclick = function() {
          if (data && data.url) {
            window.focus();
            window.location.href = data.url;
          }
        };
        
        return true;
      } catch (mobileNotifError) {
        // Mobil bildirim gösterilemedi, sunucu API'sini dene
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      // Normal tarayıcı bildirimi göstermeyi dene
      try {
        const notification = new Notification(title, {
          body,
          icon: '/images/icons/icon-192x192.webp',
          badge: '/images/icons/badge-72x72.webp',
          data
        });
        
        // Bildirime tıklandığında yönlendirme için olay dinleyicisi ekle
        notification.onclick = function() {
          if (data && data.url) {
            window.focus();
            window.location.href = data.url;
          }
        };
        
        return true;
      } catch (notifError) {
        // Normal bildirim gösterilemedi, sunucu API'sini dene
      }
    }
    
    // Tarayıcı bildirimleri desteklemiyorsa veya başarısız olduysa sunucu bildirimlerini dene
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userType,
          notification: {
            title,
            body,
            icon: '/images/icons/icon-192x192.webp',
            badge: '/images/icons/badge-72x72.webp',
            data
          },
          deviceInfo: {
            isMobile,
            isPwa: isPwaMode,
            userAgent: navigator.userAgent
          }
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (apiError) {
      // API erişilemez olduğunda başarısız
      return false;
    }
  } catch (error) {
    return false;
  }
}

// Yaklaşan randevuları kontrol et ve bildirim gönder
export async function checkUpcomingAppointments(userId?: string, userType?: 'professional' | 'assistant' | 'client') {
  try {
    // Eğer userId ve userType verilmediyse, mevcut kullanıcıyı kullan
    let currentUserId = userId;
    let currentUserType = userType;
    
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      currentUserId = user.id;
    }
    
    if (!currentUserType) {
      // Kullanıcı türünü bul (önce professionals tablosuna bak)
      const { data: professionalData } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', currentUserId)
        .single();
      
      if (professionalData) {
        currentUserType = 'professional';
      } else {
        // Asistan olup olmadığını kontrol et
        const { data: assistantData } = await supabase
          .from('assistants')
          .select('id')
          .eq('user_id', currentUserId)
          .single();
          
        if (assistantData) {
          currentUserType = 'assistant';
        } else {
          // Varsayılan olarak client kabul et
          currentUserType = 'client';
        }
      }
    }
    
    // Bildirim tercihlerini al
    try {
      const { data: prefData, error: prefError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', currentUserId)
        .single();
        
      if (prefError) {
        // Devam et ve varsayılan değerleri kullan
      }
      
      // Varsayılan tercihleri kullan veya veritabanından gelen tercihleri kullan
      const preferences = prefData || {
        appointment_reminder_30min: true,
        appointment_reminder_1hour: true,
        appointment_reminder_1day: true,
        appointment_cancelled: true,
        appointment_rescheduled: true,
        new_message: true,
        payment_confirmations: true,
        newsletter: false,
        system_updates: true
      };
      
      // Şimdi randevuları kontrol et
      const now = new Date();
      const thirtyMinLater = addMinutes(now, 30);
      const oneHourLater = addHours(now, 1);
      const oneDayLater = addDays(now, 1);
      
      // Randevu veritabanı sorgusu
      let query = supabase
        .from('appointments')
        .select(`
          *,
          professional:professional_id (id, full_name, profile_image_url),
          client:client_id (id, full_name)
        `);
        
      if (currentUserType === 'professional') {
        query = query.eq('professional_id', currentUserId);
      } else if (currentUserType === 'client') {
        query = query.eq('client_id', currentUserId);
      } else if (currentUserType === 'assistant') {
        // Asistanlar için ilgili profesyonel randevularını kontrol et
        const { data: assistantData } = await supabase
          .from('assistants')
          .select('professional_id')
          .eq('id', currentUserId)
          .single();
          
        if (assistantData) {
          query = query.eq('professional_id', assistantData.professional_id);
        }
      }
      
      // Gelecek randevuları al
      const { data: appointments, error: appointmentError } = await query
        .gte('start_time', now.toISOString())
        .order('start_time', { ascending: true });
        
      if (appointmentError) {
        return;
      }
      
      // Yaklaşan randevular için bildirimleri kontrol et ve gönder
      for (const appointment of appointments) {
        const appointmentTime = new Date(appointment.start_time);
        
        // 30 dakika kontrolü
        if (
          preferences.appointment_reminder_30min && 
          isAfter(appointmentTime, now) && 
          isBefore(appointmentTime, thirtyMinLater)
        ) {
          const notificationData = createAppointmentNotification(
            appointment, 
            currentUserType, 
            '30 dakika'
          );
          
          await sendNotification(
            currentUserId,
            notificationData.title,
            notificationData.body,
            { url: `/randevular/${appointment.id}`, appointmentId: appointment.id },
            currentUserType
          );
        }
        
        // 1 saat kontrolü
        if (
          preferences.appointment_reminder_1hour && 
          isAfter(appointmentTime, thirtyMinLater) && 
          isBefore(appointmentTime, oneHourLater)
        ) {
          const notificationData = createAppointmentNotification(
            appointment, 
            currentUserType, 
            '1 saat'
          );
          
          await sendNotification(
            currentUserId,
            notificationData.title,
            notificationData.body,
            { url: `/randevular/${appointment.id}`, appointmentId: appointment.id },
            currentUserType
          );
        }
        
        // 1 gün kontrolü
        if (
          preferences.appointment_reminder_1day && 
          isAfter(appointmentTime, oneHourLater) && 
          isBefore(appointmentTime, oneDayLater)
        ) {
          const notificationData = createAppointmentNotification(
            appointment, 
            currentUserType, 
            '1 gün'
          );
          
          await sendNotification(
            currentUserId,
            notificationData.title,
            notificationData.body,
            { url: `/randevular/${appointment.id}`, appointmentId: appointment.id },
            currentUserType
          );
        }
      }
    } catch (error) {
    }
  } catch (error) {
  }
}

// Bildirim içeriği oluştur
function createAppointmentNotification(
  appointment: any,
  userType: string | undefined,
  timeFrame: string
) {
  const appointmentDate = format(
    new Date(appointment.start_time),
    'dd MMMM yyyy, HH:mm',
    { locale: tr }
  );
  
  if (userType === 'professional' || userType === 'assistant') {
    // Profesyonel veya asistan için bildirim
    return {
      title: 'Yaklaşan Randevu Hatırlatması',
      body: `${appointment.client.full_name || 'Danışan'} ile randevunuz ${timeFrame} sonra (${appointmentDate})`
    };
  } else {
    // Danışan için bildirim
    return {
      title: 'Yaklaşan Randevu Hatırlatması',
      body: `${appointment.professional.full_name || 'Terapistiniz'} ile randevunuz ${timeFrame} sonra (${appointmentDate})`
    };
  }
}

// Düzenli olarak randevu kontrolü yapacak bir fonksiyon başlat
export function startAppointmentChecker() {
  // Sayfa yüklendiğinde hemen kontrol et
  checkUpcomingAppointments();
  
  // Sonra her 15 dakikada bir kontrol et
  setInterval(() => {
    checkUpcomingAppointments();
  }, 15 * 60 * 1000); // 15 dakika
} 