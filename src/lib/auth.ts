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
      // initialize çağrısı signIn içinde yapılmaz, onAuthStateChange tetikler.
    } catch (error) {
      set({ loading: false }); 
      if (error instanceof Error) {
          throw error; 
      } else {
          throw new Error('Giriş sırasında bir hata oluştu.'); 
      }
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, professional: null, assistant: null, admin: null, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  initialize: async () => {
    set({ loading: true }); 

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({ user: null, professional: null, assistant: null, admin: null, loading: false });
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admins') 
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if(adminError) {
          console.error("Error checking admin status:", adminError);
      } else if (adminData) {
        set({ user, admin: adminData, assistant: null, professional: null, loading: false });
        return;
      } 

      const { data: assistantData, error: assistantError } = await supabase
        .from('assistants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if(assistantError) {
          console.error("Error checking assistant status:", assistantError);
      } else if (assistantData) {
        set({ user, admin: null, assistant: assistantData, professional: null, loading: false });
        return;
      } 

      const { data: professionalData, error: professionalError } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if(professionalError) {
          console.error("Error checking professional status:", professionalError);
      } 

      set({
        user,
        admin: null, 
        assistant: null, 
        professional: professionalData, 
        loading: false
      });

    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, professional: null, assistant: null, admin: null, loading: false });
    }
  }
}));


// Supabase auth state değişikliğini dinle
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
      useAuth.getState().initialize();
    } 
    else if (event === 'SIGNED_OUT') {
      useAuth.setState({ user: null, professional: null, assistant: null, admin: null, loading: false });
    }
  });
}