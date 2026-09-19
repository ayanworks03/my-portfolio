import { useEffect, useRef } from 'react';

const FOLLOW = 0.25; // per-frame interpolation toward the raw pointer position
const HOVER_SCALE = 1.9;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduceMotion || !canHover) return;

    const dot = dotRef.current;
    if (!dot) return;

    document.body.classList.add('custom-cursor-active');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      visible = true;
      const el = e.target;
      targetScale = el instanceof Element && el.closest('a, button, input, textarea') ? HOVER_SCALE : 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const onLeaveWindow = () => {
      visible = false;
    };
    document.addEventListener('mouseleave', onLeaveWindow);

    const onDown = () => {
      targetScale *= 0.85;
    };
    const onUp = () => {
      targetScale = targetScale > HOVER_SCALE * 0.9 ? HOVER_SCALE : 1;
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      cx += (mx - cx) * FOLLOW;
      cy += (my - cy) * FOLLOW;
      scale += (targetScale - scale) * 0.2;
      dot.style.opacity = visible ? '1' : '0';
      dot.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) scale(${scale.toFixed(2)})`;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeaveWindow);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return <div ref={dotRef} className="custom-cursor" style={{ opacity: 0 }} />;
}
