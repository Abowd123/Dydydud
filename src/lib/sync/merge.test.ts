import { describe, expect, it } from 'vitest';
import { buildPush, maxCursor, planPull, stripForSync, type RemoteRecord } from './merge';

const rec = (key: string, updated: string, data: unknown = { id: key }, deleted = false): RemoteRecord =>
  ({ user_id: 'u1', table_name: 'sessions', key, data, deleted, updated_at: updated });

describe('sync merge', () => {
  it('puts new remote rows', () => {
    expect(planPull([rec('a', '2026-12-14T10:00:00Z')], [])).toEqual([{ type: 'put', table: 'sessions', data: { id: 'a' } }]);
  });
  it('deletes rows marked deleted', () => {
    expect(planPull([rec('a', '2026-12-14T10:00:00Z', null, true)], [])[0]).toEqual({ type: 'delete', table: 'sessions', key: 'a' });
  });
  it('keeps local change when it is newer than remote', () => {
    const at = Date.parse('2026-12-14T11:00:00Z');
    expect(planPull([rec('a', '2026-12-14T10:00:00Z')], [{ table: 'sessions', key: 'a', at }])[0].type).toBe('skip');
  });
  it('remote wins when newer than pending local change', () => {
    const at = Date.parse('2026-12-14T09:00:00Z');
    expect(planPull([rec('a', '2026-12-14T10:00:00Z')], [{ table: 'sessions', key: 'a', at }])[0].type).toBe('put');
  });
  it('uses only the latest version of a key', () => {
    const r = planPull([rec('a', '2026-12-14T10:00:00Z', { v: 1 }), rec('a', '2026-12-14T12:00:00Z', { v: 2 })], []);
    expect(r).toHaveLength(1);
    expect(r[0]).toEqual({ type: 'put', table: 'sessions', data: { v: 2 } });
  });
  it('builds push batch with dedup and deletions', () => {
    const rows = new Map<string, unknown>([['sessions::a', { id: 'a' }]]);
    const out = buildPush([{ table: 'sessions', key: 'a', at: 1 }, { table: 'sessions', key: 'a', at: 2 }, { table: 'sessions', key: 'b', at: 3 }], rows, 'u1');
    expect(out).toHaveLength(2);
    expect(out.find((x) => x.key === 'b')!.deleted).toBe(true);
    expect(out.find((x) => x.key === 'a')!.data).toEqual({ id: 'a' });
  });
  it('advances cursor', () => {
    expect(maxCursor([rec('a', '2026-12-14T10:00:00Z'), rec('b', '2026-12-14T12:00:00Z')], null)).toBe('2026-12-14T12:00:00Z');
    expect(maxCursor([], '2026-01-01T00:00:00Z')).toBe('2026-01-01T00:00:00Z');
  });
  it('never uploads photo blobs in records', () => {
    expect(stripForSync('photos', { id: 'p', blob: 'BINARY', date: 'x' })).toEqual({ id: 'p', date: 'x' });
    expect(stripForSync('sessions', { id: 's' })).toEqual({ id: 's' });
  });
});
