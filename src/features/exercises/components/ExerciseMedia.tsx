import { useEffect, useRef, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Exercise } from '@/types/exercise';
import { BodyMap } from '@/components/body';

interface Props { exercise: Exercise; variant?: 'thumb' | 'hero'; className?: string }

const backMuscles = ['lats', 'upperBack', 'lowerBack', 'glutes', 'hamstrings', 'triceps'];

/**
 * يعرض فيديو التمرين (WebM ثم MP4) بتشغيل تلقائي صامت، أو الصورة المصغرة.
 * لو الميديا مو موجودة لسه، يعرض بديل أنيق: خريطة العضلة المستهدفة.
 * الفيديو ما يتحمّل إلا لما يظهر على الشاشة (Lazy).
 */
export function ExerciseMedia({ exercise, variant = 'thumb', className }: Props) {
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '200px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const side = exercise.primaryMuscles.some((m) => backMuscles.includes(m)) ? 'back' : 'front';
  const fallback = (
    <div className="absolute inset-0 grid place-items-center bg-grad-hero">
      <BodyMap side={side} primary={exercise.primaryMuscles} secondary={exercise.secondaryMuscles} size={variant === 'hero' ? 110 : 54} />
      {variant === 'hero' && <Dumbbell className="absolute bottom-3 end-3 text-primary/30" size={28} />}
    </div>
  );

  return (
    <div ref={ref} className={cn('relative overflow-hidden bg-elevated', className)}>
      {failed || !visible ? (
        fallback
      ) : variant === 'hero' ? (
        <video
          className="h-full w-full object-cover"
          poster={exercise.media.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        >
          <source src={exercise.media.video} type="video/webm" />
          <source src={exercise.media.videoMp4} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      ) : (
        <img
          src={exercise.media.thumb}
          alt={exercise.name.en}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
