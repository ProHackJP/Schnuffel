import { test, expect } from '@playwright/test';

async function createDogAndSession(page) {
  await page.goto('/#/hund');
  await page.getByLabel('Name').fill('Arko');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Arko ist gespeichert.');
  await page.goto('/#/training/neu');
  await page.getByLabel('Datum').fill('2026-10-10');
  await page.getByRole('group', { name: 'Übung 1' }).getByLabel('Bezeichnung').fill('Schleppe');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page).toHaveURL(/#\/training$/);
}

test('Erinnerung an Sicherung erscheint erst mit Einheiten und verschwindet nach dem Sichern', async ({ page }) => {
  await page.goto('/#/hund');
  await page.getByLabel('Name').fill('Arko');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Arko ist gespeichert.');
  await page.goto('/#/');
  await expect(page.getByRole('note')).toHaveCount(0);

  await createDogAndSession(page);
  await page.goto('/#/');
  await expect(page.getByRole('note')).toContainText('nicht gesichert');
  await page.getByRole('link', { name: 'Jetzt sichern' }).click();

  await expect(page.getByText('Noch keine Sicherung gemacht.')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Daten sichern' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^schnuffel-sicherung-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.getByRole('status')).toHaveText('Sicherung erstellt.');
  await expect(page.getByText(/^Letzte Sicherung: /)).toBeVisible();

  await page.goto('/#/');
  await expect(page.getByRole('note')).toHaveCount(0);
});

test('Sicherung exportieren und auf leerem Gerät wiederherstellen', async ({ page, browser }) => {
  await createDogAndSession(page);
  await page.goto('/#/info');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Daten sichern' }).click();
  const path = await (await downloadPromise).path();

  // Zweiter Browser-Kontext = anderes Gerät ohne Daten.
  const other = await browser.newContext();
  const page2 = await other.newPage();
  await page2.goto('/#/');
  await expect(page2.getByRole('heading', { level: 1 })).toHaveText('Willkommen bei Schnuffel');
  await page2.goto('/#/info');
  page2.once('dialog', (dialog) => dialog.accept());
  await page2.getByLabel('Wiederherstellen aus Sicherungsdatei').setInputFiles(path);
  await expect(page2.getByRole('status')).toHaveText('Wiederhergestellt: 1 Hund, 1 Einheiten.');
  await expect(page2.getByText(/^Letzte Sicherung: /)).toBeVisible();
  await page2.goto('/#/');
  await expect(page2.getByRole('heading', { level: 1 })).toHaveText('Hallo Arko!');
  await page2.goto('/#/training');
  await expect(page2.getByRole('list', { name: 'Trainingseinheiten' })).toContainText('Schleppe');
  await other.close();
});

test('Wiederherstellen abbrechen lässt die Daten unverändert', async ({ page }) => {
  await createDogAndSession(page);
  await page.goto('/#/info');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByLabel('Wiederherstellen aus Sicherungsdatei').setInputFiles({
    name: 'leer.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ format: 'schnuffel-backup', version: 3, dogs: [], sessions: [] })),
  });
  await page.goto('/#/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hallo Arko!');
});

test('ungültige Datei wird abgelehnt', async ({ page }) => {
  await page.goto('/#/info');
  await page.getByLabel('Wiederherstellen aus Sicherungsdatei').setInputFiles({
    name: 'falsch.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"irgendwas": true}'),
  });
  await expect(page.getByRole('status')).toHaveText('Die Datei ist keine gültige Schnuffel-Sicherung.');
});
