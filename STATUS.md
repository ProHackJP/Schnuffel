# Projektstatus Schnuffel

Diese Datei ist die Zielliste des Projekts. Sie wird bei jeder Etappe nachgeführt.

**Projektziel:** Eine funktionierende, praxistaugliche Trainings-App für Jagdhunde. Sie läuft als Web-App (PWA), lässt sich aufs Handy installieren und funktioniert offline. Die Daten bleiben auf dem Gerät.

**Arbeitsweise:** Kleine Etappen mit Akzeptanzkriterien und Tests. Fachliche Inhalte (Ausbildung, Prüfungsordnungen CH/EU, Tierschutz, Trainingsmethoden) werden erst aufgenommen, wenn sie mit Quellen geprüft sind (Chain of Verification). Nicht Verifiziertes wird gekennzeichnet.

Stand: 2026-10-16

## Nächster Schritt

Etappe 3: Export und Import der Daten, damit nichts verloren geht und ein Gerätewechsel möglich ist.

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

### ⬜ Etappe 3: Datensicherung

- [ ] Export aller Daten als Datei und Import auf einem anderen Gerät
- [ ] Hinweis, wenn lange keine Sicherung gemacht wurde

### ⬜ Etappe 4: Veröffentlichung

- [ ] App öffentlich erreichbar (z. B. GitHub Pages), damit sie aufs Handy installiert werden kann
- [ ] Test der Installation auf Android und iPhone

### ⬜ Später: Fachinhalte (nur geprüft)

- [ ] Übungskatalog nach Ausbildungsbereichen, mit Quellen
- [ ] Bezug zu Prüfungsordnungen (welche, ist offen)
- [ ] Mehrere Hunde

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
- Wo soll die App veröffentlicht werden (GitHub Pages ist der einfachste Weg)?

## Bekannte Grenzen

- Browser können lokale Daten löschen, z. B. wenn Speicher knapp ist oder Safari die Seite länger nicht gesehen hat. Die App bittet um dauerhaften Speicher, das wird aber nicht überall gewährt. Darum ist Etappe 3 (Export) wichtig.
