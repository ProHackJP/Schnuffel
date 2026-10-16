import { test, expect } from '@playwright/test';

test('Startseite lädt mit Navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Willkommen bei Schnuffel');
  const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  for (const label of ['Start', 'Hund', 'Training', 'Info']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

test('Navigation wechselt die Ansichten', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  await nav.getByRole('link', { name: 'Training' }).click();
  await expect(page).toHaveURL(/#\/training$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Training');
  await expect(nav.getByRole('link', { name: 'Training' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'Info' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Info');
});

test('unbekannte Adresse führt zur Startseite', async ({ page }) => {
  await page.goto('/#/gibtsnicht');
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Willkommen bei Schnuffel');
});

test('Hund erfassen, speichern und nach Neuladen wiederfinden', async ({ page }) => {
  await page.goto('/#/hund');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Bitte einen Namen eingeben.');

  await page.getByLabel('Name').fill('Arko');
  await page.getByLabel('Rasse (optional)').fill('Deutsch Drahthaar');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toHaveText('Arko ist gespeichert.');

  await page.reload();
  await expect(page.getByLabel('Name')).toHaveValue('Arko');
  await page.getByRole('navigation').getByRole('link', { name: 'Start' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hallo Arko!');
});

test('Eingaben werden als Text angezeigt, nicht als HTML', async ({ page }) => {
  await page.goto('/#/hund');
  await page.getByLabel('Name').fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await page.goto('/#/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hallo <img src=x onerror=alert(1)>!');
  await expect(page.locator('main img')).toHaveCount(0);
});

test('Manifest ist gültig für die Installation', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const res = await request.get(`/${href}`);
  expect(res.ok()).toBeTruthy();
  const manifest = await res.json();
  expect(manifest.name).toBeTruthy();
  expect(manifest.start_url).toBeTruthy();
  expect(manifest.display).toBe('standalone');
  const sizes = manifest.icons.map((i) => i.sizes);
  expect(sizes).toContain('192x192');
  expect(sizes).toContain('512x512');
  for (const icon of manifest.icons) {
    expect((await request.get(`/${icon.src}`)).ok()).toBeTruthy();
  }
});

test('App startet offline nach dem ersten Besuch', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  // Neu laden, damit der Service Worker die Seite kontrolliert.
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Willkommen bei Schnuffel');
  await expect(page.locator('#offline-badge')).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'Info' }).click();
  await expect(page.locator('#sw-status')).toHaveText('Offline-Modus: bereit.');

  // Auch ein direkter Aufruf einer Unterseite funktioniert offline.
  await page.goto('/#/hund');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mein Hund');
});
