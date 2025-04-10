import { MainLayout } from '../components/layout/MainLayout';
import { FileText, Shield, Users, Clock, CreditCard, AlertTriangle, Scale, HelpCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function Terms() {
  // Açılır-kapanır bölümler için state
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Bölümü açıp kapatan fonksiyon
  const toggleSection = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  // Animasyon varyantları
  const sectionVariants = {
    collapsed: { opacity: 0, height: 0, overflow: 'hidden' },
    expanded: { opacity: 1, height: 'auto', overflow: 'visible' }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kullanım Şartları</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            PsikoRan platformunu kullanırken uymanız gereken kurallar ve şartlar
          </p>
        </div>
        
        <div className="space-y-12">
          {/* Giriş */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border-l-4 border-primary-500 dark:border-primary-400">
              <p className="text-lg text-slate-700 dark:text-slate-300">
                Bu kullanım şartları, PsikoRan platformunu kullanırken uymanız gereken kuralları ve karşılıklı hak ve yükümlülükleri belirler. 
                Platformu kullanarak bu şartları kabul etmiş sayılırsınız.
              </p>
              <div className="mt-8 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-300 dark:border-slate-700 pt-4">
                <p>
                  Son güncelleme: 10 Nisan 2025
                </p>
              </div>
            </div>
          </motion.section>

          {/* Hizmet Kullanım Şartları */}
          <motion.section 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div 
              className={`flex items-start space-x-4 p-5 rounded-lg cursor-pointer transition-all ${
                expandedSection === 'usage' 
                  ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
              onClick={() => toggleSection('usage')}
            >
              <div className="flex-shrink-0 mt-1">
                <FileText className={`h-6 w-6 ${expandedSection === 'usage' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`} />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hizmet Kullanım Şartları</h2>
                  {expandedSection === 'usage' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Platform kullanımında dikkat edilmesi gereken hususlar</p>
              </div>
            </div>
            
            <motion.div
              variants={sectionVariants}
              initial="collapsed"
              animate={expandedSection === 'usage' ? 'expanded' : 'collapsed'}
              transition={{ duration: 0.3 }}
            >
              <div className="prose prose-slate dark:prose-invert mt-2 p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p>Platform kullanımında dikkat edilmesi gereken hususlar:</p>
                <ul>
                  <li><strong>Yaş Sınırı:</strong> 18 yaşından büyük olmanız gerekmektedir. Yaşınız tutmuyorsa ebeveyn gözetiminde kullanabilirsiniz.</li>
                  <li><strong>Doğru Bilgi:</strong> Gerçek ve güncel bilgiler sağlamalısınız. Yanlış bilgi vermek hesabınızın kapatılmasına neden olabilir.</li>
                  <li><strong>Hesap Güvenliği:</strong> Hesap güvenliğinizi korumalısınız. Şifrenizi düzenli olarak değiştirin ve kimseyle paylaşmayın.</li>
                  <li><strong>Yasal Kullanım:</strong> Platformu yasal amaçlar için kullanmalısınız. Yasadışı faaliyetler için kullanım hesabınızın kapatılmasına ve yasal işlemlere neden olabilir.</li>
                  <li><strong>Saygılı Davranış:</strong> Diğer kullanıcıların haklarına saygı göstermelisiniz. Taciz, tehdit veya kötü niyetli davranışlar yasaktır.</li>
                  <li><strong>Telif Hakları:</strong> Telif haklarına uymalısınız. İzinsiz içerik paylaşımı yapmayınız.</li>
                  <li><strong>Ticari Kullanım:</strong> Platform, klinik ve danışmanlık hizmetleri yönetimi için tasarlanmıştır ve bu amaçla kullanılmalıdır.</li>
                </ul>
              </div>
            </motion.div>
          </motion.section>

          {/* Profesyonel Sorumluluklar */}
          <motion.section 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div 
              className={`flex items-start space-x-4 p-5 rounded-lg cursor-pointer transition-all ${
                expandedSection === 'professional' 
                  ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
              onClick={() => toggleSection('professional')}
            >
              <div className="flex-shrink-0 mt-1">
                <Users className={`h-6 w-6 ${expandedSection === 'professional' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`} />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profesyonel Sorumluluklar</h2>
                  {expandedSection === 'professional' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Ruh sağlığı profesyonelleri için etik ve yasal sorumluluklar</p>
              </div>
            </div>
            
            <motion.div
              variants={sectionVariants}
              initial="collapsed"
              animate={expandedSection === 'professional' ? 'expanded' : 'collapsed'}
              transition={{ duration: 0.3 }}
            >
              <div className="prose prose-slate dark:prose-invert mt-2 p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p>Ruh sağlığı profesyonelleri olarak sorumluluklarınız:</p>
                <ul>
                  <li><strong>Mesleki Yetkinlik:</strong> Mesleki yetkinlik belgelerinizi güncel tutmak ve sisteme doğru şekilde yüklemek zorunludur.</li>
                  <li><strong>Etik Kurallar:</strong> Türk Psikoterapistlar Derneği ve diğer meslek birliklerince belirlenen etik kurallara uymak zorundasınız.</li>
                  <li><strong>Gizlilik:</strong> Danışan gizliliğini korumak yasal ve etik bir zorunluluktur. Danışan bilgilerini izinsiz paylaşmayınız.</li>
                  <li><strong>Kayıt Tutma:</strong> Randevu ve seans kayıtlarını düzenli tutmak ve yasal saklama sürelerine uygun şekilde muhafaza etmek zorundasınız.</li>
                  <li><strong>Acil Durum Protokolleri:</strong> Acil durum protokollerine uymak ve gerektiğinde müdahale etmek için hazırlıklı olmalısınız.</li>
                  <li><strong>Süpervizyon:</strong> Gerekli durumlarda süpervizyon almak ve mesleki gelişiminizi sürdürmek önemlidir.</li>
                  <li><strong>Bilgilendirme Yükümlülüğü:</strong> Danışanlarınızı tedavi süreci, mali yükümlülükler ve gizlilik sınırları konusunda açıkça bilgilendirmelisiniz.</li>
                  <li><strong>Kişisel Sınırlar:</strong> Danışanlarla profesyonel ilişki sınırlarını korumak zorundasınız.</li>
                </ul>
              </div>
            </motion.div>
          </motion.section>

          {/* Randevu ve İptal Politikası */}
          <motion.section 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div 
              className={`flex items-start space-x-4 p-5 rounded-lg cursor-pointer transition-all ${
                expandedSection === 'appointments' 
                  ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
              onClick={() => toggleSection('appointments')}
            >
              <div className="flex-shrink-0 mt-1">
                <Clock className={`h-6 w-6 ${expandedSection === 'appointments' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`} />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Randevu ve İptal Politikası</h2>
                  {expandedSection === 'appointments' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Randevu oluşturma, iptal ve değişiklik kuralları</p>
              </div>
            </div>
            
            <motion.div
              variants={sectionVariants}
              initial="collapsed"
              animate={expandedSection === 'appointments' ? 'expanded' : 'collapsed'}
              transition={{ duration: 0.3 }}
            >
              <div className="prose prose-slate dark:prose-invert mt-2 p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <ul>
                  <li><strong>İptal Süresi:</strong> Randevular en az 24 saat önceden iptal edilmelidir. Bu süre içinde yapılmayan iptaller için ücret tahsil edilebilir.</li>
                  <li><strong>Randevu Kaçırma:</strong> Geç iptal veya gelmeme durumunda seans ücreti tahsil edilir. Bu politikayı danışanlarınıza açıkça bildirmelisiniz.</li>
                  <li><strong>Acil Durumlar:</strong> Acil durumlar için özel düzenlemeler yapılabilir. Acil durum tanımı net olarak belirlenmeli ve kayıt altına alınmalıdır.</li>
                  <li><strong>Teknik Sorunlar:</strong> Online görüşmelerde teknik sorunlar için ek süre tanınır. Teknik sorunların çözümü için ek destek sunulabilir.</li>
                  <li><strong>Randevu Süresi:</strong> Randevu saatine uyulması beklenir. Geç kalan danışanlar için seans süresi uzatılmayabilir.</li>
                  <li><strong>Yeniden Planlama:</strong> Randevu değişiklikleri için belirli bir sayı ve süre sınırlaması getirilebilir.</li>
                  <li><strong>İptal Bildirimleri:</strong> İptal bildirimleri yazılı olarak (sistem üzerinden) yapılmalıdır.</li>
                </ul>
              </div>
            </motion.div>
          </motion.section>

          {/* Güncellenen Son Bölüm */}
          <motion.section 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-start space-x-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex-shrink-0 mt-1">
                <RefreshCw className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Değişiklikler ve Güncellemeler</h2>
                <div className="prose prose-slate dark:prose-invert">
                  <p>
                    Bu kullanım şartları periyodik olarak güncellenebilir. Önemli değişiklikler olması durumunda 
                    size bildirim yapılacaktır. Değişiklikler yayınlandıktan sonra platformu kullanmaya devam etmeniz, 
                    güncel şartları kabul ettiğiniz anlamına gelir.
                  </p>
                  <p className="font-medium">
                    Kullanım şartlarının eski versiyonlarına erişmek için lütfen <a href="/kosullar/arsiv" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">arşiv sayfasını</a> ziyaret edin.
                  </p>
                  <p className="mt-4 text-sm font-semibold">
                    Son güncelleme tarihi: {new Date().toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </MainLayout>
  );
} 