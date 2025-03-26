import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, BrowserRouter } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Clock, Users, MapPin, Video, Edit, Trash2, AlertTriangle, Share2, FileText, Printer, Bell, X, ExternalLink, Monitor, Maximize, Phone, Clipboard } from 'react-feather';
import { useAuth } from '../lib/auth';
import AppointmentShareModal from './AppointmentShareModal';
import AppointmentActions from './AppointmentActions';
import { JitsiMeetingLauncher } from './JitsiMeeting';
import MeetingTimer from './MeetingTimer';

// Danışan detayları için gerekli komponentleri import et
import { ClientDetailsTab } from './client-details/ClientDetailsTab';
import { AppointmentsTab } from './client-details/AppointmentsTab';
import { SessionNotesTab } from './client-details/SessionNotesTab';
import { TestsTab } from './client-details/TestsTab';
import TestResultsTab from './client-details/TestResultsTab';

interface AppointmentDetailsProps {
  id?: string;  // Eğer prop olarak id geçilirse kullanılır, yoksa URL'den alınır
}

export default function AppointmentDetails({ id: propId }: AppointmentDetailsProps) {
  const { id: urlId } = useParams<{ id: string }>();
  const appointmentId = propId || urlId;
  const navigate = useNavigate();
  const { professional } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      loadAppointmentDetails(appointmentId);
    }
  }, [appointmentId]);

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
    } catch (error: any) {
      console.error('Randevu detayları yüklenirken hata oluştu:', error);
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  // Format date to human readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time to human readable format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Görüşmeye katıl - doğrudan mod seçim ekranını gösterir
  const joinMeeting = () => {
    if (appointment?.is_online && appointment?.meeting_url) {
      // Meeting URL'den room name'i çıkar
      const extractRoomName = (url?: string): string => {
        if (!url) return '';
        
        try {
          // URL formatında ise
          if (url.startsWith('http')) {
            const urlObj = new URL(url);
            // Son path segment'ı al (örn: https://meet.jit.si/odaismi -> odaismi)
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            return pathParts[pathParts.length - 1] || '';
          } 
          // Direkt oda ismi ise
          return url;
        } catch (error) {
          console.error('Meeting URL çözümlenirken hata:', error);
          return url;
        }
      };

      const roomName = extractRoomName(appointment.meeting_url);
      
      if (roomName) {
        // Modal içeriğini doğrudan render edecek bir div oluştur
        const modalContainer = document.createElement('div');
        modalContainer.id = 'jitsi-selection-modal';
        modalContainer.style.position = 'fixed';
        modalContainer.style.top = '0';
        modalContainer.style.left = '0';
        modalContainer.style.width = '100%';
        modalContainer.style.height = '100%';
        modalContainer.style.zIndex = '9999';
        document.body.appendChild(modalContainer);
        
        // React modüllerini yükle ve render et
        import('react-dom/client').then(({ createRoot }) => {
          const root = createRoot(modalContainer);
          
          // Özel bir Wrapper bileşeni oluştur
          // Bu bileşen, JitsiMeetingLauncher'ın showModeSelection durumunu force eder
          const ModalWrapper = () => {
            const [isOpen, setIsOpen] = useState(true);
            const [showIframe, setShowIframe] = useState(false);
            
            // Client bilgilerini gösterme durumu
            const [showClientPanel, setShowClientPanel] = useState(false);
            const [activeClientTab, setActiveClientTab] = useState<'details' | 'appointments' | 'notes' | 'tests' | 'testResults'>('details');
            
            // Client data state
            const [clientData, setClientData] = useState<any>(null);
            const [sessionNotes, setSessionNotes] = useState<any[]>([]);
            const [pastAppointments, setPastAppointments] = useState<any[]>([]);
            const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
            const [testResults, setTestResults] = useState<any[]>([]);
            const [loadingClientData, setLoadingClientData] = useState(false);
            
            // Danışan verilerini yükle
            const loadClientData = async () => {
              if (!appointment?.client?.id) return;
              
              setLoadingClientData(true);
              try {
                // Danışan bilgilerini yükle
                const { data: clientData, error: clientError } = await supabase
                  .from('clients')
                  .select(`
                    *,
                    professional:professionals(
                      id,
                      full_name,
                      title,
                      email,
                      phone,
                      assistant_id
                    )
                  `)
                  .eq('id', appointment.client.id)
                  .single();
                
                if (clientError) throw clientError;
                setClientData(clientData);
                
                const now = new Date().toISOString();
                
                // Geçmiş randevuları yükle
                const { data: pastData, error: pastError } = await supabase
                  .from('appointments')
                  .select(`
                    *,
                    professional:professionals(full_name),
                    room:rooms(name)
                  `)
                  .eq('client_id', appointment.client.id)
                  .lt('end_time', now)
                  .order('start_time', { ascending: false });
                
                if (pastError) throw pastError;
                setPastAppointments(pastData || []);
                
                // Gelecek randevuları yükle
                const { data: upcomingData, error: upcomingError } = await supabase
                  .from('appointments')
                  .select(`
                    *,
                    professional:professionals(full_name),
                    room:rooms(name)
                  `)
                  .eq('client_id', appointment.client.id)
                  .gte('end_time', now)
                  .order('start_time', { ascending: true });
                
                if (upcomingError) throw upcomingError;
                setUpcomingAppointments(upcomingData || []);
                
                // Seans notlarını yükle
                const { data: notesData, error: notesError } = await supabase
                  .from('session_notes')
                  .select(`
                    *,
                    professional:professionals(full_name)
                  `)
                  .eq('client_id', appointment.client.id)
                  .order('created_at', { ascending: false });
                
                if (notesError) throw notesError;
                setSessionNotes(notesData || []);
                
                // Test sonuçlarını yükle
                const { data: resultsData, error: resultsError } = await supabase
                  .from('test_results')
                  .select(`
                    *,
                    professional:professionals(full_name)
                  `)
                  .eq('client_id', appointment.client.id)
                  .order('created_at', { ascending: false });
                
                if (resultsError) throw resultsError;
                
                // Test sonuçlarını formatla
                const formattedResults = resultsData?.map(result => ({
                  id: result.id,
                  client_id: result.client_id,
                  test_type: result.test_type,
                  test_id: result.test_type,
                  test_name: result.test_type,
                  created_at: result.created_at,
                  score: result.score,
                  answers: result.answers || {},
                  professional_id: result.professional_id,
                  professional_name: result.professional?.full_name,
                  notes: result.notes,
                  encrypted_answers: result.encrypted_answers,
                  encryption_key: result.encryption_key,
                  iv: result.iv
                }));
                
                setTestResults(formattedResults || []);
              } catch (error) {
                console.error('Danışan bilgileri yüklenirken hata:', error);
              } finally {
                setLoadingClientData(false);
              }
            };
            
            // Client paneli açıldığında verileri yükle
            useEffect(() => {
              if (showClientPanel) {
                loadClientData();
              }
            }, [showClientPanel]);
            
            // Tab değiştiğinde ekstra render işlemlerini engelle
            const handleTabChange = React.useCallback((tab: 'details' | 'appointments' | 'notes' | 'tests' | 'testResults') => {
              setActiveClientTab(tab);
            }, []);
            
            // Önbelleğe alınmış görünür sekmeler
            const visibleTabs = React.useMemo(() => [
              { id: 'details', name: 'Danışan Bilgileri' },
              { id: 'appointments', name: 'Randevular' },
              { id: 'notes', name: 'Seans Notları' },
              { id: 'tests', name: 'Testler' },
              { id: 'testResults', name: 'Test Sonuçları' }
            ], []);
            
            // Sayfa kapanmadan önce temizlik işlemi yap
            useEffect(() => {
              // Jitsi API'sini temizle
              return () => {
                try {
                  // Eğer modalContainer hala sayfadaysa ve DOM'da mevcutsa kaldır
                  if (document.body.contains(modalContainer)) {
                    document.body.removeChild(modalContainer);
                  }
                } catch (e) {
                  console.error("Modal kapatılırken hata:", e);
                }
              };
            }, []);
            
            // Modal kapatıldığında container'ı kaldır
            const onClose = () => {
              setIsOpen(false);
              // İşlemi geciktirerek animasyonun tamamlanmasını bekle
              setTimeout(() => {
                try {
                  if (document.body.contains(modalContainer)) {
                    document.body.removeChild(modalContainer);
                  }
                } catch (e) {
                  console.error("Modal kapatılırken hata:", e);
                }
              }, 300);
            };
            
            if (!isOpen) return null;
            
            // Tab seçim fonksiyonu
            // const handleTabChange = (tab: 'details' | 'appointments' | 'notes' | 'tests' | 'testResults') => {
            //   setActiveClientTab(tab);
            // };
            
            // Görünür sekmeleri belirle
            // const visibleTabs = [
            //   { id: 'details', name: 'Danışan Bilgileri' },
            //   { id: 'appointments', name: 'Randevular' },
            //   { id: 'notes', name: 'Seans Notları' },
            //   { id: 'tests', name: 'Testler' },
            //   { id: 'testResults', name: 'Test Sonuçları' }
            // ];
            
            return (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div className={showIframe ? 
                  "w-full h-full max-w-full max-h-full flex flex-col bg-white dark:bg-gray-800" : 
                  "bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 max-w-md w-full"
                }>
                  {!showIframe ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Görüşme Katılım Seçenekleri</h2>
                        <button 
                          onClick={onClose}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div 
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-md cursor-pointer transition-all duration-300"
                          onClick={() => {
                            // Bu pencerede katıl - iframe içinde göster
                            setShowIframe(true);
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                              <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Bu Pencerede Katıl</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Görüşme bu sayfada açılır</p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-md cursor-pointer transition-all duration-300"
                          onClick={() => {
                            // Yeni sekmede katıl
                            window.open(`https://meet.jit.si/${roomName}`, '_blank');
                            onClose();
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                              <ExternalLink className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Yeni Sekmede Katıl</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Görüşme yeni bir browser sekmesinde açılır</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-xs bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300 p-3 rounded-lg border border-amber-100 dark:border-amber-800/20">
                        <p>Not: Tarayıcı güvenlik ayarlarınız nedeniyle açılır pencere engellenirse, "Yeni Sekmede Katıl" seçeneğini kullanın.</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex-1 relative">
                        <iframe 
                          src={`https://meet.jit.si/${roomName}`} 
                          allow="camera; microphone; fullscreen; display-capture; autoplay" 
                          className="w-full h-full border-none"
                          title="Jitsi Meeting"
                        ></iframe>
                        
                        {/* Danışan bilgi paneli */}
                        {showClientPanel && clientData && (
                          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex justify-center overflow-auto z-[55]">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 m-4 lg:m-8 w-full max-w-4xl max-h-full overflow-auto">
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{clientData.full_name}</h2>
                                <button 
                                  onClick={() => setShowClientPanel(false)}
                                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </button>
                              </div>
                              
                              {/* Sekmeler */}
                              <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1 mb-6">
                                <nav className="-mb-px flex space-x-2 md:space-x-8" aria-label="Tabs">
                                  {visibleTabs.map((tab) => (
                                    <button
                                      key={tab.id}
                                      onClick={() => handleTabChange(tab.id as any)}
                                      className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                                        activeClientTab === tab.id
                                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                      }`}
                                    >
                                      {tab.name}
                                    </button>
                                  ))}
                                </nav>
                              </div>
                              
                              {/* Tab içerikleri */}
                              {loadingClientData ? (
                                <div className="flex justify-center items-center p-12">
                                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                </div>
                              ) : (
                                <div className="tab-content overflow-auto">
                                  {activeClientTab === 'details' && (
                                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                                      <BrowserRouter>
                                        <ClientDetailsTab client={clientData} />
                                      </BrowserRouter>
                                    </div>
                                  )}
                                  
                                  {activeClientTab === 'appointments' && (
                                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                                      <AppointmentsTab 
                                        clientId={clientData.id} 
                                        appointments={{
                                          upcoming: upcomingAppointments,
                                          past: pastAppointments
                                        }}
                                        loadAppointments={() => Promise.resolve(true)}
                                      />
                                    </div>
                                  )}
                                  
                                  {activeClientTab === 'notes' && (
                                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                                      <SessionNotesTab 
                                        clientId={clientData.id}
                                        sessionNotes={sessionNotes}
                                        loadSessionNotes={() => Promise.resolve(true)}
                                      />
                                    </div>
                                  )}
                                  
                                  {activeClientTab === 'tests' && (
                                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                                      <BrowserRouter>
                                        <TestsTab 
                                          clientId={clientData.id}
                                          client={clientData}
                                        />
                                      </BrowserRouter>
                                    </div>
                                  )}
                                  
                                  {activeClientTab === 'testResults' && (
                                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                                      <TestResultsTab 
                                        clientId={clientData.id}
                                        testResults={testResults}
                                        loadTestResults={() => Promise.resolve(true)}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => {
                              if (document.fullscreenElement) {
                                document.exitFullscreen();
                              } else {
                                document.documentElement.requestFullscreen();
                              }
                            }}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors flex items-center"
                            title="Tam ekran"
                          >
                            <Maximize className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </button>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-1.5">
                              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                              <span className="text-xs text-gray-600 dark:text-gray-300">
                                {new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                              </span>
                            </div>
                            <div className="flex items-center bg-green-100 dark:bg-green-900/30 rounded-lg px-3 py-1.5">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                              <div className="font-mono text-xs text-green-800 dark:text-green-300">
                                <MeetingTimer startTime={new Date(appointment.start_time)} />
                              </div>
                            </div>
                          </div>
                          
                          {/* Danışan bilgileri sekmesi */}
                          {appointment?.client?.id && (
                            <div className="ml-3 relative group">
                              <button
                                onClick={() => setShowClientPanel(!showClientPanel)}
                                className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800/50 text-indigo-800 dark:text-indigo-400 text-sm font-medium flex items-center"
                              >
                                <Users className="h-4 w-4 mr-1.5" />
                                <span>Danışan</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transform transition-transform duration-150 ${showClientPanel ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="hidden md:flex items-center space-x-3">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {appointment?.client?.full_name ? `Görüşme: ${appointment.client.full_name}` : 'Çevrimiçi Görüşme'}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {appointment?.client?.id && (
                            <button
                              onClick={() => {
                                // Özel sonlandırma pop-up'ı oluştur
                                const confirmDialog = document.createElement('div');
                                confirmDialog.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]';
                                confirmDialog.innerHTML = `
                                  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 max-w-sm w-full">
                                    <div class="flex items-center mb-4">
                                      <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600 dark:text-red-400 transform rotate-135"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                      </div>
                                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Görüşmeyi Sonlandır</h3>
                                    </div>
                                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-5">Görüşmeyi sonlandırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
                                    <div class="flex space-x-3 justify-end">
                                      <button id="cancel-btn" class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">İptal</button>
                                      <button id="confirm-btn" class="px-3 py-1.5 text-sm rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors">Sonlandır</button>
                                    </div>
                                  </div>
                                `;
                                document.body.appendChild(confirmDialog);
                                
                                // Butonlara event listener ekle
                                const cancelBtn = confirmDialog.querySelector('#cancel-btn');
                                const confirmBtn = confirmDialog.querySelector('#confirm-btn');
                                
                                cancelBtn?.addEventListener('click', () => {
                                  document.body.removeChild(confirmDialog);
                                });
                                
                                confirmBtn?.addEventListener('click', () => {
                                  document.body.removeChild(confirmDialog);
                                  onClose();
                                });
                              }}
                              className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 text-red-800 dark:text-red-400 text-sm font-medium flex items-center"
                            >
                              <Phone className="h-4 w-4 mr-1.5 transform rotate-135" />
                              <span>Görüşmeyi Sonlandır</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          };
          
          root.render(<ModalWrapper />);
        }).catch(err => {
          console.error("Modal render edilirken hata oluştu:", err);
        });
      }
    }
  };

  // Seans notu ekleme sayfasına yönlendirme
  const handleAddNote = () => {
    navigate(`/session-notes/create/${appointment.id}`);
  };

  // Randevu düzenleme sayfasına yönlendirme
  const handleEditAppointment = () => {
    navigate(`/appointments/edit/${appointment.id}`);
  };

  // Randevuyu sil
  const handleDeleteAppointment = async () => {
    if (window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', appointment.id);
        
        if (error) throw error;
        
        navigate('/appointments');
      } catch (error) {
        console.error('Randevu silinirken hata oluştu:', error);
        alert('Randevu silinirken bir hata oluştu.');
      }
    }
  };

  // Randevu oluşturulmuşsa ve online bir görüşme ise, toplantı URL'sini kontrol et
  const canJoinOnline = appointment?.is_online && appointment?.meeting_url;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Randevu detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            Randevulara Dön
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Randevu Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">İstediğiniz randevu bilgisi mevcut değil.</p>
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            Randevulara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/appointments')}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Randevu Detayları
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Ana randevu bilgileri */}
          <AppointmentActions 
            appointment={appointment} 
            onAddNote={handleAddNote}
            onJoinMeeting={joinMeeting}
          />
            
          {/* Danışan Bilgileri */}
          <div className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-lg">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-300 mb-3">
              Danışan Bilgileri
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{appointment.client?.full_name}</span>
              </div>
              {appointment.client?.email && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">E-posta:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{appointment.client?.email}</span>
                </div>
              )}
              {appointment.client?.phone && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Telefon:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{appointment.client?.phone}</span>
                </div>
              )}
            </div>
          </div>
            
          {/* Notlar */}
          {appointment.notes && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/20">
              <h4 className="text-md font-medium text-amber-800 dark:text-amber-300 mb-2">
                Randevu Notları
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hızlı İşlemler
            </h3>
            
            <div className="space-y-3">
              {canJoinOnline && (
                <button
                  onClick={joinMeeting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Video className="h-4 w-4 mr-2" />
                  <span>Görüşmeye Katıl</span>
                </button>
              )}
              
              <button
                onClick={handleAddNote}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Seans Notu Ekle</span>
              </button>
              
              <button
                onClick={handleEditAppointment}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                <span>Düzenle</span>
              </button>
              
              {canJoinOnline && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Bağlantıyı Paylaş</span>
                </button>
              )}
              
              <button
                onClick={handleDeleteAppointment}
                className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Sil</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Randevu Detayları
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Randevu ID:</span>
                <span className="font-medium">#{appointment.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Oluşturulma:</span>
                <span>{new Date(appointment.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Uzman:</span>
                <span>{appointment.professional?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Durum:</span>
                <span className={`font-medium ${
                  appointment.status === 'scheduled' ? 'text-blue-600 dark:text-blue-400' :
                  appointment.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {appointment.status === 'scheduled' ? 'Planlandı' :
                  appointment.status === 'completed' ? 'Tamamlandı' :
                  'İptal Edildi'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Görüşme Tipi:</span>
                <span>{appointment.is_online ? 'Çevrimiçi' : 'Yüz Yüze'}</span>
              </div>
              {appointment.is_online && (
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span>Görüşme Linki:</span>
                  {appointment.meeting_url ? (
                    <button
                      onClick={joinMeeting}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md transition-colors duration-200 text-xs flex items-center"
                    >
                      <Video className="h-3 w-3 mr-1" />
                      <span>Görüşmeye Katıl</span>
                    </button>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 text-xs">Görüşme başlamadı</span>
                  )}
                </div>
              )}
              {appointment.room && !appointment.is_online && (
                <div className="flex justify-between">
                  <span>Görüşme Odası:</span>
                  <span>{appointment.room.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {canJoinOnline && (
        <AppointmentShareModal
          show={showShareModal}
          onHide={() => setShowShareModal(false)}
          appointmentInfo={{
            id: appointment.id,
            client: {
              full_name: appointment.client?.full_name,
              email: appointment.client?.email
            },
            professional: {
              full_name: professional?.full_name || appointment.professional?.full_name,
              title: professional?.title || appointment.professional?.title
            },
            start_time: appointment.start_time,
            meeting_url: appointment.meeting_url
          }}
        />
      )}
    </div>
  );
} 