import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full max-w-md mx-auto p-6 flex flex-col justify-center">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-12">
          <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
            <img 
              src="/app-logo-sm.png" 
              alt="PsikoRan Logo" 
              className="h-7 w-7 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            PsikoRan
          </h2>
        </div>

        <Link
          to="/login"
          className="group mb-8 flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Giriş sayfasına dön</span>
        </Link>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Şifrenizi mi unuttunuz?
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          {!success ? (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-lg text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  'Şifre Sıfırlama Bağlantısı Gönder'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Şifre sıfırlama bağlantısı gönderildi
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Lütfen e-posta kutunuzu kontrol edin. Şifrenizi sıfırlamak için gönderdiğimiz bağlantıya tıklayın.
              </p>
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Giriş sayfasına dön
              </Link>
            </div>
          )}
        </div>

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
            &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
} 