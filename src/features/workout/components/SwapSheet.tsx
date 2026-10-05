import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui';
import { getExercise } from '@/features/exercises/lib/repository';
import { ExerciseMedia } from '@/features/exercises/components/ExerciseMedia';
import { useSettings } from '@/store/settings';

interface Props { open: boolean; exerciseId: string; onClose: () => void; onPick: (id: string) => void }

export function SwapSheet({ open, exerciseId, onClose, onPick }: Props) {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const e = getExercise(exerciseId);
  const alts = (e?.alternatives ?? []).map(getExercise).filter(Boolean);
  return (
    <Modal open={open} onClose={onClose} title={t('live.swapTitle')}>
      <p className="mb-3 text-sm text-muted">{t('live.swapHint')}</p>
      <div className="flex flex-col gap-2">
        {alts.map((a) => (
          <button key={a!.id} onClick={() => onPick(a!.id)} className="flex items-center gap-3 rounded-2xl border border-border p-2 text-start hover:bg-elevated">
            <ExerciseMedia exercise={a!} className="h-14 w-14 rounded-xl" />
            <div className="flex-1">
              <p className="font-bold">{a!.name[lang]}</p>
              <p className="text-xs text-muted">{t(`equipment.${a!.equipment}`)}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
