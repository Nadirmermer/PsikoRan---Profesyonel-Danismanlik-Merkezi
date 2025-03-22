import React, { useState, useEffect } from 'react';
import { CookieIcon, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface CookieSettingsType {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const defaultSettings: CookieSettingsType = {
  essential: true, // Esaslar her zaman true olmalı ve devre dışı bırakılmamalı
  analytics: true,
  marketing: false,
  preferences: true,
};

export function CookieSettings() {
  const { user, professional, assistant } = useAuth();
  const [settings, setSettings] = useState<CookieSettingsType>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Kullanıcı tipine göre doğru tablodan veri çekme
      if (professional) {
        const { data, error } = await supabase
          .from('professionals')
          .select('cookie_settings')
          .eq('id', professional.id)
          .single();

        if (error) throw error;

        if (data && data.cookie_settings) {
          setSettings({
            ...defaultSettings,
            ...data.cookie_settings,
          });
        }
      } else if (assistant) {
        const { data, error } = await supabase
          .from('assistants')
          .select('cookie_settings')
          .eq('id', assistant.id)
          .single();

        if (error) throw error;

        if (data && data.cookie_settings) {
          setSettings({
            ...defaultSettings,
            ...data.cookie_settings,
          });
        }
      }
    } catch (err) {
      console.error('Çerez ayarları yüklenirken hata:', err);
      setError('Çerez ayarları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (setting: keyof CookieSettingsType) => {
    if (setting === 'essential') return; // Esaslar değiştirilemez
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Kullanıcı tipine göre doğru tabloya güncelleme yapma
      if (professional) {
        const { error } = await supabase
          .from('professionals')
          .update({
            cookie_settings: settings,
          })
          .eq('id', professional.id);

        if (error) throw error;
      } else if (assistant) {
        const { error } = await supabase
          .from('assistants')
          .update({
            cookie_settings: settings,
          })
          .eq('id', assistant.id);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Çerez ayarları güncellenirken hata:', err);
      setError('Çerez ayarları güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-center space-x-2 mb-4">
        <CookieIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Çerez Ayarları</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">Temel Çerezler</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bu çerezler, web sitesinin düzgün çalışması için gereklidir ve devre dışı bırakılamazlar.
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-primary-500 dark:bg-primary-500 transition-colors duration-200 ease-in-out"
                disabled
              >
                <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">Analitik Çerezler</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bu çerezler, web sitesi kullanımınızı analiz etmemize ve deneyiminizi iyileştirmemize yardımcı olur.
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggle('analytics')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                  settings.analytics ? 'bg-primary-500 dark:bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.analytics ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                ></span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">Pazarlama Çerezleri</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bu çerezler, ziyaretleriniz ve ilgi alanlarınız hakkında bilgi toplamak için kullanılır.
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggle('marketing')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                  settings.marketing ? 'bg-primary-500 dark:bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.marketing ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                ></span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pb-3">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">Tercih Çerezleri</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bu çerezler, dil ve diğer tercihlerinizi hatırlamak için kullanılır.
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggle('preferences')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                  settings.preferences ? 'bg-primary-500 dark:bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.preferences ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                ></span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 