import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AVAILABLE_TESTS } from '../data/tests/index';
import { useAuth } from '../lib/auth';
import { generateEncryptionKey, generateIV, encryptData } from '../utils/encryption';
import type { Module, Test as TestType } from '../data/tests/types';

// ============================================================================
// CONSTANTS AND INTERFACES
// ============================================================================

// LocalStorage keys for saving test progress
const STORAGE_KEY_PREFIX = 'test_progress_';
const getStorageKey = (testId: string, clientId: string) => `${STORAGE_KEY_PREFIX}${testId}_${clientId}`;

// Interface for test progress data structure
interface TestProgress {
  answers: Record<string, any>;
  currentQuestionIndex: number;
  startTime: string | null;
  elapsedTime: number;
  notes?: string;
  selectedModules?: string[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Test() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Route and navigation state
  const { testId, clientId, token } = useParams<{ testId: string; clientId: string; token: string }>();
  const navigate = useNavigate();
  const { professional, loading: authLoading } = useAuth();

  // Test and question state
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, any>>({});
  const [testNotes, setTestNotes] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);

  // UI state
  const [showIntro, setShowIntro] = useState(true);
  const [showModuleSelection, setShowModuleSelection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isMobile, setIsMobile] = useState(false);

  // Authentication and client state
  const [client, setClient] = useState<any>(null);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [testData, setTestData] = useState<any>(null);

  // Timer state
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);

  // Module selection state
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // ============================================================================
  // EFFECTS AND HANDLERS
  // ============================================================================

  // Theme management effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Screen size detection for responsive UI
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Test ilerlemesini kaydet
  const saveProgress = () => {
    if (!testId || !clientId) return;
    
    const progress: TestProgress = {
      answers: testAnswers,
      currentQuestionIndex,
      startTime: startTime?.toISOString() || null,
      elapsedTime,
      notes: testNotes,
      selectedModules
    };
    
    localStorage.setItem(getStorageKey(testId, clientId), JSON.stringify(progress));
  };

  // Test ilerlemesini yükle
  const loadProgress = () => {
    if (!testId || !clientId) return;
    
    const savedProgress = localStorage.getItem(getStorageKey(testId, clientId));
    if (!savedProgress) return;
    
    try {
      const progress: TestProgress = JSON.parse(savedProgress);
      
      setTestAnswers(progress.answers);
      setCurrentQuestionIndex(progress.currentQuestionIndex);
      setTestNotes(progress.notes || '');
      
      if (progress.selectedModules && progress.selectedModules.length > 0) {
        setSelectedModules(progress.selectedModules);
        setShowModuleSelection(false);
      }
      
      if (progress.startTime) {
        setStartTime(new Date(progress.startTime));
        setElapsedTime(progress.elapsedTime);
        setTimerActive(true);
        setShowIntro(false);
      }
      
      console.log("Test ilerlemesi yüklendi:", progress);
    } catch (error) {
      console.error("Test ilerlemesi yüklenirken hata oluştu:", error);
    }
  };

  // Test ilerlemesini temizle
  const clearProgress = () => {
    if (!testId || !clientId) return;
    localStorage.removeItem(getStorageKey(testId, clientId));
  };

  // Timer'ı başlat
  const startTimer = () => {
    const now = new Date();
    setStartTime(now);
    setTimerActive(true);
    saveProgress();
  };

  // Timer'ı durdur
  const stopTimer = () => {
    setEndTime(new Date());
    setTimerActive(false);
    clearProgress();
  };

  // Timer'ı güncelle
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        saveProgress();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, startTime]);

  // Timer'ı formatla
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Test başladığında timer'ı başlat
  useEffect(() => {
    if (!showIntro && !startTime) {
      startTimer();
    }
  }, [showIntro, startTime]);

  // Modül seçimi yapıldığında soruları filtrele
  useEffect(() => {
    // Güvenlik kontrolü: selectedTest veya selectedModules undefined olabilir
    if (!selectedTest) {
      // Test henüz yüklenmemiş, boş bir array olarak başlat
      setFilteredQuestions([]);
      return;
    }
    
    // Modüler testlerde, seçilen modül varsa onlara ait soruları filtrele
    if (selectedTest.isModular && selectedModules && selectedModules.length > 0) {
      // Seçilen modüllere ait soruları filtrele
      const questions = selectedTest.questions.filter(q => 
        q.moduleId && selectedModules.includes(q.moduleId)
      );
      setFilteredQuestions(questions);
    } else if (selectedTest) {
      // Modüler değilse veya hiç modül seçilmediyse tüm soruları göster
      setFilteredQuestions(selectedTest.questions || []);
    }
  }, [selectedTest, selectedModules]);

  // Cevaplar değiştiğinde ilerlemeyi kaydet
  useEffect(() => {
    if (!showIntro) {
      saveProgress();
    }
  }, [testAnswers, currentQuestionIndex, testNotes]);

  // Component mount olduğunda ilerlemeyi yükle
  useEffect(() => {
    loadProgress();
  }, [testId, clientId]);

  useEffect(() => {
    // Oturum yükleme tamamlanana kadar bekle
    if (authLoading) {
      return;
    }

    const initializeTest = async () => {
      try {
        // Token ile gelen public test URL'si için kontrol
        // /public-test/:token formatında URL
        if (!testId && !clientId && token) {
          console.log("Public test URL formatı algılandı, token ile test bilgileri alınıyor...");
          
          try {
            // Veritabanında token ile ilişkili test ve client bilgilerini ara
            const { data: tokenData, error: tokenError } = await supabase
              .from('test_tokens')
              .select('*')
              .eq('token', token)
              .single();
              
            if (tokenError) {
              console.error("Token veritabanında bulunamadı:", tokenError);
              setError('Geçersiz test linki veya süresi dolmuş.');
              setLoading(false);
              return;
            }
            
            if (tokenData) {
              console.log("Token bilgileri bulundu:", tokenData);
              
              // Token süresini kontrol et
              const expiresAt = new Date(tokenData.expires_at);
              if (expiresAt < new Date()) {
                setError('Test linkinin süresi dolmuş.');
                setLoading(false);
                return;
              }
              
              // URL parametreleri olmadığı için token içinden bilgileri al
              const foundTestId = tokenData.test_id;
              const foundClientId = tokenData.client_id;
              
              console.log("Token içinden çıkarılan bilgiler:", { 
                testId: foundTestId, 
                clientId: foundClientId
              });
              
        // Test varlığını kontrol et
              const test = AVAILABLE_TESTS.find(t => t.id === foundTestId);
        if (!test) {
          setError('Test bulunamadı.');
          setLoading(false);
          return;
        }
              
              // Test ve client bilgilerini ayarla
        setSelectedTest(test);
              setTokenVerified(true);
              setAuthorized(true);
              
              // Client bilgilerini yükle
              await loadClientWithId(foundClientId);
              
              setLoading(false);
              return;
            } else {
              setError('Geçersiz test linki.');
            setLoading(false);
            return;
            }
          } catch (error) {
            console.error("Token sorgusu hatası:", error);
            setError('Geçersiz test linki.');
            setLoading(false);
            return;
          }
        }
        
        // Normal /test/:testId/:clientId formatı için doğrulama
        // (Bu rotada token kullanılmaz, doğrudan profesyonel erişimi için)
        
        // Test varlığını kontrol et
        const test = AVAILABLE_TESTS.find(t => t.id === testId);
        if (!test) {
          setError('Test bulunamadı.');
          setLoading(false);
          return;
        }
        setSelectedTest(test);

        // Professional kontrolü
        if (!professional) {
          setError('Bu sayfaya erişim yetkiniz yok. Lütfen giriş yapın veya geçerli bir test linki kullanın.');
          setLoading(false);
          return;
        }
        
          // Professional ise, client'ın kendisine ait olup olmadığını kontrol et
          const { data, error } = await supabase
            .from('clients')
            .select('professional_id')
            .eq('id', clientId)
            .single();
            
          if (error || !data) {
            setError('Danışan bilgilerine erişim yetkiniz yok.');
            setLoading(false);
            return;
          }
          
          if (data.professional_id !== professional.id) {
            setError('Bu danışan size ait değil.');
            setLoading(false);
            return;
          }
          
          setAuthorized(true);

        // Client bilgilerini yükle
        await loadClient();
        
        setLoading(false);
      } catch (err) {
        setError('Test yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    initializeTest();

    // Cleanup function
    return () => {
      // Eğer token ile giriş yapıldıysa oturumu kapat
      if (token) {
        supabase.auth.signOut().catch(console.error);
      }
    };
  }, [testId, clientId, token, professional, authLoading]);

  async function loadClient() {
    try {
      console.log("Client yükleniyor, ID:", clientId);
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error("Client yükleme hatası:", clientError);
        throw clientError;
      }
      
      if (!clientData) {
        console.error("Client bulunamadı");
        throw new Error('Danışan bulunamadı');
      }
      
      console.log("Client başarıyla yüklendi:", clientData.full_name);
      setClient(clientData);
    } catch (error) {
      console.error('Error loading client:', error);
      setError('Danışan bilgileri yüklenirken bir hata oluştu.');
      throw error;
    }
  }

  // Client bilgilerini sadece ID kullanarak yükle (public test URL'si için)
  async function loadClientWithId(clientId: string) {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error("Client bilgileri alınamadı:", clientError);
        setError('Danışan bilgileri bulunamadı.');
        return;
      }

      setClient(clientData);
    } catch (err) {
      console.error("Client yükleme hatası:", err);
      setError('Danışan bilgileri yüklenirken hata oluştu.');
    }
  }

  async function handleSubmitTest() {
    if (!selectedTest || !clientId) return;

    try {
      setLoading(true);
      console.log("Test gönderiliyor...");
      
      // Timer'ı durdur
      stopTimer();
      const testDuration = endTime ? Math.floor((endTime.getTime() - startTime!.getTime()) / 1000) : elapsedTime;
      
      // Modüler test için sadece seçilen modüllerin cevaplarını hesapla
      let finalAnswers = testAnswers;
      
      if (selectedTest.isModular && selectedModules.length > 0) {
        // Sadece seçilen modüllere ait soruların cevaplarını filtrele
        finalAnswers = Object.entries(testAnswers).reduce((filtered, [questionId, answer]) => {
          // Soruyu bul
          const question = selectedTest.questions.find(q => q.id === questionId);
          
          // Soru bir modüle ait ve seçilen modüller içindeyse ekle
          if (question && question.moduleId && selectedModules.includes(question.moduleId)) {
            filtered[questionId] = answer;
          }
          
          return filtered;
        }, {} as Record<string, any>);
      }
      
      const score = selectedTest.calculateScore(finalAnswers);
      
      // Şifreleme anahtarları oluştur
      const key = generateEncryptionKey();
      const iv = generateIV();

      // Test cevaplarını şifrele
      const encryptedAnswers = await encryptData(finalAnswers, key, iv);

      // Professional ID'yi belirle
      let professionalId = professional?.id;
      
      // Eğer token ile giriş yapıldıysa, client'ın bağlı olduğu professional'ı bul
      if (!professionalId && client?.professional_id) {
        professionalId = client.professional_id;
      }
      
      if (!professionalId) {
        throw new Error('Ruh sağlığı uzmanı bilgisi bulunamadı');
      }

      console.log("Test kaydediliyor, professional_id:", professionalId, "client_id:", clientId);
      
      // Test verilerini hazırla
      const testResultData = {
        client_id: clientId,
        professional_id: professionalId,
        test_type: selectedTest.id,
        score,
        answers: finalAnswers,
        encrypted_answers: encryptedAnswers,
        encryption_key: key,
        iv: iv,
        notes: testNotes || null,
        duration_seconds: testDuration,
        started_at: startTime?.toISOString(),
        completed_at: endTime?.toISOString(),
        // selected_modules alanı veritabanında olmadığı için kaldırıldı
        // Veritabanına bu sütun eklendiğinde aşağıdaki satır aktif edilebilir
        // selected_modules: selectedTest.isModular ? selectedModules : null
      };
      
      // Test verilerini state'e kaydet
      setTestData(testResultData);
      
      // Her durumda test sonuçlarını kaydet
      const { data, error } = await supabase
        .from('test_results')
        .insert(testResultData)
        .select();

      if (error) {
        console.error("Test kaydetme hatası:", error);
        throw error;
      }

      console.log("Test başarıyla kaydedildi:", data);
      
      // Token ile erişimde tamamlandı sayfasına yönlendir
      if (token) {
        console.log("Token ile erişimde test tamamlandı");
        setTestCompleted(true);
        setLoading(false);
        return;
      }
      
      // Ruh sağlığı uzmanı olarak erişimde, test sonuçları sayfasına yönlendir
      navigate(`/clients/${clientId}?tab=test-results`);
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Test sonuçları kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(questionId: string, value: any) {
    // Görsel geri bildirim için işlem başladığını gösteren bir state ekleyebiliriz
    const selectedOption = document.getElementById(`${questionId}_${value}`);
    if (selectedOption) {
      // Önce seçim animasyonu göster
      selectedOption.classList.add('ring-2', 'ring-blue-500', 'scale-[1.02]');
    }
    
    // Sonra cevabı kaydet
    setTestAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Otomatik ilerleme için - 500ms gecikme ile ilerle
    // Sadece son soru değilse ilerle
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      // Önce bir kısa bekleme süresi koy, bu sırada yanıt kaydedilsin
      setTimeout(() => {
        // Animasyonu kaldır
        if (selectedOption) {
          selectedOption.classList.remove('ring-2', 'ring-blue-500', 'scale-[1.02]');
        }
        // Bir sonraki soruya geç
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  }

  // Testi yeniden başlatma fonksiyonu
  function handleRestartTest() {
    if (window.confirm('Testi yeniden başlatmak istediğinize emin misiniz? Mevcut ilerlemeniz silinecektir.')) {
      // Timer'ı durdur
      if (timerActive) {
        setTimerActive(false);
      }
      
      // Verileri sıfırla
      setTestAnswers({});
      setCurrentQuestionIndex(0);
      setTestNotes('');
      
      // Test ilerleme bilgisini temizle
      clearProgress();
      
      // Giriş ekranına dön
      setShowIntro(true);
      setShowModuleSelection(false);
      
      // Modül seçimini temizle (eğer modüler test ise)
      if (selectedTest?.isModular) {
        setSelectedModules([]);
      }
      
      // Timer'ı sıfırla
      setStartTime(null);
      setEndTime(null);
      setElapsedTime(0);
    }
  }

  // Modül seçimini tamamla ve teste başla
  function handleModuleSelectionComplete() {
    if (selectedModules.length === 0) {
      // Hiç modül seçilmediyse uyarı göster
      alert('Lütfen en az bir modül seçiniz.');
      return;
    }
    
    // Modül seçimini tamamla ve teste başla
    setShowModuleSelection(false);
    setShowIntro(false);
    setCurrentQuestionIndex(0);
  }

  // Tüm modülleri seç
  function selectAllModules() {
    if (selectedTest?.modules) {
      setSelectedModules(selectedTest.modules.map(m => m.id));
    }
  }

  // Modül seçimini temizle
  function clearModuleSelection() {
    setSelectedModules([]);
  }

  // ============================================================================
  // CONDITIONAL RENDERING
  // ============================================================================

  // Loading states
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Oturum bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Hata</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          {!professional && !token && (
            <div className="mt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Giriş Yap
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Test not found state
  if (!selectedTest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Test bulunamadı.</p>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600 dark:text-gray-400">Bu teste erişim yetkiniz bulunmamaktadır.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">Debug: {JSON.stringify({ testId, clientId, token: token?.substring(0, 5) + '...', professional: professional?.id?.substring(0, 5) + '...' })}</p>
        </div>
      </div>
    );
  }

  // Test completed state
  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-4">
        <div className="max-w-md w-full mx-auto p-3 sm:p-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-xl p-5 sm:p-8 text-center border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              {isMobile ? `${getTruncatedTestName(selectedTest.name)} Tamamlandı` : 'Test Başarıyla Tamamlandı'}
            </h2>
            
            <div className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              <p>
                Testi tamamladığınız için teşekkür ederiz. Cevaplarınız başarıyla kaydedildi.
              </p>

              {/* Modüler test için tamamlanan modülleri göster */}
              {selectedTest?.isModular && selectedModules.length > 0 && (
                <div className="mt-3 mb-4 sm:mt-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Tamamlanan Modüller</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <ul className="text-left space-y-1">
                      {selectedTest.modules
                        ?.filter(module => selectedModules.includes(module.id))
                        .map(module => (
                          <li key={module.id} className="flex items-center">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">{module.name}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              {professional && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 my-4 sm:my-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Test Süresi</div>
                    <div className="text-sm sm:text-lg font-medium text-blue-700 dark:text-blue-300">
                      {formatTime(elapsedTime)}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-100 dark:border-purple-800/30">
                    <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">Tamamlanma Zamanı</div>
                    <div className="text-sm sm:text-lg font-medium text-purple-700 dark:text-purple-300">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-800/30">
                <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">
                  Test sonuçlarınız ruh sağlığı uzmanınız tarafından değerlendirilecek ve bir sonraki görüşmenizde sizinle paylaşılacaktır.
                </p>
              </div>
              <p className="text-xs sm:text-sm">
                Bu pencereyi güvenle kapatabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-12">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-xl p-3 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
          {/* Fixed header with all controls and indicators */}
          <div className="mb-4 sm:mb-6">
            {/* Test title and controls row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-medium sm:font-bold text-gray-700 sm:bg-gradient-to-r sm:from-blue-600 sm:to-purple-600 dark:text-gray-300 sm:dark:from-blue-400 sm:dark:to-purple-400 sm:bg-clip-text sm:text-transparent truncate max-w-[200px] sm:max-w-xs">
                {selectedTest && (isMobile ? 
                  getTruncatedTestName(selectedTest.name) : 
                  selectedTest.name)}
            </h2>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {!showIntro && !showModuleSelection && (
                  <div className="flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800/30 text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Süre: {formatTime(elapsedTime)}</span>
                  </div>
                )}
                
                {!showIntro && (
                  <button
                    onClick={handleRestartTest}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-800/30 flex items-center justify-center"
                    aria-label="Testi yeniden başlat"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
                
              <button
                onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700/50 flex items-center justify-center"
                aria-label={darkMode ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
              >
                {darkMode ? (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
                </div>
                </div>

            {/* Progress indicator - only show during test */}
            {!showIntro && !showModuleSelection && filteredQuestions.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Soru {currentQuestionIndex + 1} / {filteredQuestions.length}
                    </span>
            </div>
                  <div className="w-full h-2 sm:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${(Object.keys(testAnswers).length / filteredQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Header divider */}
          {!showIntro && !showModuleSelection && (
            <div className="w-full h-px bg-gray-200 dark:bg-gray-700 mb-4 sm:mb-6"></div>
          )}

          {showIntro ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="prose dark:prose-invert max-w-none text-sm sm:text-base">
                <p>{selectedTest.description}</p>
                {selectedTest.instructions && (
                  <>
                    <h3 className="text-sm sm:text-base font-medium sm:font-semibold text-gray-900 dark:text-white">
                      {isMobile ? getTruncatedTestName(selectedTest.name) : selectedTest.name} Yönergesi
                    </h3>
                    <p>{selectedTest.instructions}</p>
                  </>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (selectedTest.isModular) {
                      setShowModuleSelection(true);
                      setShowIntro(false);
                    } else {
                      setShowIntro(false);
                    }
                  }}
                  className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center"
                >
                  <span className="flex items-center">
                  {selectedTest.isModular ? 'Modül Seçimine Geç' : 'Teste Başla'}
                    <svg className="w-3 h-3 sm:w-5 sm:h-5 ml-1 sm:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          ) : showModuleSelection ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="prose dark:prose-invert max-w-none text-sm sm:text-base">
                <h3 className="text-sm sm:text-base font-medium sm:font-semibold text-gray-900 dark:text-white">
                  {isMobile ? getTruncatedTestName(selectedTest.name) : selectedTest.name} - Modül Seçimi
                </h3>
                <p>Lütfen değerlendirmek istediğiniz modülleri seçiniz:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                {selectedTest.modules?.map((module: Module) => (
                  <div 
                    key={module.id}
                    className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 cursor-pointer ${
                      selectedModules.includes(module.id)
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                    onClick={() => {
                      if (selectedModules.includes(module.id)) {
                        setSelectedModules(prev => prev.filter(id => id !== module.id));
                      } else {
                        setSelectedModules(prev => [...prev, module.id]);
                      }
                    }}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(module.id)}
                          onChange={() => {}}
                          className="h-3.5 sm:h-5 w-3.5 sm:w-5 text-blue-600 dark:text-blue-400 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        />
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <h4 className={`text-sm sm:text-base font-medium ${
                          selectedModules.includes(module.id)
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {module.name}
                        </h4>
                        {module.description && (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={selectAllModules}
                    className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <span className="flex items-center">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    Tümünü Seç
                    </span>
                  </button>
                  <button
                    onClick={clearModuleSelection}
                    className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
                  >
                    <span className="flex items-center">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    Temizle
                    </span>
                  </button>
                </div>
                <div className="flex justify-between sm:justify-end gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setShowModuleSelection(false);
                      setShowIntro(true);
                    }}
                    className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-lg transition-colors shadow-sm border border-gray-200 dark:border-gray-700 flex items-center"
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Geri
                  </button>
                  <button
                    onClick={handleModuleSelectionComplete}
                    disabled={selectedModules.length === 0}
                    className="px-3 sm:px-6 py-1 sm:py-2.5 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-md flex items-center"
                  >
                    <span className="flex items-center">
                    Teste Başla
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredQuestions.length > 0 && currentQuestionIndex < filteredQuestions.length ? (
                <div key={filteredQuestions[currentQuestionIndex].id} className="space-y-4 sm:space-y-6">
                  {/* Question section */}
                  <div className="bg-white dark:bg-gray-800 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-start">
                      <span className="inline-flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full h-6 w-6 sm:h-7 sm:w-7 text-xs sm:text-sm font-medium mr-2.5 sm:mr-3 flex-shrink-0 mt-0.5">
                        {currentQuestionIndex + 1}
                      </span>
                      <p className="text-base sm:text-xl text-gray-900 dark:text-white leading-relaxed font-semibold flex-1">
                        {filteredQuestions[currentQuestionIndex].text}
                      </p>
                </div>
              </div>

                  {/* Divider between question and answers */}
                  <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                  
                  {/* Answers section */}
                  <div className="space-y-2 sm:space-y-3 bg-gray-50/70 dark:bg-gray-800/30 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    {filteredQuestions[currentQuestionIndex].options.map((option) => {
                      const questionId = filteredQuestions[currentQuestionIndex].id;
                      const optionId = `${questionId}_${option.value}`;
                      const isSelected = testAnswers[questionId] === option.value;

                      // SCID-5-SPQ testi için özel butonlar (Evet/Hayır/Bilmiyorum)
                      if (selectedTest.id === 'scid-5-spq') {
                        // Evet butonu (1)
                        if (option.value === 1) {
                          return (
                            <button
                              key={optionId}
                              id={optionId}
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border text-xs sm:text-base transition-all duration-200 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <span className="text-sm sm:text-lg">✓</span>
                              <span className="ml-2">{option.text}</span>
                            </button>
                          );
                        }
                        // Hayır butonu (0)
                        else if (option.value === 0) {
                          return (
                            <button
                              key={optionId}
                              id={optionId}
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border text-xs sm:text-base transition-all duration-200 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <span className="text-sm sm:text-lg">✕</span>
                              <span className="ml-2">{option.text}</span>
                            </button>
                          );
                        }
                        // Bilmiyorum butonu (2) - SCID-5-SPQ için ek seçenek
                        else if (option.value === 2) {
                          return (
                            <button
                              key={optionId}
                              id={optionId}
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border text-xs sm:text-base transition-all duration-200 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <span className="text-sm sm:text-lg">?</span>
                              <span className="ml-2">{option.text}</span>
                            </button>
                          );
                        }
                      }
                      
                      // SCID-5-CV testi için özel butonlar (1-Yok, 2-Eşik altı, 3-Eşik üstü, 0-Bilgi yetersiz)
                      else if (selectedTest.id === 'scid-5-cv') {
                        // Eşik veya eşik üstü (3) - Evet gibi yeşil
                        if (option.value === 3) {
                          return (
                            <button
                              key={optionId}
                              id={optionId}
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border text-xs sm:text-base transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {option.text}
                            </button>
                          );
                        }
                        // Yok veya eşik altı (1) - Hayır gibi kırmızı
                        else if (option.value === 1) {
                          return (
                            <button
                              key={optionId}
                              id={optionId}
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border text-xs sm:text-base transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {option.text}
                            </button>
                          );
                        }
                        // Eşik altı (2) - Sarı/turuncu
                        else if (option.value === 2) {
                          return (
                            <button
                              key={optionId}
                              id={optionId}
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border text-xs sm:text-base transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {option.text}
                            </button>
                          );
                        }
                        // Bilgi yetersiz (0) - Gri
                        else if (option.value === 0) {
                          return (
                            <button
                              key={optionId}
                              id={optionId}
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border text-xs sm:text-base transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {option.text}
                            </button>
                          );
                        }
                      }

                      // Diğer testler için standart görünüm
                      return (
                        <label
                          key={optionId}
                          id={optionId}
                          htmlFor={optionId}
                          className={`block w-full cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 shadow-md' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          } p-3 sm:p-4 rounded-lg sm:rounded-xl border`}
                          onClick={() => {
                            if (!isSelected) {
                              handleAnswerChange(questionId, option.value);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id={optionId}
                                name={questionId}
                                value={option.value}
                                checked={isSelected}
                                onChange={() => handleAnswerChange(questionId, option.value)}
                                className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 dark:text-blue-400 border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
                              />
                              <span className={`ml-3 sm:ml-4 text-sm sm:text-base ${
                                isSelected 
                                  ? 'text-blue-900 dark:text-blue-100 font-medium' 
                                  : 'text-gray-800 dark:text-gray-100'
                              }`}>
                                {option.text}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sorular yükleniyor...</p>
                  </div>
                </div>
              )}

              {currentQuestionIndex === filteredQuestions.length - 1 && professional && (
                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notlar (Opsiyonel)
                  </label>
                  <textarea
                    value={testNotes}
                    onChange={(e) => setTestNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Test ile ilgili notlarınızı buraya yazabilirsiniz..."
                  />
                </div>
              )}

              <div className="flex justify-between space-y-2 sm:space-y-0 gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Önceki Soru
                </button>
                
                {currentQuestionIndex === filteredQuestions.length - 1 && (
                  <button
                    onClick={handleSubmitTest}
                    disabled={Object.keys(testAnswers).length < filteredQuestions.length}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center shadow-md"
                  >
                    <span className="flex items-center">
                      {Object.keys(testAnswers).length < filteredQuestions.length ? 
                        `Tamamlamak için ${filteredQuestions.length - Object.keys(testAnswers).length} soru daha yanıtlayın` : 
                        'Testi Tamamla'}
                      {Object.keys(testAnswers).length === filteredQuestions.length && (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get truncated test name for mobile display
function getTruncatedTestName(fullName: string): string {
  // Special case for SCID tests - preserve the full format
  if (fullName.startsWith('SCID-')) {
    const parts = fullName.split(' ');
    // Return first part (e.g., "SCID-5-CV" from "SCID-5-CV Klinik Versiyon")
    return parts[0];
  }
  
  // For other tests, return first word or first 10 chars if one long word
  const firstWord = fullName.split(' ')[0];
  return firstWord.length > 10 ? firstWord.substring(0, 10) + '...' : firstWord;
}