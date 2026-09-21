import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring, type MotionStyle } from 'framer-motion';
import { readAccentRgb } from '../lib/readAccentRgb';

const MAX_TILT_DEG = 8;
const HOVER_SCALE = 1.045; // "a little bigger" on hover
const PERSPECTIVE = 700;
const GLOW_RADIUS = 260; // px

// spring, not a fixed-duration easing curve — gives the settle-back-to-flat
// a bit of natural overshoot/bounce instead of a mechanically linear glide.
const SPRING = { stiffness: 300, damping: 22, mass: 0.6 };

// Drives two effects off one mousemove: a 3D tilt on the card itself, and a
// "spotlight border" glow that tracks the cursor. The border technique: the
// outer wrapper's own background is the resting border colour, a glow div
// the same size sits on top of that (radial gradient, fades in on hover),
// and the actual card sits on top of both with its own solid background —
// covering everything except the wrapper's padding, so only that thin rim
// ever shows the border colour or the glow.
//
// The tilt itself is now driven by framer-motion springs (useMotionValue +
// useSpring) instead of writing transform strings by hand — `style` below
// is meant to be spread onto a <motion.a>, which subscribes to the springs
// directly and repaints on its own, no per-frame DOM writes needed here.
export function useTiltSpotlight<TWrap extends HTMLElement>() {
  const wrapRef = useRef<TWrap | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
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
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const glow = glowRef.current;
      if (glow) {
        glow.style.background = `radial-gradient(${GLOW_RADIUS}px circle at ${x}px ${y}px, rgba(${readAccentRgb()},0.95), transparent 70%)`;
        glow.style.opacity = '1';
      }

      const px = x / rect.width;
      const py = y / rect.height;
      rotateY.set((px - 0.5) * 2 * MAX_TILT_DEG);
      rotateX.set(-(py - 0.5) * 2 * MAX_TILT_DEG);
      scale.set(HOVER_SCALE);
    },
    [rotateX, rotateY, scale],
  );

  const onMouseLeave = useCallback(() => {
    if (!isEnabled()) return;
    const glow = glowRef.current;
    if (glow) glow.style.opacity = '0';
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, scale]);

  const style: MotionStyle = {
    perspective: PERSPECTIVE,
    rotateX: springRotateX,
    rotateY: springRotateY,
    scale: springScale,
  };

  return { wrapRef, glowRef, onMouseMove, onMouseLeave, style };
}
