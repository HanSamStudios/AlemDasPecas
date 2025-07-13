// Define um nome para o nosso cache
const CACHE_NAME = 'meu-jogo-cache-v1';

// Lista de arquivos que queremos guardar em cache
const urlsToCache = [
  '/',
  './index.html',
  './main.css', // Substitua pelo nome do seu arquivo CSS
  './manifest.json',   // Substitua pelo nome do seu arquivo JS principal
   './js/axios.min.js',
  './js/phaser.min.js',
  './js/index.js',
  './js/abertura.js',
  './js/config.js',
  './js/fase1.js',
  './js/final-perdeu.js',
  './js/final-unico.js',
  './js/precarregamento.js',
  './js/sala.js',
  './js/rexvirtualjoystickplugin.min.js',
  './assets/icon.png',
  './assets/icone.png',
 './assets/mapa/mapa.json',
  './assets/mapa/arvore.png',
  './assets/mapa/tp.png',
  './assets/objetivo.png',
  './assets/mapa/chao.png',
  './assets/mapa/fantasm.png',
  './assets/mapa/placaa.png',
  './assets/mapa/flores.png',
  './assets/jump.png',
  './assets/cemiterio.png',
  './assets/plataforma.png',
  './assets/dash.png',
  './assets/fundo2.png',
  './assets/coracao.png',
  './assets/mapa/casa.png',
  './assets/parallax/back.png',
  './assets/repeat.png',
  './assets/mapa/vaso.png',
  './assets/mapa/espinhos.png',
  './assets/foxmalmorte.png',
  './assets/flag.png',
  './assets/greencrystal.png',
  './assets/perde.png',
  './assets/passarinho.png',
  './assets/passarinho-dano.png',
  './assets/musicaa.mp3',
  './assets/horror.mp3',
  './assets/fantasma.mp3',
  './assets/dashsound.mp3',
  './assets/crystalsound.mp3',
  './assets/jumpsound.mp3',
  './assets/morte.mp3',
  './assets/passarosound.mp3',
  './assets/ceu.jpg',
  './assets/mapa/bomba.png',
  './assets/Spritesheet.png',
  './assets/foxroxo.png',
  './assets/foxmal.png',
  './assets/fullscreen.png',
  './assets/escolha.png',
   './assets/game-over.ttf',
];


// 3. Instalando o Service Worker e salvando os arquivos em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto!');
        return cache.addAll(urlsToCache);
      })
  );
});

// 4. Interceptando as requisições e servindo os arquivos do cache (estratégia "Cache First")
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se a resposta estiver no cache, retorna ela.
        // Se não, faz a requisição à rede.
        return response || fetch(event.request);
      })
  );
});

// 5. Limpando caches antigos quando uma nova versão do Service Worker for ativada
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});