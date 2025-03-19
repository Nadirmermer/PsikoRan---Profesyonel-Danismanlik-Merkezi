import { Link } from 'react-router-dom';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function LegalLayout({ children, title, description }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
                <img 
                  src="/main-logo.png" 
                  alt="PsikoRan Logo" 
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-white">PsikoRan</span>
            </Link>
            <nav className="flex space-x-4 text-sm">
              <Link to="/privacy" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Gizlilik Politikası
              </Link>
              <Link to="/terms" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Kullanım Şartları
              </Link>
              <Link to="/kvkk" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                KVKK
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>{title}</h1>
          {description && <p className="text-xl text-slate-600 dark:text-slate-400">{description}</p>}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-4 text-sm">
              <Link to="/contact" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                İletişim
              </Link>
              <Link to="/help" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Yardım Merkezi
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 