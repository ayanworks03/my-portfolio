import { useEffect, useRef } from 'react';

type Blob = {
  size: number;
  top: string;
  left: string;
  color: string;
  duration: number;
  delay: number;
  parallax: number;
};

const BLOBS: Blob[] = [
  { size: 620, top: '18%', left: '28%', color: 'rgba(95,212,214,0.55)', duration: 22, delay: 0, parallax: 60 },
  { size: 520, top: '55%', left: '68%', color: 'rgba(95,212,214,0.4)', duration: 26, delay: -6, parallax: -45 },
  { size: 440, top: '68%', left: '20%', color: 'rgba(60,150,160,0.45)', duration: 30, delay: -14, parallax: 40 },
  { size: 380, top: '15%', left: '72%', color: 'rgba(120,230,230,0.35)', duration: 24, delay: -9, parallax: -55 },
];

export default function GlowField() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let dead = false;
    let raf = 0;

    let mx = 0.5;
    let my = 0.5;
    let sx = 0.5;
    let sy = 0.5;
    let heat = 0.55;
    let targetHeat = 0.55;
    let lastMove = performance.now();

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
      targetHeat = 1;
      lastMove = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (dead) return;

      if (now - lastMove > 700) targetHeat = 0.55;
      heat += (targetHeat - heat) * 0.05;
      sx += (mx - sx) * 0.06;
      sy += (my - sy) * 0.06;

      if (hostRef.current) hostRef.current.style.opacity = (0.55 + heat * 0.5).toFixed(3);

      const dx = (sx - 0.5) * 2;
      const dy = (sy - 0.5) * 2;
      wrapRefs.current.forEach((el, i) => {
        if (!el) return;
        const b = BLOBS[i];
        const px = dx * b.parallax;
        const py = dy * b.parallax * 0.6;
        el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0.72,
      }}
    >
      {BLOBS.map((b, i) => (
        <div
          key={i}
          ref={(el) => {
            wrapRefs.current[i] = el;
          }}
          style={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            marginLeft: -b.size / 2,
            marginTop: -b.size / 2,
            willChange: 'transform',
          }}
        >
          <span
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${b.color} 0%, rgba(95,212,214,0) 70%)`,
              filter: 'blur(60px)',
              animation: `glow-drift-${i % 2} ${b.duration}s ease-in-out infinite`,
              animationDelay: `${b.delay}s`,
              mixBlendMode: 'screen',
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes glow-drift-0 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(6%, -8%) scale(1.08); }
          66% { transform: translate(-5%, 6%) scale(0.95); }
        }
        @keyframes glow-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-7%, 5%) scale(0.92); }
          75% { transform: translate(5%, -6%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
