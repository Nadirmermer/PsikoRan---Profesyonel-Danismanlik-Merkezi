import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Professional } from '../types/database';
import { UserPlus, Pencil, Trash2, Search, Mail, Phone, Building2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface ProfessionalWorkingHours {
  pazartesi: { opening: string; closing: string; isOpen: boolean };
  sali: { opening: string; closing: string; isOpen: boolean };
  carsamba: { opening: string; closing: string; isOpen: boolean };
  persembe: { opening: string; closing: string; isOpen: boolean };
  cuma: { opening: string; closing: string; isOpen: boolean };
  cumartesi: { opening: string; closing: string; isOpen: boolean };
  pazar: { opening: string; closing: string; isOpen: boolean };
}

export function Professionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    email: '',
    password: '',
    phone: '',
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [professionalWorkingHours, setProfessionalWorkingHours] = useState<ProfessionalWorkingHours>({
    pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
    sali: { opening: '09:00', closing: '18:00', isOpen: true },
    carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
    persembe: { opening: '09:00', closing: '18:00', isOpen: true },
    cuma: { opening: '09:00', closing: '18:00', isOpen: true },
    cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
    pazar: { opening: '09:00', closing: '18:00', isOpen: false }
  });
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const { user, assistant } = useAuth();

  // Define loadProfessionals as a function in the component scope
  const loadProfessionals = async () => {
    try {
      if (!assistant?.id) return;
      
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('assistant_id', assistant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ruh sağlığı uzmanları yüklenirken hata:', error);
        alert('Ruh sağlığı uzmanları yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        return;
      }

      setProfessionals(data || []);
    } catch (error) {
      console.error('Ruh sağlığı uzmanları yüklenirken hata:', error);
      alert('Ruh sağlığı uzmanları yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    }
  };

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await loadProfessionals();
      } finally {
        setLoading(false);
      }
    };

    if (assistant?.id) {
      initializeData();
    } else {
      setLoading(false);
      setProfessionals([]);
    }
  }, [assistant?.id]);

  const filteredProfessionals = professionals.filter(
    (professional) =>
      professional.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleCreateProfessional(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!assistant?.id) {
        throw new Error('Asistan bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      }

      // First check if user exists
      const { data: existingProfessional } = await supabase
        .from('professionals')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      if (existingProfessional) {
        throw new Error('Bu e-posta adresi zaten kullanımda.');
      }

      // Create new user with professional role
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'professional',
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/login`
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error(
            'Bu e-posta adresi zaten kullanımda. Lütfen başka bir e-posta adresi deneyin.'
          );
        }
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('Kullanıcı hesabı oluşturulamadı');
      }

      // Create professional record using the current session
      const { error: professionalError } = await supabase
        .from('professionals')
        .insert({
          user_id: signUpData.user.id,
          full_name: formData.fullName,
          title: formData.title,
          email: formData.email,
          phone: formData.phone || null,
          assistant_id: assistant.id
        });

      if (professionalError) {
        throw new Error('Ruh sağlığı uzmanı kaydı oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
      }

      // Success - reset form
      setFormData({
        fullName: '',
        title: '',
        email: '',
        password: '',
        phone: '',
      });
      setShowCreateModal(false);

      // Reload the professionals list
      await loadProfessionals();

      alert('Ruh sağlığı uzmanı başarıyla eklendi! E-posta adresine gönderilen onay bağlantısını kullanarak hesabını aktifleştirebilir.');
    } catch (error: any) {
      console.error('Ruh sağlığı uzmanı oluşturulurken hata:', error);
      alert(
        error.message ||
        'Ruh sağlığı uzmanı hesabı oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  }
  
  async function handleEditProfessional(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProfessional) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          full_name: formData.fullName,
          title: formData.title,
          phone: formData.phone || null,
        })
        .eq('id', selectedProfessional.id);

      if (error) throw error;

      setFormData({
        fullName: '',
        title: '',
        email: '',
        password: '',
        phone: '',
      });
      setSelectedProfessional(null);
      setShowEditModal(false);
      await loadProfessionals();
      alert('Ruh sağlığı uzmanı başarıyla güncellendi!');
    } catch (error: any) {
      console.error('Ruh sağlığı uzmanı güncellenirken hata:', error);
      alert(
        error.message ||
          'Ruh sağlığı uzmanı güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteClick() {
    setShowDeleteConfirmModal(true);
    setDeletePassword('');
    setDeleteError('');
  }

  async function handleConfirmDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProfessional) return;
    setDeleteLoading(true);
    setDeleteError('');

    try {
      // Önce şifreyi doğrula
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: deletePassword,
      });

      if (signInError) {
        setDeleteError('Şifre yanlış. Lütfen tekrar deneyin.');
        setDeleteLoading(false);
        return;
      }

      // Önce ruh sağlığı uzmanının user_id'sini alalım
      const { data: profData, error: profError } = await supabase
        .from('professionals')
        .select('user_id')
        .eq('id', selectedProfessional.id)
        .single();

      if (profError) {
        throw new Error('Ruh sağlığı uzmanı bilgileri alınırken bir hata oluştu.');
      }

      if (!profData?.user_id) {
        throw new Error('Ruh sağlığı uzmanı kullanıcı bilgisi bulunamadı.');
      }

      // Sırasıyla ilişkili verileri silelim
      
      // 1. Test sonuçlarını sil
      const { error: testResultsError } = await supabase
        .from('test_results')
        .delete()
        .eq('professional_id', selectedProfessional.id);

      if (testResultsError) throw testResultsError;

      // 2. Seans notlarını sil
      const { error: sessionNotesError } = await supabase
        .from('session_notes')
        .delete()
        .eq('professional_id', selectedProfessional.id);

      if (sessionNotesError) throw sessionNotesError;

      // 3. Ödemeleri sil
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('professional_id', selectedProfessional.id);

      if (paymentsError) throw paymentsError;

      // 4. Randevuları sil
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .delete()
        .eq('professional_id', selectedProfessional.id);

      if (appointmentsError) throw appointmentsError;

      // 5. Çalışma saatlerini sil
      const { error: workingHoursError } = await supabase
        .from('professional_working_hours')
        .delete()
        .eq('professional_id', selectedProfessional.id);

      if (workingHoursError) throw workingHoursError;

      // 6. Danışanları sil
      const { error: clientsError } = await supabase
        .from('clients')
        .delete()
        .eq('professional_id', selectedProfessional.id);

      if (clientsError) throw clientsError;

      // 7. Ruh sağlığı uzmanı kaydını sil
      const { error: professionalError } = await supabase
        .from('professionals')
        .delete()
        .eq('id', selectedProfessional.id);

      if (professionalError) throw professionalError;

      // 8. Auth hesabını sil veya devre dışı bırak
      const { error: authError } = await supabase.auth.admin.updateUserById(
        profData.user_id,
        { user_metadata: { deleted: true }, app_metadata: { deleted: true } }
      );

      if (authError) throw authError;

      setShowDeleteConfirmModal(false);
      setShowDetailsModal(false);
      await loadProfessionals();
      alert('Ruh sağlığı uzmanı ve ilişkili tüm veriler başarıyla silindi!');
    } catch (error: any) {
      console.error('Ruh sağlığı uzmanı silinirken hata:', error);
      setDeleteError(error.message || 'Ruh sağlığı uzmanı silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleEditClick(professional: Professional) {
    setSelectedProfessional(professional);
    setFormData({
      fullName: professional.full_name,
      title: professional.title || '',
      email: professional.email || '',
      password: '',
      phone: professional.phone || '',
    });
    setShowEditModal(true);
  }

  async function loadProfessionalWorkingHours(professionalId: string) {
    try {
      // Önce ruh sağlığı uzmanının çalışma saatlerini kontrol et
      const { data: profData, error: profError } = await supabase
        .from('professional_working_hours')
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      if (profError && profError.code !== 'PGRST116') { // PGRST116: Kayıt bulunamadı hatası
        throw profError;
      }

      if (profData) {
        // Ruh sağlığı uzmanının kendi çalışma saatleri varsa onları kullan
        setProfessionalWorkingHours({
          pazartesi: {
            opening: profData.opening_time_monday,
            closing: profData.closing_time_monday,
            isOpen: profData.is_open_monday ?? true
          },
          sali: {
            opening: profData.opening_time_tuesday,
            closing: profData.closing_time_tuesday,
            isOpen: profData.is_open_tuesday ?? true
          },
          carsamba: {
            opening: profData.opening_time_wednesday,
            closing: profData.closing_time_wednesday,
            isOpen: profData.is_open_wednesday ?? true
          },
          persembe: {
            opening: profData.opening_time_thursday,
            closing: profData.closing_time_thursday,
            isOpen: profData.is_open_thursday ?? true
          },
          cuma: {
            opening: profData.opening_time_friday,
            closing: profData.closing_time_friday,
            isOpen: profData.is_open_friday ?? true
          },
          cumartesi: {
            opening: profData.opening_time_saturday,
            closing: profData.closing_time_saturday,
            isOpen: profData.is_open_saturday ?? false
          },
          pazar: {
            opening: profData.opening_time_sunday,
            closing: profData.closing_time_sunday,
            isOpen: profData.is_open_sunday ?? false
          }
        });
      } else {
        // Ruh sağlığı uzmanının çalışma saatleri yoksa, kliniğin saatlerini al
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinic_settings')
          .select('*')
          .eq('assistant_id', assistant?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (clinicError) throw clinicError;

        if (clinicData) {
          setProfessionalWorkingHours({
            pazartesi: {
              opening: clinicData.opening_time_monday,
              closing: clinicData.closing_time_monday,
              isOpen: clinicData.is_open_monday ?? true
            },
            sali: {
              opening: clinicData.opening_time_tuesday,
              closing: clinicData.closing_time_tuesday,
              isOpen: clinicData.is_open_tuesday ?? true
            },
            carsamba: {
              opening: clinicData.opening_time_wednesday,
              closing: clinicData.closing_time_wednesday,
              isOpen: clinicData.is_open_wednesday ?? true
            },
            persembe: {
              opening: clinicData.opening_time_thursday,
              closing: clinicData.closing_time_thursday,
              isOpen: clinicData.is_open_thursday ?? true
            },
            cuma: {
              opening: clinicData.opening_time_friday,
              closing: clinicData.closing_time_friday,
              isOpen: clinicData.is_open_friday ?? true
            },
            cumartesi: {
              opening: clinicData.opening_time_saturday,
              closing: clinicData.closing_time_saturday,
              isOpen: clinicData.is_open_saturday ?? false
            },
            pazar: {
              opening: clinicData.opening_time_sunday,
              closing: clinicData.closing_time_sunday,
              isOpen: clinicData.is_open_sunday ?? false
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading professional working hours:', error);
    }
  }

  function handleViewDetails(professional: Professional) {
    setSelectedProfessional(professional);
    loadProfessionalWorkingHours(professional.id);
    setShowDetailsModal(true);
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Ruh sağlığı uzmanları
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          <span>Yeni Ruh sağlığı uzmanı</span>
        </button>
      </div>

      {/* Search Section */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ruh sağlığı uzmanı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unvan
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İletişim
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProfessionals.map((professional) => (
                <tr 
                  key={professional.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer"
                  onClick={() => handleViewDetails(professional)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {professional.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {professional.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {professional.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{professional.email}</span>
                        </div>
                      )}
                      {professional.phone && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-4 w-4" />
                          <span>{professional.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Yeni Ruh sağlığı uzmanı Ekle
            </h2>
            <form onSubmit={handleCreateProfessional} className="space-y-4">
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
                  Unvan
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  autoComplete="new-password"
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
              <div className="flex justify-end items-center space-x-3 mt-6">
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

      {/* Edit Modal */}
      {showEditModal && selectedProfessional && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Ruh Sağlığı Uzmanını Düzenle
            </h2>
            <form onSubmit={handleEditProfessional} className="space-y-4">
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
                  Unvan
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <div className="flex justify-end items-center space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProfessional(null);
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

      {/* Detay Modalı */}
      {showDetailsModal && selectedProfessional && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {selectedProfessional.full_name}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditClick(selectedProfessional)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-400/10 rounded-lg transition-colors duration-150"
                  title="Düzenle"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10 rounded-lg transition-colors duration-150"
                  title="Sil"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Kişisel Bilgiler */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Kişisel Bilgiler
              </h3>
              <div className="space-y-3">
                {selectedProfessional.title && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Building2 className="h-5 w-5 mr-2" />
                    <span>{selectedProfessional.title}</span>
                  </div>
                )}
                {selectedProfessional.email && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{selectedProfessional.email}</span>
                  </div>
                )}
                {selectedProfessional.phone && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{selectedProfessional.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Çalışma Saatleri */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Çalışma Saatleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(professionalWorkingHours).map(([day, hours]) => (
                  <div key={day} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                      <span className={`text-sm ${
                        hours.isOpen 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {hours.isOpen ? 'Açık' : 'Kapalı'}
                      </span>
                    </div>
                    {hours.isOpen && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {hours.opening} - {hours.closing}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {showDeleteConfirmModal && selectedProfessional && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 mb-6">
              <Trash2 className="h-6 w-6" />
              <h2 className="text-xl font-bold">Ruh Sağlığı Uzmanını Sil</h2>
            </div>

            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-sm text-red-600 dark:text-red-300">
                <p className="mb-2">
                  <strong>{selectedProfessional.full_name}</strong> isimli ruh sağlığı uzmanını silmek üzeresiniz.
                </p>
                <p>
                  Bu işlem geri alınamaz ve ruh sağlığı uzmanına ait tüm veriler (danışanlar, randevular, test atamaları ve ödemeler) kalıcı olarak silinecektir.
                  Devam etmek için lütfen şifrenizi girin.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Şifreniz
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Şifrenizi girin"
                  autoComplete="current-password"
                />
              </div>

              {deleteError && (
                <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  {deleteError}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className="px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="px-4 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {deleteLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      <span>Sil</span>
                    </>
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