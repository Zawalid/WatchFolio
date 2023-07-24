"use strict";

const CACHE_NAME = "shell-cache-v2";

const urlsToCache = [
  "/",
  "index.html",
  "offline.html",
  "css/style.css",
  "css/all.min.css",
  "js/watchList.js",
  "js/main.js",
  "js/download.js",
  "imgs/offline.svg",
  "imgs/bg.jpg",
  "imgs/undraw_no_data_re_kwbl.svg",
  "imgs/no result search icon.png",
  "imgs/json.png",
  "webfonts/fa-solid-900.ttf",
  "webfonts/fa-solid-900.woff2",
  "https://fonts.googleapis.com/css2?family=Bona+Nova:wght@700&display=swap",
];
//* Install Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching Files");
        cache.addAll(urlsToCache);
      })
      .catch((err) => console.log(err.message))
  );
});

//* Activate Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

//* Fetch Service Worker
self.addEventListener("fetch", (event) => {
  console.log("Service Worker: Fetching");
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(event.request)
          .then((fetchRes) => {
            return fetchRes;
          })
          .catch((err) => {
            console.log(err, event.request.url);
            if (event.request.url.includes(".html")) {
              console.log(777);
              return caches.match("offline.html");
            }
          })
      );
    })
  );
});
