import React, { useState, useEffect, Fragment } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  Search as SearchIcon, 
  FileText as FileTextIcon, 
  Trash2 as TrashIcon, 
  ChevronDown as ChevronDownIcon, 
  ChevronUp as ChevronUpIcon, 
  AlertTriangle as AlertTriangleIcon,
  Download,
  FileCheck,
  Clock,
  RefreshCw,
  Calendar,
  CheckCircle,
  Info,
  XCircle,
  Link,
  BarChart 
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { AVAILABLE_TESTS } from '../../data/tests';
import { generateTestPDF } from '../../utils/generateTestPDF';
import { Test } from '../../data/tests/types';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';

interface TestResult {
  id: string;
  test_id: string;
  test_type: string;
  test_name: string;
  created_at: string;
  score?: number;
  result?: string;
  professional_name?: string;
  answers?: Record<string, any>;
  client_id: string;
  professional_id: string;
  duration_seconds?: number;
  is_public_access?: boolean;
}

interface Client {
  id: string;
  full_name: string;
  professional?: {
    full_name: string;
    title?: string;
    clinic_name?: string;
  };
}

// Supabase'den gelen client verisi için tip tanımı
interface SupabaseClientData {
  id: string;
  full_name: string;
  professional: {
    id: string;
    full_name: string;
    title?: string;
    assistant?: Array<{
      id: string;
      clinic_name?: string;
    }>;
  };
}

interface TestResultsTabProps {
  clientId: string;
  testResults: TestResult[];
  loadTestResults: () => Promise<boolean>;
}

const TestResultsTab: React.FC<TestResultsTabProps> = ({ 
  clientId,
  testResults, 
  loadTestResults
}) => {
  const { professional } = useAuth();
  const [searchResult, setSearchResult] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedTestName, setSelectedTestName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [formattedResults, setFormattedResults] = useState<TestResult[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<string, Client>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentPdfId, setCurrentPdfId] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Test sonuçlarını formatla ve test adlarını düzelt
  useEffect(() => {
    const formatted = testResults.map(result => {
      // Test ID'sine göre AVAILABLE_TESTS'ten gerçek test adını bul
      const testInfo = AVAILABLE_TESTS.find(test => test.id === result.test_type);
      return {
        ...result,
        test_name: testInfo?.name || result.test_name // Eğer bulunursa gerçek adı kullan, bulunamazsa mevcut adı kullan
      };
    });
    setFormattedResults(formatted);

    // Danışan bilgilerini topla
    const clientIds = [...new Set(testResults.map(result => result.client_id))];
    if (clientIds.length > 0) {
      loadClients(clientIds);
    }
  }, [testResults]);

  // Danışan bilgilerini yükle
  const loadClients = async (clientIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          full_name,
          professional:professionals!inner(
            id,
            full_name,
            title,
            assistant:assistants(
              id,
              clinic_name
            )
          )
        `)
        .in('id', clientIds);

      if (error) throw error;

      // Danışan bilgilerini map'e dönüştür
      const clientsObject: Record<string, Client> = {};
      
      if (data) {
        data.forEach((client: any) => {
          // Tip dönüşümü yaparak client nesnesini oluştur
          const formattedClient: Client = {
            id: client.id,
            full_name: client.full_name,
            professional: {
              full_name: client.professional?.full_name || '',
              title: client.professional?.title,
              clinic_name: client.professional?.assistant?.[0]?.clinic_name
            }
          };
          
          clientsObject[client.id] = formattedClient;
        });
      }

      setClientsMap(clientsObject);
    } catch (error) {
      console.error('Danışan bilgileri yüklenirken hata:', error);
    }
  };

  // Test sonuçlarını filtrele
  const filteredResults = formattedResults.filter(result => 
    result.test_name.toLowerCase().includes(searchResult.toLowerCase()) ||
    (result.professional_name && result.professional_name.toLowerCase().includes(searchResult.toLowerCase()))
  );

  // Test sonucunu indir
  const handleDownloadResult = async (result: TestResult, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    
    try {
      setIsLoading(true);
      setCurrentPdfId(result.id);
      
      // Test modülünü dinamik olarak yükle
      let testModule;
      let testInfo = AVAILABLE_TESTS.find(test => test.id === result.test_type);

      try {
        // TEST_MAP'i doğrudan import et ve kullan
        const testMapModule = await import('../../data/tests') as any;
        
        if (testMapModule && testMapModule.TEST_MAP && result.test_type) {
          try {
            // Maplenen test modülünü almaya çalış
            const testPromise = testMapModule.TEST_MAP[result.test_type];
            if (testPromise) {
              testModule = await testPromise;
            }
          } catch (error) {
            // Promise çözümleme hatası
          }
        }
        
        // Eğer TEST_MAP'ten alamadıysak, TEST_META'dan al
        if (!testModule && testMapModule.TEST_META && result.test_type) {
          const meta = testMapModule.TEST_META[result.test_type];
          if (meta) {
            testInfo = meta;
          }
        }
        
        // Eğer hala alamadıysak, birinci fallback: Dosyayı direkt import et
        if (!testModule) {
          try {
            const directImport = await import(/* @vite-ignore */ `../../data/tests/${result.test_type}.js`);
            
            // Test modülünü bul
            for (const key in directImport) {
              if (typeof directImport[key] === 'object' && directImport[key]?.questions) {
                testModule = directImport[key];
                break;
              }
            }
          } catch (directError) {
            // Direkt import hatası, devam et
          }
        }
      } catch (importError) {
        // Import hatası, devam et
      }
      
      // Fallback: AVAILABLE_TESTS'ten al
      if (!testModule && testInfo) {
        testModule = testInfo;
      }
      
      if (!testModule) {
        throw new Error('Test bilgisi bulunamadı');
      }
      
      // Danışan bilgisini al
      const client = clientsMap[result.client_id];
      if (!client) {
        throw new Error('Danışan bilgisi bulunamadı');
      }
      
      // Uzman bilgisi
      const professionalInfo = {
        id: professional?.id || result.professional_id,
        full_name: professional?.full_name || result.professional_name || 'Bilinmeyen Uzman',
        title: professional?.title || ''
      };
      
      // Test nesnesini düzgün şekilde oluştur
      const testData = {
        ...testModule,
        // Eğer test modülünde questions yoksa boş dizi olarak ayarla
        questions: testModule.questions || [],
        // Eğer fonksiyonlar yoksa varsayılan olarak ekle
        calculateScore: testModule.calculateScore || (() => result.score || 0),
        interpretScore: testModule.interpretScore || (() => ''),
      };
      
      // Test yorumlaması için güvenlik kontrolü
      try {
        if (typeof testData.interpretScore !== 'function') {
          console.warn('interpretScore bir fonksiyon değil, varsayılan fonksiyon ekleniyor');
          testData.interpretScore = () => '';
        }
        
        // Test yorumlamasını kontrol et
        const interpretation = testData.interpretScore(result.score || 0);
        console.log('Test yorumlaması:', interpretation);
      } catch (interpretError) {
        console.error('Skor yorumlama hatası:', interpretError);
        // Hata durumunda güvenli bir fonksiyon ata
        testData.interpretScore = () => '';
      }
      
      // generateTestPDF fonksiyonunu kullanarak PDF oluştur
      const pdf = generateTestPDF(
        testData,
        {
          id: result.id,
          test_type: result.test_type,
          score: result.score || 0,
          answers: result.answers || {},
          created_at: result.created_at,
          duration_seconds: result.duration_seconds,
          is_public_access: result.is_public_access
        },
        client,
        professionalInfo
      );
      
      // PDF'i indir
      pdf.save(`${result.test_name}_${format(new Date(result.created_at), 'yyyy-MM-dd')}.pdf`);
      
      // Başarı mesajı göster
      setSuccessMessage('PDF başarıyla indirildi!');
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('Test sonucu indirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
      setCurrentPdfId(null);
    }
  };

  // Test sonucunu silme onay modalı
  const handleDeleteClick = (id: string, name: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Tıklamanın satıra yayılmasını engelle
    setSelectedTestId(id);
    setSelectedTestName(name);
    setIsDeleteModalOpen(true);
  };

  // Test sonucunu sil
  const handleDeleteConfirm = async () => {
    if (!selectedTestId) return;
    
    try {
      setIsDeleting(true);
      
      // Supabase ile silme işlemi
      const { error } = await supabase
        .from('test_results')
        .delete()
        .eq('id', selectedTestId);
      
      if (error) throw error;
      
      // Başarılı mesajı
      setSuccessMessage('Test sonucu başarıyla silindi!');
      setIsSuccessModalOpen(true);
      setIsDeleteModalOpen(false);
      
      // Listeyi yenile
      await loadTestResults();
    } catch (error) {
      console.error('Test sonucu silme hatası:', error);
      alert('Test sonucu silinemedi. Lütfen tekrar deneyin.');
    } finally {
      // Modalı kapat
      setSelectedTestId(null);
      setIsDeleting(false);
    }
  };

  // Satırı genişlet/daralt
  const toggleRowExpansion = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Arkaplan Gradient */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_60%,rgba(120,119,198,0.1),transparent)]"></div>
      </div>

      {/* Başlık ve Arama Kısmı */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row justify-between md:items-center gap-4"
      >
        <h2 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          Test Sonuçları
        </h2>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Test sonucu ara..."
            value={searchResult}
            onChange={(e) => setSearchResult(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm dark:bg-gray-800 pr-10 h-9"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          {searchResult && (
            <div className="absolute inset-y-0 right-10 flex items-center">
              <button 
                onClick={() => setSearchResult('')}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {filteredResults.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-10"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4"
          >
            <BarChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchResult 
              ? "Arama kriterlerine uygun sonuç bulunamadı" 
              : "Henüz hiç test sonucu bulunmuyor"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
            {searchResult 
              ? "Farklı bir arama terimi deneyin veya arama kriterlerini temizleyin" 
              : "Tamamlanan testler burada görüntülenecektir. Bir test gönderip danışanınızın tamamlamasını bekleyin."}
          </p>
          {searchResult && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchResult('')}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 rounded-lg inline-flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Filtreleri Temizle
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-md"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Test Adı
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Tarih / Saat
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-1" />
                      Sonuç
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:divide-gray-700 dark:bg-gray-800/30">
                {filteredResults.map((result, index) => (
                  <Fragment key={result.id}>
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer ${expandedRowId === result.id ? 'bg-blue-50/70 dark:bg-blue-900/20' : ''}`}
                      onClick={() => toggleRowExpansion(result.id)}
                    >
                      <td className="py-3 pl-4 pr-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                            {expandedRowId === result.id ? (
                              <ChevronUpIcon className="h-5 w-5" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {result.test_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                              <Info className="h-3 w-3 mr-1" />
                              {result.test_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {format(new Date(result.created_at), 'd MMMM yyyy', { locale: tr })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(result.created_at), 'HH:mm', { locale: tr })}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {result.score !== undefined ? `${result.score} puan` : result.result || '-'}
                        </div>
                      </td>
                    </motion.tr>
                    
                    {/* Genişletilmiş satır içeriği */}
                    {expandedRowId === result.id && (
                      <motion.tr 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-blue-50/30 dark:bg-blue-900/10"
                      >
                        <td colSpan={3} className="px-4 py-4">
                          <div className="rounded-lg border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-gray-800 p-5 shadow-sm">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                  <FileCheck className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                                  Test Detayları
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Test Adı</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{result.test_name}</p>
                                  </div>
                                  <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Sonuç</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {result.score !== undefined ? `${result.score} puan` : result.result || '-'}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Süre</p>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {result.duration_seconds 
                                          ? `${Math.floor(result.duration_seconds / 60)}:${(result.duration_seconds % 60).toString().padStart(2, '0')}`
                                          : '-'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Tamamlama Yöntemi</p>
                                    <div className="flex items-center">
                                      {result.is_public_access 
                                        ? <Link className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
                                        : <CheckCircle className="h-4 w-4 mr-1 text-green-500 dark:text-green-400" />
                                      }
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {result.is_public_access 
                                          ? 'Çevrimiçi link ile tamamlandı' 
                                          : 'Seans sırasında tamamlandı'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* İşlemler */}
                              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => handleDownloadResult(result, e)}
                                  className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-sm transition-all"
                                  disabled={isLoading && currentPdfId === result.id}
                                >
                                  {isLoading && currentPdfId === result.id ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      PDF İndiriliyor...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-4 w-4 mr-2" />
                                      PDF Raporu İndir
                                    </>
                                  )}
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => handleDeleteClick(result.id, result.test_name, e)}
                                  className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                >
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Sonucu Sil
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Silme Onay Modalı */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsDeleteModalOpen(false)}
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
                  <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                    Test Sonucunu Sil
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    "{selectedTestName}" test sonucunu silmek istediğinizden emin misiniz?
                  </p>
                </div>
                
                {/* Uyarı içeriği */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/60">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20 
                      }}
                      className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400 flex items-center justify-center rounded-full text-white shadow-md"
                    >
                      <AlertTriangleIcon className="w-6 h-6" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bu işlem geri alınamaz!
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Test sonucunu sildiğinizde, tüm veriler kalıcı olarak silinecektir.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    disabled={isDeleting}
                  >
                    İptal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg transition-colors shadow-sm flex items-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Siliniyor...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Sil
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Başarı Modalı */}
      <Transition appear show={isSuccessModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsSuccessModalOpen(false)}
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
                    <CheckCircle className="h-6 w-6" />
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
                    onClick={() => setIsSuccessModalOpen(false)}
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
    </div>
  );
};

export default TestResultsTab; 