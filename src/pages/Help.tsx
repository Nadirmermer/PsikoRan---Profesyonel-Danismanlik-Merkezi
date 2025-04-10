import { MainLayout } from '../components/layout/MainLayout';
import { Search, HelpCircle, BookOpen, Zap, MessageCircle, Shield, Settings, Calendar, CreditCard, Users, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  icon: JSX.Element;
}

const CATEGORIES = [
  { id: 'getting-started', label: 'Başlangıç', icon: <Zap className="h-5 w-5" /> },
  { id: 'account', label: 'Hesap', icon: <Settings className="h-5 w-5" /> },
  { id: 'appointments', label: 'Randevular', icon: <Calendar className="h-5 w-5" /> },
  { id: 'payments', label: 'Ödemeler', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'clients', label: 'Danışanlar', icon: <Users className="h-5 w-5" /> },
  { id: 'security', label: 'Güvenlik', icon: <Shield className="h-5 w-5" /> },
];

const faqs: FAQItem[] = [
  // Başlangıç
  {
    question: "PsikoRan'ı nasıl kullanmaya başlayabilirim?",
    answer: "PsikoRan'ı kullanmaya başlamak için öncelikle bir asistan hesabı oluşturmanız gerekiyor. Kayıt olduktan sonra e-posta doğrulaması yaparak sistemi hemen kullanmaya başlayabilirsiniz.",
    category: "getting-started",
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    question: "Ücretsiz deneme süresi var mı?",
    answer: "Evet, tüm yeni kullanıcılar için 30 günlük ücretsiz deneme süresi sunuyoruz. Bu süre içinde tüm özellikleri test edebilirsiniz.",
    category: "getting-started",
    icon: <Zap className="h-5 w-5" />
  },

  // Hesap
  {
    question: "Şifremi nasıl değiştirebilirim?",
    answer: "Ayarlar > Güvenlik bölümünden şifrenizi güncelleyebilirsiniz. Şifrenizi unuttuysanız, giriş sayfasındaki 'Şifremi Unuttum' bağlantısını kullanabilirsiniz.",
    category: "account",
    icon: <Settings className="h-5 w-5" />
  },
  {
    question: "Hesabımı nasıl silebilirim?",
    answer: "Hesap silme işlemi için Ayarlar > Hesap bölümünden 'Hesabı Sil' seçeneğini kullanabilirsiniz. Hesap silinmeden önce tüm verilerinizi yedeklemenizi öneririz.",
    category: "account",
    icon: <Settings className="h-5 w-5" />
  },

  // Randevular
  {
    question: "Online görüşme nasıl yapılır?",
    answer: "Online görüşmeler için randevu oluştururken 'Online Görüşme' seçeneğini işaretlemeniz yeterlidir. Randevu saatinde size ve danışanınıza otomatik olarak görüşme bağlantısı gönderilecektir.",
    category: "appointments",
    icon: <Calendar className="h-5 w-5" />
  },
  {
    question: "Randevu hatırlatmaları nasıl çalışır?",
    answer: "Sistem, randevudan 24 saat ve 1 saat önce hem size hem de danışanınıza otomatik hatırlatma gönderir. Hatırlatma tercihlerinizi Ayarlar > Bildirimler bölümünden özelleştirebilirsiniz.",
    category: "appointments",
    icon: <Calendar className="h-5 w-5" />
  },

  // Ödemeler
  {
    question: "Hangi ödeme yöntemlerini destekliyorsunuz?",
    answer: "Kredi kartı, banka kartı ve havale/EFT ile ödeme kabul ediyoruz. İyzico altyapısı üzerinden güvenli ödeme işlemleri gerçekleştiriliyor.",
    category: "payments",
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    question: "Otomatik fatura oluşturma nasıl çalışır?",
    answer: "Her ödeme sonrası sistem otomatik olarak fatura oluşturur. Fatura bilgilerinizi Ayarlar > Fatura Bilgileri bölümünden düzenleyebilirsiniz.",
    category: "payments",
    icon: <CreditCard className="h-5 w-5" />
  },

  // Danışanlar
  {
    question: "Danışan bilgilerini nasıl güncelleyebilirim?",
    answer: "Danışanlar sayfasından ilgili danışanın profiline giderek bilgilerini güncelleyebilirsiniz. Tüm değişiklikler otomatik olarak kaydedilir.",
    category: "clients",
    icon: <Users className="h-5 w-5" />
  },
  {
    question: "Danışan notları nasıl tutulur?",
    answer: "Her danışanın profilinde 'Seans Notları' bölümü bulunur. Buradan görüşme notlarınızı güvenli bir şekilde kaydedebilir ve geçmiş notları görüntüleyebilirsiniz.",
    category: "clients",
    icon: <Users className="h-5 w-5" />
  },

  // Güvenlik
  {
    question: "Verilerimiz nasıl korunuyor?",
    answer: "Tüm veriler SSL şifreleme ile korunur ve düzenli olarak yedeklenir. Danışan bilgileri ve seans notları özel şifreleme algoritmaları ile saklanır.",
    category: "security",
    icon: <Shield className="h-5 w-5" />
  },
  {
    question: "İki faktörlü doğrulama nasıl etkinleştirilir?",
    answer: "Ayarlar > Güvenlik bölümünden iki faktörlü doğrulamayı etkinleştirebilirsiniz. SMS veya Google Authenticator ile doğrulama yapabilirsiniz.",
    category: "security",
    icon: <Shield className="h-5 w-5" />
  },
];

export function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Yardım Merkezi</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Sıkça sorulan sorular ve yardım dökümanları
          </p>
        </div>
        
        {/* Hero Bölümü */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 px-8 py-12 mb-12 rounded-lg">
          <div className="max-w-2xl mx-auto text-center">
            <HelpCircle className="h-12 w-12 text-white/90 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">
              Nasıl yardımcı olabiliriz?
            </h1>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Sorunuzu yazın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-0 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Kategori Filtreleri */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`p-4 rounded-lg border transition-all duration-200 flex items-center justify-center space-x-2
              ${!selectedCategory 
                ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-700 dark:text-primary-300' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
          >
            <span>Tümü</span>
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border transition-all duration-200 flex items-center justify-center space-x-2
                ${selectedCategory === category.id
                  ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-700 dark:text-primary-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* SSS Listesi */}
        <div className="space-y-6">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    {faq.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Sonuç Bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Aramanızla eşleşen bir sonuç bulamadık. Farklı bir arama terimi deneyebilir veya destek ekibimizle iletişime geçebilirsiniz.
              </p>
            </div>
          )}
        </div>

        {/* İletişim Yönlendirmesi */}
        <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Aradığınızı bulamadınız mı?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Destek ekibimiz size yardımcı olmaktan mutluluk duyacaktır.
          </p>
          <a
            href="/iletisim"
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            İletişime Geçin
          </a>
        </div>
      </div>
    </MainLayout>
  );
} 