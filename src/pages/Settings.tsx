import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { 
  PersonalInfo, 
  WorkingHours, 
  ClinicInfo, 
  BreakSchedule, 
  VacationPlanner, 
  NotificationSettings, 
  PrivacySettings, 
  CookieSettings, 
  AccountDeletion, 
  RoomManagement,
  PWASettings
} from '../components/settings';
import { User, UserCircle2, Building2, Bell, Shield, ChevronRight, Smartphone } from 'lucide-react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Settings = () => {
  const { user, professional, assistant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(assistant ? 'clinic' : 'personal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sayfa yüklendiğinde ve kullanıcı türü değiştiğinde aktif sekmeyi ayarla
  useEffect(() => {
    // Asistan girişi yapıldıysa otomatik olarak klinik sekmesini aç
    if (assistant) {
      setActiveTab('clinic');
    }
  }, [assistant]);

  // Mobil cihazlarda bir sekme seçildiğinde menüyü kapat
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Giriş yapmış kullanıcı bilgilerini göster
  const renderAccountInfo = () => {
    if (!user) return null;

  return (
      <div className="p-4 mb-6 bg-white dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center">
        <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
            {user.email}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {professional ? 'Ruh Sağlığı Uzmanı' : assistant ? 'Asistan / Klinik Yöneticisi' : 'Kullanıcı'}
          </p>
      </div>
    </div>
  );
  };

  // Tab kategorilerini hazırla
  const getCategories = () => {
        if (professional) {
      return [
        { id: 'personal', label: 'Kişisel', icon: <UserCircle2 className="h-5 w-5" /> },
        { id: 'clinic', label: 'Klinik Bilgileri', icon: <Building2 className="h-5 w-5" /> },
        { id: 'security', label: 'Güvenlik', icon: <Shield className="h-5 w-5" /> },
        { id: 'notifications', label: 'Bildirimler', icon: <Bell className="h-5 w-5" /> },
        { id: 'pwa', label: 'Uygulama Ayarları', icon: <Smartphone className="h-5 w-5" /> }
      ];
        } else if (assistant) {
      return [
        // Asistan için kişisel sekmeyi kaldırdık
        { id: 'clinic', label: 'Klinik Yönetimi', icon: <Building2 className="h-5 w-5" /> },
        { id: 'security', label: 'Güvenlik', icon: <Shield className="h-5 w-5" /> },
        { id: 'notifications', label: 'Bildirimler', icon: <Bell className="h-5 w-5" /> },
        { id: 'pwa', label: 'Uygulama Ayarları', icon: <Smartphone className="h-5 w-5" /> }
      ];
    }
    return [];
  };

  const categories = getCategories();

  // Sekme içeriğini render et
  const renderTabContent = () => {
    if (isLoading) {
      return <div className="animate-pulse">Yükleniyor...</div>;
    }

      if (professional) {
      switch (activeTab) {
        case 'personal':
          return (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Kişisel Bilgiler
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Kişisel bilgilerinizi düzenleyin
                </p>
              </div>
              <PersonalInfo />
              
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Çalışma Saatleri
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Haftalık çalışma planınızı düzenleyin
                </p>
              </div>
              <WorkingHours type="professional" />
              
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Çalışma Molaları
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Günlük çalışma aralarınızı ve molalarınızı düzenleyin
                </p>
              </div>
              <BreakSchedule type="professional" />
              
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  İzinler ve Tatiller
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Yıllık izin ve tatil planlarınızı düzenleyin
                </p>
              </div>
              <VacationPlanner type="professional" />
            </div>
          );
        case 'clinic':
          return (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Klinik Bilgilerim
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Çalıştığınız kliniğin bilgilerini düzenleyin
                </p>
              </div>
              <ClinicInfo />
              
              {professional.assistant_id && (
                <>
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                      Klinik Çalışma Saatleri
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Kliniğinizin genel çalışma saatlerini görüntüleyin
                    </p>
                </div>
                  <WorkingHours type="clinic" isEditable={false} />
                  
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                      Klinik Çalışma Aralarını Görüntüle
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Kliniğinizin çalışma aralarını ve molalarını görüntüleyin
                    </p>
              </div>
                  <BreakSchedule type="clinic" isEditable={false} />
                  
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                      Klinik Tatil Planlaması
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Kliniğinizin tatil ve kapalı olduğu günleri görüntüleyin
                    </p>
              </div>
                  <VacationPlanner type="clinic" isEditable={false} />
                </>
              )}
              
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Oda Yönetimi
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Odaları görüntüleyin
                </p>
                    </div>
              <RoomManagement isViewOnly={true} />
                        </div>
          );
        case 'security':
    return (
            <div className="space-y-10">
              <PrivacySettings />
              <CookieSettings />
              <AccountDeletion />
      </div>
    );
        case 'notifications':
          return <NotificationSettings />;
          
        case 'pwa':
          return <PWASettings />;
          
        default:
          return null;
  }
    } else if (assistant) {
      switch (activeTab) {
        // Asistan için personal sekmeyi kaldırdık
        case 'clinic':
    return (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Kişisel ve Klinik Bilgilerim
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Kişisel ve klinik bilgilerinizi düzenleyin
                </p>
              </div>
              <ClinicInfo />
              
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Klinik Çalışma Saatleri
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Kliniğinizin genel çalışma saatlerini düzenleyin
                </p>
          </div>
              <WorkingHours type="clinic" />
              
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Klinik Çalışma Aralarını Yönetin
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Kliniğinizin çalışma aralarını ve molalarını düzenleyin
                </p>
            </div>
              <BreakSchedule type="clinic" />
              
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Klinik Tatil Planlaması
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Klinik genelinde tatil ve izinleri yönetin
                    </p>
              </div>
              <VacationPlanner type="clinic" />
              
              <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">
                  Oda Yönetimi
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Terapi odalarını yönetin
                    </p>
                    </div>
              <RoomManagement />
                        </div>
          );
        case 'security':
          return (
            <div className="space-y-10">
              <PrivacySettings />
              <CookieSettings />
              <AccountDeletion />
                        </div>
          );
        case 'notifications':
          return <NotificationSettings />;
          
        case 'pwa':
          return <PWASettings />;
          
        default:
          return null;
      }
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              </div>
    );
  }

  if (!user || (!professional && !assistant)) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">Erişim Reddedildi</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz.
                    </p>
              </div>
                </div>
    );
  }

  // Aktif seçili sekmenin bilgisi
  const activeCategory = categories.find(category => category.id === activeTab);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ayarlar</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Hesap ayarlarınızı ve tercihlerinizi yönetin
                    </p>
                    </div>
              
      {renderAccountInfo()}

      {/* Mobil cihazlar için açılır seçenek kutusu */}
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-3">
            {activeCategory && (
              <span className="text-primary-500 dark:text-primary-400">
                {activeCategory.icon}
              </span>
            )}
            <span className="text-slate-900 dark:text-white">
              {activeCategory ? activeCategory.label : 'Kategori Seçin'}
            </span>
          </div>
          <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`} />
        </button>

        {isMobileMenuOpen && (
          <div className="mt-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md">
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleTabClick(category.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === category.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`mr-3 ${
                    activeTab === category.id
                      ? 'text-primary-500 dark:text-primary-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {category.icon}
                  </span>
                  {category.label}
                </button>
              ))}
            </nav>
              </div>
        )}
                  </div>
              
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab Navigasyonu - Masaüstü */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-6">
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === category.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`mr-3 ${
                    activeTab === category.id
                      ? 'text-primary-500 dark:text-primary-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {category.icon}
                  </span>
                  {category.label}
                </button>
              ))}
            </nav>
              </div>
          </div>

        {/* Tab İçeriği */}
        <div className="flex-1 bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;