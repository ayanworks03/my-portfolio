import { useCallback, useRef } from 'react';
import { readAccentRgb } from '../lib/readAccentRgb';

const MAX_TILT_DEG = 8;
const HOVER_SCALE = 1.045; // "a little bigger" on hover
const PERSPECTIVE = 700;
const GLOW_RADIUS = 260; // px

// Drives two effects off one mousemove: a 3D tilt on the card itself, and a
// "spotlight border" glow that tracks the cursor. The border technique: the
// outer wrapper's own background is the resting border colour, a glow div
// the same size sits on top of that (radial gradient, fades in on hover),
// and the actual card sits on top of both with its own solid background —
// covering everything except the wrapper's padding, so only that thin rim
// ever shows the border colour or the glow.
export function useTiltSpotlight<TWrap extends HTMLElement, TCard extends HTMLElement>() {
  const wrapRef = useRef<TWrap | null>(null);
  const cardRef = useRef<TCard | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
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

    const card = cardRef.current;
    if (card) {
      const px = x / rect.width;
      const py = y / rect.height;
      const rotateY = (px - 0.5) * 2 * MAX_TILT_DEG;
      const rotateX = -(py - 0.5) * 2 * MAX_TILT_DEG;
      card.style.transition = 'transform 0.08s linear';
      card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${HOVER_SCALE},${HOVER_SCALE},${HOVER_SCALE})`;
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!isEnabled()) return;
    const glow = glowRef.current;
    if (glow) glow.style.opacity = '0';

    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
      card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    }
  }, []);

  return { wrapRef, cardRef, glowRef, onMouseMove, onMouseLeave };
}
