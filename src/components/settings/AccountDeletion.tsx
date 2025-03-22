import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';

export function AccountDeletion() {
  const { user, professional, assistant, signOut } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Önce giriş yapmanız gerekiyor.');
      return;
    }
    
    if (!password) {
      setError('Lütfen devam etmek için şifrenizi girin.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Şifreyi doğrulayın
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password,
      });
      
      if (signInError) {
        throw new Error('Şifre doğrulaması başarısız: ' + signInError.message);
      }
      
      // Kullanıcı tipine göre verileri silin
      if (professional) {
        // Profesyonel kullanıcının verilerini silin
        const { error: deleteError } = await supabase
          .from('professionals')
          .delete()
          .eq('id', professional.id);
          
        if (deleteError) throw new Error('Profesyonel verileri silinemedi: ' + deleteError.message);
      } else if (assistant) {
        // Asistan kullanıcının verilerini silin
        const { error: deleteError } = await supabase
          .from('assistants')
          .delete()
          .eq('id', assistant.id);
          
        if (deleteError) throw new Error('Asistan verileri silinemedi: ' + deleteError.message);
      }
      
      // Auth kullanıcısını silin
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
        user.id
      );
      
      if (authDeleteError) throw new Error('Kullanıcı hesabı silinemedi: ' + authDeleteError.message);
      
      // Çıkış yapın ve ana sayfaya yönlendirin
      await signOut();
      navigate('/');
      
    } catch (err: any) {
      console.error('Hesap silme hatası:', err);
      setError(err.message || 'Hesabınız silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-500" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Hesap Silme</h3>
      </div>
      
      {!showConfirmation ? (
        <div>
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Bu işlem geri alınamaz
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>
                    Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz ve verilerinizi kurtaramazsınız.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowConfirmation(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Hesabımı Sil
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDeleteAccount}>
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Bu işlemi onaylamak üzeresiniz
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>
                    Bu işlemi tamamlamak için lütfen şifrenizi girin. Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Şifreniz
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  İşlem yapılıyor...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Hesabımı Kalıcı Olarak Sil
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 