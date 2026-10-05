import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeft, ChevronRight, Heart, Layers, Repeat, ScanLine, Timer, Wind } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { FORM_SUPPORTED } from '@/features/formcheck/analyzer';
import { useTranslation } from 'react-i18next';
import { BodyMapToggle } from '@/components/body';
import { Badge, Card, CardTitle } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useSettings } from '@/store/settings';
import { getExercise } from './lib/repository';
import { useFavorites } from './lib/useFavorites';
import { ExerciseMedia } from './components/ExerciseMedia';
import { DifficultyDots } from './components/DifficultyDots';
import { ExerciseHistory } from '@/features/workout/components/ExerciseHistory';

export function ExerciseDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const nav = useNavigate();
  const lang = useSettings((s) => s.lang);
  const { isFav, toggle } = useFavorites();
  const e = getExercise(id);
  if (!e) return <Navigate to="/exercises" replace />;

  const Back = lang === 'ar' ? ChevronRight : ChevronLeft;
  const Fwd = lang === 'ar' ? ChevronLeft : ChevronRight;
  const backSide = e.primaryMuscles.some((m) => ['lats', 'upperBack', 'lowerBack', 'glutes', 'hamstrings', 'triceps'].includes(m));
  const fav = isFav(e.id);

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto w-full max-w-md pb-28 md:max-w-2xl">
      <div className="relative">
        <ExerciseMedia exercise={e} variant="hero" className="aspect-square w-full md:aspect-video md:rounded-b-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />
        <div className="absolute inset-x-0 top-0 flex justify-between p-4">
          <button onClick={() => nav(-1)} className="glass grid h-11 w-11 place-items-center rounded-2xl" aria-label="back"><Back /></button>
          <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggle(e.id)} className="glass grid h-11 w-11 place-items-center rounded-2xl" aria-pressed={fav} aria-label="favorite">
            <Heart className={cn(fav ? 'fill-danger text-danger' : 'text-white')} />
          </motion.button>
        </div>
      </div>

      <div className="-mt-10 flex flex-col gap-4 px-4">
        <div className="relative">
          <h1 className="text-3xl font-extrabold">{e.name[lang]}</h1>
          <p className="text-sm text-muted">{e.name[lang === 'ar' ? 'en' : 'ar']}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge>{t(`equipment.${e.equipment}`)}</Badge>
            <Badge tone="muted">{t(`mechanic.${e.mechanic}`)}</Badge>
            <Badge tone="muted" className="gap-2">{t(`difficulty.${e.difficulty}`)} <DifficultyDots level={e.difficulty} /></Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Layers, v: e.defaults.sets, l: t('exercises.sets') },
            { icon: Repeat, v: e.defaults.reps, l: t('exercises.reps') },
            { icon: Timer, v: `${e.defaults.restSec}${t('exercises.sec')}`, l: t('exercises.rest') }
          ].map(({ icon: Icon, v, l }) => (
            <Card key={l} className="flex flex-col items-center gap-1 p-3 text-center">
              <Icon size={18} className="text-primary" />
              <span className="text-lg font-extrabold">{v}</span>
              <span className="text-xs text-muted">{l}</span>
            </Card>
          ))}
        </div>

        {FORM_SUPPORTED[e.id] && (
          <Link to={`/form-check/${e.id}`} className="surface-lux sheen flex items-center gap-3 rounded-3xl border-gold/30 p-4">
            <span className="btn-gold grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-ink"><ScanLine size={24} /></span>
            <span className="flex-1"><span className="block font-heading font-bold">{t('form.cta')}</span><span className="block text-sm text-muted">{t('form.ctaD')}</span></span>
          </Link>
        )}

        <ExerciseHistory exercise={e} />

        <Card>
          <CardTitle className="mb-3">{t('exercises.how')}</CardTitle>
          <ol className="flex flex-col gap-3">
            {e.steps.map((s, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-grad-primary text-sm font-extrabold text-ink">{i + 1}</span>
                <p className="pt-0.5 leading-relaxed">{s}</p>
              </motion.li>
            ))}
          </ol>
        </Card>

        <Card className="border-danger/30">
          <CardTitle className="mb-3 flex items-center gap-2 text-danger"><AlertTriangle size={18} /> {t('exercises.mistakes')}</CardTitle>
          <ul className="flex flex-col gap-2">
            {e.mistakes.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm"><span className="text-danger">✕</span>{m}</li>
            ))}
          </ul>
        </Card>

        <Card className="flex gap-3 border-water/30">
          <Wind className="shrink-0 text-water" />
          <div>
            <CardTitle className="text-base">{t('exercises.breathing')}</CardTitle>
            <p className="text-sm text-muted">{e.breathing}</p>
          </div>
        </Card>

        <Card className="flex flex-col items-center">
          <CardTitle className="mb-3 self-start">{t('exercises.targets')}</CardTitle>
          <BodyMapToggle id="detail-map" initialSide={backSide ? 'back' : 'front'} primary={e.primaryMuscles} secondary={e.secondaryMuscles} size={180} />
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {e.primaryMuscles.map((m) => <Badge key={m}>{t(`muscles.${m}`)}</Badge>)}
            {e.secondaryMuscles.map((m) => <Badge key={m} tone="accent">{t(`muscles.${m}`)}</Badge>)}
          </div>
        </Card>

        {e.alternatives.length > 0 && (
          <section>
            <h2 className="mb-2 text-lg font-bold">{t('exercises.alternatives')}</h2>
            <div className="flex flex-col gap-2">
              {e.alternatives.map((aid) => {
                const a = getExercise(aid)!;
                return (
                  <Link key={aid} to={`/exercises/${aid}`} replace className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2 transition-colors hover:bg-elevated">
                    <ExerciseMedia exercise={a} className="h-14 w-14 shrink-0 rounded-xl" />
                    <div className="flex-1">
                      <p className="font-bold">{a.name[lang]}</p>
                      <p className="text-xs text-muted">{t(`equipment.${a.equipment}`)}</p>
                    </div>
                    <Fwd size={18} className="text-muted" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
        <p className="text-center text-xs text-muted">{t('disclaimer')}</p>
      </div>
    </motion.main>
  );
}
