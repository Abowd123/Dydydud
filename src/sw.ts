/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

// ملفات التطبيق (تتولد وقت البناء)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/auth\//, /^\/landing/, /^\/\.well-known\//, /^\/(robots\.txt|sitemap\.xml)$/] }));

// الخطوط
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts', plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 31536000 })] })
);

// فيديوهات وصور التمارين (نفس الكاش اللي يعبيه prefetchWeekMedia)
registerRoute(
  ({ request, url }) => (request.destination === 'video' || request.destination === 'image') && url.pathname.startsWith('/media/'),
  new CacheFirst({
    cacheName: 'media',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] }), new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 2592000 })]
  })
);

// فحص الأداء: موديل الكاميرا وملفات wasm تتخزن أول مرة وبعدها تشتغل بدون نت
registerRoute(
  ({ url }) => url.pathname.startsWith('/models/') || url.pathname.startsWith('/mediapipe/'),
  new CacheFirst({ cacheName: 'pose-model', plugins: [new CacheableResponsePlugin({ statuses: [0, 200] }), new ExpirationPlugin({ maxEntries: 10 })] })
);

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

// إشعارات السيرفر
self.addEventListener('push', (event) => {
  const data = (() => { try { return event.data?.json() ?? {}; } catch { return { title: 'GymMate', body: event.data?.text() }; } })();
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'GymMate', {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url ?? '/' },
      tag: data.tag ?? data.url
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data?.url as string) ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => 'focus' in c) as WindowClient | undefined;
      if (open) return open.navigate(url).then((c) => c?.focus());
      return self.clients.openWindow(url);
    })
  );
});
