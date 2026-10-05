import { describe, expect, it } from 'vitest';
import { buildSystemPrompt, detectRedFlags, topFlag, trimHistory } from './coach';

describe('coach safety', () => {
  it('detects emergencies in Arabic (with hamza variations)', () => {
    expect(detectRedFlags('عندي ألم في الصدر وأنا أتمرن')).toContain('emergency');
    expect(detectRedFlags('حسيت بدوخة شديدة')).toContain('emergency');
  });
  it('detects injuries', () => {
    expect(detectRedFlags('ركبتي فيها ألم حاد بعد السكوات')).toContain('injury');
    expect(detectRedFlags('my shoulder has sharp pain')).toContain('injury');
  });
  it('detects steroids & eating disorders', () => {
    expect(detectRedFlags('وش رأيك بالستيرويد')).toContain('drugs');
    expect(detectRedFlags('أبي آكل 500 سعرة بس')).toContain('eating');
  });
  it('normal questions are clean', () => {
    expect(detectRedFlags('كم بروتين أحتاج؟')).toEqual([]);
    expect(detectRedFlags('عضلاتي متكسرة بعد أمس')).toEqual([]);
  });
  it('prioritizes emergency', () => expect(topFlag(['medical', 'emergency'])).toBe('emergency'));
});

describe('coach prompt & history', () => {
  it('includes user data', () => {
    const p = buildSystemPrompt({ lang: 'ar', targets: { calories: 2200, proteinG: 160, carbsG: 220, fatG: 60, waterMl: 2800 }, readiness: 40 });
    expect(p).toContain('2200 kcal');
    expect(p).toContain('40/100');
  });
  it('trims history and starts with user', () => {
    const msgs = Array.from({ length: 30 }, (_, i) => ({ role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', content: 'x'.repeat(100) }));
    const t = trimHistory(msgs);
    expect(t.length).toBeLessThanOrEqual(12);
    expect(t[0].role).toBe('user');
  });
});
