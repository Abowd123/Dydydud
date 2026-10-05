import { Minus, Plus } from 'lucide-react';

interface Props { label: string; unit: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number }

/** حقل رقم كبير مع أزرار + و − (أسهل على الجوال من الكيبورد) */
export function NumberField({ label, unit, value, onChange, min, max, step = 1 }: Props) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 10) / 10));
  return (
    <div className="rounded-3xl border border-border bg-surface p-3">
      <p className="mb-2 text-sm font-bold text-muted">{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="decrease" onClick={() => onChange(clamp(value - step))} className="grid h-11 w-11 place-items-center rounded-2xl bg-elevated active:scale-95">
          <Minus size={18} />
        </button>
        <div className="flex flex-1 items-baseline justify-center gap-1">
          <input
            inputMode="decimal"
            value={Number.isNaN(value) ? '' : value}
            onChange={(e) => onChange(Number(e.target.value.replace(',', '.')))}
            onBlur={() => onChange(clamp(value || min))}
            className="w-20 bg-transparent text-center text-3xl font-extrabold outline-none"
            aria-label={label}
          />
          <span className="text-sm text-muted">{unit}</span>
        </div>
        <button type="button" aria-label="increase" onClick={() => onChange(clamp(value + step))} className="grid h-11 w-11 place-items-center rounded-2xl bg-elevated active:scale-95">
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
