// Datenlogik von Schnuffel. Alle Daten bleiben auf dem Gerät, es gibt keinen Server.
// Wo die Daten liegen, entscheidet das übergebene Backend (siehe storage.js). So lässt sich die Logik ohne Browser testen.

export const DATA_KEY = 'schnuffel:v1';
export const SCHEMA_VERSION = 2;

export const RATINGS = [1, 2, 3, 4, 5];

export function emptyData() {
  return { version: SCHEMA_VERSION, dogs: [], sessions: [] };
}

// Bringt gespeicherte Daten älterer Versionen auf den aktuellen Stand.
export function migrate(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.dogs)) return emptyData();
  const migrated = { ...data };
  if (!Array.isArray(migrated.sessions)) migrated.sessions = [];
  migrated.version = SCHEMA_VERSION;
  return migrated;
}

export function createStore(backend) {
  async function load() {
    try {
      return migrate(await backend.get(DATA_KEY));
    } catch {
      return emptyData();
    }
  }

  async function save(data) {
    await backend.set(DATA_KEY, data);
  }

  return {
    load,

    async getDog() {
      return (await load()).dogs[0] ?? null;
    },

    // Speichert das Hundeprofil. Vorerst gibt es genau einen Hund.
    async saveDog(input) {
      const dog = normalizeDog(input);
      const data = await load();
      const existing = data.dogs[0];
      data.dogs = [{ ...existing, ...dog, id: existing?.id ?? newId(), updatedAt: new Date().toISOString() }];
      await save(data);
      return data.dogs[0];
    },

    // Trainingseinheiten, neueste zuerst.
    async listSessions() {
      return sortSessions((await load()).sessions);
    },

    async getSession(id) {
      return (await load()).sessions.find((s) => s.id === id) ?? null;
    },

    // Legt eine Einheit an oder ändert sie, wenn input.id zu einer bestehenden Einheit passt.
    async saveSession(input) {
      const fields = normalizeSession(input);
      const data = await load();
      const dog = data.dogs[0];
      if (!dog) throw new Error('Bitte zuerst deinen Hund erfassen.');
      const now = new Date().toISOString();
      const index = data.sessions.findIndex((s) => s.id === input?.id);
      if (index >= 0) {
        data.sessions[index] = { ...data.sessions[index], ...fields, updatedAt: now };
      } else {
        data.sessions.push({ id: newId(), dogId: dog.id, ...fields, createdAt: now, updatedAt: now });
      }
      await save(data);
      return index >= 0 ? data.sessions[index] : data.sessions.at(-1);
    },

    async deleteSession(id) {
      const data = await load();
      const before = data.sessions.length;
      data.sessions = data.sessions.filter((s) => s.id !== id);
      if (data.sessions.length === before) return false;
      await save(data);
      return true;
    },

    async clear() {
      await backend.remove(DATA_KEY);
    },
  };
}

export function sortSessions(sessions) {
  return [...sessions].sort(
    (a, b) => b.date.localeCompare(a.date) || String(b.createdAt).localeCompare(String(a.createdAt)),
  );
}

export function normalizeDog(input) {
  const name = String(input?.name ?? '').trim();
  if (!name) throw new Error('Bitte einen Namen eingeben.');
  if (name.length > 60) throw new Error('Der Name darf höchstens 60 Zeichen haben.');
  const breed = String(input?.breed ?? '').trim().slice(0, 80);
  const birthDate = String(input?.birthDate ?? '').trim();
  if (birthDate && !isIsoDate(birthDate)) throw new Error('Ungültiges Geburtsdatum.');
  return { name, breed, birthDate };
}

export function normalizeSession(input) {
  const date = String(input?.date ?? '').trim();
  if (!isIsoDate(date)) throw new Error('Bitte ein gültiges Datum eingeben.');

  const rawDuration = String(input?.durationMin ?? '').trim();
  let durationMin = null;
  if (rawDuration) {
    durationMin = Number(rawDuration);
    if (!Number.isInteger(durationMin) || durationMin < 1 || durationMin > 1440) {
      throw new Error('Die Dauer muss eine ganze Zahl zwischen 1 und 1440 Minuten sein.');
    }
  }

  const exercises = (Array.isArray(input?.exercises) ? input.exercises : [])
    .map(normalizeExercise)
    .filter((e) => e.name);
  if (exercises.length === 0) throw new Error('Bitte mindestens eine Übung eintragen.');
  if (exercises.length > 30) throw new Error('Höchstens 30 Übungen pro Einheit.');

  return {
    date,
    durationMin,
    location: text(input?.location, 120),
    notes: text(input?.notes, 2000),
    exercises,
  };
}

function normalizeExercise(input) {
  const rawRating = String(input?.rating ?? '').trim();
  let rating = null;
  if (rawRating) {
    rating = Number(rawRating);
    if (!RATINGS.includes(rating)) throw new Error('Die Bewertung muss zwischen 1 und 5 liegen.');
  }
  const exercise = {
    name: text(input?.name, 120),
    game: text(input?.game, 60),
    rating,
    notes: text(input?.notes, 500),
  };
  if (!exercise.name && (exercise.game || exercise.rating || exercise.notes)) {
    throw new Error('Jede Übung braucht eine Bezeichnung.');
  }
  return exercise;
}

function text(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
