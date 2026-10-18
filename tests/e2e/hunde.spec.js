import { test, expect } from '@playwright/test';

async function addDog(page, name, url = '/#/hund') {
  await page.goto(url);
  await page.getByLabel('Name').fill(name);
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText(`${name} ist gespeichert.`);
}

function dogItem(page, name) {
  return page.getByRole('list', { name: 'Hunde' }).getByRole('listitem').filter({ hasText: name });
}

test('zweiten Hund hinzufügen, doppeltes Speichern legt keinen dritten an', async ({ page }) => {
  await addDog(page, 'Arko');
  // Gleiche Adresse: neu laden, damit statt des Formulars die Hundeliste erscheint.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mein Hund');
  await page.getByRole('link', { name: 'Weiteren Hund hinzufügen' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Neuer Hund');
  await page.getByLabel('Name').fill('Bella');
  await page.getByLabel('Rasse (optional)').fill('Kleiner Münsterländer');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Bella ist gespeichert.');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Bella ist gespeichert.');

  await page.goto('/#/hund');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meine Hunde');
  await expect(page.getByRole('list', { name: 'Hunde' }).getByRole('listitem')).toHaveCount(2);
  // Der neue Hund ist gleich aktiv.
  await expect(dogItem(page, 'Bella').getByText('Aktiv', { exact: true })).toHaveCount(1);
  await expect(dogItem(page, 'Arko').getByText('Aktiv', { exact: true })).toHaveCount(0);
  await page.goto('/#/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hallo Bella!');
});

test('aktiven Hund wechseln: Einheiten gehören zum jeweiligen Hund, der Wechsel bleibt nach Neuladen', async ({ page }) => {
  await addDog(page, 'Arko');
  await page.goto('/#/training/neu');
  await page.getByRole('group', { name: 'Übung 1' }).getByLabel('Bezeichnung').fill('Apport');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('list', { name: 'Trainingseinheiten' })).toContainText('Apport');

  await addDog(page, 'Bella', '/#/hund/neu');
  await page.goto('/#/training');
  await expect(page.getByText('Noch keine Einheiten erfasst.')).toBeVisible();

  // Wechsel über die Auswahl im Training.
  await page.getByLabel('Aktiver Hund').selectOption({ label: 'Arko' });
  await expect(page.getByRole('list', { name: 'Trainingseinheiten' })).toContainText('Apport');
  await page.reload();
  await expect(page.getByLabel('Aktiver Hund').locator('option:checked')).toHaveText('Arko');
  await expect(page.getByRole('list', { name: 'Trainingseinheiten' })).toContainText('Apport');

  // Wechsel über die Hundeliste.
  await page.goto('/#/hund');
  await page.getByRole('button', { name: 'Bella zum aktiven Hund machen' }).click();
  await expect(dogItem(page, 'Bella').getByText('Aktiv', { exact: true })).toHaveCount(1);
  await expect(dogItem(page, 'Arko').getByText('Aktiv', { exact: true })).toHaveCount(0);
  await page.goto('/#/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hallo Bella!');
});

test('Hund bearbeiten und löschen, Rückfrage nennt die Einheiten', async ({ page }) => {
  await addDog(page, 'Arko');
  await page.goto('/#/training/neu');
  await page.getByRole('group', { name: 'Übung 1' }).getByLabel('Bezeichnung').fill('Apport');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page).toHaveURL(/#\/training$/);
  await addDog(page, 'Bella', '/#/hund/neu');

  await page.goto('/#/hund');
  await page.getByRole('link', { name: 'Arko bearbeiten' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hund bearbeiten');
  await expect(page.getByLabel('Name')).toHaveValue('Arko');
  await page.getByLabel('Name').fill('Arko vom Berg');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Arko vom Berg ist gespeichert.');

  let dialog = '';
  page.once('dialog', async (d) => {
    dialog = d.message();
    await d.dismiss();
  });
  await page.getByRole('button', { name: 'Hund löschen' }).click();
  expect(dialog).toContain('Arko vom Berg wirklich löschen');
  expect(dialog).toContain('1 Einheit');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hund bearbeiten');

  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Hund löschen' }).click();
  await expect(page).toHaveURL(/#\/hund$/);
  await expect(page.getByRole('list', { name: 'Hunde' }).getByRole('listitem')).toHaveCount(1);
  await expect(dogItem(page, 'Bella').getByText('Aktiv', { exact: true })).toHaveCount(1);
  await page.goto('/#/training');
  await expect(page.getByText('Noch keine Einheiten erfasst.')).toBeVisible();
});

test('unbekannter Hund in der Adresse zeigt eine verständliche Meldung', async ({ page }) => {
  await page.goto('/#/hund/gibts-nicht');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hund nicht gefunden');
});

test('Sicherung enthält mehrere Hunde und stellt sie wieder her', async ({ browser, page }) => {
  await addDog(page, 'Arko');
  await addDog(page, 'Bella', '/#/hund/neu');
  await page.goto('/#/info');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Daten sichern' }).click();
  const download = await downloadPromise;
  const file = await download.path();

  const context2 = await browser.newContext({ serviceWorkers: 'block', locale: 'de-CH' });
  const page2 = await context2.newPage();
  await page2.goto(new URL('/#/info', page.url()).toString());
  page2.once('dialog', (d) => d.accept());
  await page2.setInputFiles('#restore-file', file);
  await expect(page2.getByRole('status')).toHaveText('Wiederhergestellt: 2 Hunde, 0 Einheiten.');
  await page2.goto(new URL('/#/hund', page.url()).toString());
  await expect(page2.getByRole('list', { name: 'Hunde' }).getByRole('listitem')).toHaveCount(2);
  await context2.close();
});
