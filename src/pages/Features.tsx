import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  BrainCircuit, 
  Clock, 
  MessageSquare, 
  BarChart, 
  CheckCircle, 
  ShieldCheck, 
  Lightbulb, 
  Heart, 
  Trophy, 
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  LogIn,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import logo2 from '../assets/logos/logo_2.png';
import { MainLayout } from '../components/layout/MainLayout';

export function Features() {
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
    document.title = "Özellikler - PsikoRan";
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

  const mainFeatures = [
    { 
      icon: <Calendar className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-primary-500 to-primary-600",
      title: 'Randevu Yönetimi', 
      description: 'Akıllı takvimleme, hatırlatmalar ve otomatik zamanlama özellikleri ile randevularınızı kolayca yönetin.',
      features: ['Çoklu takvim entegrasyonu', 'Otomatik hatırlatmalar', 'Çakışma kontrolü']
    },
    { 
      icon: <Users className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      title: 'Danışan Portali', 
      description: 'Danışanlarınıza özel erişim sağlayarak formları doldurma, randevu planlama ve iletişim kurma imkanı sunun.',
      features: ['Kişiselleştirilmiş erişim', 'Güvenli dosya paylaşımı', 'İlerleme takibi']
    },
    { 
      icon: <BrainCircuit className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      title: 'Terapi Asistanı AI', 
      description: 'Yapay zeka destekli not alma, analiz ve öneriler ile daha verimli terapi seansları gerçekleştirin.',
      features: ['Ses tanıma ile not tutma', 'Duygu analizi', 'Özelleştirilebilir öneri sistemleri']
    },
    { 
      icon: <Clock className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-teal-500 to-teal-600",
      title: 'Erişilebilir Destek Sistemleri', 
      description: 'Danışanlarınıza 7/24 destek sağlayan ölçeklenebilir kaynak ve araçlara erişim imkanı sunun.',
      features: ['Kişiselleştirilmiş kaynaklar', 'Etkileşimli egzersizler', 'İlerleme ölçümleri']
    },
    { 
      icon: <MessageSquare className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      title: 'Güvenli İletişim Platformu', 
      description: 'KVKK ve GDPR uyumlu, uçtan uca şifreli güvenli mesajlaşma ve dosya paylaşım platformu.',
      features: ['Uçtan uca şifreleme', 'Dosya paylaşımı', 'Grup mesajlaşma']
    },
    { 
      icon: <BarChart className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      title: 'Gelişmiş Analitik Paneller', 
      description: 'Danışanlarınızın ilerlemesini ve işletmenizin performansını görselleştiren özelleştirilebilir raporlar.',
      features: ['İnteraktif grafikler', 'Trend analizleri', 'Özelleştirilebilir raporlar']
    },
  ];

  const additionalFeatures = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" />,
      title: 'KVKK ve GDPR Uyumlu',
      description: 'En yüksek güvenlik standartlarını karşılayan, tamamen uyumlu bir platform.'
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      title: 'Sürekli Gelişen Özellikler',
      description: 'Düzenli güncellemeler ve yeni özelliklerle sürekli gelişen bir platform.'
    },
    {
      icon: <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />,
      title: 'Kullanıcı Odaklı Tasarım',
      description: 'Kullanımı kolay, sezgisel ve danışman ihtiyaçlarına göre tasarlanmış arayüz.'
    },
    {
      icon: <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
      title: 'Sektör Lideri Çözüm',
      description: 'Ruh sağlığı profesyonelleri tarafından en çok tercih edilen dijital platform.'
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 transition-colors duration-300">
        {/* Hero Bölümü */}
        <section className="pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl"
              >
                <span className="block">Psikoloji Pratiğinizi</span>
                <span className="block text-primary-600 dark:text-primary-500">Dijitalleştirin</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400"
              >
                Modern terapi ve danışmanlık süreçleri için geliştirilen PsikoRan, 
                profesyonellerin iş akışını optimize eden kapsamlı dijital çözümler sunar.
              </motion.p>
            </div>
        </div>
      </section>

        {/* Özellikler (Features) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainFeatures.map((feature, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 group relative"
            >
              {/* Üst Görsel Kısmı */}
              <div className={`p-6 ${feature.color}`}>
                <div className="absolute top-0 right-0 p-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <div className="h-12"></div>
              </div>
              
              {/* İçerik Kısmı */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                  {feature.description}
                </p>
                
                <ul className="space-y-2 mb-4">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                      <div className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-2 flex-shrink-0">
                        <svg className="h-3 w-3 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <button
                  className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 group"
                >
                  <span>Detaylı Bilgi</span>
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Neden <span className="text-primary-600 dark:text-primary-400">PsikoRan</span>?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Ruh sağlığı profesyonellerinin tercihi olmamızın nedenleri
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {additionalFeatures.map((feature, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Platform Integration Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Platform Entegrasyonları ve <span className="text-primary-600 dark:text-primary-400">Ekosistem</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                PsikoRan, kullandığınız diğer araçlarla sorunsuz entegrasyon sağlar. Google Takvim, Microsoft 365, Zoom ve daha fazlasıyla çalışın.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-primary-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Google Takvim</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Microsoft 365</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Zoom</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-cyan-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Daha Fazla</span>
                </motion.div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 w-full md:w-64">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-3">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Entegrasyonlar</h4>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <div className={`h-4 w-4 rounded-full bg-${['primary', 'blue', 'green', 'amber'][i-1]}-400/80`}></div>
                    </div>
                  ))}
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-primary-500 rounded-full"></div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">6 aktif bağlantı</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Tümünü Yönet</span>
                <button className="text-xs font-medium text-primary-600 dark:text-primary-400">Ekle +</button>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* CTA bölümü */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            PsikoRan ile Profesyonel İş Akışınızı <span className="text-primary-600 dark:text-primary-400">Dönüştürün</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Ücretsiz başlayın, ihtiyaçlarınız arttıkça ölçeklendirin. Aylık veya yıllık esnek fiyatlandırma planları.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pricing"
              className="px-7 py-3.5 rounded-full bg-primary-600 text-white font-medium text-center shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 hover:bg-primary-700 transition-all duration-300 flex items-center justify-center group"
            >
              <span>Fiyatlandırmayı Görüntüle</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 1 }}
              >
                <ChevronRight className="h-5 w-5 ml-2" />
              </motion.div>
            </Link>
            <Link
              to="/demo"
              className="px-7 py-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-medium text-center shadow-lg shadow-slate-300/10 dark:shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-300/20 dark:hover:shadow-slate-900/30 transition-all duration-300 flex items-center justify-center"
            >
              <span>Demo İsteyin</span>
            </Link>
          </div>
        </motion.div>
          </div>
        </section>
              </div>
    </MainLayout>
  );
}

export default Features; 