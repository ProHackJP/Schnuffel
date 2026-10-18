// Trainingsplan «Jagdhund im Kanton Bern». Jede Aussage unter «facts» stützt sich auf die unten genannten Quellen
// (geprüft am 18.10.2026). Übungen mit `sources` sind Prüfungsteile aus einer Quelle, Übungen mit `own: true` sind
// Vorschläge von Schnuffel. Wie die Übungen aufgebaut werden, steht in keiner dieser Quellen und wird nicht erfunden.

export const SOURCES = [
  {
    id: 'jadv-be',
    short: 'JaDV BE',
    title: 'Direktionsverordnung über die Jagd (JaDV), BSG 922.111.1, vom 27. März 2003, Stand 1. März 2023',
    publisher: 'Kanton Bern, Systematische Gesetzessammlung (BSG)',
    url: 'https://be.lexwork.naz.ch/de/dta/922.111.1.pdf',
    retrieved: '2026-10-18',
  },
  {
    id: 'jav-be',
    short: 'JaV BE',
    title: 'Jagdverordnung (JaV), BSG 922.111, vom 26. Februar 2003, Stand 1. März 2023',
    publisher: 'Kanton Bern, Systematische Gesetzessammlung (BSG)',
    url: 'https://be.lexwork.naz.ch/de/dta/922.111.pdf',
    retrieved: '2026-10-18',
  },
  {
    id: 'bejv-jagdhunde',
    short: 'BEJV',
    title: 'Jagdhunde (Seite der Jagdhundekommission)',
    publisher: 'Berner Jägerverband (BEJV)',
    url: 'https://bernerjagd.net/jagdhunde/',
    retrieved: '2026-10-18',
  },
  {
    id: 'vhjv-gehorsam',
    short: 'VHJV',
    title: 'Gehorsamskurs',
    publisher: 'Vorstehhundjägerverein des Kantons Bern (VHJV)',
    url: 'https://www.vhjv.ch/hunde/gehorsamskurs2',
    retrieved: '2026-10-18',
  },
  {
    id: 'jv-guerbetal',
    short: 'Jagdverein Gürbetal',
    title: 'Jagdhunde',
    publisher: 'Jagdverein Gürbetal',
    url: 'https://jv-guerbetal.ch/jagdhunde',
    retrieved: '2026-10-18',
  },
  {
    id: 'agj-schweiss',
    short: 'AGJ/TKJ-Reglement',
    title: 'Reglement für Schweissprüfungen (Aarau, 22. November 2022, in Kraft ab 1. Januar 2025)',
    publisher: 'Arbeitsgemeinschaft für das Jagdhundewesen (AGJ), Technische Kommission (TKJ)',
    url: 'https://www.fvsc.ch/media/document/0/2025_01_01_reglement-schweissprfungen-nach-tkj_swpo_neu-mit-vorsuche_2025_de_fr_it-1.pdf',
    retrieved: '2026-10-18',
  },
];

const OBMANN = 'Bei Fragen hilft der BEJV: info@bernerjagd.ch oder die Hundeobleute.';

export const PLAN = {
  id: 'jagdhund-bern',
  title: 'Jagdhund im Kanton Bern',
  summary:
    'Von den Rahmenbedingungen über die Gehorsamsprüfung bis zu Schweiss- und Apportierprüfungen: die Schritte und Nachweise, die im Kanton Bern für die Jagd mit Hund gelten. Die Schritte sind nach ihren Voraussetzungen geordnet.',
  scope:
    'Gilt für den Kanton Bern. In anderen Kantonen sind die Jagdhunde-Vorschriften anders geregelt; sie sind hier nicht geprüft.',
  notice:
    'Dieser Plan nennt die Anforderungen aus öffentlichen Quellen. Er ersetzt weder Kurse noch die Beratung durch die Hundeobleute des BEJV. Massgebend ist die aktuelle Fassung der Gesetze in der Berner Gesetzessammlung (BELEX).',
  sources: SOURCES,
  steps: [
    {
      id: 'rahmen',
      title: 'Rahmen kennen: Rassen, Hundezahl, Anlernen',
      timing: 'vor dem Training',
      facts: [
        'Als Jagdhunde zugelassen sind Rassen aus den FCI-Gruppen 3 (Terrier), 4 (Dachshunde), 6 (Lauf- und Schweisshunde), 7 (Vorstehhunde) und 8 (Apportier-, Stöber- und Wasserhunde). Rehhetzer, stumm jagende Hunde für Schalen- und Haarraubwild und Mischlinge aus jagdlich ungeeigneten Kreuzungen sind ausgeschlossen (JaDV Art. 6).',
        'Pro Jägerin oder Jäger dürfen höchstens zwei geeignete Hunde gleichzeitig eingesetzt werden (JaDV Art. 7 Abs. 1).',
        'Junge Hunde dürfen nur einzeln, an Werktagen im September und mit Bewilligung der örtlich zuständigen Wildhut angelernt werden (JaDV Art. 9).',
        'Die Wildhut kann einen Jagdhund für bestimmte Jagdarten als ungeeignet absprechen. Gegen den schriftlichen Entscheid ist Beschwerde möglich (JaV Art. 17).',
      ],
      sources: ['jadv-be', 'jav-be'],
      exercises: [],
      doneWhen: {
        text: 'Du hast die Regeln gelesen und weisst, wann du für das Anlernen eine Bewilligung der Wildhut brauchst.',
        own: true,
      },
    },
    {
      id: 'grundgehorsam',
      title: 'Grundgehorsam aufbauen',
      timing: 'ab dem Welpenalter',
      facts: [
        'Die Ausbildung beginnt bereits im Welpenalter. Im Optimalfall wird der Hund lebenslang weitertrainiert.',
        'Geprüft werden in der Gehorsamsprüfung des BEJV Leinenführigkeit, Ablegen, Schussruhe und Appell.',
        'Der Gehorsamskurs des Vorstehhundjägervereins (VHJV) bereitet ausschliesslich auf diese Prüfung vor. 2026 lief er von Mitte Februar bis Mitte Juni, montags abends. Teilnehmen können Jagdberechtigte und Jungjäger, auch ohne Mitgliedschaft.',
      ],
      sources: ['jv-guerbetal', 'vhjv-gehorsam'],
      exercises: [
        { name: 'Leinenführigkeit', why: 'Prüfungsteil der Gehorsamsprüfung.', sources: ['jv-guerbetal'] },
        { name: 'Ablegen', why: 'Prüfungsteil der Gehorsamsprüfung.', sources: ['jv-guerbetal'] },
        { name: 'Schussruhe', why: 'Prüfungsteil der Gehorsamsprüfung.', sources: ['jv-guerbetal'] },
        { name: 'Appell', why: 'Prüfungsteil der Gehorsamsprüfung.', sources: ['jv-guerbetal'] },
      ],
      caveat: `Wie die vier Teile aufgebaut werden und worauf bei der Prüfung genau geachtet wird, steht in den geprüften Quellen nicht. ${OBMANN}`,
      doneWhen: {
        text: 'Du bestätigst den Schritt selbst, wenn alle vier Teile auch mit Ablenkung zuverlässig klappen.',
        own: true,
      },
    },
    {
      id: 'gehorsamspruefung',
      title: 'Gehorsamsprüfung des BEJV ablegen',
      timing: 'Ausweis ab dem dritten Lebensjahr des Hundes',
      facts: [
        'Für jeden dreijährigen oder älteren Jagdhund muss ein Ausweis über die bestandene Gehorsamsprüfung des Berner Jägerverbands oder eine vom Jagdinspektorat anerkannte gleichwertige Bestätigung mitgeführt werden (JaDV Art. 7 Abs. 1 Bst. b).',
        'Die bestandene Prüfung ist Voraussetzung für die Berner Schweissprüfungen und für die Schleppen- und Apportierhundeprüfung.',
        'Beim VHJV bestätigt der Hundeobmann die Prüfungsreife beim BEJV. Dafür ist eine interne Testprüfung nötig. Hunde ohne Kursteilnahme können diese ebenfalls ablegen.',
        'Die Prüfungen finden regional statt. 2026 nahmen an den drei Gehorsamsprüfungen 79 Gespanne teil, vier bestanden nicht.',
      ],
      sources: ['jadv-be', 'vhjv-gehorsam', 'bejv-jagdhunde'],
      exercises: [],
      caveat: `Anmeldung und Termine laufen über den BEJV (bernerjagd.net). ${OBMANN}`,
      doneWhen: { text: 'Du hast den Ausweis über die bestandene Gehorsamsprüfung.', own: false, sources: ['jadv-be'] },
    },
    {
      id: 'schweiss-500',
      title: 'Schweissprüfung 500 m',
      timing: 'nach der Gehorsamsprüfung, Hund mindestens 15 Monate alt',
      facts: [
        'Auf beschossenes Schalenwild muss die Nachsuche mit einem auf Schweiss geprüften Hund durchgeführt werden. Bei klaren Fehlschüssen kann die Wildhut von dieser Pflicht entbinden (JaDV Art. 16 Abs. 3).',
        'Der Einsatz eines auf Schweiss geprüften Hundes ist während der ganzen Jagdzeit erlaubt (JaDV Art. 7 Abs. 4).',
        'Der BEJV führt kantonale Schweissprüfungen durch, 2026 in den Regionen Jura bernois/Seeland, Mittelland und Berner Oberland.',
        'Nach dem Reglement der AGJ/TKJ ist die 500-m-Fährte mindestens 500 m lang, hat zwei etwa rechtwinklige Haken und ein Wundbett, steht über Nacht (mindestens 12 Stunden) und wird in 60 Minuten gearbeitet. Der Hund ist mindestens 15 Monate alt.',
        'Bestanden ist die Prüfung nur, wenn der Führer nicht mehr als zweimal abgerufen werden muss oder er im Beisein der Richter das Stück findet. Ein Hund darf innerhalb von zwei Jahren höchstens dreimal auf derselben Fährtenlänge geführt werden.',
        'Der Ausweis gilt nach Auffassung der AGJ für das Gespann aus Führer und Hund.',
      ],
      sources: ['jadv-be', 'bejv-jagdhunde', 'agj-schweiss'],
      exercises: [
        {
          name: 'Schweissfährte arbeiten',
          why: 'Das Arbeiten einer Fährte ist der Kern der Prüfung. Aufbau und Hilfsmittel stehen nicht in den geprüften Quellen.',
          own: true,
        },
      ],
      caveat: `Ob die Schweissprüfungen des BEJV genau nach dem Reglement der AGJ/TKJ laufen, ist nicht geprüft: Die Prüfungsordnung des BEJV (Version 1.7.2018) war nicht lesbar abrufbar. ${OBMANN}`,
      doneWhen: { text: 'Die 500-m-Schweissprüfung ist bestanden.', own: false, sources: ['bejv-jagdhunde', 'agj-schweiss'] },
    },
    {
      id: 'schweiss-1000',
      title: 'Schweissprüfung 1000 m',
      timing: 'nach bestandener 500-m-Prüfung',
      facts: [
        'Weitere Stufen nach der 500-m-Fährte sind die 1000-m-Fährte und erschwerte Prüfungen wie die «Rote Fährte Sense» und der «Silberne Bruch».',
        'Nach dem Reglement der AGJ/TKJ ist die 1000-m-Fährte mindestens 1000 m lang, hat drei Haken und zwei Wundbetten, steht mindestens 18 Stunden und wird in 90 Minuten gearbeitet. Voraussetzung ist eine bestandene 500-m-Prüfung.',
      ],
      sources: ['jv-guerbetal', 'agj-schweiss'],
      exercises: [
        {
          name: 'Schweissfährte 1000 m',
          why: 'Längere, ältere Fährte mit mehr Haken und Wundbetten als die 500-m-Fährte.',
          own: true,
        },
      ],
      caveat: 'Dieselbe Einschränkung wie bei der 500-m-Prüfung: Ob der BEJV genau nach diesem Reglement prüft, ist nicht geprüft.',
      doneWhen: { text: 'Die 1000-m-Schweissprüfung ist bestanden.', own: false, sources: ['jv-guerbetal', 'agj-schweiss'] },
    },
    {
      id: 'schleppe-apport',
      title: 'Schleppen- und Apportierprüfung',
      timing: 'nach der Gehorsamsprüfung, unabhängig von der Schweissprüfung',
      facts: [
        'Die Prüfung bereitet auf die Nachsuche von krankem oder verendetem Nieder- und Wasserwild vor. Verwendet wird nur totes Wild.',
        'Geprüft werden das Ausarbeiten einer Haarwildschleppe mit Apportieren, das Apportieren von Wasservögeln aus tiefem Wasser und die Freiverlorensuche von Flugwild.',
        'Auf beschossene Wasservögel muss die Nachsuche mit einem geprüften Apporteur durchgeführt werden (JaDV Art. 16 Abs. 3a).',
        'Der BEJV nennt die Prüfung «Schleppen- und Wasser-Apportier-Prüfung». Für 2026 war ein ganztägiger Termin am 21. November angekündigt.',
      ],
      sources: ['jv-guerbetal', 'jadv-be', 'bejv-jagdhunde', 'vhjv-gehorsam'],
      exercises: [
        { name: 'Haarwildschleppe mit Apport', why: 'Prüfungsteil der Schleppen- und Apportierprüfung.', sources: ['jv-guerbetal'] },
        { name: 'Wasserapport aus tiefem Wasser', why: 'Prüfungsteil: Wasservögel aus tiefem Wasser apportieren.', sources: ['jv-guerbetal'] },
        { name: 'Freiverlorensuche', why: 'Prüfungsteil: Flugwild ohne Sichtzeichen suchen.', sources: ['jv-guerbetal'] },
      ],
      caveat: `Welche Prüfung die Verordnung mit «geprüfter Apporteur» meint, ist nicht geprüft. ${OBMANN}`,
      doneWhen: { text: 'Die Schleppen- und Apportierprüfung ist bestanden.', own: false, sources: ['jv-guerbetal', 'bejv-jagdhunde'] },
    },
    {
      id: 'nachsuche',
      title: 'Nachsuche im Einsatz',
      timing: 'fortlaufend',
      facts: [
        'Die Nachsuche angeschossenen Wildes ist die oberste Pflicht der Jägerin und des Jägers: Sie verkürzt das Leiden des Tieres.',
        'Wer die zeit- und fachgerechte Nachsuche unterlässt, verstösst gegen die Weidgerechtigkeit (JaV Art. 12 Abs. 1 Bst. b). Für die Nachsuche gelten keine zeitlichen und örtlichen Beschränkungen (JaV Art. 16 Abs. 1).',
        'Die Jagdhundekommission des BEJV ist für die Nachsuche-Organisation (NASU) im Kanton verantwortlich.',
      ],
      sources: ['jv-guerbetal', 'jav-be', 'bejv-jagdhunde'],
      exercises: [],
      caveat: `Richtlinie und Ausbildungskonzept der NASU sind auf bernerjagd.net abrufbar und wurden nicht gelesen. ${OBMANN}`,
      doneWhen: {
        text: 'Du bestätigst den Schritt selbst, zum Beispiel wenn du dich bei der NASU informiert und entschieden hast, ob ihr als Gespann mitmacht.',
        own: true,
      },
    },
  ],
  gaps: [
    'Die Prüfungsordnung des BEJV für Jagdhundeprüfungen (Version 1.7.2018) war nicht lesbar abrufbar. Die Prüfungsteile der Gehorsamsprüfung stammen vom Jagdverein Gürbetal. Genaue Anforderungen, Punkte und die Bestehensgrenze sind nicht belegt.',
    'Ein Mindestalter für die Gehorsamsprüfung selbst ist nicht belegt. Belegt ist nur, dass für Hunde ab drei Jahren der Ausweis mitgeführt werden muss.',
    'Die Anforderungen an die Schweissprüfungen stammen aus dem Reglement der AGJ/TKJ. Ob die Berner Prüfungen genau danach laufen, ist nicht geprüft.',
    'Nicht gelesen wurden die ergänzenden Richtlinien des Jagdinspektorats (JaDV Art. 6 Abs. 3), die NASU-Richtlinie und das NASU-Ausbildungskonzept.',
    'Wie die Übungen aufgebaut und trainiert werden, steht in keiner der geprüften Quellen. Dafür gibt es Kurse und die Hundeobleute.',
    'Die Gesetzestexte wurden im Stand vom 1. März 2023 gelesen. Spätere Änderungen sind nicht geprüft; massgebend ist die aktuelle Fassung in der Berner Gesetzessammlung (BELEX).',
    'Andere Kantone wurden nicht geprüft. Die Vorschriften für Jagdhunde sind kantonal geregelt und unterscheiden sich.',
  ],
};
