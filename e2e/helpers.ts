import { expect, type Page } from '@playwright/test';

/** يمر على الترحيب والاستبيان بالقيم الافتراضية ويوصل للرئيسية */
export async function onboard(page: Page) {
  await page.goto('/welcome');
  await page.getByRole('button', { name: 'تخطي' }).click();
  await expect(page).toHaveURL(/onboarding/);
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: /ابنِ خطتي/ }).click();
  await expect(page).toHaveURL(/plan-ready/, { timeout: 15_000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}
