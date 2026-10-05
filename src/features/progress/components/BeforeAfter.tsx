import { useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

/** مقارنة صورتين بسلايدر */
export function BeforeAfter({ before, after, labels }: { before: string; after: string; labels: [string, string] }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-[3/4] w-full select-none overflow-hidden rounded-3xl bg-elevated" dir="ltr">
      <img src={after} alt={labels[1]} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={labels[0]} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="absolute inset-y-0 w-1 -translate-x-1/2 bg-white shadow-[0_0_12px_#000]" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-soft"><MoveHorizontal size={20} /></span>
      </div>
      <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold">{labels[0]}</span>
      <span className="glass absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold">{labels[1]}</span>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="compare"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
  );
}
