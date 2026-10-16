import { test, expect } from '@playwright/test';

test('Ausbildungsplan ist von Herdenschutz aus erreichbar und zeigt Phasen, Prüfung und Quellen', async ({ page }) => {
  await page.goto('/#/herdenschutz');
  await page.getByRole('link', { name: 'Zum Ausbildungsplan' }).click();
  await expect(page).toHaveURL(/#\/herdenschutz\/ausbildung$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ausbildung zum Herdenschutzhund');
  const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  await expect(nav.getByRole('link', { name: 'Herdenschutz' })).toHaveAttribute('aria-current', 'page');

  await expect(page.getByRole('heading', { level: 2, name: 'Der offizielle Weg' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: /Eignungsprüfung des Bundes/ })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Prüfungskriterien' })).toContainText('Herdentreue');
  await expect(page.getByRole('heading', { level: 2, name: 'Was nicht belegt ist' })).toBeVisible();

  const sources = page.getByRole('list', { name: 'Quellen' }).getByRole('link');
  expect(await sources.count()).toBeGreaterThanOrEqual(5);
  for (const link of await sources.all()) {
    expect(await link.getAttribute('href')).toMatch(/^https:\/\//);
    expect(await link.getAttribute('rel')).toBe('noopener');
  }
});

test('Übung aus dem Plan ins Tagebuch übernehmen, Fortschritt erscheint im Plan', async ({ page }) => {
  await page.goto('/#/hund');
  await page.getByLabel('Name').fill('Bella');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Bella ist gespeichert.');

  await page.goto('/#/herdenschutz/ausbildung');
  const list = page.getByRole('list', { name: /Übungen Junghund/ });
  const item = list.getByRole('listitem').filter({ hasText: 'Bei der Herde bleiben' });
  await expect(item).toContainText('noch nicht geübt');
  await item.getByRole('link', { name: 'Ins Tagebuch' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Neue Einheit');
  await expect(page.getByLabel('Bezeichnung')).toHaveValue('Bei der Herde bleiben');
  await page.getByLabel('Bewertung (optional)').selectOption('4');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Training');
  await expect(page.getByRole('list', { name: 'Trainingseinheiten' })).toContainText('Bei der Herde bleiben');

  await page.goto('/#/herdenschutz/ausbildung');
  await expect(list.getByRole('listitem').filter({ hasText: 'Bei der Herde bleiben' })).toContainText('1× geübt, zuletzt 4/5');
});

test('Ausbildungsplan ist offline verfügbar', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.goto('/#/herdenschutz/ausbildung');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ausbildung zum Herdenschutzhund');
  await expect(page.getByRole('list', { name: 'Prüfungskriterien' })).toContainText('Herdentreue');
});
