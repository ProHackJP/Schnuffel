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
import { PLAN as JAGDHUND_SCHWEDEN } from './jagdhund-se.js';

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

// Reihenfolge der Übersicht: zuerst die Jagdhund-Pläne, weil Schnuffel eine Jagdhunde-App ist.
export const PLANS = [JAGDHUND_BERN, JAGDHUND_SCHWEDEN, HERDENSCHUTZHUND];

export function getPlan(id) {
  return PLANS.find((plan) => plan.id === id) ?? null;
}

// Alle Übungsnamen der Pläne, als Tipphilfe im Tagebuch.
export function planExerciseNames() {
  return PLANS.flatMap((plan) => plan.steps.flatMap((step) => step.exercises.map((e) => e.name)));
}

// Ob ein Schritt als «in Arbeit» gilt: ältere Daten kennen den Status noch, sonst genügt eine abgehakte Übung.
export function isDoing(step, planProgress = {}, checks = {}) {
  const status = planProgress[step.id]?.status;
  if (status === 'done') return false;
  return status === 'doing' || exerciseNamesChecked(step, checks).length > 0;
}

// Namen der abgehakten Übungen eines Schrittes. Haken auf Übungen, die es im Plan nicht mehr gibt, zählen nicht.
function exerciseNamesChecked(step, checks) {
  const checked = new Set(checks[step.id] ?? []);
  return step.exercises.map((e) => e.name).filter((name) => checked.has(name));
}

// Zusammenfassung des Fortschritts eines Hundes in einem Plan.
// planProgress: { stepId: { status } }, checks: { stepId: [Übungsname] } (beides nur für diesen Plan).
export function summarize(plan, planProgress = {}, checks = {}) {
  let done = 0;
  let doing = 0;
  let exercisesDone = 0;
  let exercisesTotal = 0;
  for (const step of plan.steps) {
    if (planProgress[step.id]?.status === 'done') done += 1;
    else if (isDoing(step, planProgress, checks)) doing += 1;
    exercisesDone += exerciseNamesChecked(step, checks).length;
    exercisesTotal += step.exercises.length;
  }
  const total = plan.steps.length;
  return { done, doing, total, exercisesDone, exercisesTotal, openCount: total - done + exercisesTotal - exercisesDone };
}

// Ob der Hund in diesem Plan schon etwas abgehakt hat.
export function isStarted(plan, planProgress = {}, checks = {}) {
  return plan.steps.some((step) => planProgress[step.id] || exerciseNamesChecked(step, checks).length > 0);
}

// Die offenen Punkte eines Plans in Planreihenfolge: nicht abgehakte Schritte und nicht abgehakte Übungen.
// Ein Eintrag je Schritt, der noch etwas Offenes hat: { step, index, stepOpen, exercises }.
export function openPoints(plan, planProgress = {}, checks = {}) {
  const result = [];
  plan.steps.forEach((step, index) => {
    const stepOpen = planProgress[step.id]?.status !== 'done';
    const checked = new Set(exerciseNamesChecked(step, checks));
    const exercises = step.exercises.filter((e) => !checked.has(e.name));
    if (stepOpen || exercises.length > 0) result.push({ step, index, stepOpen, exercises });
  });
  return result;
}
