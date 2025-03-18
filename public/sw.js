// Service Worker dosyası
const CACHE_NAME = 'psiran-app-v1';

// Önbelleğe alınacak dosyaları belirle
// Vite PWA eklentisi bu kısmı otomatik olarak yönetecek
const precacheResources = [];

// Service Worker yüklendiğinde
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  // Service Worker'ı hemen aktifleştir
  self.skipWaiting();
  
  // Önbellek işlemleri (Vite PWA tarafından yönetiliyor)
});

// Service Worker aktifleştiğinde
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  // Tüm istemcileri kontrol al
  event.waitUntil(self.clients.claim());
  
  // Eski önbellekleri temizle
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch olaylarını yakala
self.addEventListener('fetch', (event) => {
  // Vite PWA bu kısmı yönetiyor, bu yüzden ekstra bir şey yapmıyoruz
});

// Push bildirimlerini yakala
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  if (!event.data) {
    console.warn('Push olayı veri içermiyor');
    return;
  }
  
  // Bildirim verilerini al
  const data = event.data.json();
  
  // Bildirim gösterme işlemini guarantee et
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/logo192.png',
      badge: data.badge || '/favicon.svg',
      data: data.data || {},
      vibrate: [100, 50, 100], // Titreşim paterni (ms)
      actions: data.actions || [],
    })
  );
});

// Bildirime tıklanınca
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');
  
  // Bildirimi kapat
  event.notification.close();
  
  // Bildirime tıklandığında özel URL açılması
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        // Açık bir pencere var mı kontrol et
        for (const client of clientList) {
          // Eğer açık bir pencere varsa, o pencereyi öne getir ve URL'i değiştir
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(event.notification.data.url);
            return;
          }
        }
        
        // Eğer açık bir pencere yoksa, yeni bir pencere aç
        if (self.clients.openWindow) {
          return self.clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// Randevu hatırlatma bildirimleri için zamanlayıcı
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-appointments') {
    event.waitUntil(checkUpcomingAppointments());
  }
});

// Yaklaşan randevuları kontrol eden fonksiyon
// Bu fonksiyon sınırlı olacak, gerçek uygulama için backend'e API çağrısı yapılmalı
async function checkUpcomingAppointments() {
  console.log('Checking upcoming appointments from service worker');
  // Service worker'dan veritabanına doğrudan erişim olmadığı için,
  // bu kısımda backend API'ye bir istek yapılmalı
  // veya IndexedDB kullanılarak client tarafından aktarılan verilere erişilmeli
}

// Bağlantı durumu değişiklikleri
self.addEventListener('online', () => {
  console.log('App is online');
});

self.addEventListener('offline', () => {
  console.log('App is offline');
});

// Sync olayları (background sync API)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }
});

// Randevuları senkronize eden fonksiyon
async function syncAppointments() {
  console.log('Syncing appointments from service worker');
  // Background sync için uygulama mantığı
}

// Service Worker'ı güncel tut
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 