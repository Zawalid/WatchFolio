"use strict";const staticCache="static-cache-v0";const dynamicCache="dynamic-cache-v0";const urlsToCache=["/","index.html","offline.html","authentication.html","404.html","style.min.css","main.min.js","auth.min.js","firebaseApp.min.js","utilities.min.js","show.min.js","watchList.min.js","favoritesList.min.js","download.min.js","imgs/offline.svg","imgs/Logo.png","imgs/bg.jpg","imgs/undraw_no_data_re_kwbl.svg","imgs/no_result.png","imgs/json.png","imgs/no profile.png","imgs/wrong.svg","imgs/placeHolder.png","imgs/urban-line-404-1.gif","imgs/Google Logo.svg","favicon.ico","imgs/icons/favicon-16x16.png","imgs/icons/favicon-32x32.png","https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css","https://fonts.googleapis.com/css2?family=Bona+Nova:wght@700&display=swap","manifest.json","https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js","https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js","https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js"];const limitDynamicCacheSize=()=>{const cacheLimit=100;caches.open(dynamicCache).then(cache=>{cache.keys().then(keys=>{const numKeys=keys.length;if(numKeys>cacheLimit){const keysToDelete=keys.slice(0,numKeys-cacheLimit);let deletePromises=keysToDelete.map(key=>cache.delete(key));Promise.all(deletePromises).then(()=>limitDynamicCacheSize())}})})};self.addEventListener("install",event=>{event.waitUntil(caches.open(staticCache).then(cache=>{cache.addAll(urlsToCache)}).catch(err=>console.log(err)))});self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>{return Promise.all(keys.filter(key=>key!==staticCache&&key!==dynamicCache).map(key=>caches.delete(key)))}))});self.addEventListener("fetch",event=>{console.log(event);event.respondWith(caches.match(event.request).then(cacheRes=>{return cacheRes||fetch(event.request).then(fetchRes=>{return caches.open(dynamicCache).then(cache=>{cache.put(event.request.url,fetchRes.clone());limitDynamicCacheSize();return fetchRes})}).catch(err=>{if(event.request.url.includes(".html") || event.request.url.includes("show")){ return caches.match("offline.html")}else if(event.request.url.includes(".png")||event.request.url.includes(".jpg")){return caches.match("imgs/placeHolder.png")}})}))});