/**
 * PsikoRan Service Worker ve Cache Temizleme Aracı
 * 
 * Bu script, belirli sorunlar oluştuğunda service worker ve önbellekleri temizler.
 * Yalnızca gerektiğinde kullanılır ve kullanıcı deneyimini olumsuz etkilemez.
 */

(function clearCacheOnlyWhenNeeded() {
  // URL'de clear-cache parametresi varsa veya localStorage'da temizlik isteği varsa çalıştır
  if (window.location.hash.includes('clear-cache') || localStorage.getItem('need_cache_clear') === 'true') {
    console.log('Cache ve Service Worker temizleme işlemi başlatılıyor...');
    
    // Temizlik isteğini localStorage'dan kaldır
    localStorage.removeItem('need_cache_clear');

    // Service Worker'ları temizle
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
          registration.unregister();
          console.log('Service Worker kaydı silindi:', registration);
        }
      }).catch(function(err) {
        console.log('Service Worker kaydı silinemedi:', err);
      });
    }

    // Sadece workbox ve PWA ile ilgili önbellekleri temizle
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            // Sadece uygulamayla ilgili önbellekleri temizle
            if (cacheName.includes('workbox') || 
                cacheName.includes('wb-') || 
                cacheName.includes('psikoran') || 
                cacheName.includes('pwa')) {
              console.log('Cache siliniyor:', cacheName);
              return caches.delete(cacheName).then(function() {
                console.log('Cache silindi:', cacheName);
              });
            }
            return Promise.resolve(); // Diğer önbellekleri koru
          })
        );
      }).catch(function(err) {
        console.log('Cache silinemedi:', err);
      });
    }

    // IndexedDB veritabanlarında sadece workbox olanları temizle
    if (window.indexedDB && indexedDB.databases) {
      indexedDB.databases().then(function(dbs) {
        dbs.forEach(function(db) {
          if (db.name && (db.name.includes('workbox') || db.name.includes('precache'))) {
            indexedDB.deleteDatabase(db.name);
            console.log('IndexedDB veritabanı silindi:', db.name);
          }
        });
      }).catch(function(err) {
        console.log('IndexedDB veritabanları listelenemedi:', err);
      });
    }

    // LocalStorage temizliği sadece workbox girdileri için
    if (window.localStorage) {
      Object.keys(localStorage).forEach(function(key) {
        if (key.includes('workbox') || key.includes('precache')) {
          localStorage.removeItem(key);
          console.log('LocalStorage girdisi silindi:', key);
        }
      });
    }

    console.log('Cache ve Service Worker temizleme işlemi tamamlandı.');
    
    // URL'den clear-cache parametresini kaldırmak için sayfa yönlendirmesi
    if (window.location.hash.includes('clear-cache')) {
      // Temizleme parametresini kaldır ve sayfayı yeniden yükle
      window.location.href = window.location.href.split('#')[0];
    }
  }
})(); 