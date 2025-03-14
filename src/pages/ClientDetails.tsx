import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { generateEncryptionKey, generateIV, encryptData, decryptData } from '../utils/encryption';
import { generateTestPDF } from '../utils/generateTestPDF';
import '@fontsource/roboto';

// Yeni oluşturulan bileşenleri import et
import ClientDetailsTab from '../components/client-details/ClientDetailsTab';
import AppointmentsTab from '../components/client-details/AppointmentsTab';
import SessionNotesTab from '../components/client-details/SessionNotesTab';
import TestsTab from '../components/client-details/TestsTab';
import TestResultsTab from '../components/client-details/TestResultsTab';

// Mevcut tipleri koru
import { Client } from '../types/client';

interface SessionNote {
  id: string;
  created_at: string;
  title: string;
  content: string;
  encrypted_content: string;
  encryption_key: string;
  iv: string;
  professional_id: string;
  client_id: string;
  professional?: {
    full_name: string;
  };
}

interface TestResult {
  id: string;
  client_id: string;
  test_type: string;
  score: number;
  answers: Record<string, any>;
  created_at: string;
  professional_id: string;
  notes?: string;
  encrypted_answers?: string;
  encryption_key?: string;
  iv?: string;
  test_id: string;
  test_name: string;
  professional_name?: string;
}

type TabType = 'details' | 'appointments' | 'notes' | 'tests' | 'test-results';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { professional, assistant } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareOptions, setShareOptions] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (id) {
    loadClient();
    loadSessionNotes();
    loadAppointments();
    loadTestResults();
    }
  }, [id]);

  // Görünür sekmeleri belirle
  const visibleTabs = useMemo(() => {
    const tabs = [
      { id: 'details', name: 'Danışan Bilgileri' },
      { id: 'appointments', name: 'Randevular' },
    ];

    if (professional) {
      tabs.push({ id: 'notes', name: 'Seans Notları' });
      tabs.push({ id: 'tests', name: 'Testler' });
      tabs.push({ id: 'test-results', name: 'Test Sonuçları' });
    }

    return tabs;
  }, [professional]);

  async function loadClient() {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          professional:professionals!inner(
            id,
            full_name,
            title,
            email,
            phone,
            assistant_id,
            assistant:assistants(
              id,
              clinic_name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (clientError) throw clientError;

      if (clientData?.professional?.assistant) {
        clientData.professional.clinic_name = clientData.professional.assistant.clinic_name;
      }

      setClient(clientData);
    } catch (error) {
      console.error('Error loading client:', error);
      setErrorMessage('Danışan bilgileri yüklenirken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadSessionNotes() {
    try {
      const { data, error } = await supabase
        .from('session_notes')
        .select(`
          *,
          professional:professionals(full_name)
        `)
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Notları deşifre et
      const decryptedNotes = await Promise.all(
        data.map(async (note) => {
            if (note.encrypted_content && note.encryption_key && note.iv) {
            try {
              const decryptedContent = await decryptData(
                note.encrypted_content,
                note.encryption_key,
                note.iv
              );
              return { ...note, content: decryptedContent };
            } catch (e) {
              console.error('Error decrypting note:', e);
              return { ...note, content: 'Not içeriği deşifre edilemedi.' };
            }
          }
          return note;
        })
      );

      setSessionNotes(decryptedNotes);
    } catch (error) {
      console.error('Error loading session notes:', error);
    }
  }

  async function loadAppointments() {
    try {
      const now = new Date().toISOString();
      
      // Geçmiş randevuları yükle
      const { data: pastData, error: pastError } = await supabase
        .from('appointments')
        .select(`
          *,
          professional:professionals(full_name),
          room:rooms(name)
        `)
        .eq('client_id', id)
        .lt('end_time', now)
        .order('start_time', { ascending: false });

      if (pastError) throw pastError;

      // Gelecek randevuları yükle
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('appointments')
        .select(`
          *,
          professional:professionals(full_name),
          room:rooms(name)
        `)
        .eq('client_id', id)
        .gte('end_time', now)
        .order('start_time', { ascending: true });

      if (upcomingError) throw upcomingError;

      setPastAppointments(pastData || []);
      setUpcomingAppointments(upcomingData || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }

  async function loadTestResults() {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          professional:professionals(full_name)
        `)
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Test sonuçlarını formatla
      const formattedResults = data.map(result => ({
        id: result.id,
        client_id: result.client_id,
        test_type: result.test_type,
        test_id: result.test_type,
        test_name: result.test_type, // Bu alanı daha sonra AVAILABLE_TESTS'ten alacağız
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

      setTestResults(formattedResults);
    } catch (error) {
      console.error('Error loading test results:', error);
    }
  }

  async function handleShareTest(testId: string) {
    try {
      // Kullanıcı oturumunu kontrol et
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      // Test token oluştur
      const { data, error } = await supabase
        .from('test_tokens')
        .insert({
        test_id: testId,
        client_id: id,
          professional_id: professional?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating token:', error);
        
        if (error.code === 'PGRST301' || error.message.includes('policy')) {
          throw new Error('Yetki hatası: Bu işlemi gerçekleştirme izniniz yok.');
        }
        
        throw new Error('Token oluşturulurken bir hata oluştu.');
      }

      // Paylaşım seçeneklerini ayarla
      const token = data.token;
      const testUrl = `${window.location.origin}/public-test/${token}`;
      
      const shareOptions = [
        {
          name: 'Bağlantıyı Kopyala',
          action: () => {
            navigator.clipboard.writeText(testUrl);
            setIsShareModalOpen(false);
            setSuccessMessage('Bağlantı panoya kopyalandı!');
          setIsSuccessDialogOpen(true);
        },
        },
        {
          name: 'WhatsApp ile Paylaş',
          action: () => {
            window.open(`https://wa.me/?text=${encodeURIComponent(testUrl)}`, '_blank');
            setIsShareModalOpen(false);
          },
        },
        {
          name: 'E-posta ile Paylaş',
          action: () => {
            window.open(`mailto:?subject=Test Daveti&body=${encodeURIComponent(testUrl)}`, '_blank');
            setIsShareModalOpen(false);
          },
        },
      ];

      setShareOptions(shareOptions);
      setIsShareModalOpen(true);
    } catch (error: any) {
      console.error('Error sharing test:', error);
      setErrorMessage(error.message || 'Test paylaşılırken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Danışan bulunamadı</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">İstediğiniz danışan bilgilerine erişilemiyor.</p>
        <button
          onClick={() => navigate('/clients')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Danışanlara Dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs - Mobil uyumlu hale getirme */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
        <nav className="-mb-px flex space-x-2 md:space-x-8" aria-label="Tabs">
          {visibleTabs.map((tab) => (
          <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={classNames(
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0'
              )}
            >
              {tab.name}
            </button>
          ))}
          </nav>
        </div>

      {/* Tab içerikleri */}
      {activeTab === 'details' && (
        <ClientDetailsTab client={client} loadClient={loadClient} />
          )}

          {activeTab === 'appointments' && (
        <AppointmentsTab 
          pastAppointments={pastAppointments} 
          upcomingAppointments={upcomingAppointments} 
        />
          )}

          {activeTab === 'notes' && professional && (
        <SessionNotesTab 
          clientId={id || ''} 
          sessionNotes={sessionNotes} 
          loadSessionNotes={loadSessionNotes} 
        />
          )}

      {activeTab === 'tests' && professional && (
        <TestsTab 
          clientId={id || ''} 
          handleShareTest={handleShareTest} 
        />
      )}

      {activeTab === 'test-results' && professional && (
        <TestResultsTab 
          testResults={testResults} 
        />
      )}

      {/* Paylaşım Seçenekleri Modalı */}
      {isShareModalOpen && (
        <Transition appear show={isShareModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setIsShareModalOpen(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
              </Transition.Child>

              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
                        </span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-sm p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                  <Dialog.Title className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                    Paylaşım Seçenekleri
                  </Dialog.Title>

                  <div className="space-y-3">
                    {shareOptions.map((option, index) => (
                    <button
                        key={index}
                        onClick={option.action}
                        className="w-full text-left px-4 py-3 rounded-xl bg-gray-50/80 dark:bg-gray-700/80 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-colors text-gray-900 dark:text-white"
                      >
                        {option.name}
                    </button>
                    ))}
                </div>
              </div>
              </Transition.Child>
          </div>
          </Dialog>
        </Transition>
      )}

      {/* Başarı Modalı */}
      {isSuccessDialogOpen && (
        <Transition appear show={isSuccessDialogOpen} as={Fragment}>
      <Dialog
            as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setIsSuccessDialogOpen(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
              </Transition.Child>

              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-sm p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                  <Dialog.Title className="text-lg font-medium text-green-600 dark:text-green-400 mb-2">
              Başarılı!
                  </Dialog.Title>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
              {successMessage}
            </p>

                  <div className="flex justify-end">
              <button
                onClick={() => setIsSuccessDialogOpen(false)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Tamam
              </button>
            </div>
          </div>
              </Transition.Child>
        </div>
          </Dialog>
        </Transition>
      )}

      {/* Hata Modalı */}
      {isErrorDialogOpen && (
        <Transition appear show={isErrorDialogOpen} as={Fragment}>
      <Dialog
            as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setIsErrorDialogOpen(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
              </Transition.Child>

              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-sm p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                  <Dialog.Title className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                    Hata
            </Dialog.Title>
            
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {errorMessage}
            </p>

                  <div className="flex justify-end">
              <button
                      onClick={() => setIsErrorDialogOpen(false)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Tamam
              </button>
            </div>
          </div>
              </Transition.Child>
        </div>
      </Dialog>
        </Transition>
      )}
    </div>
  );
} 