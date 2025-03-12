import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Client, Professional } from '../types/database';
import { UserPlus, Pencil, Trash2, Search, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../lib/auth';

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    professionalId: '',
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    notes: '',
    sessionFee: '',
    professionalSharePercentage: '70',
    clinicSharePercentage: '30',
  });
  const navigate = useNavigate();
  const { professional, assistant } = useAuth();

  useEffect(() => {
    loadClients();
    if (assistant) {
      loadProfessionals();
    }
  }, [professional?.id, assistant]);

  async function loadClients() {
    try {
      setLoading(true);
      let query = supabase
        .from('clients')
        .select(
          `
          *,
          professional:professionals(full_name)
        `
        )
        .order('full_name');

      if (professional) {
        query = query.eq('professional_id', professional.id);
      } else if (assistant) {
        const { data: managedProfessionals } = await supabase
          .from('professionals')
          .select('id')
          .eq('assistant_id', assistant.id);

        if (managedProfessionals) {
          const professionalIds = managedProfessionals.map(p => p.id);
          query = query.in('professional_id', professionalIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert('Danışanlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function loadProfessionals() {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('assistant_id', assistant?.id)
        .order('full_name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
      alert('Ruh sağlığı uzmanları yüklenirken bir hata oluştu.');
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.professional?.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const newClient = {
        professional_id: professional?.id || formData.professionalId,
        full_name: formData.fullName,
        email: formData.email || null,
        phone: formData.phone || null,
        birth_date: formData.birthDate || null,
        notes: formData.notes || null,
        session_fee: Number(formData.sessionFee),
        professional_share_percentage: Number(formData.professionalSharePercentage),
        clinic_share_percentage: Number(formData.clinicSharePercentage),
      };

      if (!professional && !formData.professionalId) {
        throw new Error('Lütfen bir ruh sağlığı uzmanı seçin');
      }

      const { error } = await supabase.from('clients').insert([newClient]);

      if (error) throw error;

      setFormData({
        professionalId: '',
        fullName: '',
        email: '',
        phone: '',
        birthDate: '',
        notes: '',
        sessionFee: '',
        professionalSharePercentage: '70',
        clinicSharePercentage: '30',
      });
      setShowCreateModal(false);
      await loadClients();
    } catch (error) {
      console.error('Error creating client:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Danışan oluşturulurken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEditClient(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          professional_id: professional?.id || formData.professionalId,
          full_name: formData.fullName,
          email: formData.email || null,
          phone: formData.phone || null,
          birth_date: formData.birthDate || null,
          notes: formData.notes || null,
          session_fee: Number(formData.sessionFee),
          professional_share_percentage: Number(
            formData.professionalSharePercentage
          ),
          clinic_share_percentage: Number(formData.clinicSharePercentage),
        })
        .eq('id', selectedClient.id);

      if (error) throw error;

      setFormData({
        professionalId: '',
        fullName: '',
        email: '',
        phone: '',
        birthDate: '',
        notes: '',
        sessionFee: '',
        professionalSharePercentage: '70',
        clinicSharePercentage: '30',
      });
      setSelectedClient(null);
      setShowEditModal(false);
      await loadClients();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Danışan güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteClient(clientId: string) {
    if (!window.confirm('Bu danışanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve danışana ait tüm veriler (randevular, test atamaları ve ödemeler) silinecektir.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Silme hatası:', error);
        throw new Error('Danışan silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }

      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      alert('Danışan ve ilişkili tüm veriler başarıyla silindi!');
    } catch (error: any) {
      console.error('Danışan silinirken hata:', error);
      alert(
        error.message ||
          'Danışan silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      );
    }
  }

  function handleEditClick(client: Client) {
    setSelectedClient(client);
    setFormData({
      professionalId: client.professional_id,
      fullName: client.full_name,
      email: client.email || '',
      phone: client.phone || '',
      birthDate: client.birth_date || '',
      notes: client.notes || '',
      sessionFee: client.session_fee.toString(),
      professionalSharePercentage:
        client.professional_share_percentage.toString(),
      clinicSharePercentage: client.clinic_share_percentage.toString(),
    });
    setShowEditModal(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Danışanlar
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          <span>Yeni Danışan</span>
        </button>
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Danışan veya Ruh sağlığı uzmanı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ad Soyad
                </th>
                {assistant && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ruh sağlığı uzmanı
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Seans Ücreti
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Paylaşım
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {client.full_name}
                    </div>
                    {client.birth_date && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(client.birth_date), 'dd.MM.yyyy', {
                          locale: tr,
                        })}
                      </div>
                    )}
                  </td>
                  {assistant && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {client.professional?.full_name}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {client.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {Number(client.session_fee).toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <span>Ruh sağlığı uzmanı:</span>
                        <span className="font-medium">%{client.professional_share_percentage}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Klinik:</span>
                        <span className="font-medium">%{client.clinic_share_percentage}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(client);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-400/10 rounded-lg transition-colors duration-150"
                        title="Düzenle"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10 rounded-lg transition-colors duration-150"
                        title="Sil"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-gray-200/50 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Yeni Danışan Ekle
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assistant && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ruh sağlığı uzmanı
                    </label>
                    <select
                      required
                      value={formData.professionalId}
                      onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Ruh sağlığı uzmanı Seçin</option>
                      {professionals.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                      value={formData.email}
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="(555) 123 4567"
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
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      min="1900-01-01"
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seans Ücreti
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">₺</div>
                    <input
                      type="number"
                      required
                      value={formData.sessionFee}
                      onChange={(e) => setFormData({ ...formData, sessionFee: e.target.value })}
                      className="w-full h-12 pl-8 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ruh sağlığı uzmanı Payı (%)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">%</div>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={formData.professionalSharePercentage}
                      onChange={(e) => {
                        const profShare = Number(e.target.value);
                        setFormData({
                          ...formData,
                          professionalSharePercentage: e.target.value,
                          clinicSharePercentage: (100 - profShare).toString(),
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
                      value={formData.clinicSharePercentage}
                      onChange={(e) => {
                        const clinicShare = Number(e.target.value);
                        setFormData({
                          ...formData,
                          clinicSharePercentage: e.target.value,
                          professionalSharePercentage: (100 - clinicShare).toString(),
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
                    value={formData.notes}
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
                  onClick={() => setShowCreateModal(false)}
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

      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-gray-200/50 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Danışan Düzenle
            </h2>
            <form onSubmit={handleEditClient} className="space-y-4">
              {assistant && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ruh sağlığı uzmanı
                  </label>
                  <select
                    required
                    value={formData.professionalId}
                    onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Ruh sağlığı uzmanı Seçin</option>
                    {professionals.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Doğum Tarihi
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seans Ücreti
                </label>
                <input
                  type="number"
                  required
                  value={formData.sessionFee}
                  onChange={(e) => setFormData({ ...formData, sessionFee: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ruh sağlığı uzmanı Payı (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.professionalSharePercentage}
                    onChange={(e) => {
                      const profShare = Number(e.target.value);
                      setFormData({
                        ...formData,
                        professionalSharePercentage: e.target.value,
                        clinicSharePercentage: (100 - profShare).toString(),
                      });
                    }}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Klinik Payı (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.clinicSharePercentage}
                    onChange={(e) => {
                      const clinicShare = Number(e.target.value);
                      setFormData({
                        ...formData,
                        clinicSharePercentage: e.target.value,
                        professionalSharePercentage: (100 - clinicShare).toString(),
                      });
                    }}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="flex justify-end items-center space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setShowEditModal(false);
                  }}
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
    </div>
  );
}
