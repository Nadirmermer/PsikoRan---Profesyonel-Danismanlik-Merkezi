import React from 'react';
import { transformImageUrl } from '../lib/blog';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  fallbackSrc?: string;
}

/**
 * Optimize edilmiş resim bileşeni
 * Supabase Storage'dan gelen resimleri WebP formatında ve
 * optimize edilmiş şekilde sunmak için kullanılır
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  width = 800,
  height,
  quality = 80,
  fallbackSrc = '/assets/images/logo_1.png',
  alt = '',
  ...props
}) => {
  // Resim URL'sini optimize et
  const optimizedSrc = transformImageUrl(src, width, height, quality);
  
  // Hata durumunda fallback resmi göster
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== fallbackSrc) {
      target.src = fallbackSrc;
    }
    
    // Özel onError fonksiyonu varsa çağır
    if (props.onError) {
      props.onError(e);
    }
  };
  
  return (
    <img 
      src={optimizedSrc} 
      alt={alt}
      width={width} 
      height={height} 
      loading="lazy"
      onError={handleError}
      {...props} 
    />
  );
};

export default OptimizedImage; 