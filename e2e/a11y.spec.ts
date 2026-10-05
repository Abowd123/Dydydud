import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

const pages = ['/', '/schedule', '/nutrition', '/exercises', '/progress', '/more', '/data', '/privacy'];

test('no serious accessibility violations', async ({ page }) => {
  await onboard(page);
  for (const p of pages) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${p}: ${v.id}`)).toEqual([]);
  }
});
