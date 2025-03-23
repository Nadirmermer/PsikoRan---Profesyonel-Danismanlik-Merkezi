import { LegalLayout } from '../components/LegalLayout';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, AlertCircle, Menu, X, LogIn, ArrowRight, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import logo2 from '../assets/logo/logo_2.png';

const CONTACT_TOPICS = [
  { id: 'technical', label: 'Teknik Destek' },
  { id: 'account', label: 'Hesap İşlemleri' },
  { id: 'billing', label: 'Fatura ve Ödeme' },
  { id: 'feature', label: 'Özellik Önerisi' },
  { id: 'bug', label: 'Hata Bildirimi' },
  { id: 'other', label: 'Diğer' },
];

const WORKING_HOURS = [
  { days: 'Pazartesi - Cuma', hours: '09:00 - 18:00' },
  { days: 'Cumartesi', hours: '10:00 - 14:00' },
  { days: 'Pazar', hours: 'Kapalı' },
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // localStorage'dan tema tercihini al
      const savedTheme = localStorage.getItem('app_theme');
      
      if (savedTheme === 'dark') {
        return true;
      }
      
      if (savedTheme === 'light') {
        return false;
      }
      
      // Sistem tercihini kontrol et
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Tema değişikliği işlevi
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('app_theme', !isDarkMode ? 'dark' : 'light');
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem('app_theme');
      if (!currentTheme || currentTheme === 'system') {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode]);

  // EmailJS başlatma
  useEffect(() => {
    // EmailJS servisini başlat
    // NOT: Aşağıdaki adımları izleyerek kendi public key'inizi alın:
    // 1. https://www.emailjs.com/ adresine gidin ve ücretsiz bir hesap oluşturun
    // 2. Dashboard > Account > API Keys bölümünden "Public Key" değerini kopyalayın
    // 3. Aşağıdaki "YOUR_PUBLIC_KEY" yerine kopyaladığınız değeri yapıştırın
    emailjs.init("YOUR_PUBLIC_KEY");
    
    // Sayfa başlığını ayarla
    document.title = "İletişim - PsikoRan";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError('Lütfen gizlilik politikasını kabul edin.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Konu metnini al
      const topicText = CONTACT_TOPICS.find(t => t.id === formData.topic)?.label || formData.topic;
      
      // EmailJS ile e-posta gönderme
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        topic: topicText,
        message: formData.message,
        reply_to: formData.email,
      };
      
      // NOT: Aşağıdaki adımları izleyerek kendi servis ve şablon ID'lerinizi alın:
      // 1. EmailJS Dashboard > Email Services > [Servis Adı] bölümünden "Service ID" değerini kopyalayın
      // 2. EmailJS Dashboard > Email Templates > [Şablon Adı] bölümünden "Template ID" değerini kopyalayın
      // 3. Aşağıdaki "YOUR_SERVICE_ID" ve "YOUR_TEMPLATE_ID" değerlerini güncelleyin
      const response = await emailjs.send(
        'YOUR_SERVICE_ID', // EmailJS servis ID'si
        'YOUR_TEMPLATE_ID', // EmailJS template ID'si
        templateParams
      );
      
      if (response.status !== 200) {
        throw new Error('E-posta gönderilemedi');
      }
      
      setSuccess(true);
      setFormData({ name: '', email: '', topic: '', message: '', acceptTerms: false });
    } catch (err) {
      console.error('Form gönderme hatası:', err);
      setError('Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Navigasyon - Modern Tasarım */}
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo Bölümü */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 p-0.5 shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300"
                >
                  <div className="absolute inset-0 rounded-xl bg-white dark:bg-slate-900 p-1">
                    <img src={logo2} alt="PsikoRan Logo" className="h-full w-full object-contain" />
                  </div>
                </motion.div>
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 group-hover:from-primary-600 group-hover:to-primary-500 dark:group-hover:from-primary-400 dark:group-hover:to-primary-300 transition-all duration-300"
                >
                  PsikoRan
                </motion.span>
              </Link>
            </div>
            
            {/* Masaüstü Menü */}
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex items-center space-x-1">
                <Link 
                  to="/features" 
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-sm"
                >
                  Özellikler
                </Link>
                <Link 
                  to="/pricing" 
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-sm"
                >
                  Fiyatlandırma
                </Link>
                <Link 
                  to="/blog" 
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-sm"
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className="px-3 py-2 rounded-lg text-primary-600 dark:text-primary-400 font-medium transition-colors bg-slate-100/70 dark:bg-slate-800/70 text-sm"
                >
                  İletişim
                </Link>
              </nav>
              
              <div className="flex items-center pl-4 border-l border-slate-200 dark:border-slate-700">
                {/* Tema değiştirme butonu */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 mx-1"
                  aria-label={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary-600" />
                  )}
                </button>

                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5 text-sm mx-1"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Giriş</span>
                </Link>
                  
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium transition-all duration-200 flex items-center space-x-1.5 text-sm mx-1"
                >
                  <span>Asistan Hesabı</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Mobil Menü Butonları */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 mr-2"
                aria-label={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-primary-600" />
                )}
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                aria-label="Menüyü aç/kapat"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobil Menü */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden py-2 border-t border-slate-200 dark:border-slate-800"
            >
              <nav className="flex flex-col space-y-1 py-3">
                <Link 
                  to="/features" 
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Özellikler
                </Link>
                <Link 
                  to="/pricing" 
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fiyatlandırma
                </Link>
                <Link 
                  to="/blog" 
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className="px-4 py-2 text-primary-600 dark:text-primary-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  İletişim
                </Link>
              </nav>
              
              <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  to="/register"
                  className="mx-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Asistan Hesabı</span>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Sayfa İçeriği */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">İletişim</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Size nasıl yardımcı olabiliriz?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* İletişim Bilgileri */}
          <div className="space-y-8">
            {/* İletişim Kartları */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Destek Ekibi</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                      Teknik destek ve genel sorularınız için 7/24 yanınızdayız.
                    </p>
                    <a 
                      href="mailto:destek@psikoran.com" 
                      className="mt-3 inline-flex items-center text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      destek@psikoran.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Telefon</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                      Acil durumlar için telefon desteği.
                    </p>
                    <a 
                      href="tel:+905011462347" 
                      className="mt-3 inline-flex items-center text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    >
                      +90 (501) 146 23 47
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Çalışma Saatleri</h3>
                    <div className="mt-2 space-y-2">
                      {WORKING_HOURS.map(({ days, hours }) => (
                        <div key={days} className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">{days}</span>
                          <span className="font-medium text-slate-900 dark:text-white">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bilgilendirme Kartı */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-100 dark:border-primary-800">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-primary-900 dark:text-primary-100">Yanıt Süresi</h4>
                  <p className="mt-1 text-sm text-primary-700 dark:text-primary-300">
                    Mesajlarınıza genellikle 24 saat içinde yanıt veriyoruz. Acil durumlar için lütfen telefon desteğini kullanın.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg p-6 md:p-8">
            {!success ? (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                  Bize Ulaşın
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Adınız Soyadınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Konu
                  </label>
                  <select
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Seçiniz</option>
                    {CONTACT_TOPICS.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mesajınız
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Size nasıl yardımcı olabiliriz?"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="accept-terms" className="ml-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    <span>Gizlilik politikasını okudum ve kabul ediyorum.</span>
                    <Link to="/privacy-policy" className="ml-1 text-primary-600 dark:text-primary-400 hover:underline">
                      Detaylar
                    </Link>
                  </label>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-lg text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Gönder</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center p-8"
              >
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                  Mesajınız İletildi
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  En kısa sürede size dönüş yapacağız.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg transition-colors"
                >
                  Yeni mesaj gönder
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 