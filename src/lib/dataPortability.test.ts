import { describe, expect, it } from 'vitest';
import { buildBackup, parseBackup, backupFileName, USER_TABLES } from './dataPortability';

describe('data portability', () => {
  it('builds a backup with every user table', () => {
    const b = buildBackup({ sessions: [{ id: 's1' }] }, { lang: 'ar' }, '2.0.0', new Date('2026-10-05T10:00:00Z'));
    expect(Object.keys(b.tables)).toHaveLength(USER_TABLES.length);
    expect(b.tables.sessions).toHaveLength(1);
    expect(b.tables.water).toEqual([]);
    expect(b.exportedAt).toBe('2026-10-05T10:00:00.000Z');
  });
  it('round-trips through JSON', () => {
    const b = buildBackup({ profile: [{ id: 'me', weight: 80 }] }, null);
    const r = parseBackup(JSON.stringify(b));
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.counts.profile).toBe(1); expect(r.backup.tables.profile[0].weight).toBe(80); }
  });
  it('rejects broken JSON and foreign files', () => {
    expect(parseBackup('{oops').ok).toBe(false);
    const r = parseBackup(JSON.stringify({ format: 'other', version: 1 }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('format');
  });
  it('rejects backups from a newer version', () => {
    const b = { ...buildBackup({}, null), version: 99 };
    expect(parseBackup(JSON.stringify(b)).ok).toBe(false);
  });
  it('drops unknown tables', () => {
    const b = buildBackup({}, null) as { tables: Record<string, unknown[]> };
    b.tables.hacker = [{ x: 1 }];
    const r = parseBackup(JSON.stringify(b));
    expect(r.ok).toBe(true);
    if (r.ok) expect('hacker' in r.backup.tables).toBe(false);
  });
  it('names the file by date', () => {
    expect(backupFileName(new Date('2026-10-05T00:00:00Z'))).toBe('gymmate-backup-2026-10-05.json');
  });
});
