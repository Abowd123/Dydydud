import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test('new user goes from welcome to a ready plan', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/welcome/);
  await expect(page.getByText('GYMMATE')).toBeVisible();
  await onboard(page);
  await expect(page.getByRole('link', { name: 'جدولي' })).toBeVisible();
});

test('legal pages are public', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'سياسة الخصوصية' })).toBeVisible();
  await page.goto('/terms');
  await expect(page.getByRole('heading', { name: 'شروط الاستخدام' })).toBeVisible();
  await expect(page.getByText('تنبيه صحي مهم')).toBeVisible();
});
