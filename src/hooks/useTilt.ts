import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring, type MotionStyle } from 'framer-motion';

const MAX_TILT_DEG = 8;
const HOVER_SCALE = 1.045; // "a little bigger" on hover

// spring, not a fixed-duration easing curve — gives the settle-back-to-flat
// a bit of natural overshoot/bounce instead of a mechanically linear glide,
// matching how Motion Primitives' own <Tilt> animates.
const SPRING = { stiffness: 300, damping: 22, mass: 0.6 };

// Real-time 3D tilt that follows the cursor within an element's bounds,
// easing back to flat on leave. rotateX/rotateY/scale are framer-motion
// springs bound directly into `style` (meant to be spread onto a
// <motion.a>/<motion.div>), so the element repaints on its own — no manual
// per-frame DOM writes needed here.
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const enabled = useRef<boolean | null>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);
  const springRotateX = useSpring(rotateX, SPRING);
  const springRotateY = useSpring(rotateY, SPRING);
  const springScale = useSpring(scale, SPRING);

  const isEnabled = () => {
    if (enabled.current === null) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      enabled.current = !reduceMotion && canHover;
    }
    return enabled.current;
  };

  const onMouseMove = useCallback(
    (e: { clientX: number; clientY: number }) => {
      if (!isEnabled()) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rotateY.set((px - 0.5) * 2 * MAX_TILT_DEG);
      rotateX.set(-(py - 0.5) * 2 * MAX_TILT_DEG);
      scale.set(HOVER_SCALE);
    },
    [rotateX, rotateY, scale],
  );

  const onMouseLeave = useCallback(() => {
    if (!isEnabled()) return;
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, scale]);

  const style: MotionStyle = {
    perspective: 700,
    rotateX: springRotateX,
    rotateY: springRotateY,
    scale: springScale,
  };

  return { ref, onMouseMove, onMouseLeave, style };
}
