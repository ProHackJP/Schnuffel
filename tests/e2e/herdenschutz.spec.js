import { test, expect } from '@playwright/test';

test('Bereich Herdenschutz ist über die Navigation erreichbar und zeigt Regeln mit Quellen', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  await nav.getByRole('link', { name: 'Herdenschutz' }).click();
  await expect(page).toHaveURL(/#\/herdenschutz$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Herdenschutz');
  await expect(nav.getByRole('link', { name: 'Herdenschutz' })).toHaveAttribute('aria-current', 'page');

  await expect(page.getByRole('heading', { level: 2, name: 'Mit dem Hund bei einer geschützten Herde' })).toBeVisible();
  await expect(page.getByText('Hund sofort an die Leine nehmen')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Was nicht belegt ist' })).toBeVisible();

  const sources = page.getByRole('list', { name: 'Quellen' }).getByRole('link');
  expect(await sources.count()).toBeGreaterThanOrEqual(2);
  for (const link of await sources.all()) {
    expect(await link.getAttribute('href')).toMatch(/^https:\/\//);
    expect(await link.getAttribute('rel')).toBe('noopener');
  }
  await expect(page.getByRole('link', { name: 'Karte der Einsatzgebiete' })).toHaveAttribute('href', /^https:\/\//);
});

test('Übungsvorschläge erscheinen im Training als Vorschlag', async ({ page }) => {
  await page.goto('/#/hund');
  await page.getByLabel('Name').fill('Arko');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Arko ist gespeichert.');

  await page.goto('/#/herdenschutz');
  await expect(page.getByRole('list', { name: 'Übungsvorschläge' })).toContainText('Anleinen auf Signal');
  await page.getByRole('link', { name: 'Training erfassen' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Neue Einheit');
  const options = await page.locator('#exercise-names option').evaluateAll((els) => els.map((el) => el.value));
  expect(options).toContain('Anleinen auf Signal');
  expect(options).toContain('Ruhig an Weidetieren vorbei');
});

test('Herdenschutz ist offline verfügbar', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.goto('/#/herdenschutz');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Herdenschutz');
  await expect(page.getByText('Hund sofort an die Leine nehmen')).toBeVisible();
});
