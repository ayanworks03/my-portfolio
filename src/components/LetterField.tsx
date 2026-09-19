import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Cursor-proximity variable-weight headline. Adapted from the standalone
// "spotlight type" prototype (prototypes/spotlight-type-hero.html) into
// the site's existing Roboto Flex / teal palette.
const R = 300; // px radius of cursor influence around each glyph
const EASE = 0.12; // per-frame interpolation toward target weight
const MIN_WEIGHT = 100;
const MAX_WEIGHT = 900;
const SETTLE_EPS = 0.5; // stop the rAF loop once every glyph is this close to target
const SWEEP_DURATION_MS = 4200; // touch fallback: one left-to-right sweep, ms

type CharState = {
  el: HTMLSpanElement;
  current: number;
  target: number;
  t: number;
  cx: number;
  cy: number;
};

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

    function step() {
      let allSettled = true;
      for (const c of chars) {
        c.current += (c.target - c.current) * EASE;
        if (Math.abs(c.target - c.current) > SETTLE_EPS) allSettled = false;
        c.el.style.fontVariationSettings = "'wght' " + c.current.toFixed(1);

        const t = c.t;
        c.el.style.color = `rgba(233,237,242,${(0.5 + t * 0.5).toFixed(3)})`;
        const glow = (16 * t).toFixed(1);
        const glow2 = (36 * t).toFixed(1);
        c.el.style.textShadow =
          t < 0.02
            ? 'none'
            : `0 0 ${glow}px rgba(233,237,242,${(0.5 * t).toFixed(3)}), 0 0 ${glow2}px rgba(var(--accent-rgb),${(0.4 * t).toFixed(3)})`;
      }

      if (dead) return;
      if (sweeping) {
        raf = requestAnimationFrame(step);
        return;
      }
      if (!allSettled) {
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
      // re-cache every move (cheap for 8 spans) rather than trusting a
      // one-time measurement — the entrance animation slides these letters
      // up into place well after fonts.ready fires, so a stale cache made
      // the hitbox track where the letters used to be, not where they are.
      cacheCenters();
      const mx = e.clientX;
      const my = e.clientY;
      for (const c of chars) {
        const dx = mx - c.cx;
        const dy = my - c.cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        let t = Math.max(0, Math.min(1, 1 - d / R));
        t = t * t;
        c.t = t;
        c.target = MIN_WEIGHT + t * (MAX_WEIGHT - MIN_WEIGHT);
      }
      ensureLoop();
    }

    function onLeave() {
      chars.forEach((c) => {
        c.target = MIN_WEIGHT;
        c.t = 0;
      });
      ensureLoop();
    }

    function runSweep() {
      let startTime: number | null = null;
      const frame = (now: number) => {
        if (dead) return;
        if (startTime === null) startTime = now;
        const elapsed = (now - startTime) % SWEEP_DURATION_MS;
        const phase = elapsed / SWEEP_DURATION_MS;
        const wave = (Math.sin(phase * Math.PI * 2 - Math.PI / 2) + 1) / 2;
        const rect = hostEl.getBoundingClientRect();
        const focalX = rect.left + wave * rect.width;
        const focalY = rect.top + rect.height / 2;
        cacheCenters();
        for (const c of chars) {
          const dx = focalX - c.cx;
          const dy = focalY - c.cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          let t = Math.max(0, Math.min(1, 1 - d / R));
          t = t * t;
          c.t = t;
          c.target = MIN_WEIGHT + t * (MAX_WEIGHT - MIN_WEIGHT);
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
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
        document.addEventListener('mouseleave', onLeave);
      } else {
        sweeping = true;
        runSweep();
      }
    });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
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
            willChange: 'font-variation-settings, color, text-shadow, opacity, transform',
            fontVariationSettings: "'wght' 100",
            color: 'rgba(233,237,242,0.5)',
            minWidth: ch === ' ' ? '0.34em' : undefined,
            // matches the hidden state useScrollMotion's gsap.set() applies
            // once `ready` flips — without this, the letters render fully
            // visible for a moment (their default state), then the loader
            // finishes and gsap.set() snaps them invisible, then gsap.to()
            // fades them back in: a visible "flash, vanish, reappear". Only
            // opacity is pre-set (not transform) — gsap needs to own the
            // transform from a clean slate to track yPercent correctly.
            opacity: 0,
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </h1>
  );
});

export default LetterField;
