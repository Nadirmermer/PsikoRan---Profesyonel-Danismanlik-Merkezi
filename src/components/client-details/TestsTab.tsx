import React, { useState, useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { AVAILABLE_TESTS } from '../../data/tests';

// Test kategorileri
const TEST_CATEGORIES = [
  { id: 'depression', name: 'Depresyon Testleri', tests: ['beck-depression', 'edinburgh'] },
  { id: 'anxiety', name: 'Anksiyete Testleri', tests: ['beck-anxiety', 'child-social-anxiety'] },
  { id: 'personality', name: 'Kişilik ve Tanı Testleri', tests: ['scid-5-cv', 'scid-5-pd', 'scid-5-spq'] },
  { id: 'other', name: 'Diğer Testler', tests: ['beck-hopelessness', 'beck-suicide', 'ytt40', 'scl90r'] }
];

interface TestsTabProps {
  clientId: string;
  handleShareTest: (testId: string) => Promise<void>;
}

export const TestsTab: React.FC<TestsTabProps> = ({ clientId, handleShareTest }) => {
  const [searchTest, setSearchTest] = useState('');

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
                          onClick={async () => {
                            await handleShareTest(test.id);
                          }}
                          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          Paylaş
                        </button>
                      )}
                      <button
                        onClick={() => {
                          window.open(`/test/${test.id}/${clientId}`, '_blank');
                        }}
                        className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors"
                      >
                        Testi Başlat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestsTab; 