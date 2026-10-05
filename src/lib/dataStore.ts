import { db } from '@/lib/db';
import { buildBackup, backupFileName, USER_TABLES, type Backup } from './dataPortability';

const SETTINGS_KEY = 'gymmate-settings';
type AnyTable = { toArray(): Promise<unknown[]>; clear(): Promise<void>; bulkPut(rows: unknown[]): Promise<unknown> };
const table = (name: string) => (db as unknown as Record<string, AnyTable>)[name];

export async function exportAll(): Promise<void> {
  const tables: Record<string, unknown[]> = {};
  for (const t of USER_TABLES) tables[t] = table(t) ? await table(t).toArray() : [];
  // الصور تكون Blob: نحولها base64 عشان تنحفظ في JSON
  tables.photos = await Promise.all((tables.photos as Record<string, unknown>[]).map(async (p) => ({ ...p, blob: p.blob instanceof Blob ? await blobToDataUrl(p.blob) : p.blob })));
  const raw = localStorage.getItem(SETTINGS_KEY);
  const backup = buildBackup(tables, raw ? JSON.parse(raw) : null, __APP_VERSION__);
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: backupFileName() });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function importAll(b: Backup): Promise<void> {
  await db.transaction('rw', USER_TABLES.filter((t) => table(t)).map((t) => table(t) as never), async () => {
    for (const t of USER_TABLES) {
      if (!table(t)) continue;
      let rows = b.tables[t] ?? [];
      if (t === 'photos') rows = await Promise.all(rows.map(async (p) => ({ ...p, blob: typeof p.blob === 'string' ? await (await fetch(p.blob)).blob() : p.blob })));
      await table(t).clear();
      if (rows.length) await table(t).bulkPut(rows);
    }
  });
  if (b.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(b.settings));
}

/** يمسح كل شي محلي: القاعدة، الإعدادات، والكاش. البيانات السحابية تنحذف من صفحة الحساب */
export async function wipeAll(): Promise<void> {
  await db.delete();
  localStorage.clear();
  if ('caches' in window) for (const k of await caches.keys()) await caches.delete(k);
}

function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(b); });
}
