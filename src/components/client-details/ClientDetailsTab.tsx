import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Client } from '../../types/client';
import { Pencil, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientDetailsTabProps {
  client: Client;
  loadClient?: () => Promise<boolean>;
}

export const ClientDetailsTab: React.FC<ClientDetailsTabProps> = ({ client, loadClient }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>(client);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  async function handleUpdateClient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { professional, ...dataToUpdate } = formData;
      
      const { error } = await supabase
        .from('clients')
        .update(dataToUpdate)
        .eq('id', client.id);

      if (error) throw error;

      if (loadClient) {
        await loadClient();
      }
      setEditMode(false);
      alert('Danışan bilgileri başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Danışan bilgileri güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteClient() {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      setIsDeleteModalOpen(false);
      alert('Danışan başarıyla silindi.');
      navigate('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Danışan silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve İşlem Butonları */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Danışan Bilgileri</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setEditMode(true)}
            className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Düzenle
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Sil
          </button>
        </div>
      </div>

      {!editMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              Ad Soyad
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {client.full_name}
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              E-posta
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {client.email}
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              Telefon
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {client.phone || '-'}
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              Doğum Tarihi
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {client.birth_date || '-'}
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              Seans Ücreti
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {client.session_fee.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              Ruh Sağlığı Uzmanı
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {client.professional?.full_name || '-'}
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              Ruh Sağlığı Uzmanı Payı
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              %{client.professional_share_percentage}
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              Klinik Payı
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              %{client.clinic_share_percentage}
            </p>
          </div>
          <div className="md:col-span-2 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              Notlar
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap">
              {client.notes || '-'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Düzenleme Modalı */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-gray-200/50 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Danışan Bilgilerini Düzenle
              </h2>
              <button
                onClick={() => setEditMode(false)}
                className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Danışanın adı ve soyadı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Doğum Tarihi
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.birth_date || ''}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seans Ücreti (₺)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">₺</div>
                    <input
                      type="number"
                      required
                      value={formData.session_fee || ''}
                      onChange={(e) => setFormData({ ...formData, session_fee: Number(e.target.value) })}
                      className="w-full h-12 pl-8 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="1000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ruh Sağlığı Uzmanı Payı (%)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">%</div>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={formData.professional_share_percentage || ''}
                      onChange={(e) => {
                        const profShare = Number(e.target.value);
                        setFormData({
                          ...formData,
                          professional_share_percentage: profShare,
                          clinic_share_percentage: 100 - profShare,
                        });
                      }}
                      className="w-full h-12 pl-8 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="70"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Klinik Payı (%)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">%</div>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={formData.clinic_share_percentage || ''}
                      onChange={(e) => {
                        const clinicShare = Number(e.target.value);
                        setFormData({
                          ...formData,
                          clinic_share_percentage: clinicShare,
                          professional_share_percentage: 100 - clinicShare,
                        });
                      }}
                      className="w-full h-12 pl-8 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="30"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Danışan hakkında eklemek istediğiniz notlar..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end items-center space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-6 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Kaydediliyor...</span>
                    </div>
                  ) : (
                    'Kaydet'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                Danışanı Sil
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 flex items-center justify-center rounded-full">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    "{client.full_name}" adlı danışanı silmek istediğinizden emin misiniz?
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Bu işlem geri alınamaz ve danışana ait tüm veriler (randevular, test sonuçları, notlar) silinecektir.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end items-center space-x-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                İptal
              </button>
              <button
                onClick={handleDeleteClient}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Siliniyor...</span>
                  </div>
                ) : (
                  'Sil'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetailsTab; 