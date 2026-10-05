import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test('app keeps working offline after first visit', async ({ page, context, browserName }) => {
  test.skip(browserName === 'webkit', 'SW offline emulation is unreliable in WebKit');
  await onboard(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.goto('/schedule');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.setOffline(false);
});
