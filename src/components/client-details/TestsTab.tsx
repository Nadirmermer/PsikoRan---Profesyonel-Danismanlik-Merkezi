import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  Tag, 
  Filter, 
  ChevronDown, 
  Check, 
  Clipboard, 
  Mail, 
  ArrowRight, 
  RefreshCw,
  BookOpen,
  Share2
} from 'lucide-react';
import { AVAILABLE_TESTS } from '../../data/tests';
import { SupabaseClient } from '@supabase/supabase-js';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // useNavigate hook'u isteğe bağlı olarak kullanılacak
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Router bağlamında değilsek, bir dummy fonksiyon kullan
    navigate = (path: string) => {
      console.log('Navigation used outside Router context to: ', path);
    };
  }

  // Testleri filtrele
  const filteredTests = useMemo(() => {
    let filtered = AVAILABLE_TESTS;
    
    // Arama terimi filtrelemesi
    if (searchTest) {
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(searchTest.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTest.toLowerCase())
      );
    }
    
    // Kategori filtrelemesi
    if (selectedCategory) {
      const categoryObj = TEST_CATEGORIES.find(cat => cat.id === selectedCategory);
      if (categoryObj) {
        filtered = filtered.filter(test => categoryObj.tests.includes(test.id));
      }
    }
    
    return filtered;
  }, [searchTest, selectedCategory]);

  // Kategorize edilmiş testler - bu fonksiyon sadece seçili kategoriye veya arama terimine göre filtrelenmiş testleri döndürür
  const categorizedTests = useMemo(() => {
    if (selectedCategory) {
      // Sadece seçili kategoriyi döndür
      const category = TEST_CATEGORIES.find(cat => cat.id === selectedCategory);
      if (category) {
        return [{
          ...category,
          tests: category.tests
            .map(testId => AVAILABLE_TESTS.find(t => t.id === testId))
            .filter(test => test && 
              (searchTest ? test.name.toLowerCase().includes(searchTest.toLowerCase()) : true)
            )
        }];
      }
    }
    
    // Tüm kategorileri döndür, arama terimine göre filtreleyerek
    return TEST_CATEGORIES.map(category => ({
      ...category,
      tests: category.tests
        .map(testId => AVAILABLE_TESTS.find(t => t.id === testId))
        .filter(test => test && 
          (searchTest ? test.name.toLowerCase().includes(searchTest.toLowerCase()) : true)
        )
    })).filter(category => category.tests.length > 0);
  }, [searchTest, selectedCategory]);

  // Kategori seçme fonksiyonu
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
  };
  
  // Dışarıya tıklayınca dropdown'ı kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      
      // Danışan ve Psikoterapist bilgilerini paylaşım için hazırla
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

      // Paylaşım seçenekleri - Motion animasyonları için gecikme ekle
      const shareOptions = [
        {
          name: "Bağlantıyı Kopyala",
          description: "Test linkini panoya kopyalayın",
          icon: "clipboard",
          action: () => {
            navigator.clipboard.writeText(testUrl);
            setIsShareModalOpen(false);
            setSuccessMessage('Bağlantı panoya kopyalandı!');
            setTimeout(() => setIsSuccessDialogOpen(true), 300);
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
      }, 300);
      
    } catch (error: any) {
      console.error('Error sharing test:', error);
      setErrorMessage(error.message || 'Test paylaşılırken bir hata oluştu.');
      setTimeout(() => setIsErrorDialogOpen(true), 300);
    }
  }

  return (
    <div className="space-y-6">
      {/* Arkaplan Gradient ve Animasyon Efektleri */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_60%,rgba(120,119,198,0.1),transparent)]"></div>
      </div>

      {/* Başlık ve Arama Kısmı */}
      <div className="relative">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between md:items-center gap-4"
        >
          <h2 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            Psikolojik Testler
          </h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Kategori Filtresi */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              >
                <Filter className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                {selectedCategory ? TEST_CATEGORIES.find(cat => cat.id === selectedCategory)?.name : 'Tüm Kategoriler'}
                <ChevronDown className="h-4 w-4 ml-2 text-gray-500 dark:text-gray-400" />
              </button>

              {showCategoryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="mr-2">Tüm Kategoriler</span>
                      {!selectedCategory && <Check className="h-4 w-4 text-blue-500" />}
                    </button>
                    {TEST_CATEGORIES.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <span>{category.name}</span>
                        {selectedCategory === category.id && <Check className="h-4 w-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Arama Kutusu */}
            <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Test ara..."
            value={searchTest}
            onChange={(e) => setSearchTest(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm dark:bg-gray-800 pr-10 h-9"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
            </div>

            {/* Filtreleri Sıfırla */}
            {(selectedCategory || searchTest) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTest('');
                }}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Filtreleri Sıfırla
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Test Kategorileri ve Kartları */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-8"
      >
        {categorizedTests.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4"
            >
              <SearchIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sonuç bulunamadı</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Arama kriterlerinize uygun test bulunamadı. Lütfen farklı bir arama terimi deneyin veya filtreleri sıfırlayın.
            </p>
          </div>
        ) : (
          categorizedTests.map((category, categoryIndex) => (
            category.tests.length > 0 && (
              <motion.div 
                key={category.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                className="space-y-4"
              >
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                  {category.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tests.map((test, index) => test && (
                    <motion.div
                  key={test.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all group"
                    >
                      {/* Test kartının üst renkli kısmı */}
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                      
                      <div className="p-5">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {test.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                          {test.description}
                        </p>
                        
                    <div className="flex flex-wrap justify-end gap-2 mt-4">
                      {/* SCID-5-CV ve SCID-5-PD testleri için paylaşım butonu gösterme */}
                      {test.id !== 'scid-5-cv' && test.id !== 'scid-5-pd' && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                              await handleShareTest(test.id);
                          }}
                              className="px-2.5 py-1.5 text-xs inline-flex items-center text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                              <Share2 className="h-3.5 w-3.5 mr-1" />
                          Paylaş
                        </button>
                      )}
                      {test.reference && professional && (
                        <button
                          onClick={() => window.open(test.reference, '_blank')}
                              className="px-2.5 py-1.5 text-xs inline-flex items-center text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                          title="Sadece profesyoneller için kaynakça bilgisi"
                        >
                              <BookOpen className="h-3.5 w-3.5 mr-1" />
                          Kaynakça
                        </button>
                      )}
                      {professional && (
                        <button
                          onClick={() => {
                            window.open(`/test/${test.id}/${clientId}`, '_blank');
                          }}
                              className="px-2.5 py-1.5 text-xs inline-flex items-center text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors"
                        >
                              <ArrowRight className="h-3.5 w-3.5 mr-1" />
                          Testi Başlat
                        </button>
                      )}
                    </div>
                  </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          ))
        )}
      </motion.div>

      {/* Paylaşım Seçenekleri Modalı */}
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
                <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm" />
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
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
                >
                  {/* Header */}
                  <div className="p-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Test Paylaşım Seçenekleri
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      "{testInfo?.name}" testini danışanınızla paylaşın.
                    </p>
                  </div>
                  
                  {/* Test ve danışan bilgileri */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/60">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center rounded-full text-white shadow-md">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Danışan: <span className="font-semibold text-blue-600 dark:text-blue-400">{client?.full_name || "Danışan"}</span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Bu test linkini sadece danışanınız kullanabilir ve sonuçlar size gönderilecektir.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Paylaşım seçenekleri */}
                  <div className="p-6 space-y-3">
                    {shareOptions.map((option, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={option.action}
                        className="w-full flex items-center p-4 rounded-xl bg-white dark:bg-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 group shadow-sm hover:shadow"
                      >
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 group-hover:scale-110 transition-transform shadow-md">
                          {option.icon === 'clipboard' && (
                            <Clipboard className="h-5 w-5" />
                          )}
                          {option.icon === 'whatsapp' && (
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          )}
                          {option.icon === 'mail' && (
                            <Mail className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{option.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsShareModalOpen(false);
                        document.body.classList.remove('overflow-hidden');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Kapat
                    </motion.button>
                  </div>
                </motion.div>
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
            className="fixed inset-0 z-[9999] overflow-y-auto"
            onClose={() => {
              setIsSuccessDialogOpen(false);
              document.body.classList.remove('overflow-hidden');
            }}
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
                <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm" />
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
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block w-full max-w-sm p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
                >
                  {/* Başlık */}
                  <div className="p-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                      Başarılı!
                    </Dialog.Title>
                  </div>
                  
                  {/* İçerik */}
                  <div className="p-6 flex items-center space-x-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1
                      }}
                      className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 flex items-center justify-center rounded-full text-white shadow-md"
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <p className="flex-1 text-gray-700 dark:text-gray-300 font-medium">
                      {successMessage}
                    </p>
                  </div>

                  {/* Alt kısım */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsSuccessDialogOpen(false);
                        document.body.classList.remove('overflow-hidden');
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition-colors shadow-sm"
                    >
                      Tamam
                    </motion.button>
                  </div>
                </motion.div>
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
                <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm" />
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
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block w-full max-w-sm p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
                >
                  {/* Başlık */}
                  <div className="p-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-400 dark:to-rose-500 bg-clip-text text-transparent">
                      Hata
                    </Dialog.Title>
                  </div>
                  
                  {/* İçerik */}
                  <div className="p-6 flex items-start space-x-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1
                      }}
                      className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400 flex items-center justify-center rounded-full text-white shadow-md"
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </motion.div>
                    <p className="flex-1 text-gray-700 dark:text-gray-300 font-medium">
                      {errorMessage}
                    </p>
                  </div>

                  {/* Alt kısım */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsErrorDialogOpen(false);
                        document.body.classList.remove('overflow-hidden');
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg transition-colors shadow-sm"
                    >
                      Tamam
                    </motion.button>
                  </div>
                </motion.div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
}; 