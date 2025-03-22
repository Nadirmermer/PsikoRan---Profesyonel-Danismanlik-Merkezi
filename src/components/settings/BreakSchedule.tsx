import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, Coffee, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface Break {
  id: string;
  day_of_week: number; // 0: Pazar, 1: Pazartesi, ... 6: Cumartesi
  start_time: string; // HH:MM formatında
  end_time: string; // HH:MM formatında
  description: string;
}

interface BreakScheduleProps {
  type: 'professional' | 'clinic';
  isEditable?: boolean;
}

export function BreakSchedule({ type, isEditable = true }: BreakScheduleProps) {
  const { user, professional, assistant } = useAuth();
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingBreak, setIsAddingBreak] = useState(false);
  const [formData, setFormData] = useState<Omit<Break, 'id'>>({
    day_of_week: 1, // Pazartesi
    start_time: '12:00',
    end_time: '13:00',
    description: 'Öğle Molası'
  });

  // Günleri Türkçe olarak göster
  const getDayName = (dayIndex: number) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayIndex];
  };

  useEffect(() => {
    if (user) {
      loadBreaks();
    }
  }, [user, type]);

  const loadBreaks = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      let error;

      if (type === 'professional' && professional) {
        // Profesyonel molalarını yükle
        ({ data, error } = await supabase
          .from('professional_breaks')
          .select('*')
          .eq('professional_id', professional.id)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true }));
      } else if (type === 'clinic' && assistant) {
        // Klinik molalarını yükle
        ({ data, error } = await supabase
          .from('clinic_breaks')
          .select('*')
          .eq('clinic_id', assistant.id)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true }));
      } else if (type === 'clinic' && professional?.assistant_id) {
        // Profesyonelin çalıştığı kliniğin molalarını yükle
        ({ data, error } = await supabase
          .from('clinic_breaks')
          .select('*')
          .eq('clinic_id', professional.assistant_id)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true }));
      }

      if (error) throw error;
      setBreaks(data || []);
    } catch (err) {
      console.error('Molalar yüklenirken hata:', err);
      setError('Molalar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'day_of_week' ? parseInt(value, 10) : value
    }));
  };

  const resetForm = () => {
    setFormData({
      day_of_week: 1,
      start_time: '12:00',
      end_time: '13:00',
      description: 'Öğle Molası'
    });
    setIsAddingBreak(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditable) return;
    
    // Saat kontrolü
    if (formData.start_time >= formData.end_time) {
      setError('Başlangıç saati bitiş saatinden önce olmalıdır.');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      if (type === 'professional' && professional) {
        // Profesyonel molası ekle
        const { error } = await supabase
          .from('professional_breaks')
          .insert({
            professional_id: professional.id,
            ...formData
          });
          
        if (error) throw error;
      } else if (type === 'clinic' && assistant) {
        // Klinik molası ekle
        const { error } = await supabase
          .from('clinic_breaks')
          .insert({
            clinic_id: assistant.id,
            ...formData
          });
        
        if (error) throw error;
      }
      
      await loadBreaks();
      resetForm();
    } catch (err: any) {
      console.error('Mola kaydedilirken hata:', err);
      setError('Mola kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (breakId: string) => {
    if (!isEditable) return;
    
    if (!window.confirm('Bu molayı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tableName = type === 'professional' ? 'professional_breaks' : 'clinic_breaks';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', breakId);
        
      if (error) throw error;
      
      await loadBreaks();
    } catch (err) {
      console.error('Mola silinirken hata:', err);
      setError('Mola silinemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Molaları günlere göre grupla
  const breaksByDay = breaks.reduce((groups, breakItem) => {
    const day = breakItem.day_of_week;
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(breakItem);
    return groups;
  }, {} as Record<number, Break[]>);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Coffee className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {type === 'professional' ? 'Çalışma Molaları' : 'Klinik Çalışma Molaları'}
          </h3>
        </div>
        
        {isEditable && (
          <button
            onClick={() => setIsAddingBreak(!isAddingBreak)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Yeni Mola
          </button>
        )}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-md p-3 mb-4 flex items-start">
        <Info className="h-5 w-5 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
        <div className="text-sm text-indigo-800 dark:text-indigo-300">
          <p>
            Haftanın her günü için farklı çalışma molaları tanımlayabilirsiniz. Her gün için birden fazla mola ekleyebilirsiniz.
          </p>
          <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-400">
            Örnek: Pazartesi günleri 10:30-11:00 arası çay molası, 12:00-13:00 arası öğle molası.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
      
      {isAddingBreak && isEditable && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gün
              </label>
              <select
                name="day_of_week"
                value={formData.day_of_week}
                onChange={handleInputChange}
                className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <option key={day} value={day}>
                    {getDayName(day)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Başlangıç Saati
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bitiş Saati
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Açıklama
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Örn: Öğle Molası"
                className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      )}
      
      {Object.keys(breaksByDay).length === 0 ? (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
          <Coffee className="h-12 w-12 mx-auto text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Mola Bulunamadı</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Henüz planlanmış bir mola bulunmuyor.
          </p>
          {isEditable && (
            <button
              onClick={() => setIsAddingBreak(true)}
              className="mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-3 w-3 mr-1" />
              Mola Ekle
            </button>
          )}
        </div>
      ) : (
        <div className="mt-2 space-y-5">
          {[1, 2, 3, 4, 5, 6, 0]
            .filter(day => breaksByDay[day])
            .map(day => (
              <div key={day} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 flex items-center justify-between">
                  <h4 className="font-medium text-slate-800 dark:text-white">
                    {getDayName(day)}
                  </h4>
                  <span className="text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 py-1 px-2 rounded">
                    {breaksByDay[day].length} mola
                  </span>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {breaksByDay[day].map(breakItem => (
                    <div 
                      key={breakItem.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {breakItem.start_time} - {breakItem.end_time}
                          </div>
                          {breakItem.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {breakItem.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isEditable && (
                        <button
                          onClick={() => handleDelete(breakItem.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
} 