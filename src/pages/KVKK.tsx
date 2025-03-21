import { LegalLayout } from '../components/LegalLayout';
import { Shield, Users, Database, Lock, Eye, FileText, Scale, Bell, Cookie, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function KVKK() {
  const [lastUpdated] = useState("01.12.2023");

  useEffect(() => {
    document.title = "KVKK Aydınlatma Metni - PsikoRan";
    // Sayfa yüklenirken en üste scroll
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout 
      title="KVKK Aydınlatma Metni" 
      description="6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
        {/* Giriş */}
        <section>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            PsikoRan olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla, 
            kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında hukuka ve dürüstlük kurallarına uygun bir şekilde işleyebilir, 
            kaydedebilir, saklayabilir, sınıflandırabilir, güncelleyebilir ve mevzuatın izin verdiği hallerde üçüncü kişilere açıklayabiliriz.
          </p>
        </section>

        {/* Veri Sorumlusu */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
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
        </motion.section>

        {/* Kişisel Verilerin İşlenme Amaçları */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
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
                  <li>İstatistiksel analizlerin yapılması</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* İşlenen Kişisel Veriler */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
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
        </motion.section>

        {/* Çerezler ve Kullanımı - Yeni Bölüm */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Cookie className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Çerezler ve Kullanımı</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>
                  PsikoRan platformu, hizmet kalitesini artırmak ve kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır. 
                  Çerezler, web sitemizi ziyaret ettiğinizde cihazınıza (bilgisayar, tablet veya telefon) indirilen küçük metin dosyalarıdır.
                </p>
                
                <h3 className="text-xl font-semibold mt-5 mb-3">Kullandığımız Çerez Türleri</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mt-1">
                        <span className="text-primary-700 dark:text-primary-300 text-xs font-bold">1</span>
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Zorunlu Çerezler:</strong> 
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Bu çerezler platformumuzun düzgün çalışması için gereklidir. Bunlar olmadan oturum açma, form doldurma gibi temel işlevler kullanılamaz.
                          Sağladıkları işlevler: Oturum yönetimi, güvenlik, form bilgilerinin korunması.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mt-1">
                        <span className="text-primary-700 dark:text-primary-300 text-xs font-bold">2</span>
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Tercih Çerezleri:</strong> 
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Bu çerezler, dil tercihleriniz, tema ayarlarınız (karanlık/aydınlık mod) gibi kullanıcı tercihlerinizi hatırlamak için kullanılır.
                          Sağladıkları işlevler: Tema ve görünüm ayarları, dil tercihleri, geçmiş görüntüleme kayıtları.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mt-1">
                        <span className="text-primary-700 dark:text-primary-300 text-xs font-bold">3</span>
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Analitik Çerezler:</strong> 
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Bu çerezler, platformumuzu nasıl kullandığınız hakkında bilgi toplar ve hizmetlerimizi iyileştirmemize yardımcı olur.
                          Toplanan veriler: Ziyaret edilen sayfalar, platformda geçirilen süre, tıklanan bağlantılar, karşılaşılan hatalar.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold mt-5 mb-3">Çerez Kullanım Süresi</h3>
                <p>Kullandığımız çerezler, kullanım sürelerine göre iki kategoriye ayrılır:</p>
                <ul>
                  <li>
                    <strong>Oturum Çerezleri:</strong> Tarayıcınızı kapattığınızda otomatik olarak silinen geçici çerezlerdir.
                  </li>
                  <li>
                    <strong>Kalıcı Çerezler:</strong> Tarayıcınızı kapattıktan sonra da cihazınızda kalan ve belirlenen süre boyunca (1 gün ila 2 yıl arası) geçerli olan çerezlerdir.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mt-5 mb-3">Çerez Yönetimi</h3>
                <p>
                  Çerez tercihlerinizi istediğiniz zaman platformumuzun alt kısmında bulunan "Çerez Ayarları" bağlantısı aracılığıyla değiştirebilirsiniz. 
                  Ayrıca, tarayıcı ayarlarınızı değiştirerek de çerezleri kontrol edebilirsiniz. Çerezleri tamamen devre dışı bırakmak platformumuzun bazı özelliklerinin düzgün çalışmamasına neden olabilir.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30 mt-4 flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Platformumuzu kullanmaya devam ederek çerez kullanımını kabul etmiş sayılırsınız. 
                    Dilediğiniz zaman çerez tercihlerinizi güncelleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Kişisel Verilerin Aktarılması */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
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
        </motion.section>

        {/* Kişisel Verilerin Korunması */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
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
        </motion.section>

        {/* İlgili Kişi Hakları */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="space-y-6"
        >
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
        </motion.section>

        {/* Güncellemeler */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="space-y-6"
        >
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
                  Son güncelleme tarihi: {lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </LegalLayout>
  );
} 