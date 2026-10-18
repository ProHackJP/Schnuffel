import { parseHash, tabFor } from './router.js';
import { createStore, parseBackup, DATA_KEY, RATINGS, BACKUP_REMINDER_DAYS } from './store.js';
import { openBrowserBackend } from './storage.js';
import { SECTIONS, SOURCES, EXERCISE_SUGGESTIONS, GAPS, MAP_URL } from './content/herdenschutz.js';
import * as HSH from './content/hsh-ausbildung.js';
import { PLANS, getPlan, planExerciseNames, summarize } from './content/plans.js';

export const APP_VERSION = '0.6.0';

// Nur Vorschläge zur schnelleren Eingabe, jede andere Angabe ist ebenfalls möglich.
const GAME_SUGGESTIONS = ['Reh', 'Rothirsch', 'Gämse', 'Wildschwein', 'Fuchs', 'Feldhase', 'Kaninchen', 'Fasan', 'Rebhuhn', 'Stockente', 'Taube'];

const STEP_STATUS_OPTIONS = [
  { value: 'open', label: 'Offen' },
  { value: 'doing', label: 'In Arbeit' },
  { value: 'done', label: 'Geschafft' },
];

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
  for (const child of children.flat(Infinity)) {
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

function formatDateTime(date) {
  return new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function ratingText(rating) {
  return rating ? `${rating}/5` : null;
}

// Bietet ein Objekt als JSON-Datei zum Speichern an.
function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function countText(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

// Auswahl des aktiven Hundes. Erscheint nur, wenn es mehrere Hunde gibt.
async function dogBar(store) {
  const dogs = await store.listDogs();
  if (dogs.length < 2) return null;
  const active = await store.getDog();
  const select = h(
    'select',
    {
      id: 'active-dog',
      onchange: async () => {
        await store.setActiveDog(select.value);
        await render();
      },
    },
    dogs.map((d) => h('option', { value: d.id, selected: d.id === active.id }, d.name)),
  );
  return h('div', { class: 'dog-bar' }, h('label', { for: 'active-dog' }, 'Aktiver Hund'), select);
}

// Fortschritt je Übung aus dem Tagebuch: Anzahl Einträge und letzte Bewertung (Einheiten sind neueste zuerst).
function exerciseProgress(sessions) {
  const progress = new Map();
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const entry = progress.get(exercise.name) ?? { count: 0, lastRating: null };
      if (entry.count === 0) entry.lastRating = exercise.rating;
      entry.count += 1;
      progress.set(exercise.name, entry);
    }
  }
  return (name) => {
    const p = progress.get(name);
    if (!p) return 'noch nicht geübt';
    return `${p.count}× geübt${p.lastRating ? `, zuletzt ${p.lastRating}/5` : ''}`;
  };
}

// Kurzbezeichnungen der Quellen für den Fliesstext, ohne Doppelte.
function publishersOf(sources, ids) {
  const byId = Object.fromEntries(sources.map((s) => [s.id, s]));
  return [...new Set(ids.map((id) => byId[id].short ?? byId[id].publisher))].join(', ');
}

function sourceList(sources) {
  return h(
    'ul',
    { class: 'card rules sources', 'aria-label': 'Quellen' },
    sources.map((s) =>
      h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title), h('span', { class: 'muted' }, ` – ${s.publisher}, abgerufen am ${formatDate(s.retrieved)}`)),
    ),
  );
}

// Formular für einen neuen oder bestehenden Hund. Nach dem ersten Speichern ändert es denselben Hund weiter.
async function dogForm(store, dog) {
  const message = h('p', { class: 'message', role: 'status' });
  let currentId = dog?.id;
  let currentName = dog?.name;
  const sessionCount = dog ? (await store.listSessions(dog.id)).length : 0;
  const form = h(
    'form',
    {
      class: 'card',
      novalidate: true,
      onsubmit: async (event) => {
        event.preventDefault();
        try {
          const saved = await store.saveDog({ ...Object.fromEntries(new FormData(form)), id: currentId });
          currentId = saved.id;
          currentName = saved.name;
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
    dog &&
      h(
        'button',
        {
          type: 'button',
          class: 'danger',
          onclick: async () => {
            const what = `${currentName} wirklich löschen? Dabei werden auch ${countText(sessionCount, 'Einheit', 'Einheiten')} und der Planfortschritt dieses Hundes gelöscht. Das lässt sich nicht rückgängig machen.`;
            if (!confirm(what)) return;
            await store.deleteDog(dog.id);
            location.hash = '#/hund';
          },
        },
        'Hund löschen',
      ),
  );
  return form;
}

const views = {
  async start(store) {
    const dog = await store.getDog();
    const backupDue = await store.backupDue();
    return [
      h('h1', {}, dog ? `Hallo ${dog.name}!` : 'Willkommen bei Schnuffel'),
      h('p', {}, 'Schnuffel begleitet dich im Training mit deinem Jagdhund. Alle Daten bleiben auf deinem Gerät, die App funktioniert auch ohne Empfang.'),
      await dogBar(store),
      dog
        ? h('a', { class: 'button', href: '#/training/neu' }, 'Training erfassen')
        : h('a', { class: 'button', href: '#/hund' }, 'Hund erfassen'),
      h('p', {}, h('a', { href: '#/plaene' }, 'Trainingspläne ansehen')),
      backupDue &&
        h(
          'p',
          { class: 'card notice', role: 'note' },
          `Deine Trainingsdaten wurden seit über ${BACKUP_REMINDER_DAYS} Tagen nicht gesichert. `,
          h('a', { href: '#/info' }, 'Jetzt sichern'),
        ),
    ];
  },

  async hund(store) {
    const dogs = await store.listDogs();
    if (dogs.length === 0) return [h('h1', {}, 'Mein Hund'), await dogForm(store, null)];
    const active = await store.getDog();
    const counts = Object.fromEntries(await Promise.all(dogs.map(async (d) => [d.id, (await store.listSessions(d.id)).length])));
    return [
      h('h1', {}, dogs.length === 1 ? 'Mein Hund' : 'Meine Hunde'),
      h(
        'ul',
        { class: 'dog-list', 'aria-label': 'Hunde' },
        dogs.map((dog) =>
          h(
            'li',
            { class: 'card dog' },
            h('div', { class: 'title-row' }, h('strong', {}, dog.name), dog.id === active.id && h('span', { class: 'rating' }, 'Aktiv')),
            h('span', { class: 'muted' }, [dog.breed, countText(counts[dog.id], 'Einheit', 'Einheiten')].filter(Boolean).join(' · ')),
            h(
              'div',
              { class: 'row' },
              dog.id !== active.id &&
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'secondary small',
                    'aria-label': `${dog.name} zum aktiven Hund machen`,
                    onclick: async () => {
                      await store.setActiveDog(dog.id);
                      await render();
                    },
                  },
                  'Aktiv setzen',
                ),
              h('a', { class: 'button small secondary', href: `#/hund/${dog.id}`, 'aria-label': `${dog.name} bearbeiten` }, 'Bearbeiten'),
            ),
          ),
        ),
      ),
      h('a', { class: 'button', href: '#/hund/neu' }, 'Weiteren Hund hinzufügen'),
    ];
  },

  async 'hund-neu'(store) {
    return [h('h1', {}, 'Neuer Hund'), await dogForm(store, null), h('p', {}, h('a', { href: '#/hund' }, 'Zu meinen Hunden'))];
  },

  async 'hund-edit'(store, route) {
    const dog = (await store.listDogs()).find((d) => d.id === route.id);
    if (!dog) return [h('h1', {}, 'Hund nicht gefunden'), h('a', { class: 'button', href: '#/hund' }, 'Zu meinen Hunden')];
    return [h('h1', {}, 'Hund bearbeiten'), await dogForm(store, dog), h('p', {}, h('a', { href: '#/hund' }, 'Zu meinen Hunden'))];
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
    const sessions = await store.listSessions(dog.id);
    return [
      h('div', { class: 'title-row' }, h('h1', {}, 'Training'), h('a', { class: 'button small', href: '#/training/neu' }, 'Neue Einheit')),
      await dogBar(store),
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
    // Aus dem Ausbildungsplan kann eine Übung vorausgefüllt werden: #/training/neu?uebung=Name
    const params = new URLSearchParams(location.hash.split('?')[1] ?? '');
    const prefill = params.get('uebung') ? { exercises: [{ name: params.get('uebung').slice(0, 120) }] } : null;
    return [h('h1', {}, 'Neue Einheit'), await dogBar(store), await sessionForm(store, null, prefill)];
  },

  async 'training-edit'(store, route) {
    const session = await store.getSession(route.id);
    if (!session) {
      return [h('h1', {}, 'Einheit nicht gefunden'), h('a', { class: 'button', href: '#/training' }, 'Zur Übersicht')];
    }
    const dogs = await store.listDogs();
    const owner = dogs.length > 1 ? dogs.find((d) => d.id === session.dogId) : null;
    return [h('h1', {}, 'Einheit bearbeiten'), owner && h('p', { class: 'muted' }, `Einheit von ${owner.name}`), await sessionForm(store, session)];
  },

  async herdenschutz() {
    const sourceById = Object.fromEntries(SOURCES.map((s) => [s.id, s]));
    const sourceRefs = (ids) =>
      h('p', { class: 'muted small' }, 'Quelle: ', ids.map((id, i) => [i > 0 && ', ', sourceById[id].publisher]));
    return [
      h('h1', {}, 'Herdenschutz'),
      h('p', {}, 'Wie du dich mit deinem Hund bei Herdenschutzhunden und geschützten Herden verhältst. Die Regeln stammen von der Fachstelle Herdenschutz Schweiz und vom Bund.'),
      h('p', {}, h('a', { class: 'button', href: MAP_URL, target: '_blank', rel: 'noopener' }, 'Karte der Einsatzgebiete')),
      h(
        'p',
        { class: 'card' },
        h('strong', {}, 'Eigenen Hund zum Herdenschutzhund ausbilden? '),
        h('a', { href: '#/herdenschutz/ausbildung' }, 'Zum Ausbildungsplan'),
      ),
      SECTIONS.map((section) => [
        h('h2', {}, section.title),
        h('ul', { class: 'card rules' }, section.items.map((item) => h('li', {}, item))),
        sourceRefs(section.sources),
      ]),
      h('h2', {}, 'Passende Übungen fürs Training'),
      h('p', { class: 'muted small' }, 'Vorschläge von Schnuffel, abgeleitet aus den Regeln oben. Sie stammen nicht aus einer Quelle.'),
      h(
        'ul',
        { class: 'card rules', 'aria-label': 'Übungsvorschläge' },
        EXERCISE_SUGGESTIONS.map((e) => h('li', {}, h('strong', {}, e.name), ' ', h('span', { class: 'muted' }, e.why))),
      ),
      h('a', { class: 'button', href: '#/training/neu' }, 'Training erfassen'),
      h('h2', {}, 'Was nicht belegt ist'),
      h('ul', { class: 'card rules' }, GAPS.map((gap) => h('li', {}, gap))),
      h('h2', {}, 'Quellen'),
      h(
        'ul',
        { class: 'card rules sources', 'aria-label': 'Quellen' },
        SOURCES.map((s) =>
          h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title), h('span', { class: 'muted' }, ` – ${s.publisher}, abgerufen am ${formatDate(s.retrieved)}`)),
        ),
      ),
    ];
  },

  async 'herdenschutz-ausbildung'(store) {
    const sourceById = Object.fromEntries(HSH.SOURCES.map((s) => [s.id, s]));
    const sourceRefs = (ids) =>
      h('p', { class: 'muted small' }, 'Quelle: ', ids.map((id, i) => [i > 0 && ', ', sourceById[id].publisher]));

    // Fortschritt je Übung aus dem Tagebuch des aktiven Hundes.
    const dog = await store.getDog();
    const progressText = exerciseProgress(dog ? await store.listSessions(dog.id) : []);
    const exerciseItem = (e) =>
      h(
        'li',
        {},
        h('strong', {}, e.name),
        ' ',
        h('span', { class: 'muted' }, e.why),
        h(
          'div',
          { class: 'small' },
          h('span', { class: 'muted' }, `Prüfungskriterium: ${e.criterion}. Fortschritt: ${progressText(e.name)}.`),
          ' ',
          h('a', { href: `#/training/neu?uebung=${encodeURIComponent(e.name)}` }, 'Ins Tagebuch'),
        ),
      );

    return [
      h('h1', {}, 'Ausbildung zum Herdenschutzhund'),
      h(
        'p',
        {},
        'So wird in der Schweiz ein Herdenschutzhund ausgebildet und anerkannt: Phasen, Prüfung des Bundes und Übungen, die du im Tagebuch festhalten kannst. Die Angaben stammen von AGRIDEA, den Kantonen und dem Verein Herdenschutzhunde Schweiz.',
      ),
      h(
        'p',
        { class: 'card notice', role: 'note' },
        'Herdenschutzhunde arbeiten selbstständig ohne Kommandos und sind keine Jagdhunde. Anerkannt wird nur, wer die Eignungsprüfung des Bundes besteht. Dieser Plan ersetzt weder den Sachkundekurs noch die Beratung.',
      ),
      await dogBar(store),
      h(
        'p',
        { class: 'card' },
        h('strong', {}, 'Lieber Schritt für Schritt? '),
        h('a', { href: '#/plaene/herdenschutzhund' }, 'Zum Trainingsplan Herdenschutzhund'),
      ),
      h('h2', {}, 'Der offizielle Weg'),
      h('ul', { class: 'card rules' }, HSH.OFFICIAL_PATH.items.map((item) => h('li', {}, item))),
      sourceRefs(HSH.OFFICIAL_PATH.sources),
      h('p', {}, h('a', { class: 'button', href: HSH.CONTACT_URL, target: '_blank', rel: 'noopener' }, 'Beratungsstellen bei Herdenschutz Schweiz')),
      h('h2', {}, 'Phasen der Ausbildung'),
      h('p', { class: 'muted small' }, 'Die Übungen in jeder Phase sind Vorschläge von Schnuffel, abgeleitet aus den Prüfungskriterien. Sie stammen nicht aus einer Quelle.'),
      HSH.PHASES.map((phase) => {
        const exercises = HSH.EXERCISES.filter((e) => e.phase === phase.id);
        return [
          h('h3', {}, phase.title, ' ', h('span', { class: 'muted' }, `(${phase.age})`)),
          h('ul', { class: 'card rules' }, phase.items.map((item) => h('li', {}, item))),
          sourceRefs(phase.sources),
          exercises.length > 0 && h('ul', { class: 'card rules exercises-plan', 'aria-label': `Übungen ${phase.title}` }, exercises.map(exerciseItem)),
        ];
      }),
      h('h2', {}, 'So läuft die Eignungsprüfung'),
      h('ul', { class: 'card rules' }, HSH.EXAM.parts.map((item) => h('li', {}, item))),
      h('h2', {}, 'Was geprüft wird'),
      h(
        'ul',
        { class: 'card rules', 'aria-label': 'Prüfungskriterien' },
        HSH.EXAM.criteria.map((c) => h('li', {}, h('strong', {}, c.name), ' ', h('span', { class: 'muted' }, c.text))),
      ),
      sourceRefs(HSH.EXAM.sources),
      h('h2', {}, 'Was nicht belegt ist'),
      h('ul', { class: 'card rules' }, HSH.GAPS.map((gap) => h('li', {}, gap))),
      h('h2', {}, 'Quellen'),
      h(
        'ul',
        { class: 'card rules sources', 'aria-label': 'Quellen' },
        HSH.SOURCES.map((s) =>
          h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title), h('span', { class: 'muted' }, ` – ${s.publisher}, abgerufen am ${formatDate(s.retrieved)}`)),
        ),
      ),
    ];
  },

  async plaene(store) {
    const dog = await store.getDog();
    const progress = dog ? await store.getProgress(dog.id) : {};
    return [
      h('h1', {}, 'Trainingspläne'),
      h('p', {}, 'Schritt für Schritt zum Ziel. Jeder Schritt nennt, was gilt und woher das stammt, und hat Übungen fürs Tagebuch. Du hakst die Schritte selbst ab, der Fortschritt gilt für den aktiven Hund.'),
      await dogBar(store),
      !dog &&
        h('p', { class: 'card notice', role: 'note' }, 'Lege zuerst deinen Hund an, dann kannst du den Fortschritt speichern. ', h('a', { href: '#/hund' }, 'Hund erfassen')),
      h(
        'ul',
        { class: 'plan-list', 'aria-label': 'Pläne' },
        PLANS.map((plan) => {
          const sum = summarize(plan, progress[plan.id]);
          return h(
            'li',
            {},
            h(
              'a',
              { class: 'card plan', href: `#/plaene/${plan.id}` },
              h('strong', {}, plan.title),
              h('span', { class: 'muted' }, plan.summary),
              h('span', { class: 'muted small' }, plan.scope),
              dog && h('span', { class: 'progress-text' }, `${sum.done} von ${sum.total} Schritten geschafft${sum.doing ? `, ${sum.doing} in Arbeit` : ''}`),
            ),
          );
        }),
      ),
    ];
  },

  async 'plaene-plan'(store, route) {
    const plan = getPlan(route.id);
    if (!plan) return [h('h1', {}, 'Plan nicht gefunden'), h('a', { class: 'button', href: '#/plaene' }, 'Zu den Plänen')];
    const dog = await store.getDog();
    const saved = dog ? ((await store.getProgress(dog.id))[plan.id] ?? {}) : {};
    const statuses = Object.fromEntries(plan.steps.map((step) => [step.id, saved[step.id]?.status ?? 'open']));
    const exerciseText = exerciseProgress(dog ? await store.listSessions(dog.id) : []);
    const message = h('p', { class: 'message', role: 'status' });
    const summaryEl = h('p', { class: 'progress-text' });
    const stepViews = [];

    const refresh = () => {
      const counts = summarize(plan, Object.fromEntries(Object.entries(statuses).map(([id, status]) => [id, { status }])));
      if (dog) {
        summaryEl.textContent = `Fortschritt von ${dog.name}: ${counts.done} von ${counts.total} Schritten geschafft${counts.doing ? `, ${counts.doing} in Arbeit` : ''}.`;
      }
      for (const { step, el, buttons } of stepViews) {
        el.dataset.status = statuses[step.id];
        for (const [value, button] of buttons) button.setAttribute('aria-pressed', String(statuses[step.id] === value));
      }
    };

    const exerciseItem = (e) =>
      h(
        'li',
        {},
        h('strong', {}, e.name),
        ' ',
        h('span', { class: 'muted' }, e.why),
        h(
          'div',
          { class: 'small' },
          h(
            'span',
            { class: 'muted' },
            [
              e.own ? 'Vorschlag von Schnuffel' : `Prüfungsteil, Quelle: ${publishersOf(plan.sources, e.sources)}`,
              e.criterion && `Prüfungskriterium: ${e.criterion}`,
              `Fortschritt: ${exerciseText(e.name)}`,
            ]
              .filter(Boolean)
              .join('. ') + '.',
          ),
          ' ',
          h('a', { href: `#/training/neu?uebung=${encodeURIComponent(e.name)}` }, 'Ins Tagebuch'),
        ),
      );

    const stepItem = (step, index) => {
      const buttons = dog
        ? STEP_STATUS_OPTIONS.map(({ value, label }) => [
            value,
            h(
              'button',
              {
                type: 'button',
                class: 'toggle',
                'aria-pressed': 'false',
                onclick: async () => {
                  try {
                    await store.setStepStatus({ dogId: dog.id, planId: plan.id, stepId: step.id, status: value });
                    statuses[step.id] = value;
                    showMessage(message, 'ok', '');
                    refresh();
                  } catch (error) {
                    showMessage(message, 'error', error.message);
                  }
                },
              },
              label,
            ),
          ])
        : [];
      const el = h(
        'li',
        { class: 'card step' },
        h('h2', {}, `Schritt ${index + 1}: ${step.title}`),
        h('p', { class: 'muted small' }, step.timing),
        dog && h('div', { class: 'status-toggle', role: 'group', 'aria-label': `Status von Schritt ${index + 1}` }, buttons.map(([, button]) => button)),
        h('ul', { class: 'rules', 'aria-label': `Das gilt in Schritt ${index + 1}` }, step.facts.map((fact) => h('li', {}, fact))),
        h('p', { class: 'muted small' }, 'Quelle: ', publishersOf(plan.sources, step.sources)),
        step.caveat && h('p', { class: 'small caveat' }, h('strong', {}, 'Hinweis: '), step.caveat),
        step.exercises.length > 0 &&
          h('ul', { class: 'rules exercises-plan', 'aria-label': `Übungen Schritt ${index + 1}` }, step.exercises.map(exerciseItem)),
        h(
          'p',
          { class: 'done-when' },
          h('strong', {}, 'Geschafft, wenn: '),
          step.doneWhen.text,
          ' ',
          h('span', { class: 'muted small' }, step.doneWhen.own ? '(Vorschlag von Schnuffel)' : `(Quelle: ${publishersOf(plan.sources, step.doneWhen.sources)})`),
        ),
      );
      stepViews.push({ step, el, buttons });
      return el;
    };

    const items = plan.steps.map(stepItem);
    refresh();
    return [
      h('p', {}, h('a', { href: '#/plaene' }, 'Alle Pläne')),
      h('h1', {}, plan.title),
      await dogBar(store),
      h('p', {}, plan.summary),
      h('p', { class: 'muted small' }, plan.scope),
      h('p', { class: 'card notice', role: 'note' }, plan.notice),
      dog
        ? summaryEl
        : h('p', { class: 'card notice', role: 'note' }, 'Lege zuerst deinen Hund an, dann kannst du Schritte abhaken. ', h('a', { href: '#/hund' }, 'Hund erfassen')),
      message,
      h('ol', { class: 'steps', 'aria-label': 'Schritte' }, items),
      h('h2', {}, 'Was nicht belegt ist'),
      h('ul', { class: 'card rules', 'aria-label': 'Was nicht belegt ist' }, plan.gaps.map((gap) => h('li', {}, gap))),
      h('h2', {}, 'Quellen'),
      sourceList(plan.sources),
    ];
  },

  async info(store) {
    const data = await store.load();
    const message = h('p', { class: 'message', role: 'status' });
    const lastExport = data.meta.lastExportAt ? new Date(data.meta.lastExportAt) : null;
    const lastExportEl = h('p', { class: 'muted' }, lastExport ? `Letzte Sicherung: ${formatDateTime(lastExport)}` : 'Noch keine Sicherung gemacht.');
    const fileInput = h('input', {
      id: 'restore-file',
      type: 'file',
      accept: 'application/json,.json',
      onchange: async () => {
        const file = fileInput.files[0];
        if (!file) return;
        try {
          // Zuerst prüfen, dann nachfragen: bei einer unbrauchbaren Datei kommt direkt die Fehlermeldung.
          const text = await file.text();
          parseBackup(text);
          if (!confirm('Alle Daten auf diesem Gerät werden durch die Sicherung ersetzt. Fortfahren?')) return;
          const result = await store.importBackup(text);
          const parts = [countText(result.dogs, 'Hund', 'Hunde'), countText(result.sessions, 'Einheit', 'Einheiten')];
          if (result.planProgress > 0) parts.push(countText(result.planProgress, 'Planschritt', 'Planschritte'));
          showMessage(message, 'ok', `Wiederhergestellt: ${parts.join(', ')}.`);
          lastExportEl.textContent = result.lastExportAt ? `Letzte Sicherung: ${formatDateTime(new Date(result.lastExportAt))}` : 'Noch keine Sicherung gemacht.';
        } catch (error) {
          showMessage(message, 'error', error.message);
        } finally {
          fileInput.value = '';
        }
      },
    });
    return [
      h('h1', {}, 'Info'),
      h('p', {}, `Version ${APP_VERSION}`),
      h('p', { id: 'sw-status' }, 'Offline-Modus: wird geprüft …'),
      h('h2', {}, 'Datensicherung'),
      h('p', {}, 'Deine Daten werden nur lokal in diesem Browser gespeichert. Sichere sie regelmässig als Datei, zum Beispiel in deiner Cloud. Mit der Datei kannst du die Daten auf einem anderen Gerät wiederherstellen.'),
      lastExportEl,
      h(
        'button',
        {
          type: 'button',
          onclick: async () => {
            try {
              const backup = await store.exportBackup();
              downloadJson(backup, `schnuffel-sicherung-${backup.exportedAt.slice(0, 10)}.json`);
              showMessage(message, 'ok', 'Sicherung erstellt.');
              lastExportEl.textContent = `Letzte Sicherung: ${formatDateTime(new Date(backup.exportedAt))}`;
            } catch (error) {
              showMessage(message, 'error', error.message);
            }
          },
        },
        'Daten sichern',
      ),
      h('label', { for: 'restore-file' }, 'Wiederherstellen aus Sicherungsdatei'),
      fileInput,
      message,
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

async function sessionForm(store, session, prefill = null) {
  const message = h('p', { class: 'message', role: 'status' });
  const exerciseList = h('div', { class: 'exercises' });
  const activeDogId = (await store.getDog())?.id;
  // Vorschläge: bereits verwendete Übungen zuerst, dann die Übungen aus Herdenschutz und Ausbildungsplan.
  const knownNames = [
    ...new Set([
      ...(await store.listSessions()).flatMap((s) => s.exercises.map((e) => e.name)),
      ...EXERCISE_SUGGESTIONS.map((e) => e.name),
      ...planExerciseNames(),
    ]),
  ];

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

  (session?.exercises.length ? session.exercises : (prefill?.exercises ?? [{}])).forEach(addExercise);

  const form = h(
    'form',
    {
      class: 'card',
      novalidate: true,
      onsubmit: async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.id = session?.id;
        data.dogId = session?.dogId ?? activeDogId;
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
  view.replaceChildren(...content.flat(Infinity).filter((c) => c != null && c !== false));
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
