import { supabase } from '../lib/supabase';
import { addDays, addHours, addMinutes, format, isAfter, isBefore } from 'date-fns';
import { tr } from 'date-fns/locale';
import logo2 from '../assets/logos/logo_2.png';

// Bildirimleri kaydetmek için bir fonksiyon
export async function saveNotificationSubscription(
  subscription: any,
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
) {
  // Şu an devre dışı
  console.log('Bildirim aboneliği devre dışı bırakıldı.');
  return false;
}

// Bildirim aboneliğini silmek için bir fonksiyon
export async function deleteNotificationSubscription(subscriptionId: string) {
  // Şu an devre dışı
  console.log('Bildirim silme işlemi devre dışı bırakıldı.');
  return false;
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
) {
  // Şu an devre dışı
  console.log('Bildirim izni işlemi devre dışı bırakıldı.');
  return false;
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
  // Şu an devre dışı
  console.log('Bildirim abonelikleri getirme devre dışı bırakıldı.');
  return null;
}

// Base64 string'i Uint8Array'e çeviren yardımcı fonksiyon - artık kullanılmıyor
function urlBase64ToUint8Array(base64String: string) {
  // Kullanılmıyor
  return new Uint8Array();
}

// Bildirim içeriği oluştur - sadece format korunuyor
export function createReminderNotificationContent(appointment: any) {
  const appointmentTime = new Date(appointment.start_time);
  const formattedDate = format(appointmentTime, 'PPP', { locale: tr });
  const formattedTime = format(appointmentTime, 'HH:mm', { locale: tr });
  
  return {
    title: 'Yaklaşan Randevu Hatırlatması',
    body: `${formattedDate} tarihinde saat ${formattedTime}'de ${appointment.client?.full_name} ile randevunuz var.`,
    icon: 'favicon.ico',
    badge: 'favicon-32x32.png',
    data: {
      url: '/appointments',
      appointmentId: appointment.id
    }
  };
}

// Yaklaşan randevuları kontrol et - gerçek bildirim göndermek yerine konsola yazar
export async function checkUpcomingAppointments(userId: string, userType: 'professional' | 'assistant') {
  try {
    // Şu an konsola yazacak
    console.log('Randevu kontrolü yapılıyor ancak bildirimler devre dışı.');
    
    // Randevuları almak için sorgu
    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:clients(*),
        professional:professionals(*)
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
    }
    
    const { data: appointments, error } = await query;
    
    if (error) {
      console.error('Randevular alınırken hata oluştu:', error);
      return;
    }
    
    if (!appointments || appointments.length === 0) {
      return;
    }
    
    // Yaklaşan randevuları kontrol et ve konsola yaz
    const now = new Date();
    const in30min = addMinutes(now, 30);
    const in1hour = addHours(now, 1);
    const in1day = addDays(now, 1);
    
    appointments.forEach(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      
      if (isAfter(appointmentStart, now) && isBefore(appointmentStart, in30min)) {
        console.log('30 dakika içinde randevunuz var:', createReminderNotificationContent(appointment));
      } else if (isAfter(appointmentStart, now) && isBefore(appointmentStart, in1hour)) {
        console.log('1 saat içinde randevunuz var:', createReminderNotificationContent(appointment));
      } else if (isAfter(appointmentStart, now) && isBefore(appointmentStart, in1day)) {
        console.log('1 gün içinde randevunuz var:', createReminderNotificationContent(appointment));
      }
    });
    
    return appointments;
    
  } catch (error) {
    console.error('Yaklaşan randevular kontrol edilirken hata oluştu:', error);
    return [];
  }
} 