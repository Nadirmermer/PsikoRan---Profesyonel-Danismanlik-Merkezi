// Service Worker Versiyonu
const CACHE_VERSION = 'v1';
const CACHE_NAME = `psikoran-${CACHE_VERSION}`;

// Önbelleğe alınacak dosyalar
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/offline.html',
  '/assets/logo/logo.png',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/maskable-icon-192x192.png',
  '/assets/icons/maskable-icon-512x512.png',
  '/assets/icons/apple-touch-icon-152x152.png',
  '/assets/icons/apple-touch-icon-167x167.png',
  '/assets/icons/apple-touch-icon-180x180.png'
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

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // console.log('Önbellek açıldı');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Service Worker aktivasyonu
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          // console.log('Eski önbellek siliniyor:', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      // console.log('Service Worker aktif edildi');
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
      }).catch((error) => {
        // console.error('Preload response error:', error);
      })
    );
  }

  // Görseller için Cache First stratejisi
  if (
    event.request.destination === 'image' ||
    event.request.url.includes('.png') ||
    event.request.url.includes('.jpg') ||
    event.request.url.includes('.svg') ||
    event.request.url.includes('.webp') ||
    event.request.url.includes('.ico')
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

  // HTML ve diğer statik dosyalar için Network First stratejisi
  event.respondWith(
    fetch(event.request)
      .then((fetchResponse) => {
        // Başarılı yanıtı önbelleğe alalım (sadece geçerli şemalar için)
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
            // Ana HTML dosyası veya başka bir HTML dosyası isteniyorsa offline.html'e yönlendirelim
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // Diğer durumlarda null dönelim
            return null;
          });
      })
  );
});

// Push Notification desteği
self.addEventListener('push', (event) => {
  if (!event.data) {
    // console.log('Push olayı verisiz alındı');
    return;
  }

  const notificationData = event.data.json();
  const title = notificationData.title || 'PsikoRan Bildirimi';
  const options = {
    body: notificationData.body || 'Yeni bir bildiriminiz var!',
    icon: notificationData.icon || '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: notificationData.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Görüntüle',
        icon: '/assets/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/assets/icons/xmark.png'
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Bildirim tıklanma olayı
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window'
    })
    .then((clientList) => {
      // Mevcut açık bir pencere varsa, odaklanalım
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Mevcut pencere yoksa, yeni bir pencere açalım
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Çevrimdışı senkronizasyon desteği
self.addEventListener('sync', (event) => {
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
    const pendingAppointments = await db.getAll('pendingAppointments');
    
    if (pendingAppointments.length === 0) {
      return;
    }
    
    const results = await Promise.allSettled(
      pendingAppointments.map(async (appointment) => {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointment)
        });
        
        if (response.ok) {
          await db.delete('pendingAppointments', appointment.id);
          return { success: true, id: appointment.id };
        } else {
          return { success: false, id: appointment.id };
        }
      })
    );
    
    // Başarılı senkronizasyon için bildirim gönder
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    
    if (successCount > 0) {
      self.registration.showNotification('Randevular Senkronize Edildi', {
        body: `${successCount} randevu başarıyla senkronize edildi.`,
        icon: '/assets/icons/icon-192x192.png'
      });
    }
  } catch (error) {
    // console.error('Randevu senkronizasyonu başarısız oldu:', error);
  }
}

// Notları senkronize et
async function syncNotes() {
  try {
    const db = await openDB();
    const pendingNotes = await db.getAll('pendingNotes');
    
    if (pendingNotes.length === 0) {
      return;
    }
    
    const results = await Promise.allSettled(
      pendingNotes.map(async (note) => {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(note)
        });
        
        if (response.ok) {
          await db.delete('pendingNotes', note.id);
          return { success: true, id: note.id };
        } else {
          return { success: false, id: note.id };
        }
      })
    );
    
    // Başarılı senkronizasyon için bildirim gönder
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    
    if (successCount > 0) {
      self.registration.showNotification('Notlar Senkronize Edildi', {
        body: `${successCount} not başarıyla senkronize edildi.`,
        icon: '/assets/icons/icon-192x192.png'
      });
    }
  } catch (error) {
    // console.error('Not senkronizasyonu başarısız oldu:', error);
  }
}

// IndexedDB erişimi için yardımcı fonksiyon
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('psikoran-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Depolar oluşturulmamışsa oluşturalım
      if (!db.objectStoreNames.contains('pendingAppointments')) {
        db.createObjectStore('pendingAppointments', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingNotes')) {
        db.createObjectStore('pendingNotes', { keyPath: 'id' });
      }
    };
  });
} 