// Trainingspläne: eine Folge von Schritten mit Quellen. Der Fortschritt pro Hund liegt in den Daten (store.js),
// die Pläne selbst bleiben unveränderlich in der App.
//
// Form eines Plans:
//   { id, title, summary, scope, notice, sources, steps, gaps }
// Form eines Schritts:
//   { id, title, timing, facts[], sources[], exercises[], caveat?, doneWhen: { text, own, sources? } }
// Form einer Übung: { name, why, sources[] } für Prüfungsteile aus einer Quelle, { name, why, own: true } für Vorschläge von Schnuffel.
import * as HSH from './hsh-ausbildung.js';
import { PLAN as JAGDHUND_BERN } from './jagdhund-be.js';

// Der Plan zum Herdenschutzhund entsteht aus den Phasen und Übungen von Etappe 6.
const DONE_WHEN_HSH = {
  vorbereitung: 'Die Erstberatung hat stattgefunden, der Sachkundekurs ist besucht und der Fürsorgegarant ist bestimmt.',
  welpe: 'Der Hund ist auf Menschen, Nutztiere und Hunderudel sozialisiert und lässt sich ruhig anfassen, führen und herrufen.',
  junghund: 'Der Hund bleibt bei der Herde, bleibt ausserhalb der Herde tolerant und erholt sich rasch von Schreckreizen.',
  erwachsen: 'Du bestätigst den Schritt selbst, zum Beispiel nach dem dritten Jahr der Integration auf dem Betrieb.',
};

const HERDENSCHUTZHUND = {
  id: 'herdenschutzhund',
  title: 'Herdenschutzhund (Schweiz)',
  summary:
    'Vom Gespräch mit der Beratung bis zur Eignungsprüfung des Bundes und zum Einsatz in der Herde: die Phasen der Ausbildung als Schritte, mit Übungen fürs Tagebuch.',
  scope: 'Gilt für die ganze Schweiz. Einzelne Kantone haben zusätzliche Regeln, die hier nur teilweise geprüft sind.',
  notice:
    'Herdenschutzhunde arbeiten selbstständig ohne Kommandos und sind keine Jagdhunde. Anerkannt wird nur, wer die Eignungsprüfung des Bundes besteht. Dieser Plan ersetzt weder den Sachkundekurs noch die Beratung.',
  sources: HSH.SOURCES,
  steps: HSH.PHASES.map((phase) => ({
    id: phase.id,
    title: phase.title,
    timing: phase.age,
    facts: phase.items,
    sources: phase.sources,
    exercises: HSH.EXERCISES.filter((e) => e.phase === phase.id).map((e) => ({
      name: e.name,
      why: e.why,
      criterion: e.criterion,
      own: true,
    })),
    doneWhen:
      phase.id === 'pruefung'
        ? { text: 'Der Hund hat die Eignungsprüfung des Bundes bestanden und ist in der Datenbank Amicus eingetragen.', own: false, sources: HSH.OFFICIAL_PATH.sources }
        : { text: DONE_WHEN_HSH[phase.id], own: true },
  })),
  gaps: HSH.GAPS,
};

// Reihenfolge der Übersicht: zuerst der Jagdhund, weil Schnuffel eine Jagdhunde-App ist.
export const PLANS = [JAGDHUND_BERN, HERDENSCHUTZHUND];

export function getPlan(id) {
  return PLANS.find((plan) => plan.id === id) ?? null;
}

// Alle Übungsnamen der Pläne, als Tipphilfe im Tagebuch.
export function planExerciseNames() {
  return PLANS.flatMap((plan) => plan.steps.flatMap((step) => step.exercises.map((e) => e.name)));
}

// Zusammenfassung des Fortschritts eines Hundes in einem Plan: { done, doing, total }.
export function summarize(plan, planProgress = {}) {
  let done = 0;
  let doing = 0;
  for (const step of plan.steps) {
    const status = planProgress[step.id]?.status;
    if (status === 'done') done += 1;
    else if (status === 'doing') doing += 1;
  }
  return { done, doing, total: plan.steps.length };
}
