import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring, useTransform, type MotionStyle } from 'framer-motion';

const MAX_TILT_DEG = 8;
const HOVER_SCALE = 1.045; // "a little bigger" on hover
const PERSPECTIVE = 700;

// Matches Motion Primitives' Spotlight component: a small blurred circle
// that *moves* (spring-animated left/top) rather than a full-size div whose
// gradient coordinates get rewritten every mousemove — softer and gives the
// glow a bit of trailing lag on fast cursor movement instead of being glued
// exactly under it.
const GLOW_SIZE = 320; // px
const GLOW_BLUR = 18; // px
const GLOW_SPRING = { bounce: 0 }; // matches the reference's default (critically damped, no overshoot)

// tilt springiness — a bit more bounce than the glow, since it's a mass/
// stiffness/damping spring rather than a bounce-tuned one.
const TILT_SPRING = { stiffness: 300, damping: 22, mass: 0.6 };

// Drives three effects off one mousemove: a 3D tilt on the card itself, and
// a "spotlight border" glow that tracks the cursor. The border technique:
// the outer wrapper's own background is the resting border colour, the glow
// circle sits on top of that (inside the same padding gap), and the actual
// card sits on top of both with its own solid background — covering
// everything except the wrapper's padding, so only that thin rim ever shows
// the border colour or the glow.
export function useTiltSpotlight<TWrap extends HTMLElement>() {
  const wrapRef = useRef<TWrap | null>(null);
  const glowOpacityRef = useRef<HTMLDivElement | null>(null);
  const enabled = useRef<boolean | null>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);
  const springRotateX = useSpring(rotateX, TILT_SPRING);
  const springRotateY = useSpring(rotateY, TILT_SPRING);
  const springScale = useSpring(scale, TILT_SPRING);

  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springGlowX = useSpring(glowX, GLOW_SPRING);
  const springGlowY = useSpring(glowY, GLOW_SPRING);
  const glowLeft = useTransform(springGlowX, (x) => `${x - GLOW_SIZE / 2}px`);
  const glowTop = useTransform(springGlowY, (y) => `${y - GLOW_SIZE / 2}px`);

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

      glowX.set(x);
      glowY.set(y);
      if (glowOpacityRef.current) glowOpacityRef.current.style.opacity = '1';

      const px = x / rect.width;
      const py = y / rect.height;
      rotateY.set((px - 0.5) * 2 * MAX_TILT_DEG);
      rotateX.set(-(py - 0.5) * 2 * MAX_TILT_DEG);
      scale.set(HOVER_SCALE);
    },
    [rotateX, rotateY, scale, glowX, glowY],
  );

  const onMouseLeave = useCallback(() => {
    if (!isEnabled()) return;
    if (glowOpacityRef.current) glowOpacityRef.current.style.opacity = '0';
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

  const glowStyle: MotionStyle = {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    left: glowLeft,
    top: glowTop,
    borderRadius: '50%',
    // reads --accent-rgb live, so it automatically matches whichever theme
    // is active without any JS re-computation.
    background: 'radial-gradient(circle at center, rgba(var(--accent-rgb),0.95), transparent 75%)',
    filter: `blur(${GLOW_BLUR}px)`,
    opacity: 0,
    transition: 'opacity 0.25s ease',
    pointerEvents: 'none',
  };

  return { wrapRef, glowRef: glowOpacityRef, onMouseMove, onMouseLeave, style, glowStyle };
}
