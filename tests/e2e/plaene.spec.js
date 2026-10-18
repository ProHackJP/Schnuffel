import { test, expect } from '@playwright/test';

async function addDog(page, name, url = '/#/hund') {
  await page.goto(url);
  await page.getByLabel('Name').fill(name);
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText(`${name} ist gespeichert.`);
}

function steps(page) {
  return page.locator('ol[aria-label="Schritte"] > li');
}

function step(page, n) {
  return page.getByRole('list', { name: 'Schritte' }).getByRole('listitem').filter({ has: page.getByRole('heading', { level: 2, name: new RegExp(`^Schritt ${n}:`) }) });
}

test('Plan-Übersicht zeigt beide Pläne und führt zum Plan', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  await nav.getByRole('link', { name: 'Pläne' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trainingspläne');
  await expect(nav.getByRole('link', { name: 'Pläne' })).toHaveAttribute('aria-current', 'page');
  const plans = page.getByRole('list', { name: 'Pläne' }).getByRole('listitem');
  await expect(plans).toHaveCount(2);
  await expect(plans.first()).toContainText('Jagdhund im Kanton Bern');
  await expect(plans.nth(1)).toContainText('Herdenschutzhund');
  await expect(page.getByRole('note')).toContainText('Lege zuerst deinen Hund an');

  await plans.first().getByRole('link').click();
  await expect(page).toHaveURL(/#\/plaene\/jagdhund-bern$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jagdhund im Kanton Bern');
});

test('Jagdhund-Plan Bern zeigt Schritte mit Quellen, Hinweisen und Lücken', async ({ page }) => {
  await page.goto('/#/plaene/jagdhund-bern');
  await expect(page.getByText('Gilt für den Kanton Bern')).toBeVisible();
  await expect(steps(page)).toHaveCount(7);
  const gehorsam = step(page, 3);
  await expect(gehorsam).toContainText('Gehorsamsprüfung des BEJV ablegen');
  await expect(gehorsam).toContainText('dreijährigen oder älteren Jagdhund');
  await expect(gehorsam).toContainText('Geschafft, wenn: Du hast den Ausweis');
  await expect(step(page, 4)).toContainText('Hinweis: Ob die Schweissprüfungen des BEJV genau nach dem Reglement der AGJ/TKJ laufen, ist nicht geprüft');
  // Ohne Hund gibt es keine Statusknöpfe, aber einen Hinweis.
  await expect(page.getByRole('button', { name: 'Geschafft' })).toHaveCount(0);
  await expect(page.getByRole('note').filter({ hasText: 'Lege zuerst deinen Hund an' })).toBeVisible();

  await expect(page.getByRole('heading', { level: 2, name: 'Was nicht belegt ist' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Was nicht belegt ist' })).toContainText('Prüfungsordnung des BEJV');
  const sources = page.getByRole('list', { name: 'Quellen' }).getByRole('link');
  expect(await sources.count()).toBe(6);
  for (const link of await sources.all()) {
    expect(await link.getAttribute('href')).toMatch(/^https:\/\//);
    expect(await link.getAttribute('rel')).toBe('noopener');
  }
});

test('Schritte abhaken: Fortschritt bleibt nach Neuladen und gilt je Hund', async ({ page }) => {
  await addDog(page, 'Arko');
  await page.goto('/#/plaene/jagdhund-bern');
  await expect(page.getByText('Fortschritt von Arko: 0 von 7 Schritten geschafft.')).toBeVisible();

  await step(page, 1).getByRole('button', { name: 'Geschafft' }).click();
  await step(page, 2).getByRole('button', { name: 'In Arbeit' }).click();
  await expect(step(page, 1).getByRole('button', { name: 'Geschafft' })).toHaveAttribute('aria-pressed', 'true');
  await expect(step(page, 2).getByRole('button', { name: 'In Arbeit' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft, 1 in Arbeit.')).toBeVisible();

  await page.reload();
  await expect(step(page, 1).getByRole('button', { name: 'Geschafft' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft, 1 in Arbeit.')).toBeVisible();

  // Zurück auf «Offen».
  await step(page, 2).getByRole('button', { name: 'Offen' }).click();
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft.')).toBeVisible();

  // Übersicht zeigt den Stand des aktiven Hundes.
  await page.goto('/#/plaene');
  await expect(page.getByRole('list', { name: 'Pläne' }).getByRole('listitem').first()).toContainText('1 von 7 Schritten geschafft');

  // Ein zweiter Hund startet bei null.
  await addDog(page, 'Bella', '/#/hund/neu');
  await page.goto('/#/plaene/jagdhund-bern');
  await expect(page.getByText('Fortschritt von Bella: 0 von 7 Schritten geschafft.')).toBeVisible();
  await page.getByLabel('Aktiver Hund').selectOption({ label: 'Arko' });
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft.')).toBeVisible();
});

test('Übung aus dem Plan ins Tagebuch übernehmen, Fortschritt erscheint im Plan', async ({ page }) => {
  await addDog(page, 'Arko');
  await page.goto('/#/plaene/jagdhund-bern');
  const exercises = page.getByRole('list', { name: 'Übungen Schritt 2' });
  const item = exercises.getByRole('listitem').filter({ hasText: 'Leinenführigkeit' });
  await expect(item).toContainText('Prüfungsteil, Quelle: Jagdverein Gürbetal');
  await expect(item).toContainText('noch nicht geübt');
  await item.getByRole('link', { name: 'Ins Tagebuch' }).click();
  await expect(page.getByLabel('Bezeichnung')).toHaveValue('Leinenführigkeit');
  await page.getByLabel('Bewertung (optional)').selectOption('3');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('list', { name: 'Trainingseinheiten' })).toContainText('Leinenführigkeit');

  await page.goto('/#/plaene/jagdhund-bern');
  await expect(item).toContainText('1× geübt, zuletzt 3/5');
});

test('Herdenschutzhund-Plan: Prüfung durch den Bund ist belegt, Übungen sind Vorschläge', async ({ page }) => {
  await page.goto('/#/herdenschutz/ausbildung');
  await page.getByRole('link', { name: 'Zum Trainingsplan Herdenschutzhund' }).click();
  await expect(page).toHaveURL(/#\/plaene\/herdenschutzhund$/);
  await expect(steps(page)).toHaveCount(5);
  await expect(step(page, 4)).toContainText('Geschafft, wenn: Der Hund hat die Eignungsprüfung des Bundes bestanden');
  await expect(step(page, 3).getByRole('list', { name: 'Übungen Schritt 3' })).toContainText('Vorschlag von Schnuffel');
  await expect(page.getByRole('list', { name: 'Quellen' }).getByRole('link')).toHaveCount(9);
});

test('unbekannter Plan zeigt eine Meldung', async ({ page }) => {
  await page.goto('/#/plaene/gibts-nicht');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan nicht gefunden');
});

test('Pläne sind offline verfügbar, auch das Abhaken', async ({ page, context }) => {
  await addDog(page, 'Arko');
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.goto('/#/plaene/jagdhund-bern');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jagdhund im Kanton Bern');
  await step(page, 3).getByRole('button', { name: 'Geschafft' }).click();
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft.')).toBeVisible();
});
