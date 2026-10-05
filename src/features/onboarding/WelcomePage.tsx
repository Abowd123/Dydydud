import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, LineChart, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useDirection } from '@/hooks/useDirection';

const slides = [
  { icon: Dumbbell, t: 's1t', d: 's1d', from: '#D4AF6A' },
  { icon: PlayCircle, t: 's2t', d: 's2d', from: '#E0823F' },
  { icon: LineChart, t: 's3t', d: 's3d', from: '#7DB4D6' }
];

/** شاشة الترحيب (3 شرائح). الاستبيان الكامل ينبني في المرحلة 2 */
export function WelcomePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dir = useDirection();
  const [i, setI] = useState(0);
  const s = slides[i];
  const last = i === slides.length - 1;

  const finish = () => nav('/onboarding', { replace: true });

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-bg px-6 pb-10 pt-6">
      <motion.div
        key={s.from}
        className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: s.from }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.16 }}
        transition={{ duration: 0.6 }}
      />
      <div className="relative flex justify-between">
        <span className="font-display text-3xl font-semibold tracking-[0.25em] text-gradient">GYMMATE</span>
        {!last && (
          <button onClick={finish} className="text-sm font-bold text-muted">
            {t('onboarding.skip')}
          </button>
        )}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 60 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 * dir }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="surface-lux sheen grid h-44 w-44 place-items-center rounded-full" style={{ boxShadow: `0 0 80px ${s.from}40, inset 0 1px 0 rgb(255 255 255 / 0.06)` }}>
              <s.icon size={72} style={{ color: s.from }} strokeWidth={1.3} />
            </div>
            <h1 className="text-[2rem] font-extrabold leading-tight">{t(`onboarding.${s.t}`)}</h1>
            <p className="max-w-xs text-muted">{t(`onboarding.${s.d}`)}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative flex flex-col gap-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, k) => (
            <motion.span key={k} animate={{ width: k === i ? 28 : 8 }} className={`h-1.5 rounded-full ${k === i ? 'bg-gold shadow-glow' : 'bg-border'}`} />
          ))}
        </div>
        <Button size="lg" fullWidth onClick={() => (last ? finish() : setI(i + 1))}>
          {last ? t('onboarding.start') : t('onboarding.next')}
        </Button>
        <p className="text-center text-xs text-muted">
          {t('legal.agree')} <Link to="/terms" className="text-gold underline-offset-4 hover:underline">{t('legal.terms')}</Link> · <Link to="/privacy" className="text-gold underline-offset-4 hover:underline">{t('legal.privacy')}</Link>
        </p>
      </div>
    </div>
  );
}
