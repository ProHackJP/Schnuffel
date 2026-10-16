import { parseHash, tabFor } from './router.js';
import { createStore, DATA_KEY, RATINGS } from './store.js';
import { openBrowserBackend } from './storage.js';

export const APP_VERSION = '0.2.0';

// Nur Vorschläge zur schnelleren Eingabe, jede andere Angabe ist ebenfalls möglich.
const GAME_SUGGESTIONS = ['Reh', 'Rothirsch', 'Gämse', 'Wildschwein', 'Fuchs', 'Feldhase', 'Kaninchen', 'Fasan', 'Rebhuhn', 'Stockente', 'Taube'];

const view = document.getElementById('view');
const storeReady = openBrowserBackend(DATA_KEY).then(createStore);

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

function field(id, label, input) {
  return [h('label', { for: id }, label), input];
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('de-CH', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d));
}

function ratingText(rating) {
  return rating ? `${rating}/5` : null;
}

const views = {
  async start(store) {
    const dog = await store.getDog();
    return [
      h('h1', {}, dog ? `Hallo ${dog.name}!` : 'Willkommen bei Schnuffel'),
      h('p', {}, 'Schnuffel begleitet dich im Training mit deinem Jagdhund. Alle Daten bleiben auf deinem Gerät, die App funktioniert auch ohne Empfang.'),
      dog
        ? h('a', { class: 'button', href: '#/training/neu' }, 'Training erfassen')
        : h('a', { class: 'button', href: '#/hund' }, 'Hund erfassen'),
    ];
  },

  async hund(store) {
    const dog = await store.getDog();
    const message = h('p', { class: 'message', role: 'status' });
    const form = h(
      'form',
      {
        class: 'card',
        novalidate: true,
        onsubmit: async (event) => {
          event.preventDefault();
          try {
            const saved = await store.saveDog(Object.fromEntries(new FormData(form)));
            showMessage(message, 'ok', `${saved.name} ist gespeichert.`);
          } catch (error) {
            showMessage(message, 'error', error.message);
          }
        },
      },
      field('dog-name', 'Name', h('input', { id: 'dog-name', name: 'name', required: true, maxlength: '60', autocomplete: 'off', value: dog?.name ?? '' })),
      field('dog-breed', 'Rasse (optional)', h('input', { id: 'dog-breed', name: 'breed', maxlength: '80', autocomplete: 'off', value: dog?.breed ?? '' })),
      field('dog-birth', 'Geburtsdatum (optional)', h('input', { id: 'dog-birth', name: 'birthDate', type: 'date', value: dog?.birthDate ?? '' })),
      h('button', { type: 'submit' }, 'Speichern'),
      message,
    );
    return [h('h1', {}, 'Mein Hund'), form];
  },

  async training(store) {
    const dog = await store.getDog();
    if (!dog) {
      return [
        h('h1', {}, 'Training'),
        h('p', { class: 'card' }, 'Erfasse zuerst deinen Hund, dann kannst du Trainings eintragen.'),
        h('a', { class: 'button', href: '#/hund' }, 'Hund erfassen'),
      ];
    }
    const sessions = await store.listSessions();
    return [
      h('div', { class: 'title-row' }, h('h1', {}, 'Training'), h('a', { class: 'button small', href: '#/training/neu' }, 'Neue Einheit')),
      sessions.length === 0
        ? h('p', { class: 'card' }, 'Noch keine Einheiten erfasst.')
        : h('ul', { class: 'session-list', 'aria-label': 'Trainingseinheiten' }, sessions.map(sessionItem)),
    ];
  },

  async 'training-neu'(store) {
    if (!(await store.getDog())) {
      location.replace('#/training');
      return [];
    }
    return [h('h1', {}, 'Neue Einheit'), await sessionForm(store, null)];
  },

  async 'training-edit'(store, route) {
    const session = await store.getSession(route.id);
    if (!session) {
      return [h('h1', {}, 'Einheit nicht gefunden'), h('a', { class: 'button', href: '#/training' }, 'Zur Übersicht')];
    }
    return [h('h1', {}, 'Einheit bearbeiten'), await sessionForm(store, session)];
  },

  async info() {
    return [
      h('h1', {}, 'Info'),
      h('p', {}, `Version ${APP_VERSION}`),
      h('p', {}, 'Deine Daten werden nur lokal in diesem Browser gespeichert. Wenn du die Browserdaten löschst, sind sie weg.'),
      h('p', { id: 'sw-status' }, 'Offline-Modus: wird geprüft …'),
    ];
  },
};

function sessionItem(session) {
  const meta = [session.durationMin ? `${session.durationMin} Min.` : null, session.location || null].filter(Boolean).join(' · ');
  return h(
    'li',
    {},
    h(
      'a',
      { class: 'card session', href: `#/training/${session.id}` },
      h('strong', {}, formatDate(session.date)),
      meta && h('span', { class: 'muted' }, meta),
      h(
        'ul',
        { class: 'exercise-summary' },
        session.exercises.map((e) =>
          h('li', {}, e.name, e.game && h('span', { class: 'muted' }, ` · ${e.game}`), e.rating && h('span', { class: 'rating' }, ratingText(e.rating))),
        ),
      ),
    ),
  );
}

async function sessionForm(store, session) {
  const message = h('p', { class: 'message', role: 'status' });
  const exerciseList = h('div', { class: 'exercises' });
  const knownNames = [...new Set((await store.listSessions()).flatMap((s) => s.exercises.map((e) => e.name)))];

  function renumber() {
    [...exerciseList.children].forEach((fs, i) => {
      fs.querySelector('legend').textContent = `Übung ${i + 1}`;
      fs.querySelector('.remove').hidden = exerciseList.children.length === 1;
    });
  }

  function addExercise(exercise = {}) {
    const n = crypto.randomUUID?.() ?? String(Math.random()).slice(2);
    const fs = h(
      'fieldset',
      { class: 'exercise' },
      h('legend', {}, 'Übung'),
      field(`ex-name-${n}`, 'Bezeichnung', h('input', { id: `ex-name-${n}`, 'data-field': 'name', list: 'exercise-names', maxlength: '120', autocomplete: 'off', value: exercise.name ?? '' })),
      field(`ex-game-${n}`, 'Wildart (optional)', h('input', { id: `ex-game-${n}`, 'data-field': 'game', list: 'game-suggestions', maxlength: '60', autocomplete: 'off', value: exercise.game ?? '' })),
      field(
        `ex-rating-${n}`,
        'Bewertung (optional)',
        h(
          'select',
          { id: `ex-rating-${n}`, 'data-field': 'rating' },
          h('option', { value: '' }, 'keine'),
          RATINGS.map((r) => h('option', { value: String(r), selected: exercise.rating === r }, `${r} von 5`)),
        ),
      ),
      field(`ex-notes-${n}`, 'Notiz zur Übung (optional)', h('textarea', { id: `ex-notes-${n}`, 'data-field': 'notes', rows: '2', maxlength: '500' }, exercise.notes ?? '')),
      h('button', { type: 'button', class: 'link remove', onclick: () => { fs.remove(); renumber(); } }, 'Übung entfernen'),
    );
    exerciseList.append(fs);
    renumber();
    return fs;
  }

  (session?.exercises.length ? session.exercises : [{}]).forEach(addExercise);

  const form = h(
    'form',
    {
      class: 'card',
      novalidate: true,
      onsubmit: async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.id = session?.id;
        data.exercises = [...exerciseList.children].map((fs) =>
          Object.fromEntries([...fs.querySelectorAll('[data-field]')].map((el) => [el.dataset.field, el.value])),
        );
        try {
          await store.saveSession(data);
          location.hash = '#/training';
        } catch (error) {
          showMessage(message, 'error', error.message);
        }
      },
    },
    field('s-date', 'Datum', h('input', { id: 's-date', name: 'date', type: 'date', required: true, value: session?.date ?? localToday() })),
    field('s-duration', 'Dauer in Minuten (optional)', h('input', { id: 's-duration', name: 'durationMin', type: 'number', inputmode: 'numeric', min: '1', max: '1440', value: session?.durationMin ?? '' })),
    field('s-location', 'Ort (optional)', h('input', { id: 's-location', name: 'location', maxlength: '120', value: session?.location ?? '' })),
    exerciseList,
    h('button', { type: 'button', class: 'secondary', onclick: () => addExercise().querySelector('input').focus() }, 'Übung hinzufügen'),
    field('s-notes', 'Notiz zur Einheit (optional)', h('textarea', { id: 's-notes', name: 'notes', rows: '3', maxlength: '2000' }, session?.notes ?? '')),
    h('datalist', { id: 'exercise-names' }, knownNames.map((name) => h('option', { value: name }))),
    h('datalist', { id: 'game-suggestions' }, GAME_SUGGESTIONS.map((name) => h('option', { value: name }))),
    h('button', { type: 'submit' }, 'Speichern'),
    message,
    session &&
      h(
        'button',
        {
          type: 'button',
          class: 'danger',
          onclick: async () => {
            if (!confirm('Diese Einheit wirklich löschen? Das lässt sich nicht rückgängig machen.')) return;
            await store.deleteSession(session.id);
            location.hash = '#/training';
          },
        },
        'Einheit löschen',
      ),
  );
  return form;
}

function showMessage(el, kind, text) {
  el.className = `message ${kind}`;
  el.textContent = text;
}

let renderCount = 0;

async function render() {
  const route = parseHash(location.hash);
  if (!route) {
    location.replace('#/');
    return;
  }
  const current = ++renderCount;
  const store = await storeReady;
  const content = await views[route.name](store, route);
  // Wurde in der Zwischenzeit weiter navigiert, gilt die neuere Ansicht.
  if (current !== renderCount) return;
  view.replaceChildren(...content);
  const tab = tabFor(route);
  for (const link of document.querySelectorAll('.tabbar a')) {
    if (link.dataset.route === tab) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (route.name === 'info') updateSwStatus();
  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
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
