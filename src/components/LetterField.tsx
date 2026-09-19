import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const RADIUS = 260;

const LetterField = forwardRef<HTMLHeadingElement, { text: string }>(function LetterField({ text }, forwardedRef) {
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  useImperativeHandle(forwardedRef, () => headlineRef.current as HTMLHeadingElement);

  useEffect(() => {
    let dead = false;
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };
    let has = false;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      has = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const state = new WeakMap<Element, { w: number; x: number }>();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (dead) return;
      const h = headlineRef.current;
      if (!h) return;
      const letters = h.querySelectorAll('[data-letter]');
      letters.forEach((el) => {
        let st = state.get(el);
        if (!st) {
          st = { w: 200, x: 62 };
          state.set(el, st);
        }
        let target = 0;
        if (has) {
          const r = el.getBoundingClientRect();
          const dx = mouse.x - (r.left + r.width / 2);
          const dy = mouse.y - (r.top + r.height / 2);
          const d = Math.sqrt(dx * dx + dy * dy);
          target = Math.max(0, 1 - d / RADIUS);
          target = target * target * (3 - 2 * target);
        }
        const tw = 200 + target * 700;
        const tx = 62 + target * 78;
        st.w += (tw - st.w) * 0.16;
        st.x += (tx - st.x) * 0.16;
        (el as HTMLElement).style.fontVariationSettings = "'wght' " + st.w.toFixed(0) + ", 'wdth' " + st.x.toFixed(0);
      });
    };
    raf = requestAnimationFrame(loop);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
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
          className="reveal-letter"
          style={{
            display: 'inline-block',
            willChange: 'font-variation-settings',
            fontVariationSettings: "'wght' 200, 'wdth' 62",
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
