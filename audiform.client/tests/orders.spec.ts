import { test, expect } from '@playwright/test';

test.describe('Ordertabel', () => {

  test.beforeEach(async ({ page }) => {
    // Inloggen
    await page.goto('https://localhost:60942/authpage');
    await page.screenshot({ path: 'debug.png' });
    await page.locator('input[type="email"]').first().fill('jufanjateisman@gmail.com');
    await page.locator('input[type="password"]').first().fill('Floora6773!');
    await page.getByText('Inloggen').first().click();
    await page.waitForURL('**/bestelpagina', { timeout: 5000 });

    // Navigeer naar orders
    await page.goto('https://localhost:60942/orders');
  });

  test('tabel toont de juiste kolomkoppen', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    const headers = ['Bestelnummer', 'Klant', 'Klantnummer', 'Besteldatum', 'Leverdatum', 'Status', 'Actie'];
    for (const header of headers) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }
  });

  test('tabel toont minimaal één rij met data', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

});