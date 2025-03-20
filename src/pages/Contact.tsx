import { LegalLayout } from '../components/LegalLayout';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

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
    <LegalLayout
      title="İletişim"
      description="Size nasıl yardımcı olabiliriz?"
    >
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
                    destek@PsikoRan.com
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
        <div>
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Adınız Soyadınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Konu
                </label>
                <select
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Seçiniz</option>
                  {CONTACT_TOPICS.map(topic => (
                    <option key={topic.id} value={topic.id}>{topic.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mesajınız
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                  Gizlilik politikasını okudum ve kabul ediyorum.
                </label>
              </div>

              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                  {error}
                </div>
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
            </form>
          ) : (
            <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Mesajınız İletildi
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                En kısa sürede size dönüş yapacağız.
              </p>
            </div>
          )}
        </div>
      </div>
    </LegalLayout>
  );
} 