import React, { useState, useEffect } from 'react';
import { User, Save, Edit2, Key, Lock, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { Professional, Assistant } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface UserData {
  full_name: string;
  email: string;
  phone: string;
  title?: string;
  specialization?: string;
  bio?: string;
}

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Yeni şifreler eşleşmiyor');
      }

      // Şifre değiştirme API çağrısı
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
      // 2 saniye sonra modalı kapat
      setTimeout(() => {
        onClose();
        // Form alanlarını temizle
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Şifre değiştirme hatası:', err);
      setError(err.message || 'Şifre değiştirme sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
            <Lock className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
            Şifre Değiştir
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md">
              Şifreniz başarıyla değiştirildi!
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mevcut Şifre
              </label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Yeni Şifre
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
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
                'Şifreyi Değiştir'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PersonalInfo() {
  const { user, professional, assistant } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    full_name: '',
    email: '',
    phone: '',
    title: '',
    specialization: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Kullanıcı tipine göre doğru tablodan veri çekme
      if (professional) {
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professional.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserData({
            full_name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            title: data.title || '',
            specialization: data.specialization || '',
            bio: data.bio || ''
          });
        }
      } else if (assistant) {
        const { data, error } = await supabase
          .from('assistants')
          .select('*')
          .eq('id', assistant.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserData({
            full_name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            title: '',
            specialization: '',
            bio: ''
          });
        }
      }
    } catch (err) {
      console.error('Kullanıcı bilgileri yüklenirken hata:', err);
      setError('Kullanıcı bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Kullanıcı tipine göre doğru tabloya güncelleme yapma
      if (professional) {
        const { error } = await supabase
          .from('professionals')
          .update({
            full_name: userData.full_name,
            email: userData.email,
            phone: userData.phone,
            title: userData.title,
            specialization: userData.specialization,
            bio: userData.bio
          })
          .eq('id', professional.id);

        if (error) throw error;
      } else if (assistant) {
        const { error } = await supabase
          .from('assistants')
          .update({
            full_name: userData.full_name,
            email: userData.email,
            phone: userData.phone
          })
          .eq('id', assistant.id);

        if (error) throw error;
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Kullanıcı bilgileri güncellenirken hata:', err);
      setError('Kullanıcı bilgileri güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // E-posta alanı için küçük harfe dönüştürme
    if (name === 'email') {
      setUserData({ ...userData, [name]: value.toLowerCase() });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
        <LoadingSpinner size="small" loadingText="Kişisel bilgiler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            Kişisel Bilgiler
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Key className="h-4 w-4 mr-1.5" />
            Şifre Değiştir
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {isEditing ? 'İptal' : (
              <>
                <Edit2 className="h-4 w-4 mr-1.5" />
                Düzenle
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Ad Soyad
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={userData.full_name}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
            />
          </div>

          <div className="col-span-6 sm:col-span-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-posta
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={userData.email}
                onChange={handleInputChange}
                className="pl-10 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Telefon
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
            />
          </div>

          {professional && (
            <>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Ünvan
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={userData.title}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="specialization"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Uzmanlık Alanı
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={userData.specialization}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Biyografi
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={userData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
              </div>
            </>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        )}
      </form>

      <PasswordChangeModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
} 