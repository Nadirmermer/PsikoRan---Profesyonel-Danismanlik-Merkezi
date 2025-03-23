import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, HelpCircle, Info, X, ArrowRight } from 'lucide-react';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
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
    </div>
  );
}

export default Pricing; 