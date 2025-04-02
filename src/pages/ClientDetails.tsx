import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
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

// Yeni oluşturulan bileşenleri import et
import { ClientDetailsTab } from '../components/client-details/ClientDetailsTab';
import { AppointmentsTab } from '../components/client-details/AppointmentsTab';
import { SessionNotesTab } from '../components/client-details/SessionNotesTab';
import { TestsTab } from '../components/client-details/TestsTab';
import TestResultsTab from '../components/client-details/TestResultsTab';

// Mevcut tipleri koru
import { Client } from '../types/client';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

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
      { id: 'details', name: 'Danışan Bilgileri' },
      { id: 'appointments', name: 'Randevular' },
    ];

    if (professional) {
      tabs.push({ id: 'notes', name: 'Seans Notları' });
      tabs.push({ id: 'tests', name: 'Testler' });
      tabs.push({ id: 'testResults', name: 'Test Sonuçları' });
    } else if (assistant) {
      tabs.push({ id: 'tests', name: 'Testler' });
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
        navigate('/login');
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
            <svg className="w-6 h-6 text-amber-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
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
              onClick={() => navigate('/clients')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Danışanlara Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
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
      <div className="tab-content">
        {activeTab === 'details' && client && (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            <ClientDetailsTab client={client} />
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            <AppointmentsTab 
              clientId={id || ''} 
              appointments={{
                upcoming: upcomingAppointments,
                past: pastAppointments
              }}
              loadAppointments={loadAppointments} 
            />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            <SessionNotesTab 
              clientId={id || ''} 
              sessionNotes={sessionNotes} 
              loadSessionNotes={loadSessionNotes} 
            />
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            <TestsTab clientId={id || ''} client={client} />
          </div>
        )}

        {activeTab === 'testResults' && (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            <TestResultsTab 
              clientId={id || ''} 
              testResults={testResults} 
              loadTestResults={loadTestResults}
            />
          </div>
        )}
      </div>
    </div>
  );
} 