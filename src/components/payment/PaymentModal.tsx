import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  planName: string;
  planPrice: string;
  isAnnual: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  planName,
  planPrice,
  isAnnual
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted.substring(0, 19)); // 16 digits + 3 spaces
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;
    
    if (value.length > 2) {
      formatted = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    setExpiry(formatted.substring(0, 5)); // MM/YY format (5 chars)
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Burada gerçek ödeme entegrasyonu yapılacak
      // Örneğin: await processPayment({...})
      await new Promise(resolve => setTimeout(resolve, 1500)); // Ödeme işlemini simüle etmek için
      
      onPaymentComplete();
      onClose();
    } catch (err) {
      setError('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="relative">
          <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ödeme Yap</h2>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CreditCard className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {planName} Planı - {isAnnual ? 'Yıllık' : 'Aylık'} Abonelik
                </p>
                <p className="text-2xl font-bold text-primary-800 dark:text-primary-200 mt-1">
                  ₺{planPrice} <span className="text-sm font-normal text-primary-600 dark:text-primary-400">{isAnnual ? '/yıl' : '/ay'}</span>
                </p>
                {isAnnual && (
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    Yıllık ödeme ile %20 tasarruf
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                  className={`flex-1 py-3 text-center font-medium text-sm transition-colors duration-200
                    ${activeTab === 'card' 
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400'
                    }`}
                  onClick={() => setActiveTab('card')}
                >
                  Kredi Kartı ile Öde
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium text-sm transition-colors duration-200
                    ${activeTab === 'bank' 
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400'
                    }`}
                  onClick={() => setActiveTab('bank')}
                >
                  Havale/EFT ile Öde
                </button>
              </div>
            </div>

            {activeTab === 'card' ? (
              <form onSubmit={handlePayment}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Kart Numarası
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Kart Üzerindeki İsim
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Son Kullanma Tarihi
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="AA/YY"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        placeholder="000"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                        required
                        maxLength={3}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 
                      ${loading 
                        ? 'bg-primary-400 cursor-not-allowed' 
                        : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30'
                      }`}
                  >
                    {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Havale/EFT Bilgileri</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Aşağıdaki hesap bilgilerine ödemenizi gerçekleştirdikten sonra, dekontunuzu info@psikoran.com adresine gönderebilirsiniz.
                  </p>
                  
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-medium">Banka:</span> Türkiye İş Bankası
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-medium">Şube:</span> 1234 - Merkez Şube
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-medium">Hesap Sahibi:</span> PsikoRan Teknoloji A.Ş.
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-medium">IBAN:</span> TR12 3456 7890 1234 5678 9012 34
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-medium">Açıklama:</span> {planName} Planı - {isAnnual ? 'Yıllık' : 'Aylık'}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ödemeniz onaylandıktan sonra hesabınız aktif edilecektir. Bu işlem mesai saatleri içinde en geç 1 saat, mesai saatleri dışında ise bir sonraki iş günü içinde gerçekleştirilecektir.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal; 