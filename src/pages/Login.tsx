import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Brain, LogIn, Sun, Moon, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode]);

  useEffect(() => {
    // Çerez onayı daha önce verilmiş mi kontrol et
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowCookieBanner(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.signIn(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Giriş başarısız. E-posta ve şifrenizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'false');
    setShowCookieBanner(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sol Panel */}
      <div className="hidden lg:flex w-1/2 p-16 items-center justify-center bg-white dark:bg-slate-800 relative">
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="flex items-center space-x-4 mb-16">
            <div className="h-16 w-16 flex items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white">
              PsiRan
            </h2>
          </div>
          
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Profesyonel<br />
              <span className="text-primary-600 dark:text-primary-400">Danışmanlık Merkezi</span>
            </h1>
            <div className="space-y-6 text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Danışanlarınızla olan tüm süreçlerinizi tek platformda yönetin.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Online/Yüz yüze randevu yönetimi</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Güvenli ödeme takibi</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Danışan kayıtları ve notlar</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-16">
            <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">%99.9</div>
              <div className="text-slate-600 dark:text-slate-300">Hizmet Sürekliliği</div>
            </div>
            <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">7/24</div>
              <div className="text-slate-600 dark:text-slate-300">Teknik Destek</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobil Logo */}
          <div className="flex lg:hidden items-center justify-center space-x-3 mb-12">
            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              PsiRan
            </h2>
          </div>

          {/* Tema Değiştirme */}
          <div className="absolute top-6 right-6">
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 group border border-slate-200 dark:border-slate-700"
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon className="h-6 w-6 text-primary-600 group-hover:rotate-90 transition-transform duration-300" />
              )}
            </button>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white">
              Hoş Geldiniz
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Hesabınıza güvenli giriş yapın
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
              </div>

              {/* Beni Hatırla ve Şifremi Unuttum */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    Beni hatırla
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Şifremi unuttum
                </Link>
              </div>

              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30 flex items-center space-x-2">
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
                className="w-full py-3 px-6 rounded-lg text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Giriş Yap</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    veya
                  </span>
                </div>
              </div>

              <Link
                to="/create-assistant"
                className="w-full flex items-center justify-center py-3 px-6 border border-slate-200 dark:border-slate-700 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-600/50 transition-all duration-300 group"
              >
                <span>Asistan Hesabı Oluştur</span>
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              {/* Gizlilik ve Kullanım Şartları */}
              <div className="mt-6 text-center text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  Giriş yaparak{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    Gizlilik Politikası
                  </Link>
                  {', '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    Kullanım Şartları
                  </Link>
                  {' ve '}
                  <Link to="/kvkk" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    KVKK Aydınlatma Metni
                  </Link>
                  'ni kabul etmiş olursunuz.
                </p>
              </div>

              {/* Çerez Banner'ı */}
              {showCookieBanner && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                          <svg 
                            className="w-6 h-6 text-primary-600 dark:text-primary-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          Bu web sitesi, size daha iyi bir deneyim sunmak için çerezleri kullanmaktadır.{' '}
                          <Link to="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                            Gizlilik Politikamız
                          </Link>
                          'ı inceleyebilirsiniz.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={declineCookies}
                          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                        >
                          Reddet
                        </button>
                        <button
                          onClick={acceptCookies}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg transition-colors duration-200"
                        >
                          Kabul Et
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Yardım ve İletişim */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex justify-center space-x-4 text-sm">
              <Link to="/contact" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                İletişim
              </Link>
              <Link to="/help" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Yardım Merkezi
              </Link>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} PsiRan. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}