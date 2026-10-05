import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test('nutrition shows meals and water tracking', async ({ page }) => {
  await onboard(page);
  await page.getByRole('link', { name: 'التغذية' }).click();
  await expect(page.getByRole('heading', { name: 'التغذية' })).toBeVisible();
  await page.getByRole('button', { name: 'الماء' }).click();
  await expect(page.getByText(/مل|L/).first()).toBeVisible();
});
