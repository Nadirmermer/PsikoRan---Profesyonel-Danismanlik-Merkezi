import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = '',
}) => {
  // Spinner boyutları
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Spinner renkleri
  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}>
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      {text && <p className="mt-2 text-sm text-center">{text}</p>}
      
      {/* Sentry Test Butonu - Sadece Geliştirme Ortamında Görünür */}
      {process.env.NODE_ENV === 'development' && (
        <button
          className="mt-4 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          onClick={() => {
            throw new Error("Bu bir Sentry test hatasıdır!");
          }}
        >
          Sentry Test Hatası
        </button>
      )}
    </div>
  );
};

export default LoadingSpinner; 