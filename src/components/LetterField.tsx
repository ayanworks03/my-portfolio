import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Cursor-proximity variable-weight headline. Adapted from the standalone
// "spotlight type" prototype (prototypes/spotlight-type-hero.html) into
// the site's existing Roboto Flex / teal palette.
const EASE = 0.16; // per-frame interpolation toward target weight
const MIN_WEIGHT = 100;
const MAX_WEIGHT = 900;
const SETTLE_EPS = 0.5; // stop the rAF loop once every glyph is this close to target
const SWEEP_DURATION_MS = 4200; // touch fallback: one left-to-right sweep, ms

// Ripple engine — every "touch" (cursor move, touch sweep, idle pulse)
// spawns an expanding, fading ring instead of a spot that just follows the
// pointer. Letters light up as the ring passes over them, like light on
// water.
const RIPPLE_SPEED = 0.9; // px/ms the ring radius grows
const RIPPLE_LIFETIME_MS = 900; // how long a ripple lives before fully fading
const RIPPLE_BAND = 70; // half-width (px) of the traveling ring's glow band
const SPAWN_INTERVAL_MS = 130; // min gap between cursor-triggered ripple spawns
const MAX_RIPPLES = 14; // safety cap on concurrent ripples
const IDLE_GAP_MS = 2600; // time with no spawns before an ambient ripple fires

type CharState = {
  el: HTMLSpanElement;
  current: number;
  target: number;
  t: number;
  cx: number;
  cy: number;
};

type Ripple = { x: number; y: number; born: number };

const LetterField = forwardRef<HTMLHeadingElement, { text: string }>(function LetterField({ text }, forwardedRef) {
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  useImperativeHandle(forwardedRef, () => headlineRef.current as HTMLHeadingElement);

  useEffect(() => {
    const hostElRef = headlineRef.current;
    if (!hostElRef) return;
    const hostEl: HTMLHeadingElement = hostElRef;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const spans = Array.from(hostEl.querySelectorAll<HTMLSpanElement>('[data-letter]'));
    const chars: CharState[] = spans.map((el) => ({ el, current: MIN_WEIGHT, target: MIN_WEIGHT, t: 0, cx: 0, cy: 0 }));

    if (reduceMotion) {
      chars.forEach((c) => {
        c.el.style.fontVariationSettings = "'wght' 400";
        c.el.style.color = 'rgba(233,237,242,0.9)';
      });
      return;
    }

    let dead = false;
    let raf = 0;
    let looping = false;
    let sweeping = !canHover;

    // Pin every glyph's box to its width at MAX_WEIGHT so thickening never
    // shifts neighbouring letters; skip the space (it uses its own minWidth).
    function pinWidths() {
      chars.forEach((c) => {
        if (c.el.textContent === ' ') return;
        c.el.style.width = 'auto';
        c.el.style.fontVariationSettings = "'wght' " + MAX_WEIGHT;
        const w = c.el.getBoundingClientRect().width;
        c.el.style.width = Math.ceil(w) + 'px';
        c.el.style.fontVariationSettings = "'wght' " + c.current;
      });
    }

    function cacheCenters() {
      chars.forEach((c) => {
        const r = c.el.getBoundingClientRect();
        c.cx = r.left + r.width / 2;
        c.cy = r.top + r.height / 2;
      });
    }

    function measure() {
      pinWidths();
      cacheCenters();
    }

    const ripples: Ripple[] = [];
    let lastSpawn = -Infinity;
    let sweepStart: number | null = null;

    function spawnRipple(x: number, y: number, now: number) {
      if (now - lastSpawn < SPAWN_INTERVAL_MS) return;
      lastSpawn = now;
      ripples.push({ x, y, born: now });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
      ensureLoop();
    }

    function step(now: number) {
      // 1) age out dead ripples, and drop in an ambient one if it's been
      // quiet for a while, so the headline isn't totally inert at rest.
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].born > RIPPLE_LIFETIME_MS) ripples.splice(i, 1);
      }
      if (!sweeping && now - lastSpawn > IDLE_GAP_MS) {
        const rect = hostEl.getBoundingClientRect();
        spawnRipple(rect.left + rect.width / 2, rect.top + rect.height / 2, now);
      }
      if (sweeping) {
        if (sweepStart === null) sweepStart = now;
        const elapsed = (now - sweepStart) % SWEEP_DURATION_MS;
        const phase = elapsed / SWEEP_DURATION_MS;
        const wave = (Math.sin(phase * Math.PI * 2 - Math.PI / 2) + 1) / 2;
        const rect = hostEl.getBoundingClientRect();
        spawnRipple(rect.left + wave * rect.width, rect.top + rect.height / 2, now);
      }

      // 2) each ripple is an expanding, fading ring: radius grows with age,
      // amplitude decays with age, and a glyph lights up when the ring is
      // currently passing near it (gaussian band around the ring radius).
      // Overlapping ripples add together, like real waves.
      let allSettled = true;
      for (const c of chars) {
        let t = 0;
        for (const rp of ripples) {
          const age = now - rp.born;
          const life = 1 - age / RIPPLE_LIFETIME_MS;
          if (life <= 0) continue;
          const radius = age * RIPPLE_SPEED;
          const dx = c.cx - rp.x;
          const dy = c.cy - rp.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const ringDist = d - radius;
          const band = Math.exp(-(ringDist * ringDist) / (2 * RIPPLE_BAND * RIPPLE_BAND));
          t += life * band;
        }
        t = Math.max(0, Math.min(1, t));
        c.t = t;
        c.target = MIN_WEIGHT + t * (MAX_WEIGHT - MIN_WEIGHT);

        c.current += (c.target - c.current) * EASE;
        if (Math.abs(c.target - c.current) > SETTLE_EPS) allSettled = false;
        c.el.style.fontVariationSettings = "'wght' " + c.current.toFixed(1);

        c.el.style.color = `rgba(233,237,242,${(0.5 + t * 0.5).toFixed(3)})`;
        const glow = (16 * t).toFixed(1);
        const glow2 = (36 * t).toFixed(1);
        c.el.style.textShadow =
          t < 0.02
            ? 'none'
            : `0 0 ${glow}px rgba(233,237,242,${(0.5 * t).toFixed(3)}), 0 0 ${glow2}px rgba(95,212,214,${(0.4 * t).toFixed(3)})`;
      }

      if (dead) return;
      if (sweeping || ripples.length > 0 || !allSettled) {
        raf = requestAnimationFrame(step);
      } else {
        looping = false;
      }
    }

    function ensureLoop() {
      if (!looping) {
        looping = true;
        raf = requestAnimationFrame(step);
      }
    }

    function onMove(e: PointerEvent) {
      spawnRipple(e.clientX, e.clientY, performance.now());
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 120);
    };

    document.fonts.ready.then(() => {
      if (dead) return;
      measure();
      window.addEventListener('resize', onResize);
      if (canHover) {
        window.addEventListener('pointermove', onMove, { passive: true });
      } else {
        sweeping = true;
        ensureLoop();
      }
    });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <h1
      ref={headlineRef}
      style={{
        margin: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(2px,0.9vw,14px)',
        fontFamily: "'Roboto Flex',Helvetica,Arial,sans-serif",
        fontSize: 'clamp(54px,14vw,210px)',
        lineHeight: 0.92,
        letterSpacing: '0.01em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        cursor: 'default',
      }}
    >
      {text.split('').map((ch, i) => (
        <span
          key={i}
          data-letter=""
          style={{
            display: 'inline-block',
            textAlign: 'center',
            willChange: 'font-variation-settings, color, text-shadow',
            fontVariationSettings: "'wght' 100",
            color: 'rgba(233,237,242,0.5)',
            minWidth: ch === ' ' ? '0.34em' : undefined,
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </h1>
  );
});

export default LetterField;
