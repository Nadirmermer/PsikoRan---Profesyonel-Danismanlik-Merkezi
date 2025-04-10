import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, HelpCircle, Info, X, ArrowRight, Sun, Moon, LogIn, Menu } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';

import logo1 from '../assets/base-logo.webp';

// PlanType yerel tanımı kalıyor
export type PlanType = 'starter' | 'growth' | 'clinic' | 'enterprise';

export function Pricing() {
  const [annualBilling, setAnnualBilling] = useState(true);
  
  // Dark mode ve mobil menü state'leri
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
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
        if (e.matches) { document.documentElement.classList.add('dark'); }
        else { document.documentElement.classList.remove('dark'); }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    if (isDarkMode) { document.documentElement.classList.add('dark'); }
    else { document.documentElement.classList.remove('dark'); }
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('app_theme', !isDarkMode ? 'dark' : 'light');
    if (!isDarkMode) { document.documentElement.classList.add('dark'); }
    else { document.documentElement.classList.remove('dark'); }
  };
  
  const plans = [
    {
      name: 'Başlangıç',
      description: 'Bireysel veya tek profesyonelli pratikler için temel çözüm',
      monthlyPrice: '249',
      annualPrice: '199',
      features: [
        { title: '1 Yönetici (Asistan/Sahip)', included: true },
        { title: '1 Profesyonel Hesabı', included: true },
        { title: '25 Aktif Danışan Limiti', included: true },
        { title: 'Randevu Yönetimi', included: true },
        { title: 'Danışan Yönetimi', included: true },
        { title: 'Şifrelenmiş Seans Notları', included: true },
        { title: 'Online Test Erişimi (Temel)', included: true },
        { title: 'Temel Ödeme Takibi', included: true },
        { title: 'Güvenli Video Görüşme (Jitsi)', included: false },
        { title: 'Analitik Dashboard (Temel)', included: false },
        { title: 'Blog Yönetimi', included: false },
        { title: 'E-posta Desteği', included: true },
      ],
      cta: 'Hemen Başla',
      ctaLink: '/register', 
      popular: false,
      color: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
      ctaStyle: 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700',
      planType: 'starter' as PlanType
    },
    {
      name: 'Gelişim',
      description: 'Büyüyen pratikler ve küçük ekipler için ideal',
      monthlyPrice: '499',
      annualPrice: '399',
      features: [
        { title: '1 Yönetici (Asistan/Sahip)', included: true },
        { title: '3 Profesyonel Hesabı', included: true },
        { title: '100 Aktif Danışan Limiti', included: true },
        { title: 'Randevu Yönetimi', included: true },
        { title: 'Danışan Yönetimi ve Portalı', included: true },
        { title: 'Şifrelenmiş Seans Notları', included: true },
        { title: 'Online Test Erişimi (Tam Set)', included: true },
        { title: 'Gelişmiş Ödeme Takibi', included: true },
        { title: 'Güvenli Video Görüşme (Jitsi)', included: true },
        { title: 'Analitik Dashboard (Gelişmiş)', included: true },
        { title: 'Blog Yönetimi', included: false },
        { title: 'Öncelikli E-posta Desteği', included: true },
      ],
      cta: 'Hemen Başla', 
      ctaLink: '/register', 
      popular: true,
      color: 'bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700',
      ctaStyle: 'bg-white text-primary-600 hover:bg-slate-100',
      planType: 'growth' as PlanType
    },
    {
      name: 'Klinik',
      description: 'Orta ve büyük ölçekli klinikler için tam kapsamlı çözüm',
      monthlyPrice: '999',
      annualPrice: '799',
      features: [
        { title: '1+ Yönetici (Asistan/Sahip)', included: true },
        { title: '10 Profesyonel Hesabı', included: true },
        { title: 'Sınırsız Aktif Danışan', included: true },
        { title: 'Randevu Yönetimi', included: true },
        { title: 'Danışan Yönetimi ve Portalı', included: true },
        { title: 'Şifrelenmiş Seans Notları', included: true },
        { title: 'Online Test Erişimi (Tam Set)', included: true },
        { title: 'Tam Finansal Yönetim', included: true },
        { title: 'Güvenli Video Görüşme (Jitsi)', included: true },
        { title: 'Analitik Dashboard (Özelleştirilebilir)', included: true },
        { title: 'Blog Yönetimi', included: true },
        { title: 'Klinik Ayarları Yönetimi', included: true },
        { title: 'Telefon ve Öncelikli Destek', included: true },
      ],
      cta: 'İletişime Geç',
      ctaLink: '/iletisim',
      popular: false,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700',
      ctaStyle: 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700',
      planType: 'clinic' as PlanType
    }
  ];

  const faqs = [
    {
      question: 'Yönetici (Asistan/Sahip) ve Profesyonel Hesabı arasındaki fark nedir?',
      answer: 'Yönetici hesabı, kliniğin/pratiğin genel ayarlarını, faturalandırmayı ve kullanıcıları yönetir. Profesyonel hesaplar ise (terapist, psikolog vb.) danışanlarla doğrudan çalışan, seans ve notları yöneten hesaplardır. Her plan en az bir yönetici hesabı içerir.'
    },
    {
      question: 'Planlardaki Profesyonel Hesabı limiti ne anlama geliyor?',
      answer: 'Bu limit, yönetici hesabının sisteme ekleyebileceği ve aktif olarak kullanabilecek terapist/psikolog sayısını belirtir. Örneğin, Gelişim planında 1 yönetici + 3 profesyonel olmak üzere toplam 4 kişi sistemi kullanabilir.'
    },
    {
      question: 'Aktif Danışan Limiti nasıl çalışıyor?',
      answer: 'Limit, aynı anda sistemde "aktif" durumdaki danışan sayısını ifade eder. Tedavisi biten veya pasif durumdaki danışanları arşivleyerek limitinizi boşaltabilirsiniz. Klinik planında bu limit yoktur.'
    },
    {
      question: 'Aboneliğimi istediğim zaman iptal edebilir veya değiştirebilir miyim?',
      answer: 'Evet, aboneliğinizi kontrol panelinizden dilediğiniz zaman iptal edebilir veya ihtiyacınıza göre daha üst/alt bir plana geçiş yapabilirsiniz. Değişiklikler fatura döneminize göre yansıtılır.'
    },
    {
      question: 'Veri güvenliği nasıl sağlanıyor?',
      answer: 'Veri güvenliği en büyük önceliğimizdir. Supabase altyapısı, RLS, RBAC ve ek şifreleme katmanları ile verileriniz KVKK/GDPR uyumlu olarak korunur.'
    },
    {
      question: 'Ücretsiz deneme süresinde hangi özellikler mevcut?',
      answer: '14 günlük deneme süresince seçtiğiniz planın (Başlangıç, Gelişim veya Klinik) tüm özelliklerini belirtilen limitler dahilinde ücretsiz olarak kullanabilirsiniz. Kredi kartı gerekmez.'
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 transition-colors duration-300">
        {/* Hero Bölümü */}
        <section className="pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl"
              >
                Pratiğinize En Uygun <span className="text-primary-600 dark:text-primary-500">PsikoRan Planı</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400"
              >
                İster tek başınıza çalışın, ister büyüyen bir klinik yönetin, PsikoRan'ın esnek planları ile dijitalleşin. 14 gün ücretsiz deneyin!
              </motion.p>
              
              {/* Fatura Değiştirici */}
              <div className="mt-10 flex justify-center">
                <div className="relative bg-white dark:bg-slate-800 p-1 rounded-full flex shadow-inner">
                  <button
                    onClick={() => setAnnualBilling(false)}
                    className={`${!annualBilling ? 'bg-primary-500 text-white shadow-md' : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} relative w-32 rounded-full py-2.5 px-4 text-sm font-medium transition-all duration-300 focus:outline-none`}
                  >
                    Aylık Fatura
                  </button>
                  <button
                    onClick={() => setAnnualBilling(true)}
                    className={`${annualBilling ? 'bg-primary-500 text-white shadow-md' : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} relative w-32 rounded-full py-2.5 px-4 text-sm font-medium transition-all duration-300 focus:outline-none`}
                  >
                    Yıllık Fatura
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                      %20 Avantajlı
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fiyatlandırma Planları */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => (
              <motion.div 
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col rounded-3xl overflow-hidden border ${plan.popular ? 'border-primary-400 dark:border-primary-500 shadow-xl shadow-primary-100 dark:shadow-primary-900/20 scale-105 z-10' : 'border-slate-200 dark:border-slate-700 shadow-lg'} bg-white dark:bg-slate-800`}
              >
                {/* Plan Header */}
                <div className={`${plan.color} px-6 py-8 text-center ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.popular && (
                    <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-3 shadow">En Popüler</span>
                  )}
                  <h3 className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                  <p className={`mt-2 text-sm ${plan.popular ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>{plan.description}</p>
                  <div className="mt-5">
                    <span className="text-4xl font-bold">₺{annualBilling ? plan.annualPrice : plan.monthlyPrice}</span>
                    <span className={`text-sm ${plan.popular ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>/ay</span>
                  </div>
                  {annualBilling && (
                    <p className={`mt-1 text-xs ${plan.popular ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                      Yıllık faturalandırmada
                    </p>
                  )}
                </div>
                
                {/* Plan Features */}
                <div className="px-6 py-8 flex-grow flex flex-col">
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`ml-3 text-sm ${feature.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500 line-through'}`}>
                          {feature.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {/* CTA Link */} 
                  <div className="mt-auto">
                      <Link
                        to={plan.ctaLink}
                        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors duration-200 ${ 
                          plan.popular 
                          ? 'bg-white text-primary-600 hover:bg-slate-100 dark:bg-white dark:text-primary-600 dark:hover:bg-slate-200 shadow-md' 
                          : `bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-lg shadow-primary-500/30`
                        }`}
                      >
                        <span>{plan.cta}</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Comparison Table */} 
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Detaylı Özellik Karşılaştırması
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Hangi planın sizin için en uygun olduğunu keşfedin.
            </p>
          </motion.div>
          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-5 px-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sticky left-0 bg-white dark:bg-slate-800 z-10">Özellik</th>
                  <th className="py-5 px-6 text-center text-sm font-semibold text-slate-900 dark:text-white">Başlangıç</th>
                  <th className="py-5 px-6 text-center text-sm font-semibold text-primary-600 dark:text-primary-400">Gelişim</th>
                  <th className="py-5 px-6 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">Klinik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {[
                  { feature: 'Yönetici Hesabı', starter: '1', growth: '1', clinic: '1+' },
                  { feature: 'Profesyonel Hesap Limiti', starter: '1', growth: '3', clinic: '10' },
                  { feature: 'Aktif Danışan Limiti', starter: '25', growth: '100', clinic: 'Sınırsız' },
                  { feature: 'Randevu & Danışan Yönetimi', starter: true, growth: true, clinic: true },
                  { feature: 'Şifreli Seans Notları', starter: true, growth: true, clinic: true },
                  { feature: 'Online Test Erişimi', starter: 'Temel', growth: 'Tam Set', clinic: 'Tam Set' },
                  { feature: 'Güvenli Video Görüşme', starter: false, growth: true, clinic: true },
                  { feature: 'Analitik Dashboard', starter: 'Temel', growth: 'Gelişmiş', clinic: 'Özelleştirilebilir' },
                  { feature: 'Ödeme Takibi', starter: 'Temel', growth: 'Gelişmiş', clinic: 'Tam Finansal' },
                  { feature: 'Blog Yönetimi', starter: false, growth: false, clinic: true },
                  { feature: 'Klinik Ayarları Yönetimi', starter: false, growth: false, clinic: true },
                  { feature: 'Teknik Destek', starter: 'E-posta', growth: 'Öncelikli E-posta', clinic: 'Telefon + Öncelikli' },
                ].map((item, index) => {
                  const renderCellContent = (value: string | boolean | number) => {
                    if (typeof value === 'boolean') {
                      return value ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-slate-400 dark:text-slate-600 mx-auto" />;
                    }
                    return <>{value}</>;
                  };
                  return (
                    <tr key={index}>
                      <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300 font-medium sticky left-0 bg-white dark:bg-slate-800 z-10">{item.feature}</td>
                      <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">{renderCellContent(item.starter)}</td>
                      <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">{renderCellContent(item.growth)}</td>
                      <td className="py-4 px-6 text-center text-sm text-slate-700 dark:text-slate-300">{renderCellContent(item.clinic)}</td>
                    </tr>
                  );
                })}
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
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Aklınıza Takılanlar mı Var?</h2>
            <p className="text-slate-600 dark:text-slate-400">Fiyatlandırma ve abonelik süreciyle ilgili sıkça sorulan sorular ve cevapları.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-start">
                  <HelpCircle className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0 mt-1" /> {faq.question}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm pl-7">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section - Kurumsal/Özel Teklif için */} 
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-10 md:p-16 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/30 relative overflow-hidden">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               viewport={{ once: true }}
               className="relative z-10"
             >
                <div className="mx-auto bg-white dark:bg-slate-800 rounded-full h-16 w-16 flex items-center justify-center mb-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <Info className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
               <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl mb-6">Daha Fazla İhtiyacınız mı Var?</h2>
               <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">10'dan fazla profesyonel hesabı, özel entegrasyonlar veya API erişimi gibi ihtiyaçlarınız için Kurumsal çözümlerimiz hakkında bilgi alın.</p>
               <Link to="/iletisim" className="px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold text-center shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full lg:w-auto">
                 <span>Özel Teklif İçin İletişime Geç</span>
               </Link>
             </motion.div>
           </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default Pricing; 