# Projektstatus Schnuffel

Diese Datei ist die Zielliste des Projekts. Sie wird bei jeder Etappe nachgeführt.

**Projektziel:** Eine funktionierende, praxistaugliche Trainings-App für Jagdhunde. Sie läuft als Web-App (PWA), lässt sich aufs Handy installieren und funktioniert offline. Die Daten bleiben auf dem Gerät.

**Arbeitsweise:** Kleine Etappen mit Akzeptanzkriterien und Tests. Fachliche Inhalte (Ausbildung, Prüfungsordnungen CH/EU, Tierschutz, Trainingsmethoden) werden erst aufgenommen, wenn sie mit Quellen geprüft sind (Chain of Verification). Nicht Verifiziertes wird gekennzeichnet.

Stand: 2026-10-16

## Nächster Schritt

Etappe 2 planen: Trainingstagebuch. Vorher mit Jules klären, welche Angaben pro Trainingseinheit wichtig sind (siehe offene Fragen).

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

### ⬜ Etappe 2: Trainingstagebuch

Ziel: Trainingseinheiten erfassen, anzeigen, bearbeiten und löschen, offline.

Akzeptanzkriterien (Entwurf):

- [ ] Einheit mit Datum, Dauer, Übung (Freitext) und Notiz erfassen
- [ ] Liste der Einheiten, neueste zuerst
- [ ] Bearbeiten und Löschen mit Rückfrage
- [ ] Wechsel der Datenablage auf IndexedDB, mit Übernahme der bestehenden Daten
- [ ] Tests für alle Punkte

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

## Annahmen (Etappe 1)

- **Kein Build-Schritt, keine Laufzeit-Bibliotheken.** Reines HTML, CSS und JavaScript. Grund: wenig Wartung, startet schnell, läuft auf jedem statischen Hosting. Wird bei Bedarf überdacht, wenn die App grösser wird.
- **Hash-Navigation (`#/hund`).** Funktioniert ohne Server-Konfiguration und offline.
- **localStorage als erster Speicher**, gekapselt in `src/store.js`. Für das Trainingstagebuch ist IndexedDB vorgesehen (mehr Platz, später auch Fotos).
- **Ein Hund pro Gerät** in dieser Etappe. Das Datenformat erlaubt schon mehrere.
- **Service Worker mit fester Dateiliste.** Bei jeder Änderung an App-Dateien muss `CACHE_VERSION` in `sw.js` erhöht werden.
- **Icon** ist ein einfacher Pfotenabdruck als Platzhalter.

## Offene Fragen

- Welche Rassen und welche Prüfungen (z. B. Schweizer oder deutsche Ordnungen) stehen im Fokus?
- Welche Angaben pro Trainingseinheit sind für die Praxis wichtig?
- Wo soll die App veröffentlicht werden (GitHub Pages ist der einfachste Weg)?

## Bekannte Grenzen

- Browser können lokale Daten löschen, z. B. wenn Speicher knapp ist oder Safari die Seite länger nicht gesehen hat. Die App bittet um dauerhaften Speicher, das wird aber nicht überall gewährt. Darum ist Etappe 3 (Export) wichtig.
