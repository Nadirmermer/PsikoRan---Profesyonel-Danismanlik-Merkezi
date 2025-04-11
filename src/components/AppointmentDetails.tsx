import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, BrowserRouter } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { motion } from 'framer-motion';
import { format, formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Edit,
  Trash2,
  AlertTriangle,
  Share2,
  FileText,
  Printer,
  Bell,
  X,
  ExternalLink,
  Phone,
  Clipboard,
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  Paperclip,
  Layers,
  ChevronDown,
  BarChart,
  FileCheck,
  AlertCircle,
  Tag,
  Menu,
  Maximize2
} from 'lucide-react';

// Import required components
import AppointmentShareModal from './AppointmentShareModal';
import AppointmentActions from './AppointmentActions';
import { JitsiMeetingLauncher, JitsiMeeting } from './JitsiMeeting';
import MeetingTimer from './MeetingTimer';

// Import client detail components
import { ClientDetailsTab } from './client-details/ClientDetailsTab';
import { AppointmentsTab } from './client-details/AppointmentsTab';
import { SessionNotesTab } from './client-details/SessionNotesTab';
import { TestsTab } from './client-details/TestsTab';
import TestResultsTab from './client-details/TestResultsTab';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Types
interface AppointmentDetailsProps {
  id?: string;  // Eğer prop olarak id geçilirse kullanılır, yoksa URL'den alınır
  isEditing?: boolean; // Düzenleme modunda mı?
}

interface AppointmentNote {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  createdByName?: string;
}

// Main component
export default function AppointmentDetails({ id: propId, isEditing }: AppointmentDetailsProps) {
  const { id: urlId } = useParams<{ id: string }>();
  const appointmentId = propId || urlId;
  const navigate = useNavigate();
  const { professional, assistant } = useAuth();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'files'>('details');
  const [showJoinOptions, setShowJoinOptions] = useState(false);
  const [showClientPanel, setShowClientPanel] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [isJitsiModalOpen, setIsJitsiModalOpen] = useState(false);
  const [jitsiRoomName, setJitsiRoomName] = useState('');

  // Fetch appointment data
  useEffect(() => {
    if (appointmentId) {
      loadAppointmentDetails(appointmentId);
    }
  }, [appointmentId]);

  // Eğer düzenleme modundaysa, sayfayı düzenleme modunda yükle
  useEffect(() => {
    if (isEditing && appointmentId) {
      // Düzenleme modunda başlatma işlemleri
      console.log("Düzenleme modu aktif:", appointmentId);
      // Burada düzenleme moduna özgü işlemler yapılabilir
    }
  }, [isEditing, appointmentId]);

  // Load appointment details
  async function loadAppointmentDetails(id: string) {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(*),
          professional:professionals(*),
          room:rooms(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Randevu bulunamadı');
      }

      setAppointment(data);
      
      // If the appointment is loaded successfully, load related data
      if (data.client?.id) {
        loadClientAppointments(data.client.id);
      }
      
    } catch (error: any) {
      console.error('Randevu detayları yüklenirken hata oluştu:', error);
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  // Load client's past and upcoming appointments
  async function loadClientAppointments(clientId: string) {
    try {
      setLoadingAppointments(true);
      const now = new Date().toISOString();
      
      // Load past appointments
      const { data: pastData, error: pastError } = await supabase
        .from('appointments')
        .select(`
          *,
          professional:professionals(full_name),
          room:rooms(name)
        `)
        .eq('client_id', clientId)
        .lt('start_time', now)
        .order('start_time', { ascending: false });
      
      if (pastError) throw pastError;
      setPastAppointments(pastData || []);
      
      // Load upcoming appointments
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('appointments')
        .select(`
          *,
          professional:professionals(full_name),
          room:rooms(name)
        `)
        .eq('client_id', clientId)
        .gte('start_time', now)
        .order('start_time', { ascending: true });
      
      if (upcomingError) throw upcomingError;
      setUpcomingAppointments(upcomingData || []);
    } catch (error) {
      console.error('Danışan randevuları yüklenirken hata oluştu:', error);
    } finally {
      setLoadingAppointments(false);
    }
  }

  // Format date to human readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: tr });
  };

  // Format time to human readable format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: tr });
  };

  // Format relative time (e.g. "2 days ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { locale: tr, addSuffix: true });
  };

  // Join meeting function
  const joinMeeting = () => {
    if (appointment?.is_online && appointment?.meeting_url) {
      // Check if the meeting URL is valid
      try {
        // Extract room name from meeting URL
      const extractRoomName = (url?: string): string => {
        if (!url) return '';
        
        try {
            // If URL format
          if (url.startsWith('http')) {
            const urlObj = new URL(url);
              // Get the last path segment (e.g., https://meet.jit.si/odaismi -> odaismi)
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            return pathParts[pathParts.length - 1] || '';
          } 
            // If direct room name
          return url;
        } catch (error) {
            console.error('Meeting URL parsing error:', error);
          return url;
        }
      };

      const roomName = extractRoomName(appointment.meeting_url);
      
      if (roomName) {
          setShowJoinOptions(true);
        } else {
          alert('Geçerli bir görüşme odası bulunamadı.');
        }
      } catch (error) {
        console.error('Görüşme katılımı hatası:', error);
        alert('Görüşmeye katılırken bir hata oluştu.');
      }
    } else {
      alert('Bu randevu için bir çevrimiçi görüşme linki bulunmamaktadır.');
    }
  };

  // Edit appointment
  const handleEditAppointment = () => {
    navigate(`/randevular/duzenle/${appointmentId}`);
  };

  // Delete appointment
  const handleDeleteAppointment = async () => {
    try {
      setShowConfirmDelete(false);
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      // Show success message and navigate back
      alert('Randevu başarıyla silindi.');
      navigate('/randevular');
    } catch (error) {
      console.error('Randevu silinirken hata oluştu:', error);
      alert('Randevu silinirken bir hata oluştu.');
    }
  };

  // Handle status update
  const handleUpdateStatus = async (newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      // If changing from completed to scheduled, check for payment record
      if (newStatus === 'scheduled' && appointment?.status === 'completed') {
        if (!window.confirm('Bu işlem randevuya ait ödeme kaydını da silecektir. Devam etmek istiyor musunuz?')) {
          return;
        }

        // Delete associated payment record
        const { error: paymentDeleteError } = await supabase
          .from('payments')
          .delete()
          .eq('appointment_id', appointmentId);

        if (paymentDeleteError) throw paymentDeleteError;
      }

      // Update the appointment status
      const { error: appointmentError } = await supabase
                  .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (appointmentError) throw appointmentError;

      // If marking as completed, create payment record
      if (newStatus === 'completed') {
        // Get the appointment details with client and professional info
        const { data: appointmentData, error: fetchError } = await supabase
                  .from('appointments')
                  .select(`
                    *,
            client:clients(session_fee, professional_share_percentage, clinic_share_percentage),
            professional:professionals(*)
          `)
          .eq('id', appointmentId)
          .single();

        if (fetchError) throw fetchError;

        if (appointmentData && appointmentData.client) {
          const sessionFee = appointmentData.client.session_fee;
          const professionalShare = (sessionFee * appointmentData.client.professional_share_percentage) / 100;
          const clinicShare = (sessionFee * appointmentData.client.clinic_share_percentage) / 100;

          // Create payment record
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              appointment_id: appointmentId,
              professional_id: appointmentData.professional_id,
              amount: sessionFee,
              professional_amount: professionalShare,
              clinic_amount: clinicShare,
              payment_status: 'pending',
              collected_by: 'clinic',
              payment_date: new Date().toISOString()
            });

          if (paymentError) throw paymentError;
        }
      }

      // Reload appointment details
      await loadAppointmentDetails(appointmentId);
      
              } catch (error) {
      console.error('Randevu durumu güncellenirken hata oluştu:', error);
      alert('Randevu durumu güncellenirken bir hata oluştu.');
    }
  };

  // Check if the meeting is joinable (online, has meeting URL)
  const canJoinOnline = appointment?.is_online && appointment?.meeting_url;

  // Rendering loading state
  if (loading) {
    return <LoadingSpinner fullPage size="medium" showLoadingText={true} loadingText="Randevu detayları yükleniyor..." />;
  }

  // Rendering error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Hata</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/randevular')}
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 font-medium flex items-center group transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Randevulara Dön
          </button>
        </div>
      </div>
    );
  }

  // If appointment not found
  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Randevu Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">İstediğiniz randevu bilgisi mevcut değil.</p>
          <button
            onClick={() => navigate('/randevular')}
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 font-medium flex items-center group transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Randevulara Dön
          </button>
        </div>
      </div>
    );
  }

  // Implement main UI here in the next sections
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Üst bilgi bölümü */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/randevular')}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 font-medium flex items-center group transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Randevulara Dön
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Durum göstergesi */}
              <div className="hidden md:flex items-center">
                <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">Durum:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  appointment.status === 'scheduled' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : appointment.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {appointment.status === 'scheduled' ? 'Planlandı' : 
                   appointment.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                </span>
              </div>
              
              {/* Tür göstergesi */}
              <div className="hidden md:flex items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.is_online 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                }`}>
                  {appointment.is_online ? 'Çevrimiçi' : 'Yüz Yüze'}
                </span>
              </div>
              
              {/* İşlemler dropdown */}
              <div className="relative">
                        <button 
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                        >
                  <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </button>
                
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                          onClick={() => {
                          setShowMobileMenu(false);
                          handleEditAppointment();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        role="menuitem"
                      >
                        <Edit className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        Düzenle
                      </button>
                      
                      <button
                          onClick={() => {
                          setShowMobileMenu(false);
                          setShowShareModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        role="menuitem"
                      >
                        <Share2 className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        Paylaş
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          window.print();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        role="menuitem"
                      >
                        <Printer className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        Yazdır
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowConfirmDelete(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                        role="menuitem"
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        Sil
                      </button>
                            </div>
                            </div>
                )}
                          </div>
                        </div>
                      </div>
                      </div>
      </header>

      {/* Ana içerik */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık Bölümü */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">
              {appointment.client?.full_name ? `Randevu: ${appointment.client.full_name}` : 'Randevu Detayları'}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              {canJoinOnline && (
                                <button 
                  onClick={joinMeeting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                                >
                  <Video className="h-4 w-4 mr-2" />
                  Görüşmeye Katıl
                                </button>
              )}
                              
                                    <button
                onClick={handleEditAppointment}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
              >
                <Edit className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                Düzenle
                                    </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
              >
                <Share2 className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                Paylaş
              </button>
                                </div>
                                    </div>
        </motion.div>

        {/* Durum değiştirme kartı */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Randevu Durumu</h2>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleUpdateStatus('scheduled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appointment.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/40 dark:text-blue-200 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Planlandı</span>
                                    </div>
                </button>
                
                <button
                  onClick={() => handleUpdateStatus('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appointment.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/40 dark:text-green-200 ring-2 ring-green-500'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Tamamlandı</span>
                                    </div>
                </button>
                
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 dark:bg-red-800/40 dark:text-red-200 ring-2 ring-red-500'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    <span>İptal Edildi</span>
                                    </div>
                </button>
                                </div>
              
              {appointment.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">İptal edilmiş randevu</p>
                      <p className="mt-1">Bu randevu iptal edildi. Gerekirse tekrar planlamak için düzenleme yapabilirsiniz.</p>
                    </div>
                            </div>
                          </div>
                        )}
                      </div>
          </div>
        </motion.div>

        {/* Ana detay kartı */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6 grid gap-6 grid-cols-1 lg:grid-cols-3"
        >
          {/* Sol kolon: Randevu bilgileri */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Randevu Bilgileri</h2>
                
                <div className="space-y-4">
                  {/* Tarih ve saat bilgileri */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tarih</p>
                          <p className="text-base text-gray-900 dark:text-white">
                            {formatDate(appointment.start_time)}
                          </p>
                              </div>
                            </div>
                          </div>
                          
                    <div className="flex-1">
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saat</p>
                          <p className="text-base text-gray-900 dark:text-white">
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </p>
                            </div>
                      </div>
                    </div>
                        </div>
                        
                  {/* Uzman ve danışan bilgileri */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Uzman</p>
                          <p className="text-base text-gray-900 dark:text-white">
                            {appointment.professional?.full_name || 'Belirtilmemiş'}
                          </p>
                        </div>
                          </div>
                        </div>
                        
                    <div className="flex-1">
                      <div className="flex items-start">
                        <Users className="h-5 w-5 text-indigo-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Danışan</p>
                          <p className="text-base text-gray-900 dark:text-white">
                            {appointment.client?.full_name || 'Belirtilmemiş'}
                          </p>
                                      </div>
                                    </div>
                                    </div>
                                  </div>
                  
                  {/* Lokasyon bilgisi */}
                  <div className="flex items-start">
                    {appointment.is_online ? (
                      <Video className="h-5 w-5 text-teal-500 mr-3 mt-0.5" />
                    ) : (
                      <MapPin className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {appointment.is_online ? 'Çevrimiçi Görüşme' : 'Lokasyon'}
                      </p>
                      <p className="text-base text-gray-900 dark:text-white">
                        {appointment.is_online 
                          ? (appointment.meeting_url || 'Toplantı linki belirtilmemiş')
                          : (appointment.room?.name || 'Oda belirtilmemiş')}
                      </p>
                        </div>
                  </div>
                  
                  {/* Notlar */}
                  {appointment.notes && (
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Notlar</p>
                        <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                          {appointment.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sağ kolon: Hızlı işlemler */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowClientPanel(true)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
                  >
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                      <span>Danışan Detayları</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
                  >
                    <div className="flex items-center">
                      <Printer className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                      <span>Yazdır</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-left bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-colors text-red-800 dark:text-red-300"
                  >
                    <div className="flex items-center">
                      <Trash2 className="h-5 w-5 mr-3" />
                      <span>Randevuyu Sil</span>
        </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>
      </div>
            </div>
          </div>
          </div>
        </motion.div>
      </main>

      {/* Modaller */}
      {/* Paylaşım Modalı */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 relative"
          >
          <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Randevuyu Paylaş</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Randevu Linki</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    readOnly
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md sm:text-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={`${window.location.origin}/randevular/${appointmentId}`}
                  />
        <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/randevular/${appointmentId}`)
                        .then(() => alert('Link kopyalandı'))
                        .catch(err => console.error('Kopyalama hatası:', err));
                    }}
                    className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                  >
                    <Clipboard className="h-5 w-5" />
          </button>
        </div>
      </div>

              {canJoinOnline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toplantı Linki</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      readOnly
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md sm:text-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={appointment.meeting_url || ''}
                    />
          <button
                      onClick={() => {
                        if (appointment.meeting_url) {
                          navigator.clipboard.writeText(appointment.meeting_url)
                            .then(() => alert('Toplantı linki kopyalandı'))
                            .catch(err => console.error('Kopyalama hatası:', err));
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                    >
                      <Clipboard className="h-5 w-5" />
          </button>
        </div>
      </div>
              )}

              <div className="pt-4">
        <button
                  onClick={() => {
                    // Whatsapp ile paylaşma
                    const text = `${appointment.client?.full_name || 'Danışan'} ile randevu: ${formatDate(appointment.start_time)} ${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}${appointment.meeting_url ? `\nToplantı linki: ${appointment.meeting_url}` : ''}`;
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="inline-flex w-full justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                >
                  <span>WhatsApp ile Paylaş</span>
        </button>
      </div>

        <div>
                <button
                  onClick={() => {
                    // E-posta ile paylaşma
                    const subject = `Randevu: ${appointment.client?.full_name || 'Danışan'} - ${formatDate(appointment.start_time)}`;
                    const body = `Randevu Detayları:\n\nTarih: ${formatDate(appointment.start_time)}\nSaat: ${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}\nUzman: ${appointment.professional?.full_name || 'Belirtilmemiş'}\nDanışan: ${appointment.client?.full_name || 'Belirtilmemiş'}\n${appointment.is_online ? `\nToplantı Linki: ${appointment.meeting_url || 'Belirtilmemiş'}` : `\nLokasyon: ${appointment.room?.name || 'Belirtilmemiş'}`}`;
                    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.open(mailtoUrl, '_blank');
                  }}
                  className="inline-flex w-full justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                  <span>E-posta ile Paylaş</span>
                </button>
              </div>
                </div>
          </motion.div>
                </div>
              )}

      {/* Silme Onay Modalı */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Randevuyu Sil</h3>
          </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Bu randevuyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            
            <div className="flex justify-end space-x-4">
                <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                İptal
                </button>
              
              <button
                onClick={handleDeleteAppointment}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                Sil
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Çevrimiçi Görüşme Katılım Modalı */}
      {showJoinOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Görüşmeye Katıl</h3>
              <button
                onClick={() => setShowJoinOptions(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div 
                onClick={() => {
                  // Bu pencerede aç (JitsiMeetingLauncher bileşenine geç)
                  const extractRoomName = (url?: string): string => {
                    if (!url) return '';
                    
                    try {
                      // If URL format
                      if (url.startsWith('http')) {
                        const urlObj = new URL(url);
                        // Get the last path segment (e.g., https://psikoran.xyz/odaismi -> odaismi)
                        const pathParts = urlObj.pathname.split('/').filter(Boolean);
                        return pathParts[pathParts.length - 1] || '';
                      } 
                      // If direct room name
                      return url;
                    } catch (error) {
                      console.error('Meeting URL parsing error:', error);
                      return url;
                    }
                  };

                  const roomName = extractRoomName(appointment.meeting_url);
                  setShowJoinOptions(false);
                  
                  // JitsiMeetingLauncher bileşenini gösterecek bir state ekleyebilirsiniz
                  setIsJitsiModalOpen(true);
                  setJitsiRoomName(roomName);
                }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-md cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Maximize2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Bu Pencerede Aç</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Görüşme bu sayfada gömülü olarak açılır</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => {
                  // Yeni pencerede aç
                  window.open(appointment.meeting_url, '_blank');
                  setShowJoinOptions(false);
                }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-md cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Yeni Pencerede Aç</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Görüşme yeni bir sekmede açılır</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => {
                  // Linki kopyala
                  navigator.clipboard.writeText(appointment.meeting_url)
                    .then(() => {
                      alert('Toplantı linki kopyalandı');
                      setShowJoinOptions(false);
                    })
                    .catch(err => console.error('Kopyalama hatası:', err));
                }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-md cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Clipboard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Linki Kopyala</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Görüşme linkini panoya kopyalar</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300 p-3 rounded-lg border border-amber-100 dark:border-amber-800/20">
              <p>Not: Tarayıcı güvenlik ayarlarınız nedeniyle açılır pencere engellenirse, linki kopyalayıp tarayıcınıza manuel olarak yapıştırın.</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Jitsi Görüşme Modalı */}
      {isJitsiModalOpen && jitsiRoomName && (
        <JitsiMeeting
          roomName={jitsiRoomName}
          displayName={professional?.full_name || "Uzman"}
          userInfo={{
            displayName: professional?.full_name || "Uzman",
            email: professional?.email
          }}
          isOpen={isJitsiModalOpen}
          onClose={() => setIsJitsiModalOpen(false)}
          preferredMode="embedded"
        />
      )}

      {/* Danışan Detay Paneli */}
      {showClientPanel && appointment?.client?.id && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full p-6 my-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {appointment.client.full_name}
              </h2>
              <button
                onClick={() => setShowClientPanel(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Burada ClientDetailsTab bileşeni kullanılabilir (gerçek uygulamada) */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Danışan Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">İsim</p>
                        <p className="text-base text-gray-900 dark:text-white">
                          {appointment.client.full_name}
                        </p>
            </div>
          </div>
          
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefon</p>
                        <p className="text-base text-gray-900 dark:text-white">
                          {appointment.client.phone || 'Belirtilmemiş'}
                        </p>
              </div>
              </div>
                    
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">E-posta</p>
                        <p className="text-base text-gray-900 dark:text-white">
                          {appointment.client.email || 'Belirtilmemiş'}
                        </p>
              </div>
              </div>
              </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Randevu Geçmişi</h3>
                  {loadingAppointments ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Toplam: {pastAppointments.length + upcomingAppointments.length} randevu</p>
                      
                      {upcomingAppointments.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Gelecek Randevular</p>
                          <div className="pl-4 border-l-2 border-blue-400 dark:border-blue-600 space-y-2">
                            {upcomingAppointments.slice(0, 3).map(app => (
                              <div 
                                key={app.id} 
                                className="text-sm"
                                onClick={() => {
                                  navigate(`/randevular/${app.id}`);
                                  setShowClientPanel(false);
                                }}
                              >
                                <p className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                  {formatDate(app.start_time)} - {formatTime(app.start_time)}
                                </p>
                              </div>
                            ))}
                            {upcomingAppointments.length > 3 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                +{upcomingAppointments.length - 3} daha...
                              </p>
                            )}
                          </div>
                </div>
              )}
                      
                      {pastAppointments.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Geçmiş Randevular</p>
                          <div className="pl-4 border-l-2 border-gray-300 dark:border-gray-600 space-y-2">
                            {pastAppointments.slice(0, 3).map(app => (
                              <div 
                                key={app.id} 
                                className="text-sm"
                                onClick={() => {
                                  navigate(`/randevular/${app.id}`);
                                  setShowClientPanel(false);
                                }}
                              >
                                <p className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                  {formatDate(app.start_time)} - {formatTime(app.start_time)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {app.status === 'completed' ? '✓ Tamamlandı' : app.status === 'cancelled' ? '✗ İptal Edildi' : '◯ Planlandı'}
                                </p>
                </div>
                            ))}
                            {pastAppointments.length > 3 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                +{pastAppointments.length - 3} daha...
                              </p>
              )}
            </div>
          </div>
                      )}
                    </div>
                  )}
        </div>
      </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    navigate(`/danisanlar/${appointment.client.id}`);
                    setShowClientPanel(false);
                  }}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Danışan Profiline Git
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 