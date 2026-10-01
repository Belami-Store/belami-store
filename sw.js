// Belami POS Service Worker for background notifications
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('admin.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/admin.html');
      }
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: '🔔 طلب جديد وصل!', body: 'وصل طلب جديد في متجر بيلامي' };
  try {
    if (event.data) data = event.data.json();
  } catch(e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'assets/chocolate_by_kilo.jpg',
      badge: 'assets/chocolate_by_kilo.jpg',
      requireInteraction: true,
      tag: 'order-alert'
    })
  );
});
