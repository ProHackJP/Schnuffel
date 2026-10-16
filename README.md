# Schnuffel

Trainings-App für Jagdhunde. Läuft als Web-App (PWA): im Browser öffnen, aufs Handy installieren, funktioniert auch ohne Empfang. Alle Daten bleiben auf dem Gerät.

Aktueller Stand, Etappen und Annahmen: siehe [STATUS.md](STATUS.md).

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) ab Version 20.

```bash
npm install
npm start
```

Dann im Browser http://localhost:8080 öffnen.

## Tests

```bash
npm run test:unit   # Logik (Datenablage, Navigation)
npm run test:e2e    # Ganze App im Browser, inkl. Offline-Test
npm test            # beides
```

Für die Browser-Tests einmalig `npx playwright install chromium` ausführen.

## Veröffentlichen

`npm run build` kopiert nur die App-Dateien nach `dist/`. Das Hosting (Cloudflare Pages) ist mit dem Repository verbunden: Build-Befehl `npm run build`, Ausgabeverzeichnis `dist`, Produktionszweig `main`. Jeder Push auf `main` wird automatisch veröffentlicht, andere Zweige bekommen eine Vorschau-Adresse. Die Datei `_headers` legt Sicherheits-Header fest und sorgt dafür, dass `sw.js` nie aus dem Browser-Cache kommt.

## Aufbau

| Datei | Zweck |
| --- | --- |
| `index.html` | Seitengerüst mit Navigation |
| `src/app.js` | Ansichten und Ablauf |
| `src/router.js` | Navigation über `#/pfad` |
| `src/store.js` | Datenlogik: Hund und Trainingseinheiten, Validierung |
| `src/storage.js` | Speicher-Backends (IndexedDB, localStorage, Speicher für Tests) |
| `sw.js` | Service Worker für den Offline-Betrieb |
| `manifest.webmanifest` | Angaben für die Installation aufs Handy |
| `scripts/serve.mjs` | Kleiner Webserver für Entwicklung und Tests (wendet `_headers` an) |
| `scripts/build.mjs` | Kopiert die App-Dateien nach `dist/` fürs Hosting |
| `_headers` | Header-Regeln für Cloudflare Pages |

Wichtig: Wer App-Dateien ändert, erhöht `CACHE_VERSION` in `sw.js`, sonst sehen Nutzer weiterhin die alte Version.
