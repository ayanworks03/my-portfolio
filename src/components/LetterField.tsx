import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Cursor-proximity variable-weight headline. Adapted from the standalone
// "spotlight type" prototype (prototypes/spotlight-type-hero.html) into
// the site's existing Roboto Flex / teal palette.
const R = 300; // px radius of cursor influence around each glyph
const EASE = 0.12; // per-frame interpolation toward target weight
const DRAG = 0.09; // per-frame interpolation of the focal point toward the raw cursor — lower = more trailing "drag"
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

    // Raw pointer position (updated instantly on pointermove) vs. the focal
    // point actually used to drive the effect (fx, fy), which drags behind
    // the raw position with its own inertia — this is what gives the
    // "liquid trail" feel instead of the bold spot snapping straight to
    // the cursor every frame.
    let mx = 0;
    let my = 0;
    let fx = 0;
    let fy = 0;
    let active = false;
    let sweepStart: number | null = null;

    function step(now: number) {
      // 1) advance the focal point for this frame.
      if (sweeping) {
        if (sweepStart === null) sweepStart = now;
        const elapsed = (now - sweepStart) % SWEEP_DURATION_MS;
        const phase = elapsed / SWEEP_DURATION_MS;
        const wave = (Math.sin(phase * Math.PI * 2 - Math.PI / 2) + 1) / 2;
        const rect = hostEl.getBoundingClientRect();
        fx = rect.left + wave * rect.width;
        fy = rect.top + rect.height / 2;
      } else if (active) {
        fx += (mx - fx) * DRAG;
        fy += (my - fy) * DRAG;
      }

      // 2) drive every glyph's target weight from the (possibly lagging)
      // focal point, then ease its current weight toward that target.
      let allSettled = true;
      for (const c of chars) {
        let t = 0;
        if (sweeping || active) {
          const dx = fx - c.cx;
          const dy = fy - c.cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          t = Math.max(0, Math.min(1, 1 - d / R));
          t = t * t;
        }
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
      // the focal point itself may still be dragging toward mx/my even once
      // every glyph's weight is momentarily settled, so keep going until
      // it's caught up too (sweep mode never settles at all).
      const focalSettled = !active || (Math.abs(mx - fx) < 1 && Math.abs(my - fy) < 1);
      if (sweeping || !allSettled || !focalSettled) {
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
      mx = e.clientX;
      my = e.clientY;
      if (!active) {
        active = true;
        fx = mx;
        fy = my;
      }
      ensureLoop();
    }

    function onLeave() {
      active = false;
      ensureLoop();
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
        ensureLoop();
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
