import { useEffect, useState } from 'react';

type Blob = {
  size: number;
  top: string;
  left: string;
  color: string;
  duration: number;
  delay: number;
};

const BLOBS: Blob[] = [
  { size: 620, top: '18%', left: '28%', color: 'rgba(95,212,214,0.55)', duration: 22, delay: 0 },
  { size: 520, top: '55%', left: '68%', color: 'rgba(95,212,214,0.4)', duration: 26, delay: -6 },
  { size: 440, top: '68%', left: '20%', color: 'rgba(60,150,160,0.45)', duration: 30, delay: -14 },
  { size: 380, top: '15%', left: '72%', color: 'rgba(120,230,230,0.35)', duration: 24, delay: -9 },
];

export default function GlowField() {
  const [boosted, setBoosted] = useState(false);

  useEffect(() => {
    let timeout = 0;
    const onMove = () => {
      setBoosted(true);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setBoosted(false), 1200);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: boosted ? 1 : 0.72,
        transition: 'opacity 1.1s ease',
      }}
    >
      {BLOBS.map((b, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            marginLeft: -b.size / 2,
            marginTop: -b.size / 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color} 0%, rgba(95,212,214,0) 70%)`,
            filter: 'blur(60px)',
            animation: `glow-drift-${i % 2} ${b.duration}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
            mixBlendMode: 'screen',
          }}
        />
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
