import { create } from 'zustand';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  professional: any | null;
  assistant: any | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  professional: null,
  assistant: null,
  loading: true,

  signIn: async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
        }
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Lütfen e-posta adresinizi onaylayın.');
        }
        throw error;
      }

      if (!data?.user) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }

      set({ user: data.user });
      await get().initialize();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, professional: null, assistant: null, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  initialize: async () => {
    try {
      set({ loading: true });

      // Get current session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ user: null, professional: null, assistant: null, loading: false });
        return;
      }

      // First check if user is an assistant
      const { data: assistantData } = await supabase
        .from('assistants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (assistantData) {
        set({ 
          user,
          assistant: assistantData,
          professional: null,
          loading: false 
        });
        return;
      }

      // If not assistant, check if professional
      const { data: professionalData } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      set({
        user,
        professional: professionalData,
        assistant: null,
        loading: false
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, professional: null, assistant: null, loading: false });
    }
  }
}));

// Initialize auth state when the app loads
if (typeof window !== 'undefined') {
  useAuth.getState().initialize();
}