import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Hata işleme ve yeniden deneme için yardımcı fonksiyon
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 3
): Promise<{ data: T | null; error: any }> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const { data, error } = await queryFn();
      
      if (!error) {
        return { data, error: null };
      }
      
      // 406, 400 gibi hataları kontrol et
      if (error.status === 406 || error.status === 400) {
        console.error('Supabase API hatası:', error);
        // Hatayı logla ama yeniden deneme
      }
      
      retries++;
      
      // Üstel geri çekilme ile bekle
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    } catch (e) {
      return { data: null, error: e };
    }
  }
  
  return { data: null, error: new Error(`Maksimum yeniden deneme sayısına (${maxRetries}) ulaşıldı`) };
}
