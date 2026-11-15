
const CACHE = 'garangodaaki-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key.startsWith('garangodaaki-') && key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (
    e.request.method === 'GET' &&
    new URL(e.request.url).origin === location.origin
  ) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});

self.addEventListener('push', e => {
  let data = {};

  try {
    data = e.data ? e.data.json() : {};
  } catch (error) {
    data = { body: e.data ? e.data.text() : '' };
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

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || './';
  e.waitUntil(self.clients.openWindow(url));
});
