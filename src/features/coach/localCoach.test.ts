import { describe, expect, it } from 'vitest';
import { detectIntent, findExercise, localCoach } from './localCoach';

const ctx = { lang: 'ar' as const, targets: { calories: 2200, proteinG: 160, carbsG: 220, fatG: 60, waterMl: 2800 } };

describe('local coach', () => {
  it('detects intents', () => {
    expect(detectIntent('كم بروتين أحتاج؟')).toBe('protein');
    expect(detectIntent('وزني ثابت ما ينزل')).toBe('plateau');
    expect(detectIntent('أنا تعبان اليوم')).toBe('tired');
    expect(detectIntent('عضلاتي متكسرة')).toBe('sore');
  });
  it('finds exercises by Arabic/English name', () => {
    expect(findExercise('كيف أسوي السكوات بالبار')?.id).toBe('back-squat');
    expect(findExercise('how to do a deadlift')?.id).toBe('deadlift');
  });
  it('answers with personal targets', () => {
    expect(localCoach('كم بروتين؟', ctx).text).toContain('160');
  });
  it('explains exercise form', () => {
    const r = localCoach('كيف أسوي بنش بريس بالبار', ctx);
    expect(r.text).toContain('1.');
    expect(r.actions?.[0].to).toBe('/exercises/barbell-bench-press');
  });
  it('safety first', () => {
    expect(localCoach('عندي ألم بالصدر', ctx).source).toBe('safety');
  });
  it('fallback for unknown', () => {
    expect(localCoach('وش لون السيارة', ctx).text).toContain('🤔');
  });
});
