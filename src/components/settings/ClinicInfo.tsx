import React, { useState, useEffect } from 'react';
import { Building2, User, Save, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface ClinicData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  tax_number?: string;
  website?: string;
  description?: string;
  tax_office?: string;
}

interface AssistantData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_image_url?: string;
}

export function ClinicInfo() {
  const { user, professional, assistant } = useAuth();
  const [clinicData, setClinicData] = useState<ClinicData>({
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    tax_number: '',
    website: '',
    description: '',
    tax_office: ''
  });
  const [assistantData, setAssistantData] = useState<AssistantData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (assistant) {
      // Eğer asistan girişi yapıldıysa, asistanın bilgilerini kullanarak klinik bilgilerini ayarla
      loadAssistantClinicData();
      // Asistan bilgisini ayarla
      setAssistantData({
        id: assistant.id || '',
        full_name: assistant.full_name || '',
        email: assistant.email || '',
        phone: assistant.phone || '',
        profile_image_url: assistant.profile_image_url
      });
    } else if (professional) {
      // Eğer profesyonel girişi yapıldıysa, profesyonelin asistanını bul
      loadClinicDataFromProfessional();
    }
  }, [professional, assistant]);

  const loadAssistantClinicData = async () => {
    if (!assistant) return;
    
    try {
      // Asistan bilgilerini klinik bilgileri olarak ayarla
      // Asistanın telefon ve e-postası artık kliniğin iletişim bilgileridir
      setClinicData({
        id: assistant.id || '',
        name: assistant.clinic_name || '',
        address: '',
        phone: assistant.phone || '',
        email: assistant.email || '',
        tax_number: '',
        website: '',
        description: '',
        tax_office: ''
      });

      // Veritabanından genişletilmiş klinik bilgilerini yükle
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .eq('assistant_id', assistant.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // "No rows found" hatası değilse
          throw error;
        }
        // No rows found, varsayılan verilerle devam et
      } else if (data) {
        // Klinik ayarlarını mevcut verilere ekleyerek güncelle
        // Telefon ve e-posta bilgilerini asistandan aldığımız için o alanları güncelleme
        setClinicData(prev => ({
          ...prev,
          address: data.address || prev.address,
          tax_number: data.tax_number || prev.tax_number,
          tax_office: data.tax_office || prev.tax_office,
          website: data.website || prev.website,
          description: data.description || prev.description,
          name: prev.name || data.name || '', // clinic_name'i koru
        }));
      }
      
    } catch (err) {
      console.error('Klinik bilgileri yüklenirken hata:', err);
      setError('Klinik bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const loadClinicDataFromProfessional = async () => {
    if (!professional?.assistant_id) {
      setLoading(false);
      return;
    };

    try {
      // Önce profesyonelin asistanını yükle
      const { data: assistantData, error: assistantError } = await supabase
        .from('assistants')
        .select('*')
        .eq('id', professional.assistant_id)
        .single();

      if (assistantError) throw assistantError;
      setAssistantData(assistantData);

      // Asistan bilgilerini klinik bilgileri olarak ayarla
      // Asistanın telefon ve e-postası artık kliniğin iletişim bilgileridir
      setClinicData({
        id: assistantData.id || '',
        name: assistantData.clinic_name || '',
        address: '',
        phone: assistantData.phone || '',
        email: assistantData.email || '',
        tax_number: '',
        website: '',
        description: '',
        tax_office: ''
      });

      // Daha sonra genişletilmiş klinik ayarlarını yükle
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinic_settings')
        .select('*')
        .eq('assistant_id', assistantData.id)
        .single();

      if (clinicError) {
        if (clinicError.code !== 'PGRST116') { // "No rows found" hatası değilse
          throw clinicError;
        }
        // No rows found, varsayılan verilerle devam et
      } else if (clinicData) {
        // Klinik ayarlarını mevcut verilere ekleyerek güncelle
        // Telefon ve e-posta bilgilerini asistandan aldığımız için o alanları güncelleme
        setClinicData(prev => ({
          ...prev,
          address: clinicData.address || prev.address,
          tax_number: clinicData.tax_number || prev.tax_number,
          tax_office: clinicData.tax_office || prev.tax_office,
          website: clinicData.website || prev.website,
          description: clinicData.description || prev.description,
          name: prev.name || clinicData.name || '', // clinic_name'i koru
        }));
      }
      
    } catch (err) {
      console.error('Klinik bilgileri yüklenirken hata:', err);
      setError('Klinik bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!assistant?.id) {
        throw new Error('Klinik güncellemesi için asistan bilgisi gereklidir');
      }

      // Veritabanında klinik ayarları kaydını bul veya oluştur
      const { data: existingSettings, error: checkError } = await supabase
        .from('clinic_settings')
        .select('id')
        .eq('assistant_id', assistant.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      // Asistan bilgilerini güncelle (telefon, email ve klinik adı)
      // updated_at sütunu assistants tablosunda olmadığı için kaldırıldı
      const { error: assistantError } = await supabase
        .from('assistants')
        .update({
          clinic_name: clinicData.name,
          phone: clinicData.phone, // Telefon bilgisi artık buradan güncelleniyor
          email: clinicData.email // Email bilgisi artık buradan güncelleniyor
        })
        .eq('id', assistant.id);

      if (assistantError) throw assistantError;

      // Klinik ayarlarını güncelle veya oluştur
      // Artık telefon ve email bilgilerini clinic_settings'e kaydetmiyoruz
      if (existingSettings?.id) {
        // Mevcut kaydı güncelle
        const { error: updateError } = await supabase
          .from('clinic_settings')
          .update({
            name: clinicData.name,
            address: clinicData.address,
            tax_number: clinicData.tax_number,
            tax_office: clinicData.tax_office,
            website: clinicData.website,
            description: clinicData.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);

        if (updateError) throw updateError;
      } else {
        // Yeni kayıt oluştur
        const { error: insertError } = await supabase
          .from('clinic_settings')
          .insert([{
            assistant_id: assistant.id,
            name: clinicData.name,
            address: clinicData.address,
            tax_number: clinicData.tax_number,
            tax_office: clinicData.tax_office,
            website: clinicData.website,
            description: clinicData.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      setIsEditing(false);
      setSuccess('Bilgileriniz başarıyla güncellendi!');
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err: any) {
      console.error('Klinik bilgileri güncellenirken hata:', err);
      
      // Daha açıklayıcı hata mesajları
      if (err.message?.includes('duplicate key')) {
        setError('Bu e-posta adresi zaten kullanılıyor. Lütfen başka bir e-posta adresi deneyin.');
      } else if (err.message?.includes('violates foreign key constraint')) {
        setError('İlişkili kayıtlar nedeniyle işlem yapılamadı. Lütfen yönetici ile iletişime geçin.');
      } else {
        setError(`Klinik bilgileri güncellenemedi: ${err.message || 'Bilinmeyen bir hata oluştu'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // E-posta alanları için küçük harfe dönüştürme
    if (name === 'clinic_email' || name === 'contact_email' || name.includes('email')) {
      setClinicData({ ...clinicData, [name]: value.toLowerCase() });
    } else {
      setClinicData({ ...clinicData, [name]: value });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {assistant ? 'Kişisel ve Klinik Bilgileri' : 'Klinik Bilgileri'}
          </h3>
        </div>
        {assistant && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1 self-start sm:self-center"
            title={isEditing ? 'Düzenlemeyi iptal et' : 'Bilgileri düzenle'}
          >
            <Edit2 className="h-5 w-5" />
            {isEditing ? 'İptal' : 'Düzenle'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {isEditing && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {assistant 
              ? 'Kişisel ve klinik bilgilerinizi düzenliyorsunuz. E-posta ve telefon numarası aynı zamanda klinik iletişim bilgileri olarak kullanılacaktır.' 
              : 'Klinik bilgilerini görüntülüyorsunuz.'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assistant && (
            <>
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Asistan Adı
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={assistantData?.full_name || ''}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Adınız sadece bilgi amaçlı gösterilmektedir. Değiştirilemez.
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  E-posta (Asistan/Klinik İletişimi)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={clinicData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                  placeholder="ornek@klinik.com"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Bu e-posta adresi hem sizin hem de kliniğinizin iletişim bilgisi olarak kullanılacaktır.
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Telefon (Asistan/Klinik İletişimi)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={clinicData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                  placeholder="0555 123 4567"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Bu telefon numarası hem sizin hem de kliniğinizin iletişim bilgisi olarak kullanılacaktır.
                </p>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Klinik Adı
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={clinicData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
              placeholder="Klinik Adı"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Kliniğinizin resmi adını yazınız. Bu isim randevu ve dokümanlarda görünecektir.
            </p>
          </div>

          {!assistant && (
            <>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  E-posta (Klinik/Asistan)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={clinicData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Asistanınızın e-posta adresi, aynı zamanda klinik iletişim bilgisi olarak kullanılır.
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Telefon (Klinik/Asistan)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={clinicData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Asistanınızın telefon numarası, aynı zamanda klinik iletişim bilgisi olarak kullanılır.
                </p>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Web Sitesi
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={clinicData.website}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
              placeholder="https://www.orneklinik.com"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              İsteğe bağlı. Kliniğinizin web sitesi varsa buraya ekleyebilirsiniz.
            </p>
          </div>

          <div>
            <label
              htmlFor="tax_number"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Vergi Numarası
            </label>
            <input
              type="text"
              id="tax_number"
              name="tax_number"
              value={clinicData.tax_number}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
              placeholder="1234567890"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              İsteğe bağlı. Fatura oluşturma için gerekebilecek vergi numaranız.
            </p>
          </div>

          <div>
            <label
              htmlFor="tax_office"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Vergi Dairesi
            </label>
            <input
              type="text"
              id="tax_office"
              name="tax_office"
              value={clinicData.tax_office}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
              placeholder="Örnek Vergi Dairesi"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              İsteğe bağlı. Faturalarda görünecek vergi dairesi bilginiz.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Adres
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={clinicData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
              placeholder="Klinik adresini giriniz"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Kliniğinizin tam adresi. Bu bilgi danışanların size ulaşabilmesi için kullanılacaktır.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={clinicData.description}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:text-white sm:text-sm disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900"
              placeholder="Kliniğiniz hakkında kısa bir açıklama yazabilirsiniz"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              İsteğe bağlı. Kliniğiniz hakkında genel bilgi, sunduğunuz hizmetler veya eklemek istediğiniz diğer bilgiler.
            </p>
          </div>
        </div>

        {professional && assistantData && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h4 className="text-lg font-medium text-slate-900 dark:text-white">
                Asistan Bilgileri
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={assistantData.full_name}
                  disabled
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-sm disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-posta (Klinik E-postası Olarak Kullanılır)
                </label>
                <input
                  type="email"
                  value={assistantData.email}
                  disabled
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-sm disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Telefon (Klinik Telefonu Olarak Kullanılır)
                </label>
                <input
                  type="tel"
                  value={assistantData.phone}
                  disabled
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-sm disabled:opacity-70"
                />
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="order-2 sm:order-1 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mb-2 sm:mb-0"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="order-1 sm:order-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed mb-2 sm:mb-0"
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
    </div>
  );
} 