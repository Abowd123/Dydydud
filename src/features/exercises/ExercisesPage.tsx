import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Map, Search, X } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { BodyMapToggle } from '@/components/body';
import { Button, Card, EmptyState } from '@/components/ui';
import { EQUIPMENT, MUSCLES, type Equipment, type Muscle } from '@/types/exercise';
import { exercises, filterExercises } from './lib/repository';
import { useFavorites } from './lib/useFavorites';
import { ExerciseCard } from './components/ExerciseCard';
import { Chip } from './components/Chip';

export function ExercisesPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const deferred = useDeferredValue(query);
  const { ids, toggle } = useFavorites();

  const results = useMemo(
    () => filterExercises(exercises, { query: deferred, muscle, equipment, favoritesOnly: favOnly, favoriteIds: ids }),
    [deferred, muscle, equipment, favOnly, ids]
  );

  const pickMuscle = (m: Muscle) => setMuscle((cur) => (cur === m ? null : m));

  return (
    <PageTransition>
      <TopBar
        back
        title={t('nav.exercises')}
        right={
          <div className="flex gap-2">
            <Button size="icon" variant={favOnly ? 'danger' : 'secondary'} onClick={() => setFavOnly((v) => !v)} aria-label={t('exercises.favorites')}>
              <Heart size={20} className={favOnly ? 'fill-white' : ''} />
            </Button>
            <Button size="icon" variant={showMap ? 'primary' : 'secondary'} onClick={() => setShowMap((v) => !v)} aria-label={t('exercises.bodyMap')}>
              <Map size={20} />
            </Button>
          </div>
        }
      />

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('exercises.search')}
          className="h-12 w-full rounded-2xl border border-border bg-surface pe-10 ps-11 outline-none transition focus:border-primary"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted" aria-label="clear">
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showMap && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="mb-3 flex flex-col items-center">
              <p className="mb-2 text-sm text-muted">{t('exercises.tapMuscle')}</p>
              <BodyMapToggle id="lib-map" selected={muscle} onSelect={pickMuscle} size={200} />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip active={!muscle} onClick={() => setMuscle(null)}>{t('exercises.all')}</Chip>
        {MUSCLES.map((m) => (
          <Chip key={m} active={muscle === m} onClick={() => pickMuscle(m)}>{t(`muscles.${m}`)}</Chip>
        ))}
      </div>
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {EQUIPMENT.map((eq) => (
          <Chip key={eq} active={equipment === eq} onClick={() => setEquipment((c) => (c === eq ? null : eq))}>{t(`equipment.${eq}`)}</Chip>
        ))}
      </div>

      <p className="mb-3 text-sm text-muted">{t('exercises.count', { count: results.length })}</p>

      {results.length === 0 ? (
        <EmptyState icon={Search} title={t('exercises.empty')} description={t('exercises.emptyHint')} />
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {results.map((e, i) => (
            <ExerciseCard key={e.id} exercise={e} index={i} fav={ids.has(e.id)} onFav={() => toggle(e.id)} />
          ))}
        </motion.div>
      )}
    </PageTransition>
  );
}
