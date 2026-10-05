import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test('live workout: log a set and see the rest timer', async ({ page }) => {
  await onboard(page);
  await page.getByRole('link', { name: /تمرين/ }).first().click();
  const start = page.getByRole('button', { name: /ابدأ/ }).first();
  test.skip(!(await start.isVisible().catch(() => false)), 'rest day in the generated plan');
  await start.click();
  await expect(page).toHaveURL(/workout\/live/);
  // سحب زر إنهاء الجولة
  const knob = page.getByRole('button', { name: /سحب|swipe/i }).first();
  const box = await knob.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 400, box.y + box.height / 2, { steps: 12 });
    await page.mouse.up();
  }
  await expect(page.getByText('راحة')).toBeVisible();
  await page.getByRole('button', { name: /تخط/ }).click();
});
