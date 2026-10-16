# Projektstatus Schnuffel

Diese Datei ist die Zielliste des Projekts. Sie wird bei jeder Etappe nachgeführt.

**Projektziel:** Eine funktionierende, praxistaugliche Trainings-App für Jagdhunde. Sie läuft als Web-App (PWA), lässt sich aufs Handy installieren und funktioniert offline. Die Daten bleiben auf dem Gerät.

**Arbeitsweise:** Kleine Etappen mit Akzeptanzkriterien und Tests. Fachliche Inhalte (Ausbildung, Prüfungsordnungen CH/EU, Tierschutz, Trainingsmethoden) werden erst aufgenommen, wenn sie mit Quellen geprüft sind (Chain of Verification). Nicht Verifiziertes wird gekennzeichnet.

Stand: 2026-10-16 (Etappen 1 bis 5)

## Nächster Schritt

Jules verbindet das Repository einmalig mit Cloudflare Pages (Anleitung im Projekt-Thread) und probiert die App auf dem Handy aus. Danach: Rückmeldungen aus der Praxis einarbeiten, dann Fachinhalte planen.

## Etappen

### ✅ Etappe 1: PWA-Grundlage

Ziel: Eine lauffähige, installierbare und offline-fähige App-Hülle mit Navigation und lokaler Datenablage.

Akzeptanzkriterien:

- [x] Startseite lädt, Navigation mit Start, Hund, Training, Info funktioniert (E2E-Test)
- [x] Unbekannte Adressen führen zur Startseite (E2E-Test)
- [x] Hundeprofil (Name, Rasse, Geburtsdatum) lässt sich erfassen und bleibt nach Neuladen erhalten (Unit- und E2E-Test)
- [x] Fehlerhafte Eingaben werden mit verständlicher Meldung abgelehnt (Unit- und E2E-Test)
- [x] Eingaben werden als Text dargestellt, nicht als HTML (Schutz vor eingeschleustem Code, E2E-Test)
- [x] App startet nach dem ersten Besuch ohne Internet (E2E-Test mit Offline-Modus)
- [x] Web-App-Manifest mit Icons 192 und 512 px, Anzeige als eigenständige App (E2E-Test)
- [x] Automatische Tests laufen bei jedem Push (GitHub Actions)

### ✅ Etappe 2: Trainingstagebuch (ausführlich)

Ziel: Trainingseinheiten erfassen, anzeigen, bearbeiten und löschen, offline. Entscheid von Jules (2026-10-16): Variante «Ausführlich» mit mehreren Übungen pro Einheit.

Akzeptanzkriterien:

- [x] Einheit mit Datum, Dauer, Ort und Notiz erfassen (E2E-Test)
- [x] Mehrere Übungen pro Einheit, je mit Bezeichnung, Wildart, Bewertung 1 bis 5 und Notiz (Unit- und E2E-Test)
- [x] Liste der Einheiten, neueste zuerst (Unit- und E2E-Test)
- [x] Bearbeiten und Löschen mit Rückfrage (E2E-Test)
- [x] Ohne erfassten Hund wird zur Hundeerfassung geführt (E2E-Test)
- [x] Wechsel der Datenablage auf IndexedDB, mit Übernahme der Daten aus Etappe 1 (Unit- und E2E-Test)
- [x] Erfassen funktioniert offline (E2E-Test)
- [x] Prüfung, dass alle App-Dateien in der Offline-Liste des Service Workers stehen (Unit-Test)

### ✅ Etappe 3: Datensicherung

Ziel: Daten als Datei sichern und auf einem anderen Gerät wiederherstellen, damit bei Gerätewechsel oder gelöschten Browserdaten nichts verloren geht.

Akzeptanzkriterien:

- [x] Export aller Daten als JSON-Datei über die Info-Seite (Unit- und E2E-Test)
- [x] Import einer Sicherungsdatei ersetzt die Daten nach Rückfrage (Unit- und E2E-Test mit zweitem Browser-Kontext)
- [x] Abbruch der Rückfrage lässt die Daten unverändert (E2E-Test)
- [x] Unbrauchbare oder zu neue Dateien werden mit verständlicher Meldung abgelehnt (Unit- und E2E-Test)
- [x] Hinweis auf der Startseite, wenn Einheiten vorhanden sind und seit über 30 Tagen (oder noch nie) gesichert wurde (Unit- und E2E-Test)

### 🔶 Etappe 4: Veröffentlichung (Cloudflare Pages)

Entscheid von Jules (2026-10-16): Cloudflare Pages.

- [x] Build-Schritt `npm run build` kopiert nur die App-Dateien nach `dist/` (Unit-Test prüft Inhalt)
- [x] `_headers` mit Sicherheits-Headern (CSP, kein Framing) und `Cache-Control: no-cache` für `sw.js`; der Entwicklungsserver wendet dieselben Regeln an, alle Browser-Tests laufen damit
- [ ] Repository in Cloudflare Pages verbunden (Build: `npm run build`, Ausgabe: `dist`, Produktionszweig: `main`) – macht Jules
- [ ] App unter der `*.pages.dev`-Adresse erreichbar und als PWA installierbar
- [ ] Test der Installation und der Datensicherung auf Android und iPhone – macht Jules

### ✅ Etappe 5: Herdenschutz

Wunsch von Jules (2026-10-16): Thematik Herdenschutz aufnehmen. Umfang (Auswahlkarte, Standard «Verhalten + Training»): Verhaltensregeln bei Herdenschutzhunden und geschützten Herden, dazu Übungsvorschläge fürs Tagebuch.

Akzeptanzkriterien:

- [x] Eigener Bereich «Herdenschutz» in der Navigation, offline verfügbar (E2E-Test)
- [x] Regeln in Abschnitten, jeder Abschnitt mit Quellenangabe; Quellen mit Link, Herausgeber und Abrufdatum (Unit- und E2E-Test)
- [x] Link zur Karte der Einsatzgebiete von Herdenschutz Schweiz
- [x] Übungsvorschläge, als Vorschlag von Schnuffel gekennzeichnet, erscheinen im Tagebuch als Tipphilfe (E2E-Test)
- [x] Abschnitt «Was nicht belegt ist» mit den Lücken der Recherche

Chain of Verification (16.10.2026):

- Geprüft: Verhaltensempfehlungen von Herdenschutz Schweiz (AGRIDEA, Website) und Flyer «Arbeitende Herdenschutzhunde» (AGRIDEA 2021, über Schweizer Wanderwege). Beide stimmen inhaltlich überein. Zuständigkeiten und Rechtsgrundlagen (JSG/JSV seit 1.2.2025) laut BAFU-Seite vom 23.2.2026.
- Nicht belegt: eigene offizielle Regeln für Jägerinnen und Jäger mit Jagdhund; kantonale Einschränkungen der Jagd mit Hund in Einsatzgebieten. Beides steht so in der App.
- Die Übungsvorschläge sind keine Fachaussage, sondern aus den Regeln abgeleitet und in der App so gekennzeichnet.

### ⬜ Später: Fachinhalte (nur geprüft)

- [ ] Übungskatalog nach Ausbildungsbereichen, mit Quellen
- [ ] Bezug zu Prüfungsordnungen (welche, ist offen)
- [ ] Mehrere Hunde

## Annahmen (Etappe 5)

- **Inhalte liegen als Daten in `src/content/herdenschutz.js`**, getrennt von der Darstellung, mit Quellen-IDs pro Abschnitt. So lassen sich weitere Fachthemen gleich aufbauen und prüfen.
- **Externe Links** (Quellen, Karte) öffnen in einem neuen Fenster; die App selbst lädt weiterhin nichts von aussen.
- **Fünf Menüpunkte** sind auf schmalen Handys noch lesbar («Herden­schutz» darf umbrechen). Bei weiteren Themen wird ein Menüpunkt «Wissen» mit Unterseiten sinnvoll.

## Annahmen (Etappe 4)

- **Cloudflare Pages mit Git-Anbindung** statt Upload über GitHub Actions: kein API-Token nötig, jeder Push auf `main` wird automatisch veröffentlicht, jeder andere Zweig bekommt eine Vorschau-Adresse.
- **Content-Security-Policy** erlaubt nur eigene Dateien. Wird später etwas Externes gebraucht (z. B. Karten), muss die Regel in `_headers` erweitert werden.
- **Vorgehen laut Cloudflare-Doku** (Stand 15.10.2026): Workers & Pages → Create application → Pages → Import an existing Git repository. Die Oberfläche kann sich ändern.

## Annahmen (Etappe 3)

- **Import ersetzt alles.** Ein Zusammenführen zweier Datenstände wäre fehleranfällig und ist für ein Gerät mit einem Hund nicht nötig. Vor dem Ersetzen fragt die App nach.
- **Sicherungsformat:** JSON mit Kennung `schnuffel-backup` und Versionsnummer. Beim Import werden alle Felder geprüft und bereinigt, unbekannte Felder verworfen. Dateien aus neueren App-Versionen werden abgelehnt, ältere werden migriert.
- **Erinnerung nach 30 Tagen.** Zeitpunkt der letzten Sicherung wird in den Daten selbst gespeichert und beim Import übernommen.
- **Speichern der Datei** läuft über den Browser-Download. Auf dem Handy landet die Datei im Download-Ordner oder wird zum Teilen angeboten (je nach Browser). Nicht auf echten Geräten geprüft, das gehört zu Etappe 4.

## Annahmen (Etappe 2)

- **Datenmodell:** Eine Einheit gehört zu einem Hund (`dogId`) und enthält eine Liste von Übungen. Übung = Bezeichnung (Freitext), Wildart (Freitext, mit Vorschlägen), Bewertung 1 bis 5 (optional), Notiz.
- **Keine vorgegebenen Übungen oder Wildarten als Pflicht.** Die Wildart-Vorschläge (Reh, Fuchs, Fasan usw.) sind nur Tipphilfen und keine fachliche Aussage. Bereits verwendete Übungsnamen werden als Vorschlag angeboten.
- **Bewertung 1 bis 5** ohne festgelegte Bedeutung der Stufen. Falls eine Skala aus einer Prüfungsordnung gewünscht ist, wird das in der Etappe Fachinhalte geprüft.
- **IndexedDB** über eine kleine Schlüssel-Wert-Schicht (`src/storage.js`). Alle Daten liegen in einem Datensatz, was bei einigen hundert Einheiten problemlos ist. Fällt IndexedDB aus, wird auf localStorage zurückgegriffen.
- **Löschen** fragt mit einem Browser-Dialog nach.

## Annahmen (Etappe 1)

- **Kein Build-Schritt, keine Laufzeit-Bibliotheken.** Reines HTML, CSS und JavaScript. Grund: wenig Wartung, startet schnell, läuft auf jedem statischen Hosting. Wird bei Bedarf überdacht, wenn die App grösser wird.
- **Hash-Navigation (`#/hund`).** Funktioniert ohne Server-Konfiguration und offline.
- **localStorage als erster Speicher**, gekapselt in `src/store.js`. Für das Trainingstagebuch ist IndexedDB vorgesehen (mehr Platz, später auch Fotos).
- **Ein Hund pro Gerät** in dieser Etappe. Das Datenformat erlaubt schon mehrere.
- **Service Worker mit fester Dateiliste.** Bei jeder Änderung an App-Dateien muss `CACHE_VERSION` in `sw.js` erhöht werden.
- **Icon** ist ein einfacher Pfotenabdruck als Platzhalter.

## Offene Fragen

- Welche Rassen und welche Prüfungen (z. B. Schweizer oder deutsche Ordnungen) stehen im Fokus?
- Soll die Bewertung 1 bis 5 eine festgelegte Bedeutung bekommen (z. B. angelehnt an ein Prüfungsschema)?
- Soll die App später eine eigene Domain bekommen (statt `*.pages.dev`)?

## Bekannte Grenzen

- Browser können lokale Daten löschen, z. B. wenn Speicher knapp ist oder Safari die Seite länger nicht gesehen hat. Die App bittet um dauerhaften Speicher, das wird aber nicht überall gewährt. Darum regelmässig sichern (Etappe 3).
