import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AVAILABLE_TESTS } from '../data/tests';
import { useAuth } from '../lib/auth';
import { generateEncryptionKey, generateIV, encryptData } from '../utils/encryption';
import { Module } from '../data/tests/types';

// LocalStorage keys
const STORAGE_KEY_PREFIX = 'test_progress_';
const getStorageKey = (testId: string, clientId: string) => `${STORAGE_KEY_PREFIX}${testId}_${clientId}`;

interface TestProgress {
  answers: Record<string, any>;
  currentQuestionIndex: number;
  startTime: string | null;
  elapsedTime: number;
  notes?: string;
  selectedModules?: string[];
}

export function Test() {
  const { testId, clientId, token } = useParams<{ testId: string; clientId: string; token: string }>();
  const navigate = useNavigate();
  const { professional, loading: authLoading } = useAuth();
  const [selectedTest, setSelectedTest] = useState<typeof AVAILABLE_TESTS[0] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, any>>({});
  const [testNotes, setTestNotes] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Timer state'leri
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);

  // Modül seçimi için state'ler
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [showModuleSelection, setShowModuleSelection] = useState(false);

  // Tema değişikliğini izle ve uygula
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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
    if (selectedTest?.isModular && selectedModules.length > 0) {
      // Seçilen modüllere ait soruları filtrele
      const questions = selectedTest.questions.filter(q => 
        q.moduleId && selectedModules.includes(q.moduleId)
      );
      setFilteredQuestions(questions);
    } else if (selectedTest) {
      // Modüler değilse veya hiç modül seçilmediyse tüm soruları göster
      setFilteredQuestions(selectedTest.questions);
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
        // Test varlığını kontrol et
        const test = AVAILABLE_TESTS.find(t => t.id === testId);
        if (!test) {
          setError('Test bulunamadı.');
          setLoading(false);
          return;
        }
        setSelectedTest(test);

        // Token ile erişim kontrolü
        if (token) {
          // Token'ı doğrula
          const isValid = await verifyTestToken();
          if (!isValid) {
            setError('Geçersiz test linki veya süresi dolmuş.');
            setLoading(false);
            return;
          }
          
          setTokenVerified(true);
          setAuthorized(true);
        } else if (!professional) {
          setError('Bu sayfaya erişim yetkiniz yok. Lütfen giriş yapın veya geçerli bir test linki kullanın.');
          setLoading(false);
          return;
        } else {
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
        }

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
      if (token && tokenVerified) {
        supabase.auth.signOut().catch(console.error);
      }
    };
  }, [testId, clientId, token, professional, authLoading]);

  async function verifyTestToken() {
    try {
      console.log("Token doğrulanıyor:", token);
      
      if (!token || !testId || !clientId) {
        console.error("Token, testId veya clientId eksik");
        return false;
      }
      
      // Önce veritabanında token kontrolü dene
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .from('test_tokens')
          .select('*')
          .eq('token', token)
          .eq('test_id', testId)
          .eq('client_id', clientId)
          .single();
          
        if (!tokenError && tokenData) {
          // Token'ın süresini kontrol et
          const expiresAt = new Date(tokenData.expires_at);
          if (expiresAt >= new Date()) {
            console.log("Veritabanında geçerli token bulundu");
            return true;
          } else {
            console.error("Token süresi dolmuş");
            return false;
          }
        }
      } catch (dbError) {
        console.log("Veritabanında token bulunamadı, alternatif doğrulama deneniyor...");
      }
      
      // Veritabanında bulunamadıysa, token formatını kontrol et (base64 encoded)
      try {
        // Base64 decode
        const decodedToken = atob(token);
        console.log("Decoded token:", decodedToken);
        
        // Token formatı: testId:clientId:professionalId:timestamp:secretKey
        const parts = decodedToken.split(':');
        
        if (parts.length !== 5) {
          console.error("Geçersiz token formatı");
          return false;
        }
        
        const [tokenTestId, tokenClientId, tokenProfessionalId, timestampStr, secretKey] = parts;
        
        // Test ID ve Client ID kontrolü
        if (tokenTestId !== testId || tokenClientId !== clientId) {
          console.error("Token bilgileri eşleşmiyor");
          return false;
        }
        
        // Secret key kontrolü - çevre değişkeninden al
        const testTokenSecretKey = import.meta.env.VITE_TEST_TOKEN_SECRET_KEY;
        if (!testTokenSecretKey || secretKey !== testTokenSecretKey) {
          console.error("Geçersiz güvenlik anahtarı");
          return false;
        }
        
        // Süre kontrolü (7 gün)
        const timestamp = parseInt(timestampStr);
        const expiryTime = timestamp + (7 * 24 * 60 * 60 * 1000); // 7 gün
        
        if (expiryTime < Date.now()) {
          console.error("Token süresi dolmuş");
          return false;
        }
        
        console.log("Token başarıyla doğrulandı");
        return true;
      } catch (decodeError) {
        console.error("Token decode hatası:", decodeError);
        return false;
      }
    } catch (error) {
      console.error("Token doğrulama hatası:", error);
      return false;
    }
  }

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
    setTestAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Otomatik olarak sonraki soruya geç
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300); // 300ms gecikme ile geçiş yap
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

  // Oturum yükleme durumunda yükleniyor göster
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

  if (!selectedTest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Test bulunamadı.</p>
        </div>
      </div>
    );
  }

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

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Test Başarıyla Tamamlandı
            </h2>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="text-lg">
                Testi tamamladığınız için teşekkür ederiz. Cevaplarınız başarıyla kaydedildi.
              </p>

              {/* Modüler test için tamamlanan modülleri göster */}
              {selectedTest?.isModular && selectedModules.length > 0 && (
                <div className="mt-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Tamamlanan Modüller</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <ul className="text-left space-y-1">
                      {selectedTest.modules
                        ?.filter(module => selectedModules.includes(module.id))
                        .map(module => (
                          <li key={module.id} className="flex items-center">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-blue-700 dark:text-blue-300">{module.name}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              {professional && (
                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Test Süresi</div>
                    <div className="text-lg font-medium text-blue-700 dark:text-blue-300">
                      {formatTime(elapsedTime)}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                    <div className="text-sm text-purple-600 dark:text-purple-400">Tamamlanma Zamanı</div>
                    <div className="text-lg font-medium text-purple-700 dark:text-purple-300">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <p className="text-blue-700 dark:text-blue-300">
                  Test sonuçlarınız ruh sağlığı uzmanınız tarafından değerlendirilecek ve bir sonraki görüşmenizde sizinle paylaşılacaktır.
                </p>
              </div>
              <p className="text-sm">
                Bu pencereyi güvenle kapatabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {selectedTest.name}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label={darkMode ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {!showIntro && !showModuleSelection && professional && (
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Süre: {formatTime(elapsedTime)}
                </div>
              )}
              {client && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Danışan: {client.full_name}
                </div>
              )}
            </div>
          </div>

          {showIntro ? (
            <div className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <p>{selectedTest.description}</p>
                {selectedTest.instructions && (
                  <>
                    <h3>Yönerge</h3>
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
                  className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {selectedTest.isModular ? 'Modül Seçimine Geç' : 'Teste Başla'}
                </button>
              </div>
            </div>
          ) : showModuleSelection ? (
            <div className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>Modül Seçimi</h3>
                <p>Lütfen değerlendirmek istediğiniz modülleri seçiniz:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTest.modules?.map((module: Module) => (
                  <div 
                    key={module.id}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
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
                          className="h-5 w-5 text-blue-600 dark:text-blue-400 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className={`text-base font-medium ${
                          selectedModules.includes(module.id)
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {module.name}
                        </h4>
                        {module.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 justify-between">
                <div className="space-x-3">
                  <button
                    onClick={selectAllModules}
                    className="px-4 py-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    Tümünü Seç
                  </button>
                  <button
                    onClick={clearModuleSelection}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
                  >
                    Temizle
                  </button>
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setShowModuleSelection(false);
                      setShowIntro(true);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-lg transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handleModuleSelectionComplete}
                    disabled={selectedModules.length === 0}
                    className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    Teste Başla
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Soru {currentQuestionIndex + 1} / {filteredQuestions.length}
                </div>
                <div className="h-2 flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {filteredQuestions.length > 0 && currentQuestionIndex < filteredQuestions.length ? (
                <div key={filteredQuestions[currentQuestionIndex].id} className="space-y-4">
                  <p className="text-lg text-gray-900 dark:text-white">
                    {currentQuestionIndex + 1}. {filteredQuestions[currentQuestionIndex].text}
                  </p>
                  <div className="space-y-3">
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
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <span className="text-lg">✓</span>
                              <span className="ml-2">{option.text}</span>
                            </button>
                          );
                        }
                        // Hayır butonu (0)
                        else if (option.value === 0) {
                          return (
                            <button
                              key={optionId}
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <span className="text-lg">✕</span>
                              <span className="ml-2">{option.text}</span>
                            </button>
                          );
                        }
                        // Bilmiyorum butonu (2) - SCID-5-SPQ için ek seçenek
                        else if (option.value === 2) {
                          return (
                            <button
                              key={optionId}
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200 font-medium' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <span className="text-lg">?</span>
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
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-4 rounded-xl border transition-all duration-200 ${
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
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-4 rounded-xl border transition-all duration-200 ${
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
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-4 rounded-xl border transition-all duration-200 ${
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
                              onClick={() => handleAnswerChange(questionId, option.value)}
                              className={`w-full p-4 rounded-xl border transition-all duration-200 ${
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
                          htmlFor={optionId}
                          className={`block w-full cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          } p-4 rounded-xl border`}
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
                                className="h-5 w-5 text-blue-600 dark:text-blue-400 border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
                              />
                              <span className={`ml-4 text-base ${
                                isSelected 
                                  ? 'text-blue-900 dark:text-blue-100 font-medium' 
                                  : 'text-gray-900 dark:text-gray-100'
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Sorular yükleniyor...</p>
                  </div>
                </div>
              )}

              {currentQuestionIndex === filteredQuestions.length - 1 && professional && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notlar (Opsiyonel)
                  </label>
                  <textarea
                    value={testNotes}
                    onChange={(e) => setTestNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Test ile ilgili notlarınızı buraya yazabilirsiniz..."
                  />
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  Önceki Soru
                </button>
                
                {currentQuestionIndex === filteredQuestions.length - 1 && (
                  <button
                    onClick={handleSubmitTest}
                    disabled={Object.keys(testAnswers).length < filteredQuestions.length}
                    className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    Testi Tamamla
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