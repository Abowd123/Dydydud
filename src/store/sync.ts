import { create } from 'zustand';

export type SyncState = 'local' | 'idle' | 'syncing' | 'offline' | 'error';
interface S { state: SyncState; lastSyncAt: number | null; pending: number; error?: string; set: (p: Partial<Omit<S, 'set'>>) => void }

export const useSyncStatus = create<S>()((set) => ({ state: 'local', lastSyncAt: null, pending: 0, set: (p) => set(p) }));
