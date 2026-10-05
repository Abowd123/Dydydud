import { motion } from 'framer-motion';
import { Clock, Dumbbell, Flame, Layers, Repeat, Share2, Sparkles, Trophy } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, CardTitle, Skeleton } from '@/components/ui';
import { db } from '@/lib/db';
import { useSettings } from '@/store/settings';
import { getExercise } from '@/features/exercises/lib/repository';
import { summarize, usesWeight } from './lib/session';
import { useHistory, useStreak } from './lib/useWorkout';
import { Confetti } from './components/Confetti';
import { shareAchievement } from '@/lib/shareImage';
import { computeBadges, newlyUnlocked, XP } from '@/features/gamification/engine';
import { useGameInput } from '@/features/gamification/useGame';

export function WorkoutSummaryPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const nav = useNavigate();
  const lang = useSettings((s) => s.lang);
  const session = useLiveQuery(async () => (await db.sessions.get(id)) ?? null, [id]);
  const history = useHistory();
  const streak = useStreak();
  const game = useGameInput();

  if (session === undefined) return <div className="page"><Skeleton className="h-96" /></div>;
  if (!session) return <Navigate to="/workout" replace />;
  const sum = summarize(session, history);
  const fresh = session.finishedAt && Date.now() - session.finishedAt < 60_000;
  const xpEarned = XP.workout + sum.setsDone * XP.set + sum.prs.length * XP.pr;
  const newBadges = game ? newlyUnlocked(computeBadges({ ...game, sessions: game.sessions.filter((x) => x.id !== session.id), streak: Math.max(0, game.streak - 1) }), computeBadges(game)) : [];
  const share = () => shareAchievement({
    title: t('summary.title'), subtitle: t(`days.${session.dayKey}`), emoji: '🏆', rtl: lang === 'ar',
    stats: [{ label: t('summary.minutes'), value: String(sum.durationMin) }, { label: 'kg', value: sum.volumeKg.toLocaleString() }, { label: t('summary.sets'), value: `${sum.setsDone}` }, { label: '🔥', value: String(streak) }]
  });

  const stats = [
    { icon: Clock, v: `${sum.durationMin}`, l: t('summary.minutes'), c: 'text-water' },
    { icon: Dumbbell, v: sum.volumeKg.toLocaleString(), l: t('summary.volume'), c: 'text-primary' },
    { icon: Layers, v: `${sum.setsDone}/${sum.totalSets}`, l: t('summary.sets'), c: 'text-accent' },
    { icon: Repeat, v: `${sum.reps}`, l: t('summary.reps'), c: 'text-text' }
  ];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pb-8 pt-8">
      {fresh && <Confetti />}
      <motion.div initial={{ scale: 0.5, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className="mx-auto grid h-28 w-28 place-items-center rounded-[2.2rem] bg-grad-energy shadow-glow">
        <Trophy size={56} className="text-ink" />
      </motion.div>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">{t('summary.title')}</h1>
        <p className="text-muted">{t(`days.${session.dayKey}`)} • {new Date(session.startedAt).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, v, l, c }, i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
            <Card className="flex flex-col gap-1">
              <Icon className={c} size={20} />
              <p className="text-2xl font-extrabold">{v}</p>
              <p className="text-xs text-muted">{l}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
        <Card className="flex items-center justify-center gap-2 border-primary/40 py-3">
          <Sparkles className="text-primary" size={20} /><span className="text-xl font-extrabold text-primary">+{xpEarned} XP</span>
        </Card>
      </motion.div>

      {newBadges.length > 0 && (
        <Card variant="hero" className="text-center">
          <p className="mb-2 font-bold">{t('game.newBadge')}</p>
          <div className="flex justify-center gap-4">
            {newBadges.map((b) => (
              <motion.div key={b.id} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.7 }} className="flex flex-col items-center">
                <span className="text-5xl">{b.emoji}</span><span className="text-xs font-bold">{t(`game.badge.${b.id}`)}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      <Card className="flex items-center gap-3 border-accent/40">
        <Flame className="animate-flame text-accent" size={32} fill="currentColor" />
        <div>
          <p className="text-xl font-extrabold">{t('summary.streak', { n: streak })}</p>
          <p className="text-xs text-muted">{t('summary.streakD')}</p>
        </div>
      </Card>

      {sum.prs.length > 0 && (
        <Card variant="hero">
          <CardTitle className="mb-2 flex items-center gap-2"><Trophy size={18} className="text-accent" /> {t('summary.prs')}</CardTitle>
          {sum.prs.map((p) => (
            <div key={p.exerciseId} className="flex items-center justify-between py-1 text-sm">
              <span className="font-bold">{getExercise(p.exerciseId)?.name[lang]}</span>
              <Badge tone="accent">1RM ≈ {p.est1RM}kg (+{Math.round((p.est1RM - p.previous) * 10) / 10})</Badge>
            </div>
          ))}
        </Card>
      )}

      <Card>
        <CardTitle className="mb-2">{t('summary.details')}</CardTitle>
        <div className="flex flex-col divide-y divide-border">
          {session.exercises.map((e, i) => {
            const ex = getExercise(e.exerciseId);
            if (!ex) return null;
            const done = e.sets.filter((x) => x.done);
            return (
              <div key={i} className="py-2">
                <p className="font-bold">{ex.name[lang]}</p>
                <p className="text-xs text-muted" dir="ltr">
                  {done.length ? done.map((x) => (usesWeight(ex) ? `${x.weight}kg×${x.reps}` : `${x.reps}`)).join('  •  ') : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button size="lg" fullWidth onClick={() => nav('/', { replace: true })}>{t('summary.home')}</Button>
        <Button size="lg" variant="secondary" onClick={share} aria-label={t('summary.share')}><Share2 size={20} /></Button>
      </div>
      <p className="text-center text-xs text-muted">{t('summary.tip')}</p>
    </div>
  );
}
