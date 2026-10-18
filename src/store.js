// Datenlogik von Schnuffel. Alle Daten bleiben auf dem Gerät, es gibt keinen Server.
// Wo die Daten liegen, entscheidet das übergebene Backend (siehe storage.js). So lässt sich die Logik ohne Browser testen.

export const DATA_KEY = 'schnuffel:v1';
export const SCHEMA_VERSION = 4;
export const EXPORT_FORMAT = 'schnuffel-backup';

export const RATINGS = [1, 2, 3, 4, 5];

// Fortschritt eines Schrittes im Trainingsplan. «Offen» ist der Normalzustand und wird nicht gespeichert.
export const STEP_STATUSES = ['doing', 'done'];

const ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

// Nach so vielen Tagen ohne Sicherung wird auf der Startseite daran erinnert.
export const BACKUP_REMINDER_DAYS = 30;

export function emptyData() {
  return { version: SCHEMA_VERSION, dogs: [], sessions: [], planProgress: [], meta: {} };
}

// Bringt gespeicherte Daten älterer Versionen auf den aktuellen Stand.
export function migrate(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.dogs)) return emptyData();
  const migrated = { ...data };
  if (!Array.isArray(migrated.sessions)) migrated.sessions = [];
  if (!Array.isArray(migrated.planProgress)) migrated.planProgress = [];
  if (!migrated.meta || typeof migrated.meta !== 'object') migrated.meta = {};
  migrated.version = SCHEMA_VERSION;
  return migrated;
}

// Der Hund, mit dem gerade gearbeitet wird: der gewählte, sonst der erste.
export function activeDog(data) {
  return data.dogs.find((d) => d.id === data.meta.activeDogId) ?? data.dogs[0] ?? null;
}

// Ob an eine Sicherung erinnert werden soll: nur wenn es Einheiten oder Planfortschritt gibt und die letzte Sicherung fehlt oder alt ist.
export function backupDue(data, now = new Date()) {
  if (data.sessions.length === 0 && data.planProgress.length === 0) return false;
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
  const planProgress = normalizeProgressList(data.planProgress, dogIds);
  const meta = { lastExportAt: data.meta.lastExportAt ?? null };
  if (dogIds.has(data.meta.activeDogId)) meta.activeDogId = data.meta.activeDogId;
  return { ...emptyData(), dogs, sessions, planProgress, meta };
}

// Eintrag für den Fortschritt im Plan: Hund, Plan und Schritt als Kennungen, dazu der Status.
export function normalizeProgress(input) {
  const entry = { dogId: String(input?.dogId ?? ''), planId: String(input?.planId ?? ''), stepId: String(input?.stepId ?? '') };
  if (!Object.values(entry).every((id) => ID_PATTERN.test(id))) throw new Error('ungültige Kennung.');
  if (!STEP_STATUSES.includes(input?.status)) throw new Error('ungültiger Status.');
  return { ...entry, status: input.status, updatedAt: isoOrNow(input?.updatedAt) };
}

// Bei doppelten Einträgen gewinnt der letzte. Einträge für unbekannte Hunde fallen weg.
function normalizeProgressList(list, dogIds) {
  const byKey = new Map();
  (Array.isArray(list) ? list : []).forEach((raw, i) => {
    let entry;
    try {
      entry = normalizeProgress(raw);
    } catch (error) {
      throw new Error(`Planfortschritt ${i + 1} in der Sicherung ist fehlerhaft: ${error.message}`);
    }
    if (dogIds.has(entry.dogId)) byKey.set(`${entry.dogId}/${entry.planId}/${entry.stepId}`, entry);
  });
  return [...byKey.values()];
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

    async listDogs() {
      return (await load()).dogs;
    },

    // Der aktive Hund: der gewählte, sonst der erste.
    async getDog() {
      return activeDog(await load());
    },

    async setActiveDog(id) {
      const data = await load();
      if (!data.dogs.some((d) => d.id === id)) throw new Error('Dieser Hund existiert nicht (mehr).');
      data.meta.activeDogId = id;
      await save(data);
      return activeDog(data);
    },

    // Ändert den Hund mit input.id oder legt einen neuen an. Ein neuer Hund wird gleich zum aktiven Hund.
    async saveDog(input) {
      const dog = normalizeDog(input);
      const data = await load();
      const now = new Date().toISOString();
      if (input?.id) {
        const index = data.dogs.findIndex((d) => d.id === input.id);
        if (index < 0) throw new Error('Dieser Hund existiert nicht (mehr).');
        data.dogs[index] = { ...data.dogs[index], ...dog, updatedAt: now };
        await save(data);
        return data.dogs[index];
      }
      const created = { id: newId(), ...dog, updatedAt: now };
      data.dogs.push(created);
      data.meta.activeDogId = created.id;
      await save(data);
      return created;
    },

    // Löscht den Hund samt seinen Einheiten und seinem Planfortschritt. Liefert null, wenn es ihn nicht gibt.
    async deleteDog(id) {
      const data = await load();
      const index = data.dogs.findIndex((d) => d.id === id);
      if (index < 0) return null;
      const removedSessions = data.sessions.filter((s) => s.dogId === id).length;
      data.dogs.splice(index, 1);
      data.sessions = data.sessions.filter((s) => s.dogId !== id);
      data.planProgress = data.planProgress.filter((p) => p.dogId !== id);
      if (data.meta.activeDogId === id) delete data.meta.activeDogId;
      await save(data);
      return { removedSessions };
    },

    // Trainingseinheiten, neueste zuerst. Mit dogId nur die Einheiten dieses Hundes.
    async listSessions(dogId) {
      const sessions = (await load()).sessions;
      return sortSessions(dogId ? sessions.filter((s) => s.dogId === dogId) : sessions);
    },

    async getSession(id) {
      return (await load()).sessions.find((s) => s.id === id) ?? null;
    },

    // Legt eine Einheit an oder ändert sie, wenn input.id zu einer bestehenden Einheit passt.
    async saveSession(input) {
      const fields = normalizeSession(input);
      const data = await load();
      const dog = data.dogs.find((d) => d.id === input?.dogId) ?? activeDog(data);
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

    // Fortschritt im Plan für einen Hund: { planId: { stepId: { status, updatedAt } } }. Offene Schritte fehlen.
    async getProgress(dogId) {
      const result = {};
      for (const p of (await load()).planProgress) {
        if (p.dogId === dogId) (result[p.planId] ??= {})[p.stepId] = { status: p.status, updatedAt: p.updatedAt };
      }
      return result;
    },

    // Setzt den Status eines Schrittes auf 'open', 'doing' oder 'done'.
    async setStepStatus({ dogId, planId, stepId, status }) {
      if (status !== 'open') normalizeProgress({ dogId, planId, stepId, status });
      else if (![dogId, planId, stepId].every((id) => ID_PATTERN.test(String(id)))) throw new Error('ungültige Kennung.');
      const data = await load();
      if (!data.dogs.some((d) => d.id === dogId)) throw new Error('Dieser Hund existiert nicht (mehr).');
      data.planProgress = data.planProgress.filter((p) => !(p.dogId === dogId && p.planId === planId && p.stepId === stepId));
      if (status !== 'open') data.planProgress.push({ dogId, planId, stepId, status, updatedAt: new Date().toISOString() });
      await save(data);
      return status;
    },

    // Liefert alle Daten als Sicherung und merkt sich den Zeitpunkt.
    async exportBackup(now = new Date()) {
      const data = await load();
      data.meta.lastExportAt = now.toISOString();
      await save(data);
      return { format: EXPORT_FORMAT, version: SCHEMA_VERSION, exportedAt: data.meta.lastExportAt, dogs: data.dogs, sessions: data.sessions, planProgress: data.planProgress, meta: data.meta };
    },

    // Ersetzt alle Daten durch den Inhalt einer Sicherung.
    async importBackup(raw) {
      const data = parseBackup(raw);
      await save(data);
      return { dogs: data.dogs.length, sessions: data.sessions.length, planProgress: data.planProgress.length, lastExportAt: data.meta.lastExportAt };
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
