import { Minus, Plus } from 'lucide-react';

interface Props { value: number; onChange: (v: number) => void; step: number; min?: number; unit: string; label: string; big?: boolean }

export function Stepper({ value, onChange, step, min = 0, unit, label, big }: Props) {
  const set = (v: number) => onChange(Math.max(min, Math.round(v * 100) / 100));
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-3xl bg-elevated p-2">
      <span className="text-xs font-bold text-muted">{label}</span>
      <div className="flex w-full items-center justify-between gap-1">
        <button aria-label={`${label} -`} onClick={() => set(value - step)} className="grid h-12 w-12 place-items-center rounded-2xl bg-surface active:scale-95"><Minus size={20} /></button>
        <div className="flex items-baseline gap-1" dir="ltr">
          <input inputMode="decimal" value={value} aria-label={label}
            onChange={(e) => { const n = Number(e.target.value.replace(',', '.')); if (!Number.isNaN(n)) set(n); }}
            className={`w-16 bg-transparent text-center font-extrabold outline-none ${big ? 'text-4xl' : 'text-3xl'}`} />
          <span className="text-xs text-muted">{unit}</span>
        </div>
        <button aria-label={`${label} +`} onClick={() => set(value + step)} className="grid h-12 w-12 place-items-center rounded-2xl bg-surface active:scale-95"><Plus size={20} /></button>
      </div>
    </div>
  );
}
