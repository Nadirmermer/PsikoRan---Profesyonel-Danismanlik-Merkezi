import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Client } from '../../types/client';

interface ClientDetailsTabProps {
  client: Client;
  loadClient: () => Promise<void>;
}

export const ClientDetailsTab: React.FC<ClientDetailsTabProps> = ({ client, loadClient }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>(client);
  const [loading, setLoading] = useState(false);

  async function handleUpdateClient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', client.id);

      if (error) throw error;

      await loadClient();
      setEditMode(false);
      alert('Danışan bilgileri başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Danışan bilgileri güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {!editMode ? (
        <>
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
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              Notlar
            </h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap">
              {client.notes || '-'}
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setEditMode(true)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Düzenle
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleUpdateClient} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Doğum Tarihi
              </label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) =>
                  setFormData({ ...formData, birth_date: e.target.value })
                }
                className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Seans Ücreti
              </label>
              <input
                type="number"
                value={formData.session_fee || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    session_fee: Number(e.target.value),
                  })
                }
                className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Notlar
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ClientDetailsTab; 