// PsikoRan Service Worker
const CACHE_VERSION = 'v1.2';
const CACHE_NAME = `psikoran-${CACHE_VERSION}`;

// Önbelleğe alınacak temel dosyaların listesi
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/favicon/logo.png',
  '/assets/icons/android-chrome-192x192.png',
  '/assets/icons/android-chrome-512x512.png'
];

// Desteklenen URL şemaları
const SUPPORTED_SCHEMES = ['http', 'https'];

// URL şemasını kontrol et
function isValidScheme(url) {
  try {
    const urlObj = new URL(url);
    return SUPPORTED_SCHEMES.includes(urlObj.protocol.replace(':', ''));
  } catch (e) {
    return false;
  }
}

// Mesaj işleme - Güncelleme ve diğer iletişim için
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Service Worker kurulumunda önbelleğe alma
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Service Worker etkinleştirildiğinde eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch olayı - önbellek stratejisi
self.addEventListener('fetch', (event) => {
  // URL şeması desteklenmiyorsa işlemi pas geç
  if (!isValidScheme(event.request.url)) {
    return;
  }

  // API isteklerini atlayalım
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Supabase isteklerini atlayalım
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Navigation preload'ı beklemek için waitUntil kullanımı
  if (event.request.mode === 'navigate' && event.preloadResponse) {
    event.waitUntil(
      event.preloadResponse.then((preloadResponse) => {
        if (preloadResponse) {
          return preloadResponse;
        }
      }).catch(() => {
        // Preload hatası
      })
    );
  }

  // Görseller için Cache First stratejisi
  if (
    event.request.destination === 'image' ||
    event.request.url.match(/\.(png|jpg|jpeg|svg|webp|ico|gif)$/)
  ) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request)
            .then((fetchResponse) => {
              // Sadece geçerli şemalar için cache.put işlemi yap
              if (isValidScheme(event.request.url)) {
                return caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                  });
              }
              return fetchResponse;
            })
            .catch(() => {
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // CSS, JS gibi statik içerik için de Cache First stratejisi
  if (event.request.url.match(/\.(css|js|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request)
            .then((fetchResponse) => {
              if (isValidScheme(event.request.url)) {
                return caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                  });
              }
              return fetchResponse;
            });
        })
    );
    return;
  }

  // HTML için Network First stratejisi
  if (event.request.mode === 'navigate' || event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((fetchResponse) => {
          // Başarılı yanıtı önbelleğe alalım
          if (isValidScheme(event.request.url)) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return fetchResponse;
        })
        .catch(() => {
          // Çevrimdışı ise önbellekten servise edelim
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Diğer tüm istekler için Network First
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
  let pushData = {};
  
  try {
    // Push verisini al
    if (event.data) {
      pushData = event.data.json();
    }
  } catch (e) {
    // JSON olarak ayrıştırılamayan veri için metin almayı dene
    if (event.data) {
      pushData = {
        title: 'PsikoRan',
        body: event.data.text() || 'Yeni bir bildirim alındı',
        data: { url: '/' }
      };
    }
  }
  
  // Varsayılan bildirim içeriği
  const defaultTitle = 'PsikoRan';
  const defaultOptions = {
    body: 'Yeni bir bildiriminiz var.',
    icon: '/assets/icons/android-chrome-192x192.png',
    badge: '/assets/favicon/logo.png',
    vibrate: [100, 50, 100], // Titreşim
    silent: false, // Sessiz mod kapalı - ses çalacak
    timestamp: Date.now(), // Zaman damgası eklendi
    actions: [{ // Bildirime eylemler ekle
      action: 'view',
      title: 'Görüntüle'
    }],
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
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  // Bildirimi kapat
  notification.close();
  
  // Bildirim eylemine göre işlem yap
  if (action === 'view' || !action) {
    const urlToOpen = data.url || '/';
    
    // Mevcut sekmeyi kontrol et
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((windowClients) => {
        // Açık olan bir sekme varsa, onu kullan
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        
        // Açık sekme yoksa, yeni bir sekme aç
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// IndexedDB ve LocalStorage ile Offline Senkronizasyon
// Basit IndexedDB veritabanı kurulumu
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('psikoran-offline-db', 1);
    
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      
      // Randevular için store
      if (!db.objectStoreNames.contains('pending-appointments')) {
        db.createObjectStore('pending-appointments', { keyPath: 'id', autoIncrement: true });
      }
      
      // Notlar için store
      if (!db.objectStoreNames.contains('pending-notes')) {
        db.createObjectStore('pending-notes', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    
    request.onerror = function(event) {
      reject('IndexedDB açılırken hata: ' + event.target.errorCode);
    };
  });
}

// Senkronizasyon etkinleştiğinde tetiklenecek
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  } else if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

// Randevuları senkronize et
async function syncAppointments() {
  try {
    const db = await openDB();
    const tx = db.transaction('pending-appointments', 'readwrite');
    const store = tx.objectStore('pending-appointments');
    
    const pendingAppointments = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const appointment of pendingAppointments) {
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointment)
        });
        
        if (response.ok) {
          await new Promise((resolve, reject) => {
            const request = store.delete(appointment.id);
            request.onsuccess = resolve;
            request.onerror = reject;
          });
        }
      } catch (error) {
        // Daha sonra yeniden deneyecek
      }
    }
  } catch (error) {
    // Senkronizasyon hatası
  }
}

// Notları senkronize et
async function syncNotes() {
  try {
    const db = await openDB();
    const tx = db.transaction('pending-notes', 'readwrite');
    const store = tx.objectStore('pending-notes');
    
    const pendingNotes = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const note of pendingNotes) {
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(note)
        });
        
        if (response.ok) {
          await new Promise((resolve, reject) => {
            const request = store.delete(note.id);
            request.onsuccess = resolve;
            request.onerror = reject;
          });
        }
      } catch (error) {
        // Daha sonra yeniden deneyecek
      }
    }
  } catch (error) {
    // Senkronizasyon hatası
  }
} 