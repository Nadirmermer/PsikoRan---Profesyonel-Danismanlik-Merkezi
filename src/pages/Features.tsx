import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  ClipboardCheck,
  Video,
  DollarSign,
  BarChart, 
  FileText,
  ShieldCheck, 
  Palette,
  Code,
  Smartphone,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  LogIn,
  ArrowRight,
  Menu,
  X,
  Settings,
  MessageSquare
} from 'lucide-react';
import logo1 from '../assets/base-logo.webp';
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
      description: 'Gelişmiş takvim sistemi ile randevularınızı kolayca planlayın, yönetin ve danışanlarınıza hatırlatmalar gönderin.',
      features: ['Günlük, haftalık, aylık görünümler', 'Otomatik hatırlatmalar', 'Müsaitlik yönetimi']
    },
    { 
      icon: <Users className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      title: 'Danışan Yönetimi ve Portalı', 
      description: 'Danışanlarınızın bilgilerini güvenle saklayın, ilerlemelerini takip edin ve onlara özel bir portal sunun.',
      features: ['Detaylı danışan profilleri', 'Güvenli iletişim', 'Randevu ve test takibi']
    },
    { 
      icon: <ClipboardCheck className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      title: 'Online Psikolojik Testler', 
      description: 'Geniş test kütüphanesinden testler atayın, online olarak uygulayın ve sonuçları otomatik olarak raporlayın.',
      features: ['Çeşitli test envanteri', 'Otomatik puanlama', 'Görsel raporlama']
    },
    { 
      icon: <Video className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-teal-500 to-teal-600",
      title: 'Güvenli Video Görüşmeler', 
      description: 'Entegre Jitsi Meet ile KVKK/GDPR uyumlu, uçtan uca şifreli ve kesintisiz online seanslar gerçekleştirin.',
      features: ['Uygulama içi görüşme (modal)', 'Ekran paylaşımı', 'Güvenli bağlantı']
    },
    { 
      icon: <DollarSign className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      title: 'Ödeme Takibi ve Finansal İzleme', 
      description: 'Danışan ödemelerini kolayca takip edin, raporlayın ve kliniğinizin finansal durumunu analiz edin.',
      features: ['Ödeme kaydı', 'Fatura bilgileri', 'Gelir raporları']
    },
    { 
      icon: <BarChart className="h-6 w-6 text-white" />, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      title: 'Analitik Kontrol Paneli', 
      description: 'Klinik performansınızı, danışan istatistiklerini ve randevu verilerini görsel panellerle takip edin.',
      features: ['Performans metrikleri', 'İstatistiksel grafikler', 'Özelleştirilebilir görünüm']
    },
  ];

  const additionalFeatures = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" />,
      title: 'KVKK ve GDPR Uyumlu Güvenlik',
      description: 'Veri güvenliği en üst düzeyde sağlanır; RLS, RBAC ve şifreleme ile bilgileriniz korunur.'
    },
    {
      icon: <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      title: 'Modern ve Kullanıcı Odaklı Arayüz',
      description: 'Karanlık/Aydınlık tema, akıcı animasyonlar ve erişilebilir tasarım ile keyifli bir kullanım deneyimi.'
    },
    {
      icon: <Code className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: 'Gelişmiş Teknoloji Altyapısı',
      description: 'React, TypeScript, Supabase gibi modern teknolojilerle hızlı, güvenilir ve ölçeklenebilir bir platform.'
    },
    {
      icon: <Smartphone className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
      title: 'Mobil Uyumlu Deneyim',
      description: 'Tüm cihazlarda (telefon, tablet, masaüstü) sorunsuz çalışan responsive tasarım.'
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
                Entegre Çözümler ile <span className="text-primary-600 dark:text-primary-400">Kesintisiz Deneyim</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                PsikoRan, güvenli video görüşmeler için Jitsi Meet entegrasyonu sunar. Gelecekteki güncellemelerle daha fazla entegrasyon eklemeyi planlıyoruz.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  <Video className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Jitsi Meet Video Konferans</span>
                </motion.div>
                 <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 flex items-center gap-2 opacity-60"
                >
                  <Sparkles className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Yakında Daha Fazlası...</span>
                </motion.div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 w-full md:w-64 flex items-center justify-center">
               <div className="text-center">
                 <Video size={48} className="mx-auto text-primary-500 mb-2" />
                 <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Entegre Video Görüşme</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400">Jitsi Meet ile Güvenli</p>
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