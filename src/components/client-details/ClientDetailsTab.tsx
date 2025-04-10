import React, { useState, useEffect, Fragment } from 'react';
import { supabase } from '../../lib/supabase';
import { Client } from '../../types/client';
import { 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  CreditCard, 
  Wallet, 
  Building2, 
  FileText, 
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';

interface ClientDetailsTabProps {
  client: Client;
  loadClient?: () => Promise<boolean>;
}

export const ClientDetailsTab: React.FC<ClientDetailsTabProps> = ({ client, loadClient }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>(client);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // useNavigate hook'u isteğe bağlı olarak kullanılacak
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Router bağlamında değilsek, bir dummy fonksiyon kullan
    navigate = (path: string) => {
      console.log('Navigation used outside Router context to: ', path);
      // Eğer istenirse burada window.location.href = path; ile yönlendirme yapılabilir
    };
  }

  // Form verilerini güncelle
  useEffect(() => {
    setFormData(client);
  }, [client]);

  // Animasyon varyantları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.97, transition: { duration: 0.1 } },
  };

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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // 3 saniye sonra başarı mesajını kapat
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
      alert('Danışan başarıyla silindi');
      navigate('/danisanlar');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Danışan silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Başlık ve İşlem Butonları */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4"
      >
        <h2 className="text-base sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Danışan Bilgileri
        </h2>
        <div className="flex space-x-2">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setEditMode(true)}
            className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-sm transition-all duration-200"
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Düzenle
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 dark:from-red-500 dark:to-rose-500 dark:hover:from-red-600 dark:hover:to-rose-600 shadow-sm transition-all duration-200"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Sil
          </motion.button>
        </div>
      </motion.div>

      {!editMode ? (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/40 dark:to-gray-700/40 shadow-sm rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-2">
              <User className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Ad Soyad
              </h3>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {client.full_name}
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/40 dark:to-gray-700/40 shadow-sm rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-2">
              <Mail className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                E-posta
              </h3>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {client.email}
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/40 dark:to-gray-700/40 shadow-sm rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-2">
              <Phone className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Telefon
              </h3>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {client.phone || '-'}
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/40 dark:to-gray-700/40 shadow-sm rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-2">
              <Calendar className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Doğum Tarihi
              </h3>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {client.birth_date || '-'}
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/40 dark:to-gray-700/40 shadow-sm rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-2">
              <CreditCard className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Seans Ücreti
              </h3>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {client.session_fee.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/40 dark:to-gray-700/40 shadow-sm rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-2">
              <User className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Ruh Sağlığı Uzmanı
              </h3>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {client.professional?.full_name || '-'}
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/40 dark:to-gray-700/40 shadow-sm rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-2">
              <Wallet className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Ruh Sağlığı Uzmanı Payı
              </h3>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              %{client.professional_share_percentage}
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/40 dark:to-gray-700/40 shadow-sm rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-2">
              <Building2 className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Klinik Payı
              </h3>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              %{client.clinic_share_percentage}
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/40 dark:to-gray-700/40 shadow-sm rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-2">
              <FileText className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Notlar
              </h3>
            </div>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap">
              {client.notes || '-'}
            </p>
          </motion.div>
        </motion.div>
      ) : null}

      {/* Düzenleme Modalı */}
      <AnimatePresence>
        {editMode && (
          <Transition show={editMode} as={Fragment}>
            <Dialog
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] overflow-y-auto"
              onClose={() => setEditMode(false)}
            >
              <div className="flex min-h-screen items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all" />
                </Transition.Child>

                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-gray-200/50 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto z-[101] relative mx-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      Danışan Bilgilerini Düzenle
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditMode(false)}
                      className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-colors duration-200"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </motion.button>
                  </div>
                  
                  <form onSubmit={handleUpdateClient} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div 
                        className="md:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ad Soyad
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={formData.full_name || ''}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Danışanın adı ve soyadı"
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          E-posta
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="ornek@email.com"
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
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
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
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
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
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
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                      >
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
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
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
                      </motion.div>
                      
                      <motion.div 
                        className="md:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                      >
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
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="flex justify-end items-center space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-6 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
                      >
                        İptal
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Kaydediliyor...</span>
                          </div>
                        ) : (
                          'Kaydet'
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </motion.div>
              </div>
            </Dialog>
          </Transition>
        )}
      </AnimatePresence>

      {/* Silme Onay Modalı */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <Transition show={isDeleteModalOpen} as={Fragment}>
            <Dialog
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] overflow-y-auto"
              onClose={() => setIsDeleteModalOpen(false)}
            >
              <div className="flex min-h-screen items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all" />
                </Transition.Child>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-gray-200/50 dark:border-gray-700/50 z-[101] relative mx-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                      Danışanı Sil
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-colors duration-200"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </motion.button>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl"
                  >
                    <div className="flex items-start space-x-3">
                      <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1, rotate: [0, -5, 0, 5, 0] }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 flex items-center justify-center rounded-full"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </motion.div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          "{client.full_name}" adlı danışanı silmek istediğinizden emin misiniz?
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Bu işlem geri alınamaz ve danışana ait tüm veriler (randevular, test sonuçları, notlar) silinecektir.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="flex justify-end items-center space-x-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-6 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
                      disabled={loading}
                    >
                      İptal
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDeleteClient}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 dark:from-red-500 dark:to-rose-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Siliniyor...</span>
                        </div>
                      ) : (
                        'Sil'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </Dialog>
          </Transition>
        )}
      </AnimatePresence>
      
      {/* Başarı Bildirimi Modalı */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-500/80 dark:to-emerald-500/80 text-white px-6 py-4 rounded-xl shadow-xl z-[100] flex items-center space-x-3 max-w-sm backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex-shrink-0 bg-white/20 rounded-full p-1"
            >
              <CheckCircle2 className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="font-medium text-sm">İşlem Başarılı</h3>
              <p className="text-xs opacity-90">Danışan bilgileri başarıyla güncellendi.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientDetailsTab; 