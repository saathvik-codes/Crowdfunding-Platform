import { useEffect, useState } from 'react';

/**
 * Illustration carousel for the paper side panel of the sign-in and register screens.
 * Slides whose image fails to load are skipped.
 */
export default function AuthCarousel({ slides, interval = 6000 }) {
  const [broken, setBroken] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const visible = slides.filter((s) => !broken.includes(s.src));
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (paused || reduceMotion || visible.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % visible.length), interval);
    return () => clearInterval(id);
  }, [paused, reduceMotion, visible.length, interval]);

  if (!visible.length) return <div className="flex-1" />;
  const current = index % visible.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative min-h-0 flex-1">
        {visible.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt=""
            width={380}
            height={464}
            onError={() => setBroken((b) => [...b, s.src])}
            className={`absolute inset-0 m-auto h-full max-h-[440px] w-auto max-w-[380px] object-contain py-6 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      <p className="min-h-[3.5rem] max-w-sm text-lg leading-7 text-[#23201a]/80" aria-live="polite">{visible[current].caption}</p>
      {visible.length > 1 && (
        <div className="mt-4 flex gap-2">
          {visible.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show illustration ${i + 1} of ${visible.length}`}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-primary-600' : 'w-1.5 bg-[#23201a]/25'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
