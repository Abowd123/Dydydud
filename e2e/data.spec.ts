import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test('export and wipe my data', async ({ page }) => {
  await onboard(page);
  await page.goto('/data');
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: 'تصدير بياناتي' }).click();
  expect((await dl).suggestedFilename()).toMatch(/^gymmate-backup-\d{4}-\d{2}-\d{2}\.json$/);
  await page.getByRole('button', { name: 'مسح كل البيانات من الجهاز' }).click();
  await page.getByRole('button', { name: 'امسح نهائياً' }).click();
  await expect(page).toHaveURL(/welcome/);
});
