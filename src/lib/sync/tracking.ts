import type { Transaction } from 'dexie';
import { db } from '@/lib/db';
import { outboxId, SYNCED_TABLES, type SyncedTable } from './merge';

/** لما نطبق تغييرات نازلة من السيرفر، ما نبيها ترجع للـ outbox */
let applyingRemote = false;
export async function withRemoteApply<T>(fn: () => Promise<T>): Promise<T> {
  applyingRemote = true;
  try {
    return await fn();
  } finally {
    applyingRemote = false;
  }
}

const listeners = new Set<() => void>();
export const onLocalChange = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function enqueue(table: SyncedTable, key: unknown, trans: Transaction) {
  if (applyingRemote || key == null) return;
  const k = String(key);
  // نكتب بعد ما تخلص المعاملة الأصلية (outbox مو جزء منها)
  trans.on('complete', () => {
    void db.outbox.put({ id: outboxId(table, k), table, key: k, at: Date.now() }).then(() => listeners.forEach((l) => l()));
  });
}

let installed = false;
/** يركّب Dexie hooks على كل الجداول المتزامنة: أي كتابة تنضاف للـ outbox تلقائياً */
export function installSyncTracking() {
  if (installed) return;
  installed = true;
  for (const name of SYNCED_TABLES) {
    const table = db.table(name);
    const pk = table.schema.primKey.keyPath as string;
    table.hook('creating', (primKey, obj, trans) => enqueue(name, primKey ?? (obj as Record<string, unknown>)[pk], trans));
    table.hook('updating', (_mods, primKey, _obj, trans) => enqueue(name, primKey, trans));
    table.hook('deleting', (primKey, _obj, trans) => enqueue(name, primKey, trans));
  }
}

/** أول تسجيل دخول: نرفع كل البيانات المحلية */
export async function enqueueAll() {
  const now = Date.now();
  for (const name of SYNCED_TABLES) {
    const keys = (await db.table(name).toCollection().primaryKeys()) as unknown[];
    await db.outbox.bulkPut(keys.map((k) => ({ id: outboxId(name, String(k)), table: name, key: String(k), at: now })));
  }
}
