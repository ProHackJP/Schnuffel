import { test, expect } from '@playwright/test';

async function createDog(page, name = 'Arko') {
  await page.goto('/#/hund');
  await page.getByLabel('Name').fill(name);
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText(`${name} ist gespeichert.`);
}

function exercise(page, n) {
  return page.getByRole('group', { name: `Übung ${n}` });
}

test('ohne Hund verweist das Training auf die Erfassung', async ({ page }) => {
  await page.goto('/#/training');
  await expect(page.getByText('Erfasse zuerst deinen Hund')).toBeVisible();
  await page.goto('/#/training/neu');
  await expect(page).toHaveURL(/#\/training$/);
});

test('Einheit mit mehreren Übungen erfassen, bearbeiten und löschen', async ({ page }) => {
  await createDog(page);
  await page.goto('/#/training');
  await expect(page.getByText('Noch keine Einheiten erfasst.')).toBeVisible();
  await page.getByRole('link', { name: 'Neue Einheit' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Neue Einheit');

  // Ohne Übung kommt eine verständliche Meldung.
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Bitte mindestens eine Übung eintragen.');

  await page.getByLabel('Datum').fill('2026-10-10');
  await page.getByLabel('Dauer in Minuten (optional)').fill('40');
  await page.getByLabel('Ort (optional)').fill('Waldrand Nord');
  await exercise(page, 1).getByLabel('Bezeichnung').fill('Schleppe');
  await exercise(page, 1).getByLabel('Wildart (optional)').fill('Kaninchen');
  await exercise(page, 1).getByLabel('Bewertung (optional)').selectOption('4');
  await page.getByRole('button', { name: 'Übung hinzufügen' }).click();
  await exercise(page, 2).getByLabel('Bezeichnung').fill('Apport');
  await exercise(page, 2).getByLabel('Bewertung (optional)').selectOption('2');
  await exercise(page, 2).getByLabel('Notiz zur Übung (optional)').fill('Hat geknautscht');
  await page.getByLabel('Notiz zur Einheit (optional)').fill('Warm, wenig Wind');
  await page.getByRole('button', { name: 'Speichern' }).click();

  await expect(page).toHaveURL(/#\/training$/);
  const list = page.getByRole('list', { name: 'Trainingseinheiten' });
  await expect(list.getByRole('link')).toHaveCount(1);
  const entry = list.getByRole('link').first();
  await expect(entry).toContainText('10. Oktober 2026');
  await expect(entry).toContainText('40 Min. · Waldrand Nord');
  await expect(entry).toContainText('Schleppe · Kaninchen4/5');
  await expect(entry).toContainText('Apport2/5');

  // Nach Neuladen ist alles noch da, dann bearbeiten.
  await page.reload();
  await page.getByRole('list', { name: 'Trainingseinheiten' }).getByRole('link').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Einheit bearbeiten');
  await expect(exercise(page, 2).getByLabel('Notiz zur Übung (optional)')).toHaveValue('Hat geknautscht');
  await expect(page.getByLabel('Notiz zur Einheit (optional)')).toHaveValue('Warm, wenig Wind');
  await exercise(page, 1).getByRole('button', { name: 'Übung entfernen' }).click();
  await expect(exercise(page, 1).getByLabel('Bezeichnung')).toHaveValue('Apport');
  await expect(exercise(page, 1).getByRole('button', { name: 'Übung entfernen' })).toBeHidden();
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('list', { name: 'Trainingseinheiten' }).getByRole('link').first()).not.toContainText('Schleppe');

  // Löschen: Abbrechen behält die Einheit, Bestätigen löscht sie.
  await page.getByRole('list', { name: 'Trainingseinheiten' }).getByRole('link').first().click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Einheit löschen' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Einheit bearbeiten');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Einheit löschen' }).click();
  await expect(page).toHaveURL(/#\/training$/);
  await expect(page.getByText('Noch keine Einheiten erfasst.')).toBeVisible();
});

test('Liste zeigt die neueste Einheit zuerst', async ({ page }) => {
  await createDog(page);
  for (const [date, name] of [['2026-09-01', 'Alt'], ['2026-10-01', 'Neu']]) {
    await page.goto('/#/training/neu');
    await page.getByLabel('Datum').fill(date);
    await exercise(page, 1).getByLabel('Bezeichnung').fill(name);
    await page.getByRole('button', { name: 'Speichern' }).click();
    await expect(page).toHaveURL(/#\/training$/);
  }
  const links = page.getByRole('list', { name: 'Trainingseinheiten' }).getByRole('link');
  await expect(links.nth(0)).toContainText('Neu');
  await expect(links.nth(1)).toContainText('Alt');
});

test('unbekannte Einheit zeigt eine Meldung', async ({ page }) => {
  await page.goto('/#/training/gibt-es-nicht');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Einheit nicht gefunden');
});

test('Hund aus Etappe 1 (localStorage) wird übernommen', async ({ page }) => {
  // Alten Stand vor dem ersten App-Start simulieren (nur beim ersten Laden).
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('schnuffel:v1', JSON.stringify({ version: 1, dogs: [{ id: 'alt-1', name: 'Bella' }] }));
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hallo Bella!');
  expect(await page.evaluate(() => localStorage.getItem('schnuffel:v1'))).toBeNull();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hallo Bella!');
});

test('Einheit erfassen funktioniert offline', async ({ page, context }) => {
  await createDog(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.goto('/#/training/neu');
  await exercise(page, 1).getByLabel('Bezeichnung').fill('Offline-Übung');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('list', { name: 'Trainingseinheiten' })).toContainText('Offline-Übung');
});
