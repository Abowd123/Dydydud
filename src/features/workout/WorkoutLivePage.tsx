import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Info, List, Minus, Plus, Repeat, ScanLine, X } from 'lucide-react';
import { FORM_SUPPORTED } from '@/features/formcheck/analyzer';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useSettings } from '@/store/settings';
import type { Feel, WorkoutSession } from '@/types/workout';
import { getExercise } from '@/features/exercises/lib/repository';
import { ExerciseMedia } from '@/features/exercises/components/ExerciseMedia';
import { addSet, completeSet, parseReps, removeSet, sessionProgress, swapExercise, updateSet, usesWeight, WEIGHT_STEP } from './lib/session';
import { abandonSession, finishSession, getFinishedHistory, saveSession, useActiveSession } from './lib/useWorkout';
import { useRestTimer } from './lib/useRestTimer';
import { useWakeLock } from './lib/useWakeLock';
import { cues } from './lib/feedback';
import { COOLDOWN, WARMUP } from './lib/routines';
import { RestTimer } from './components/RestTimer';
import { SwipeToComplete } from './components/SwipeToComplete';
import { Stepper } from './components/Stepper';
import { TimedRoutine } from './components/TimedRoutine';
import { SwapSheet } from './components/SwapSheet';

export function WorkoutLivePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const lang = useSettings((s) => s.lang);
  const stored = useActiveSession();
  const [s, setS] = useState<WorkoutSession | null>(null);
  const [view, setView] = useState<number | null>(null); // التمرين المعروض
  const [feel, setFeel] = useState<Feel>('good');
  const [swapOpen, setSwapOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const timer = useRestTimer();
  useWakeLock(true);

  useEffect(() => {
    if (stored && (!s || s.id !== stored.id)) setS(stored);
  }, [stored]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (next: WorkoutSession) => {
    setS(next);
    void saveSession(next);
  };

  const exIndex = view ?? s?.current.ex ?? 0;
  const se = s?.exercises[exIndex];
  const exercise = se ? getExercise(se.exerciseId) : undefined;
  const reps = useMemo(() => (se ? parseReps(se.target.reps) : null), [se]);

  if (stored === undefined || (stored && !s)) return <div className="page"><Skeleton className="h-[80dvh]" /></div>;
  if (!stored || !s || !se || !exercise || !reps) return <Navigate to="/workout" replace />;

  const finish = async () => {
    const done = await finishSession(s);
    cues.finish();
    nav(`/workout/summary/${done.id}`, { replace: true });
  };

  if (s.phase === 'warmup')
    return (
      <Shell onClose={() => setQuitOpen(true)} progress={0} title={t('live.warmup')}>
        <TimedRoutine kind="warmup" steps={WARMUP} onDone={() => commit({ ...s, phase: 'main' })} onSkip={() => commit({ ...s, phase: 'main' })} />
        <QuitModal open={quitOpen} onClose={() => setQuitOpen(false)} onQuit={async () => { await abandonSession(s); nav('/workout', { replace: true }); }} />
      </Shell>
    );

  if (s.phase === 'cooldown')
    return (
      <Shell onClose={finish} progress={1} title={t('live.cooldown')}>
        <TimedRoutine kind="cooldown" steps={COOLDOWN} onDone={finish} onSkip={finish} />
      </Shell>
    );

  const setIdx = view === null || view === s.current.ex ? s.current.set : se.sets.findIndex((x) => !x.done);
  const activeSet = setIdx >= 0 ? se.sets[setIdx] : undefined;
  const nextPos = s.current;
  const nextEx = getExercise(s.exercises[nextPos.ex]?.exerciseId);
  const Prev = lang === 'ar' ? ChevronRight : ChevronLeft;
  const Next = lang === 'ar' ? ChevronLeft : ChevronRight;

  const doComplete = () => {
    if (!activeSet || setIdx < 0) return;
    cues.set();
    const r = completeSet(s, exIndex, setIdx, feel);
    setFeel('good');
    setView(null);
    if (r.allFinished) {
      commit({ ...r.session, phase: 'cooldown' });
      return;
    }
    commit(r.session);
    timer.start(r.restSec);
  };

  const patch = (k: 'weight' | 'reps', v: number) => commit(updateSet(s, exIndex, setIdx, { [k]: v }));
  const anyLeft = s.exercises.some((e) => e.sets.some((x) => !x.done));

  return (
    <Shell onClose={() => setQuitOpen(true)} progress={sessionProgress(s)} title={`${exIndex + 1}/${s.exercises.length} • ${t(`days.${s.dayKey}`)}`}
      right={<button onClick={() => setListOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-elevated" aria-label={t('live.list')}><List size={20} /></button>}>
      <div className="relative -mx-4">
        <AnimatePresence mode="wait">
          <motion.div key={se.exerciseId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ExerciseMedia exercise={exercise} variant="hero" className="aspect-[4/3] w-full" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
        <div className="absolute inset-x-4 top-3 flex justify-between">
          <button disabled={exIndex === 0} onClick={() => setView(exIndex - 1)} className="glass grid h-10 w-10 place-items-center rounded-xl disabled:opacity-30" aria-label="prev"><Prev /></button>
          <button disabled={exIndex === s.exercises.length - 1} onClick={() => setView(exIndex + 1)} className="glass grid h-10 w-10 place-items-center rounded-xl disabled:opacity-30" aria-label="next"><Next /></button>
        </div>
      </div>

      <div className="-mt-6 flex flex-1 flex-col gap-4">
        <div className="relative flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">{exercise.name[lang]}</h1>
            <p className="text-sm text-muted">
              {t('live.target')}: <b className="text-primary">{se.target.sets} × {se.target.reps}</b>
              {se.suggestedWeight !== null && usesWeight(exercise) && <> • {t('live.suggested')} <b className="text-accent">{se.suggestedWeight}kg</b></>}
            </p>
          </div>
          <div className="flex gap-1">
            {FORM_SUPPORTED[exercise.id] && <Link to={`/form-check/${exercise.id}`} className="grid h-10 w-10 place-items-center rounded-xl bg-elevated text-gold" aria-label={t('form.cta')}><ScanLine size={18} /></Link>}
            <Link to={`/exercises/${exercise.id}`} className="grid h-10 w-10 place-items-center rounded-xl bg-elevated" aria-label={t('live.howTo')}><Info size={18} /></Link>
            <button onClick={() => setSwapOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-elevated" aria-label={t('live.swapTitle')}><Repeat size={18} /></button>
          </div>
        </div>

        {/* الجولات */}
        <div className="flex items-center gap-2">
          {se.sets.map((x, i) => (
            <motion.span key={i} layout className={cn('flex h-9 flex-1 items-center justify-center rounded-xl text-xs font-extrabold',
              x.done ? 'bg-grad-primary text-ink' : i === setIdx ? 'bg-accent/20 text-accent ring-2 ring-accent' : 'bg-elevated text-muted')}>
              {x.done ? `${usesWeight(exercise) ? `${x.weight}×` : ''}${x.reps}` : i + 1}
            </motion.span>
          ))}
          <button onClick={() => commit(removeSet(s, exIndex))} className="grid h-9 w-9 place-items-center rounded-xl bg-elevated" aria-label={t('live.removeSet')}><Minus size={16} /></button>
          <button onClick={() => commit(addSet(s, exIndex))} className="grid h-9 w-9 place-items-center rounded-xl bg-elevated" aria-label={t('live.addSet')}><Plus size={16} /></button>
        </div>

        {activeSet ? (
          <>
            {se.suggestedWeight === null && usesWeight(exercise) && setIdx === 0 && <p className="rounded-2xl bg-water/10 p-3 text-sm text-water">{t('live.firstTime')}</p>}
            <div className="flex gap-2">
              {usesWeight(exercise) && <Stepper label={t('live.weight')} unit="kg" step={WEIGHT_STEP[exercise.equipment]} value={activeSet.weight} onChange={(v) => patch('weight', v)} big />}
              <Stepper label={reps.unit === 'sec' ? t('live.seconds') : reps.perSide ? t('live.repsSide') : t('live.reps')} unit={reps.unit === 'sec' ? 's' : '×'} step={reps.unit === 'sec' ? 5 : 1} min={1} value={activeSet.reps} onChange={(v) => patch('reps', v)} big />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'good', 'hard'] as Feel[]).map((f) => (
                <button key={f} onClick={() => setFeel(f)} className={cn('h-11 rounded-2xl text-sm font-bold transition', feel === f ? f === 'hard' ? 'bg-danger text-white' : f === 'easy' ? 'bg-water text-ink' : 'bg-primary text-ink' : 'bg-elevated text-muted')}>
                  {t(`live.feel.${f}`)}
                </button>
              ))}
            </div>
            <div className="mt-auto pb-[var(--safe-bottom)]">
              <SwipeToComplete label={t('live.swipe', { n: setIdx + 1 })} onComplete={doComplete} />
            </div>
          </>
        ) : (
          <div className="mt-auto flex flex-col gap-2 pb-[var(--safe-bottom)]">
            <p className="text-center font-bold text-primary">{t('live.exerciseDone')} ✓</p>
            {anyLeft ? <Button size="lg" onClick={() => setView(null)}>{t('live.continue')}</Button> : <Button size="lg" onClick={() => commit({ ...s, phase: 'cooldown' })}>{t('live.toCooldown')}</Button>}
          </div>
        )}
      </div>

      <RestTimer open={timer.running} remaining={timer.remaining} total={timer.total} onAdd={timer.add} onSkip={timer.skip}
        nextLabel={nextEx ? `${nextEx.name[lang]} • ${t('live.set')} ${nextPos.set + 1}` : undefined} />
      <SwapSheet open={swapOpen} exerciseId={se.exerciseId} onClose={() => setSwapOpen(false)}
        onPick={async (id) => { const h = await getFinishedHistory(); commit(swapExercise(s, exIndex, id, h)); setSwapOpen(false); }} />
      <Modal open={listOpen} onClose={() => setListOpen(false)} title={t('live.list')}>
        <div className="flex max-h-[60dvh] flex-col gap-2 overflow-y-auto">
          {s.exercises.map((e, i) => {
            const ex = getExercise(e.exerciseId)!;
            const done = e.sets.filter((x) => x.done).length;
            return (
              <button key={i} onClick={() => { setView(i); setListOpen(false); }} className={cn('flex items-center gap-3 rounded-2xl border p-2 text-start', i === exIndex ? 'border-primary' : 'border-border')}>
                <ExerciseMedia exercise={ex} className="h-12 w-12 rounded-xl" />
                <span className="flex-1 font-bold">{ex.name[lang]}</span>
                <span className={cn('text-sm font-bold', done === e.sets.length ? 'text-primary' : 'text-muted')}>{done}/{e.sets.length}</span>
              </button>
            );
          })}
        </div>
        <Button variant="secondary" fullWidth className="mt-3" onClick={() => { setListOpen(false); commit({ ...s, phase: 'cooldown' }); }}>{t('live.endEarly')}</Button>
      </Modal>
      <QuitModal open={quitOpen} onClose={() => setQuitOpen(false)}
        onQuit={async () => { const r = await abandonSession(s); nav(r ? `/workout/summary/${r.id}` : '/workout', { replace: true }); }} />
    </Shell>
  );
}

function Shell({ children, onClose, progress, title, right }: { children: ReactNode; onClose: () => void; progress: number; title: string; right?: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-4 pt-3">
      <div className="mb-3 flex items-center gap-3">
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-elevated" aria-label="close"><X size={20} /></button>
        <div className="flex-1">
          <p className="mb-1 text-center text-xs font-bold text-muted">{title}</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
            <motion.div className="h-full rounded-full bg-grad-energy" animate={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        {right ?? <span className="w-10" />}
      </div>
      {children}
    </div>
  );
}

function QuitModal({ open, onClose, onQuit }: { open: boolean; onClose: () => void; onQuit: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={t('live.quitTitle')}>
      <p className="mb-4 text-sm text-muted">{t('live.quitBody')}</p>
      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={onClose}>{t('live.keepGoing')}</Button>
        <Button variant="danger" fullWidth onClick={onQuit}>{t('live.quit')}</Button>
      </div>
    </Modal>
  );
}
