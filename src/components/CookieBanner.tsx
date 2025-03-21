import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, ChevronDown, ChevronUp, Check, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

type CookieType = 'essential' | 'preferences' | 'analytics';

type CookieConsent = {
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
  consentGiven: boolean;
  lastUpdated: number;
};

const defaultConsent: CookieConsent = {
  essential: true, // Zorunlu çerezler her zaman açık
  preferences: true,
  analytics: true,
  consentGiven: false,
  lastUpdated: 0,
};

const CONSENT_STORAGE_KEY = 'cookie_consent_settings';
const CONSENT_EXPIRY_DAYS = 180; // 6 ay

export function CookieBanner() {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    
    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent) as CookieConsent;
        
        // Onay süresinin geçip geçmediğini kontrol edelim
        const currentTime = new Date().getTime();
        const consentAge = currentTime - parsedConsent.lastUpdated;
        const consentAgeInDays = consentAge / (1000 * 60 * 60 * 24);
        
        if (parsedConsent.consentGiven && consentAgeInDays < CONSENT_EXPIRY_DAYS) {
          setConsent(parsedConsent);
          setIsVisible(false);
          return;
        }
      } catch (error) {
        console.error('Cookie consent parsing error:', error);
      }
    }
    
    // Eğer burada isek, ya geçerli bir onay yok ya da süresi dolmuştur
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500); // 1.5 saniye sonra banner'ı göster
    
    return () => clearTimeout(timer);
  }, []);

  const saveConsent = (updatedConsent: CookieConsent) => {
    const consentWithTimestamp = {
      ...updatedConsent,
      lastUpdated: new Date().getTime()
    };
    
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentWithTimestamp));
    setConsent(consentWithTimestamp);
    
    // Gerçek çerez uygulaması burada yapılabilir
    applyConsent(consentWithTimestamp);
  };

  const applyConsent = (currentConsent: CookieConsent) => {
    // Burada çerez tercihlerini gerçekten uygulayacak kodlar yazılabilir
    // Örneğin, analytics izni verilmemişse Google Analytics'i devre dışı bırakma
    
    if (!currentConsent.analytics) {
      // Analytics çerezlerini devre dışı bırak
      window['ga-disable-UA-XXXXXXXX-X'] = true;
    }
    
    // Tercihlere göre diğer çerez gruplarını yönetme
    console.log('Cookie preferences applied:', currentConsent);
  };

  const handleAcceptAll = () => {
    const updatedConsent = {
      ...consent,
      preferences: true,
      analytics: true,
      consentGiven: true,
    };
    
    saveConsent(updatedConsent);
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    const updatedConsent = {
      ...consent,
      consentGiven: true,
    };
    
    saveConsent(updatedConsent);
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleRejectNonEssential = () => {
    const updatedConsent = {
      ...consent,
      preferences: false,
      analytics: false,
      consentGiven: true,
    };
    
    saveConsent(updatedConsent);
    setIsVisible(false);
  };

  const toggleCookieType = (type: CookieType) => {
    if (type === 'essential') return; // Zorunlu çerezler değiştirilemez
    
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const reopenBanner = () => {
    setIsVisible(true);
  };

  // Çerez banner'ı görünmüyorsa, alt kısımda yer alan "Çerez Ayarları" düğmesini gösteriyoruz
  if (!isVisible) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={reopenBanner}
          className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700"
          aria-label="Çerez ayarlarını aç"
        >
          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Banner Arkaplan Overlay - Sadece Ayarlar Açıkken */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowSettings(false)}
            />
          )}
          
          {/* Ana Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`fixed ${
              showSettings ? 'inset-0 m-auto max-h-[80vh] overflow-y-auto' : 'bottom-0 left-0 right-0'
            } max-w-3xl mx-auto p-4 md:p-6 bg-white dark:bg-slate-800 shadow-2xl rounded-t-xl md:rounded-xl border border-slate-200 dark:border-slate-700 z-50`}
          >
            {/* Kapatma Düğmesi */}
            <button
              onClick={() => {
                if (showSettings) {
                  setShowSettings(false);
                } else {
                  setIsVisible(false);
                }
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Banner Başlığı */}
            <div className="flex items-center space-x-3 mb-4">
              <Cookie className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {showSettings ? 'Çerez Tercihleriniz' : 'Bu site çerezleri kullanır'}
              </h2>
            </div>
            
            {showSettings ? (
              // Detaylı Çerez Ayarları Görünümü
              <div className="space-y-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Aşağıdaki seçeneklerle çerez tercihlerinizi özelleştirebilirsiniz. 
                  Bazı çerezler, web sitesinin temel işlevleri için gereklidir ve devre dışı bırakılamaz.
                </p>
                
                <div className="space-y-4">
                  {/* Zorunlu Çerezler */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-slate-900 dark:text-white">Zorunlu Çerezler</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Her zaman etkin</p>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={consent.essential} 
                          disabled
                          className="appearance-none h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 checked:bg-primary-600 transition-colors before:absolute before:top-[2px] before:left-[2px] before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4 cursor-not-allowed opacity-70"
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      <p>Bu çerezler, web sitesinin temel işlevlerini gerçekleştirmesi için gereklidir ve devre dışı bırakılamaz. Genellikle yalnızca sizin tarafınızdan gerçekleştirilen ve oturum açma, gizlilik tercihlerini ayarlama gibi hizmet taleplerine karşılık olarak ayarlanırlar.</p>
                    </div>
                  </div>
                  
                  {/* Tercih Çerezleri */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-slate-900 dark:text-white">Tercih Çerezleri</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Kullanıcı deneyiminizi iyileştirir</p>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={consent.preferences} 
                          onChange={() => toggleCookieType('preferences')}
                          className="appearance-none h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 checked:bg-primary-600 transition-colors before:absolute before:top-[2px] before:left-[2px] before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      <p>Bu çerezler, web sitesinin gelişmiş işlevsellik ve kişiselleştirme sağlamasına olanak tanır. Bizim veya web sitemizdeki hizmetleri sağlayan üçüncü taraflar tarafından ayarlanabilirler. Bu çerezlere izin vermezseniz, bu hizmetlerin bazıları veya tümü düzgün çalışmayabilir.</p>
                    </div>
                  </div>
                  
                  {/* Analitik Çerezler */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-slate-900 dark:text-white">Analitik Çerezler</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Kullanım istatistiklerini toplar</p>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={consent.analytics} 
                          onChange={() => toggleCookieType('analytics')}
                          className="appearance-none h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 checked:bg-primary-600 transition-colors before:absolute before:top-[2px] before:left-[2px] before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      <p>Bu çerezler, ziyaretçilerin web sitesini nasıl kullandığı hakkında bilgi toplar. Bu çerezlerin topladığı bilgiler, site içerisindeki hataların tespitine yardımcı olur ve sitenin nasıl çalıştığını ölçmemize olanak tanır. Bu çerezler, ziyaretiniz hakkında anonim bilgiler toplar.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleRejectNonEssential}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Sadece Zorunlu Çerezler
                  </button>
                  <button
                    onClick={handleAcceptSelected}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                  >
                    Seçili Çerezleri Kabul Et
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    Tümünü Kabul Et
                  </button>
                </div>
              </div>
            ) : (
              // Ana Banner Görünümü
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Bu web sitesi, size en iyi deneyimi sunmak için çerezleri kullanır. 
                  Bu çerezlerin bazıları, web sitesinin çalışması için gereklidir, 
                  bazıları ise site kullanımınızı anlamamıza ve geliştirmemize yardımcı olur.
                </p>
                
                {isExpanded && (
                  <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    <p className="mb-3">
                      "Tümünü Kabul Et" düğmesine tıklayarak, tüm çerezlerin kullanımını onaylarsınız. 
                      "Ayarları Yönet" düğmesine tıklayarak, tercihlerinizi belirleyebilir veya "Sadece Zorunlu Çerezleri Kabul Et" 
                      seçeneğini kullanarak yalnızca web sitesinin çalışması için gerekli olan çerezleri kabul edebilirsiniz.
                    </p>
                    <p>
                      Çerezler ve bunları nasıl kullandığımız hakkında daha fazla bilgi için, lütfen{' '}
                      <Link to="/kvkk" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline">
                        KVKK sayfamızı
                      </Link>{' '}
                      ziyaret edin.
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        <span>Daha az göster</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        <span>Daha fazla bilgi</span>
                      </>
                    )}
                  </button>
                  
                  <div className="flex flex-wrap gap-3 justify-end">
                    <button
                      onClick={handleRejectNonEssential}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Sadece Zorunlu Çerezler
                    </button>
                    <button
                      onClick={handleOpenSettings}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      Ayarları Yönet
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                    >
                      Tümünü Kabul Et
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 