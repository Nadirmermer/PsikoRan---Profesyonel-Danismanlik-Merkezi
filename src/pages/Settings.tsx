import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Room as DatabaseRoom } from '../types/database';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Clock,
  Building2,
  User,
  Lock,
  Mail,
  Phone,
  X,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PWASettings } from '../components/PWASettings';

interface DayHours {
  opening: string;
  closing: string;
  isOpen: boolean;
}

interface ClinicHours {
  pazartesi: DayHours;
  sali: DayHours;
  carsamba: DayHours;
  persembe: DayHours;
  cuma: DayHours;
  cumartesi: DayHours;
  pazar: DayHours;
}

type ProfessionalWorkingHours = ClinicHours;

interface ProfessionalData {
  full_name: string;
  title: string;
  email: string;
  phone: string;
}

interface AssistantData {
  full_name: string;
  clinic_name: string;
  phone: string;
}

interface ClinicInfo {
  clinic_name: string | null;
  assistant_name: string | null;
  assistant_phone: string | null; // Asistan telefon numarası için yeni alan
}

interface Room extends Omit<DatabaseRoom, 'description' | 'capacity'> {
  description?: string;
  capacity: number;
}

// Modal bileşeni
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full mx-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  const { professional, assistant, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<DatabaseRoom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<DatabaseRoom | null>(null);
  
  // Modal state'leri
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showClinicHoursModal, setShowClinicHoursModal] = useState(false);
  const [showProfessionalWorkingHoursModal, setShowProfessionalWorkingHoursModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Form state'leri
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 1,
  });

  const [professionalData, setProfessionalData] = useState({
    full_name: '',
    title: '',
    email: '',
    phone: '',
  });

  const [assistantData, setAssistantData] = useState({
    full_name: '',
    clinic_name: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const [clinicHours, setClinicHours] = useState<ClinicHours>({
    pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
    sali: { opening: '09:00', closing: '18:00', isOpen: true },
    carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
    persembe: { opening: '09:00', closing: '18:00', isOpen: true },
    cuma: { opening: '09:00', closing: '18:00', isOpen: true },
    cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
    pazar: { opening: '09:00', closing: '18:00', isOpen: false }
  });

  const [professionalWorkingHours, setProfessionalWorkingHours] = useState<ProfessionalWorkingHours>({
    pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
    sali: { opening: '09:00', closing: '18:00', isOpen: true },
    carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
    persembe: { opening: '09:00', closing: '18:00', isOpen: true },
    cuma: { opening: '09:00', closing: '18:00', isOpen: true },
    cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
    pazar: { opening: '09:00', closing: '18:00', isOpen: false }
  });

  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({
    clinic_name: null,
    assistant_name: null,
    assistant_phone: null, // Yeni alan için başlangıç değeri
  });

  useEffect(() => {
    if (loading) return;

    const initializePage = async () => {
      try {
        if (professional) {
          await loadClinicInfo();
          await loadProfessionalData();
          await loadClinicHours();
          await loadRooms();
          await loadProfessionalWorkingHours();
        } else if (assistant) {
          await loadClinicInfo();
          await loadAssistantData();
          await loadClinicHours();
          await loadRooms();
        } else {
          console.error('No professional or assistant data found');
        }
      } catch (error) {
        console.error('Error initializing page:', error);
      }
    };

    initializePage();
  }, [loading, professional, assistant]);

  // Tüm fonksiyonları tanımla
  async function loadClinicInfo() {
    try {
      if (professional) {
        const { data: profData, error: profError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professional.id)
          .maybeSingle();

        if (profError) {
          setClinicInfo({
            clinic_name: 'Profesyonel bilgilerine erişilemiyor',
            assistant_name: 'Lütfen sistem yöneticinizle iletişime geçin',
            assistant_phone: '-'
          });
          return;
        }

        if (!profData) {
          setClinicInfo({
            clinic_name: 'Profesyonel bilgileri bulunamadı',
            assistant_name: 'Lütfen sistem yöneticinizle iletişime geçin',
            assistant_phone: '-'
          });
          return;
        }

        if (profData.assistant_id) {
          try {
            const { data: assistantData, error: assistantError } = await supabase
              .from('assistants')
              .select('*')
              .eq('id', profData.assistant_id)
              .maybeSingle();

            if (assistantError && assistantError.code !== 'PGRST116') {
              setClinicInfo({
                clinic_name: 'Asistan bilgilerine erişilemiyor',
                assistant_name: 'Lütfen sistem yöneticinizle iletişime geçin',
                assistant_phone: '-'
              });
              return;
            }

            if (assistantData) {
              setClinicInfo({
                clinic_name: assistantData.clinic_name || 'Klinik adı belirtilmemiş',
                assistant_name: assistantData.full_name || 'İsim belirtilmemiş',
                assistant_phone: assistantData.phone || '-'
              });
            } else {
              setClinicInfo({
                clinic_name: 'Asistan bulunamadı',
                assistant_name: 'Lütfen sistem yöneticinizle iletişime geçin',
                assistant_phone: '-'
              });
            }
          } catch (error) {
            setClinicInfo({
              clinic_name: 'Asistan bilgilerine erişilemiyor',
              assistant_name: 'Lütfen sistem yöneticinizle iletişime geçin',
              assistant_phone: '-'
            });
          }
        } else if (assistant) {
          setClinicInfo({
            clinic_name: assistant.clinic_name || 'Klinik adı belirtilmemiş',
            assistant_name: assistant.full_name || 'İsim belirtilmemiş',
            assistant_phone: assistant.phone || '-'
          });
        } else {
          setClinicInfo({
            clinic_name: 'Asistan atanmamış',
            assistant_name: 'Lütfen sistem yöneticinizle iletişime geçin',
            assistant_phone: '-'
          });
        }
      } else if (assistant) {
        setClinicInfo({
          clinic_name: assistant.clinic_name || 'Klinik adı belirtilmemiş',
          assistant_name: assistant.full_name || 'İsim belirtilmemiş',
          assistant_phone: assistant.phone || '-'
        });
      } else {
        setClinicInfo({
          clinic_name: 'Kullanıcı bilgisi bulunamadı',
          assistant_name: 'Lütfen sistem yöneticinizle iletişime geçin',
          assistant_phone: '-'
        });
      }
    } catch (error) {
      setClinicInfo({
        clinic_name: 'Klinik bilgilerine erişilemiyor',
        assistant_name: 'Lütfen sistem yöneticinizle iletişime geçin',
        assistant_phone: '-'
      });
    }
  }

  async function loadAssistantData() {
    try {
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .eq('id', assistant?.id)
        .single();

      if (error) throw error;

      if (data) {
        setAssistantData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          clinic_name: data.clinic_name || '',
        });
      }
    } catch (error) {
      console.error('Error loading assistant data:', error);
    }
  }

  async function loadClinicHours() {
    try {
      if (professional) {
        const { data: prof, error: profError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professional.id)
          .maybeSingle();

        if (profError) {
          console.error('Error loading professional for clinic hours:', profError);
          return;
        }

        if (!prof) {
          console.error('Professional data not found for clinic hours');
          return;
        }

        if (prof.assistant_id) {
          const { data: assistantExists, error: assistantError } = await supabase
            .from('assistants')
            .select('id')
            .eq('id', prof.assistant_id)
            .maybeSingle();

          if (assistantError && assistantError.code !== 'PGRST116') {
            console.error('Error checking assistant existence:', assistantError);
            return;
          }

          if (!assistantExists) {
            return;
          }

          const { data: clinicSettings, error: settingsError } = await supabase
            .from('clinic_settings')
            .select('*')
            .eq('assistant_id', prof.assistant_id)
            .maybeSingle();

          if (settingsError) {
            console.error('Error loading clinic settings:', settingsError);
            return;
          }

          if (clinicSettings) {
            setClinicHours({
              pazartesi: {
                opening: clinicSettings.opening_time_monday || '09:00',
                closing: clinicSettings.closing_time_monday || '18:00',
                isOpen: clinicSettings.is_open_monday || false
              },
              sali: {
                opening: clinicSettings.opening_time_tuesday || '09:00',
                closing: clinicSettings.closing_time_tuesday || '18:00',
                isOpen: clinicSettings.is_open_tuesday || false
              },
              carsamba: {
                opening: clinicSettings.opening_time_wednesday || '09:00',
                closing: clinicSettings.closing_time_wednesday || '18:00',
                isOpen: clinicSettings.is_open_wednesday || false
              },
              persembe: {
                opening: clinicSettings.opening_time_thursday || '09:00',
                closing: clinicSettings.closing_time_thursday || '18:00',
                isOpen: clinicSettings.is_open_thursday || false
              },
              cuma: {
                opening: clinicSettings.opening_time_friday || '09:00',
                closing: clinicSettings.closing_time_friday || '18:00',
                isOpen: clinicSettings.is_open_friday || false
              },
              cumartesi: {
                opening: clinicSettings.opening_time_saturday || '09:00',
                closing: clinicSettings.closing_time_saturday || '18:00',
                isOpen: clinicSettings.is_open_saturday || false
              },
              pazar: {
                opening: clinicSettings.opening_time_sunday || '09:00',
                closing: clinicSettings.closing_time_sunday || '18:00',
                isOpen: clinicSettings.is_open_sunday || false
              }
            });
          }
        }
      } else if (assistant) {
        const { data: clinicSettings, error: settingsError } = await supabase
          .from('clinic_settings')
          .select('*')
          .eq('assistant_id', assistant.id)
          .maybeSingle();

        if (settingsError) {
          console.error('Error loading clinic settings for assistant:', settingsError);
          return;
        }

        if (clinicSettings) {
          setClinicHours({
            pazartesi: {
              opening: clinicSettings.opening_time_monday || '09:00',
              closing: clinicSettings.closing_time_monday || '18:00',
              isOpen: clinicSettings.is_open_monday || false
            },
            sali: {
              opening: clinicSettings.opening_time_tuesday || '09:00',
              closing: clinicSettings.closing_time_tuesday || '18:00',
              isOpen: clinicSettings.is_open_tuesday || false
            },
            carsamba: {
              opening: clinicSettings.opening_time_wednesday || '09:00',
              closing: clinicSettings.closing_time_wednesday || '18:00',
              isOpen: clinicSettings.is_open_wednesday || false
            },
            persembe: {
              opening: clinicSettings.opening_time_thursday || '09:00',
              closing: clinicSettings.closing_time_thursday || '18:00',
              isOpen: clinicSettings.is_open_thursday || false
            },
            cuma: {
              opening: clinicSettings.opening_time_friday || '09:00',
              closing: clinicSettings.closing_time_friday || '18:00',
              isOpen: clinicSettings.is_open_friday || false
            },
            cumartesi: {
              opening: clinicSettings.opening_time_saturday || '09:00',
              closing: clinicSettings.closing_time_saturday || '18:00',
              isOpen: clinicSettings.is_open_saturday || false
            },
            pazar: {
              opening: clinicSettings.opening_time_sunday || '09:00',
              closing: clinicSettings.closing_time_sunday || '18:00',
              isOpen: clinicSettings.is_open_sunday || false
            }
          });
        }
      }
    } catch (error) {
      console.error('Error in loadClinicHours:', error);
    }
  }

  async function loadRooms() {
    try {
      // Skip if assistant doesn't exist
      if (!assistant?.id) return;
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('assistant_id', assistant.id)
        .order('name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('rooms').insert([
        {
          assistant_id: assistant?.id,
          name: formData.name,
          description: formData.description || null,
          capacity: formData.capacity,
        },
      ]);

      if (error) throw error;

      setFormData({
        name: '',
        description: '',
        capacity: 1,
      });
      setShowCreateModal(false);
      await loadRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Oda oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEditRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoom) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: formData.name,
          description: formData.description || null,
          capacity: formData.capacity,
        })
        .eq('id', selectedRoom.id)
        .eq('assistant_id', assistant?.id);

      if (error) throw error;

      setFormData({
        name: '',
        description: '',
        capacity: 1,
      });
      setSelectedRoom(null);
      setShowEditModal(false);
      await loadRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Oda güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateClinicHours(e: React.FormEvent) {
    e.preventDefault();
    
    if (!assistant?.id) {
      alert('Asistan bilgisi bulunamadı.');
      return;
    }
    
    setLoading(true);

    try {
      // Önce mevcut kayıt var mı kontrol et
      const { data: existingSettings } = await supabase
        .from('clinic_settings')
        .select('id')
        .eq('assistant_id', assistant.id)
        .single();

      if (existingSettings) {
        // Mevcut kaydı güncelle
        const { error } = await supabase
          .from('clinic_settings')
          .update({
            opening_time_monday: clinicHours.pazartesi.opening,
            closing_time_monday: clinicHours.pazartesi.closing,
            is_open_monday: clinicHours.pazartesi.isOpen,
            opening_time_tuesday: clinicHours.sali.opening,
            closing_time_tuesday: clinicHours.sali.closing,
            is_open_tuesday: clinicHours.sali.isOpen,
            opening_time_wednesday: clinicHours.carsamba.opening,
            closing_time_wednesday: clinicHours.carsamba.closing,
            is_open_wednesday: clinicHours.carsamba.isOpen,
            opening_time_thursday: clinicHours.persembe.opening,
            closing_time_thursday: clinicHours.persembe.closing,
            is_open_thursday: clinicHours.persembe.isOpen,
            opening_time_friday: clinicHours.cuma.opening,
            closing_time_friday: clinicHours.cuma.closing,
            is_open_friday: clinicHours.cuma.isOpen,
            opening_time_saturday: clinicHours.cumartesi.opening,
            closing_time_saturday: clinicHours.cumartesi.closing,
            is_open_saturday: clinicHours.cumartesi.isOpen,
            opening_time_sunday: clinicHours.pazar.opening,
            closing_time_sunday: clinicHours.pazar.closing,
            is_open_sunday: clinicHours.pazar.isOpen
          })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Yeni kayıt oluştur
        const { error } = await supabase
          .from('clinic_settings')
          .insert([{
            assistant_id: assistant.id,
            opening_time_monday: clinicHours.pazartesi.opening,
            closing_time_monday: clinicHours.pazartesi.closing,
            is_open_monday: clinicHours.pazartesi.isOpen,
            opening_time_tuesday: clinicHours.sali.opening,
            closing_time_tuesday: clinicHours.sali.closing,
            is_open_tuesday: clinicHours.sali.isOpen,
            opening_time_wednesday: clinicHours.carsamba.opening,
            closing_time_wednesday: clinicHours.carsamba.closing,
            is_open_wednesday: clinicHours.carsamba.isOpen,
            opening_time_thursday: clinicHours.persembe.opening,
            closing_time_thursday: clinicHours.persembe.closing,
            is_open_thursday: clinicHours.persembe.isOpen,
            opening_time_friday: clinicHours.cuma.opening,
            closing_time_friday: clinicHours.cuma.closing,
            is_open_friday: clinicHours.cuma.isOpen,
            opening_time_saturday: clinicHours.cumartesi.opening,
            closing_time_saturday: clinicHours.cumartesi.closing,
            is_open_saturday: clinicHours.cumartesi.isOpen,
            opening_time_sunday: clinicHours.pazar.opening,
            closing_time_sunday: clinicHours.pazar.closing,
            is_open_sunday: clinicHours.pazar.isOpen
          }]);

        if (error) throw error;
      }

      setShowClinicHoursModal(false);
      await loadClinicHours();
      alert('Çalışma saatleri başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating clinic hours:', error);
      alert('Çalışma saatleri güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateAssistant(e: React.FormEvent) {
    e.preventDefault();
    
    if (!assistant?.id) {
      alert('Asistan bilgisi bulunamadı.');
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('assistants')
        .update({
          full_name: assistantData.full_name,
          clinic_name: assistantData.clinic_name,
          phone: assistantData.phone || null,
        })
        .eq('id', assistant.id);

      if (error) throw error;

      setShowAssistantModal(false);
      await loadAssistantData();
      alert('Bilgileriniz başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating assistant:', error);
      alert('Bilgileriniz güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

      if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor.');
      setLoading(false);
      return;
      }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert('Şifreniz başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Şifre güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRoom(roomId: string) {
    if (!window.confirm('Bu odayı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      // First check if there are any appointments for this room
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('room_id', roomId)
        .limit(1);

      if (appointmentsError) throw appointmentsError;

      if (appointments && appointments.length > 0) {
        alert('Bu odaya ait randevular bulunduğu için silinemez.');
        return;
      }

      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
        .eq('assistant_id', assistant?.id);

      if (error) throw error;

      await loadRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Oda silinirken bir hata oluştu.');
    }
  }

  function handleEditClick(room: Room) {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      capacity: room.capacity || 1,
    });
    setShowEditModal(true);
  }

  async function loadProfessionalData() {
    // Skip if professional doesn't exist
    if (!professional?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', professional.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfessionalData({
          full_name: data.full_name || '',
          title: data.title || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      }
    } catch (error) {
      console.error('Error loading professional data:', error);
    }
  }

  async function handleUpdateProfessional(e: React.FormEvent) {
    e.preventDefault();
    
    // Skip if professional doesn't exist
    if (!professional?.id) {
      alert('Profesyonel bilgisi bulunamadı.');
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          full_name: professionalData.full_name,
          title: professionalData.title || null,
          email: professionalData.email || null,
          phone: professionalData.phone || null,
        })
        .eq('id', professional.id);

      if (error) throw error;

      setShowProfessionalModal(false);
      await loadProfessionalData();
      alert('Bilgileriniz başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating professional:', error);
      alert('Bilgileriniz güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  // Hesap silme fonksiyonu
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteAccountLoading(true);
    setDeleteAccountError('');

    try {
      // Önce şifreyi doğrula
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: deleteAccountPassword,
      });

      if (signInError) {
        setDeleteAccountError('Şifre yanlış. Lütfen tekrar deneyin.');
        setDeleteAccountLoading(false);
        return;
      }

      // Profesyonel/Asistan verilerini sil
      if (professional) {
        // 1. Test sonuçlarını sil
        const { error: testResultsError } = await supabase
          .from('test_results')
          .delete()
          .eq('professional_id', professional.id);

        if (testResultsError) throw testResultsError;

        // 2. Seans notlarını sil
        const { error: sessionNotesError } = await supabase
          .from('session_notes')
          .delete()
          .eq('professional_id', professional.id);

        if (sessionNotesError) throw sessionNotesError;

        // 3. Ödemeleri sil
        const { error: paymentsError } = await supabase
          .from('payments')
          .delete()
          .eq('professional_id', professional.id);

        if (paymentsError) throw paymentsError;

        // 4. Randevuları sil
        const { error: appointmentsError } = await supabase
          .from('appointments')
          .delete()
          .eq('professional_id', professional.id);

        if (appointmentsError) throw appointmentsError;

        // 5. Çalışma saatlerini sil
        const { error: workingHoursError } = await supabase
          .from('professional_working_hours')
          .delete()
          .eq('professional_id', professional.id);

        if (workingHoursError) throw workingHoursError;

        // 6. Danışanları sil
        const { error: clientsError } = await supabase
          .from('clients')
          .delete()
          .eq('professional_id', professional.id);

        if (clientsError) throw clientsError;

        // 7. Ruh sağlığı uzmanı kaydını sil
        const { error: professionalError } = await supabase
          .from('professionals')
          .delete()
          .eq('id', professional.id);

        if (professionalError) throw professionalError;

      } else if (assistant) {
        // 1. Bağlı ruh sağlığı uzmanlarının tüm verilerini sil
        const { data: professionals, error: profError } = await supabase
          .from('professionals')
          .select('id, user_id')
          .eq('assistant_id', assistant.id);

        if (profError) throw profError;

        for (const prof of professionals || []) {
          // Her ruh sağlığı uzmanı için ilişkili verileri sil
          await supabase.from('test_results').delete().eq('professional_id', prof.id);
          await supabase.from('session_notes').delete().eq('professional_id', prof.id);
          await supabase.from('payments').delete().eq('professional_id', prof.id);
          await supabase.from('appointments').delete().eq('professional_id', prof.id);
          await supabase.from('professional_working_hours').delete().eq('professional_id', prof.id);
          await supabase.from('clients').delete().eq('professional_id', prof.id);

          // Ruh sağlığı uzmanının auth hesabını devre dışı bırak
          await supabase.auth.admin.updateUserById(
            prof.user_id,
            { user_metadata: { deleted: true }, app_metadata: { deleted: true } }
          );
        }

        // 2. Ruh sağlığı uzmanlarını sil
        await supabase
          .from('professionals')
          .delete()
          .eq('assistant_id', assistant.id);

        // 3. Odaları sil
        await supabase
          .from('rooms')
          .delete()
          .eq('assistant_id', assistant.id);

        // 4. Klinik ayarlarını sil
        await supabase
          .from('clinic_settings')
          .delete()
          .eq('assistant_id', assistant.id);

        // 5. Asistanı sil
        await supabase
          .from('assistants')
          .delete()
          .eq('id', assistant.id);
      }

      // Kullanıcı hesabını devre dışı bırak
      await supabase.auth.admin.updateUserById(
        user?.id || '',
        { user_metadata: { deleted: true }, app_metadata: { deleted: true } }
      );

      // Oturumu kapat
      await supabase.auth.signOut();

      // Ana sayfaya yönlendir
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteAccountError('Hesap silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setDeleteAccountLoading(false);
    }
  };

  async function loadProfessionalWorkingHours() {
    try {
      if (!professional?.id) return;

      const { data, error } = await supabase
        .from('professional_working_hours')
        .select('*')
        .eq('professional_id', professional.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no rows

      // If no data found, we'll use the default values already set in state
      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error

      if (data) {
        setProfessionalWorkingHours({
          pazartesi: {
            opening: data.opening_time_monday,
            closing: data.closing_time_monday,
            isOpen: data.is_open_monday ?? true
          },
          sali: {
            opening: data.opening_time_tuesday,
            closing: data.closing_time_tuesday,
            isOpen: data.is_open_tuesday ?? true
          },
          carsamba: {
            opening: data.opening_time_wednesday,
            closing: data.closing_time_wednesday,
            isOpen: data.is_open_wednesday ?? true
          },
          persembe: {
            opening: data.opening_time_thursday,
            closing: data.closing_time_thursday,
            isOpen: data.is_open_thursday ?? true
          },
          cuma: {
            opening: data.opening_time_friday,
            closing: data.closing_time_friday,
            isOpen: data.is_open_friday ?? true
          },
          cumartesi: {
            opening: data.opening_time_saturday,
            closing: data.closing_time_saturday,
            isOpen: data.is_open_saturday ?? false
          },
          pazar: {
            opening: data.opening_time_sunday,
            closing: data.closing_time_sunday,
            isOpen: data.is_open_sunday ?? false
          }
        });
      }
    } catch (error) {
      console.error('Error loading professional working hours:', error);
    }
  }

  async function handleUpdateProfessionalWorkingHours(e: React.FormEvent) {
    e.preventDefault();
    
    if (!professional?.id) {
      alert('Profesyonel bilgisi bulunamadı.');
      return;
    }
    
    setLoading(true);

    try {
      // Önce mevcut kayıt var mı kontrol et
      const { data: existingSettings } = await supabase
        .from('professional_working_hours')
        .select('id')
        .eq('professional_id', professional.id)
        .single();

      if (existingSettings) {
        // Mevcut kaydı güncelle
        const { error } = await supabase
          .from('professional_working_hours')
          .update({
            opening_time_monday: professionalWorkingHours.pazartesi.opening,
            closing_time_monday: professionalWorkingHours.pazartesi.closing,
            is_open_monday: professionalWorkingHours.pazartesi.isOpen,
            opening_time_tuesday: professionalWorkingHours.sali.opening,
            closing_time_tuesday: professionalWorkingHours.sali.closing,
            is_open_tuesday: professionalWorkingHours.sali.isOpen,
            opening_time_wednesday: professionalWorkingHours.carsamba.opening,
            closing_time_wednesday: professionalWorkingHours.carsamba.closing,
            is_open_wednesday: professionalWorkingHours.carsamba.isOpen,
            opening_time_thursday: professionalWorkingHours.persembe.opening,
            closing_time_thursday: professionalWorkingHours.persembe.closing,
            is_open_thursday: professionalWorkingHours.persembe.isOpen,
            opening_time_friday: professionalWorkingHours.cuma.opening,
            closing_time_friday: professionalWorkingHours.cuma.closing,
            is_open_friday: professionalWorkingHours.cuma.isOpen,
            opening_time_saturday: professionalWorkingHours.cumartesi.opening,
            closing_time_saturday: professionalWorkingHours.cumartesi.closing,
            is_open_saturday: professionalWorkingHours.cumartesi.isOpen,
            opening_time_sunday: professionalWorkingHours.pazar.opening,
            closing_time_sunday: professionalWorkingHours.pazar.closing,
            is_open_sunday: professionalWorkingHours.pazar.isOpen
          })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Yeni kayıt oluştur
        const { error } = await supabase
          .from('professional_working_hours')
          .insert([{
            professional_id: professional.id,
            opening_time_monday: professionalWorkingHours.pazartesi.opening,
            closing_time_monday: professionalWorkingHours.pazartesi.closing,
            is_open_monday: professionalWorkingHours.pazartesi.isOpen,
            opening_time_tuesday: professionalWorkingHours.sali.opening,
            closing_time_tuesday: professionalWorkingHours.sali.closing,
            is_open_tuesday: professionalWorkingHours.sali.isOpen,
            opening_time_wednesday: professionalWorkingHours.carsamba.opening,
            closing_time_wednesday: professionalWorkingHours.carsamba.closing,
            is_open_wednesday: professionalWorkingHours.carsamba.isOpen,
            opening_time_thursday: professionalWorkingHours.persembe.opening,
            closing_time_thursday: professionalWorkingHours.persembe.closing,
            is_open_thursday: professionalWorkingHours.persembe.isOpen,
            opening_time_friday: professionalWorkingHours.cuma.opening,
            closing_time_friday: professionalWorkingHours.cuma.closing,
            is_open_friday: professionalWorkingHours.cuma.isOpen,
            opening_time_saturday: professionalWorkingHours.cumartesi.opening,
            closing_time_saturday: professionalWorkingHours.cumartesi.closing,
            is_open_saturday: professionalWorkingHours.cumartesi.isOpen,
            opening_time_sunday: professionalWorkingHours.pazar.opening,
            closing_time_sunday: professionalWorkingHours.pazar.closing,
            is_open_sunday: professionalWorkingHours.pazar.isOpen
          }]);

        if (error) throw error;
      }

      setShowProfessionalWorkingHoursModal(false);
      await loadProfessionalWorkingHours();
      alert('Çalışma saatleri başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating professional working hours:', error);
      alert('Çalışma saatleri güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

    return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>

        {/* Hesap Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-6">
          {/* ... existing account settings code ... */}
        </div>

        {/* PWA Ayarları */}
        <PWASettings />

        {/* Odalar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-6">
          {/* ... existing rooms code ... */}
        </div>

        {/* ... rest of the code ... */}
      </div>
    </div>
  );
}