# Projektstatus Schnuffel

Diese Datei ist die Zielliste des Projekts. Sie wird bei jeder Etappe nachgeführt.

**Projektziel:** Eine funktionierende, praxistaugliche Trainings-App für Jagdhunde. Sie läuft als Web-App (PWA), lässt sich aufs Handy installieren und funktioniert offline. Die Daten bleiben auf dem Gerät.

**Arbeitsweise:** Kleine Etappen mit Akzeptanzkriterien und Tests. Fachliche Inhalte (Ausbildung, Prüfungsordnungen CH/EU, Tierschutz, Trainingsmethoden) werden erst aufgenommen, wenn sie mit Quellen geprüft sind (Chain of Verification). Nicht Verifiziertes wird gekennzeichnet.

Stand: 2026-10-20 (Etappen 1 bis 7, Kontrollkästchen und Plan «Jagdhund in Schweden», App veröffentlicht bis Version 0.5.0)

## Nächster Schritt

Etappe 7 (Trainingspläne, mehrere Hunde) ist gebaut und wartet auf die Zusammenführung. Dazu kamen auf Wunsch von Jules Kontrollkästchen für Schritte und Übungen mit der Ansicht «Offene Punkte» (Version 0.7.0) und der Plan «Jagdhund in Schweden» (Version 0.8.0). Jules probiert danach auf dem Handy aus: Installation als App, Offline-Start, Datensicherung, zweiten Hund anlegen, Schritte und Übungen abhaken, offene Punkte ansehen, den Schweden-Plan fachlich prüfen. Danach folgt Etappe 8 (Auswertung: Fortschritt und Statistik pro Hund). Offen für die Fachinhalte: Prüfungsordnung des BEJV im Wortlaut (siehe «Was nicht belegt ist» im Plan) und weitere Kantone.

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

### 🔶 Etappe 4: Veröffentlichung (Cloudflare)

Entscheid von Jules (2026-10-16): Cloudflare. Jules hat in Cloudflare ein Worker-Projekt «schnuffel» mit Git-Anbindung an `ProHackJP/Schnuffel` angelegt (nicht ein Pages-Projekt). Das ist gleichwertig: Cloudflare liefert den Ordner `dist` als statische Dateien aus und baut bei jedem Push auf `main`. Dafür braucht es `wrangler.jsonc` im Repository.

- [x] Build-Schritt `npm run build` kopiert nur die App-Dateien nach `dist/` (Unit-Test prüft Inhalt)
- [x] `_headers` mit Sicherheits-Headern (CSP, kein Framing) und `Cache-Control: no-cache` für `sw.js`; der Entwicklungsserver wendet dieselben Regeln an, alle Browser-Tests laufen damit
- [x] Repository in Cloudflare verbunden (Worker «schnuffel», Git-Anbindung an `ProHackJP/Schnuffel`) – Jules, Stand Screenshot 2026-10-16 14:39
- [x] `wrangler.jsonc` (Name `schnuffel`, Ausgabe `dist`), Trockenlauf von Wrangler bestanden, Unit-Test prüft Name und Ausgabeordner
- [x] Erster automatischer Build auf `main` erfolgreich (Workers Builds, 2026-10-16 14:55 UTC)
- [x] App unter https://schnuffel.julian90-fca.workers.dev erreichbar. Geprüft per Abruf: Startseite, `sw.js` (Cache-Version v5 mit Ausbildungsplan), Manifest und Ausbildungsdaten werden ausgeliefert. Nicht geprüft: die Header aus `_headers` (CSP, kein Framing, `sw.js` ohne Cache), da der Abruf keine Header zeigt.
- [ ] Test der Installation als PWA, des Offline-Betriebs und der Datensicherung auf Android und iPhone – macht Jules

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

### ✅ Etappe 6: Ausbildung zum Herdenschutzhund

Wunsch von Jules (2026-10-16): «baue ein training ein um den hund als herdenschutzhund auszubilden». Umfang (Auswahlkarte, Standard «Eigener Hund»): Ausbildungsplan mit Phasen, Prüfung des Bundes, Übungsvorschlägen mit Fortschritt aus dem Tagebuch. Unterseite von Herdenschutz (`#/herdenschutz/ausbildung`), damit die Navigation bei fünf Menüpunkten bleibt.

Akzeptanzkriterien:

- [x] Von «Herdenschutz» aus erreichbar, offline verfügbar (E2E-Test)
- [x] Offizieller Weg (Sachkundekurs, Verein HSH-CH, Eignungsprüfung des Bundes, Amicus) mit Quellen
- [x] Fünf Phasen mit Altersangaben, jede mit Quellenangabe (Unit- und E2E-Test)
- [x] Ablauf und Kriterien der Eignungsprüfung (Unit- und E2E-Test)
- [x] Übungsvorschläge je Phase, jede einem Prüfungskriterium zugeordnet und als Vorschlag von Schnuffel gekennzeichnet (Unit-Test)
- [x] «Ins Tagebuch» füllt die Übung in einer neuen Einheit vor; der Plan zeigt je Übung Anzahl Einträge und letzte Bewertung (E2E-Test)
- [x] Abschnitt «Was nicht belegt ist»

Chain of Verification (16.10.2026):

- Geprüft und übereinstimmend: Anerkennung nur über die Eignungsprüfung des Bundes (AGRIDEA im Auftrag des BAFU), Mindestalter 18 Monate (AGRIDEA-Merkblatt September 2025), spätestens im zweiten Anlauf (LID 28.4.2026, TierWelt 24.7.2025), Prüfungsablauf und Kriterien (AGRIDEA-Merkblatt EBÜ 2023, TierWelt, BauernZeitung 11.12.2025), Sozialisierung auf drei Ebenen (HSH-CH, Wegleitung Zentralschweiz 30.1.2026, AGRIDEA 2025), Sachkundekurs und Beiträge (Wegleitung Zentralschweiz).
- Abweichung: Das EBÜ-Merkblatt 2023 nennt ein Aufgebot mit 15 bis 18 Monaten, das Merkblatt 2025 ein Mindestalter von 18 Monaten. Beides steht so in der App.
- Nicht belegt: amtlich vorgegebene Übungen (Regelwerk HSH-CH nur für Mitglieder), kantonale Rassenlisten, Regeln anderer Kantone als UR/LU/SZ/ZG/AG/NW, Zulassung eines Jagdhundes zur Prüfung. Alles steht so in der App.
- Hinweis an Jules: Herdenschutzhunde sind keine Jagdhunde. Die App sagt das deutlich und verweist auf die Beratungsstellen.

### ✅ Etappe 7: Trainingspläne und mehrere Hunde

Wunsch von Jules (2026-10-16): «Es enthält keinen Trainingsplan» und «frage mich über den Umfang der App aus». Antworten aus dem Interview: Planform «Schritt für Schritt», Jagdhund und Herdenschutzhund zugleich, nur geprüfte Quellen, mehrere Hunde, danach Auswertung. Freigabe des Entwurfs per Auswahlkarte am 2026-10-18, Kanton für den Jagdhund-Plan: Bern.

Akzeptanzkriterien:

- [x] Mehrere Hunde: hinzufügen, bearbeiten, löschen (Rückfrage nennt die mitgelöschten Einheiten), aktiver Hund wählbar und nach Neuladen erhalten (Unit- und E2E-Test)
- [x] Neue Einheiten gehören zum aktiven Hund, das Tagebuch zeigt nur dessen Einheiten (Unit- und E2E-Test)
- [x] Daten aus Schema 3 werden ohne Verlust übernommen, Sicherung exportiert und importiert mehrere Hunde und den Planfortschritt, alte Sicherungen bleiben lesbar (Unit- und E2E-Test)
- [x] Menüpunkt «Pläne» mit Übersicht und Planansicht, offline verfügbar (E2E-Test)
- [x] Schritte pro Hund mit einem Kontrollkästchen als «geschafft» abhaken und wieder zurücknehmen, getrennter Fortschritt je Hund, bleibt nach Neuladen, geht auch offline (Unit- und E2E-Test)
- [x] Jede Übung eines Schritts hat ebenfalls ein Kontrollkästchen. Ein Schritt mit mindestens einer abgehakten Übung gilt als «In Arbeit», sind alle Übungen abgehakt, erinnert die App daran, den Schritt zu prüfen (Unit- und E2E-Test)
- [x] Offene Punkte bleiben sichtbar: Im Plan zeigt ein Feld «Offene Punkte» alle nicht abgehakten Schritte und Übungen (mit Sprung zum Schritt), die Seite «Offene Punkte» (`#/plaene/offen`) zeigt sie für alle begonnenen Pläne des aktiven Hundes (Unit- und E2E-Test)
- [x] Abgehakte Übungen gehören zur Datensicherung, Sicherungen aus Schema 3 und 4 bleiben lesbar (Unit- und E2E-Test)
- [x] Jede Übung hat «Ins Tagebuch», der Plan zeigt die Anzahl Einträge und die letzte Bewertung (E2E-Test)
- [x] Jeder Schritt nennt seine Quellen (Titel, Herausgeber, https-Adresse, Abrufdatum) oder ist als Vorschlag von Schnuffel gekennzeichnet (Unit-Test)
- [x] Herdenschutzhund-Plan: die fünf Phasen aus Etappe 6 als Schritte, alle Übungen übernommen (Unit-Test)
- [x] Jagdhund-Plan Kanton Bern: sieben Schritte, nur Aussagen mit Quelle, Lücken und Vorbehalte im Plan sichtbar (Unit- und E2E-Test)

Chain of Verification (18.10.2026), Jagdhund-Plan Kanton Bern:

- Geprüft und übereinstimmend (zwei Fassungen der Direktionsverordnung über die Jagd, BSG 922.111.1, Stand 2009 und Stand 1.3.2023, dazu Berner Jägerverband und Vorstehhundjägerverein): Ausweis über die bestandene Gehorsamsprüfung des BEJV für jeden Hund ab drei Jahren (Art. 7 Abs. 1 Bst. b), zugelassene Rassen nach FCI-Gruppen 3, 4, 6, 7, 8 (Art. 6), höchstens zwei Hunde pro Jäger (Art. 7), Anlernen junger Hunde nur einzeln, werktags im September und mit Bewilligung der Wildhut (Art. 9), Nachsuche auf Schalenwild nur mit einem auf Schweiss geprüften Hund (Art. 16 Abs. 3). Die Gehorsamsprüfung ist laut VHJV Voraussetzung für die Berner Schweissprüfungen und die Schleppen- und Apportierprüfung.
- Aus einer Quelle: Prüfungsteile der Gehorsamsprüfung (Leinenführigkeit, Ablegen, Schussruhe, Appell) vom Jagdverein Gürbetal; Anforderungen der Schweissprüfungen aus dem Reglement der AGJ/TKJ (22.11.2022, in Kraft ab 1.1.2025). Beides steht so in der App, mit dem Vorbehalt dazu.
- Nicht belegt: Wortlaut der Prüfungsordnung des BEJV (Version 1.7.2018, PDF war nicht lesbar abrufbar, der Direktabruf von bernerjagd.net ist in dieser Umgebung gesperrt), Mindestalter für die Gehorsamsprüfung, ob die Berner Schweissprüfungen genau nach dem AGJ/TKJ-Reglement laufen, was die Verordnung mit «geprüfter Apporteur» meint, ergänzende Richtlinien des Jagdinspektorats, NASU-Richtlinie. Alles steht so im Plan unter «Was nicht belegt ist».
- Nicht verwendet: Brauchbarkeitsprüfungen aus Deutschland und Vorschriften anderer Kantone (Glarus, Schwyz u. a.). Die Jagdhunde-Vorschriften sind kantonal geregelt.
- Keine Trainingsmethoden: Wie die Übungen aufgebaut werden, steht in keiner geprüften Quelle. Die App erfindet es nicht und verweist auf Kurse und Hundeobleute.

### ✅ Etappe 7b: Plan «Jagdhund in Schweden»

Wunsch von Jules (2026-10-20): «Ich will meinen Hund in Schweden trainieren. Ergänze Trainings für spezifische Bedingungen in Schweden.» Der Zweck (Reise oder Jagd, dauerhaft dort, Vorbereitung zuhause) ist per Auswahlkarte gefragt, die Antwort steht noch aus. Bis dahin gilt die Annahme «Reise oder Jagd».

Akzeptanzkriterien:

- [x] Dritter Plan «Jagdhund in Schweden» in der Übersicht und als Planansicht, mit sieben Schritten: Einreise, Aufsicht und Leine, Jagdhund-Arbeit und Training, Jagen als Gast, Nachsuche, Wolf, Zecken und Gesundheit (Unit- und E2E-Test)
- [x] Jede Aussage nennt ihre Quelle, die 14 Quellen haben Titel, Herausgeber, https-Adresse und Abrufdatum (Unit- und E2E-Test)
- [x] Alle Übungen sind als «Vorschlag von Schnuffel» gekennzeichnet, jeder Schritt mit Übungen sagt, dass der Aufbau nicht belegt ist (Unit-Test)
- [x] Lücken stehen im Plan unter «Was nicht belegt ist» (Unit- und E2E-Test)
- [x] Kontrollkästchen, Offene Punkte, Sicherung und Offline funktionieren auch für diesen Plan (E2E-Test)

Chain of Verification (20.10.2026), Plan Schweden:

- Geprüft und übereinstimmend (mindestens zwei Quellen): Tollwutimpfung mit 21 Tagen Wartezeit nach der Grundimpfung, Chip, Heimtierausweis und Zollanmeldung (Jordbruksverket Reiseleitfaden, Jordbruksverket «Ta in hundar», Info Norden); keine Pflicht zur Entwurmung bei der Einreise, aber Empfehlung (zwei Seiten des Jordbruksverket); Aufsichtspflicht vom 1. März bis 20. August (Hundeaufsichtsgesetz 16 §, Länsstyrelsen Östergötland und Gävleborg, Jaktförordning 19 §); Hund für die Nachsuche innerhalb von zwei Stunden (Jaktförordning 17 §, Svenska Jägareförbundet).
- Aus einer Quelle: Zeiten für Jagdhunde je Wildart (Jaktförordning 16 §, in zwei Abrufen gleich gelesen), Jagdgebühr und Waffeneinfuhr (Naturvårdsverket, Seite ohne Datum), Wolf (Faktenblatt Viltskadecenter, alt, und Test von 2014), Zecken (HSS 3/2023 nach SVA), FSME (SVA 2023), Kreuzotter (Pressemitteilung von Agria, vor allem zu Katzen).
- Abweichungen und Auffälligkeiten: Die Seite «Ta in hundar» des Jordbruksverket nennt «Senast granskad 14.1.2025», die Metadaten 16.10.2026. Der Reiseleitfaden nennt die Schweiz bei den Ausweisen und beim Formular E9.204a, ordnet sie aber nicht selbst einer Gruppe zu, die andere Seite ordnet sie der Gruppe der EU-Länder zu. Das Jagdgesetz allein enthält die Sperrzeit nicht, sie steht im Hundeaufsichtsgesetz 16 §.
- Nicht verwendet: Sveriges Radio (Abruf gesperrt), Naturkartan (kein Amt), Rechtsforen und Nachrichtenartikel.
- **Einschränkung:** Die Seiten wurden über ein Abrufwerkzeug gelesen, das den Text zusammenfasst. Zahlen und Daten wurden doppelt abgerufen, wo möglich, aber nicht im Original-PDF gegengelesen. Das steht auch im Plan.
- Nicht belegt: Anerkennung von Schweizer Prüfungen in Schweden, Auslandsjäger-Prüfung, Reiseregeln für «Wettkampf oder Training», Leinenpflicht in Nationalparks und Gemeinden, Regeln weiterer Landkreise, Klima und Gelände, Bär, Luchs und Wildschwein, schwedische Trainingsmethoden. Alles steht so im Plan.

### ⬜ Etappe 8: Auswertung

Wunsch von Jules (Interview, 2026-10-16): nach dem Trainingsplan die Auswertung. Entwurf folgt nach Rückmeldung zu Etappe 7: Fortschritt und Statistik pro Hund aus Tagebuch und Plan.

### ⬜ Später: Fachinhalte (nur geprüft)

- [ ] Weitere Kantone für den Jagdhund-Plan (zuerst nach Wunsch von Jules)
- [ ] Prüfungsordnung des BEJV im Wortlaut lesen und die Prüfungsteile belegen
- [ ] Übungskatalog nach Ausbildungsbereichen, mit Quellen
- [ ] Bezug zu Prüfungsordnungen (welche, ist offen)

## Annahmen (Etappe 7)

- **Eine Person, mehrere Hunde, ein Gerät.** Mehrere Personen oder Konten sind nicht vorgesehen (Antwort «Mehrere Hunde» im Interview).
- **«Geschafft» bestätigt Jules selbst.** Die App entscheidet das nicht automatisch aus dem Tagebuch und auch nicht aus den abgehakten Übungen. Das Tagebuch zeigt je Übung nur, wie oft sie geübt wurde.
- **Kontrollkästchen auf zwei Ebenen (Wunsch Jules, 2026-10-19):** Jeder Schritt und jede Übung darin hat ein Kästchen. Ich habe «Trainingseinheiten» und «Teilschritte» so gedeutet: Schritte des Plans und Übungen darin. Die Aussagen unter «Das gilt in Schritt» sind Information und haben kein Kästchen. «In Arbeit» setzt Jules nicht mehr selbst, die App leitet es aus den abgehakten Übungen ab. Ältere Daten mit dem Status «In Arbeit» bleiben gültig.
- **Offene Punkte** sind alle nicht abgehakten Schritte und alle nicht abgehakten Übungen, auch wenn der Schritt selbst abgehakt ist. Die Seite «Offene Punkte» listet nur Pläne, in denen schon etwas abgehakt ist, die übrigen stehen als «Noch nicht begonnen» darunter.
- **Abgehakte Übungen werden über den Übungsnamen gespeichert** (Schema 5, Liste `planChecks`, gleiche Kennung wie im Tagebuch). Würde ein Übungsname im Plan später geändert, verliert der Haken seine Wirkung, ohne Fehler.
- **Pläne sind unveränderliche Daten in der App** (`src/content/plans.js`, `jagdhund-be.js`, `hsh-ausbildung.js`). Gespeichert wird nur der Fortschritt pro Hund (Schema 4 Liste `planProgress` für Schritte, ab Schema 5 Liste `planChecks` für Übungen). «Offen» ist der Normalzustand und wird nicht gespeichert.
- **Neuer Hund wird gleich aktiv.** Beim Löschen eines Hundes fallen seine Einheiten und sein Planfortschritt weg, die Rückfrage nennt die Anzahl. Ohne Auswahl gilt der erste Hund.
- **Kennzeichnung der Übungen:** Prüfungsteile aus einer Quelle zeigen die Quelle, alle anderen Übungen sind «Vorschlag von Schnuffel». Gleiches gilt für das Kriterium «Geschafft, wenn».
- **Sechs Menüpunkte** (Start, Hund, Training, Pläne, Herdenschutz, Info). Bei 360 Pixel Breite noch lesbar, «Herdenschutz» bricht um. Bei weiteren Themen wird ein Menüpunkt «Wissen» sinnvoll.
- **Gleiche Adresse, gleiche Ansicht:** Wer das Hundeformular der Erstanlage speichert, bleibt auf dem Formular und sieht die Liste erst nach einem Wechsel der Ansicht. Wie schon in Etappe 1.

## Annahmen (Etappe 6)

- **Unterseite statt sechstem Menüpunkt.** Der Ausbildungsplan hängt unter «Herdenschutz». Bei weiteren Fachthemen kommt ein Menüpunkt «Wissen».
- **Fortschritt wird aus dem Tagebuch berechnet,** über den exakten Übungsnamen. Wer den Namen beim Erfassen ändert, sieht den Eintrag nicht im Plan. Dafür braucht es keine neue Datenstruktur und kein Datenformat-Update.
- **Vorausfüllen über die Adresse** (`#/training/neu?uebung=Name`), damit der Link offline und ohne Zwischenspeicher funktioniert.
- **Übungen sind abgeleitet,** je eine pro Prüfungskriterium und Sozialisierungsgrundsatz. Sie sind in der App als Vorschlag von Schnuffel gekennzeichnet.

## Annahmen (Etappe 5)

- **Inhalte liegen als Daten in `src/content/herdenschutz.js`**, getrennt von der Darstellung, mit Quellen-IDs pro Abschnitt. So lassen sich weitere Fachthemen gleich aufbauen und prüfen.
- **Externe Links** (Quellen, Karte) öffnen in einem neuen Fenster; die App selbst lädt weiterhin nichts von aussen.
- **Fünf Menüpunkte** sind auf schmalen Handys noch lesbar («Herden­schutz» darf umbrechen). Bei weiteren Themen wird ein Menüpunkt «Wissen» mit Unterseiten sinnvoll.

## Annahmen (Etappe 4)

- **Cloudflare mit Git-Anbindung** statt Upload über GitHub Actions: kein API-Token nötig, jeder Push auf `main` wird automatisch veröffentlicht. Jules' Projekt ist ein Worker mit statischen Dateien statt Pages; die Cloudflare-Doku empfiehlt Workers inzwischen auch für neue statische Seiten. Gleiches Ergebnis, andere Adresse (`*.workers.dev`).
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

- Welche Kantone sollen nach Bern für den Jagdhund-Plan folgen? (Deutsche Ordnungen gelten in der Schweiz nicht und werden nicht verwendet.)
- Soll die Bewertung 1 bis 5 eine festgelegte Bedeutung bekommen (z. B. angelehnt an ein Prüfungsschema)?
- Soll die App später eine eigene Domain bekommen (statt `*.workers.dev`)?

## Bekannte Grenzen

- Browser können lokale Daten löschen, z. B. wenn Speicher knapp ist oder Safari die Seite länger nicht gesehen hat. Die App bittet um dauerhaften Speicher, das wird aber nicht überall gewährt. Darum regelmässig sichern (Etappe 3).
