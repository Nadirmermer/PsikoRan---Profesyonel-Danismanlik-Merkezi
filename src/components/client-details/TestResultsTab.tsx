import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Search as SearchIcon, FileText as FileTextIcon, Trash2 as TrashIcon, ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon, AlertTriangle as AlertTriangleIcon } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import { AVAILABLE_TESTS } from '../../data/tests';
import { generateTestPDF } from '../../utils/generateTestPDF';
import { useAuth } from '../../lib/auth';
import { Test } from '../../data/tests/types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
  testResults: TestResult[];
  supabase: SupabaseClient;
  loadTestResults: () => Promise<void>;
}

const TestResultsTab: React.FC<TestResultsTabProps> = ({ 
  testResults, 
  supabase,
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
      
      // Test bilgisini bul
      const testInfo = AVAILABLE_TESTS.find(test => test.id === result.test_type);
      if (!testInfo) {
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
      
      // generateTestPDF fonksiyonunu kullanarak PDF oluştur
      const testData = {
        ...testInfo,
        questions: [],
        calculateScore: () => result.score || 0,
        interpretScore: () => ''
      } as unknown as Test;
      
      const pdf = generateTestPDF(
        testData,
        {
          id: result.id,
          test_type: result.test_type,
          score: result.score || 0,
          answers: result.answers || {},
          created_at: result.created_at,
          duration_seconds: result.duration_seconds
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Test Sonuçları</h2>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Test sonucu ara..."
            value={searchResult}
            onChange={(e) => setSearchResult(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 h-9 sm:h-10 px-3 sm:px-4"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">Henüz test sonucu bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Test Adı
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Tarih / Saat
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sonuç
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredResults.map((result) => (
                <React.Fragment key={result.id}>
                  <tr 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${expandedRowId === result.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                    onClick={() => toggleRowExpansion(result.id)}
                  >
                    <td className="py-4 pl-4 pr-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs flex items-center">
                      {expandedRowId === result.id ? (
                        <ChevronUpIcon className="h-4 w-4 mr-2 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 mr-2 text-gray-500" />
                      )}
                      {result.test_name}
                    </td>
                    <td className="px-3 py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(result.created_at), 'PPP HH:mm', { locale: tr })}
                    </td>
                    <td className="px-3 py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {result.score !== undefined ? `${result.score} puan` : result.result || '-'}
                    </td>
                  </tr>
                  
                  {/* Genişletilmiş satır içeriği */}
                  {expandedRowId === result.id && (
                    <tr className="bg-gray-50 dark:bg-gray-800/30">
                      <td colSpan={3} className="px-4 py-4">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Test Özeti</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Test Adı</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{result.test_name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Sonuç</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {result.score !== undefined ? `${result.score} puan` : result.result || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Süre</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {result.duration_seconds 
                                      ? `${Math.floor(result.duration_seconds / 60)}:${(result.duration_seconds % 60).toString().padStart(2, '0')}`
                                      : '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* İşlemler */}
                            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                              <button
                                onClick={(e) => handleDownloadResult(result, e)}
                                className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-3 py-2 text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                                disabled={isLoading && currentPdfId === result.id}
                              >
                                {isLoading && currentPdfId === result.id ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 mr-2 text-green-700 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    PDF İndiriliyor...
                                  </>
                                ) : (
                                  <>
                                    <FileTextIcon className="h-4 w-4 mr-2" />
                                    PDF İndir
                                  </>
                                )}
                              </button>
                              
                              <button
                                onClick={(e) => handleDeleteClick(result.id, result.test_name, e)}
                                className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/30 px-3 py-2 text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Sil
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Silme Onay Modalı - Standart Modal Tasarımı */}
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
              <div className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                {/* Header */}
                <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                    Test Sonucunu Sil
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    "{selectedTestName}" test sonucunu silmek istediğinizden emin misiniz?
                  </p>
                </div>
                
                {/* Uyarı içeriği */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 flex items-center justify-center rounded-full">
                      <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
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
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    disabled={isDeleting}
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg transition-colors flex items-center"
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
                      'Sil'
                    )}
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Başarı Modalı - Standart Modal Tasarımı */}
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
              <div className="inline-block w-full max-w-sm p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
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
                    onClick={() => setIsSuccessModalOpen(false)}
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
    </div>
  );
};

export default TestResultsTab; 