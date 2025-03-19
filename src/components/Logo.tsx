import React from 'react';
import logoImage from '../assets/logo/main-logo.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'white' | 'pdf';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'default',
  showText = true 
}) => {
  // Size değerlerine göre boyutları ayarla
  const sizes = {
    small: {
      container: 'h-10 w-10',
      text: 'text-lg'
    },
    medium: {
      container: 'h-14 w-14',
      text: 'text-2xl'
    },
    large: {
      container: 'h-20 w-20',
      text: 'text-4xl'
    }
  };

  // Variant değerlerine göre renkleri ayarla
  const colors = {
    default: {
      text: 'text-slate-800 dark:text-white'
    },
    white: {
      text: 'text-white'
    },
    pdf: {
      text: 'text-[rgb(42,72,108)]'
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`${sizes[size].container} rounded-lg overflow-hidden`}>
        <img 
          src={logoImage} 
          alt="PsikoRan Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <h2 className={`font-bold ${sizes[size].text} ${colors[variant].text}`}>
          PsikoRan
        </h2>
      )}
    </div>
  );
};

// SVG formatında logo (PDF ve favicon için)
export const LogoSVG: React.FC = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <image href={logoImage} width="60" height="60" x="0" y="0" />
  </svg>
);

export default Logo; 