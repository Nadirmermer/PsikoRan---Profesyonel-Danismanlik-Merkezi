import { useNavigate } from 'react-router-dom';

export function TestCompleted() {
  const navigate = useNavigate();

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
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 my-6">
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