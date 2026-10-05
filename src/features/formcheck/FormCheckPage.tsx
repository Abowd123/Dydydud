import { AnimatePresence, motion } from 'framer-motion';
import { Camera, CameraOff, RotateCcw, ScanLine, ShieldCheck, SwitchCamera, Volume2, VolumeX, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, ProgressRing } from '@/components/ui';
import { getExercise } from '@/features/exercises/lib/repository';
import { useSettings } from '@/store/settings';
import { FORM_SUPPORTED, FormAnalyzer, type Cue, type RepResult } from './analyzer';
import { createPoseEngine, drawPose, speak, type PoseEngine } from './poseEngine';

type Status = 'idle' | 'loading' | 'running' | 'denied' | 'error' | 'done';

/** فحص الأداء: كاميرا + هيكل ذهبي + عداد تكرارات + ملاحظات صوتية. كله على الجهاز */
export function FormCheckPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const nav = useNavigate();
  const lang = useSettings((s) => s.lang);
  const voice = useSettings((s) => s.formVoice);
  const setPref = useSettings((s) => s.setPref);
  const ex = getExercise(id);
  const movement = FORM_SUPPORTED[id];

  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<PoseEngine | null>(null);
  const analyzer = useRef<FormAnalyzer | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const [status, setStatus] = useState<Status>('idle');
  const [facing, setFacing] = useState<'user' | 'environment'>('environment');
  const [reps, setReps] = useState<RepResult[]>([]);
  const [live, setLive] = useState<Cue | null>(null);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((tr) => tr.stop());
    stream.current = null;
  }, []);

  useEffect(() => () => { stop(); engine.current?.close(); }, [stop]);

  const say = useCallback((c: Cue) => { if (voice) speak(t(`form.cue.${c}`), lang); }, [voice, lang, t]);

  const start = async () => {
    setStatus('loading');
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    } catch {
      setStatus('denied');
      return;
    }
    try {
      engine.current ??= await createPoseEngine();
    } catch {
      stop();
      setStatus('error');
      return;
    }
    const v = video.current!;
    v.srcObject = stream.current;
    await v.play();
    analyzer.current = new FormAnalyzer(movement);
    setReps([]);
    setStatus('running');
    if (voice) speak(t('form.go'), lang, 0);

    const loop = () => {
      const c = canvas.current;
      if (!c || !engine.current || !analyzer.current) return;
      if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
      const now = performance.now();
      const pose = engine.current.detect(v, now);
      const r = analyzer.current.frame(pose, now);
      const ctx = c.getContext('2d')!;
      drawPose(ctx, pose, c.width, c.height, r.live && r.live !== 'goodRep' ? '#E0823F' : '#D4AF6A');
      if (r.rep) {
        const rep = r.rep;
        setReps((x) => [...x, rep]);
        const main = rep.cues[0];
        if (voice) speak(main === 'goodRep' ? `${rep.n}` : `${rep.n}. ${t(`form.cue.${main}`)}`, lang, 0);
      } else if (r.live) {
        setLive(r.live);
        say(r.live);
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };

  const finish = () => { stop(); setStatus('done'); };

  if (!ex || !movement) return <Navigate to="/exercises" replace />;
  const last = reps[reps.length - 1];
  const summary = analyzer.current?.summary();
  const mirrored = facing === 'user';

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-text">
      <video ref={video} playsInline muted className={`absolute inset-0 h-full w-full object-cover ${mirrored ? '-scale-x-100' : ''} ${status === 'running' ? '' : 'opacity-0'}`} />
      <canvas ref={canvas} className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${mirrored ? '-scale-x-100' : ''}`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />

      {/* الشريط العلوي */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button onClick={() => { stop(); nav(-1); }} aria-label={t('common.close')} className="glass grid h-11 w-11 place-items-center rounded-xl"><X size={20} /></button>
        <div className="flex-1">
          <p className="eyebrow">{t('form.eyebrow')}</p>
          <h1 className="font-heading text-lg font-bold leading-tight">{ex.name[lang]}</h1>
        </div>
        <button onClick={() => setPref('formVoice', !voice)} aria-label={t('form.voice')} className="glass grid h-11 w-11 place-items-center rounded-xl">
          {voice ? <Volume2 size={20} className="text-gold" /> : <VolumeX size={20} />}
        </button>
      </header>

      {status === 'running' && (
        <>
          <div className="absolute inset-x-0 top-24 z-10 flex flex-col items-center">
            <motion.span key={reps.length} initial={{ scale: 1.4, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }}
              className="font-display text-[96px] font-semibold leading-none text-gradient drop-shadow-lg" dir="ltr">{reps.length}</motion.span>
            <span className="text-sm text-muted">{t('form.reps')}</span>
          </div>
          <AnimatePresence mode="wait">
            {(live || last) && (
              <motion.div key={live ?? last?.n} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-x-4 bottom-32 z-10 flex items-center gap-3 rounded-3xl glass p-3">
                {last && <ProgressRing value={last.score / 100} size={64} stroke={6} ticks={false} color={last.score >= 80 ? '#D4AF6A' : '#E0823F'} label={last.score} />}
                <p className="flex-1 font-semibold">{t(`form.cue.${live && live !== 'visible' ? live : last ? last.cues[0] : 'visible'}`)}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-x-4 bottom-6 z-10 flex gap-3 pb-[env(safe-area-inset-bottom)]">
            <Button size="lg" variant="secondary" aria-label={t('form.flip')} onClick={() => { stop(); setFacing((f) => (f === 'user' ? 'environment' : 'user')); setStatus('idle'); }}><SwitchCamera size={20} /></Button>
            <Button size="lg" fullWidth onClick={finish}>{t('form.finish')}</Button>
          </div>
        </>
      )}

      {(status === 'idle' || status === 'loading' || status === 'denied' || status === 'error') && (
        <section className="relative z-10 flex min-h-dvh flex-col justify-end gap-4 p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="surface-lux rounded-3xl p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="btn-gold grid h-12 w-12 place-items-center rounded-2xl text-ink"><ScanLine size={24} /></span>
              <div><h2 className="font-heading text-xl font-bold">{t('form.title')}</h2><p className="text-sm text-muted">{t(`form.mv.${movement}`)}</p></div>
            </div>
            <ul className="mb-4 flex flex-col gap-2 text-sm">
              {(['t1', 't2', 't3'] as const).map((k) => <li key={k} className="flex gap-2"><span className="text-gold">•</span>{t(`form.tips.${movement}.${k}`)}</li>)}
            </ul>
            {status === 'denied' && <p role="alert" className="mb-3 flex gap-2 text-sm text-accent"><CameraOff size={18} className="shrink-0" /> {t('form.denied')}</p>}
            {status === 'error' && <p role="alert" className="mb-3 text-sm text-accent">{t('form.error')}</p>}
            <div className="flex gap-2">
              <Button size="lg" variant="secondary" aria-label={t('form.flip')} onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}>
                <SwitchCamera size={20} /> {facing === 'user' ? t('form.front') : t('form.back')}
              </Button>
              <Button size="lg" fullWidth loading={status === 'loading'} onClick={start}><Camera size={20} /> {t('form.start')}</Button>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted"><ShieldCheck size={14} className="text-gold" /> {t('form.privacy')}</p>
          </div>
        </section>
      )}

      {status === 'done' && summary && (
        <section className="relative z-10 flex min-h-dvh flex-col justify-end p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="surface-lux rounded-3xl p-6 text-center">
            <p className="eyebrow">{t('form.summary')}</p>
            <div className="my-4 flex justify-center"><ProgressRing value={summary.avg / 100} size={140} label={summary.avg} sublabel={t('form.score')} /></div>
            <p className="mb-1 font-heading text-lg font-bold">{t('form.repsDone', { n: summary.reps })}</p>
            {summary.top.length ? (
              <ul className="mb-4 flex flex-col gap-1 text-muted">{summary.top.map((c) => <li key={c}>{t(`form.cue.${c}`)}</li>)}</ul>
            ) : <p className="mb-4 text-muted">{t('form.perfect')}</p>}
            <div className="flex gap-2">
              <Button size="lg" variant="secondary" fullWidth onClick={() => setStatus('idle')}><RotateCcw size={18} /> {t('form.again')}</Button>
              <Button size="lg" fullWidth onClick={() => nav(-1)}>{t('form.done')}</Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
