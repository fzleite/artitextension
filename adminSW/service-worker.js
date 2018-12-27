var dataCacheName = 'artitextension_manager-v1';

var cacheName = 'htmlComponents';

var filesToCache = [
  'index.html',
  'admin.html',
  'js/admin.js',
  'js/login.js',
  'js/jquery-3.2.1.min.js',
  'js/materialize.min.js',
  'css/materialize.min.css',
  'css/artitextension.css',
  'images/user_bkg.png',
  'images/user_bkg2.png',
  'images/artit_bkg.png',
  'images/www.png',
  'images/icons/icon-72x72.png',
  'images/icons/icon-96x96.png',
  'images/icons/icon-128x128.png',
  'images/icons/icon-192x192.png'
];

/**
 * Install Event 
 */
self.addEventListener('install', event => {

  console.log('[ServiceWorker] Art IT Extension Manager: Instalando Service Worker');

  event.waitUntil(
    caches.open(cacheName).then( cache => {
      console.log('[ServiceWorker] Art IT Extension Manager: Criando Cache');
      return cache.addAll(filesToCache);
    }).catch(err => {
      console.log('[ServiceWorker] Art IT Extension Manager: Erro ao Criar Cache ( ' + err + ' )');
    })
  );
});


/**
 * Activate Event 
 */
 self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Art IT Extension Manager: Ativando serviço');
    event.waitUntil(
        caches.keys().then( keyList => {
            return Promise.all( keyList.map( key => {
                if (key !== cacheName && key !== dataCacheName ) {
                    console.log('[ServiceWorker] Art IT Extension Manager: Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    
    return self.clients.claim();
});


/**
 * Fetch event
 */
 self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] Art IT Extension Manager: Fetching ( ' +  event.request + ')');
    event.respondWith(
        caches.match(event.request)
                .then( response => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                })
    );
});