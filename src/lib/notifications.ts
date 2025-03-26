import { supabase } from './supabase';

export async function requestNotificationPermission(
  userId: string,
  userType: 'professional' | 'assistant' | 'client'
): Promise<boolean> {
  try {
    // Bildirim desteği şu an devre dışı
    console.log('Bildirim desteği şu anda devre dışı bırakıldı.');
    return false;
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
    // Bildirim desteği şu an devre dışı
    console.log('Bildirim desteği şu anda devre dışı bırakıldı.');
    return false;
  } catch (error) {
    console.error('Bildirim gönderilirken hata:', error);
    return false;
  }
} 