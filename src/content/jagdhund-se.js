// Trainingsplan «Jagdhund in Schweden». Jede Aussage unter «facts» stützt sich auf die unten genannten Quellen
// (geprüft am 20.10.2026). Alle Übungen sind Vorschläge von Schnuffel (`own: true`): Sie sind aus den Rechtsregeln und
// Hinweisen der Quellen abgeleitet. Wie die Übungen aufgebaut werden, steht in keiner dieser Quellen und wird nicht erfunden.

export const SOURCES = [
  {
    id: 'jv-resa',
    short: 'Jordbruksverket',
    title: 'Reseguide för hundar och katter till Sverige',
    publisher: 'Jordbruksverket (schwedische Landwirtschaftsbehörde)',
    url: 'https://jordbruksverket.se/djur/hundar-katter-och-smadjur/reseguide-for-hundar-och-katter',
    retrieved: '2026-10-20',
  },
  {
    id: 'jv-ta-in',
    short: 'Jordbruksverket',
    title: 'Ta in hundar till Sverige',
    publisher: 'Jordbruksverket (schwedische Landwirtschaftsbehörde)',
    url: 'https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar/resor-och-handel-med-hundar-mellan-lander/ta-in-hundar-till-sverige',
    retrieved: '2026-10-20',
  },
  {
    id: 'norden',
    short: 'Info Norden',
    title: 'Resa med hund eller katt till Sverige',
    publisher: 'Info Norden (Nordischer Ministerrat)',
    url: 'https://www.norden.org/sv/info-norden/resa-med-hund-eller-katt-till-sverige',
    retrieved: '2026-10-20',
  },
  {
    id: 'lag-hundar',
    short: 'Hundeaufsichtsgesetz',
    title: 'Lag (2007:1150) om tillsyn över hundar och katter, Stand bis SFS 2026:296 (Text auf lagen.nu)',
    publisher: 'Schwedischer Reichstag, Gesetzestext auf lagen.nu (nicht die amtliche Seite)',
    url: 'https://lagen.nu/2007:1150',
    retrieved: '2026-10-20',
  },
  {
    id: 'jaktforordning',
    short: 'Jaktförordning',
    title: 'Jaktförordning (1987:905), Stand bis SFS 2026:1693 (Text auf lagen.nu)',
    publisher: 'Schwedische Regierung, Gesetzestext auf lagen.nu (nicht die amtliche Seite)',
    url: 'https://lagen.nu/1987:905',
    retrieved: '2026-10-20',
  },
  {
    id: 'lst-ostergotland',
    short: 'Länsstyrelsen Östergötland',
    title: 'Genehmigung für Training und Prüfungen mit Jagdhunden in der Sperrzeit, Landkreis Östergötland (gültig ab 13. März 2026)',
    publisher: 'Länsstyrelsen Östergötland, veröffentlicht vom Svenska Kennelklubben (SKK)',
    url: 'https://www.skk.se/contentassets/adc7ce983b1a4502841e44654426a839/dispens-lst/ostergotland-2026.pdf',
    retrieved: '2026-10-20',
  },
  {
    id: 'lst-gavleborg',
    short: 'Länsstyrelsen Gävleborg',
    title: 'Beschluss vom 16. März 2026 (Aktenzeichen 368-2026) zu Training und Prüfungen mit Jagdhunden in der Sperrzeit, Landkreis Gävleborg',
    publisher: 'Länsstyrelsen Gävleborg, veröffentlicht vom Svenska Kennelklubben (SKK)',
    url: 'https://www.skk.se/contentassets/adc7ce983b1a4502841e44654426a839/dispens-lst/gavleborg-2026.pdf',
    retrieved: '2026-10-20',
  },
  {
    id: 'nv-permit',
    short: 'Naturvårdsverket',
    title: 'Hunting Permit',
    publisher: 'Naturvårdsverket (schwedische Umweltbehörde)',
    url: 'https://www.naturvardsverket.se/en/topics/hunting/hunting-permit',
    retrieved: '2026-10-20',
  },
  {
    id: 'sjf-eftersok',
    short: 'Jägareförbundet',
    title: 'Hunting in Sweden: Search for shot game',
    publisher: 'Svenska Jägareförbundet (schwedischer Jagdverband), Seite von 2020',
    url: 'https://jagareforbundet.se/jakt/hunting-in-sweden/search-for-shot-game/',
    retrieved: '2026-10-20',
  },
  {
    id: 'vsc-varg',
    short: 'Viltskadecenter',
    title: 'Faktablad «Söker vargar upp drivande hundar» (Viltskadecenter mit WWF und Svenska Jägareförbundet)',
    publisher: 'Viltskadecenter, Schwedische Landwirtschaftsuniversität (SLU)',
    url: 'https://www.slu.se/globalassets/ew/org/centrb/vsc/vsc-dokument/vsc-publikationer/faktablad/soker-vargar-upp-drivande-hundar-vsc-faktablad-2005.pdf',
    retrieved: '2026-10-20',
  },
  {
    id: 'vsc-2014',
    short: 'Viltskadecenter',
    title: 'Ny typ av skyddsväst mot varg utprovad (Vilt&Tamt, Nyhetsbrev 1/2014)',
    publisher: 'Viltskadecenter, Schwedische Landwirtschaftsuniversität (SLU)',
    url: 'https://www.slu.se/globalassets/ew/org/centrb/vsc/vsc-dokument/vsc-publikationer/nyhetsbrev/vsc-nyhetsbrev-vilt-o-tamt-1-2014-webb.pdf',
    retrieved: '2026-10-20',
  },
  {
    id: 'hss-fastingar',
    short: 'HSS 3/2023',
    title: 'Artikel om fästingar von Åsa Eckerrot (HSS Nr. 3, 2023, nach Angaben der SVA)',
    publisher: 'Svenska Kennelklubben (SKK), Artikel als PDF auf skk.se',
    url: 'https://www.skk.se/contentassets/574d79bd0fee4976b0e8c3414071387d/artikel-om-fastingar.pdf',
    retrieved: '2026-10-20',
  },
  {
    id: 'sva-tbe',
    short: 'SVA',
    title: 'TBE-virusinfektion (Fästingburen encefalit), aus «Smittläget i Sverige för djursjukdomar och zoonoser» 2023',
    publisher: 'Statens veterinärmedicinska anstalt (SVA, schwedisches Veterinärinstitut)',
    url: 'https://sva.se/media/wlghzh1z/tbe-virusinfektion-fastingburen-encefalit.pdf',
    retrieved: '2026-10-20',
  },
  {
    id: 'agria-orm',
    short: 'Agria',
    title: 'Huggormsbett – dubbelt så vanligt hos katter som hos hundar (Pressemitteilung vom 8. Juli 2026)',
    publisher: 'Agria (Tierversicherer)',
    url: 'https://via.tt.se/pressmeddelande/4429934/huggormsbett-dubbelt-sa-vanligt-hos-katter-som-hos-hundar?lang=sv',
    retrieved: '2026-10-20',
  },
];

const NO_METHOD = 'Wie diese Übungen aufgebaut werden, steht in keiner geprüften Quelle.';

export const PLAN = {
  id: 'jagdhund-schweden',
  title: 'Jagdhund in Schweden',
  summary:
    'Was dein Hund und du für Schweden brauchen: Einreise, Aufsicht und Leine, Jagdhund-Training und Jagdzeiten, Nachsuche, Wolf und Zecken. Mit Übungen fürs Tagebuch, die aus den geltenden Regeln abgeleitet sind.',
  scope:
    'Gilt für Schweden. Neben den Gesetzen des Staates erlassen die Länsstyrelsen (Landkreise) eigene Beschlüsse, die sich von Landkreis zu Landkreis unterscheiden können. Geprüft sind nur die unten genannten Quellen.',
  notice:
    'Dieser Plan fasst öffentliche Quellen zusammen. Er ersetzt weder die Auskunft der schwedischen Behörden noch den Tierarzt. Massgebend ist die aktuelle Fassung der Gesetze und der Beschluss des Landkreises, in dem du bist. Die Übungen sind Vorschläge von Schnuffel, keine amtlichen Vorgaben.',
  sources: SOURCES,
  steps: [
    {
      id: 'einreise',
      title: 'Einreise mit dem Hund vorbereiten',
      timing: 'vor der Abreise, Tollwutimpfung mindestens 21 Tage vorher',
      facts: [
        'Für das Jordbruksverket gehört die Schweiz zur selben Ländergruppe wie die EU-Staaten. Welche Regeln im Einzelnen gelten, hängt vom Herkunftsland ab.',
        'Der Hund muss mit einem Mikrochip gekennzeichnet sein (Info Norden nennt auch eine gut lesbare Tätowierung). Für Reisen aus EU-Ländern schreibt das Jordbruksverket: Die Kennzeichnung muss immer vor der Tollwutimpfung erfolgen.',
        'Die Grundimpfung gegen Tollwut ist ab 12 Wochen möglich. Danach muss man 21 Tage warten, bevor man mit dem Hund reist. Ein Titertest ist für die Einreise aus einem EU-Land nicht nötig.',
        'Schweden akzeptiert Heimtierausweise bestimmter Länder ausserhalb der EU, darunter der Schweiz. Bei Reisen aus der Schweiz verlangt das Jordbruksverket zusätzlich eine Erklärung des Tierhalters (Formular E9.204a).',
        'Die Einreise wird beim schwedischen Zoll (Tullverket) angemeldet. Wer sie vorher auf der Website des Zolls anmeldet, kann die grüne Spur wählen.',
        'Eine Entwurmung ist für die Einreise nicht vorgeschrieben. Das Jordbruksverket empfiehlt sie trotzdem, bevor man einen Hund nach Schweden bringt.',
      ],
      sources: ['jv-resa', 'jv-ta-in', 'norden'],
      exercises: [],
      caveat:
        'Das Jordbruksverket nennt für den Reiseleitfaden den 19. Oktober 2026 als letzte Aktualisierung. Prüfe die Regeln kurz vor der Reise noch einmal, ebenso die Bedingungen deiner Fluggesellschaft, falls du fliegst.',
      doneWhen: {
        text: 'Du bestätigst den Schritt selbst, wenn Chip, Tollwutimpfung samt Wartezeit, Heimtierausweis, Formular und Zollanmeldung geklärt sind.',
        own: true,
      },
    },
    {
      id: 'aufsicht',
      title: 'Hund unter Aufsicht halten: Sperrzeit und Leine',
      timing: 'das ganze Jahr, am strengsten vom 1. März bis 20. August',
      facts: [
        'Vom 1. März bis 20. August müssen Hunde so beaufsichtigt werden, dass sie nicht frei in Gebieten laufen, in denen es Wild gibt (Hundeaufsichtsgesetz 16 §, 1. Absatz). Die Länsstyrelsen nennen diese Zeit «hundförbudstid».',
        'In der übrigen Zeit muss der Hund daran gehindert werden, Wild zu treiben oder zu verfolgen, solange er nicht bei der Jagd eingesetzt wird (16 §, 1. Absatz).',
        'Zum Schutz des Wildes kann eine Leinenpflicht angeordnet werden (16 §, 2. Absatz). Die Länsstyrelsen können nach der Jagdverordnung auch ausserhalb der Zeit vom 1. März bis 20. August anordnen, dass Hunde beaufsichtigt und angeleint werden müssen (19 §).',
        'Ein Hund, der bei der Jagd oder beim Jagdtraining auf unpassende Weise jagt, muss sofort angeleint werden (Jaktförordning 18 §).',
        'Läuft ein Hund frei in einem Gebiet mit Wild, kann der Jagdberechtigte oder jemand in dessen Namen den Hund in Obhut nehmen (Hundeaufsichtsgesetz 17 §).',
      ],
      sources: ['lag-hundar', 'jaktforordning'],
      exercises: [
        {
          name: 'Leinenführigkeit im Wildgebiet',
          why: 'Vom 1. März bis 20. August darf der Hund nicht frei in Wildgebieten laufen. Die Leine ist dann der Normalfall.',
          own: true,
        },
        {
          name: 'Abruf bei Wildkontakt',
          why: 'Ausserhalb der Sperrzeit muss der Hund daran gehindert werden, Wild zu treiben oder zu verfolgen, wenn er nicht bei der Jagd ist.',
          own: true,
        },
        {
          name: 'Anleinen auf Kommando',
          why: 'Ein Hund, der unpassend jagt, muss sofort angeleint werden.',
          own: true,
        },
      ],
      caveat: `${NO_METHOD} Wie die Leinenpflicht in Nationalparks, Naturreservaten und einzelnen Gemeinden geregelt ist, steht auf den Schildern vor Ort und bei den Länsstyrelsen. Das habe ich nicht geprüft.`,
      doneWhen: {
        text: 'Du bestätigst den Schritt selbst, wenn dein Hund an der Leine zuverlässig läuft und sich bei Wildkontakt abrufen und sofort anleinen lässt.',
        own: true,
      },
    },
    {
      id: 'training-zeiten',
      title: 'Jagdhund-Arbeit und Training: wann welcher Hund laufen darf',
      timing: 'nach Wildart und Hundetyp, in der Sperrzeit nur mit Erlaubnis',
      facts: [
        'Geeignete Jagdhunde dürfen vom Jagdberechtigten oder mit dessen Erlaubnis bei erlaubter Jagd und beim Jagdtraining eingesetzt werden. Die Zeiten hängen von der Wildart und der Arbeitsweise des Hundes ab (Jaktförordning 16 §).',
        'Hunde, die Wild verfolgen (zum Beispiel Elchhunde und Stöberhunde): Elch vom 21. August bis 31. Januar, Hirsch und Reh vom 1. Oktober bis 31. Januar, Wildschwein vom 1. August bis 31. Januar, Rotfuchs vom 21. August bis Ende Februar.',
        'Hunde, die Wild suchen, ohne es zu verfolgen (zum Beispiel Vorstehhunde): Vögel vom 16. August bis 15. April, in Värmland, Dalarna, Gävleborg, Västernorrland, Jämtland, Västerbotten und Norrbotten bis 30. April. Hase, Wildkaninchen und Rotfuchs vom 21. August bis Ende Februar.',
        'Jagdtraining und Prüfungen sind das ganze Jahr erlaubt, wenn sie in eigens dafür hergerichteten Kunstbauen (Gryt) stattfinden (Jaktförordning 16 a §).',
        'Training mit freilaufenden Hunden in der Sperrzeit vom 1. März bis 20. August braucht eine Genehmigung der Länsstyrelsen. Der schwedische Kennel Club SKK hat solche Genehmigungen, zum Beispiel für Östergötland (13. März 2026 bis 20. August 2031) und Gävleborg (bis 20. August 2030).',
        'Die Genehmigungen gelten nur für Veranstaltungen des SKK, nicht für einzelne Hundehalter. Vorher müssen Grundeigentümer und Jagdberechtigter zugestimmt haben und die Polizei muss informiert sein. Schutzgebiete sind ausgenommen.',
        'Was erlaubt ist, entscheidet jeder Landkreis selbst. In Gävleborg sind es Lure Coursing für Windhunde, Apportierhunde (1. März bis 20. August) und Hunde an der Schleppleine auf Wildteil oder Attrappe (1. März bis 15. Mai und 1. bis 20. August). Das Verfolgen von Wild und das Stellen von Hunden wurden nicht bewilligt.',
      ],
      sources: ['jaktforordning', 'lst-ostergotland', 'lst-gavleborg'],
      exercises: [
        {
          name: 'Dummy-Apport an der Schleppleine',
          why: 'In der Sperrzeit darf der Hund nicht frei in Wildgebieten laufen. Apportieren an der langen Leine hält diese Regel ein.',
          own: true,
        },
      ],
      caveat: `${NO_METHOD} Die Zeiten habe ich in der Jaktförordning gelesen. Lies sie vor dem Einsatz im Wortlaut nach. Ob und wie ein Gast aus dem Ausland an Veranstaltungen des SKK teilnehmen kann, ist nicht geprüft.`,
      doneWhen: {
        text: 'Du bestätigst den Schritt selbst, wenn du weisst, wann dein Hundetyp wo laufen darf und wie du in der Sperrzeit trainierst, ohne die Regeln zu verletzen.',
        own: true,
      },
    },
    {
      id: 'jagd-gast',
      title: 'Jagen als Gast in Schweden (falls geplant)',
      timing: 'vor der Reise klären, das Jagdjahr läuft vom 1. Juli bis 30. Juni',
      facts: [
        'Wer in Schweden jagt, zahlt eine Jahresgebühr und muss den Nachweis beim Jagen mitführen. Die nationale Gebühr beträgt laut Naturvårdsverket derzeit 400 SEK pro Jagdjahr (1. Juli bis 30. Juni), dazu können örtliche Gebühren kommen. Bezahlt wird mit Karte über das Jägerregister.',
        'Jäger aus dem Ausland brauchen zusätzlich besondere Genehmigungen, um Jagdwaffen nach Schweden mitzubringen. Auskunft geben Polizei und Zoll.',
        'Für die Jagd auf Staatsland im Norden, zum Beispiel auf Waldvögel, braucht es eine zusätzliche Tageserlaubnis der Länsstyrelsen von Jämtland, Norrbotten oder Västerbotten.',
        'Ausländische Staatsangehörige, die die schwedische Jägerprüfung ablegen wollen, registrieren sich vorher im Jägerregister und erhalten eine persönliche HunterID.',
      ],
      sources: ['nv-permit'],
      exercises: [],
      caveat:
        'Die Seite des Naturvårdsverket trägt kein Datum, die Gebühr kann sich geändert haben. Ob Jäger aus dem Ausland eine Jägerprüfung ablegen müssen, sagt die Seite nicht. Frage vor der Reise bei Naturvårdsverket, Polizei und Zoll nach.',
      doneWhen: {
        text: 'Du bestätigst den Schritt selbst, wenn Gebühr, Waffeneinfuhr und mögliche Zusatzerlaubnisse für dein Jagdgebiet geklärt sind.',
        own: true,
      },
    },
    {
      id: 'nachsuche',
      title: 'Nachsuche und der richtige Hund für die Jagd',
      timing: 'vor der ersten Jagd in Schweden',
      facts: [
        'In Schweden ist jeder Jäger selbst für die Nachsuche auf angeschossenes Wild verantwortlich (Svenska Jägareförbundet).',
        'Bei der Jagd auf Bär, Wolf, Vielfrass, Luchs, Elch, Hirsch, Reh, Mufflon oder Wildschwein muss ein besonders auf Nachsuche trainierter Hund innerhalb von höchstens zwei Stunden nach dem Schuss am Anschuss sein können (Jaktförordning 17 §).',
        'Bei der Jagd auf Ringeltaube, Gänse oder Enten muss ein apportierender oder markierender Hund mitgeführt werden (17 §).',
        'Bei jeder Jagd darf ein Hund eingesetzt werden, um angeschossenes oder erlegtes Wild zu suchen oder zu apportieren, solange er unter der Kontrolle des Führers steht (17 §).',
        'Wer als Jäger aus dem Ausland keinen passenden Hund dabeihat, kann das Netz Eftersöksassistans des Svenska Jägareförbundet nutzen: erfahrene Fährtenleger, die Nachsuchen übernehmen. Die Vergütung wird vor der Suche vereinbart.',
      ],
      sources: ['jaktforordning', 'sjf-eftersok'],
      exercises: [
        {
          name: 'Spurarbeit unter Führerkontrolle',
          why: 'Bei jeder Jagd darf der Hund Wild suchen oder apportieren, solange er unter der Kontrolle des Führers steht.',
          own: true,
        },
        {
          name: 'Apport von Ente und Gans',
          why: 'Bei der Jagd auf Gänse und Enten muss ein apportierender oder markierender Hund mitgeführt werden.',
          own: true,
        },
      ],
      caveat: `${NO_METHOD} Ob eine Schweissprüfung aus der Schweiz in Schweden als «besonders auf Nachsuche trainiert» gilt, steht in keiner gelesenen Quelle. Frage beim Svenska Jägareförbundet nach.`,
      doneWhen: {
        text: 'Du bestätigst den Schritt selbst, wenn klar ist, welcher Hund bei welcher Jagd die Nachsuche übernimmt und wen du bei Bedarf anrufst.',
        own: true,
      },
    },
    {
      id: 'raubtiere',
      title: 'Grossraubtiere: der Wolf',
      timing: 'vor der Jagdsaison, Angriffe häufen sich im September und Oktober',
      facts: [
        'Nach einem Faktenblatt des Viltskadecenter der SLU werden in Schweden pro Jahr etwa zehn Hunde von Wölfen getötet oder verletzt. In den nordischen Ländern sind es meist Jagdhunde, die meisten Angriffe fallen in den September und Oktober.',
        'In Versuchen im Winter 2000/2001 (23 Versuche in neun Revieren) wichen Wölfe dem Bellen eines Hundes meist aus. Die Forscher folgern, dass ein bellender Hund in weniger als 300 m Entfernung bei der damaligen Beutedichte offenbar nicht genügt, um einen Angriff auszulösen. Vermutlich muss der Wolf den Hund sehen.',
        'Vorbeugen ist einfacher, wenn der Hund und nicht der Wolf den anderen zuerst über Spur oder Geruch findet. Das Faktenblatt nennt als Ideen, Hunde frische Wolfsspuren meiden zu lassen oder sie dem Führer nahe Wölfe anzeigen zu lassen, damit die Jagd abgebrochen werden kann. Das war ein Forschungsansatz, kein geprüftes Verfahren.',
        'Das Viltskadecenter bewertete 2014 eine elektrische Schutzweste gegen Wölfe nach einem Test mit zehn Hundeführern als mit grossem Potenzial, einen Wolfsangriff zu unterbrechen. Ein Nachweis über mehrere Jahre fehlt.',
      ],
      sources: ['vsc-varg', 'vsc-2014'],
      exercises: [
        {
          name: 'Abruf bei frischer Wolfsspur',
          why: 'Das Faktenblatt nennt als Idee, Hunde frische Wolfsspuren meiden zu lassen. Das ist ein Vorschlag, kein geprüftes Verfahren.',
          own: true,
        },
        {
          name: 'Raubtierspur dem Führer anzeigen',
          why: 'Das Faktenblatt nennt als Idee, dass Hunde dem Führer nahe Wölfe anzeigen, damit die Jagd abgebrochen werden kann. Das ist ein Vorschlag, kein geprüftes Verfahren.',
          own: true,
        },
      ],
      caveat: `${NO_METHOD} Das Faktenblatt ist alt: Es plant eine Studie für den Winter 2003 und liegt im Netz unter dem Jahr 2005. Aktuelle Zahlen, Wolfsgebiete von heute und das Verhalten bei Bär und Luchs habe ich nicht geprüft.`,
      doneWhen: {
        text: 'Du bestätigst den Schritt selbst, wenn du dich über Wolfsgebiete am Ort informiert hast und weisst, wie du die Jagd abbrichst.',
        own: true,
      },
    },
    {
      id: 'gesundheit',
      title: 'Zecken und andere Gesundheitsrisiken',
      timing: 'Schutz vor der Reise beginnen, vor Ort täglich kontrollieren',
      facts: [
        'Der Gemeine Holzbock (Ixodes ricinus) überträgt beim Hund Anaplasmose, die häufigste zeckenübertragene Krankheit beim Hund, ausserdem Borreliose und FSME. Die Auwaldzecke (Dermacentor reticulatus) überträgt Babesia canis, die zu lebensbedrohlicher Blutarmut führen kann. Viele Zeckenstiche machen nicht krank.',
        'Vorbeugen: Fell nach dem Spaziergang absuchen, regelmässig bürsten und Zeckenschutz (Halsband, Spot-on oder Tabletten) verwenden. Die Behandlung sollte schon vor der Reise beginnen, vor Ort werden Haut und Fell täglich geprüft.',
        'Eine Zecke fasst man mit Pinzette oder Zeckenhaken und zieht sie gerade heraus, ohne zu drehen und ohne Butter oder Öl. Wirkt ein gestochener Hund krank, gehört er rasch zum Tierarzt.',
        'Nach dem SVA-Bericht verläuft eine FSME-Infektion bei Hunden meist ohne sichtbare Krankheit. Aus Europa sind nur etwa zwanzig natürliche Krankheitsfälle dokumentiert, der erste schwedische Fall wurde 2019 gemeldet.',
        'Kreuzotter: Nach Agria steigt das Risiko im Sommer, und je früher der Tierarzt behandelt, desto besser ist die Prognose. Schmerzmittel gibt man nur auf tierärztliche Anordnung. Agria zählte im letzten Jahr 278 Kreuzotterbisse bei Hunden mit Versicherungsfall, die Hinweise stammen aus einer Mitteilung, die sich vor allem an Katzenhalter richtet.',
      ],
      sources: ['hss-fastingar', 'sva-tbe', 'agria-orm'],
      exercises: [
        {
          name: 'Absuchen und Zeckenkontrolle dulden',
          why: 'Nach jedem Spaziergang wird das Fell abgesucht. Der Hund soll das ruhig zulassen.',
          own: true,
        },
      ],
      caveat: `${NO_METHOD} Welche Risiken in welchen Gegenden Schwedens bestehen und was für deinen Hund sinnvoll ist, besprichst du mit deinem Tierarzt, besonders zu Zeckenschutz, Fuchsbandwurm und Impfungen.`,
      doneWhen: {
        text: 'Du bestätigst den Schritt selbst, wenn du mit deinem Tierarzt den Schutz besprochen hast und dein Hund die Kontrolle ruhig mitmacht.',
        own: true,
      },
    },
  ],
  gaps: [
    'Der Reiseleitfaden des Jordbruksverket fragt nach «Wettkampf oder Training in Schweden». Was dafür gilt, habe ich nicht gelesen. Ebenso nicht gelesen sind die Unterseiten zu den Regeln für die Schweiz und das Formular E9.204a im Einzelnen.',
    'Die Gesetzestexte (Hundeaufsichtsgesetz, Jaktförordning) wurden auf lagen.nu gelesen, nicht auf der amtlichen Seite. Massgebend ist die amtliche aktuelle Fassung.',
    'Die Regeln der Länsstyrelsen sind je Landkreis verschieden. Gelesen wurden die Beschlüsse für Östergötland und Gävleborg, die übrigen Landkreise sind nicht geprüft. Die Leinenpflicht in Nationalparks, Naturreservaten und Gemeinden ist nicht geprüft.',
    'Ob Prüfungen aus der Schweiz (Gehorsam, Schweiss) in Schweden anerkannt werden und was «besonders auf Nachsuche trainiert» (Jaktförordning 17 §) praktisch verlangt, steht in keiner gelesenen Quelle. Auch die Jagdprüfungen des SKK (Jaktprov) und die Teilnahme ausländischer Hunde sind nicht geprüft.',
    'Ob Jäger aus dem Ausland eine schwedische Jägerprüfung ablegen müssen, und die Regeln für die Waffeneinfuhr, stehen nicht auf der gelesenen Seite des Naturvårdsverket. Die Jagdzeiten für die einzelnen Wildarten (ohne Hunde) sind nicht geprüft.',
    'Zum Wolf liegt nur ein altes Faktenblatt und ein Test von 2014 vor. Aktuelle Zahlen und Wolfsgebiete sowie Bär, Luchs und Wildschwein sind nicht geprüft.',
    'Klima und Gelände (Kälte, Schnee, Eis, Mücken, Sommerhitze) sind in keiner geprüften Quelle behandelt. Schwedische Trainingsmethoden (Elchhund, Standlaut, Stöbern) stehen in keiner geprüften Quelle, die App erfindet sie nicht.',
    'Die Seiten wurden über ein Abrufwerkzeug gelesen, das den Text zusammenfasst. Wichtige Zahlen und Daten kamen, wo möglich, aus mehreren Abrufen und stimmten überein, wurden aber nicht im Original-PDF gegengelesen. Lies sie vor dem Einsatz in der Quelle nach.',
    'Zu Zecken, FSME und Kreuzotter stützt sich der Plan auf einen Zeitschriftenartikel von 2023, einen SVA-Bericht von 2023 und die Mitteilung eines Versicherers. Zum Fuchsbandwurm, zur Babesiose-Verbreitung und zu Impfungen ist nichts Eigenes geprüft: Das gehört zum Tierarzt.',
  ],
};
