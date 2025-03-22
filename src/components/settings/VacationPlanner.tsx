import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, Save, CalendarOff, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface Vacation {
  id: string;
  start_date: string;
  end_date: string;
  title: string;
  description: string;
}

interface VacationPlannerProps {
  type: 'professional' | 'clinic';
  isEditable?: boolean;
}

export function VacationPlanner({ type, isEditable = true }: VacationPlannerProps) {
  const { user, professional, assistant } = useAuth();
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingVacation, setIsAddingVacation] = useState(false);
  const [formData, setFormData] = useState<Omit<Vacation, 'id'>>({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Bir gün sonra
    title: 'Tatil',
    description: ''
  });

  useEffect(() => {
    if (user) {
      loadVacations();
    }
  }, [user, type]);

  const loadVacations = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      let error;

      if (type === 'professional' && professional) {
        // Profesyonel tatillerini yükle
        ({ data, error } = await supabase
          .from('vacations')
          .select('*')
          .eq('professional_id', professional.id)
          .is('clinic_id', null)
          .order('start_date', { ascending: false }));
      } else if (type === 'clinic' && assistant) {
        // Klinik tatillerini yükle
        ({ data, error } = await supabase
          .from('vacations')
          .select('*')
          .eq('clinic_id', assistant.id)
          .is('professional_id', null)
          .order('start_date', { ascending: false }));
      } else if (type === 'clinic' && professional?.assistant_id) {
        // Profesyonelin çalıştığı kliniğin tatillerini yükle
        ({ data, error } = await supabase
          .from('vacations')
          .select('*')
          .eq('clinic_id', professional.assistant_id)
          .is('professional_id', null)
          .order('start_date', { ascending: false }));
      }

      if (error) throw error;
      setVacations(data || []);
    } catch (err) {
      console.error('Tatiller yüklenirken hata:', err);
      setError('Tatiller yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      title: 'Tatil',
      description: ''
    });
    setIsAddingVacation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditable) return;
    
    // Tarih kontrolü
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('Başlangıç tarihi bitiş tarihinden önce olmalıdır.');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      if (type === 'professional' && professional) {
        // Profesyonel tatili ekle
        const { error } = await supabase
          .from('vacations')
          .insert({
            professional_id: professional.id,
            clinic_id: null,
            ...formData
          });
          
        if (error) throw error;
      } else if (type === 'clinic' && assistant) {
        // Klinik tatili ekle
        const { error } = await supabase
          .from('vacations')
          .insert({
            professional_id: null,
            clinic_id: assistant.id,
            ...formData
          });
        
        if (error) throw error;
      }
      
      await loadVacations();
      resetForm();
    } catch (err: any) {
      console.error('Tatil kaydedilirken hata:', err);
      setError('Tatil kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vacationId: string) => {
    if (!isEditable) return;
    
    if (!window.confirm('Bu tatili silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('vacations')
        .delete()
        .eq('id', vacationId);
        
      if (error) throw error;
      
      await loadVacations();
    } catch (err) {
      console.error('Tatil silinirken hata:', err);
      setError('Tatil silinemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Tarihi formatla (2023-01-01 -> 01.01.2023)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // İki tarih arasındaki gün sayısını hesapla
  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

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
          <CalendarOff className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {type === 'professional' ? 'İzin ve Tatil Planlama' : 'Klinik Tatil Planlama'}
          </h3>
        </div>
        
        {isEditable && (
          <button
            onClick={() => setIsAddingVacation(!isAddingVacation)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Yeni Tatil
          </button>
        )}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-md p-3 mb-4 flex items-start">
        <Info className="h-5 w-5 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
        <div className="text-sm text-indigo-800 dark:text-indigo-300">
          <p>
            {type === 'professional' 
              ? 'Yıllık izin, seminer, konferans veya diğer nedenlerle çalışılmayacak günleri planlamanızı sağlar.' 
              : 'Klinik genelinde tatil, bakım veya özel nedenlerle kapalı olacak günleri planlayabilirsiniz.'}
          </p>
          <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-400">
            Not: Bu bölümde planlanan tatiller, çalışma saatlerinizden bağımsız olarak tam gün kapalı olacağınızı belirtir.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
      
      {isAddingVacation && isEditable && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Başlık
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Örn: Yıllık İzin"
                required
                className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="İsteğe bağlı açıklama"
                rows={2}
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
      
      {vacations.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
          <CalendarOff className="h-12 w-12 mx-auto text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Tatil Bulunamadı</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Henüz planlanmış bir tatil bulunmuyor.
          </p>
          {isEditable && (
            <button
              onClick={() => setIsAddingVacation(true)}
              className="mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-3 w-3 mr-1" />
              Tatil Ekle
            </button>
          )}
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          {vacations.map(vacation => (
            <div 
              key={vacation.id}
              className="relative flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex-1 mb-3 md:mb-0">
                <div className="flex items-start md:items-center mb-1 md:mb-0 flex-col md:flex-row md:space-x-2">
                  <h4 className="text-base font-medium text-slate-900 dark:text-white">
                    {vacation.title}
                  </h4>
                  <div className="flex mt-1 md:mt-0 space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      {formatDate(vacation.start_date)} - {formatDate(vacation.end_date)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {calculateDays(vacation.start_date, vacation.end_date)} gün
                    </span>
                  </div>
                </div>
                
                {vacation.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {vacation.description}
                  </p>
                )}
              </div>
              
              {isEditable && (
                <button
                  onClick={() => handleDelete(vacation.id)}
                  className="absolute top-2 right-2 md:relative md:top-auto md:right-auto p-1.5 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 