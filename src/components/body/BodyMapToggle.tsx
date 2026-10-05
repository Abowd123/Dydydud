import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@/components/ui';
import type { Muscle } from '@/types/exercise';
import { BodyMap } from './BodyMap';
import type { Side } from './shapes';

interface Props {
  primary?: Muscle[];
  secondary?: Muscle[];
  selected?: Muscle | null;
  onSelect?: (m: Muscle) => void;
  initialSide?: Side;
  size?: number;
  id: string;
}

export function BodyMapToggle({ initialSide = 'front', id, ...rest }: Props) {
  const { t } = useTranslation();
  const [side, setSide] = useState<Side>(initialSide);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full max-w-[220px]">
        <SegmentedControl<Side>
          id={id}
          value={side}
          onChange={setSide}
          options={[{ value: 'front', label: t('body.front') }, { value: 'back', label: t('body.back') }]}
        />
      </div>
      <BodyMap side={side} {...rest} />
      {(rest.primary?.length || rest.secondary?.length) ? (
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-primary" />{t('body.primary')}</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-accent" />{t('body.secondary')}</span>
        </div>
      ) : null}
    </div>
  );
}
