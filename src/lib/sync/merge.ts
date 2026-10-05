/**
 * منطق المزامنة (Pure): Offline-first مع "آخر كتابة تفوز" (Last-Write-Wins).
 * كل تغيير محلي ينحفظ في outbox، وينرفع لجدول records واحد في Supabase.
 */
export const SYNCED_TABLES = ['profile', 'programs', 'sessions', 'mealPlans', 'water', 'favorites', 'bodyMetrics', 'photos', 'checkins', 'challenges', 'foodLogs'] as const;
export type SyncedTable = (typeof SYNCED_TABLES)[number];

export interface OutboxItem { table: SyncedTable; key: string; at: number }

export interface RemoteRecord {
  user_id: string;
  table_name: SyncedTable;
  key: string;
  data: unknown | null;
  deleted: boolean;
  updated_at: string; // ISO من السيرفر
}

export type PullAction =
  | { type: 'put'; table: SyncedTable; data: unknown }
  | { type: 'delete'; table: SyncedTable; key: string }
  | { type: 'skip'; table: SyncedTable; key: string; reason: 'localNewer' };

export const outboxId = (table: string, key: string) => `${table}::${key}`;

/** يحوّل السجلات اللي نزلت من السيرفر لأوامر، ويحمي التغييرات المحلية الأحدث */
export function planPull(remote: RemoteRecord[], pending: OutboxItem[]): PullAction[] {
  const pend = new Map(pending.map((p) => [outboxId(p.table, p.key), p.at]));
  const latest = new Map<string, RemoteRecord>();
  for (const r of remote) {
    const id = outboxId(r.table_name, r.key);
    const cur = latest.get(id);
    if (!cur || cur.updated_at < r.updated_at) latest.set(id, r);
  }
  return [...latest.values()].map((r): PullAction => {
    const localAt = pend.get(outboxId(r.table_name, r.key));
    if (localAt !== undefined && localAt > Date.parse(r.updated_at)) return { type: 'skip', table: r.table_name, key: r.key, reason: 'localNewer' };
    if (r.deleted || r.data == null) return { type: 'delete', table: r.table_name, key: r.key };
    return { type: 'put', table: r.table_name, data: r.data };
  });
}

/** يجهز دفعة الرفع: لو السجل انحذف محلياً نرسله كمحذوف */
export function buildPush(items: OutboxItem[], rows: Map<string, unknown | undefined>, userId: string) {
  const dedup = new Map<string, OutboxItem>();
  for (const it of items) {
    const id = outboxId(it.table, it.key);
    const cur = dedup.get(id);
    if (!cur || cur.at < it.at) dedup.set(id, it);
  }
  return [...dedup.values()].map((it) => {
    const data = rows.get(outboxId(it.table, it.key));
    return { user_id: userId, table_name: it.table, key: it.key, data: data ?? null, deleted: data === undefined };
  });
}

export const maxCursor = (rows: RemoteRecord[], current: string | null) =>
  rows.reduce<string | null>((m, r) => (!m || r.updated_at > m ? r.updated_at : m), current);

/** الصور: نرفع البيانات الوصفية بس، والصورة نفسها في Storage (لو المستخدم وافق) */
export function stripForSync(table: SyncedTable, row: unknown): unknown {
  if (table !== 'photos' || !row || typeof row !== 'object') return row;
  const { blob: _blob, ...meta } = row as Record<string, unknown>;
  void _blob;
  return meta;
}
