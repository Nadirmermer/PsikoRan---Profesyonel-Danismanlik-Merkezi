import React, { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Search as SearchIcon } from 'lucide-react';

interface TestResult {
  id: string;
  test_id: string;
  test_name: string;
  created_at: string;
  score?: number;
  result?: string;
  professional_name?: string;
}

interface TestResultsTabProps {
  testResults: TestResult[];
}

export const TestResultsTab: React.FC<TestResultsTabProps> = ({ testResults }) => {
  const [searchResult, setSearchResult] = useState('');

  // Test sonuçlarını filtrele
  const filteredResults = testResults.filter(result => 
    result.test_name.toLowerCase().includes(searchResult.toLowerCase()) ||
    (result.professional_name && result.professional_name.toLowerCase().includes(searchResult.toLowerCase()))
  );

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
                  Tarih
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sonuç
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Uzman
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                    {result.test_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(result.created_at), 'PPP', { locale: tr })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {result.score !== undefined ? `${result.score} puan` : result.result || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {result.professional_name || '-'}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-xs sm:text-sm font-medium">
                    <button
                      onClick={() => {
                        window.open(`/test-results/${result.id}`, '_blank');
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Görüntüle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestResultsTab; 