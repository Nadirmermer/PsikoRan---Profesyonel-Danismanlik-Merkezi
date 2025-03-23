import { MainLayout } from '../components/layout/MainLayout';
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
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">KVKK Aydınlatma Metni</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni
          </p>
        </div>
        
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
                  <p>Kişisel verilerinizin korunması için aldığımız teknik ve idari tedbirler:</p>
                  <ul>
                    <li>SSL şifreleme ve güvenli veri iletimi</li>
                    <li>Düzenli güvenlik denetimleri ve penetrasyon testleri</li>
                    <li>Veri erişim kontrolü ve yetkilendirme sistemi</li>
                    <li>Güvenlik duvarı ve anti-virüs sistemleri</li>
                    <li>Düzenli yedekleme ve felaket kurtarma protokolleri</li>
                    <li>Veri ihlallerine karşı acil müdahale planları</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Kişisel Verilere İlişkin Haklarınız */}
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Kişisel Verilere İlişkin Haklarınız</h2>
                <div className="prose prose-slate dark:prose-invert">
                  <p>KVKK'nın 11. maddesi uyarınca, veri sahibi olarak aşağıdaki haklara sahipsiniz:</p>
                  <ul>
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                    <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>Yurt içinde/yurt dışında aktarıldığı 3. kişileri bilme</li>
                    <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
                    <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme</li>
                    <li>Aktarıldığı 3. kişilere yukarıda sayılan işlemlerin bildirilmesini isteme</li>
                    <li>Münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                    <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Politika Güncellemeleri */}
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Politika Güncellemeleri</h2>
                <div className="prose prose-slate dark:prose-invert">
                  <p>
                    İşbu aydınlatma metni, yasal değişiklikler, hizmet kapsamımızdaki değişiklikler veya veri işleme politikalarımızdaki güncellemeler 
                    nedeniyle periyodik olarak güncellenebilir. Önemli değişiklikler yapılması durumunda, platformumuz üzerinden veya e-posta yoluyla 
                    bilgilendirme yapılacaktır.
                  </p>
                  <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm font-medium">
                      Son güncelleme tarihi: {lastUpdated}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* İletişim */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
            className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg"
          >
            <h2 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-4">İletişim</h2>
            <p className="text-primary-800 dark:text-primary-200">
              Bu aydınlatma metni kapsamında iletmek istediğiniz talepler veya sorularınız için aşağıdaki iletişim kanallarını kullanabilirsiniz:
            </p>
            <ul className="mt-4 space-y-2 text-primary-700 dark:text-primary-300">
              <li>E-posta: kvkk@psikoran.com</li>
              <li>Telefon: +90 212 123 45 67</li>
              <li>Adres: Örnek Mah. Teknoloji Cad. No:123, 34000 Kadıköy/İstanbul</li>
            </ul>
          </motion.section>
        </motion.div>
      </div>
    </MainLayout>
  );
} 