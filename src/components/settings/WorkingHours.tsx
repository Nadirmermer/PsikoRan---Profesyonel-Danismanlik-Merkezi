import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

export interface WorkingHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface WorkingHoursProps {
  type?: 'professional' | 'clinic';
  isEditable?: boolean;
}

const defaultHours: Record<string, WorkingHour> = {
  monday: { day: 'Pazartesi', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { day: 'Salı', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { day: 'Çarşamba', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { day: 'Perşembe', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  friday: { day: 'Cuma', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { day: 'Cumartesi', isOpen: false, openTime: '10:00', closeTime: '15:00' },
  sunday: { day: 'Pazar', isOpen: false, openTime: '10:00', closeTime: '15:00' },
};

export function WorkingHours({ type = 'professional', isEditable = true }: WorkingHoursProps) {
  const { user, professional, assistant } = useAuth();
  const [hours, setHours] = useState<Record<string, WorkingHour>>(defaultHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadWorkingHours();
    }
  }, [user, type]);

  const loadWorkingHours = async () => {
    try {
      setLoading(true);
      setError(null);

      if (type === 'professional' && professional) {
        // Profesyonel kullanıcının çalışma saatlerini yükle
        const { data, error } = await supabase
          .from('professional_working_hours')
          .select('*')
          .eq('professional_id', professional.id)
          .single();

        if (error) {
          // Eğer kayıt bulunamazsa varsayılan saatleri kullan
          if (error.code === 'PGRST116') {
            setHours(defaultHours);
          } else {
            throw error;
          }
        } else if (data && data.hours) {
          setHours(data.hours);
        }
      } else if (type === 'clinic') {
        let assistantId = null;
        
        if (assistant) {
          // Asistan olarak giriş yapılmışsa, kendi ID'sini kullan
          assistantId = assistant.id;
        } else if (professional?.assistant_id) {
          // Profesyonel olarak giriş yapılmışsa, bağlı olduğu asistanın ID'sini kullan
          assistantId = professional.assistant_id;
        }
        
        if (!assistantId) {
          throw new Error('Klinik çalışma saatlerini yüklemek için asistan bilgisi gerekli.');
        }

        // Klinik çalışma saatlerini assistantId üzerinden yükle
        const { data, error } = await supabase
          .from('clinic_settings')
          .select('working_hours')
          .eq('assistant_id', assistantId)
          .single();

        if (error) {
          // Eğer kayıt bulunamazsa varsayılan saatleri kullan
          if (error.code === 'PGRST116') {
            setHours(defaultHours);
          } else {
            throw error;
          }
        } else if (data && data.working_hours) {
          setHours(data.working_hours);
        }
      }
    } catch (err) {
      console.error('Çalışma saatleri yüklenirken hata:', err);
      setError('Çalışma saatleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);

      if (type === 'professional' && professional) {
        // Profesyonel çalışma saatlerini güncelle
        // Önce mevcut bir kayıt var mı kontrol edelim
        const { data: existingRecord, error: fetchError } = await supabase
          .from('professional_working_hours')
          .select('id')
          .eq('professional_id', professional.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        if (existingRecord?.id) {
          // Mevcut kaydı güncelle
          const { error: updateError } = await supabase
            .from('professional_working_hours')
            .update({ hours })
            .eq('id', existingRecord.id);

          if (updateError) throw updateError;
        } else {
          // Yeni kayıt oluştur
          const { error: insertError } = await supabase
            .from('professional_working_hours')
            .insert([{ professional_id: professional.id, hours }]);

          if (insertError) throw insertError;
        }
      } else if (type === 'clinic') {
        let assistantId = null;
        
        if (assistant) {
          // Asistan olarak giriş yapılmışsa, kendi ID'sini kullan
          assistantId = assistant.id;
        } else if (professional?.assistant_id) {
          // Profesyonel olarak giriş yapılmışsa, bağlı olduğu asistanın ID'sini kullan
          assistantId = professional.assistant_id;
        }
        
        if (!assistantId) {
          throw new Error('Klinik çalışma saatlerini güncellemek için asistan bilgisi gerekli.');
        }
        
        // Klinik çalışma saatlerini güncelle - önce veritabanında kaydın olup olmadığını kontrol edelim
        const { data: existingSettings, error: checkError } = await supabase
          .from('clinic_settings')
          .select('id')
          .eq('assistant_id', assistantId)
          .maybeSingle();
          
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        
        if (existingSettings?.id) {
          // Mevcut kaydı güncelle
          const { error: updateError } = await supabase
            .from('clinic_settings')
            .update({
              working_hours: hours,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSettings.id);
  
          if (updateError) throw updateError;
        } else {
          // Yeni kayıt oluştur
          const { error: insertError } = await supabase
            .from('clinic_settings')
            .insert([{
              assistant_id: assistantId,
              working_hours: hours,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
  
          if (insertError) throw insertError;
        }
      }
    } catch (err) {
      console.error('Çalışma saatleri güncellenirken hata:', err);
      setError('Çalışma saatleri güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDay = (day: string) => {
    if (!isEditable) return;
    
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const handleTimeChange = (day: string, field: 'openTime' | 'closeTime', value: string) => {
    if (!isEditable) return;
    
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {type === 'professional' ? 'Çalışma Saatleri' : 'Klinik Çalışma Saatleri'}
          </h3>
        </div>
        
        {isEditable && (
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {Object.entries(hours).map(([key, hour]) => (
          <div 
            key={key}
            className={`flex flex-col p-3 rounded-md ${
              hour.isOpen 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30' 
                : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-slate-900 dark:text-white flex items-center">
                <span className="w-20">{hour.day}</span>
                <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {hour.isOpen ? 'Açık' : 'Kapalı'}
                </span>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleToggleDay(key)}
                  disabled={!isEditable}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    hour.isOpen ? 'bg-primary-500 dark:bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                  } ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-label={hour.isOpen ? `${hour.day} gününü kapat` : `${hour.day} gününü aç`}
                >
                  <span className="sr-only">{hour.isOpen ? 'Açık' : 'Kapalı'}</span>
                  <span
                    className={`${
                      hour.isOpen ? 'translate-x-5' : 'translate-x-0'
                    } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center`}
                  >
                    {hour.isOpen ? (
                      <Check className="h-3 w-3 text-primary-500" />
                    ) : (
                      <X className="h-3 w-3 text-slate-400" />
                    )}
                  </span>
                </button>
              </div>
            </div>
            
            <div className={`flex flex-col xs:flex-row justify-between gap-2 ${!hour.isOpen ? 'opacity-50' : ''}`}>
              <div className="relative flex-1">
                <label htmlFor={`${key}-open`} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Açılış
                </label>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400 absolute left-2.5" />
                  <select
                    id={`${key}-open`}
                    value={hour.openTime}
                    onChange={(e) => handleTimeChange(key, 'openTime', e.target.value)}
                    disabled={!hour.isOpen || !isEditable}
                    className="w-full pl-8 rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-700"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>{`${i
                        .toString()
                        .padStart(2, '0')}:00`}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-center my-2 xs:my-0">
                <span className="w-6 h-px bg-slate-300 dark:bg-slate-600 block xs:hidden"></span>
                <span className="text-slate-500 dark:text-slate-400 hidden xs:block">-</span>
              </div>
              
              <div className="relative flex-1">
                <label htmlFor={`${key}-close`} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kapanış
                </label>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400 absolute left-2.5" />
                  <select
                    id={`${key}-close`}
                    value={hour.closeTime}
                    onChange={(e) => handleTimeChange(key, 'closeTime', e.target.value)}
                    disabled={!hour.isOpen || !isEditable}
                    className="w-full pl-8 rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-700"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>{`${i
                        .toString()
                        .padStart(2, '0')}:00`}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 