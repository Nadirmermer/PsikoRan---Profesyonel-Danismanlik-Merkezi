// PsikoRan Service Worker
// PWA için önbellek ve çevrimdışı destekli service worker

// Workbox tarafından önbelleğe alınacak varlık listesi
// Bu kısım VitePWA tarafından derleme sırasında doldurulacak
self.__WB_MANIFEST;

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  static: `psikoRan-static-${CACHE_VERSION}`,
  dynamic: `psikoRan-dynamic-${CACHE_VERSION}`,
  api: `psikoRan-api-${CACHE_VERSION}`,
  pages: `psikoRan-pages-${CACHE_VERSION}`
};

// Çevrimdışında her zaman erişilebilir olması gereken temel varlıklar
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/assets/meta/config/manifest.json',
  '/assets/meta/config/site.webmanifest'
];

// Service Worker yüklendiğinde
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Yükleniyor...');
  
  // Önceden önbelleğe alınmış varlıkları yükle
  event.waitUntil(
    Promise.all([
      // Temel varlıkları önbelleğe al
      caches.open(CACHE_NAMES.static).then((cache) => {
        console.log('[Service Worker] Statik önbellek oluşturuluyor');
        return cache.addAll(CORE_ASSETS);
      })
    ])
    .then(() => {
      // Service Worker'ı hemen aktifleştir
      return self.skipWaiting();
    })
  );
});

// Service Worker aktifleştiğinde
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Etkinleştiriliyor...');
  
  // Eski önbellekleri temizle
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Sürümü eski olan önbellekleri temizle
            return cacheName.startsWith('psikoRan-') && 
                   !Object.values(CACHE_NAMES).includes(cacheName);
          })
          .map((cacheName) => {
            console.log('[Service Worker] Eski önbellek siliniyor:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => {
      // Tüm istemcileri kontrol al
      return self.clients.claim();
    })
  );
});

// Ağ isteklerini yakala
self.addEventListener('fetch', (event) => {
  // API istekleri
  if (event.request.url.includes('supabase.co')) {
    handleApiRequest(event);
    return;
  }
  
  // Statik varlıklar
  if (isStaticAsset(event.request.url)) {
    handleStaticAssetRequest(event);
    return;
  }
  
  // HTML sayfaları
  if (isHtmlPageRequest(event.request)) {
    handleHtmlPageRequest(event);
    return;
  }
  
  // Diğer istekler için dinamik önbellek stratejisi
  handleDynamicRequest(event);
});

// Ağ istekleri için yardımcı fonksiyonlar
function isStaticAsset(url) {
  return url.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/);
}

function isHtmlPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && 
          request.headers.get('accept').includes('text/html'));
}

// API istekleri için ağ öncelikli strateji
function handleApiRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı yanıtı önbelleğe al
        if (response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAMES.api).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // Ağ hatası durumunda önbellekteki yanıtı dene
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Önbellekte yoksa ve çevrimdışıysa özel hata sayfası göster
          return caches.match('/assets/pages/offline.html') || caches.match('/');
        });
      })
  );
}

// Statik varlıklar için önbellek öncelikli strateji
function handleStaticAssetRequest(event) {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Önbellekte varsa hemen dön
        return cachedResponse;
      }
      
      // Önbellekte yoksa ağdan al ve önbelleğe ekle
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Yanıtı önbelleğe al
        const clonedResponse = response.clone();
        caches.open(CACHE_NAMES.static).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        
        return response;
      }).catch(() => {
        // Ağ hatası durumunda benzer resim dosyası bul
        if (event.request.url.match(/\.(png|jpg|jpeg|svg|gif)$/)) {
          return caches.match('/favicon.ico');
        }
        return null;
      });
    })
  );
}

// HTML sayfaları için ağ öncelikli, önbellek yedekli strateji
function handleHtmlPageRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı yanıtı önbelleğe al
        if (response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAMES.pages).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // Ağ hatası durumunda önbellekteki yanıtı dene
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Çevrimdışı sayfası veya ana sayfa
          return caches.match('/assets/pages/offline.html') || caches.match('/');
        });
      })
  );
}

// Diğer varlıklar için dinamik önbellek stratejisi
function handleDynamicRequest(event) {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Önbellekte varsa ve geçerli ise kullan
      if (cachedResponse) {
        // Arka planda yenile
        fetch(event.request).then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAMES.dynamic).then((cache) => {
              cache.put(event.request, response);
            });
          }
        }).catch(() => {
          console.log('[Service Worker] Dinamik varlık yenilenemiyor');
        });
        
        return cachedResponse;
      }
      
      // Önbellekte yoksa ağdan al ve önbelleğe ekle
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Yanıtı önbelleğe al
        const clonedResponse = response.clone();
        caches.open(CACHE_NAMES.dynamic).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        
        return response;
      }).catch(() => {
        return null;
      });
    })
  );
}

// Push bildirimlerini yakala
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push bildirimi alındı');
  
  if (!event.data) {
    console.warn('[Service Worker] Push verisi yok');
    return;
  }
  
  // Bildirim verilerini al
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Yeni Bildirim',
      body: event.data.text(),
      icon: 'assets/pwa/logo_2-192x192.png',
      badge: 'assets/pwa/logo_2-70x70.png'
    };
  }
  
  // Bildirim gösterme işlemini garanti et
  event.waitUntil(
    self.registration.showNotification(data.title || 'PsikoRan Bildirimi', {
      body: data.body || 'Yeni bir bildiriminiz var',
      icon: data.icon || 'assets/pwa/logo_2-192x192.png',
      badge: data.badge || 'assets/pwa/logo_2-70x70.png',
      data: data.data || {},
      vibrate: [100, 50, 100], // Titreşim paterni (ms)
      actions: data.actions || [],
      tag: data.tag || 'default', // Aynı tag'e sahip bildirimler birleştirilir
      renotify: data.renotify || false, // Aynı tag ile yeni bildirim geldiğinde yeniden bildirilsin mi
      requireInteraction: data.requireInteraction || false, // Kullanıcı etkileşimi gerektirsin mi
    })
  );
});

// Bildirime tıklanınca
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Bildirime tıklandı');
  
  // Bildirimi kapat
  event.notification.close();
  
  // Bildirim action'ına göre işlev
  if (event.action) {
    console.log(`[Service Worker] Bildirim action: ${event.action}`);
    // Özel action işlevleri burada ele alınabilir
  }
  
  // Bildirime tıklandığında özel URL açılması
  const urlToOpen = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Açık bir pencere var mı kontrol et
      for (const client of clientList) {
        // Eğer açık bir pencere varsa, o pencereyi öne getir ve URL'i değiştir
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (client.url !== urlToOpen) {
            client.navigate(urlToOpen);
          }
          return;
        }
      }
      
      // Eğer açık bir pencere yoksa, yeni bir pencere aç
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Periyodik senkronizasyon
self.addEventListener('periodicsync', (event) => {
  console.log(`[Service Worker] Periyodik senkronizasyon: ${event.tag}`);
  
  if (event.tag === 'check-appointments') {
    event.waitUntil(checkUpcomingAppointments());
  }
});

// Yaklaşan randevuları kontrol eden fonksiyon
async function checkUpcomingAppointments() {
  console.log('[Service Worker] Yaklaşan randevular kontrol ediliyor');
  
  try {
    // IndexedDB'den kullanıcı bilgilerini al
    const userInfo = await getUserInfoFromIndexedDB();
    
    if (!userInfo || !userInfo.id) {
      console.log('[Service Worker] Kullanıcı oturumu bulunamadı');
      return;
    }
    
    // API'ye istek gönder
    const response = await fetch(`/api/appointments/upcoming?userId=${userInfo.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('API isteği başarısız');
    }
    
    const appointments = await response.json();
    
    // Randevuları işle ve bildirimleri göster
    for (const appointment of appointments) {
      // Bildirim göster
      await self.registration.showNotification('Yaklaşan Randevu', {
        body: `${appointment.client_name} ile ${new Date(appointment.start_time).toLocaleString('tr-TR')} tarihinde randevunuz var.`,
        icon: 'assets/pwa/logo_2-192x192.png',
        badge: 'assets/pwa/logo_2-70x70.png',
        data: {
          url: '/appointments/' + appointment.id,
          appointmentId: appointment.id
        },
        tag: `appointment-${appointment.id}`,
        vibrate: [100, 50, 100]
      });
    }
    
  } catch (error) {
    console.error('[Service Worker] Randevu kontrolü başarısız:', error);
  }
}

// IndexedDB'den kullanıcı bilgilerini al
async function getUserInfoFromIndexedDB() {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('psikoRan-db', 1);
      
      request.onerror = () => reject(new Error('IndexedDB açılamadı'));
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['userInfo'], 'readonly');
        const store = transaction.objectStore('userInfo');
        const getRequest = store.get('currentUser');
        
        getRequest.onerror = () => reject(new Error('Kullanıcı verisi bulunamadı'));
        getRequest.onsuccess = () => resolve(getRequest.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('userInfo')) {
          db.createObjectStore('userInfo');
        }
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Bağlantı durumu değişiklikleri
self.addEventListener('online', () => {
  console.log('[Service Worker] Uygulama çevrimiçi');
  // Çevrimiçine geçince bekleyen senkronizasyonları tetikle
  self.registration.sync.register('sync-pending-data');
});

self.addEventListener('offline', () => {
  console.log('[Service Worker] Uygulama çevrimdışı');
  // Çevrimdışı durumda kullanıcıya bildirim gösterilebilir
  // self.registration.showNotification('Çevrimdışı Modu', {
  //   body: 'İnternet bağlantınız kesildi. Verileriniz senkronize edilecek.',
  //   icon: 'favicon.ico'
  // });
});

// Sync olayları (background sync API)
self.addEventListener('sync', (event) => {
  console.log(`[Service Worker] Senkronizasyon: ${event.tag}`);
  
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  } else if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
});

// Randevuları senkronize eden fonksiyon
async function syncAppointments() {
  console.log('[Service Worker] Randevular senkronize ediliyor');
  
  try {
    // IndexedDB'den bekleyen randevuları al
    const pendingAppointments = await getPendingAppointmentsFromIndexedDB();
    
    if (!pendingAppointments || pendingAppointments.length === 0) {
      console.log('[Service Worker] Bekleyen randevu yok');
      return;
    }
    
    // Kullanıcı bilgilerini al
    const userInfo = await getUserInfoFromIndexedDB();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }
    
    // Her bir bekleyen randevuyu senkronize et
    for (const appointment of pendingAppointments) {
      const response = await fetch('/api/appointments', {
        method: appointment.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(appointment)
      });
      
      if (!response.ok) {
        throw new Error('Randevu senkronizasyonu başarısız');
      }
    }
    
  } catch (error) {
    console.error('[Service Worker] Randevu senkronizasyonu başarısız:', error);
  }
}

// Bekleyen randevuları IndexedDB'den al
async function getPendingAppointmentsFromIndexedDB() {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('psikoRan-db', 1);
      
      request.onerror = () => reject(new Error('IndexedDB açılamadı'));
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['appointments'], 'readwrite');
        const store = transaction.objectStore('appointments');
        const getRequest = store.getAll();
        
        getRequest.onerror = () => reject(new Error('Randevu verisi bulunamadı'));
        getRequest.onsuccess = () => resolve(getRequest.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('appointments')) {
          db.createObjectStore('appointments');
        }
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Bekleyen verileri senkronize eden fonksiyon
async function syncPendingData() {
  console.log('[Service Worker] Bekleyen veriler senkronize ediliyor');
  
  try {
    // IndexedDB'den bekleyen verileri al
    const pendingData = await getPendingDataFromIndexedDB();
    
    if (!pendingData || pendingData.length === 0) {
      console.log('[Service Worker] Bekleyen veri yok');
      return;
    }
    
    // Kullanıcı bilgilerini al
    const userInfo = await getUserInfoFromIndexedDB();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }
    
    // Her bir bekleyen veriyi senkronize et
    for (const data of pendingData) {
      const response = await fetch('/api/data', {
        method: data.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Veri senkronizasyonu başarısız');
      }
    }
    
  } catch (error) {
    console.error('[Service Worker] Veri senkronizasyonu başarısız:', error);
  }
}

// Bekleyen verileri IndexedDB'den al
async function getPendingDataFromIndexedDB() {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('psikoRan-db', 1);
      
      request.onerror = () => reject(new Error('IndexedDB açılamadı'));
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['pendingData'], 'readwrite');
        const store = transaction.objectStore('pendingData');
        const getRequest = store.getAll();
        
        getRequest.onerror = () => reject(new Error('Bekleyen veri bulunamadı'));
        getRequest.onsuccess = () => resolve(getRequest.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('pendingData')) {
          db.createObjectStore('pendingData');
        }
      };
    } catch (error) {
      reject(error);
    }
  });
}