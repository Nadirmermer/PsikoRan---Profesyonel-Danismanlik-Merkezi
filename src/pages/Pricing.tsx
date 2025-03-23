import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, HelpCircle, Info, X, ArrowRight, Sun, Moon, LogIn, Menu } from 'lucide-react';

import logo2 from '../assets/logo/logo_2.png';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  
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
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Fiyatlandırma - PsikoRan";
    window.scrollTo(0, 0);
  }, []);

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('app_theme', !isDarkMode ? 'dark' : 'light');
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const plans = [
    {
      name: 'Başlangıç',
      description: 'Tek kullanıcılı uygulamalar için temel özellikler',
      monthlyPrice: '149',
      annualPrice: '129',
      features: [
        { title: 'Randevu Yönetimi', included: true },
        { title: 'Danışan Portali (5 aktif danışan)', included: true },
        { title: 'Randevu Hatırlatmaları', included: true },
        { title: 'Temel Raporlar', included: true },
        { title: 'E-posta Desteği', included: true },
        { title: 'Terapi Asistanı AI', included: false },
        { title: 'Gelişmiş Analitik', included: false },
        { title: 'Çoklu Takvim Entegrasyonu', included: false },
        { title: 'Süpervizyon Araçları', included: false },
        { title: 'Telefon Desteği', included: false },
      ],
      cta: 'Ücretsiz Başlayın',
      popular: false,
      color: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
      ctaStyle: 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
    },
    {
      name: 'Profesyonel',
      description: 'Büyüyen uygulamalar için ölçeklenebilir çözüm',
      monthlyPrice: '299',
      annualPrice: '249',
      features: [
        { title: 'Randevu Yönetimi', included: true },
        { title: 'Danışan Portali (25 aktif danışan)', included: true },
        { title: 'Randevu Hatırlatmaları', included: true },
        { title: 'Temel ve Gelişmiş Raporlar', included: true },
        { title: 'Öncelikli E-posta Desteği', included: true },
        { title: 'Terapi Asistanı AI', included: true },
        { title: 'Gelişmiş Analitik', included: true },
        { title: 'Çoklu Takvim Entegrasyonu', included: true },
        { title: 'Süpervizyon Araçları', included: false },
        { title: 'Telefon Desteği', included: false },
      ],
      cta: 'Şimdi Başlayın',
      popular: true,
      color: 'bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700',
      ctaStyle: 'bg-white text-primary-600 hover:bg-slate-100'
    },
    {
      name: 'Kurumsal',
      description: 'Klinikler ve büyük uygulamalar için',
      monthlyPrice: '499',
      annualPrice: '429',
      features: [
        { title: 'Randevu Yönetimi', included: true },
        { title: 'Danışan Portali (Sınırsız)', included: true },
        { title: 'Randevu Hatırlatmaları', included: true },
        { title: 'Tam Kapsamlı Raporlar', included: true },
        { title: 'Öncelikli Destek', included: true },
        { title: 'Terapi Asistanı AI', included: true },
        { title: 'Gelişmiş Analitik', included: true },
        { title: 'Çoklu Takvim Entegrasyonu', included: true },
        { title: 'Süpervizyon Araçları', included: true },
        { title: 'Telefon Desteği', included: true },
      ],
      cta: 'İletişime Geçin',
      popular: false,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700',
      ctaStyle: 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
    }
  ];

  // Sıkça sorulan sorular
  const faqs = [
    {
      question: 'Aboneliğimi istediğim zaman iptal edebilir miyim?',
      answer: 'Evet, aboneliğinizi dilediğiniz zaman iptal edebilirsiniz. İptal işleminiz sonrasında mevcut ödeme döneminin sonuna kadar hizmetlerimizden yararlanmaya devam edebilirsiniz.'
    },
    {
      question: 'Farklı planlar arasında geçiş yapabilir miyim?',
      answer: 'Evet, ihtiyaçlarınıza göre istediğiniz zaman daha üst bir plana yükseltme yapabilirsiniz. Düşük plana geçiş için ise mevcut faturalandırma döneminin bitiminde değişiklik yapılabilir.'
    },
    {
      question: 'Planlarınız kaç kullanıcıyı destekliyor?',
      answer: 'Başlangıç planımız tek kullanıcı için tasarlanmıştır. Profesyonel planımız 5 kullanıcıya kadar, Kurumsal planımız ise özelleştirilebilir sayıda kullanıcı eklemenize olanak tanır.'
    },
    {
      question: 'Verilerimizin güvenliği nasıl sağlanıyor?',
      answer: 'Tüm verileriniz uçtan uca şifreleme ile korunur. KVKK ve GDPR uyumlu altyapımız, güvenlik denetimleriyle sürekli test edilir ve en yüksek güvenlik standartlarını karşılar.'
    },
    {
      question: 'Deneme süresi var mı?',
      answer: 'Evet, tüm planlarımız için 14 günlük ücretsiz deneme süresi sunuyoruz. Bu süre içinde herhangi bir ödeme yapmanız gerekmez ve dilediğiniz zaman iptal edebilirsiniz.'
    },
    {
      question: 'Özel ihtiyaçlarımız için uyarlanmış bir plan alabilir miyiz?',
      answer: 'Evet, özel ihtiyaçlarınız için özelleştirilmiş çözümler sunuyoruz. Kurumsal ihtiyaçlarınız için satış ekibimizle iletişime geçebilirsiniz.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Navigasyon - Modern Tasarım */}
      <nav className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20 items-center">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3 group">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
                  className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 p-0.5 shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300"
              >
                  <div className="absolute inset-0 rounded-xl bg-white dark:bg-slate-900 p-1">
                    <img src={logo2} alt="PsikoRan Logo" className="h-full w-full object-contain" />
                  </div>
              </motion.div>
              <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 group-hover:from-primary-600 group-hover:to-primary-500 dark:group-hover:from-primary-400 dark:group-hover:to-primary-300 transition-all duration-300"
              >
                PsikoRan
              </motion.span>
              </Link>
            </div>
            
            {/* Masaüstü Menü */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Link 
                  to="/features" 
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-sm"
                >
                  Özellikler
                </Link>
                <Link 
                  to="/pricing" 
                  className="px-3 py-2 rounded-lg text-primary-600 dark:text-primary-400 font-medium transition-colors bg-slate-100/70 dark:bg-slate-800/70 text-sm"
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
                  className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-sm"
                >
                  İletişim
                </Link>
              </div>
              
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
              {/* Tema değiştirme butonu */}
              <button
                onClick={toggleDarkMode}
                  className="p-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg group border border-slate-200 dark:border-slate-700 transition-all duration-300"
                  aria-label={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Moon className="h-5 w-5 text-primary-600 group-hover:rotate-90 transition-transform duration-300" />
                )}
              </button>

              <Link
                to="/login"
                  className="px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 flex items-center space-x-1.5 text-sm"
              >
                  <LogIn className="h-4 w-4" />
                <span>Giriş Yap</span>
              </Link>
                
              <Link
                to="/create-assistant"
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium transition-all duration-300 flex items-center space-x-1.5 shadow-md hover:shadow-lg hover:shadow-primary-600/20 text-sm"
              >
                <span>Asistan Hesabı</span>
                  <ArrowRight className="h-4 w-4" />
              </Link>
              </div>
            </div>
            
            {/* Mobil Menü Butonları */}
            <div className="flex items-center space-x-3 md:hidden">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300"
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
                className="p-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300"
                aria-label="Menüyü aç/kapat"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobil Menü - Slide Down Animasyonu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-3 border-t border-slate-200 dark:border-slate-700"
            >
              <div className="space-y-1.5 py-3">
                <Link 
                  to="/features" 
                  className="block px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Özellikler
                </Link>
                <Link 
                  to="/pricing" 
                  className="block px-4 py-2.5 rounded-lg text-primary-600 dark:text-primary-400 font-medium transition-colors bg-slate-100 dark:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fiyatlandırma
                </Link>
                <Link 
                  to="/blog" 
                  className="block px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className="block px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  İletişim
                </Link>
              </div>
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
                <Link
                  to="/login"
                  className="block px-4 py-2.5 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium flex items-center space-x-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5" />
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  to="/create-assistant"
                  className="block px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium flex items-center space-x-2 transition-colors mx-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Asistan Hesabı</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Şeffaf <span className="text-primary-600 dark:text-primary-400">Fiyatlandırma</span> Planları
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            İhtiyaçlarınıza uygun olarak ölçeklenebilen, kullanım başına ücret ödemeye gerek kalmayan basit planlar.
          </p>
          
          {/* Aylık/Yıllık Toggle */}
          <div className="flex items-center justify-center mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Aylık</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="mx-3 relative inline-flex h-6 w-12 items-center rounded-full bg-primary-500 dark:bg-primary-600"
            >
              <span className="sr-only">Fiyatlandırma Dönemi Değiştir</span>
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} 
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              Yıllık
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                %16 İndirim
              </span>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`flex-1 rounded-3xl overflow-hidden border ${plan.popular ? 'border-primary-400 dark:border-primary-500 shadow-xl shadow-primary-100 dark:shadow-primary-900/20' : 'border-slate-200 dark:border-slate-700 shadow-lg'}`}
            >
              {/* Plan Header */}
              <div className={`${plan.color} px-6 py-8 text-center ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {plan.popular && (
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-3">
                    En Popüler
                  </span>
                )}
                <h3 className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                <p className={`mt-2 text-sm ${plan.popular ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₺{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                  <span className={`text-sm ${plan.popular ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>/ay</span>
                </div>
                {isAnnual && (
                  <p className={`mt-1 text-xs ${plan.popular ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                    Yıllık faturalandırmada
                  </p>
                )}
              </div>
              
              {/* Plan Features */}
              <div className="bg-white dark:bg-slate-800 px-6 py-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`ml-3 text-sm ${feature.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                        {feature.title}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={index === 2 ? "/contact" : "/register"}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors duration-200 ${plan.popular ? 'text-primary-700 hover:text-primary-800' : 'text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700'} ${plan.ctaStyle}`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Comparison Table (only on larger screens) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto hidden lg:block">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Planları Karşılaştırın
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            İhtiyaçlarınıza en uygun planı seçmek için özellik karşılaştırması yapın
          </p>
        </motion.div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-left font-medium text-slate-500 dark:text-slate-400">Özellik</th>
                {plans.map((plan, i) => (
                  <th key={i} className="py-4 px-6 text-center font-medium">
                    <span className={`${plan.popular ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>
                      {plan.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">Danışan Sayısı</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">5 aktif</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">25 aktif</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">Sınırsız</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">Kullanıcı Sayısı</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">1</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">5</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">Özelleştirilebilir</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">Yapay Zeka Süre</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">-</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">10 saat/ay</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">30 saat/ay</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">API Erişimi</td>
                <td className="py-4 px-6 text-center">
                  <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                </td>
                <td className="py-4 px-6 text-center">
                  <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                </td>
                <td className="py-4 px-6 text-center">
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">Depolama</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">5 GB</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">20 GB</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">100 GB</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">Teknik Destek</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">E-posta</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">Öncelikli E-posta</td>
                <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">Telefon + E-posta</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Fiyatlandırma ve aboneliklerle ilgili en çok sorulan sorular
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-start">
                <HelpCircle className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
                {faq.question}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm pl-7">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/30 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary-300/20 dark:bg-primary-500/10 blur-3xl"
              animate={{ 
                x: [0, 10, 0],
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute -left-10 bottom-10 w-48 h-48 rounded-full bg-indigo-300/30 dark:bg-indigo-500/10 blur-3xl"
              animate={{ 
                x: [0, -10, 0],
                y: [0, 10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
            />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white dark:bg-slate-800 rounded-full h-16 w-16 flex items-center justify-center mb-6 shadow-lg">
              <Info className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Büyük ekipler veya kurumlar için özel fiyatlandırma
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
              10'dan fazla çalışanı olan ruh sağlığı klinikleri, vakıflar ve kurumlar için özel indirimli fiyatlandırma ve ek özellikler sunuyoruz.
            </p>
            <Link
              to="/contact"
              className="px-7 py-3.5 rounded-full bg-primary-600 text-white font-medium text-center shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 hover:bg-primary-700 transition-all duration-300 flex items-center justify-center group"
            >
              <span>Kurumsal Satış ile İletişime Geçin</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 1 }}
              >
                <ArrowRight className="h-5 w-5 ml-2" />
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
            {/* Logo ve Hakkında */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 p-0.5">
                  <div className="h-full w-full rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-1">
                  <img 
                    src={logo2} 
                    alt="PsikoRan Logo" 
                    className="w-full h-full object-contain"
                  />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  PsikoRan
                </h2>
              </Link>
              
              <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">
                Profesyonel danışmanlık süreçlerinizi dijitalleştiren, randevu yönetimi, danışan takibi ve gelişmiş AI araçları sunan modern platform.
              </p>
              
              <div className="mt-6 flex space-x-4">
                <motion.a 
                  href="https://twitter.com/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Twitter'da takip et"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </motion.a>
                <motion.a 
                  href="https://www.facebook.com/people/PsikoRan/61574169219677/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Facebook'ta takip et"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </motion.a>
                <motion.a 
                  href="https://instagram.com/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Instagram'da takip et"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </motion.a>
                <motion.a 
                  href="https://www.linkedin.com/company/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="LinkedIn'de takip et"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </motion.a>
              </div>
            </div>
            
            {/* Footer Menü Sütunları */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Hızlı Bağlantılar */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Hızlı Bağlantılar
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/features" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Özellikler
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Fiyatlandırma
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Giriş Yap
                    </Link>
                  </li>
                  <li>
                    <Link to="/create-assistant" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Asistan Hesabı Oluştur
                    </Link>
                  </li>
                  <li>
                    <Link to="/forgot-password" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Şifremi Unuttum
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Yasal Bilgiler */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Yasal Bilgiler
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/privacy" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Gizlilik Politikası
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Kullanım Şartları
                    </Link>
                  </li>
                  <li>
                    <Link to="/kvkk" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      KVKK
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Çerez Politikası
                    </Link>
                  </li>
                </ul>
              </div>

              {/* İletişim */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  İletişim
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="text-slate-500 dark:text-slate-400 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">destek@psikoran.com</span>
                  </li>
                  <li>
                    <Link to="/blog" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Yardım Merkezi
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      İletişim Formu
                    </Link>
                  </li>
                </ul>
                
                <Link 
                  to="/contact" 
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium mt-4 transition-colors"
                >
                  <span>Bize Ulaşın</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Alt Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
              </p>
              <div className="flex mt-4 md:mt-0 flex-wrap justify-center gap-x-6 gap-y-2">
                <Link to="/help" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Yardım Merkezi
                </Link>
                <Link to="/blog" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Blog
                </Link>
                <a href="/assets/pages/sitemap.html" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Site Haritası
                </a>
              </div>
            </div>
            
            {/* GDPR/KVKK Bilgilendirme */}
            <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 text-center">
              <p>Bu web sitesini kullanarak, <Link to="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline">Gizlilik Politikamızı</Link> ve <Link to="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline">Kullanım Şartlarımızı</Link> kabul etmiş olursunuz.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Pricing; 