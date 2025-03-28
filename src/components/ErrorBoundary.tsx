import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Hata detaylarını loglayabilir veya bir hata izleme servisine gönderebilirsiniz
    console.error('ErrorBoundary hatayı yakaladı:', error, errorInfo);
    
    // Eğer Sentry kuruluysa (ki kurulu), hatayı Sentry'ye de gönderebilirsiniz
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Özel hata UI'ı
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Varsayılan hata UI'ı
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Bir şeyler yanlış gitti
          </h2>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
            Bu hatayı düzeltmek için sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
          <details className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-white/50 dark:bg-gray-800/30 rounded border border-gray-200 dark:border-gray-700">
            <summary>Hata detayları</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

// Global window tipi tanımını genişletelim
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error) => void;
    };
  }
}

export default ErrorBoundary; 