import { useEffect, useRef } from 'react';
import { readAccentRgb } from '../lib/readAccentRgb';

// A field of short dash-shaped particles spawns around the cursor and
// drifts outward, fading as it goes — each particle is drawn as a line
// from its previous frame's position to its current one, which is what
// gives them that streaked/dash look instead of plain dots.
const SPAWN_INTERVAL_MS = 55; // sparse — only spawns every few frames, not on every move
const PARTICLES_PER_SPAWN = 1;
const HOVER_SPAWN_MULTIPLIER = 2; // denser field over links/buttons, as a hover cue
const CLICK_BURST_COUNT = 6;
const PARTICLE_LIFETIME_MS = 700;
const SPAWN_RADIUS = 10; // px offset from the exact cursor point
const INITIAL_SPEED = 0.4; // px/ms
const FRICTION = 0.965; // per-frame velocity decay

const RING_FOLLOW = 0.25; // per-frame interpolation toward the raw pointer position
const RING_RADIUS = 10;
const RING_HOVER_SCALE = 1.9;

type Particle = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  born: number;
};

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduceMotion || !canHover) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    document.body.classList.add('custom-cursor-active');

    let dead = false;
    let raf = 0;
    let lastFrame = performance.now();
    let lastSpawn = 0;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let ringX = mx;
    let ringY = my;
    let ringScale = 1;
    let targetRingScale = 1;
    let hovering = false;
    const particles: Particle[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resize);
    resize();

    const spawnOne = (now: number) => {
      const a = Math.random() * Math.PI * 2;
      const r = SPAWN_RADIUS * (0.4 + Math.random() * 0.6);
      const speed = INITIAL_SPEED * (0.6 + Math.random() * 0.9);
      const px = mx + Math.cos(a) * r;
      const py = my + Math.sin(a) * r;
      particles.push({ x: px, y: py, px, py, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, born: now });
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const el = e.target;
      hovering = el instanceof Element && !!el.closest('a, button, input, textarea');
      targetRingScale = hovering ? RING_HOVER_SCALE : 1;
      const now = performance.now();
      if (now - lastSpawn > SPAWN_INTERVAL_MS) {
        lastSpawn = now;
        const count = PARTICLES_PER_SPAWN * (hovering ? HOVER_SPAWN_MULTIPLIER : 1);
        for (let i = 0; i < count; i++) spawnOne(now);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const onDown = (e: PointerEvent) => {
      // snap the ring to the exact click point instead of wherever its
      // lagging/smoothed position currently is, so it's never visibly
      // offset from where the click actually lands.
      mx = e.clientX;
      my = e.clientY;
      ringX = mx;
      ringY = my;
      const now = performance.now();
      for (let i = 0; i < CLICK_BURST_COUNT; i++) spawnOne(now);
      targetRingScale *= 0.8;
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    const onUp = () => {
      targetRingScale = hovering ? RING_HOVER_SCALE : 1;
    };
    window.addEventListener('pointerup', onUp, { passive: true });

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (dead) return;
      const dt = Math.min(48, now - lastFrame);
      lastFrame = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accentRgb = readAccentRgb();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = now - p.born;
        if (age > PARTICLE_LIFETIME_MS) {
          particles.splice(i, 1);
          continue;
        }
        p.px = p.x;
        p.py = p.y;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        const lifeT = 1 - age / PARTICLE_LIFETIME_MS;
        ctx.strokeStyle = `rgba(${accentRgb}, ${Math.min(1, lifeT * 1.3).toFixed(3)})`;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      ringX += (mx - ringX) * RING_FOLLOW;
      ringY += (my - ringY) * RING_FOLLOW;
      ringScale += (targetRingScale - ringScale) * 0.2;
      const r = RING_RADIUS * ringScale;
      ctx.beginPath();
      ctx.arc(ringX, ringY, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accentRgb}, 0.12)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${accentRgb}, 0.9)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none' }} />;
}
