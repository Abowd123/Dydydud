import { AlertTriangle, Cloud, CloudOff, LogOut, Mail, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Badge, Button, Card, CardDescription, CardTitle, Modal } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { deleteCloudData, syncNow } from '@/lib/sync/engine';
import { useSettings } from '@/store/settings';
import { useSyncStatus } from '@/store/sync';
import { uploadPendingPhotos } from '@/features/progress/lib/photos';

export function AccountPage() {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const { cloudPhotos, setPref } = useSettings();
  const auth = useAuth();
  const sync = useSyncStatus();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!auth.enabled)
    return (
      <PageTransition>
        <TopBar back title={t('account.title')} />
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <CloudOff size={40} className="text-muted" />
          <CardTitle>{t('account.localTitle')}</CardTitle>
          <CardDescription>{t('account.localDesc')}</CardDescription>
          <Badge tone="muted">VITE_SUPABASE_URL</Badge>
        </Card>
      </PageTransition>
    );

  const run = async (fn: () => Promise<{ error: { message: string } | null }>, ok?: () => void) => {
    setBusy(true); setMsg(null);
    const { error } = await fn();
    setBusy(false);
    if (error) setMsg(error.message); else ok?.();
  };

  const stateTone = { idle: 'primary', syncing: 'water', offline: 'muted', error: 'danger', local: 'muted' } as const;

  return (
    <PageTransition>
      <TopBar back title={t('account.title')} />
      {!auth.user ? (
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15"><Cloud className="text-primary" /></span>
            <div><CardTitle>{t('account.signInTitle')}</CardTitle><CardDescription>{t('account.signInDesc')}</CardDescription></div>
          </div>
          {step === 'email' ? (
            <>
              <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" dir="ltr"
                className="h-12 rounded-2xl border border-border bg-elevated px-4 outline-none focus:border-primary" />
              <Button loading={busy} disabled={!/^\S+@\S+\.\S+$/.test(email)} onClick={() => run(() => auth.sendCode(email), () => setStep('code'))}>
                <Mail size={18} /> {t('account.sendCode')}
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted"><span className="h-px flex-1 bg-border" />{t('account.or')}<span className="h-px flex-1 bg-border" /></div>
              <Button variant="secondary" onClick={() => run(() => auth.google())}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
                {t('account.google')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">{t('account.codeSent', { email })}</p>
              <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••••" dir="ltr"
                className="h-14 rounded-2xl border border-border bg-elevated px-4 text-center font-display text-3xl tracking-[0.5em] outline-none focus:border-primary" />
              <Button loading={busy} disabled={code.length !== 6} onClick={() => run(() => auth.verifyCode(email, code))}>{t('account.verify')}</Button>
              <button className="text-sm text-muted underline" onClick={() => { setStep('email'); setCode(''); }}>{t('account.changeEmail')}</button>
            </>
          )}
          {msg && <p className="text-center text-sm text-danger">{msg}</p>}
          <p className="flex items-center justify-center gap-1 text-center text-xs text-muted"><ShieldCheck size={14} /> {t('account.privacy')}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-grad-primary text-lg font-extrabold text-ink">{auth.user.email?.[0]?.toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold" dir="ltr">{auth.user.email}</p>
              <Badge tone={stateTone[sync.state]}>{t(`account.state.${sync.state}`)}</Badge>
            </div>
          </Card>
          <Card className="flex flex-col gap-2">
            <div className="flex justify-between text-sm"><span className="text-muted">{t('account.lastSync')}</span>
              <b>{sync.lastSyncAt ? new Date(sync.lastSyncAt).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) : '—'}</b></div>
            <div className="flex justify-between text-sm"><span className="text-muted">{t('account.pending')}</span><b>{sync.pending}</b></div>
            {sync.error && <p className="text-xs text-danger" dir="ltr">{sync.error}</p>}
            <Button variant="secondary" loading={sync.state === 'syncing'} onClick={() => void syncNow()}><RefreshCw size={18} /> {t('account.syncNow')}</Button>
          </Card>
          <Card>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span><span className="block font-bold">{t('account.cloudPhotos')}</span><span className="block text-xs text-muted">{t('account.cloudPhotosD')}</span></span>
              <input type="checkbox" className="h-6 w-6 accent-[#D4AF6A]" checked={cloudPhotos}
                onChange={(e) => { setPref('cloudPhotos', e.target.checked); if (e.target.checked) void uploadPendingPhotos(); }} />
            </label>
          </Card>
          <Button variant="secondary" onClick={() => void auth.signOut()}><LogOut size={18} /> {t('account.signOut')}</Button>
          <Button variant="ghost" className="text-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={18} /> {t('account.deleteCloud')}</Button>
        </div>
      )}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t('account.deleteCloud')}>
        <p className="mb-4 flex gap-2 text-sm text-muted"><AlertTriangle className="shrink-0 text-danger" size={18} /> {t('account.deleteWarn')}</p>
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)}>{t('common.cancel')}</Button>
          <Button variant="danger" fullWidth onClick={async () => { await deleteCloudData(); await auth.signOut(); setConfirmDelete(false); }}>{t('common.confirm')}</Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
