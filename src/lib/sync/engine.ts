import type { Session } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { useSyncStatus } from '@/store/sync';
import { buildPush, maxCursor, outboxId, planPull, stripForSync, type OutboxItem, type RemoteRecord, type SyncedTable } from './merge';
import { enqueueAll, installSyncTracking, onLocalChange, withRemoteApply } from './tracking';

const PAGE = 500;
let running: Promise<void> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let currentUser: string | null = null;

const status = (p: Parameters<ReturnType<typeof useSyncStatus.getState>['set']>[0]) => useSyncStatus.getState().set(p);
const getMeta = async (k: string) => (await db.meta.get(k))?.value ?? null;
const setMeta = (k: string, v: string) => db.meta.put({ key: k, value: v });

async function push(userId: string) {
  const items = await db.outbox.toArray();
  if (!items.length) return;
  const rows = new Map<string, unknown>();
  for (const it of items) {
    const row = await db.table(it.table).get(it.key);
    if (row !== undefined) rows.set(outboxId(it.table, it.key), stripForSync(it.table as SyncedTable, row));
  }
  const batch = buildPush(items as OutboxItem[], rows, userId);
  for (let i = 0; i < batch.length; i += PAGE) {
    const { error } = await supabase!.from('records').upsert(batch.slice(i, i + PAGE), { onConflict: 'user_id,table_name,key' });
    if (error) throw error;
  }
  // نحذف بس اللي ما تغير بعد ما بدأنا الرفع
  await db.transaction('rw', db.outbox, async () => {
    for (const it of items) {
      const cur = await db.outbox.get(it.id);
      if (cur && cur.at === it.at) await db.outbox.delete(it.id);
    }
  });
}

async function pull() {
  let cursor = await getMeta('syncCursor');
  for (;;) {
    let q = supabase!.from('records').select('*').order('updated_at', { ascending: true }).limit(PAGE);
    if (cursor) q = q.gt('updated_at', cursor);
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []) as RemoteRecord[];
    if (!rows.length) break;
    const pending = await db.outbox.toArray();
    const actions = planPull(rows, pending);
    await withRemoteApply(async () => {
      for (const a of actions) {
        if (a.type === 'put') {
          const tbl = db.table(a.table);
          if (a.table === 'photos') {
            // نحافظ على الصورة المحلية لو موجودة
            const local = await tbl.get((a.data as { id: string }).id);
            await tbl.put({ ...(a.data as object), blob: local?.blob });
          } else await tbl.put(a.data);
        } else if (a.type === 'delete') await db.table(a.table).delete(a.key);
      }
    });
    cursor = maxCursor(rows, cursor);
    if (cursor) await setMeta('syncCursor', cursor);
    if (rows.length < PAGE) break;
  }
}

export async function syncNow() {
  if (!supabase || !currentUser) return;
  if (!navigator.onLine) return status({ state: 'offline' });
  if (running) return running;
  running = (async () => {
    status({ state: 'syncing', error: undefined });
    try {
      await push(currentUser!);
      await pull();
      status({ state: 'idle', lastSyncAt: Date.now(), pending: await db.outbox.count() });
    } catch (e) {
      status({ state: 'error', error: e instanceof Error ? e.message : String(e) });
    } finally {
      running = null;
    }
  })();
  return running;
}

const schedule = (ms = 3000) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void syncNow(), ms);
};

async function onSession(session: Session | null) {
  const uid = session?.user.id ?? null;
  currentUser = uid;
  if (!uid) return status({ state: 'local', pending: await db.outbox.count() });
  // مستخدم جديد على هذا الجهاز: نرفع كل شي ونبدأ السحب من الصفر
  if ((await getMeta('syncUser')) !== uid) {
    await enqueueAll();
    await db.meta.delete('syncCursor');
    await setMeta('syncUser', uid);
  }
  await syncNow();
}

/** ينادى مرة وحدة من main.tsx */
export function startSync() {
  installSyncTracking();
  if (!supabase) return;
  supabase.auth.getSession().then(({ data }) => onSession(data.session));
  supabase.auth.onAuthStateChange((_e, session) => {
    if ((session?.user.id ?? null) !== currentUser) void onSession(session);
  });
  onLocalChange(async () => {
    status({ pending: await db.outbox.count() });
    if (currentUser) schedule();
  });
  window.addEventListener('online', () => schedule(500));
  window.addEventListener('offline', () => status({ state: 'offline' }));
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && schedule(500));
  setInterval(() => document.visibilityState === 'visible' && void syncNow(), 120_000);
}

/** حذف كل بياناتي من السحابة (الخصوصية) */
export async function deleteCloudData() {
  if (!supabase || !currentUser) return;
  await supabase.from('records').delete().eq('user_id', currentUser);
  await supabase.storage.from('progress-photos').list(currentUser).then(async ({ data }) => {
    if (data?.length) await supabase!.storage.from('progress-photos').remove(data.map((f) => `${currentUser}/${f.name}`));
  });
  await supabase.from('push_subscriptions').delete().eq('user_id', currentUser);
}

export const getCurrentUserId = () => currentUser;
