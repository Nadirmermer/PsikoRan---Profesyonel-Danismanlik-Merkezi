// PsikoRan Service Worker

// Önbelleğe alınacak temel dosyaların listesi
const CACHE_NAME = 'psikoran-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/images/icons/icon-192x192.webp',
  '/images/icons/icon-512x512.webp',
  '/images/icons/badge-72x72.webp',
  '/assets/styles.css', // Eğer varsa
  '/assets/app.js',     // Eğer varsa
  '/offline.html'       // Çevrimdışı sayfası
];

// Mesaj işleme - Güncelleme ve diğer iletişim için
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mesaj alındı:', event.data);
  
  if (event.data === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip Waiting...');
    self.skipWaiting();
  }
});

// Service Worker kurulumunda önbelleğe alma
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Kurulum');
  
  // Yüklenme işlemini beklet
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Önbelleğe Alınıyor');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Kurulum Tamamlandı');
        return self.skipWaiting();
      })
  );
});

// Service Worker etkinleştirildiğinde eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Etkinleştiriliyor');
  
  // Etkinleştirme işlemini beklet
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('[Service Worker] Eski Önbellek Siliniyor:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[Service Worker] Etkinleştirildi');
      return self.clients.claim();
    })
  );
});

// Ağ isteklerini yakalayarak servis et
self.addEventListener('fetch', (event) => {
  // API isteklerini yönlendir
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // HTML isteklerini ağdan getir, olmuyorsa önbellekten, olmuyorsa offline.html'i göster
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Başarılı ağ yanıtını önbelleğe kaydet
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // Ağ hatası durumunda önbellekten kontrol et
          return caches.match(event.request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // Resim, CSS, JS gibi statik dosyalar için öncelikle önbellekten getir, olmuyorsa ağdan getir
  if (event.request.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          return cachedResponse || fetch(event.request)
            .then((response) => {
              // Başarılı ağ yanıtını önbelleğe kaydet
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse);
              });
              return response;
            });
        })
    );
    return;
  }
  
  // Diğer tüm istekler için ağı dene, olmuyorsa önbellekten getir
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push bildirimlerini yakala
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Bildirimi Alındı');
  let pushData = {};
  
  try {
    // Push verisini al
    if (event.data) {
      pushData = event.data.json();
    }
  } catch (e) {
    console.error('[Service Worker] Push mesajı JSON olarak ayrıştırılamadı', e);
  }
  
  // Varsayılan bildirim içeriği
  const defaultTitle = 'PsikoRan';
  const defaultOptions = {
    body: 'Yeni bir bildiriminiz var.',
    icon: '/images/icons/icon-192x192.webp',
    badge: '/images/icons/badge-72x72.webp',
    data: {
      url: '/'
    }
  };
  
  // Bildirimi göster
  const title = pushData.title || defaultTitle;
  const options = {
    ...defaultOptions,
    ...pushData
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Bildirime tıklama
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Bildirime Tıklandı');
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  // Bildirimi kapat
  notification.close();
  
  // Ek eylem varsa işle
  if (action) {
    // İleriki kullanım için ek eylemler eklenebilir
    console.log(`[Service Worker] Bildirim Eylemi: ${action}`);
  }
  
  // Tıklama işlemini beklet
  event.waitUntil(
    // Açık sekmelerden ilgili URL'e sahip olanı bul
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Yönlendirilecek URL
        const targetUrl = data.url || '/';
        
        // Açık sekmeleri kontrol et
        for (const client of clientList) {
          // Açık sekme varsa ve URL başlangıcı aynıysa fokusla
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            client.focus();
            // Doğru URL'de değilse yönlendir
            if (client.url !== self.location.origin + targetUrl) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
        
        // Hiç açık sekme yoksa yeni sekme aç
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Bilinmiyor, ancak eğer bildirimler gelmiyorsa 
// bazı mobil cihazlar bu olayda özel işlem gerektirebilir
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Bildirim Kapatıldı', event);
}); 