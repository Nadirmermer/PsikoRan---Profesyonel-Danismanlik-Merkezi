import * as Sentry from '@sentry/react';

type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
};

/**
 * Web Vitals ölçümlerini izleyen ve Sentry'ye gönderen fonksiyon
 */
export const reportWebVitals = async (onPerfEntry?: (metric: WebVitalsMetric) => void): Promise<void> => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    try {
      const webVitals = await import('web-vitals');
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitals;

      getCLS(metric => {
        // Cumulative Layout Shift - Sayfa yükleme sırasında beklenmedik düzen değişiklikleri
        console.debug('CLS:', metric.value);
        Sentry.captureMessage(`WEB_VITALS CLS: ${metric.value}`, {
          level: metric.value > 0.1 ? 'warning' : 'info',
          extra: { metric }
        });
        onPerfEntry(metric);
      });
      
      getFID(metric => {
        // First Input Delay - İlk kullanıcı etkileşimine yanıt süresi
        console.debug('FID:', metric.value);
        Sentry.captureMessage(`WEB_VITALS FID: ${metric.value}`, {
          level: metric.value > 100 ? 'warning' : 'info',
          extra: { metric }
        });
        onPerfEntry(metric);
      });
      
      getFCP(metric => {
        // First Contentful Paint - İlk içerik görüntülenme süresi
        console.debug('FCP:', metric.value);
        Sentry.captureMessage(`WEB_VITALS FCP: ${metric.value}`, {
          level: metric.value > 1800 ? 'warning' : 'info',
          extra: { metric }
        });
        onPerfEntry(metric);
      });
      
      getLCP(metric => {
        // Largest Contentful Paint - En büyük içerik parçası yüklenme süresi
        console.debug('LCP:', metric.value);
        Sentry.captureMessage(`WEB_VITALS LCP: ${metric.value}`, {
          level: metric.value > 2500 ? 'warning' : 'info',
          extra: { metric }
        });
        onPerfEntry(metric);
      });
      
      getTTFB(metric => {
        // Time to First Byte - Sunucudan ilk byte'ın gelme süresi
        console.debug('TTFB:', metric.value);
        Sentry.captureMessage(`WEB_VITALS TTFB: ${metric.value}`, {
          level: metric.value > 600 ? 'warning' : 'info',
          extra: { metric }
        });
        onPerfEntry(metric);
      });
    } catch (error) {
      console.error('Web Vitals yüklenirken hata oluştu:', error);
    }
  }
};

/**
 * Performans önemli seviyede kötüyse uyarı oluşturan fonksiyon
 */
export const monitorPerformance = async (): Promise<void> => {
  try {
    const webVitals = await import('web-vitals');
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitals;
    
    // Kritik eşik değerleri
    const POOR_CLS_THRESHOLD = 0.25; // Kötü CLS eşik değeri
    const POOR_FID_THRESHOLD = 300;  // Kötü FID eşik değeri (ms)
    const POOR_LCP_THRESHOLD = 4000; // Kötü LCP eşik değeri (ms)
    const POOR_FCP_THRESHOLD = 3000; // Kötü FCP eşik değeri (ms)
    const POOR_TTFB_THRESHOLD = 1000; // Kötü TTFB eşik değeri (ms)

    getCLS((metric) => {
      if (metric.value > POOR_CLS_THRESHOLD) {
        Sentry.captureMessage(`Düşük Performans: CLS ${metric.value.toFixed(2)}`, {
          level: 'warning',
          extra: { 
            metric,
            info: 'Sayfa yüklenirken beklenmedik düzen değişiklikleri çok fazla.',
            suggestion: 'Dinamik içerikler için önceden boyut ayarlaması yapın veya düzen değişikliklerine neden olan unsurları optimize edin.'
          }
        });
      }
    });

    getFID((metric) => {
      if (metric.value > POOR_FID_THRESHOLD) {
        Sentry.captureMessage(`Düşük Performans: FID ${metric.value.toFixed(0)}ms`, {
          level: 'warning',
          extra: { 
            metric,
            info: 'Kullanıcı etkileşimlerine yanıt verme süresi çok uzun.',
            suggestion: 'Ana iş parçacığındaki uzun çalışan JavaScript kodunu optimize edin, ağır işlemleri Web Worker\'lara taşıyın.'
          }
        });
      }
    });

    getLCP((metric) => {
      if (metric.value > POOR_LCP_THRESHOLD) {
        Sentry.captureMessage(`Düşük Performans: LCP ${metric.value.toFixed(0)}ms`, {
          level: 'warning',
          extra: { 
            metric,
            info: 'En büyük içerik parçasının yüklenmesi çok uzun sürüyor.',
            suggestion: 'Kritik olan büyük görselleri optimize edin, sunucu yanıt süresini iyileştirin ve render-blocking kaynakları azaltın.'
          }
        });
      }
    });

    getFCP((metric) => {
      if (metric.value > POOR_FCP_THRESHOLD) {
        Sentry.captureMessage(`Düşük Performans: FCP ${metric.value.toFixed(0)}ms`, {
          level: 'warning',
          extra: { 
            metric,
            info: 'İlk içeriğin görüntülenmesi çok uzun sürüyor.',
            suggestion: 'CSS dosyalarını optimize edin, kritik CSS\'i inline olarak ekleyin ve gereksiz render-blocking kaynakları kaldırın.'
          }
        });
      }
    });

    getTTFB((metric) => {
      if (metric.value > POOR_TTFB_THRESHOLD) {
        Sentry.captureMessage(`Düşük Performans: TTFB ${metric.value.toFixed(0)}ms`, {
          level: 'warning',
          extra: { 
            metric,
            info: 'Sunucudan ilk byte\'ın gelmesi çok uzun sürüyor.',
            suggestion: 'Sunucu yanıt süresini optimize edin, CDN kullanın ve arka uç performansını iyileştirin.'
          }
        });
      }
    });
  } catch (error) {
    console.error('Web Vitals yüklenirken hata oluştu:', error);
  }
}; 