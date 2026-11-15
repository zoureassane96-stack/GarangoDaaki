
const CACHE = 'garangodaaki-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(['./', './index.html', './manifest.json'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  if (
    e.request.method === 'GET' &&
    new URL(e.request.url).origin === location.origin
  ) {
    e.respondWith(
      caches.match(e.request).then(r =>
        r || fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
  }
});

// Réception des notifications Push
self.addEventListener('push', e => {
  let data = {};

  try {
    data = e.data ? e.data.json() : {};
  } catch (error) {
    data = {
      body: e.data ? e.data.text() : ''
    };
  }

  e.waitUntil(
    self.registration.showNotification(
      data.title || 'GarangoDaaki',
      {
        body: data.body || 'Vous avez reçu un nouveau message.',
        icon: './afrikora-192.png',
        data: { url: data.url || './' }
      }
    )
  );
});

// Ouverture du site en cliquant sur la notification
self.addEventListener('notificationclick', e => {
  e.notification.close();

  const url = e.notification.data?.url || './';

  e.waitUntil(self.clients.openWindow(url));
});
