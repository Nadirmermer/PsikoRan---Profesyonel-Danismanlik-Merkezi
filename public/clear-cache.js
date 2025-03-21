/**
 * PsikoRan Service Worker ve Cache Temizleme Aracı
 * 
 * Bu script, uygulama açılışında tüm service worker kayıtlarını ve önbellekleri temizler.
 * Workbox ve diğer service worker hatalarının önüne geçmek için kullanılır.
 */

(function clearServiceWorkerAndCache() {
  console.log('Cache ve Service Worker temizleme işlemi başlatılıyor...');

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

  // Tüm önbellekleri temizle
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('Cache siliniyor:', cacheName);
          return caches.delete(cacheName).then(function() {
            console.log('Cache silindi:', cacheName);
          });
        })
      );
    }).catch(function(err) {
      console.log('Cache silinemedi:', err);
    });
  }

  // favicon önbellek çakışmalarını özellikle ele al
  if ('caches' in window) {
    caches.open('workbox-precache').then(function(cache) {
      cache.delete('/favicon.ico').then(function(success) {
        console.log('Favicon önbelleği silindi:', success);
      });
      cache.delete('/icon.ico').then(function(success) {
        console.log('Icon önbelleği silindi:', success);
      });
      // Base64 encoded favicon önbelleğini de temizle
      cache.keys().then(function(requests) {
        requests.forEach(function(request) {
          if (request.url.includes('favicon') || request.url.includes('icon')) {
            cache.delete(request).then(function() {
              console.log('Base64 favicon önbelleği silindi:', request.url);
            });
          }
        });
      });
    });
  }

  // IndexedDB veritabanlarını temizle
  if (window.indexedDB) {
    var databases = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
    databases.then(function(dbs) {
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

  // LocalStorage'daki workbox girdilerini temizle
  if (window.localStorage) {
    Object.keys(localStorage).forEach(function(key) {
      if (key.includes('workbox') || key.includes('precache')) {
        localStorage.removeItem(key);
        console.log('LocalStorage girdisi silindi:', key);
      }
    });
  }

  console.log('Cache ve Service Worker temizleme işlemi tamamlandı.');
  console.log('Sayfayı yenileyin veya uygulamayı yeniden başlatın.');
})(); 