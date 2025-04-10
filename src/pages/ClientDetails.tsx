import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { 
  generateEncryptionKey, 
  generateIV, 
  encryptData, 
  decryptData, 
  decryptWithPrivateKey, 
  retrieveKeyPair 
} from '../utils/encryption';
import { generateTestPDF } from '../utils/generateTestPDF';
import { AVAILABLE_TESTS } from '../data/tests';
import '@fontsource/roboto';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  FileText, 
  ClipboardList, 
  Activity, 
  Banknote,
  Info,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

// Yeni oluşturulan bileşenleri import et
import { ClientDetailsTab } from '../components/client-details/ClientDetailsTab';
import { AppointmentsTab } from '../components/client-details/AppointmentsTab';
import { SessionNotesTab } from '../components/client-details/SessionNotesTab';
import { TestsTab } from '../components/client-details/TestsTab';
import TestResultsTab from '../components/client-details/TestResultsTab';

// Mevcut tipleri koru
import { Client } from '../types/client';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SessionNote {
  id: string;
  created_at: string;
  title: string;
  content: string;
  encrypted_content: string;
  client_public_key?: string;
  professional_id: string;
  client_id: string;
  professional?: {
    full_name: string;
  };
  attachments?: string[];
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

type TabType = 'details' | 'appointments' | 'notes' | 'tests' | 'testResults';

const tabIcons = {
  details: <Info className="h-4 w-4 mr-2" />,
  appointments: <Calendar className="h-4 w-4 mr-2" />,
  notes: <FileText className="h-4 w-4 mr-2" />,
  tests: <ClipboardList className="h-4 w-4 mr-2" />,
  testResults: <Activity className="h-4 w-4 mr-2" />
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function ClientDetails() {
  const params = useParams<{ clientId: string }>();
  const id = params.clientId;
  
  const navigate = useNavigate();
  const { professional, assistant } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // İlk olarak client verisini çek
        const clientResult = await loadClient();
        
        if (!clientResult) {
          setLoading(false);
          return;
        }
        
        // Diğer verileri çek
        if (professional) {
          try {
            await loadSessionNotes().catch(error => {
              console.error("Seans notları yüklenirken hata:", error);
            });
            
            await loadAppointments().catch(error => {
              console.error("Randevular yüklenirken hata:", error);
            });
            
            await loadTestResults().catch(error => {
              console.error("Test sonuçları yüklenirken hata:", error);
            });
          } catch (error) {
            console.error("Ek veri yükleme sürecinde hata:", error);
          }
        } else {
          await loadAppointments().catch(error => {
            console.error("Randevular yüklenirken hata:", error);
          });
        }
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [id, professional]);

  // Görünür sekmeleri belirle
  const visibleTabs = useMemo(() => {
    const tabs = [
      { id: 'details', name: 'Danışan Bilgileri', icon: tabIcons.details },
      { id: 'appointments', name: 'Randevular', icon: tabIcons.appointments },
    ];

    if (professional) {
      tabs.push({ id: 'notes', name: 'Seans Notları', icon: tabIcons.notes });
      tabs.push({ id: 'tests', name: 'Testler', icon: tabIcons.tests });
      tabs.push({ id: 'testResults', name: 'Test Sonuçları', icon: tabIcons.testResults });
    } else if (assistant) {
      tabs.push({ id: 'tests', name: 'Testler', icon: tabIcons.tests });
    }

    return tabs;
  }, [professional, assistant]);

  async function loadClient(): Promise<boolean> {
    try {
      // ID doğrulama
      if (!id || typeof id !== 'string' || id === 'undefined' || id === 'null') {
        return false;
      }
      
      // Supabase sorgusu yapmadan önce auth token kontrolü
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/giris');
        return false;
      }
      
      try {
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
          .eq('id', id)
          .single();

        if (clientError) {
          console.error("Danışan yükleme hatası:", clientError.message);
          return false;
        }

        if (!clientData) {
          return false;
        }

        // Klinik bilgisini ayrı bir sorgu ile çekelim
        if (clientData?.professional?.assistant_id) {
          try {
            const { data: assistantData, error: assistantError } = await supabase
              .from('assistants')
              .select('id, clinic_name')
              .eq('id', clientData.professional.assistant_id)
              .single();
            
            if (!assistantError && assistantData) {
              clientData.professional.clinic_name = assistantData.clinic_name;
            }
          } catch (assistantError) {
            console.error("Asistan sorgusunda beklenmeyen hata:", assistantError);
          }
        }

        setClient(clientData);
        return true;
      } catch (queryError) {
        return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Danışan verisi yüklenirken hata:', error.message);
      }
      return false;
    }
  }

  async function loadSessionNotes(): Promise<boolean> {
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

      // Anahtarları getir
      const { privateKey } = retrieveKeyPair('session_notes');
      
      if (!privateKey) {
        // Anahtarlar yoksa şifrelenmiş veriyi çözemeyiz, ama yine de notları gösterebiliriz
        console.warn('Şifreleme anahtarları bulunamadı. Notlar şifrelenmiş formatta kalacak.');
        setSessionNotes(data);
        return true;
      }

      // Notları deşifre et
      const decryptedNotes = await Promise.all(
        data.map(async (note) => {
          if (note.encrypted_content && note.client_public_key) {
            try {
              const decryptedContent = await decryptWithPrivateKey(
                note.encrypted_content,
                note.client_public_key,
                privateKey
              );
              
              if (decryptedContent) {
                return { 
                  ...note, 
                  content: decryptedContent.content,
                  title: decryptedContent.title || note.title,
                  // attachmentKeys alanı note içinde saklanıyor ancak dışarı yansıtılmıyor
                };
              }
            } catch (e) {
              console.error('Not deşifre edilemedi:', e);
              return { ...note, content: 'Not içeriği deşifre edilemedi.' };
            }
          }
          return note;
        })
      );

      setSessionNotes(decryptedNotes);
      return true;
    } catch (error) {
      console.error('Seans notları yüklenirken hata:', error);
      return false;
    }
  }

  async function loadAppointments(): Promise<boolean> {
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
      return true;
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
      return false;
    }
  }

  async function loadTestResults(): Promise<boolean> {
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

      // Anahtarları getir
      const { privateKey } = retrieveKeyPair('test_results');

      // Test sonuçlarını formatla
      const formattedResults = await Promise.all(data.map(async result => {
        // Eğer şifrelenmiş veri varsa ve anahtarlar mevcutsa deşifre et
        let decryptedData = null;
        
        if (privateKey && result.encrypted_answers && result.client_public_key) {
          try {
            decryptedData = await decryptWithPrivateKey(
              result.encrypted_answers,
              result.client_public_key,
              privateKey
            );
          } catch (e) {
            console.error('Test sonucu deşifre edilemedi:', e);
          }
        }
        
        // Test adını bul
        const testInfo = AVAILABLE_TESTS.find(test => test.id === result.test_type);
        
        return {
          ...result,
          decryptedAnswers: decryptedData?.answers || null,
          test_name: testInfo?.name || 'Bilinmeyen Test'
        };
      }));

      setTestResults(formattedResults);
      return true;
    } catch (error) {
      console.error('Test sonuçları yüklenirken hata:', error);
      return false;
    }
  }

  if (loading) {
    return (
      <LoadingSpinner fullPage size="medium" showLoadingText={false} />
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <AlertCircle className="w-6 h-6 text-amber-500 mr-2" />
            Danışan bulunamadı
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Aradığınız danışan kayıtlarımızda bulunamadı. Bu durum aşağıdaki nedenlerden kaynaklanabilir:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li>Danışanın ID'si hatalı girilmiş olabilir</li>
            <li>Danışan kaydı silinmiş olabilir</li>
            <li>Oturum süreniz dolmuş olabilir</li>
            <li>Bu danışanı görüntüleme yetkiniz olmayabilir</li>
          </ul>
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Yenile
            </button>
            <button
              onClick={() => navigate('/danisanlar')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tüm Danışanlar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Üst Kısım */}
      <div className="relative">
        {/* Arkaplan Efektleri */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(120,119,198,0.1),transparent)]"></div>
          <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full opacity-30 bg-primary-400 dark:bg-primary-600 blur-3xl"></div>
          <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full opacity-20 bg-indigo-400 dark:bg-indigo-600 blur-3xl"></div>
        </div>

        {/* Ana İçerik Konteyneri */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md shadow-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
          {/* Başlık ve Geri Dön Butonu */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/danisanlar')}
                className="text-sm bg-white dark:bg-slate-700 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Tüm Danışanlar
              </button>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
              >
                {client.full_name}
              </motion.h1>
            </div>
          </div>

          {/* Danışan Özet Bilgisi */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white/80 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-start">
              <div className="bg-blue-100 dark:bg-blue-900/30 mr-4 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ruh Sağlığı Uzmanı</h3>
                <p className="text-base font-medium text-gray-900 dark:text-white">{client.professional?.full_name || "Atanmamış"}</p>
              </div>
            </div>

            {client.session_fee && (
              <div className="bg-white/80 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 mr-4 p-3 rounded-lg text-green-600 dark:text-green-400">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Seans Ücreti</h3>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {Number(client.session_fee).toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400">
                      Uzman: %{client.professional_share_percentage}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 text-xs text-purple-600 dark:text-purple-400">
                      Klinik: %{client.clinic_share_percentage}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/80 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-start">
              <div className="bg-purple-100 dark:bg-purple-900/30 mr-4 p-3 rounded-lg text-purple-600 dark:text-purple-400">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">İletişim Bilgileri</h3>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {client.email && (
                    <div className="flex items-center space-x-2 mb-1">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {!client.email && !client.phone && (
                    <span className="text-gray-400 dark:text-gray-500 italic">İletişim bilgisi yok</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1 mb-6">
            <nav className="-mb-px flex space-x-2 md:space-x-6" aria-label="Tabs">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={classNames(
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                    'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-all duration-200 flex-shrink-0 flex items-center'
                  )}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab içeriği */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
          >
            {activeTab === 'details' && client && (
              <ClientDetailsTab client={client} />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsTab 
                clientId={id || ''} 
                appointments={{
                  upcoming: upcomingAppointments,
                  past: pastAppointments
                }}
                loadAppointments={loadAppointments} 
              />
            )}

            {activeTab === 'notes' && (
              <SessionNotesTab 
                clientId={id || ''} 
                sessionNotes={sessionNotes} 
                loadSessionNotes={loadSessionNotes} 
              />
            )}

            {activeTab === 'tests' && (
              <TestsTab clientId={id || ''} client={client} />
            )}

            {activeTab === 'testResults' && (
              <TestResultsTab 
                clientId={id || ''} 
                testResults={testResults} 
                loadTestResults={loadTestResults}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 