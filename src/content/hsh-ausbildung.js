// Inhalte zur Ausbildung zum Herdenschutzhund (HSH) in der Schweiz. Jede Aussage stützt sich auf die unten
// genannten Quellen (geprüft am 16.10.2026). Die Übungen sind Vorschläge von Schnuffel, abgeleitet aus den
// Prüfungskriterien und Grundsätzen, und sind als solche gekennzeichnet.

export const SOURCES = [
  {
    id: 'agridea-2025',
    title: 'Erfolgreiches Arbeiten mit Herdenschutzhunden (Merkblatt, September 2025)',
    publisher: 'AGRIDEA, Fachstelle Herdenschutz',
    url: 'https://shop.agridea.ch/shop/resources/downloads/4014/4014_DE_2025_free.pdf',
    retrieved: '2026-10-16',
  },
  {
    id: 'agridea-ebue',
    title: 'EBÜ – Die Einsatzbereitschaftsüberprüfung (Merkblatt, August 2023)',
    publisher: 'AGRIDEA',
    url: 'https://herdenschutzschweiz.ch/fileadmin/doc/Herdenschutzmassnahmen/Herdenschutzhunde/4474_D_23__EBUE_EAT_Def.pdf',
    retrieved: '2026-10-16',
  },
  {
    id: 'agridea-grundlagen',
    title: 'Grundlagen Herdenschutzhunde (Merkblatt, November 2019)',
    publisher: 'AGRIDEA',
    url: 'https://herdenschutzschweiz.ch/fileadmin/doc/Herdenschutzmassnahmen/Herdenschutzhunde/N0084___1a___D_19_WEB_LINK_Herdenschutz_mit_Hunden.pdf',
    retrieved: '2026-10-16',
  },
  {
    id: 'wegleitung-2026',
    title: 'Wegleitung Herdenschutzhunde (30. Januar 2026)',
    publisher: 'Überkantonale Koordination Herdenschutz UR, LU, SZ, ZG, AG, NW',
    url: 'https://zg.ch/de/dam/jcr:2aa6b954-4cd7-4ef1-a54a-1a72d826bf14/Def._Wegleitung%20HSH_27.03.2026.pdf',
    retrieved: '2026-10-16',
  },
  {
    id: 'hsh-ch',
    title: 'Grundsätze der Ausbildung',
    publisher: 'Verein Herdenschutzhunde Schweiz (HSH-CH)',
    url: 'https://www.cpt-ch.ch/ausbildung/grundsaetze/',
    retrieved: '2026-10-16',
  },
  {
    id: 'skn-2013',
    title: 'Sachkundenachweis für Halter von Herdenschutzhunden, Unterlagen zum Theoriekurs (Februar 2013)',
    publisher: 'Herdenschutzhunde Schweiz',
    url: 'https://www.protectiondestroupeaux.ch/fileadmin/doc/Berichte/SKN/N0026_D_18_WEB_Unterlagen_Theoriekurs.pdf',
    retrieved: '2026-10-16',
  },
  {
    id: 'tierwelt-2025',
    title: 'So läuft die Einsatzbereitschaftsprüfung für angehende Herdenschutzhunde ab (24. Juli 2025)',
    publisher: 'TierWelt',
    url: 'https://www.tierwelt.ch/artikel/hunde/so-laeuft-die-einsatzbereitschaftspruefung-fuer-angehende-herdenschutzhunde-ab-551776',
    retrieved: '2026-10-16',
  },
  {
    id: 'bauernzeitung-2025',
    title: 'Nur geprüfte Hunde sollten für den Herdenschutz im Einsatz sein (11. Dezember 2025)',
    publisher: 'BauernZeitung',
    url: 'https://www.bauernzeitung.ch/artikel/tiere/nur-gepruefte-hunde-sollten-im-einsatz-sein-0-553893',
    retrieved: '2026-10-16',
  },
  {
    id: 'lid-2026',
    title: 'Herdenschutzhunde: erste Bilanz nach Revision des Jagdgesetzes (28. April 2026)',
    publisher: 'LID Landwirtschaftlicher Informationsdienst',
    url: 'https://lid.ch/artikel/herdenschutzhunde-erste-bilanz-nach-revision-des-jagdgesetzes',
    retrieved: '2026-10-16',
  },
];

// Der offizielle Weg in der Schweiz, Stand Jagdverordnung vom 1. Februar 2025.
export const OFFICIAL_PATH = {
  sources: ['lid-2026', 'wegleitung-2026', 'bauernzeitung-2025', 'agridea-2025'],
  items: [
    'Der Bund anerkennt und unterstützt nur Hunde, die die Eignungsprüfung des Bundes bestanden haben. AGRIDEA führt die Prüfung im Auftrag des BAFU durch; bestandene Hunde werden in der Datenbank Amicus als Herdenschutzhunde eingetragen.',
    'Die Prüfung muss spätestens im zweiten Anlauf bestanden werden. Hunde, die zweimal durchfallen, werden nicht anerkannt.',
    'Halterinnen und Halter besuchen vorher einen eintägigen Sachkundekurs (Einführung in die Haltung). AGRIDEA bietet dazu einen Vorbereitungskurs auf die Prüfung an; laut AGRIDEA ist die Teilnahme entscheidend für den Prüfungserfolg.',
    'Zucht, Ausbildung und Vermittlung laufen über den Verein Herdenschutzhunde Schweiz (HSH-CH) nach dessen verbindlichem Regelwerk. Beratung, Registrierung und Beiträge laufen seit 2025 über die Kantone.',
    'Die Zulassung zur Prüfung ist nicht mehr auf einzelne Rassen begrenzt. Bisher wurden vor allem Montagne des Pyrénées und Maremmano-Abruzzese eingesetzt.',
    'Herdenschutzhunde werden immer mindestens zu zweit eingesetzt und leben das ganze Jahr bei der Herde, mit jederzeit freiem Zugang zu allen Tieren.',
  ],
};

// Ausbildungsphasen. Altersangaben stammen aus den Quellen; wo nur ungefähre Angaben belegt sind, steht «etwa».
export const PHASES = [
  {
    id: 'vorbereitung',
    title: 'Vor der Anschaffung',
    age: 'vor dem Welpen',
    sources: ['wegleitung-2026', 'agridea-2025', 'agridea-grundlagen'],
    items: [
      'Erstberatung bei der kantonalen Herdenschutzberatung und beim Verein HSH-CH. Zwischen Erstkontakt und Platzierung vergehen laut AGRIDEA im Schnitt ein bis zwei Jahre.',
      'Eintägiger Sachkundekurs für Halterinnen und Halter (obligatorisch für Erstmalige mit Förderung).',
      'Eine Person wird als «Fürsorgegarant» bestimmt: Sie baut die Beziehung zu den Hunden auf und ist hauptverantwortlich für Sozialisierung, Gewöhnung, Beschäftigung und Bewegung. Geteilte Verantwortung ist laut AGRIDEA die häufigste Problemquelle.',
      'Betrieb vorbereiten: Die Hunde leben ganzjährig bei den Nutztieren, auch im Winter im Stall. Mindestens zwei Hunde, mindestens eine halbe Stunde Zeit pro Tag, in den ersten Monaten deutlich mehr.',
      'Welpen sollen nur Personen mit Erfahrung in der Herdenschutzhundehaltung kaufen (Wegleitung der Zentralschweizer Kantone).',
    ],
  },
  {
    id: 'welpe',
    title: 'Welpe und Junghund: Sozialisierung',
    age: 'ab Abgabe bis etwa 12 Monate',
    sources: ['hsh-ch', 'agridea-2025', 'tierwelt-2025', 'skn-2013', 'wegleitung-2026'],
    items: [
      'Sozialisierung auf drei Ebenen: mit dem Menschen, mit dem Nutztier und mit dem Hunderudel. Die Entwicklungsphasen des Hundes werden dabei berücksichtigt.',
      'Täglicher Kontakt zu Schafen, Hunden und Menschen von Anfang an. Als Welpen lernen die Hunde Menschen, Tiere, Hofleben und Fahrzeuge kennen. «Eine solide Gewöhnung ist das A und O des Konfliktmanagements.»',
      'Ziel sind Selbstsicherheit und Stresstoleranz, auch abseits der Herde.',
      'Die vertrauensvolle Bindung zum Menschen macht den Hund lenkbar, schwächt sein Abwehrverhalten gegenüber Eindringlingen aber nicht. Fördern statt deprivieren.',
      'Persönlich und wenn möglich täglich füttern: Das stärkt die Beziehung und festigt das Herrufen. Ein Hund darf grundsätzlich nie geschlagen werden; Stachelhalsbänder und Strafschüsse sind verboten.',
      'Beschäftigung und Bewegung jeden Tag (Tierschutzverordnung Art. 71). Unterbeschäftigung und Bewegungsmangel können zu schweren Verhaltensstörungen führen.',
      'Der Bund zahlt für diese Zeit einen Ausbildungsbeitrag vom 4. bis zum 18. Lebensmonat (über den Verein HSH-CH).',
    ],
  },
  {
    id: 'junghund',
    title: 'Junghund: Arbeit in der Herde',
    age: 'etwa 12 bis 18 Monate',
    sources: ['tierwelt-2025', 'agridea-2025', 'agridea-grundlagen', 'skn-2013', 'agridea-ebue'],
    items: [
      'Ab etwa einem Jahr wird der Hund einer Herde zugeteilt, mit der er selbstständig arbeiten muss.',
      'Die Bindung zu den Nutztieren entwickelt sich langsam und lässt sich nur begrenzt beeinflussen. Jungtiere, die in Anwesenheit der Hunde geboren werden, akzeptieren die Hunde leichter als Herdenmitglieder.',
      'Der Hund soll zwischen Hund und Mensch unterscheiden: An der Herde zeigt er Abwehr gegenüber fremden Hunden, ausserhalb der Herde Toleranz gegenüber Mensch und Hund.',
      'Wesensfest ist ein Hund, der sich in Anwesenheit des Fürsorgegaranten nach Anleitung beruhigt. Instinktsicher ist er, wenn er selbstständig herdenorientiertes Abwehrverhalten zeigt.',
      'Das Verjagen von Raubwild wie Fuchs, Luchs oder Wolf ist erwünscht. Das systematische Verfolgen von Schalenwild gilt als nicht tolerierbar.',
    ],
  },
  {
    id: 'pruefung',
    title: 'Eignungsprüfung des Bundes',
    age: 'ab 18 Monaten',
    sources: ['agridea-2025', 'agridea-ebue', 'tierwelt-2025', 'bauernzeitung-2025'],
    items: [
      'Hunde können ab dem Mindestalter von 18 Monaten durch den Bund auf ihre Eignung geprüft werden. Aufgeboten werden sie im Alter von 15 bis 18 Monaten.',
      'Jeder Hund wird einzeln geprüft, auch wenn Herdenschutzhunde im Team arbeiten. Mitzubringen sind fünf gesunde, mit Hund und Mensch vertraute Schafe (oder Ziegen) samt Tierverkehrs- und Gesundheitsdokumenten. Der Hund ist gesund, trägt ein Halsband, Hündinnen sind nicht läufig.',
      'Die häufigsten Gründe fürs Nichtbestehen sind mangelnde Herdentreue sowie ungenügende Führbarkeit oder Stresstoleranz. Im langjährigen Schnitt bestehen neun von zehn Hunden im ersten oder zweiten Anlauf.',
    ],
  },
  {
    id: 'erwachsen',
    title: 'Erwachsener Hund im Einsatz',
    age: 'ab etwa 2 Jahren',
    sources: ['agridea-grundlagen', 'bauernzeitung-2025', 'wegleitung-2026'],
    items: [
      'Mit rund zwei Jahren gilt der Hund als erwachsen. Seine volle Wirkung erreicht er erst mit Erfahrung und im eingespielten Hunderudel.',
      'Die Integration auf dem Betrieb dauert in der Regel drei Jahre: Aufbau (1. Jahr, enge Begleitung durch die Beratung), Stabilisierung (2. Jahr), Konsolidierung (3. Jahr, die Hunde arbeiten selbstständig, Unterhalt etwa 30 Minuten pro Tag).',
      'Nach der Prüfung gibt es keine Nachkontrolle. Bei Problemen die kantonale Beratung beiziehen; bei Beissvorfällen, Streunen oder Wildern sind die kantonalen Vollzugsbehörden zuständig.',
      'Regelmässige Weiterbildung der Halterinnen und Halter ist Bedingung für kantonale Beiträge.',
    ],
  },
];

// Ablauf und Kriterien der Eignungsprüfung (ehemals Einsatzbereitschaftsüberprüfung EBÜ).
export const EXAM = {
  sources: ['agridea-ebue', 'tierwelt-2025', 'bauernzeitung-2025'],
  parts: [
    'Teil 1 (rund 24 Stunden): Der Hund ist mit seinen fünf Schafen einen Tag und eine Nacht allein auf unbekanntem Prüfungsgelände. Hund und Schafe tragen GPS-Halsbänder, so wird die Herdentreue ausgewertet. Danach nähert sich eine Prüfperson (Figurant) zuerst allein, dann mit einem Hund der Herde; die Reaktion wird gefilmt.',
    'Teil 2 (ohne Nutztiere): Halter und Hund begegnen an lockerer Leine erneut dem Figuranten und dessen Hund. Der Hund wird einem unerwarteten Geräusch (zum Beispiel platzender Ballon) und einem optischen Reiz (plötzlich aufgespannter Schirm) ausgesetzt und muss die Stelle danach nochmals passieren. Zum Schluss läuft er frei und wird vom Halter zurückgerufen.',
  ],
  criteria: [
    { name: 'Herdentreue', text: 'Der Hund verlässt seine Herde nicht zu weit und nicht zu lange. Kurze Ausflüge auf Aussichtspunkte sind erlaubt.' },
    { name: 'Grundführigkeit', text: 'Der Hund lässt sich an lockerer Leine führen und kommt auf Ruf zurück.' },
    { name: 'Verhalten gegenüber Fremden', text: 'Kein Schnappen und kein Anrempeln gegenüber der Prüfperson oder deren Hund ausserhalb der Herde.' },
    { name: 'Keine übermässige Ängstlichkeit', text: 'Der Hund flieht nicht und zeigt keine Panik.' },
    { name: 'Stresstoleranz', text: 'Ein Schreck durch Geräusch oder optischen Reiz legt sich rasch, der Hund geht danach normal weiter.' },
    { name: 'Unterscheidung Hund und Mensch', text: 'An der Herde Abwehr gegenüber dem fremden Hund, ausserhalb der Herde Toleranz gegenüber Hund und Mensch.' },
  ],
};

// Diese Übungen sind ein Vorschlag von Schnuffel, abgeleitet aus den Prüfungskriterien und den Sozialisierungsgrundsätzen.
// Sie stammen nicht aus einer Quelle und ersetzen weder den Sachkundekurs noch die Beratung.
export const EXERCISES = [
  {
    name: 'Hofalltag kennenlernen',
    phase: 'welpe',
    criterion: 'Stresstoleranz',
    why: 'Der Welpe erlebt Menschen, Fahrzeuge, Maschinen, Besuch und Tierarzt ruhig an der Seite des Fürsorgegaranten.',
  },
  {
    name: 'Anfassen und Halsband',
    phase: 'welpe',
    criterion: 'Grundführigkeit',
    why: 'Der Hund lässt sich am ganzen Körper berühren, Halsband an- und ablegen. An der Prüfung trägt er ein Halsband.',
  },
  {
    name: 'Herrufen bei der Herde',
    phase: 'welpe',
    criterion: 'Grundführigkeit',
    why: 'Der Hund kommt aus der Herde zum Fürsorgegaranten, am besten verbunden mit dem persönlichen Füttern.',
  },
  {
    name: 'An lockerer Leine gehen',
    phase: 'welpe',
    criterion: 'Grundführigkeit',
    why: 'Mehrmals hin und her gehen, ohne Zug an der Leine. So läuft Teil 2 der Prüfung.',
  },
  {
    name: 'Zweiter Hund im Rudel',
    phase: 'welpe',
    criterion: 'Unterscheidung Hund und Mensch',
    why: 'Ruhiges Zusammenleben mit dem zweiten Herdenschutzhund, gemeinsames Fressen und Ruhen bei der Herde.',
  },
  {
    name: 'Bei der Herde bleiben',
    phase: 'junghund',
    criterion: 'Herdentreue',
    why: 'Der Fürsorgegarant entfernt sich, der Hund bleibt bei den Tieren. Beobachten, wie weit und wie lange er sich entfernt.',
  },
  {
    name: 'Fremde Person bei der Herde',
    phase: 'junghund',
    criterion: 'Verhalten gegenüber Fremden',
    why: 'Eine dem Hund unbekannte Person geht im Bogen um die Herde. Der Hund darf melden, soll aber zur Herde zurückkehren und nicht schnappen oder anrempeln.',
  },
  {
    name: 'Fremder Hund ausserhalb der Herde',
    phase: 'junghund',
    criterion: 'Unterscheidung Hund und Mensch',
    why: 'Begegnung an lockerer Leine abseits der Herde, der Hund bleibt tolerant.',
  },
  {
    name: 'Schreckreiz aushalten',
    phase: 'junghund',
    criterion: 'Stresstoleranz',
    why: 'Unerwartetes Geräusch oder plötzlich aufgespannter Schirm an lockerer Leine. Danach dieselbe Stelle nochmals ruhig passieren.',
  },
  {
    name: 'Freilauf und Rückruf',
    phase: 'junghund',
    criterion: 'Grundführigkeit',
    why: 'Abseits der Herde frei laufen lassen und zurückrufen, wie am Schluss der Prüfung.',
  },
];

export const GAPS = [
  'Das verbindliche Ausbildungskonzept (Regelwerk HSH-CH, Stand November 2025) ist nur für Mitglieder des Vereins zugänglich. Die Phasen hier stammen aus öffentlichen Unterlagen von AGRIDEA, den Kantonen und Fachmedien. Amtlich vorgegebene Übungen gibt es nach unserer Recherche nicht; die Übungen oben sind Vorschläge von Schnuffel.',
  'Welche Rassen zur Förderung zugelassen sind, entscheiden seit 2025 die Kantone. Für den eigenen Kanton bei der Herdenschutzberatung nachfragen.',
  'Die Regeln unterscheiden sich je nach Kanton. In den Kantonen UR, LU, SZ, ZG, AG und NW dürfen Ersthalterinnen und Ersthalter nur Hunde mit bestandener Eignungsprüfung anschaffen (Merkblatt Liebegg, April 2026). Andere Kantone wurden nicht geprüft.',
  'Ob ein Jagdhund zur Eignungsprüfung zugelassen würde, ist nirgends belegt. Herdenschutzhunde arbeiten selbstständig ohne Kommandos, und das Verfolgen von Wild gilt bei ihnen als nicht tolerierbar. Das spricht gegen eine Ausbildung eines Jagdhundes zum Herdenschutzhund.',
];

export const CONTACT_URL = 'https://www.herdenschutzschweiz.ch/';
