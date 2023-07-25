"use strict";

//*Static cache
const staticCache = "static-cache-v1";

//* Dynamic cache
const dynamicCache = "dynamic-cache-v1";

//* Assets to cache
const urlsToCache = [
  "/",
  "index.html",
  "offline.html",
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
  "imgs/icons/favicon.ico",
  "imgs/icons/favicon-16x16.png",
  "imgs/icons/favicon-32x32.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Bona+Nova:wght@700&display=swap",
  "manifest.json",
];

//* Install Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  // Wait until the assets are cached
  event.waitUntil(
    caches.open(staticCache).then((cache) => {
      console.log("Service Worker: Caching Files");
      cache.addAll(urlsToCache);
    })
  );
});

//* Activate Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
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
  console.log(event.request.url);
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
              return fetchRes;
            });
          })
          .catch((err) => {
            console.log(err, event.request.url);
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
