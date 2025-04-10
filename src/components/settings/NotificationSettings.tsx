import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Clock, Calendar, Mail, CheckCircle2, BellRing } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { requestNotificationPermission, sendNotification } from '../../utils/notificationUtils';

interface NotificationSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  created_at: string;
}

interface NotificationPreferences {
  appointment_reminder_30min: boolean;
  appointment_reminder_1hour: boolean;
  appointment_reminder_1day: boolean;
  appointment_cancelled: boolean;
  appointment_rescheduled: boolean;
  new_message: boolean;
}

const defaultPreferences: NotificationPreferences = {
  appointment_reminder_30min: true,
  appointment_reminder_1hour: true,
  appointment_reminder_1day: true,
  appointment_cancelled: true,
  appointment_rescheduled: true,
  new_message: true
};

export function NotificationSettings() {
  const { user, professional, assistant } = useAuth();
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Bildirim durumunu kontrol et
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    // Bildirim aboneliklerini yükle
    loadSubscriptions();
    
    // Bildirim tercihlerini yükle
    loadNotificationPreferences();
  }, [user]);

  const loadSubscriptions = async () => {
    if (!user) return;

    setIsLoadingSubscriptions(true);
    try {
      const { data, error } = await supabase
        .from('notification_subscriptions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      // console.error('Bildirim abonelikleri yüklenirken hata:', error);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };
  
  const loadNotificationPreferences = async () => {
    if (!user) return;
    
    setIsLoadingPreferences(true);
    try {
      // İlk olarak tablo var mı kontrol et
      const { error: tableCheckError } = await supabase
        .from('notification_preferences')
        .select('count')
        .limit(1);
      
      // Tablo yoksa veya başka bir hata varsa varsayılan ayarları kullan
      if (tableCheckError) {
        console.error('Bildirim tercihleri tablosu kontrolünde hata:', tableCheckError);
        setPreferences(defaultPreferences);
        setIsLoadingPreferences(false);
        return;
      }
      
      // Kullanıcı kaydını kontrol et
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Kayıt bulunamadı, varsayılan tercihleri kullan ve yeni kayıt oluştur
          const newPrefs = {
            user_id: user.id,
            ...defaultPreferences,
            updated_at: new Date().toISOString()
          };
          
          // Tercih kaydını oluştur
          const { error: insertError } = await supabase
            .from('notification_preferences')
            .insert(newPrefs);
          
          if (insertError) {
            console.error('Bildirim tercihleri eklenirken hata:', insertError);
          }
          
          setPreferences(defaultPreferences);
        } else {
          console.error('Bildirim tercihleri yüklenirken hata:', error);
          setPreferences(defaultPreferences);
        }
      } else if (data) {
        // Veri filtreleme - sadece boolean değerleri al
        const filteredData: any = {};
        Object.keys(defaultPreferences).forEach(key => {
          if (key in data) {
            filteredData[key] = Boolean(data[key]);
          } else {
            filteredData[key] = defaultPreferences[key as keyof NotificationPreferences];
          }
        });
        setPreferences(filteredData);
      }
    } catch (error) {
      console.error('Bildirim tercihleri yüklenirken hata:', error);
      setPreferences(defaultPreferences);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let userType: 'professional' | 'assistant' | 'client' = 'client';
      if (professional) {
        userType = 'professional';
      } else if (assistant) {
        userType = 'assistant';
      }

      const success = await requestNotificationPermission(user.id, userType);
      
      if ('Notification' in window) {
        setNotificationStatus(Notification.permission);
      }

      if (success) {
        await loadSubscriptions();
        
        // Bildirim izni alındığında varsayılan bildirim tercihlerini de kaydet
        await saveNotificationPreferences(preferences);
      }
    } catch (error) {
      // console.error('Bildirim izni istenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('notification_subscriptions')
        .delete()
        .eq('id', subscriptionId);
      
      if (error) throw error;
      
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
    } catch (error) {
      // console.error('Abonelik silinirken hata:', error);
    }
  };
  
  const handlePreferenceChange = (preferenceName: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [preferenceName]: !prev[preferenceName]
    }));
  };
  
  const saveNotificationPreferences = async (prefsToSave: NotificationPreferences) => {
    if (!user) return;
    
    setSavingPreferences(true);
    try {
      // İlk olarak tablo var mı kontrol et
      const { error: tableCheckError } = await supabase
        .from('notification_preferences')
        .select('count')
        .limit(1);
      
      // Tablo yoksa kullanıcıya bilgi ver
      if (tableCheckError) {
        console.error('Bildirim tercihleri tablosu kontrolünde hata:', tableCheckError);
        setSavingPreferences(false);
        return false;
      }
      
      // Tercih kayıt/güncelleme işlemi
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...prefsToSave,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('Bildirim tercihleri kaydedilirken hata:', error);
        return false;
      }
      
      // Başarı mesajını göster
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      return true;
    } catch (error) {
      console.error('Bildirim tercihleri kaydedilirken beklenmeyen hata:', error);
      return false;
    } finally {
      setSavingPreferences(false);
    }
  };
  
  const handleSavePreferences = async () => {
    await saveNotificationPreferences(preferences);
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusText = (status: NotificationPermission) => {
    switch (status) {
      case 'granted':
        return 'Bildirimler etkin';
      case 'denied':
        return 'Bildirimler engellenmiş. Tarayıcı ayarlarından izin vermeniz gerekir.';
      default:
        return 'Bildirimler için izin verilmemiş';
    }
  };

  // Bildirim test fonksiyonu
  const handleTestNotification = async () => {
    if (!user) return;
    setTestingNotification(true);
    setTestResult(null);
    
    try {
      let userType: 'professional' | 'assistant' | 'client' = 'client';
      if (professional) {
        userType = 'professional';
      } else if (assistant) {
        userType = 'assistant';
      }
      
      // Bildirim izni eğer yoksa, izin iste
      if (notificationStatus !== 'granted') {
        const success = await requestNotificationPermission(user.id, userType);
        if (!success) {
          setTestResult({
            success: false,
            message: 'Bildirim izni alınamadı. Bildirim testi yapılamıyor.'
          });
          setTestingNotification(false);
          return;
        }
        
        // İzin durumunu güncelle
        if ('Notification' in window) {
          setNotificationStatus(Notification.permission);
        }
      }
      
      // Test bildirimi gönder
      const success = await sendNotification(
        user.id,
        'Test Bildirimi',
        'Bu bir test bildirimidir. Bildirimler başarıyla çalışıyor!',
        { url: '/ayarlar?tab=notifications' },
        userType
      );
      
      if (success) {
        setTestResult({
          success: true,
          message: 'Test bildirimi başarıyla gönderildi!'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Bildirim gönderilemedi. Tarayıcı ayarlarınızı kontrol edin.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Bildirim gönderilirken hata oluştu.'
      });
    } finally {
      setTestingNotification(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            Bildirim Ayarları
          </h3>
        </div>
      </div>

      {/* Başarı mesajı */}
      {showSuccessMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-md flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
          <span className="text-sm text-green-700 dark:text-green-300">
            Bildirim tercihleri başarıyla kaydedildi.
          </span>
        </div>
      )}

      {/* Test sonuç mesajı */}
      {testResult && (
        <div className={`mb-4 p-3 ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30'} border rounded-md flex items-center`}>
          {testResult.success ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
          ) : (
            <Bell className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
          )}
          <span className={`text-sm ${testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {testResult.message}
          </span>
        </div>
      )}

      <div className="space-y-6">
        {/* Bildirim İzni */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Bildirim Durumu
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {getStatusText(notificationStatus)}
              </p>
            </div>
            <button
              onClick={handleEnableNotifications}
              disabled={loading || notificationStatus === 'denied'}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                notificationStatus === 'granted'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : notificationStatus === 'denied'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 cursor-not-allowed'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50'
              }`}
            >
              {loading ? 'İşleniyor...' : notificationStatus === 'granted' ? 'Bildirimler Etkin' : 'Bildirimlere İzin Ver'}
            </button>
          </div>
        </div>
        
        {/* Bildirim Test Butonu */}
        {notificationStatus === 'granted' && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Bildirim Testi
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Bildirimlerin düzgün çalışıp çalışmadığını test edin
                </p>
              </div>
              <button
                onClick={handleTestNotification}
                disabled={testingNotification}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 flex items-center space-x-1"
              >
                {testingNotification ? (
                  'Test Ediliyor...'
                ) : (
                  <>
                    <BellRing className="h-4 w-4 mr-1" />
                    <span>Test Et</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bildirim Tercihleri */}
        {notificationStatus === 'granted' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
              Bildirim Tercihleri
            </h4>
            
            {isLoadingPreferences ? (
              <div className="flex justify-center py-4">
                <svg className="animate-spin h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                  <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
                    Randevu Hatırlatıcıları
                  </h5>
                  
                  <div className="space-y-3 ml-6">
                    <div className="flex items-center">
                      <input
                        id="reminder_30min"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-primary-500"
                        checked={preferences.appointment_reminder_30min}
                        onChange={() => handlePreferenceChange('appointment_reminder_30min')}
                      />
                      <label htmlFor="reminder_30min" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                        30 dakika önce hatırlat
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="reminder_1hour"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-primary-500"
                        checked={preferences.appointment_reminder_1hour}
                        onChange={() => handlePreferenceChange('appointment_reminder_1hour')}
                      />
                      <label htmlFor="reminder_1hour" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                        1 saat önce hatırlat
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="reminder_1day"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-primary-500"
                        checked={preferences.appointment_reminder_1day}
                        onChange={() => handlePreferenceChange('appointment_reminder_1day')}
                      />
                      <label htmlFor="reminder_1day" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                        1 gün önce hatırlat
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                  <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
                    Durum Değişiklikleri
                  </h5>
                  
                  <div className="space-y-3 ml-6">
                    <div className="flex items-center">
                      <input
                        id="cancelled"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-primary-500"
                        checked={preferences.appointment_cancelled}
                        onChange={() => handlePreferenceChange('appointment_cancelled')}
                      />
                      <label htmlFor="cancelled" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                        Randevu iptal edildiğinde bildir
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="rescheduled"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-primary-500"
                        checked={preferences.appointment_rescheduled}
                        onChange={() => handlePreferenceChange('appointment_rescheduled')}
                      />
                      <label htmlFor="rescheduled" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                        Randevu zamanı değiştiğinde bildir
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pb-4">
                  <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
                    Mesajlar
                  </h5>
                  
                  <div className="space-y-3 ml-6">
                    <div className="flex items-center">
                      <input
                        id="new_message"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-primary-500"
                        checked={preferences.new_message}
                        onChange={() => handlePreferenceChange('new_message')}
                      />
                      <label htmlFor="new_message" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                        Yeni mesaj geldiğinde bildir
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSavePreferences}
                    disabled={savingPreferences}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none transition-colors"
                  >
                    {savingPreferences ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Kaydediliyor...
                      </>
                    ) : (
                      'Tercihleri Kaydet'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {notificationStatus === 'granted' && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                Kayıtlı Cihazlar
              </h4>
              
              {isLoadingSubscriptions ? (
                <div className="flex justify-center py-4">
                  <svg className="animate-spin h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : subscriptions.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Henüz kayıtlı cihaz bulunmuyor. Bildirimleri her cihazda ayrı ayrı etkinleştirmeniz gerekir.
                </p>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map(subscription => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {new URL(subscription.endpoint).hostname}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Kayıt: {formatCreatedAt(subscription.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="ml-4 p-1 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                        title="Cihazı sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              Bildirimleri tamamen kapatmak için tarayıcı ayarlarından site izinlerini düzenlemeniz gerekir.
            </p>
          </>
        )}
      </div>
    </div>
  );
} 