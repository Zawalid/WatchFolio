"use strict";

//*Static cache
const staticCache = "static-cache-v";

//* Dynamic cache
const dynamicCache = "dynamic-cache-v";

//* Assets to cache
const urlsToCache = [
  "/",
  "index.html",
  "offline.html",
  "404.html",
  "css/style.css",
  "js/main.js",
  "js/show.js",
  "js/watchList.js",
  "js/download.js",
  "imgs/offline.svg",
  "imgs/bg.jpg",
  "imgs/undraw_no_data_re_kwbl.svg",
  "imgs/no_result.png",
  "imgs/json.png",
  "imgs/wrong.svg",
  "imgs/placeHolder.png",
  "imgs/urban-line-404-1.gif",
  "imgs/icons/favicon.ico",
  "imgs/icons/favicon-16x16.png",
  "imgs/icons/favicon-32x32.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Bona+Nova:wght@700&display=swap",
  "manifest.json",
];

//* Limit the dynamic cache size function to 100 items
const limitDynamicCacheSize = () => {
  const cacheLimit = 100;

  caches.open(dynamicCache).then((cache) => {
    cache.keys().then((keys) => {
      const numKeys = keys.length;

      if (numKeys > cacheLimit) {
        const keysToDelete = keys.slice(0, numKeys - cacheLimit);
        let deletePromises = keysToDelete.map((key) => cache.delete(key));

        // Wait until all the delete operations are completed before calling the function again
        Promise.all(deletePromises).then(() => limitDynamicCacheSize());
      }
    });
  });
};

//* Install Service Worker
self.addEventListener("install", (event) => {
  // Wait until the assets are cached
  event.waitUntil(
    caches.open(staticCache).then((cache) => {
      cache.addAll(urlsToCache);
    })
  );
});

//* Activate Service Worker
self.addEventListener("activate", (event) => {
  // Wait until the old caches are deleted
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== staticCache && key !== dynamicCache)
          .map((key) => caches.delete(key))
      );
    })
  );
});

//* Fetch Service Worker
self.addEventListener("fetch", (event) => {
  // Return the cached response if it's not cached then try to fetch it and cache it to the dynamic cache (online)
  // Return the offline.html page if the the requested resource is a page (show.html/ / ..) (offline)
  // Return the placeholder.png if the the the requested resource is an image (offline)
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(event.request)
          .then((fetchRes) => {
            // We use the .clone() so that we can return the fetchRes (you can use it only once)
            return caches.open(dynamicCache).then((cache) => {
              cache.put(event.request.url, fetchRes.clone());
              limitDynamicCacheSize();
              return fetchRes;
            });
          })
          .catch((err) => {
            if (event.request.url.includes(".html")) {
              return caches.match("offline.html");
            } else if (
              event.request.url.includes(".png") ||
              event.request.url.includes(".jpg")
            ) {
              return caches.match("imgs/placeHolder.png");
            }
          })
      );
    })
  );
});
