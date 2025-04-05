import { create } from 'zustand';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  professional: any | null;
  assistant: any | null;
  admin: any | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  professional: null,
  assistant: null,
  admin: null,
  loading: true,

  signIn: async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        // Supabase V2'de signInWithPassword options içinde expiresIn yok.
        // Oturum süresi proje ayarlarından yönetilir.
        // options: {
        //   expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
        // }
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Lütfen e-posta adresinizi onaylayın.');
        }
        if (error.message.includes('Invalid login credentials')) {
           throw new Error('Geçersiz e-posta veya şifre.');
        }
        throw error;
      }

      if (!data?.user) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }

      set({ user: data.user });
      // initialize çağrısını signIn içinde yapmaya gerek yok, session değiştiğinde otomatik tetiklenmeli.
      // await get().initialize();
    } catch (error) {
      // Yükleniyor durumunu sadece hata olduğunda false yapmak yerine her durumda (başarılı/başarısız) ele almak daha doğru olabilir.
      // Ancak mevcut yapıya dokunmamak için şimdilik böyle bırakıyorum. Hata durumunda false yapılıyor.
      set({ loading: false }); 
      console.error("Sign in error:", error); // Hatanın loglanması
      // Hata mesajını doğrudan fırlatmak yerine daha kullanıcı dostu bir mesaj döndürebiliriz.
      // throw error; yerine:
      if (error instanceof Error) {
          throw error; // Zaten Error nesnesi ise doğrudan fırlat
      } else {
          throw new Error('Giriş sırasında bir hata oluştu.'); // Değilse genel bir hata fırlat
      }
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, professional: null, assistant: null, admin: null, loading: false }); // Admin durumu da temizlendi
    } catch (error) {
      console.error("Sign out error:", error); // Hatanın loglanması
      set({ loading: false });
      // throw error; // Hata fırlatmak yerine belki sadece loglamak yeterlidir.
    }
  },

  initialize: async () => {
    console.log("Initializing auth..."); // initialize başlangıcını logla
    set({ loading: true }); // Başlangıçta loading true olarak ayarla

    try {
      // Mevcut kullanıcıyı al
      const { data: { user } } = await supabase.auth.getUser();
      console.log("User session:", user); // Kullanıcı oturumunu logla

      if (!user) {
        console.log("No user session found.");
        set({ user: null, professional: null, assistant: null, admin: null, loading: false });
        return;
      }

      // 1. Admin kontrolü
      console.log("Checking if user is admin...");
      const { data: adminData, error: adminError } = await supabase
        .from('admins') // 'admins' tablosunu varsayıyoruz
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if(adminError) {
          console.error("Error checking admin status:", adminError);
          // Hata olsa bile diğer rolleri kontrol etmeye devam edebiliriz
      } else if (adminData) {
        console.log("User is admin:", adminData);
        set({ user, admin: adminData, assistant: null, professional: null, loading: false });
        return;
      } else {
        console.log("User is not admin.");
      }


      // 2. Asistan kontrolü (Admin değilse)
      console.log("Checking if user is assistant...");
      const { data: assistantData, error: assistantError } = await supabase
        .from('assistants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if(assistantError) {
          console.error("Error checking assistant status:", assistantError);
      } else if (assistantData) {
        console.log("User is assistant:", assistantData);
        set({ user, admin: null, assistant: assistantData, professional: null, loading: false });
        return;
      } else {
         console.log("User is not assistant.");
      }

      // 3. Profesyonel kontrolü (Admin veya Asistan değilse)
      console.log("Checking if user is professional...");
      const { data: professionalData, error: professionalError } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if(professionalError) {
          console.error("Error checking professional status:", professionalError);
      } else if (professionalData) {
         console.log("User is professional:", professionalData);
      } else {
          console.log("User is not professional.");
      }

      // Kullanıcıyı set et (rolü null olabilir)
      set({
        user,
        admin: null, // Admin değil
        assistant: null, // Asistan değil
        professional: professionalData, // Profesyonel olabilir veya null olabilir
        loading: false
      });
      console.log("Auth initialized for user:", user.email, "Professional:", !!professionalData);

    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, professional: null, assistant: null, admin: null, loading: false });
    }
  }
}));


// Supabase auth state değişikliğini dinle
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event, session);
    // Kullanıcı giriş yaptığında veya token yenilendiğinde initialize'ı tekrar çağır
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
      useAuth.getState().initialize();
    } 
    // Kullanıcı çıkış yaptığında state'i temizle
    else if (event === 'SIGNED_OUT') {
      useAuth.setState({ user: null, professional: null, assistant: null, admin: null, loading: false });
    }
  });
  
  // Başlangıçta bir kez initialize çağır (eğer INITIAL_SESSION tetiklenmezse diye)
  // Ancak onAuthStateChange genellikle INITIAL_SESSION ile başlar, bu yüzden bu belki gereksizdir.
  // useAuth.getState().initialize(); 
}