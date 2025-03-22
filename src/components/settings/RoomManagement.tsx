import React, { useState, useEffect } from 'react';
import { DoorOpen, Plus, Edit2, Trash2, Save, X, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface Room {
  id: string;
  assistant_id: string;
  name: string;
  description?: string;
  capacity: number;
}

interface RoomManagementProps {
  isViewOnly?: boolean;
}

export function RoomManagement({ isViewOnly = false }: RoomManagementProps) {
  const { professional, assistant } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    capacity: number;
  }>({
    name: '',
    description: '',
    capacity: 1
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      let assistantId = null;
        
      if (assistant) {
        // Asistan olarak giriş yapılmışsa, kendi ID'sini kullan
        assistantId = assistant.id;
      } else if (professional?.assistant_id) {
        // Profesyonel olarak giriş yapılmışsa, bağlı olduğu asistanın ID'sini kullan
        assistantId = professional.assistant_id;
      }

      if (!assistantId) {
        throw new Error('Odaları yüklemek için asistan bilgisi gerekli.');
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('assistant_id', assistantId)
        .order('name');
      
      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      console.error('Odalar yüklenirken hata:', err);
      setError('Odalar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 1 : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: 1
    });
    setIsAddingRoom(false);
    setEditingRoom(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return; // Görüntüleme modunda ise işlem yapma
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Asistan ID'sini belirle
    let assistantId = null;
        
    if (assistant) {
      // Asistan olarak giriş yapılmışsa, kendi ID'sini kullan
      assistantId = assistant.id;
    } else if (professional?.assistant_id) {
      // Profesyonel olarak giriş yapılmışsa, bağlı olduğu asistanın ID'sini kullan
      assistantId = professional.assistant_id;
    }

    if (!assistantId) {
      setError('Oda eklemek/düzenlemek için asistan bilgisi gerekli.');
      setLoading(false);
      return;
    }

    try {
      if (editingRoom) {
        const { error } = await supabase
          .from('rooms')
          .update({
            name: formData.name,
            description: formData.description,
            capacity: formData.capacity
          })
          .eq('id', editingRoom.id);

        if (error) throw error;
        setSuccess(`"${formData.name}" odası başarıyla güncellendi.`);
      } else {
        const { error } = await supabase
          .from('rooms')
          .insert([{
            assistant_id: assistantId,
            name: formData.name,
            description: formData.description,
            capacity: formData.capacity
          }]);

        if (error) throw error;
        setSuccess(`"${formData.name}" odası başarıyla eklendi.`);
      }

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => setSuccess(null), 3000);

      await loadRooms();
      resetForm();
    } catch (err) {
      console.error('Oda kaydedilirken hata:', err);
      setError('Oda kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: Room) => {
    if (isViewOnly) return; // Görüntüleme modunda ise işlem yapma
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      capacity: room.capacity
    });
    setIsAddingRoom(true);
  };

  const handleDelete = async (roomId: string) => {
    if (isViewOnly) return; // Görüntüleme modunda ise işlem yapma
    
    if (!window.confirm('Bu odayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;
      await loadRooms();
    } catch (err) {
      console.error('Oda silinirken hata:', err);
      setError('Oda silinemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <DoorOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {isViewOnly ? 'Oda Bilgileri' : 'Oda Yönetimi'}
          </h3>
        </div>
        {!isViewOnly && (
          <button
            onClick={() => setIsAddingRoom(!isAddingRoom)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            {isAddingRoom ? (
              <>
                <X className="h-4 w-4 mr-1.5" />
                Vazgeç
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Yeni Oda
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md flex items-center">
          <Info className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md flex items-center">
          <Info className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {isAddingRoom && !isViewOnly && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="text-base font-medium text-slate-900 dark:text-white mb-4">
            {editingRoom ? 'Oda Düzenle' : 'Yeni Oda Ekle'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="room-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Oda Adı
              </label>
              <input
                id="room-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Örn: Terapi Odası 1"
                className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="room-capacity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kapasite
              </label>
              <input
                id="room-capacity"
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                required
                placeholder="Kişi sayısı"
                className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm shadow-sm"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Odanın maksimum kişi kapasitesi
              </p>
            </div>

            <div>
              <label htmlFor="room-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Açıklama
              </label>
              <textarea
                id="room-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                placeholder="Oda özellikleri veya açıklaması"
                className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors w-full sm:w-auto"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              {loading ? (
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
                  {editingRoom ? 'Güncelle' : 'Kaydet'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div
            key={room.id}
            className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow transition-shadow"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-base font-medium text-slate-900 dark:text-white">
                  {room.name}
                </h4>
                {!isViewOnly && (
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 dark:text-slate-500 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Düzenle"
                      aria-label={`${room.name} odasını düzenle`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Sil"
                      aria-label={`${room.name} odasını sil`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                {room.description ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {room.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-3 line-clamp-2">
                    Açıklama yok
                  </p>
                )}
              </div>
              <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                  <DoorOpen className="h-3.5 w-3.5 mr-1.5" />
                  <span>Kapasite: <span className="font-semibold">{room.capacity}</span> kişi</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12 px-4">
          <DoorOpen className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Oda Bulunamadı</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Henüz hiç oda eklenmemiş.
          </p>
          {!isViewOnly && (
            <button
              onClick={() => setIsAddingRoom(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              İlk Odayı Ekle
            </button>
          )}
        </div>
      )}

      {loading && rooms.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 