import { AlertTriangle, Download, FileText, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Button, Card, Modal } from '@/components/ui';
import { parseBackup, type Backup } from '@/lib/dataPortability';
import { exportAll, importAll, wipeAll } from '@/lib/dataStore';

/** "بياناتي": تصدير، استيراد، ومسح. شرط من Google Play و App Store */
export function DataPage() {
  const { t } = useTranslation();
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<{ b: Backup; n: number } | null>(null);
  const [wipe, setWipe] = useState(false);

  const onFile = async (f?: File) => {
    if (!f) return;
    const r = parseBackup(await f.text());
    if (!r.ok) return setMsg(t('data.badFile'));
    setPending({ b: r.backup, n: Object.values(r.counts).reduce((a, x) => a + x, 0) });
  };

  return (
    <PageTransition>
      <TopBar title={t('data.title')} back />
      <Card variant="hero" className="mb-4 flex gap-3">
        <ShieldCheck className="shrink-0 text-gold" size={28} />
        <p className="leading-relaxed">{t('data.intro')}</p>
      </Card>

      <div className="flex flex-col gap-3">
        <Button size="lg" fullWidth loading={busy === 'exp'} onClick={async () => { setBusy('exp'); try { await exportAll(); setMsg(t('data.exported')); } finally { setBusy(null); } }}>
          <Download size={20} /> {t('data.export')}
        </Button>
        <Button size="lg" variant="secondary" fullWidth onClick={() => file.current?.click()}><Upload size={20} /> {t('data.import')}</Button>
        <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
        {msg && <p role="status" className="text-center text-sm text-gold">{msg}</p>}
      </div>

      <Card className="mt-6 divide-y divide-border p-0">
        <Link to="/privacy" className="flex items-center gap-3 px-4 py-4"><FileText size={20} className="text-gold" /><span className="flex-1 font-semibold">{t('legal.privacy')}</span></Link>
        <Link to="/terms" className="flex items-center gap-3 px-4 py-4"><FileText size={20} className="text-gold" /><span className="flex-1 font-semibold">{t('legal.terms')}</span></Link>
      </Card>

      <Button variant="ghost" className="mt-6 w-full text-danger" onClick={() => setWipe(true)}><Trash2 size={18} /> {t('data.wipe')}</Button>

      <Modal open={!!pending} onClose={() => setPending(null)} title={t('data.import')}>
        <p className="mb-4 text-muted">{t('data.importWarn', { n: pending?.n ?? 0 })}</p>
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => setPending(null)}>{t('common.cancel')}</Button>
          <Button fullWidth loading={busy === 'imp'} onClick={async () => { if (!pending) return; setBusy('imp'); await importAll(pending.b); location.replace('/'); }}>{t('common.confirm')}</Button>
        </div>
      </Modal>

      <Modal open={wipe} onClose={() => setWipe(false)} title={t('data.wipe')}>
        <p className="mb-4 flex gap-2 text-muted"><AlertTriangle className="shrink-0 text-danger" size={18} /> {t('data.wipeWarn')}</p>
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => setWipe(false)}>{t('common.cancel')}</Button>
          <Button variant="danger" fullWidth loading={busy === 'wipe'} onClick={async () => { setBusy('wipe'); await wipeAll(); location.replace('/welcome'); }}>{t('data.wipeConfirm')}</Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
