import React, { useState, useEffect } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { requestNotificationPermission } from '../../utils/notificationUtils';

interface NotificationSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  created_at: string;
}

export function NotificationSettings() {
  const { user, professional, assistant } = useAuth();
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);

  useEffect(() => {
    // Bildirim durumunu kontrol et
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    // Bildirim aboneliklerini yükle
    loadSubscriptions();
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
      console.error('Bildirim abonelikleri yüklenirken hata:', error);
    } finally {
      setIsLoadingSubscriptions(false);
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
      }
    } catch (error) {
      console.error('Bildirim izni istenirken hata:', error);
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
      console.error('Abonelik silinirken hata:', error);
    }
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Bildirim Durumu
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {getStatusText(notificationStatus)}
            </p>
          </div>

          {notificationStatus !== 'denied' && (
            <button
              onClick={handleEnableNotifications}
              disabled={loading || notificationStatus === 'granted'}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                notificationStatus === 'granted'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                  : 'text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
              } focus:outline-none transition-colors`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  İşleniyor...
                </>
              ) : notificationStatus === 'granted' ? (
                'Bildirimler Etkin'
              ) : (
                'Bildirimleri Etkinleştir'
              )}
            </button>
          )}
        </div>

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
                  Henüz kayıtlı cihaz bulunmuyor.
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