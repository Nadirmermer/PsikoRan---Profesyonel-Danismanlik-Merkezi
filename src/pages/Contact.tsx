import { Mail, Phone, MapPin, Send, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../components/layout/MainLayout';

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
    <MainLayout>
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* İçerik Başlığı */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">İletişime Geçin</h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz. 
            En kısa sürede yanıt vermeye çalışacağız.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* İletişim Bilgileri */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">İletişim Bilgileri</h2>
              
            <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 dark:bg-primary-900/20">
                      <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">E-posta</h3>
                    <a href="mailto:destek@psikoran.com" className="text-base text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                      destek@psikoran.com
                    </a>
                </div>
              </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 dark:bg-primary-900/20">
                    <Phone className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Telefon</h3>
                    <a href="tel:+902121234567" className="text-base text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                      +90 (212) 123 45 67
                    </a>
                </div>
              </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 dark:bg-primary-900/20">
                      <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Adres</h3>
                    <p className="text-base text-slate-600 dark:text-slate-400">
                      Örnek Mahallesi, Teknoloji Caddesi, No: 123<br />
                      Kadıköy / İstanbul
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Çalışma Saatleri</h2>
              
              <div className="space-y-4">
                {WORKING_HOURS.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-50 dark:bg-primary-900/20">
                        <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">{item.days}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.hours}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p className="text-sm">Resmi tatil günlerinde kapalıyız.</p>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Bize Mesaj Gönderin</h2>
              
              {success ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-6 text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-800/50 mb-4">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Mesajınız İletildi</h3>
                  <p className="text-green-700 dark:text-green-400 mb-4">
                    Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Adınız Soyadınız
                  </label>
                  <input
                    type="text"
                        id="name"
                        name="name"
                    required
                    value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) => 
                      setFormData({
                        ...formData,
                        email: e.target.value.toLowerCase()
                      })
                    }
                    className="pl-12 w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="ornek@email.com"
                  />
                    </div>
                </div>

                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Konu
                  </label>
                  <select
                      id="topic"
                      name="topic"
                    required
                    value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="">Konu Seçin</option>
                      {CONTACT_TOPICS.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.label}
                        </option>
                    ))}
                  </select>
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Mesajınız
                  </label>
                  <textarea
                      id="message"
                      name="message"
                      rows={6}
                    required
                    value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Mesajınızı buraya yazın..."
                  />
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                  <input
                        id="acceptTerms"
                        name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                        onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="acceptTerms" className="font-medium text-slate-700 dark:text-slate-300">
                        Kişisel verilerimin işlenmesine izin veriyorum
                  </label>
                      <p className="text-xs text-slate-600 dark:text-slate-500 mt-6">
                        Form bilgileriniz sadece sizinle iletişim kurma amacıyla kullanılacaktır. 
                        <Link to="/gizlilik" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                          Gizlilik Politikamızı
                        </Link> inceleyebilirsiniz.
                      </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30 flex items-center space-x-2">
                      <div className="shrink-0">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p>{error}</p>
                    </div>
                  )}

                  <div>
                <button
                  type="submit"
                  disabled={loading}
                      className="w-full py-3 px-6 rounded-lg text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-300 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                          <Send className="h-5 w-5 mr-2" />
                          <span>Mesaj Gönder</span>
                    </>
                  )}
                </button>
                </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 