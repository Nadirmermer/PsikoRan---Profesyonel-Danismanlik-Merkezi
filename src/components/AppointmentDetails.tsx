import React, { useState, useEffect, useRef } from 'react';
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

// JitsiMeetExternalAPI için TypeScript tanımlaması
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

// JitsiMeeting komponenti
const JitsiMeeting = ({ roomName, domain, displayName, onClose }: { 
  roomName: string;
  domain: string;
  displayName?: string;
  onClose: () => void;
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // external_api.js'i dinamik olarak yükle
  useEffect(() => {
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        setLoadingStatus('loading');
        
        // Eğer script zaten yüklenmişse tekrar yükleme işlemi yok
        if (typeof window.JitsiMeetExternalAPI !== 'undefined') {
          setScriptLoaded(true);
          resolve();
          return;
        }

        // API yüklenmediyse hata ver (index.html'de yüklenmesi gerekiyor)
        
        // 3 saniye bekleyelim, belki API yüklenme gecikmesi vardır
        setTimeout(() => {
          if (typeof window.JitsiMeetExternalAPI !== 'undefined') {
            setScriptLoaded(true);
            resolve();
          } else {
            setLoadingStatus('error');
            setErrorMessage('Jitsi API yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
            reject(new Error('Jitsi API yüklenemedi'));
          }
        }, 3000);
      });
    };

    loadScript().catch(err => {
      // Sadece kritik hataları logla
      console.error('Jitsi API yüklenemedi:', err);
    });

    return () => {
      // Component unmount olduğunda temizlik işlemleri
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [domain]);

  // Jitsi API başlat
  useEffect(() => {
    if (!scriptLoaded || !jitsiContainerRef.current) {
      return;
    }

    try {
      // API yapılandırma seçeneklerini logla
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'tileview', 'download', 'help'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Katılımcı',
          DEFAULT_LOCAL_DISPLAY_NAME: displayName || 'Ben',
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          enableClosePage: false,
          disableAudioLevels: true,
          enableNoisyMicDetection: false
        }
      };
      
      // API mevcudiyetini kontrol et
      if (typeof window.JitsiMeetExternalAPI !== 'function') {
        throw new Error('JitsiMeetExternalAPI fonksiyonu bulunamadı');
      }
      
      // @ts-ignore: Jitsi tipi için TypeScript hatası
      const api = new window.JitsiMeetExternalAPI(domain, options);
      
      // Olayları dinle
      api.addEventListeners({
        readyToClose: () => {
          onClose();
        },
        videoConferenceLeft: () => {
          onClose();
        },
        participantJoined: () => {
          // Katılımcı girdi
        },
        participantLeft: () => {
          // Katılımcı ayrıldı
        },
        videoConferenceJoined: () => {
          // Toplantıya katıldı
          setLoadingStatus('success');
        },
        error: (error: any) => {
          console.error('Jitsi API hatası:', error);
          setLoadingStatus('error');
          setErrorMessage('Toplantı sırasında bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
        }
      });

      apiRef.current = api;
      setApiLoaded(true);
    } catch (error) {
      console.error('Jitsi API başlatılırken hata oluştu:', error);
      setLoadingStatus('error');
      setErrorMessage('Toplantı başlatılırken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
      
      // Hata durumunda kullanıcıya bilgi ver
      alert('Jitsi toplantısı başlatılırken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin veya yeni sekmede açmayı tercih edin.');
      onClose(); // Hata durumunda modalı kapat
    }
  }, [scriptLoaded, roomName, domain, displayName, onClose]);

  return (
    <div className="w-full h-full">
      {loadingStatus === 'loading' && (
        <div className="flex flex-col justify-center items-center h-full bg-gray-900">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-blue-400 text-lg animate-pulse">Görüşme başlatılıyor...</p>
          <p className="text-gray-400 text-sm mt-2">Bu işlem birkaç saniye sürebilir</p>
        </div>
      )}
      
      {loadingStatus === 'error' && (
        <div className="flex flex-col justify-center items-center h-full bg-gray-900 p-4">
          <div className="mb-4 bg-red-100 dark:bg-red-900/30 rounded-full p-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-500 mb-2">Bağlantı Hatası</h3>
          <p className="text-gray-200 text-center mb-6">{errorMessage || 'Toplantıya bağlanırken bir sorun oluştu.'}</p>
          <div className="flex space-x-4">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
            >
              Kapat
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              Yenile
            </button>
          </div>
        </div>
      )}
      
      <div 
        ref={jitsiContainerRef} 
        className={`w-full h-full ${loadingStatus === 'loading' || loadingStatus === 'error' ? 'hidden' : ''}`}
      ></div>
    </div>
  );
};

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
  const [showJitsiIframe, setShowJitsiIframe] = useState(false);
  
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
        // Doğrudan katılım seçeneklerini göster
        setShowJoinOptions(true);
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

  // Extract Jitsi domain and room from meeting URL
  const extractJitsiInfo = (url: string) => {
    try {
      if (!url || !url.trim()) {
        return { domain: '', room: '' };
      }

      // URL'nin geçerli formatta olduğundan emin ol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const meetingUrl = new URL(url);
      const domain = meetingUrl.hostname;
      
      // Odayı URL'den çıkar (yol kısmındaki ilk segment)
      let path = meetingUrl.pathname.split('/').filter(Boolean);
      let room = path.length > 0 ? path[0] : '';
      
      // Room boş ise rastgele oda adı oluştur
      if (!room) {
        room = 'meeting_' + Math.random().toString(36).substring(2, 10);
      }
      
      if (!domain) {
        return { domain: '', room: '' };
      }
      
      return { domain, room };
    } catch (error) {
      console.error('Jitsi URL ayrıştırma hatası:', error);
      return { domain: '', room: '' };
    }
  };

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

  // Jitsi meeting modal
  const renderJitsiModal = () => {
    if (!showJitsiIframe || !appointment?.meeting_url) return null;
    
    const { domain, room } = extractJitsiInfo(appointment.meeting_url);
    
    if (!domain || !room) {
      alert('Geçersiz toplantı URL formatı. Toplantıya katılınamıyor.');
      setShowJitsiIframe(false);
      return null;
    }
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-full h-full md:w-[95%] md:h-[90%] lg:w-[90%] lg:h-[85%] md:rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 py-3 px-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">
                {appointment.client?.full_name || 'Danışan'} ile Görüşme
              </h3>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              
              <button
                onClick={() => setShowJitsiIframe(false)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                title="Kapat"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Jitsi Content */}
          <div className="flex-1 bg-black relative">
            <JitsiMeeting 
              domain={domain} 
              roomName={room} 
              displayName={professional?.full_name || assistant?.full_name || "Anonim"} 
              onClose={() => setShowJitsiIframe(false)} 
            />
            
            {/* Info Messages */}
            <div className="absolute bottom-4 right-4 left-4 flex flex-col items-center pointer-events-none space-y-2">
              <div className="px-4 py-2 bg-black/70 text-white text-xs sm:text-sm rounded-xl backdrop-blur-sm animate-fadeOut max-w-xs sm:max-w-md text-center">
                <p>İlk başta kamera ve mikrofon kapalıdır. Görüntü ve ses paylaşmak için toplantıda alt kısımdaki kamera/mikrofon ikonlarına tıklayınız.</p>
              </div>
              <div className="px-4 py-2 bg-black/70 text-white text-xs sm:text-sm rounded-xl backdrop-blur-sm animate-fadeOut max-w-xs sm:max-w-md text-center">
                <p>Tarayıcı izinleri ile ilgili sorun yaşarsanız yeni pencerede açmayı deneyebilirsiniz</p>
              </div>
            </div>

            {/* Mobile Hint */}
            <div className="absolute top-4 left-4 pointer-events-none md:hidden">
              <div className="px-3 py-1.5 bg-black/70 text-white text-xs rounded-xl backdrop-blur-sm animate-fadeOut delay-500">
                <p>Ekranı yatay çevirmeniz daha iyi görüntü sağlar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                        className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
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
              {appointment.client?.full_name ? ` ${appointment.client.full_name}` : 'Randevu Detayları'}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              {canJoinOnline && (
                                <button 
                  onClick={joinMeeting}
                  className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 group"
                                >
                  <Video className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  <span>Görüşmeye Katıl</span>
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
            
            <div className="mb-6">
              <div className="flex items-center justify-center">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4 text-center">Randevu Bilgilerini Paylaş</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm mt-1">Güvenli bir şekilde randevu bilgilerini paylaşabilirsiniz</p>
            </div>
            
            <div className="space-y-5">
              {/* Paylaşım Seçenekleri - Daha belirgin butonlar */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    // Profesyonel ve güvenilir WhatsApp paylaşım metni
                    const clinicName = professional?.clinic_name || "Kliniğimiz";
                    const startDate = formatDate(appointment.start_time);
                    const startTime = formatTime(appointment.start_time);
                    const endTime = formatTime(appointment.end_time);
                    
                    let text = `*${clinicName} Randevu Bilgileri*\n\n`;
                    text += `Sayın ${appointment.client?.full_name || 'Danışan'},\n\n`;
                    text += `${startDate} tarihinde saat ${startTime} - ${endTime} arasında randevunuz bulunmaktadır.\n\n`;
                    
                    if (appointment.professional?.full_name) {
                      text += `Uzman: ${appointment.professional.full_name}\n`;
                    }
                    
                    if (appointment.is_online && appointment.meeting_url) {
                      text += `\n*Çevrimiçi Görüşme Bilgileri:*\nGörüşme saatinde aşağıdaki linke tıklayarak katılabilirsiniz:\n${appointment.meeting_url}\n`;
                    } else if (appointment.room?.name) {
                      text += `\n*Görüşme Yeri:*\n${appointment.room.name}\n`;
                    }
                    
                    text += `\nSorunuz olursa bize ulaşabilirsiniz.\nRandevunuzda görüşmek üzere.`;
                    
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="flex items-center justify-center px-4 py-3 rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="font-medium">WhatsApp ile Paylaş</span>
                    </div>
                    <span className="text-xs text-green-100">Profesyonel mesaj şablonu ile</span>
                  </div>
                </button>
                
                {appointment.is_online && appointment.meeting_url && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Video className="h-5 w-5 text-blue-500 mr-2" />
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Görüşme Linki</h4>
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        readOnly
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-lg text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={appointment.meeting_url || ''}
                      />
                      <button
                        onClick={() => {
                          if (appointment.meeting_url) {
                            navigator.clipboard.writeText(appointment.meeting_url)
                              .then(() => {
                                // Kopyalama başarılı bildirimi
                                const button = document.getElementById('copyMeetingButton');
                                if (button) {
                                  button.innerHTML = '<span class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>Kopyalandı</span>';
                                  setTimeout(() => {
                                    if (button) {
                                      button.innerHTML = '<span class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>Kopyala</span>';
                                    }
                                  }, 2000);
                                }
                              })
                              .catch(err => console.error('Kopyalama hatası:', err));
                          }
                        }}
                        id="copyMeetingButton"
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none text-sm"
                      >
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                          Kopyala
                        </span>
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    // E-posta ile paylaşma - Daha profesyonel içerik
                    const clinicName = professional?.clinic_name || "Kliniğimiz";
                    const subject = `${clinicName} - ${appointment.client?.full_name || 'Danışan'} Randevu Bilgileri`;
                    
                    let body = `Sayın ${appointment.client?.full_name || 'Danışan'},\n\n`;
                    body += `${formatDate(appointment.start_time)} tarihinde saat ${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)} arasında randevunuz bulunmaktadır.\n\n`;
                    
                    if (appointment.professional?.full_name) {
                      body += `Uzman: ${appointment.professional.full_name}\n`;
                    }
                    
                    if (appointment.is_online && appointment.meeting_url) {
                      body += `\nÇevrimiçi Görüşme Bilgileri:\nGörüşme saatinde aşağıdaki linke tıklayarak katılabilirsiniz:\n${appointment.meeting_url}\n`;
                    } else if (appointment.room?.name) {
                      body += `\nGörüşme Yeri:\n${appointment.room.name}\n`;
                    }
                    
                    body += `\nSorunuz olursa bize ulaşabilirsiniz.\nRandevunuzda görüşmek üzere.`;
                    
                    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.open(mailtoUrl, '_blank');
                  }}
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span className="font-medium">E-posta ile Paylaş</span>
                  </div>
                </button>
                
                <div className="text-center mt-2">
                  <button
                    onClick={() => {
                      // Randevu kimliği ile URL'yi panoya kopyala
                      const url = `${window.location.origin}/randevular/${appointmentId}`;
                      navigator.clipboard.writeText(url)
                        .then(() => {
                          alert('Randevu linki kopyalandı');
                        })
                        .catch(err => console.error('Kopyalama hatası:', err));
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Randevu linkini kopyala
                  </button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                  <div className="flex">
                    <Bell className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p>
                      Paylaşılan bilgiler kişiseldir ve yalnızca ilgili danışan ile paylaşılmalıdır.
                    </p>
                  </div>
                </div>
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-center mb-5">
                <div className="h-16 w-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Görüşmeye Katıl</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                {appointment.client?.full_name || 'Danışan'} ile görüşmeniz başlamak üzere
              </p>
            
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setShowJoinOptions(false);
                    setShowJitsiIframe(true);
                  }}
                  className="relative w-full group overflow-hidden rounded-xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-purple-600/80 transform group-hover:scale-[1.02] transition-transform duration-300"></div>
                  <div className="relative p-4 flex items-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mr-4">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-lg">Bu sayfada aç</h4>
                      <p className="text-white/80 text-sm">Aynı sayfada görüşmeye başla</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    window.open(appointment.meeting_url, '_blank');
                    setShowJoinOptions(false);
                  }}
                  className="relative w-full group overflow-hidden rounded-xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/80 to-emerald-600/80 transform group-hover:scale-[1.02] transition-transform duration-300"></div>
                  <div className="relative p-4 flex items-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mr-4">
                      <ExternalLink className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-lg">Yeni pencerede aç</h4>
                      <p className="text-white/80 text-sm">Tam ekran deneyimi için yeni sekmede aç</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(appointment.meeting_url)
                      .then(() => {
                        // Butonu güncelle
                        const button = document.getElementById('copyLinkButton');
                        if (button) {
                          const originalContent = button.innerHTML;
                          button.innerHTML = `
                            <div class="relative p-4 flex items-center">
                              <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                              </div>
                              <div class="flex-1">
                                <h4 class="font-semibold text-white text-lg">Kopyalandı!</h4>
                                <p class="text-white/80 text-sm">Link panoya kopyalandı</p>
                              </div>
                            </div>
                          `;
                          
                          setTimeout(() => {
                            if (button) button.innerHTML = originalContent;
                          }, 2000);
                        }
                        
                        setShowJoinOptions(false);
                      })
                      .catch(err => console.error('Kopyalama hatası:', err));
                  }}
                  id="copyLinkButton"
                  className="relative w-full group overflow-hidden rounded-xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/80 to-violet-600/80 transform group-hover:scale-[1.02] transition-transform duration-300"></div>
                  <div className="relative p-4 flex items-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mr-4">
                      <Clipboard className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-lg">Linki kopyala</h4>
                      <p className="text-white/80 text-sm">Görüşme linkini panoya kopyala</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 mr-3" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Görüşme başladığında kamera ve mikrofon ayarlarınızı kontrol etmeyi unutmayın.
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowJoinOptions(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Jitsi iframe modalı */}
      {renderJitsiModal()}

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