import { parseHash } from './router.js';
import { createStore } from './store.js';

export const APP_VERSION = '0.1.0';

const store = createStore(window.localStorage);
const view = document.getElementById('view');

// Baut DOM-Elemente. Texte werden immer als Text gesetzt (nie als HTML), damit Eingaben keinen Code einschleusen können.
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (value === true) el.setAttribute(key, '');
    else if (value !== false && value != null) el.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

const views = {
  '/': () => {
    const dog = store.getDog();
    return [
      h('h1', {}, dog ? `Hallo ${dog.name}!` : 'Willkommen bei Schnuffel'),
      h('p', {}, 'Schnuffel begleitet dich im Training mit deinem Jagdhund. Alle Daten bleiben auf deinem Gerät, die App funktioniert auch ohne Empfang.'),
      dog
        ? h('a', { class: 'button', href: '#/training' }, 'Zum Training')
        : h('a', { class: 'button', href: '#/hund' }, 'Hund erfassen'),
    ];
  },

  '/hund': () => {
    const dog = store.getDog();
    const message = h('p', { class: 'message', role: 'status' });
    const form = h(
      'form',
      {
        class: 'card',
        novalidate: true,
        onsubmit: (event) => {
          event.preventDefault();
          const data = Object.fromEntries(new FormData(form));
          try {
            const saved = store.saveDog(data);
            message.className = 'message ok';
            message.textContent = `${saved.name} ist gespeichert.`;
          } catch (error) {
            message.className = 'message error';
            message.textContent = error.message;
          }
        },
      },
      h('label', { for: 'dog-name' }, 'Name'),
      h('input', { id: 'dog-name', name: 'name', required: true, maxlength: '60', autocomplete: 'off', value: dog?.name ?? '' }),
      h('label', { for: 'dog-breed' }, 'Rasse (optional)'),
      h('input', { id: 'dog-breed', name: 'breed', maxlength: '80', autocomplete: 'off', value: dog?.breed ?? '' }),
      h('label', { for: 'dog-birth' }, 'Geburtsdatum (optional)'),
      h('input', { id: 'dog-birth', name: 'birthDate', type: 'date', value: dog?.birthDate ?? '' }),
      h('button', { type: 'submit' }, 'Speichern'),
      message,
    );
    return [h('h1', {}, 'Mein Hund'), form];
  },

  '/training': () => [
    h('h1', {}, 'Training'),
    h('p', { class: 'card' }, 'Hier entstehen in den nächsten Etappen das Trainingstagebuch und die Übungen. Fachliche Inhalte werden erst aufgenommen, wenn sie geprüft sind.'),
  ],

  '/info': () => [
    h('h1', {}, 'Info'),
    h('p', {}, `Version ${APP_VERSION}`),
    h('p', {}, 'Deine Daten werden nur lokal in diesem Browser gespeichert. Wenn du die Browserdaten löschst, sind sie weg.'),
    h('p', { id: 'sw-status' }, 'Offline-Modus: wird geprüft …'),
  ],
};

function render() {
  const path = parseHash(location.hash);
  if (!path) {
    location.replace('#/');
    return;
  }
  view.replaceChildren(...views[path]());
  for (const link of document.querySelectorAll('.tabbar a')) {
    if (link.dataset.route === path) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (path === '/info') updateSwStatus();
  view.focus({ preventScroll: true });
}

function updateSwStatus() {
  const el = document.getElementById('sw-status');
  if (!el) return;
  if (!('serviceWorker' in navigator)) el.textContent = 'Offline-Modus: von diesem Browser nicht unterstützt.';
  else if (navigator.serviceWorker.controller) el.textContent = 'Offline-Modus: bereit.';
  else el.textContent = 'Offline-Modus: wird eingerichtet. Lade die App einmal neu.';
}

function updateOnlineBadge() {
  document.getElementById('offline-badge').hidden = navigator.onLine;
}

window.addEventListener('hashchange', render);
window.addEventListener('online', updateOnlineBadge);
window.addEventListener('offline', updateOnlineBadge);
updateOnlineBadge();
render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch((error) => console.warn('Service Worker nicht registriert:', error));
  navigator.serviceWorker.addEventListener('controllerchange', updateSwStatus);
}

// Bittet den Browser, die lokalen Daten nicht automatisch zu löschen (wird nicht überall gewährt).
navigator.storage?.persist?.().catch(() => {});
