import { Link } from 'react-router-dom';
import logo1 from '../../assets/logos/logo_1.webp';

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Logo ve Firma Bilgileri */}
          <div className="lg:col-span-2">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 p-0.5 shadow-lg">
                  <div className="absolute inset-0 rounded-xl bg-white dark:bg-slate-900 p-1">
                    <img src={logo1} alt="PsikoRan Logo" className="h-full w-full object-contain" />
                  </div>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">PsikoRan</span>
              </div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-md text-sm">
              Psikoloji uzmanları için tasarlanmış, randevu ve danışan yönetimini kolaylaştıran dijital platform. Danışanlarınızla bağlantıda kalın, işinizi büyütün.
            </p>
            <div className="mt-5 flex space-x-2">
              <a 
                href="https://twitter.com/psikoran" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a 
                href="https://facebook.com/psikoran" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a 
                href="https://instagram.com/psikoran" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/psikoran" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Bağlantılar */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Hızlı Linkler */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Hızlı Linkler
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/features" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    Özellikler
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    Fiyatlandırma
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium transition-colors duration-200 text-sm">
                    Giriş Yap
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    Kayıt Ol
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    Yardım
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Yasal Bilgiler */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Yasal
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    Kullanım Koşulları
                  </Link>
                </li>
                <li>
                  <Link to="/kvkk" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    KVKK
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    Çerez Politikası
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* İletişim */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                İletişim
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <a href="mailto:info@psikoran.com" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    info@psikoran.com
                  </a>
                </li>
                <li>
                  <Link to="/blog" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                    Bize Ulaşın
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Alt Kısım - Telif Hakkı ve Alt Linkler */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/help" className="text-xs text-slate-500 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                Yardım
              </Link>
              <Link to="/blog" className="text-xs text-slate-500 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                Blog
              </Link>
            </div>
          </div>
        </div>
        
        {/* GDPR/KVKK Bildirimi */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
            Bu web sitesini kullanarak, <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Gizlilik Politikamızı</Link> ve <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Kullanım Koşullarımızı</Link> kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </footer>
  );
} 