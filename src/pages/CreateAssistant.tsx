import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Lock, Phone, Building, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { MainLayout } from '../components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    clinicName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    document.title = "Asistan Hesabı Oluştur - PsikoRan";
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Önce e-posta ile kullanıcı var mı kontrol et
      const { data: existingUsers } = await supabase
          .from('assistants')
          .select('id')
        .eq('email', formData.email);

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.');
      }

      // Yeni kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Kullanıcı oluşturulamadı.');

      // Asistan bilgilerini kaydet
      const { data: assistantData, error: assistantError } = await supabase
        .from('assistants')
        .insert([
          {
            user_id: authData.user.id,
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            clinic_name: formData.clinicName,
          },
        ])
        .select();

      if (assistantError) throw assistantError;
      if (!assistantData || assistantData.length === 0) throw new Error('Asistan bilgileri kaydedilemedi.');

      // Klinik bilgilerini kaydet
      const { error: clinicError } = await supabase.from('clinic_settings').insert([
        {
          assistant_id: assistantData[0].id,
        },
      ]);

      if (clinicError) throw clinicError;

      // --- YENİ: Otomatik 14 Günlük Deneme Aboneliği Oluştur --- 
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 gün ekle

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
            assistant_id: assistantData[0].id, // Yeni oluşturulan asistan ID
            user_id: authData.user.id, // Tekrar eklendi (DB ve RLS güncellendi)
            plan_type: 'growth', // Varsayılan deneme planı
            status: 'trial',
            billing_cycle: 'monthly', // Deneme için varsayılan döngü
            start_date: new Date().toISOString(),
            trial_end: trialEndDate.toISOString(),
            current_period_end: trialEndDate.toISOString(), // Deneme sonu aynı zamanda ilk dönem sonu
            payment_method: null // Deneme süresince ödeme yöntemi yok
        });

        if (subscriptionError) {
            console.error('Deneme aboneliği oluşturulurken KRİTİK hata:', subscriptionError);
            throw new Error(`Deneme aboneliği oluşturulamadı: ${subscriptionError.message}`);
        }
        // --- Deneme Aboneliği Oluşturma Sonu ---

      // Başarılı kayıt sonrası modalı göster
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Başarı modalının kapatılması
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <MainLayout>
      <div className="w-full max-w-md mx-auto py-16">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Link to="/" className="flex items-center space-x-3">
            <Logo size="medium" />
          </Link>
        </div>

        {/* Geri Dönme Butonu */}
        <Link
          to="/login"
          className="group mb-6 flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Giriş sayfasına dön</span>
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Asistan Hesabı Oluştur
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Psikoterapist asistanları için hızlı ve kolay kayıt
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Ad Soyad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                E-posta adresi
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-hover:text-primary-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      email: e.target.value.toLowerCase()
                    })
                  }
                  className="pl-12 w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Şifre
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-hover:text-primary-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-12 pr-12 w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                En az 8 karakter, bir büyük harf ve bir rakam içermelidir
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Telefon
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400 group-hover:text-primary-500" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-12 w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="+90 (___) ___ __ __"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Klinik / Ofis Adı
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-slate-400 group-hover:text-primary-500" />
                </div>
                <input
                  type="text"
                  name="clinicName"
                  required
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="pl-12 w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Klinik veya Ofis Adı"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30 flex items-center space-x-2">
                <div className="shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-300 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  <span>Hesap Oluştur</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-4 text-sm mb-2">
            <Link to="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Ana Sayfa
            </Link>
            <Link to="/privacy" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Gizlilik
            </Link>
            <Link to="/terms" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Kullanım Şartları
            </Link>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* Başarı Popup/Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-auto border border-slate-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Hesabınız Başarıyla Oluşturuldu
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayarak hesabınızı aktifleştirin.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Not:</span> Doğrulama e-postası birkaç dakika içinde gelecektir. Spam klasörünüzü de kontrol etmeyi unutmayın.
                  </p>
                </div>
                
                <button
                  onClick={handleCloseModal}
                  className="w-full py-3 px-6 rounded-lg text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Giriş Sayfasına Git
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

// Geriye dönük uyumluluk için orijinal ismi de export edelim
export const CreateAssistant = Register;