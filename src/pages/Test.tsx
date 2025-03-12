import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AVAILABLE_TESTS } from '../data/tests';
import { useAuth } from '../lib/auth';
import { generateEncryptionKey, generateIV, encryptData } from '../utils/encryption';

// Sabit admin bilgileri (gerçek uygulamada .env dosyasında saklanmalıdır)
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password';

// LocalStorage keys
const STORAGE_KEY_PREFIX = 'test_progress_';
const getStorageKey = (testId: string, clientId: string) => `${STORAGE_KEY_PREFIX}${testId}_${clientId}`;

interface TestProgress {
  answers: Record<string, any>;
  currentQuestionIndex: number;
  startTime: string | null;
  elapsedTime: number;
  notes?: string;
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
  
  // Timer state'leri
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);

  // Test ilerlemesini kaydet
  const saveProgress = () => {
    if (!testId || !clientId) return;
    
    const progress: TestProgress = {
      answers: testAnswers,
      currentQuestionIndex,
      startTime: startTime?.toISOString() || null,
      elapsedTime,
      notes: testNotes
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
        
        // Secret key kontrolü
        if (secretKey !== "psy_secure_test_token_key") {
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
      
      const score = selectedTest.calculateScore(testAnswers);
      
      // Şifreleme anahtarları oluştur
      const key = generateEncryptionKey();
      const iv = generateIV();

      // Test cevaplarını şifrele
      const encryptedAnswers = await encryptData(testAnswers, key, iv);

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
        answers: testAnswers,
        encrypted_answers: encryptedAnswers,
        encryption_key: key,
        iv: iv,
        notes: testNotes || null,
        duration_seconds: testDuration,
        started_at: startTime?.toISOString(),
        completed_at: endTime?.toISOString()
      };
      
      // Test verilerini state'e kaydet
      setTestData(testResultData);
      
      // Token ile erişimde, test sonuçlarını kaydetmek yerine tamamlandı sayfasına yönlendir
      if (token) {
        console.log("Token ile erişimde test tamamlandı, veriler:", testResultData);
        setTestCompleted(true);
        setLoading(false);
        return;
      }
      
      // Ruh sağlığı uzmanı olarak erişimde, test sonuçlarını kaydet
      const { data, error } = await supabase
        .from('test_results')
        .insert(testResultData)
        .select();

      if (error) {
        console.error("Test kaydetme hatası:", error);
        throw error;
      }

      console.log("Test başarıyla kaydedildi:", data);
      
      // Test sonuçları sayfasına yönlendir
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
    if (currentQuestionIndex < selectedTest.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300); // 300ms gecikme ile geçiş yap
    }
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

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <p className="text-blue-700 dark:text-blue-300">
                  Test sonuçlarınız ruh sağlığı uzmanınız tarafından değerlendirilecek ve bir sonraki görüşmenizde sizinle paylaşılacaktır.
                </p>
              </div>
              <p className="text-sm">
                Bu pencereyi güvenle kapatabilirsiniz.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => window.close()}
                className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Pencereyi Kapat
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                Gizliliğiniz bizim için önemlidir. Test yanıtlarınız güvenli bir şekilde şifrelenerek saklanmaktadır ve sadece ruh sağlığı uzmanınız tarafından görüntülenebilir.
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
              {!showIntro && (
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
                  onClick={() => setShowIntro(false)}
                  className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Teste Başla
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Soru {currentQuestionIndex + 1} / {selectedTest.questions.length}
                </div>
                <div className="h-2 flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / selectedTest.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div key={selectedTest.questions[currentQuestionIndex].id} className="space-y-4">
                <p className="text-lg text-gray-900 dark:text-white">
                  {currentQuestionIndex + 1}. {selectedTest.questions[currentQuestionIndex].text}
                </p>
                <div className="space-y-3">
                  {selectedTest.questions[currentQuestionIndex].options.map((option) => {
                    const questionId = selectedTest.questions[currentQuestionIndex].id;
                    const optionId = `${questionId}_${option.value}`;
                    const isSelected = testAnswers[questionId] === option.value;

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

              {currentQuestionIndex === selectedTest.questions.length - 1 && professional && (
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
                
                {currentQuestionIndex === selectedTest.questions.length - 1 && (
                  <button
                    onClick={handleSubmitTest}
                    disabled={Object.keys(testAnswers).length !== selectedTest.questions.length}
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