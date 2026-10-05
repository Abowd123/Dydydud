import { describe, expect, it } from 'vitest';
import { matchDish, normalizeAr, parseVision, scaleDish, searchDishes, snapPortion } from './recognize';
import { GULF_DISHES } from './gulfDishes';

describe('gulf food recognition', () => {
  it('has unique ids and sane macros', () => {
    const ids = new Set(GULF_DISHES.map((d) => d.id));
    expect(ids.size).toBe(GULF_DISHES.length);
    expect(GULF_DISHES.length).toBeGreaterThanOrEqual(50);
    for (const d of GULF_DISHES) if (d.kcal > 50) {
      const est = d.protein * 4 + d.carbs * 4 + d.fat * 9;
      expect(Math.abs(est - d.kcal) / d.kcal).toBeLessThanOrEqual(0.15);
    }
  });
  it('normalizes Arabic spelling', () => {
    expect(normalizeAr('الكَبْسَة')).toBe('كبسه');
    expect(normalizeAr('سنبوسة')).toBe('سنبوسه');
  });
  const cases: [string, string][] = [
    ['كبسة دجاج', 'kabsa_chicken'],
    ['الكبسه', 'kabsa_chicken'],
    ['Lamb Mandi', 'mandi_meat'],
    ['هريس', 'harees'],
    ['سنبوسة', 'sambosa'],
    ['شاي كرك', 'karak'],
    ['مطبق', 'mutabbaq_meat']
  ];
  it('matches common names and spellings', () => {
    for (const [q, id] of cases) expect(`${q}:${matchDish(q)?.dish.id}`).toBe(`${q}:${id}`);
  });
  it('does not invent matches', () => {
    expect(matchDish('سوشي')).toBeNull();
  });
  it('scales portions', () => {
    const k = GULF_DISHES.find((d) => d.id === 'kabsa_chicken')!;
    expect(scaleDish(k, 0.5).kcal).toBe(325);
    expect(snapPortion(0.6)).toBe(0.5);
    expect(snapPortion(1.3)).toBe(1.5);
  });
  it('parses fenced model output', () => {
    const raw = '```json\n{"items":[{"name":"كبسة","dishId":"kabsa_chicken","portion":0.7,"confidence":0.9},{"name":"Sushi","dishId":null,"portion":1,"confidence":0.7,"kcal":350,"protein":12,"carbs":60,"fat":6}]}\n```';
    const r = parseVision(raw)!;
    expect(r.items).toHaveLength(2);
    expect(r.items[0].portion).toBe(0.75);
    expect(r.items[0].macros.kcal).toBe(488);
    expect(r.items[1].dish).toBeNull();
    expect(r.items[1].confidence).toBeLessThanOrEqual(0.6);
  });
  it('maps names when the id is wrong', () => {
    const r = parseVision('{"items":[{"name":"مندي لحم","dishId":"xyz","portion":1,"confidence":0.8}]}')!;
    expect(r.items[0].dish?.id).toBe('mandi_meat');
  });
  it('rejects garbage', () => {
    expect(parseVision('no json here')).toBeNull();
    expect(parseVision('{"items":"x"}')).toBeNull();
    expect(parseVision('{"items":[],"notFood":true}')!.notFood).toBe(true);
  });
  it('searches by alias', () => {
    expect(searchDishes('طعمية')[0].id).toBe('falafel');
  });
});
