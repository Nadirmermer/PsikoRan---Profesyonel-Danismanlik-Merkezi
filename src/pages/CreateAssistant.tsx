import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff, Building } from 'lucide-react';
import { useAuth } from '../lib/auth';
import logo1 from '../assets/logo/logo_1.png';

export function CreateAssistant() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    clinicName: '',
    workingHours: {
      pazartesi: { opening: '09:00', closing: '18:00', isOpen: false },
      sali: { opening: '09:00', closing: '18:00', isOpen: false },
      carsamba: { opening: '09:00', closing: '18:00', isOpen: false },
      persembe: { opening: '09:00', closing: '18:00', isOpen: false },
      cuma: { opening: '09:00', closing: '18:00', isOpen: false },
      cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
      pazar: { opening: '09:00', closing: '18:00', isOpen: false }
    }
  });
  const [showPassword, setShowPassword] = useState(false);

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
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (existingUser?.user) {
        // Kullanıcı zaten var, asistan kaydı var mı kontrol et
        const { data: existingAssistant } = await supabase
          .from('assistants')
          .select('id')
          .eq('user_id', existingUser.user.id)
          .maybeSingle();

        if (existingAssistant) {
          // Hem kullanıcı hem asistan kaydı var
          setError('Bu e-posta adresi zaten kullanımda. Lütfen giriş yapın veya başka bir e-posta adresi kullanın.');
          setLoading(false);
          return;
        } else {
          // Kullanıcı var ama asistan kaydı yok, asistan kaydı oluştur
          const { data: assistantData, error: assistantError } = await supabase
            .from('assistants')
            .insert([
              {
                user_id: existingUser.user.id,
                full_name: formData.fullName,
                phone: formData.phone || null,
                clinic_name: formData.clinicName,
                email: formData.email,
              },
            ])
            .select();

          if (assistantError) {
            console.error('Assistant creation error:', assistantError);
            throw new Error(`Asistan kaydı oluşturulamadı: ${assistantError.message}`);
          }

          if (!assistantData || assistantData.length === 0) {
            throw new Error('Asistan kaydı oluşturulamadı: Veri döndürülemedi');
          }

          // Clinic settings oluştur
          const { error: settingsError } = await supabase
            .from('clinic_settings')
            .insert([
              {
                assistant_id: assistantData[0].id,
                opening_time_monday: formData.workingHours.pazartesi.opening,
                closing_time_monday: formData.workingHours.pazartesi.closing,
                is_open_monday: formData.workingHours.pazartesi.isOpen,
                opening_time_tuesday: formData.workingHours.sali.opening,
                closing_time_tuesday: formData.workingHours.sali.closing,
                is_open_tuesday: formData.workingHours.sali.isOpen,
                opening_time_wednesday: formData.workingHours.carsamba.opening,
                closing_time_wednesday: formData.workingHours.carsamba.closing,
                is_open_wednesday: formData.workingHours.carsamba.isOpen,
                opening_time_thursday: formData.workingHours.persembe.opening,
                closing_time_thursday: formData.workingHours.persembe.closing,
                is_open_thursday: formData.workingHours.persembe.isOpen,
                opening_time_friday: formData.workingHours.cuma.opening,
                closing_time_friday: formData.workingHours.cuma.closing,
                is_open_friday: formData.workingHours.cuma.isOpen,
                opening_time_saturday: formData.workingHours.cumartesi.opening,
                closing_time_saturday: formData.workingHours.cumartesi.closing,
                is_open_saturday: formData.workingHours.cumartesi.isOpen,
                opening_time_sunday: formData.workingHours.pazar.opening,
                closing_time_sunday: formData.workingHours.pazar.closing,
                is_open_sunday: formData.workingHours.pazar.isOpen,
              },
            ]);

          if (settingsError) {
            console.error('Clinic settings error:', settingsError);
            throw new Error('Klinik ayarları oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
          }

          // Otomatik giriş yap
          await signIn(formData.email, formData.password);
          navigate('/');
          return;
        }
      }

      // Yeni kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'assistant',
            full_name: formData.fullName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Bu e-posta adresi zaten kullanımda. Lütfen giriş yapın veya başka bir e-posta adresi kullanın.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Kullanıcı hesabı oluşturulamadı');
      }

      // Wait a moment for the auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create assistant record
      const { data: assistantData, error: assistantError } = await supabase
        .from('assistants')
        .insert([
          {
            user_id: authData.user.id,
            full_name: formData.fullName,
            phone: formData.phone || null,
            clinic_name: formData.clinicName,
            email: formData.email,
          },
        ])
        .select();

      if (assistantError) {
        console.error('Assistant creation error:', assistantError);
        
        // If assistant creation fails, clean up the auth user
        await supabase.auth.signOut();
        
        if (assistantError.code === '23505') { // Unique constraint violation
          throw new Error('Bu e-posta adresi zaten kullanımda.');
        } else if (assistantError.code === '42P01') { // Relation does not exist
          throw new Error('Sistem hatası: Veritabanı tablosu bulunamadı. Lütfen yönetici ile iletişime geçin.');
        } else {
          throw new Error(`Asistan kaydı oluşturulamadı: ${assistantError.message}`);
        }
      }

      if (!assistantData || assistantData.length === 0) {
        throw new Error('Asistan kaydı oluşturulamadı: Veri döndürülemedi');
      }

      // Create clinic settings
      const { error: settingsError } = await supabase
        .from('clinic_settings')
        .insert([
          {
            assistant_id: assistantData[0].id,
            opening_time_monday: formData.workingHours.pazartesi.opening,
            closing_time_monday: formData.workingHours.pazartesi.closing,
            is_open_monday: formData.workingHours.pazartesi.isOpen,
            opening_time_tuesday: formData.workingHours.sali.opening,
            closing_time_tuesday: formData.workingHours.sali.closing,
            is_open_tuesday: formData.workingHours.sali.isOpen,
            opening_time_wednesday: formData.workingHours.carsamba.opening,
            closing_time_wednesday: formData.workingHours.carsamba.closing,
            is_open_wednesday: formData.workingHours.carsamba.isOpen,
            opening_time_thursday: formData.workingHours.persembe.opening,
            closing_time_thursday: formData.workingHours.persembe.closing,
            is_open_thursday: formData.workingHours.persembe.isOpen,
            opening_time_friday: formData.workingHours.cuma.opening,
            closing_time_friday: formData.workingHours.cuma.closing,
            is_open_friday: formData.workingHours.cuma.isOpen,
            opening_time_saturday: formData.workingHours.cumartesi.opening,
            closing_time_saturday: formData.workingHours.cumartesi.closing,
            is_open_saturday: formData.workingHours.cumartesi.isOpen,
            opening_time_sunday: formData.workingHours.pazar.opening,
            closing_time_sunday: formData.workingHours.pazar.closing,
            is_open_sunday: formData.workingHours.pazar.isOpen,
          },
        ]);

      if (settingsError) {
        console.error('Clinic settings error:', settingsError);
        throw new Error('Klinik ayarları oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
      }

      // Automatically sign in
      await signIn(formData.email, formData.password);

      // Navigate to dashboard
      navigate('/');
    } catch (err: any) {
      console.error('Error creating assistant:', err);
      setError(
        err.message || 
        'Asistan hesabı oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sol Panel */}
      <div className="hidden lg:flex w-1/2 p-16 items-center justify-center bg-white dark:bg-slate-800 relative">
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="flex items-center space-x-4 mb-16">
            <div className="h-16 w-32 flex items-center justify-center">
              <img src={logo1} alt="PsikoRan Logo" className="h-full w-full object-contain" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white">
              PsikoRan
            </h2>
          </div>
          
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Kliniğinizi<br />
              <span className="text-primary-600 dark:text-primary-400">Dijitalleştirin</span>
            </h1>
            <div className="space-y-6 text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Modern çözümlerle kliniğinizi yönetmeye hemen başlayın.
              </p>
              <ul className="space-y-4">
                {['Kolay ve hızlı randevu yönetimi', 'Otomatik ödeme takibi ve raporlama', 'Güvenli danışan kayıtları ve notlar', '7/24 teknik destek hizmeti'].map((item) => (
                  <li key={item} className="flex items-center space-x-3">
                    <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-16">
            <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">30 Gün</div>
              <div className="text-slate-600 dark:text-slate-300">Ücretsiz Deneme</div>
            </div>
            <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">%100</div>
              <div className="text-slate-600 dark:text-slate-300">Memnuniyet</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobil Logo */}
          <div className="flex lg:hidden items-center justify-center space-x-3 mb-12">
            <div className="h-12 w-24 flex items-center justify-center">
              <img src={logo1} alt="PsikoRan Logo" className="h-full w-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              PsikoRan
            </h2>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="group mb-8 flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Giriş sayfasına dön</span>
          </button>

          <div className="mb-12">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white">
              Hesap Oluşturun
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Kliniğinizi dijital dünyaya taşıyın
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ad Soyad
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-hover:text-primary-500" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-12 w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ad Soyad"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  E-posta
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
                    onChange={handleChange}
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
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12 w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="En az 6 karakter"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Telefon (İsteğe bağlı)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-hover:text-primary-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-12 w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="(555) 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Klinik Adı
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
                    placeholder="Klinik Adı"
                  />
                </div>
              </div>

              {/* Çalışma Saatleri */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                    Çalışma Saatleri
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Object.values(formData.workingHours).some(h => h.isOpen)}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        const updatedHours = { ...formData.workingHours };
                        Object.keys(updatedHours).forEach(day => {
                          updatedHours[day as keyof typeof updatedHours].isOpen = newValue;
                        });
                        setFormData({
                          ...formData,
                          workingHours: updatedHours
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                    <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {Object.values(formData.workingHours).some(h => h.isOpen) ? 'Aktif' : 'Pasif'}
                    </span>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Varsayılan çalışma saatleri (09:00-18:00) ile devam edebilir veya kendi çalışma saatlerinizi belirleyebilirsiniz. Bu ayarları daha sonra yönetim panelinden güncelleyebilirsiniz.
                    </p>
                  </div>
                  
                  {Object.values(formData.workingHours).some(h => h.isOpen) && (
                    <div className="space-y-4">
                      {Object.entries(formData.workingHours).map(([day, hours]) => (
                        <div key={day} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hours.isOpen}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    workingHours: {
                                      ...formData.workingHours,
                                      [day]: { ...hours, isOpen: e.target.checked }
                                    }
                                  });
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                              <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {hours.isOpen ? 'Açık' : 'Kapalı'}
                              </span>
                            </label>
                          </div>
                          {hours.isOpen && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                  Açılış
                                </label>
                                <input
                                  type="time"
                                  value={hours.opening}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      workingHours: {
                                        ...formData.workingHours,
                                        [day]: { ...hours, opening: e.target.value }
                                      }
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                  Kapanış
                                </label>
                                <input
                                  type="time"
                                  value={hours.closing}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      workingHours: {
                                        ...formData.workingHours,
                                        [day]: { ...hours, closing: e.target.value }
                                      }
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                className="w-full py-3 px-6 rounded-lg text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Hesap Oluştur</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}