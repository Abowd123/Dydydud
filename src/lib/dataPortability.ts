import { z } from 'zod';

/** نسخة احتياطية كاملة لبيانات المستخدم (حق نقل البيانات + سياسة المتاجر) */
export const BACKUP_FORMAT = 'gymmate-backup';
export const BACKUP_VERSION = 1;

/** الجداول اللي تخص المستخدم. التمارين والأكل بيانات عامة تنزرع من جديد فما نصدرها */
export const USER_TABLES = ['favorites', 'profile', 'programs', 'mealPlans', 'water', 'bodyMetrics', 'photos', 'checkins', 'challenges', 'coachMessages', 'sessions', 'foodLogs'] as const;
export type UserTable = (typeof USER_TABLES)[number];

export const backupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.number().int().min(1).max(BACKUP_VERSION),
  exportedAt: z.string(),
  appVersion: z.string().optional(),
  settings: z.record(z.unknown()).nullable(),
  tables: z.record(z.array(z.record(z.unknown())))
});
export type Backup = z.infer<typeof backupSchema>;

export function buildBackup(tables: Partial<Record<UserTable, unknown[]>>, settings: Record<string, unknown> | null, appVersion?: string, now = new Date()): Backup {
  const clean: Record<string, Record<string, unknown>[]> = {};
  for (const t of USER_TABLES) clean[t] = ((tables[t] ?? []) as Record<string, unknown>[]).map((r) => ({ ...r }));
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now.toISOString(), appVersion, settings, tables: clean };
}

export type ParseResult = { ok: true; backup: Backup; counts: Record<string, number> } | { ok: false; error: 'json' | 'format' };

export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return { ok: false, error: 'json' }; }
  const r = backupSchema.safeParse(raw);
  if (!r.success) return { ok: false, error: 'format' };
  // نتجاهل أي جدول غير معروف
  const tables: Backup['tables'] = {};
  const counts: Record<string, number> = {};
  for (const t of USER_TABLES) { tables[t] = r.data.tables[t] ?? []; counts[t] = tables[t].length; }
  return { ok: true, backup: { ...r.data, tables }, counts };
}

export const backupFileName = (d = new Date()) => `gymmate-backup-${d.toISOString().slice(0, 10)}.json`;
