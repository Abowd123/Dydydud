import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Check, ImagePlus, Loader2, Minus, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useSettings } from '@/store/settings';
import { compressImage } from './image';
import { recognizeMeal, type VisionError } from './foodVision';
import { PORTIONS, scaleDish, searchDishes } from './recognize';
import type { Dish } from './gulfDishes';
import { useFoodLog } from './useFoodLog';

interface Row { key: string; name: string; dish: Dish | null; portion: number; base: { kcal: number; protein: number; carbs: number; fat: number }; confidence?: number }

const rowMacros = (r: Row) => (r.dish ? scaleDish(r.dish, r.portion) : scaleDish(r.base, r.portion));
const fromDish = (d: Dish, portion = 1, confidence?: number): Row => ({ key: crypto.randomUUID(), name: d.name.ar, dish: d, portion, base: d, confidence });

/** صوّر وجبتك: كاميرا ← تحليل ← تأكيد الحصص ← سجل. وبدون نت: بحث في الأكلات الخليجية */
export function PhotoMealSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const file = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<VisionError | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const { add } = useFoodLog();

  const reset = () => { setPreview(null); setRows([]); setErr(null); setQ(''); setBusy(false); };
  const close = () => { reset(); onClose(); };

  const onPick = async (f?: File) => {
    if (!f) return;
    setErr(null); setBusy(true);
    try {
      const img = await compressImage(f);
      setPreview(img);
      const r = await recognizeMeal(img, lang);
      if (r.ok) {
        setRows(r.items.map((i) => (i.dish ? fromDish(i.dish, i.portion, i.confidence) : { key: crypto.randomUUID(), name: i.name, dish: null, portion: 1, base: i.macros, confidence: i.confidence })));
        if (!r.items.length) setErr('failed');
      } else setErr(r.error);
    } catch { setErr('failed'); }
    setBusy(false);
  };

  const setPortion = (key: string, dir: 1 | -1) =>
    setRows((rs) => rs.map((r) => {
      if (r.key !== key) return r;
      const i = PORTIONS.indexOf(r.portion as (typeof PORTIONS)[number]);
      const next = PORTIONS[Math.max(0, Math.min(PORTIONS.length - 1, (i < 0 ? 3 : i) + dir))];
      return { ...r, portion: next };
    }));

  const total = rows.reduce((s, r) => { const m = rowMacros(r); return { kcal: s.kcal + m.kcal, protein: s.protein + m.protein }; }, { kcal: 0, protein: 0 });
  const save = async () => {
    await add(rows.map((r) => ({ name: r.dish ? r.dish.name[lang] : r.name, dishId: r.dish?.id, portion: r.portion, source: preview ? 'photo' : 'manual', ...rowMacros(r) })));
    close();
  };
  const results = q ? searchDishes(q, lang).slice(0, 8) : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div role="dialog" aria-modal="true" aria-label={t('photo.title')} onClick={(e) => e.stopPropagation()}
            className="surface-lux mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[32px] p-5 pb-[calc(1.25rem+var(--safe-bottom))]"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
            <div className="mb-4 flex items-center justify-between">
              <div><p className="eyebrow">{t('photo.eyebrow')}</p><h2 className="h-title">{t('photo.title')}</h2></div>
              <button onClick={close} aria-label={t('common.close')} className="grid h-10 w-10 place-items-center rounded-xl bg-elevated"><X size={20} /></button>
            </div>

            <input ref={file} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { void onPick(e.target.files?.[0]); e.target.value = ''; }} />

            {!preview && !rows.length && (
              <div className="mb-4 grid grid-cols-2 gap-3">
                <button onClick={() => file.current?.click()} className="btn-gold flex h-32 flex-col items-center justify-center gap-2 rounded-3xl text-ink">
                  <Camera size={32} /><span className="font-semibold">{t('photo.snap')}</span>
                </button>
                <button onClick={() => { file.current?.removeAttribute('capture'); file.current?.click(); file.current?.setAttribute('capture', 'environment'); }}
                  className="flex h-32 flex-col items-center justify-center gap-2 rounded-3xl border hairline bg-elevated">
                  <ImagePlus size={30} className="text-gold" /><span className="font-semibold">{t('photo.gallery')}</span>
                </button>
              </div>
            )}

            {preview && (
              <div className="relative mb-4 overflow-hidden rounded-3xl">
                <img src={preview} alt="" className="aspect-[4/3] w-full object-cover" />
                {busy && (
                  <div className="absolute inset-0 grid place-items-center bg-black/50">
                    <span className="flex items-center gap-2 font-semibold"><Loader2 className="animate-spin text-gold" /> {t('photo.analyzing')}</span>
                  </div>
                )}
              </div>
            )}

            {err && <p role="status" className="mb-3 rounded-2xl bg-elevated p-3 text-sm text-muted">{t(`photo.err.${err}`)}</p>}

            {rows.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {rows.map((r) => {
                  const m = rowMacros(r);
                  return (
                    <div key={r.key} className="flex items-center gap-3 rounded-2xl bg-elevated p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{r.dish ? r.dish.name[lang] : r.name}
                          {!r.dish && <span className="ms-1 text-xs text-accent">({t('photo.estimate')})</span>}</p>
                        <p className="text-xs text-muted">
                          {r.dish ? `${portionLabel(r.portion, t)} ${r.dish.serving[lang]}` : portionLabel(r.portion, t)} • <b className="text-text" dir="ltr">{m.kcal}</b> kcal • {m.protein}g {t('macros.protein')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button aria-label="-" onClick={() => setPortion(r.key, -1)} className="grid h-9 w-9 place-items-center rounded-xl bg-surface"><Minus size={16} /></button>
                        <button aria-label="+" onClick={() => setPortion(r.key, 1)} className="grid h-9 w-9 place-items-center rounded-xl bg-surface"><Plus size={16} /></button>
                        <button aria-label={t('photo.remove')} onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} className="grid h-9 w-9 place-items-center rounded-xl text-muted"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!busy && (
              <div className="mb-4">
                <label className="flex h-12 items-center gap-2 rounded-2xl border hairline bg-surface px-4">
                  <Search size={18} className="text-muted" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('photo.search')} className="flex-1 bg-transparent outline-none placeholder:text-muted" />
                </label>
                {results.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {results.map((d) => (
                      <button key={d.id} onClick={() => { setRows((rs) => [...rs, fromDish(d)]); setQ(''); }}
                        className="rounded-full border hairline bg-elevated px-3 py-2 text-sm font-semibold">{d.name[lang]} <span className="text-xs text-muted" dir="ltr">{d.kcal}</span></button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {rows.length > 0 && (
              <Button size="lg" fullWidth onClick={save}>
                <Check size={20} /> {t('photo.save', { kcal: Math.round(total.kcal), p: Math.round(total.protein) })}
              </Button>
            )}
            <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-muted"><Sparkles size={12} /> {t('photo.privacy')}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function portionLabel(p: number, t: (k: string) => string) {
  const map: Record<string, string> = { '0.25': 'quarter', '0.5': 'half', '0.75': 'threeQ', '1': 'one', '1.5': 'oneHalf', '2': 'two' };
  return t(`photo.portion.${map[String(p)] ?? 'one'}`);
}
