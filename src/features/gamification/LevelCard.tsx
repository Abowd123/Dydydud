import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import { useGame } from './useGame';

export function LevelCard({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const g = useGame();
  if (!g) return null;
  const unlocked = g.badges.filter((b) => b.unlocked).length;
  return (
    <Link to="/achievements">
      <Card variant="hero" className={compact ? 'p-3' : ''}>
        <div className="flex items-center gap-3">
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-grad-energy text-ink shadow-glow">
            <span className="font-display text-3xl">{g.level}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">{t(`game.title.${g.title}`)}</p>
            <div className="my-1 h-2 overflow-hidden rounded-full bg-elevated">
              <motion.div className="h-full rounded-full bg-grad-energy" initial={{ width: 0 }} animate={{ width: `${g.progress * 100}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="text-xs text-muted">{g.current}/{g.needed} XP • {t('game.badgesCount', { n: unlocked, total: g.badges.length })}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
