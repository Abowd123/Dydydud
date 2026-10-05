import { Camera, Cloud, GitCompare, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, SegmentedControl } from '@/components/ui';
import type { ProgressPhoto } from '@/lib/db';
import { useSettings } from '@/store/settings';
import { addPhoto, deletePhoto, photoUrl } from '../lib/photos';
import { usePhotos } from '../lib/useProgress';
import { BeforeAfter } from './BeforeAfter';
import { ChartCard } from './ChartCard';

type Pose = ProgressPhoto['pose'];

function Thumb({ p, onClick }: { p: ProgressPhoto; onClick: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { void photoUrl(p).then(setUrl); }, [p]);
  return (
    <button onClick={onClick} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-elevated">
      {url && <img src={url} alt={p.date} className="h-full w-full object-cover" loading="lazy" />}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-1 text-xs font-bold text-white">{p.date.slice(5)}</span>
      {p.remotePath && <Cloud size={12} className="absolute end-1 top-1 text-white" />}
    </button>
  );
}

export function PhotosCard() {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const photos = usePhotos();
  const [pose, setPose] = useState<Pose>('front');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<ProgressPhoto | null>(null);
  const [compare, setCompare] = useState<[string, string] | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = photos.filter((p) => p.pose === pose);

  const openCompare = async () => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const [a, b] = [sorted[0], sorted[sorted.length - 1]];
    const [ua, ub] = await Promise.all([photoUrl(a), photoUrl(b)]);
    if (ua && ub) setCompare([ua, ub]);
  };
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  useEffect(() => { if (view) void photoUrl(view).then(setViewUrl); }, [view]);

  return (
    <ChartCard title={t('progress.photos')} icon={<Camera size={18} className="text-primary" />}>
      <div dir="auto" className="flex flex-col gap-3">
        <SegmentedControl<Pose> id="pose" value={pose} onChange={setPose}
          options={[{ value: 'front', label: t('progress.pose.front') }, { value: 'side', label: t('progress.pose.side') }, { value: 'back', label: t('progress.pose.back') }]} />
        {list.length ? (
          <div className="grid grid-cols-4 gap-2">{list.slice(0, 12).map((p) => <Thumb key={p.id} p={p} onClick={() => setView(p)} />)}</div>
        ) : (
          <p className="py-4 text-center text-sm text-muted">{t('progress.photosEmpty')}</p>
        )}
        <div className="flex gap-2">
          <Button fullWidth loading={busy} onClick={() => input.current?.click()}><Camera size={18} /> {t('progress.addPhoto')}</Button>
          {list.length >= 2 && <Button variant="secondary" onClick={openCompare}><GitCompare size={18} /> {t('progress.compare')}</Button>}
        </div>
        <p className="text-center text-xs text-muted">🔒 {t('progress.photosPrivacy')}</p>
        <input ref={input} type="file" accept="image/*" capture="user" hidden
          onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; setBusy(true); try { await addPhoto(f, pose); } finally { setBusy(false); } }} />
      </div>

      <Modal open={!!view} onClose={() => { setView(null); setViewUrl(null); }} title={view ? new Date(view.date).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' }) : ''}>
        {viewUrl && <img src={viewUrl} alt="" className="mb-3 max-h-[60dvh] w-full rounded-2xl object-contain" />}
        <Button variant="danger" fullWidth onClick={async () => { if (view) await deletePhoto(view); setView(null); }}><Trash2 size={18} /> {t('progress.deletePhoto')}</Button>
      </Modal>
      <Modal open={!!compare} onClose={() => setCompare(null)} title={t('progress.compare')}>
        {compare && <BeforeAfter before={compare[0]} after={compare[1]} labels={[t('progress.before'), t('progress.after')]} />}
      </Modal>
    </ChartCard>
  );
}
