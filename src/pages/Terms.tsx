import { LegalLayout } from '../components/LegalLayout';
import { FileText, Shield, Users, Clock, CreditCard, AlertTriangle, Scale, HelpCircle } from 'lucide-react';

export function Terms() {
  return (
    <LegalLayout 
      title="Kullanım Şartları" 
      description="PsikoRan platformunu kullanırken uymanız gereken kurallar ve şartlar"
    >
      <div className="space-y-12">
        {/* Giriş */}
        <section>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Bu kullanım şartları, PsikoRan platformunu kullanırken uymanız gereken kuralları ve karşılıklı hak ve yükümlülükleri belirler. 
            Platformu kullanarak bu şartları kabul etmiş sayılırsınız.
          </p>
        </section>

        {/* Hizmet Kullanım Şartları */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Hizmet Kullanım Şartları</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Platform kullanımında dikkat edilmesi gereken hususlar:</p>
                <ul>
                  <li>18 yaşından büyük olmanız gerekmektedir</li>
                  <li>Gerçek ve güncel bilgiler sağlamalısınız</li>
                  <li>Hesap güvenliğinizi korumalısınız</li>
                  <li>Platformu yasal amaçlar için kullanmalısınız</li>
                  <li>Diğer kullanıcıların haklarına saygı göstermelisiniz</li>
                  <li>Telif haklarına uymalısınız</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Profesyonel Sorumluluklar */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Profesyonel Sorumluluklar</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Ruh sağlığı profesyonelleri olarak sorumluluklarınız:</p>
                <ul>
                  <li>Mesleki yetkinlik belgelerinizi güncel tutmak</li>
                  <li>Etik kurallara uymak</li>
                  <li>Danışan gizliliğini korumak</li>
                  <li>Randevu ve seans kayıtlarını düzenli tutmak</li>
                  <li>Acil durum protokollerine uymak</li>
                  <li>Süpervizyon gerekliliklerini yerine getirmek</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Randevu ve İptal Politikası */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Randevu ve İptal Politikası</h2>
              <div className="prose prose-slate dark:prose-invert">
                <ul>
                  <li>Randevular en az 24 saat önceden iptal edilmelidir</li>
                  <li>Geç iptal veya gelmeme durumunda seans ücreti tahsil edilir</li>
                  <li>Acil durumlar için özel düzenlemeler yapılabilir</li>
                  <li>Online görüşmelerde teknik sorunlar için ek süre tanınır</li>
                  <li>Randevu saatine uyulması beklenir</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Ödeme Şartları */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ödeme Şartları</h2>
              <div className="prose prose-slate dark:prose-invert">
                <ul>
                  <li>Ödemeler güvenli ödeme sistemleri üzerinden yapılır</li>
                  <li>Seans ücretleri önceden belirlenmelidir</li>
                  <li>Faturalar otomatik olarak oluşturulur</li>
                  <li>İade koşulları hizmet tipine göre belirlenir</li>
                  <li>Ödeme bilgilerinin güvenliği garanti edilir</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Yasaklı Kullanımlar */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <AlertTriangle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Yasaklı Kullanımlar</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Aşağıdaki durumlar kesinlikle yasaktır:</p>
                <ul>
                  <li>Sahte kimlik veya yetkinlik bilgileri kullanmak</li>
                  <li>Platformu kötüye kullanmak veya manipüle etmek</li>
                  <li>Diğer kullanıcıları taciz veya tehdit etmek</li>
                  <li>Yasadışı içerik paylaşmak</li>
                  <li>Sistem güvenliğini tehlikeye atmak</li>
                  <li>Danışan verilerini izinsiz paylaşmak</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Fikri Mülkiyet */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Fikri Mülkiyet Hakları</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Platform üzerindeki tüm içerikler için:</p>
                <ul>
                  <li>Tüm haklar PsikoRan'a aittir</li>
                  <li>İzinsiz kullanım ve kopyalama yasaktır</li>
                  <li>Kullanıcı içerikleri için özel şartlar geçerlidir</li>
                  <li>Logo ve marka kullanımı izne tabidir</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Sorumluluk Sınırları */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Scale className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Sorumluluk Sınırları</h2>
              <div className="prose prose-slate dark:prose-invert">
                <ul>
                  <li>Platform teknik aksaklıklardan sorumlu değildir</li>
                  <li>Kullanıcılar arası anlaşmazlıklarda aracılık yapılmaz</li>
                  <li>Mücbir sebeplerden kaynaklanan kesintiler olabilir</li>
                  <li>Hizmet kalitesi garanti edilir ancak sonuçlar garanti edilmez</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Değişiklikler ve Güncellemeler */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <HelpCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Değişiklikler ve Güncellemeler</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>
                  Bu kullanım şartları periyodik olarak güncellenebilir. Önemli değişiklikler olması durumunda 
                  size bildirim yapılacaktır. Değişiklikler yayınlandıktan sonra platformu kullanmaya devam etmeniz, 
                  güncel şartları kabul ettiğiniz anlamına gelir.
                </p>
                <p className="mt-4">
                  Son güncelleme tarihi: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
} 