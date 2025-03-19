import { LegalLayout } from '../components/LegalLayout';
import { Shield, Users, Database, Lock, Eye, FileText, Scale, Bell } from 'lucide-react';

export function KVKK() {
  return (
    <LegalLayout 
      title="KVKK Aydınlatma Metni" 
      description="6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni"
    >
      <div className="space-y-12">
        {/* Giriş */}
        <section>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            PsikoRan olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla, 
            kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında hukuka ve dürüstlük kurallarına uygun bir şekilde işleyebilir, 
            kaydedebilir, saklayabilir, sınıflandırabilir, güncelleyebilir ve mevzuatın izin verdiği hallerde üçüncü kişilere açıklayabiliriz.
          </p>
        </section>

        {/* Veri Sorumlusu */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Veri Sorumlusu</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>
                  PsikoRan platformu olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca veri sorumlusu sıfatıyla 
                  kişisel verilerinizi işlemekteyiz. Platform üzerinden sunduğumuz hizmetler kapsamında, kullanıcılarımızın ve 
                  danışanların kişisel verilerinin güvenliği bizim için önceliklidir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Kişisel Verilerin İşlenme Amaçları */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Database className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Kişisel Verilerin İşlenme Amaçları</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <ul>
                  <li>Platform üzerinden sunulan hizmetlerin yürütülmesi</li>
                  <li>Randevu ve görüşme kayıtlarının tutulması</li>
                  <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Hizmet kalitesinin artırılması</li>
                  <li>Kullanıcı deneyiminin iyileştirilmesi</li>
                  <li>Güvenlik ve dolandırıcılığın önlenmesi</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* İşlenen Kişisel Veriler */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">İşlenen Kişisel Veriler</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Platform kapsamında işlenen kişisel veriler:</p>
                <ul>
                  <li>
                    <strong>Kimlik Bilgileri:</strong> Ad-soyad, T.C. kimlik numarası, doğum tarihi
                  </li>
                  <li>
                    <strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres
                  </li>
                  <li>
                    <strong>Profesyonel Bilgiler:</strong> Meslek, uzmanlık alanları, eğitim bilgileri
                  </li>
                  <li>
                    <strong>Finansal Bilgiler:</strong> Banka hesap bilgileri, fatura bilgileri
                  </li>
                  <li>
                    <strong>Sağlık Bilgileri:</strong> Danışan notları, sağlık geçmişi (sadece yetkili sağlık personeli tarafından işlenir)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Kişisel Verilerin Aktarılması */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Kişisel Verilerin Aktarılması</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Kişisel verileriniz, aşağıdaki durumlarda üçüncü kişilerle paylaşılabilir:</p>
                <ul>
                  <li>Yasal zorunluluklar kapsamında yetkili kamu kurum ve kuruluşlarıyla</li>
                  <li>Ödeme işlemleri için finans kuruluşlarıyla</li>
                  <li>Hizmet sağlayıcılarımızla (teknik altyapı, güvenlik vb.)</li>
                  <li>Açık rızanızın bulunması halinde diğer üçüncü kişilerle</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Kişisel Verilerin Korunması */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Lock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Kişisel Verilerin Korunması</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Kişisel verilerinizin güvenliği için alınan önlemler:</p>
                <ul>
                  <li>SSL/TLS şifreleme protokolleri</li>
                  <li>Güvenli veri depolama sistemleri</li>
                  <li>Erişim kontrolleri ve yetkilendirme</li>
                  <li>Düzenli güvenlik denetimleri</li>
                  <li>Personel gizlilik sözleşmeleri</li>
                  <li>Fiziksel güvenlik önlemleri</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* İlgili Kişi Hakları */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Scale className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">İlgili Kişi Hakları</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>KVKK'nın 11. maddesi uyarınca sahip olduğunuz haklar:</p>
                <ul>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                  <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                  <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                  <li>KVKK ve ilgili diğer kanun hükümlerine uygun olarak işlenmiş olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan kalkması hâlinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                </ul>
                <p>
                  Bu haklarınızı kullanmak için{' '}
                  <a href="/contact" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                    bizimle iletişime geçebilirsiniz
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Güncellemeler */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Bell className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Aydınlatma Metni Güncellemeleri</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>
                  Bu aydınlatma metni, yasal düzenlemeler ve şirket politikalarındaki değişiklikler doğrultusunda güncellenebilir. 
                  Önemli değişiklikler olması durumunda size bildirim yapılacaktır. 
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