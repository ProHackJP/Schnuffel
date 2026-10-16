// Speicher-Backends für store.js. Alle bieten dieselben drei asynchronen Funktionen: get, set, remove.
// Im Browser wird IndexedDB verwendet (mehr Platz, robuster als localStorage).

const DB_NAME = 'schnuffel';
const STORE = 'kv';

export function memoryBackend() {
  const map = new Map();
  return {
    async get(key) {
      return map.has(key) ? structuredClone(map.get(key)) : undefined;
    },
    async set(key, value) {
      map.set(key, structuredClone(value));
    },
    async remove(key) {
      map.delete(key);
    },
  };
}

export function localStorageBackend(storage = globalThis.localStorage) {
  return {
    async get(key) {
      const raw = storage.getItem(key);
      return raw == null ? undefined : JSON.parse(raw);
    },
    async set(key, value) {
      storage.setItem(key, JSON.stringify(value));
    },
    async remove(key) {
      storage.removeItem(key);
    },
  };
}

export function indexedDbBackend(idb = globalThis.indexedDB) {
  const ready = new Promise((resolve, reject) => {
    const request = idb.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  async function run(mode, action) {
    const db = await ready;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  return {
    get: (key) => run('readonly', (s) => s.get(key)),
    set: (key, value) => run('readwrite', (s) => s.put(value, key)).then(() => undefined),
    remove: (key) => run('readwrite', (s) => s.delete(key)).then(() => undefined),
  };
}

// Übernimmt Daten aus dem alten Speicher (Etappe 1: localStorage) einmalig in das neue Backend.
export async function migrateFrom(oldBackend, newBackend, key) {
  const old = await oldBackend.get(key).catch(() => undefined);
  if (old === undefined) return false;
  if ((await newBackend.get(key)) === undefined) await newBackend.set(key, old);
  await oldBackend.remove(key);
  return true;
}

// Wählt das beste verfügbare Backend im Browser.
export async function openBrowserBackend(key) {
  const legacy = localStorageBackend();
  if (!globalThis.indexedDB) return legacy;
  try {
    const idb = indexedDbBackend();
    await migrateFrom(legacy, idb, key);
    return idb;
  } catch (error) {
    console.warn('IndexedDB nicht verfügbar, verwende localStorage:', error);
    return legacy;
  }
}
