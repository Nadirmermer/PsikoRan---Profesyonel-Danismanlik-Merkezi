# Logo Yapısı

Bu klasör, PsikoRan uygulamasında kullanılan logo dosyalarını içerir.

## Logo Dosyaları ve Kullanım Alanları

- `app-logo.svg` - Ana uygulama logosu (vektörel formatta)
- `app-logo-sm.png` - Küçük boyutlu uygulama logosu (192x192px)
- `app-logo-md.png` - Orta boyutlu uygulama logosu (512x512px)
- `app-logo-lg.png` - Büyük boyutlu uygulama logosu (1024x1024px)

## Logo Kullanımı

Logo bileşenleri, `src/components/Logo.tsx` dosyasında tanımlanmıştır. Logolar, uygulama içinde farklı boyutlarda ve varyasyonlarda kullanılabilir.

## Public vs Assets

- `src/assets/logo`: Uygulama içinde kullanılan ve import edilen logolar
- `public`: PWA ve tarayıcı gereksinimleri için kullanılan logo dosyaları

## Logo Değişikliği Yapılırken

Logo dosyalarını değiştirirken, şu adımları izleyin:

1. `src/assets/logo` klasöründeki logoları güncelleyin
2. Gerekiyorsa `public` klasöründeki logoları da güncelleyin
3. Dosya adlarını değiştirmekten kaçının, mevcut dosyaları aynı isimle değiştirin

## Dosya Adları ve Formatları

- SVG formatı vektörel logo için tercih edilir (daha net görüntü, her boyutta ölçeklenebilir)
- PNG formatı bitmap logo için kullanılır (şeffaf arka plan gerektiğinde)
- JPEG formatı kullanmaktan kaçının (şeffaflık desteklemez) 