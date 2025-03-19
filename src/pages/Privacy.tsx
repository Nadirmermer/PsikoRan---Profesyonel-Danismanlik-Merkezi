import { LegalLayout } from '../components/LegalLayout';
import { Shield, Lock, Database, Eye, UserCheck, Bell, Server } from 'lucide-react';

export function Privacy() {
  return (
    <LegalLayout 
      title="Gizlilik Politikası" 
      description="PsikoRan'ın gizlilik politikası ve veri işleme prensipleri"
    >
      <div className="space-y-12">
        {/* Giriş */}
        <section>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            PsikoRan olarak, siz değerli kullanıcılarımızın gizliliğini korumak en önemli önceliklerimizden biridir. 
            Bu gizlilik politikası, verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
          </p>
        </section>

        {/* Veri Toplama ve Kullanım */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Database className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Veri Toplama ve Kullanım</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Aşağıdaki verileri topluyor ve işliyoruz:</p>
                <ul>
                  <li>
                    <strong>Hesap Bilgileri:</strong> Ad-soyad, e-posta adresi, telefon numarası ve profesyonel bilgiler
                  </li>
                  <li>
                    <strong>Danışan Verileri:</strong> Danışanlarınızın temel bilgileri ve seans notları
                  </li>
                  <li>
                    <strong>Randevu Bilgileri:</strong> Tarih, saat, randevu türü ve durum bilgileri
                  </li>
                  <li>
                    <strong>Ödeme Bilgileri:</strong> Fatura bilgileri ve ödeme geçmişi
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Veri Güvenliği */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Veri Güvenliği</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Verilerinizin güvenliği için aldığımız önlemler:</p>
                <ul>
                  <li>
                    <strong>Şifreleme:</strong> Tüm veriler endüstri standardı SSL/TLS protokolleri ile şifrelenir
                  </li>
                  <li>
                    <strong>Güvenli Depolama:</strong> Veriler güvenli sunucularda, şifrelenmiş formatta saklanır
                  </li>
                  <li>
                    <strong>Erişim Kontrolü:</strong> Verilerinize sadece yetkili personel, gerekli durumlarda erişebilir
                  </li>
                  <li>
                    <strong>Düzenli Denetim:</strong> Güvenlik sistemlerimiz düzenli olarak test edilir ve güncellenir
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Veri Paylaşımı */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <UserCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Veri Paylaşımı</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Verileriniz sadece aşağıdaki durumlarda paylaşılır:</p>
                <ul>
                  <li>Yasal zorunluluk durumlarında</li>
                  <li>Açık rızanız olması halinde</li>
                  <li>Hizmet sağlayıcılarımızla (ödeme sistemleri gibi)</li>
                </ul>
                <p>
                  <strong>Önemli Not:</strong> Danışan bilgileri ve seans notları hiçbir şekilde üçüncü taraflarla paylaşılmaz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Çerezler ve İzleme */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Eye className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Çerezler ve İzleme</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Platformumuzda kullanılan çerez türleri:</p>
                <ul>
                  <li>
                    <strong>Zorunlu Çerezler:</strong> Platformun temel işlevleri için gerekli
                  </li>
                  <li>
                    <strong>Tercih Çerezleri:</strong> Kullanıcı tercihlerini hatırlamak için
                  </li>
                  <li>
                    <strong>Analitik Çerezler:</strong> Hizmet kalitesini artırmak için kullanım verilerini toplar
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Veri Saklama */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Server className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Veri Saklama</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>Verilerinizi saklama politikamız:</p>
                <ul>
                  <li>Hesap aktif olduğu sürece temel bilgiler saklanır</li>
                  <li>Danışan kayıtları yasal süre boyunca muhafaza edilir</li>
                  <li>Ödeme bilgileri mali mevzuat gereklilikleri doğrultusunda saklanır</li>
                  <li>Hesap silindiğinde, yasal zorunluluklar dışındaki veriler silinir</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Haklarınız */}
        <section className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Lock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Haklarınız</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>KVKK kapsamında sahip olduğunuz haklar:</p>
                <ul>
                  <li>Verilerinize erişim ve düzeltme hakkı</li>
                  <li>Verilerinizin silinmesini talep etme hakkı</li>
                  <li>Veri işlemeye itiraz etme hakkı</li>
                  <li>Veri taşınabilirliği hakkı</li>
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Politika Güncellemeleri</h2>
              <div className="prose prose-slate dark:prose-invert">
                <p>
                  Bu gizlilik politikası periyodik olarak güncellenebilir. Önemli değişiklikler olması durumunda 
                  size bildirim göndereceğiz. Politikanın son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
} 