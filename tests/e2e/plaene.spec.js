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
  // Ohne Hund gibt es keine Kontrollkästchen, aber einen Hinweis.
  await expect(page.getByRole('checkbox')).toHaveCount(0);
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
  await expect(page.getByText('Fortschritt von Arko: 0 von 7 Schritten geschafft, 0 von 9 Übungen abgehakt.')).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(7 + 9);
  await expect(step(page, 1).getByRole('checkbox', { name: 'Schritt 1 geschafft' })).not.toBeChecked();
  await expect(step(page, 1)).toContainText('Offen');

  await step(page, 1).getByRole('checkbox', { name: 'Schritt 1 geschafft' }).check();
  await expect(step(page, 1)).toContainText('Geschafft');
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft, 0 von 9 Übungen abgehakt.')).toBeVisible();

  await page.reload();
  await expect(step(page, 1).getByRole('checkbox', { name: 'Schritt 1 geschafft' })).toBeChecked();
  await expect(step(page, 2).getByRole('checkbox', { name: 'Schritt 2 geschafft' })).not.toBeChecked();
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft, 0 von 9 Übungen abgehakt.')).toBeVisible();

  // Haken wieder zurücknehmen: der Schritt ist wieder offen.
  await step(page, 1).getByRole('checkbox', { name: 'Schritt 1 geschafft' }).uncheck();
  await expect(step(page, 1)).toContainText('Offen');
  await expect(page.getByText('Fortschritt von Arko: 0 von 7 Schritten geschafft, 0 von 9 Übungen abgehakt.')).toBeVisible();
  await step(page, 1).getByRole('checkbox', { name: 'Schritt 1 geschafft' }).check();

  // Übersicht zeigt den Stand des aktiven Hundes.
  await page.goto('/#/plaene');
  await expect(page.getByRole('list', { name: 'Pläne' }).getByRole('listitem').first()).toContainText('1 von 7 Schritten geschafft, 0 von 9 Übungen abgehakt');

  // Ein zweiter Hund startet bei null.
  await addDog(page, 'Bella', '/#/hund/neu');
  await page.goto('/#/plaene/jagdhund-bern');
  await expect(page.getByText('Fortschritt von Bella: 0 von 7 Schritten geschafft, 0 von 9 Übungen abgehakt.')).toBeVisible();
  await page.getByLabel('Aktiver Hund').selectOption({ label: 'Arko' });
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft, 0 von 9 Übungen abgehakt.')).toBeVisible();
});

test('Übungen abhaken: Schritt gilt als in Arbeit, Haken bleiben nach Neuladen und gelten je Hund', async ({ page }) => {
  await addDog(page, 'Arko');
  await page.goto('/#/plaene/jagdhund-bern');
  const ablegen = step(page, 2).getByRole('checkbox', { name: 'Ablegen' });
  const appell = step(page, 2).getByRole('checkbox', { name: 'Appell' });
  await expect(ablegen).not.toBeChecked();
  await expect(step(page, 2)).toContainText('Offen · 0 von 4 Übungen abgehakt');

  await ablegen.check();
  await expect(step(page, 2)).toContainText('In Arbeit · 1 von 4 Übungen abgehakt');
  await expect(step(page, 2)).toHaveAttribute('data-status', 'doing');
  await expect(page.getByText('Fortschritt von Arko: 0 von 7 Schritten geschafft, 1 in Arbeit, 1 von 9 Übungen abgehakt.')).toBeVisible();
  // Die Übung abzuhaken hakt den Schritt nicht von selbst ab.
  await expect(step(page, 2).getByRole('checkbox', { name: 'Schritt 2 geschafft' })).not.toBeChecked();

  await page.reload();
  await expect(ablegen).toBeChecked();
  await expect(appell).not.toBeChecked();
  await expect(step(page, 2)).toContainText('In Arbeit · 1 von 4 Übungen abgehakt');

  for (const name of ['Leinenführigkeit', 'Schussruhe', 'Appell']) await step(page, 2).getByRole('checkbox', { name }).check();
  await expect(step(page, 2)).toContainText('4 von 4 Übungen abgehakt. Alle Übungen sind abgehakt, prüfe, ob der Schritt geschafft ist');
  await step(page, 2).getByRole('checkbox', { name: 'Schritt 2 geschafft' }).check();
  await expect(step(page, 2)).toContainText('Geschafft · 4 von 4 Übungen abgehakt');
  await expect(step(page, 2)).not.toContainText('prüfe, ob der Schritt geschafft ist');

  // Zurücknehmen
  await ablegen.uncheck();
  await expect(step(page, 2)).toContainText('Geschafft · 3 von 4 Übungen abgehakt');
  await page.reload();
  await expect(ablegen).not.toBeChecked();
  await expect(appell).toBeChecked();

  // Ein zweiter Hund hat eigene Haken.
  await addDog(page, 'Bella', '/#/hund/neu');
  await page.goto('/#/plaene/jagdhund-bern');
  await expect(page.getByText('Fortschritt von Bella: 0 von 7 Schritten geschafft, 0 von 9 Übungen abgehakt.')).toBeVisible();
  await expect(appell).not.toBeChecked();
});

test('Offene Punkte bleiben im Plan sichtbar und springen zum Schritt', async ({ page }) => {
  await addDog(page, 'Arko');
  await page.goto('/#/plaene/jagdhund-bern');
  const panel = page.locator('details.open-points');
  await expect(panel.locator('summary')).toHaveText('Offene Punkte: 16');
  // Noch nichts abgehakt: das Feld ist zugeklappt, die Kästchen darunter zeigen alles Offene.
  await expect(panel).not.toHaveAttribute('open', '');

  await step(page, 1).getByRole('checkbox', { name: 'Schritt 1 geschafft' }).check();
  await step(page, 2).getByRole('checkbox', { name: 'Ablegen' }).check();
  await expect(panel.locator('summary')).toHaveText('Offene Punkte: 14');
  await panel.locator('summary').click();
  const list = panel.getByRole('list', { name: 'Offene Punkte' });
  await expect(list).not.toContainText('Schritt 1:');
  await expect(list).toContainText('Schritt 2: Grundgehorsam');
  await expect(list).toContainText('Leinenführigkeit');
  await expect(list).not.toContainText('Ablegen');

  // Ein abgehakter Schritt mit offenen Übungen bleibt mit diesen Übungen stehen.
  await step(page, 2).getByRole('checkbox', { name: 'Schritt 2 geschafft' }).check();
  await expect(panel.locator('summary')).toHaveText('Offene Punkte: 13');
  await expect(list.getByRole('listitem').filter({ hasText: 'Schritt 2: Grundgehorsam' }).first()).toContainText('(Schritt geschafft)');
  await expect(list).toContainText('Schussruhe');

  // Der Sprungknopf bringt den Schritt ins Bild.
  await list.getByRole('button', { name: /^Schritt 7:/ }).click();
  await expect(step(page, 7).getByRole('heading', { level: 2 })).toBeInViewport();

  // Nach dem Neuladen ist das Feld offen, weil der Plan begonnen ist.
  await page.reload();
  await expect(panel).toHaveAttribute('open', '');
});

test('Alles abgehakt: keine offenen Punkte mehr', async ({ page }) => {
  await addDog(page, 'Arko');
  await page.goto('/#/plaene/herdenschutzhund');
  const boxes = page.getByRole('checkbox');
  const total = 5 + 10;
  await expect(boxes).toHaveCount(total);
  for (let i = 0; i < total; i++) await boxes.nth(i).check();
  await expect(page.locator('details.open-points summary')).toHaveText('Offene Punkte: keine, alles abgehakt');
  await expect(page.getByText('Fortschritt von Arko: 5 von 5 Schritten geschafft, 10 von 10 Übungen abgehakt.')).toBeVisible();
});

test('Seite «Offene Punkte» zeigt begonnene Pläne und was noch offen ist', async ({ page }) => {
  await page.goto('/#/plaene/offen');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Offene Punkte');
  await expect(page.getByRole('note')).toContainText('Lege zuerst deinen Hund an');

  await addDog(page, 'Arko');
  await page.goto('/#/plaene');
  await page.getByRole('link', { name: 'Offene Punkte ansehen' }).click();
  await expect(page).toHaveURL(/#\/plaene\/offen$/);
  await expect(page.getByRole('note')).toContainText('Noch nichts abgehakt');
  await expect(page.getByText('Noch nicht begonnen:')).toContainText('Jagdhund im Kanton Bern');
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('link', { name: 'Pläne' })).toHaveAttribute('aria-current', 'page');

  await page.goto('/#/plaene/jagdhund-bern');
  await step(page, 1).getByRole('checkbox', { name: 'Schritt 1 geschafft' }).check();
  await step(page, 2).getByRole('checkbox', { name: 'Ablegen' }).check();
  await page.goto('/#/plaene/offen');
  const plan = page.getByRole('region', { name: 'Jagdhund im Kanton Bern' });
  await expect(plan).toContainText('1 von 7 Schritten geschafft, 1 in Arbeit, 1 von 9 Übungen abgehakt');
  const list = plan.getByRole('list', { name: 'Offene Punkte' });
  await expect(list).not.toContainText('Schritt 1:');
  await expect(list).toContainText('Schritt 2: Grundgehorsam');
  await expect(list).toContainText('Schussruhe');
  await expect(list).not.toContainText('Ablegen');
  await expect(page.getByText('Noch nicht begonnen:')).toContainText('Herdenschutzhund');
  await expect(page.getByText('Noch nicht begonnen:')).not.toContainText('Jagdhund im Kanton Bern');

  await list.getByRole('link', { name: /Schritt 2:/ }).click();
  await expect(page).toHaveURL(/#\/plaene\/jagdhund-bern$/);
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

test('Abgehakte Schritte und Übungen sind Teil der Sicherung', async ({ browser, page }) => {
  await addDog(page, 'Arko');
  await page.goto('/#/plaene/jagdhund-bern');
  await step(page, 1).getByRole('checkbox', { name: 'Schritt 1 geschafft' }).check();
  await step(page, 2).getByRole('checkbox', { name: 'Ablegen' }).check();
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft, 1 in Arbeit, 1 von 9 Übungen abgehakt.')).toBeVisible();

  await page.goto('/#/info');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Daten sichern' }).click();
  const file = await (await downloadPromise).path();

  const context2 = await browser.newContext({ serviceWorkers: 'block', locale: 'de-CH' });
  const page2 = await context2.newPage();
  await page2.goto(new URL('/#/info', page.url()).toString());
  page2.once('dialog', (d) => d.accept());
  await page2.setInputFiles('#restore-file', file);
  await expect(page2.getByRole('status')).toHaveText('Wiederhergestellt: 1 Hund, 0 Einheiten, 1 Planschritt, 1 abgehakte Übung.');
  await page2.goto(new URL('/#/plaene/jagdhund-bern', page.url()).toString());
  await expect(page2.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft, 1 in Arbeit, 1 von 9 Übungen abgehakt.')).toBeVisible();
  await expect(step(page2, 2).getByRole('checkbox', { name: 'Ablegen' })).toBeChecked();
  await context2.close();
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
  await step(page, 3).getByRole('checkbox', { name: 'Schritt 3 geschafft' }).check();
  await step(page, 2).getByRole('checkbox', { name: 'Ablegen' }).check();
  await expect(page.getByText('Fortschritt von Arko: 1 von 7 Schritten geschafft, 1 in Arbeit, 1 von 9 Übungen abgehakt.')).toBeVisible();
  await page.reload();
  await expect(step(page, 3).getByRole('checkbox', { name: 'Schritt 3 geschafft' })).toBeChecked();
  await expect(step(page, 2).getByRole('checkbox', { name: 'Ablegen' })).toBeChecked();
});
