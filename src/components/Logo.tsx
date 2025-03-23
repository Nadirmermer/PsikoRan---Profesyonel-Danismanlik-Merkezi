import React from 'react';
import logo2 from '../assets/logos/logo_2.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'white' | 'pdf';
  showText?: boolean;
}

/**
 * Logo Bileşeni
 * 
 * PsikoRan logosu için kullanılan bileşen. Farklı boyut ve renk varyasyonlarını destekler.
 * 
 * @param size Logo boyutu: 'small', 'medium' veya 'large'
 * @param variant Logo renk varyasyonu: 'default', 'white' veya 'pdf'
 * @param showText Logo yanında metin gösterme durumu
 * @returns Logo bileşeni
 */
export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'default',
  showText = true 
}) => {
  // Boyut değerlerine göre container ve metin boyutlarını ayarla
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

  // Renk varyasyonlarına göre metin renklerini ayarla
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
          src={logo2} 
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

/**
 * SVG formatında logo
 * 
 * PDF, favicon ve diğer SVG gerektiren durumlarda kullanılan logo bileşeni
 * @returns SVG logo bileşeni
 */
export const LogoSVG: React.FC = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <image href={logo2} width="60" height="60" x="0" y="0" />
  </svg>
);

export default Logo; 