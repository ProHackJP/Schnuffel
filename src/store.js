// Datenlogik von Schnuffel. Alle Daten bleiben auf dem Gerät, es gibt keinen Server.
// Wo die Daten liegen, entscheidet das übergebene Backend (siehe storage.js). So lässt sich die Logik ohne Browser testen.

export const DATA_KEY = 'schnuffel:v1';
export const SCHEMA_VERSION = 3;
export const EXPORT_FORMAT = 'schnuffel-backup';

export const RATINGS = [1, 2, 3, 4, 5];

// Nach so vielen Tagen ohne Sicherung wird auf der Startseite daran erinnert.
export const BACKUP_REMINDER_DAYS = 30;

export function emptyData() {
  return { version: SCHEMA_VERSION, dogs: [], sessions: [], meta: {} };
}

// Bringt gespeicherte Daten älterer Versionen auf den aktuellen Stand.
export function migrate(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.dogs)) return emptyData();
  const migrated = { ...data };
  if (!Array.isArray(migrated.sessions)) migrated.sessions = [];
  if (!migrated.meta || typeof migrated.meta !== 'object') migrated.meta = {};
  migrated.version = SCHEMA_VERSION;
  return migrated;
}

// Ob an eine Sicherung erinnert werden soll: nur wenn es Einheiten gibt und die letzte Sicherung fehlt oder alt ist.
export function backupDue(data, now = new Date()) {
  if (data.sessions.length === 0) return false;
  const last = data.meta.lastExportAt ? Date.parse(data.meta.lastExportAt) : NaN;
  if (Number.isNaN(last)) return true;
  return now.getTime() - last > BACKUP_REMINDER_DAYS * 24 * 60 * 60 * 1000;
}

// Prüft eine Sicherungsdatei und liefert bereinigte Daten. Wirft bei unbrauchbarem Inhalt einen verständlichen Fehler.
export function parseBackup(raw) {
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Die Datei ist keine gültige Schnuffel-Sicherung.');
    }
  }
  if (!parsed || typeof parsed !== 'object' || parsed.format !== EXPORT_FORMAT || !Array.isArray(parsed.dogs)) {
    throw new Error('Die Datei ist keine gültige Schnuffel-Sicherung.');
  }
  if (typeof parsed.version !== 'number' || parsed.version > SCHEMA_VERSION) {
    throw new Error('Die Sicherung stammt aus einer neueren Version von Schnuffel. Bitte zuerst die App aktualisieren.');
  }
  const data = migrate(parsed);
  const dogs = data.dogs.map((dog, i) => {
    try {
      return { ...normalizeDog(dog), id: idOrNew(dog?.id), updatedAt: isoOrNow(dog?.updatedAt) };
    } catch (error) {
      throw new Error(`Hund ${i + 1} in der Sicherung ist fehlerhaft: ${error.message}`);
    }
  });
  const dogIds = new Set(dogs.map((d) => d.id));
  const sessions = data.sessions.map((session, i) => {
    try {
      const fields = normalizeSession(session);
      const dogId = dogIds.has(session?.dogId) ? session.dogId : dogs[0]?.id;
      if (!dogId) throw new Error('kein Hund vorhanden.');
      return { id: idOrNew(session?.id), dogId, ...fields, createdAt: isoOrNow(session?.createdAt), updatedAt: isoOrNow(session?.updatedAt) };
    } catch (error) {
      throw new Error(`Einheit ${i + 1} in der Sicherung ist fehlerhaft: ${error.message}`);
    }
  });
  return { ...emptyData(), dogs, sessions, meta: { lastExportAt: data.meta.lastExportAt ?? null } };
}

function idOrNew(id) {
  return typeof id === 'string' && /^[A-Za-z0-9-]{1,64}$/.test(id) ? id : newId();
}

function isoOrNow(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : new Date().toISOString();
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

    // Liefert alle Daten als Sicherung und merkt sich den Zeitpunkt.
    async exportBackup(now = new Date()) {
      const data = await load();
      data.meta.lastExportAt = now.toISOString();
      await save(data);
      return { format: EXPORT_FORMAT, version: SCHEMA_VERSION, exportedAt: data.meta.lastExportAt, dogs: data.dogs, sessions: data.sessions, meta: data.meta };
    },

    // Ersetzt alle Daten durch den Inhalt einer Sicherung.
    async importBackup(raw) {
      const data = parseBackup(raw);
      await save(data);
      return { dogs: data.dogs.length, sessions: data.sessions.length };
    },

    async backupDue(now) {
      return backupDue(await load(), now);
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
