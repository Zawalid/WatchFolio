"use strict";const staticCache="static-cache-v1",dynamicCache="dynamic-cache-v1",urlsToCache=["/","index.html","offline.html","authentication.html","404.html","style.min.css","main.min.js","auth.min.js","firebaseApp.min.js","utilities.min.js","show.min.js","watchList.min.js","favoritesList.min.js","download.min.js","imgs/offline.svg","imgs/bg.jpg","imgs/undraw_no_data_re_kwbl.svg","imgs/no_result.png","imgs/json.png","imgs/no profile.png","imgs/wrong.svg","imgs/placeHolder.png","imgs/urban-line-404-1.gif","imgs/Google Logo.svg","imgs/icons/favicon.ico","imgs/icons/favicon-16x16.png","imgs/icons/favicon-32x32.png","https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css","https://fonts.googleapis.com/css2?family=Bona+Nova:wght@700&display=swap","manifest.json","https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js","https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js","https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js"],limitDynamicCacheSize=()=>{caches.open(dynamicCache).then(i=>{i.keys().then(e=>{var s=e.length;100<s&&(e=e.slice(0,s-100).map(e=>i.delete(e)),Promise.all(e).then(()=>limitDynamicCacheSize()))})})};self.addEventListener("install",e=>{e.waitUntil(caches.open(staticCache).then(e=>{e.addAll(urlsToCache)}).catch(e=>console.log(e)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==staticCache&&e!==dynamicCache).map(e=>caches.delete(e)))))}),self.addEventListener("fetch",i=>{i.respondWith(caches.match(i.request).then(e=>e||fetch(i.request).then(s=>caches.open(dynamicCache).then(e=>(e.put(i.request.url,s.clone()),limitDynamicCacheSize(),s))).catch(e=>i.request.url.includes(".html")?caches.match("offline.html"):i.request.url.includes(".png")||i.request.url.includes(".jpg")?caches.match("imgs/placeHolder.png"):void 0)))});