// Lokale Datenablage. Alle Daten bleiben auf dem Gerät, es gibt keinen Server.
// Der Speicher wird übergeben (Standard: localStorage), damit sich das Modul ohne Browser testen lässt.

const KEY = 'schnuffel:v1';

export const SCHEMA_VERSION = 1;

export function emptyData() {
  return { version: SCHEMA_VERSION, dogs: [] };
}

export function createStore(storage) {
  function load() {
    try {
      const raw = storage.getItem(KEY);
      if (!raw) return emptyData();
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || !Array.isArray(data.dogs)) return emptyData();
      return data;
    } catch {
      return emptyData();
    }
  }

  function save(data) {
    storage.setItem(KEY, JSON.stringify(data));
  }

  return {
    load,

    getDog() {
      return load().dogs[0] ?? null;
    },

    // Speichert das Hundeprofil. In dieser Etappe gibt es genau einen Hund.
    saveDog(input) {
      const dog = normalizeDog(input);
      const data = load();
      const existing = data.dogs[0];
      data.dogs = [{ ...existing, ...dog, id: existing?.id ?? newId(), updatedAt: new Date().toISOString() }];
      save(data);
      return data.dogs[0];
    },

    clear() {
      storage.removeItem(KEY);
    },
  };
}

export function normalizeDog(input) {
  const name = String(input?.name ?? '').trim();
  if (!name) throw new Error('Bitte einen Namen eingeben.');
  if (name.length > 60) throw new Error('Der Name darf höchstens 60 Zeichen haben.');
  const breed = String(input?.breed ?? '').trim().slice(0, 80);
  const birthDate = String(input?.birthDate ?? '').trim();
  if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error('Ungültiges Geburtsdatum.');
  return { name, breed, birthDate };
}

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
