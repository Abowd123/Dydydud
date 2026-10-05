import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function MacroBar({ proteinG, carbsG, fatG }: { proteinG: number; carbsG: number; fatG: number }) {
  const { t } = useTranslation();
  const kcal = [proteinG * 4, carbsG * 4, fatG * 9];
  const total = kcal.reduce((a, b) => a + b, 0) || 1;
  const items = [
    { label: t('macros.protein'), g: proteinG, color: '#E0823F' },
    { label: t('macros.carbs'), g: carbsG, color: '#D4AF6A' },
    { label: t('macros.fat'), g: fatG, color: '#A9B98A' }
  ];
  return (
    <div>
      <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-elevated">
        {items.map((it, i) => (
          <motion.div key={it.label} initial={{ width: 0 }} animate={{ width: `${(kcal[i] / total) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} style={{ background: it.color }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {items.map((it) => (
          <div key={it.label}>
            <p className="text-xl font-extrabold" style={{ color: it.color }}>{it.g}g</p>
            <p className="text-xs text-muted">{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
