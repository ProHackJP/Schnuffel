// Inhalte zum Thema Herdenschutz. Jede Aussage stützt sich auf die unten genannten Quellen (geprüft am 16.10.2026).
// Was nicht belegt werden konnte, ist ausdrücklich als Vorschlag oder Lücke gekennzeichnet.

export const SOURCES = [
  {
    id: 'agridea-web',
    title: 'Verhaltensempfehlungen bei Herdenschutzhunden',
    publisher: 'Herdenschutz Schweiz (Fachstelle von AGRIDEA)',
    url: 'https://www.protectiondestroupeaux.ch/tourismus-und-herdenschutzhunde/verhaltensempfehlungen/',
    retrieved: '2026-10-16',
  },
  {
    id: 'agridea-flyer',
    title: 'Arbeitende Herdenschutzhunde (Flyer, AGRIDEA 2021)',
    publisher: 'Schweizer Wanderwege mit AGRIDEA',
    url: 'https://www.schweizer-wanderwege.ch/de/media/download/8a63df35142e90d1ffbac9ed6e29bec1f6399b63',
    retrieved: '2026-10-16',
  },
  {
    id: 'bafu',
    title: 'Herdenschutz',
    publisher: 'Bundesamt für Umwelt BAFU (Stand 23.02.2026)',
    url: 'https://www.bafu.admin.ch/de/herdenschutz',
    retrieved: '2026-10-16',
  },
];

export const SECTIONS = [
  {
    title: 'Worum es geht',
    sources: ['bafu', 'agridea-web'],
    items: [
      'Herdenschutzhunde bewachen Schafe und Ziegen selbstständig gegen Wölfe und andere Grossraubtiere. Sie arbeiten Tag und Nacht und werden nicht direkt geführt.',
      'Der Bund legt die Grundsätze fest, die Kantone beraten und unterstützen, die Tierhaltenden setzen den Herdenschutz eigenverantwortlich um. Rechtliche Grundlage ist das Jagdgesetz mit der Jagdverordnung (seit 1. Februar 2025 in Kraft).',
      'Gegenüber Menschen sind die Hunde normalerweise ungefährlich. Wer ihre Warnsignale ignoriert, kann aber gebissen werden.',
    ],
  },
  {
    title: 'Vor dem Aufbruch',
    sources: ['agridea-web', 'agridea-flyer'],
    items: [
      'Einsatzgebiete der Herdenschutzhunde vorher auf der Karte von Herdenschutz Schweiz prüfen und die Informationstafeln vor Ort beachten.',
      'In Gebieten mit arbeitenden Herdenschutzhunden den eigenen Hund möglichst nicht mitnehmen. Fremde Hunde lösen bei Herdenschutzhunden starkes Abwehrverhalten aus.',
    ],
  },
  {
    title: 'Mit dem Hund bei einer geschützten Herde',
    sources: ['agridea-web', 'agridea-flyer'],
    items: [
      'Trifft man unverhofft auf eine geschützte Herde: Hund sofort an die Leine nehmen.',
      'Die Herde weiträumig umgehen. Nie mit dem eigenen Hund durch die Herde gehen.',
      'Im Zweifel umkehren.',
    ],
  },
  {
    title: 'Wenn die Herdenschutzhunde kommen',
    sources: ['agridea-web', 'agridea-flyer'],
    items: [
      'Ruhig bleiben, langsam gehen, Abstand zur Herde halten. Schafe, Ziegen und Hunde nicht erschrecken.',
      'Sind keine Hunde zu sehen: auf sich aufmerksam machen, zum Beispiel durch lautes Reden.',
      'Bellen die Hunde oder kommen sie auf einen zu: stehen bleiben und ihnen Zeit geben, die Lage einzuschätzen. Nicht anschreien, das provoziert.',
      'Direkten Augenkontakt vermeiden, aber dem Hund zugewandt bleiben.',
      'Erst weitergehen, wenn die Hunde aufgehört haben zu bellen.',
      'Beruhigen sie sich nicht: Abstand vergrössern und sich langsam, notfalls rückwärts, zurückziehen. Einen Stock schräg nach unten zum Hund halten, nie drohend erheben.',
      'Mit dem Velo: absteigen und schieben.',
    ],
  },
];

// Diese Übungen sind ein Vorschlag von Schnuffel, abgeleitet aus den Verhaltensregeln. Sie stammen nicht aus einer Quelle.
export const EXERCISE_SUGGESTIONS = [
  { name: 'Anleinen auf Signal', why: 'Damit der Hund bei einer unverhofften Begegnung sofort an der Leine ist.' },
  { name: 'Ruhig an Weidetieren vorbei', why: 'Schafe, Ziegen und Rinder gelassen ignorieren, an der Leine und mit Abstand.' },
  { name: 'Abruf bei Ablenkung', why: 'Der Hund kommt zuverlässig zurück, auch wenn eine Herde oder fremde Hunde in der Nähe sind.' },
  { name: 'Bei Fuss im Rückzug', why: 'Langsames, kontrolliertes Zurückgehen mit dem Hund an der Seite, ohne Zug an der Leine.' },
];

export const GAPS = [
  'Für Jägerinnen und Jäger mit Jagdhund gibt es nach unserer Recherche keine eigenen offiziellen Verhaltensregeln. Die oben genannten Regeln gelten allgemein für Personen mit Hund.',
  'Ob und wie Herdenschutzhunde das Jagen mit Hund in Einsatzgebieten einschränken, regeln die Kantone. Dazu konnte keine gesamtschweizerische Aussage belegt werden. Im Zweifel bei der kantonalen Jagdverwaltung nachfragen.',
];

export const MAP_URL = 'https://www.protectiondestroupeaux.ch/';
