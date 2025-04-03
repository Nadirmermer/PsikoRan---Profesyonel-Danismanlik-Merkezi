import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Client, Professional } from '../types/database';
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  ArrowDownUp,
  User,
  Plus,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../lib/auth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { motion } from 'framer-motion';

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
  const [sortBy, setSortBy] = useState('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    professionalId: undefined as string | undefined,
  });
  
  const navigate = useNavigate();
  const { professional, assistant } = useAuth();
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadClients();
    if (assistant) {
      loadProfessionals();
    }
  }, [professional?.id, assistant, sortBy, sortOrder, filters]);

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
        .order(sortBy, { ascending: sortOrder === 'asc' });

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

      // Filtre uygulamaları
      if (filters.professionalId) {
        query = query.eq('professional_id', filters.professionalId);
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

  function handleSortChange(field: string) {
    if (sortBy === field) {
      // Aynı alana tıklandıysa sıralama yönünü değiştir
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Farklı bir alana tıklandıysa, o alanı seç ve varsayılan 'asc' yap
      setSortBy(field);
      setSortOrder('asc');
    }
  }

  function resetFilters() {
    setFilters({
      professionalId: undefined
    });
    setSortBy('full_name');
    setSortOrder('asc');
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
      <LoadingSpinner fullPage size="medium" showLoadingText={false} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(120,119,198,0.1),transparent)]"></div>
          <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full opacity-30 bg-primary-400 dark:bg-primary-600 blur-3xl"></div>
          <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full opacity-20 bg-indigo-400 dark:bg-indigo-600 blur-3xl"></div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md shadow-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
            >
              Danışanlar
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end"
            >
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-600/20 dark:shadow-blue-600/10 transition-all duration-200 flex items-center justify-center sm:justify-start space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Yeni Danışan</span>
              </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col space-y-4 mb-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-auto flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Danışan ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {assistant && professionals.length > 0 && (
                  <div className="relative z-20" ref={filterRef}>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filtrele</span>
                    </button>
                    
                    {showFilters && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-30">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Danışan Filtreleri</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              Ruh sağlığı uzmanı
                            </label>
                            <select
                              value={filters.professionalId || ''}
                              onChange={(e) => setFilters(prev => ({
                                ...prev, 
                                professionalId: e.target.value || undefined
                              }))}
                              className="w-full h-8 px-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                            >
                              <option value="">Tüm Uzmanlar</option>
                              {professionals.map(prof => (
                                <option key={prof.id} value={prof.id}>
                                  {prof.full_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={resetFilters}
                              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-md transition-all"
                            >
                              Filtreleri Sıfırla
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <ArrowDownUp className="h-4 w-4" />
                  <span className="hidden sm:inline">{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Danışan Listesi
            </h2>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredClients.length} danışan
            </div>
          </motion.div>

          {/* Danışan Tablosu */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-gray-700/40">
                    <th 
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/70"
                      onClick={() => handleSortChange('full_name')}
                    >
                      <div className="flex items-center">
                        <span>Ad Soyad</span>
                        {sortBy === 'full_name' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    {assistant && (
                      <th 
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/70"
                        onClick={() => handleSortChange('professional_id')}
                      >
                        <div className="flex items-center">
                          <span>Ruh sağlığı uzmanı</span>
                          {sortBy === 'professional_id' && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    <th 
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      İletişim
                    </th>
                    <th 
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/70"
                      onClick={() => handleSortChange('session_fee')}
                    >
                      <div className="flex items-center">
                        <span>Seans Ücreti</span>
                        {sortBy === 'session_fee' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Paylaşım
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={assistant ? 6 : 5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">Danışan Bulunamadı</p>
                          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                            Seçilen kriterlere uygun danışan bulunamadı. Filtrelerinizi değiştirerek tekrar deneyebilirsiniz.
                          </p>
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Yeni Danışan Ekle</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client, index) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors duration-150 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-medium">
                              {client.full_name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {client.full_name}
                              </div>
                              {client.birth_date && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {format(new Date(client.birth_date), 'dd.MM.yyyy', {
                                    locale: tr,
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {assistant && (
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {client.professional?.full_name || "Atanmamış"}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.email && (
                              <div className="flex items-center space-x-2 mb-1">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3.5 w-3.5" />
                                <span>{client.phone}</span>
                              </div>
                            )}
                            {!client.email && !client.phone && (
                              <span className="text-gray-400 dark:text-gray-500 italic">İletişim bilgisi yok</span>
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
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 mb-1">
                              <span>Uzman: %{client.professional_share_percentage}</span>
                            </div>
                            <div className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/20 px-2 py-1 text-xs text-purple-600 dark:text-purple-400">
                              <span>Klinik: %{client.clinic_share_percentage}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(client);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-400/10 rounded-lg transition-colors duration-150"
                              title="Düzenle"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(client.id);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10 rounded-lg transition-colors duration-150"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-gray-200/50 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto"
          >
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
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => 
                        setFormData({
                          ...formData,
                          email: e.target.value.toLowerCase()
                        })
                      }
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
          </motion.div>
        </div>
      )}

      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-gray-200/50 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Danışan Düzenle
              </h2>
              <button
                onClick={() => {
                  setSelectedClient(null);
                  setShowEditModal(false);
                }}
                className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditClient} className="space-y-6">
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
                      id="edit-email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  />
                </div>
              </div>

              <div className="flex justify-end items-center space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
          </motion.div>
        </div>
      )}
    </div>
  );
}
