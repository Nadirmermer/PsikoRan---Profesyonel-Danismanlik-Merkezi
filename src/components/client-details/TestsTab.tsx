import React, { useState, useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { AVAILABLE_TESTS } from '../../data/tests';
import { SupabaseClient } from '@supabase/supabase-js';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Test kategorileri
const TEST_CATEGORIES = [
  { id: 'depression', name: 'Depresyon Testleri', tests: ['beck-depression', 'edinburgh'] },
  { id: 'anxiety', name: 'Anksiyete Testleri', tests: ['beck-anxiety', 'yaygin-anksiyete'] },
  { id: 'personality', name: 'Kişilik ve Tanı Testleri', tests: ['scid-5-cv', 'scid-5-pd', 'scid-5-spq'] },
  { id: 'other', name: 'Diğer Testler', tests: ['beck-hopelessness', 'beck-suicide', 'ytt40', 'scl90r'] },
  { id: 'stress', name: 'Stres Testleri', tests: ['aso'] },
  { id: 'sexual', name: 'Cinsel İşlev Testleri', tests: ['acyo'] },
  { id: 'emotion', name: 'Duygu Düzenleme Testleri', tests: ['bdo', 'toronto-aleksitimi'] },
  { id: 'children', name: 'Çocuk ve Ergen Testleri', tests: ['conners-parent'] }
];

interface TestsTabProps {
  clientId: string;
  client: any;
}

export const TestsTab: React.FC<TestsTabProps> = ({ 
  clientId, 
  client
}) => {
  const { professional, assistant } = useAuth();
  const [searchTest, setSearchTest] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareOptions, setShareOptions] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [testInfo, setTestInfo] = useState<any>(null);

  // useNavigate hook'u isteğe bağlı olarak kullanılacak
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Router bağlamında değilsek, bir dummy fonksiyon kullan
    navigate = (path: string) => {
      console.log('Navigation used outside Router context to: ', path);
      // Eğer istenirse burada window.location.href = path; ile yönlendirme yapılabilir
    };
  }

  // Testleri filtrele
  const filteredTests = useMemo(() => {
    return AVAILABLE_TESTS.filter(test => 
      test.name.toLowerCase().includes(searchTest.toLowerCase())
    );
  }, [searchTest]);

  // Kategorize edilmiş testler
  const categorizedTests = useMemo(() => {
    return TEST_CATEGORIES.map(category => ({
      ...category,
      tests: category.tests
        .map(testId => AVAILABLE_TESTS.find(t => t.id === testId))
        .filter(test => test && test.name.toLowerCase().includes(searchTest.toLowerCase()))
    }));
  }, [searchTest]);

  // Test paylaşım fonksiyonu
  const handleShareTest = async (testId: string) => {
    try {
      console.log("Test paylaşımı başlatılıyor...", { testId, clientId, professionalId: professional?.id });
      
      // Önceki modallar açıksa kapat
      setIsShareModalOpen(false);
      setIsSuccessDialogOpen(false);
      setIsErrorDialogOpen(false);
      
      // Modal arka planını temizle ve overflow'u kontrol et
      document.body.classList.add('overflow-hidden');
      
      // Professional veya assistant null kontrolü
      if (!professional && !assistant) {
        throw new Error('Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.');
      }
      
      // Veritabanından çekmek yerine AVAILABLE_TESTS'ten test bilgilerini al
      const testInfo = AVAILABLE_TESTS.find(test => test.id === testId);
      if (testInfo) {
        setTestInfo(testInfo);
      } else {
        console.error("Test bilgileri bulunamadı:", testId);
      }
      
      // Ensure we have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error('Oturum bulunamadı');
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }
      
      console.log('Kullanıcı oturumu:', sessionData.session.user.id);

      // Danışan bilgilerini al
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (clientError) {
        console.error('Danışan bilgileri alınamadı:', clientError);
        throw new Error('Danışan bilgileri alınamadı.');
      }
      
      // Benzersiz token oluştur
      const randomToken = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15) +
                          Date.now().toString(36);
      
      console.log('Oluşturulan token:', randomToken);

      // Test token oluştur
      const insertData = {
        p_test_id: testId,
        p_client_id: clientId,
        p_professional_id: professional ? professional.id : assistant.professional_id,
        p_token: randomToken,
        p_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 gün
      };
      
      console.log('RPC fonksiyonu için parametreler:', insertData);

      // RPC fonksiyonunu çağır
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_test_token', insertData);
      
      console.log('RPC sonucu:', rpcData);
      
      if (rpcError) {
        console.error('RPC hatası:', rpcError);
        
        if (rpcError.message.includes('Bu işlemi gerçekleştirme yetkiniz yok')) {
          throw new Error('Yetki hatası: Bu işlemi gerçekleştirme izniniz yok.');
        } else if (rpcError.message.includes('Kullanıcı oturumu bulunamadı')) {
          throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else {
          throw new Error(`Token oluşturulurken bir hata oluştu: ${rpcError.message}`);
        }
      }

      if (rpcData !== true) {
        throw new Error('Token oluşturulurken beklenmeyen bir hata oluştu.');
      }

      console.log('Token başarıyla oluşturuldu');

      // Paylaşım seçeneklerini ayarla
      const token = randomToken;
      // Kısa ve temiz URL formatı
      const testUrl = `${window.location.origin}/public-test/${token}`;
      
      console.log('Test URL:', testUrl);
      
      // Danışan ve psikolog bilgilerini paylaşım için hazırla
      const clientName = client?.full_name || "Sayın Danışanımız";
      const professionalName = professional?.full_name || "Uzmanınız";
      const professionalTitle = professional?.title || "Ruh Sağlığı Uzmanı";
      
      // WhatsApp için detaylı mesaj metni
      const whatsAppMessage = 
`Merhaba ${clientName},

${professionalTitle} ${professionalName} tarafından size "${testInfo?.name}" testi gönderilmiştir.

Bu test, tedavi sürecinize katkı sağlamak amacıyla gönderilmiştir. Sonuçlar sadece uzmanınız tarafından değerlendirilecek ve sizinle paylaşılacaktır.

Testi tamamlamak için aşağıdaki linke tıklayabilirsiniz:
${testUrl}

Sorularınız için lütfen uzmanınızla iletişime geçiniz.
İyi günler dileriz.`;

      // E-posta için daha resmi mesaj metni
      const emailMessage = 
`Sayın ${clientName},

${professionalTitle} ${professionalName} tarafından size "${testInfo?.name}" testi gönderilmiştir.

Bu test, tedavi sürecinize katkı sağlamak amacıyla uzmanınız tarafından değerlendirilmek üzere gönderilmiştir. Test sonuçlarınız gizli tutulacak ve sadece tedavi sürecinizde kullanılacaktır.

Testi tamamlamak için lütfen aşağıdaki bağlantıya tıklayınız:
${testUrl}

Test sürecinde herhangi bir sorunuz olursa, doğrudan uzmanınızla iletişime geçebilirsiniz.

Saygılarımızla,
${professionalTitle} ${professionalName}`;

      // Paylaşım seçenekleri
      const shareOptions = [
        {
          name: "Bağlantıyı Kopyala",
          description: "Test linkini panoya kopyalayın",
          icon: "clipboard",
          action: () => {
            navigator.clipboard.writeText(testUrl);
            setIsShareModalOpen(false);
            setSuccessMessage('Bağlantı panoya kopyalandı!');
            setIsSuccessDialogOpen(true);
          },
        },
        {
          name: "WhatsApp ile Paylaş",
          description: "Danışana WhatsApp mesajı gönderin",
          icon: "whatsapp",
          action: () => {
            window.open(`https://wa.me/?text=${encodeURIComponent(whatsAppMessage)}`, '_blank');
            setIsShareModalOpen(false);
          },
        },
        {
          name: "E-posta ile Paylaş",
          description: "Testi e-posta olarak gönderin",
          icon: "mail",
          action: () => {
            window.open(`mailto:?subject=${encodeURIComponent(`${testInfo?.name} - Test Daveti`)}&body=${encodeURIComponent(emailMessage)}`, '_blank');
            setIsShareModalOpen(false);
          },
        },
      ];

      // Modalı aç
      setShareOptions(shareOptions);
      
      // Kısa bir gecikme ekleyerek modalın daha güvenli açılmasını sağla
      setTimeout(() => {
        console.log('Modal açılıyor...');
        setIsShareModalOpen(true);
      }, 50);
      
    } catch (error: any) {
      console.error('Error sharing test:', error);
      setErrorMessage(error.message || 'Test paylaşılırken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Testler</h2>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Test ara..."
            value={searchTest}
            onChange={(e) => setSearchTest(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 h-9 sm:h-10 px-3 sm:px-4"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {categorizedTests.map(category => (
          <div key={category.id} className="space-y-4">
            <h3 className="text-sm sm:text-md font-medium text-gray-700 dark:text-gray-300">{category.name}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.tests.map(test => test && (
                <div
                  key={test.id}
                  className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 sm:px-6 py-4 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                >
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{test.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{test.description}</div>
                    <div className="flex flex-wrap justify-end gap-2 mt-4">
                      {/* SCID-5-CV ve SCID-5-PD testleri için paylaşım butonu gösterme */}
                      {test.id !== 'scid-5-cv' && test.id !== 'scid-5-pd' && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Paylaş butonuna tıklandı");
                            // Modal açılmadan önce kısa bir gecikme ekle
                            setTimeout(async () => {
                              await handleShareTest(test.id);
                            }, 100);
                          }}
                          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          Paylaş
                        </button>
                      )}
                      {test.reference && professional && (
                        <button
                          onClick={() => window.open(test.reference, '_blank')}
                          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                          title="Sadece profesyoneller için kaynakça bilgisi"
                        >
                          Kaynakça
                        </button>
                      )}
                      {professional && (
                        <button
                          onClick={() => {
                            window.open(`/test/${test.id}/${clientId}`, '_blank');
                          }}
                          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors"
                        >
                          Testi Başlat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Paylaşım Seçenekleri Modalı - Standart Modal Tasarımı */}
      {isShareModalOpen && (
        <Transition appear show={isShareModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-[9999] overflow-y-auto"
            onClose={() => {
              setIsShareModalOpen(false);
              document.body.classList.remove('overflow-hidden');
            }}
          >
            <div className="min-h-screen px-4 text-center" style={{ position: 'relative' }}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-lg" style={{ position: 'fixed', zIndex: 9999 }} />
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
                <div className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50" style={{ position: 'relative', zIndex: 10000 }}>
                  {/* Header */}
                  <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Test Paylaşım Seçenekleri
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      "{testInfo?.name}" testini danışanınızla paylaşın.
                    </p>
                  </div>
                  
                  {/* Test ve danışan bilgileri */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-full">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Danışan: <span className="font-semibold text-blue-600 dark:text-blue-400">{client?.full_name || "Danışan"}</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Bu test linkini sadece danışanınız kullanabilir ve sonuçlar size gönderilecektir.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Paylaşım seçenekleri */}
                  <div className="p-6 space-y-4">
                    {shareOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={option.action}
                        className="w-full flex items-center p-4 rounded-xl bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600 group shadow-sm hover:shadow"
                      >
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 group-hover:scale-110 transition-transform">
                          {option.icon === 'clipboard' && (
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          )}
                          {option.icon === 'whatsapp' && (
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          )}
                          {option.icon === 'mail' && (
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{option.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={() => {
                        setIsShareModalOpen(false);
                        document.body.classList.remove('overflow-hidden');
                      }}
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}

      {/* Başarı Modalı - Standart Modal Tasarımı */}
      {isSuccessDialogOpen && (
        <Transition appear show={isSuccessDialogOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-[9999] overflow-y-auto"
            onClose={() => {
              setIsSuccessDialogOpen(false);
              document.body.classList.remove('overflow-hidden');
            }}
          >
            <div className="min-h-screen px-4 text-center" style={{ position: 'relative' }}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-lg" style={{ position: 'fixed', zIndex: 9999 }} />
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
                <div className="inline-block w-full max-w-sm p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50" style={{ position: 'relative', zIndex: 10000 }}>
                  {/* Başlık */}
                  <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                      Başarılı!
                    </Dialog.Title>
                  </div>
                  
                  {/* İçerik */}
                  <div className="p-6 flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 flex items-center justify-center rounded-full">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="flex-1 text-gray-700 dark:text-gray-300">
                      {successMessage}
                    </p>
                  </div>

                  {/* Alt kısım */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={() => {
                        setIsSuccessDialogOpen(false);
                        document.body.classList.remove('overflow-hidden');
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition-colors"
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
            className="fixed inset-0 z-[9999] overflow-y-auto"
            onClose={() => {
              setIsErrorDialogOpen(false);
              document.body.classList.remove('overflow-hidden');
            }}
          >
            <div className="min-h-screen px-4 text-center" style={{ position: 'relative' }}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-lg" style={{ position: 'fixed', zIndex: 9999 }} />
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
                <div className="inline-block w-full max-w-sm p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50" style={{ position: 'relative', zIndex: 10000 }}>
                  {/* Başlık */}
                  <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-400 dark:to-rose-500 bg-clip-text text-transparent">
                      Hata
                    </Dialog.Title>
                  </div>
                  
                  {/* İçerik */}
                  <div className="p-6 flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 flex items-center justify-center rounded-full">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="flex-1 text-gray-700 dark:text-gray-300">
                      {errorMessage}
                    </p>
                  </div>

                  {/* Alt kısım */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={() => {
                        setIsErrorDialogOpen(false);
                        document.body.classList.remove('overflow-hidden');
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg transition-colors"
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
}; 