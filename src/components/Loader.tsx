import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let dead = false;
    let raf = 0;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      // skip the count-up and the slide-away transition entirely — just a
      // brief, non-animated pause so it doesn't read as a broken flash.
      setCount(100);
      if (barRef.current) barRef.current.style.width = '100%';
      const t = setTimeout(() => {
        setHidden(true);
        onDone();
      }, 200);
      return () => clearTimeout(t);
    }

    const DUR = 1250;
    const t0 = performance.now();

    const step = () => {
      if (dead) return;
      const p = Math.min(1, (performance.now() - t0) / DUR);
      const eased = 1 - Math.pow(1 - p, 2.2);
      const n = Math.round(eased * 100);
      setCount(n);
      if (countRef.current) {
        countRef.current.style.fontVariationSettings =
          "'wght' " + Math.round(200 + eased * 700) + ", 'wdth' " + Math.round(62 + eased * 70);
      }
      if (barRef.current) barRef.current.style.width = (eased * 100).toFixed(1) + '%';
      if (p < 1) {
        raf = requestAnimationFrame(step);
        return;
      }
      const loader = loaderRef.current;
      if (loader && gsap) {
        gsap.to(loader, {
          duration: 0.8,
          ease: 'power4.inOut',
          yPercent: -100,
          onComplete: () => {
            setHidden(true);
            onDone();
          },
        });
      } else {
        setHidden(true);
        onDone();
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hidden) return null;

  return (
    <div
      ref={loaderRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <span
        ref={countRef}
        style={{
          fontFamily: "'Roboto Flex',Helvetica,Arial,sans-serif",
          fontVariationSettings: "'wght' 200, 'wdth' 62",
          fontSize: 'clamp(64px,14vw,180px)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: 'var(--fg)',
        }}
      >
        {count}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.32em', color: 'var(--muted-2)' }}>
        AYAN ALI — LOADING
      </span>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'var(--border)' }}>
        <div ref={barRef} style={{ height: '100%', width: '0%', background: 'var(--accent)' }} />
      </div>
    </div>
  );
}
