import { useCallback, useRef } from 'react';

const MAX_TILT_DEG = 8;
const HOVER_SCALE = 1.015;
const PERSPECTIVE = 700;

// Real-time 3D tilt that follows the cursor within an element's bounds,
// easing back to flat on leave. Returns plain DOM event handlers (not
// React synthetic-event ones) so the same hook works whether it's wired up
// via JSX props or addEventListener.
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const enabled = useRef<boolean | null>(null);

  const isEnabled = () => {
    if (enabled.current === null) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      enabled.current = !reduceMotion && canHover;
    }
    return enabled.current;
  };

  const onMouseMove = useCallback((e: { clientX: number; clientY: number }) => {
    if (!isEnabled()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 2 * MAX_TILT_DEG;
    const rotateX = -(py - 0.5) * 2 * MAX_TILT_DEG;
    el.style.transition = 'transform 0.08s linear';
    el.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${HOVER_SCALE},${HOVER_SCALE},${HOVER_SCALE})`;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!isEnabled()) return;
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
    el.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
