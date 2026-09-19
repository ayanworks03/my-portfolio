import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

function splitChars(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'done') return [];
  const text = el.textContent ?? '';
  el.textContent = '';
  const out: HTMLElement[] = [];
  text.split(/(\s+)/).forEach((word) => {
    if (/^\s+$/.test(word)) {
      el.appendChild(document.createTextNode(' '));
      return;
    }
    const w = document.createElement('span');
    w.style.display = 'inline-block';
    w.style.whiteSpace = 'nowrap';
    for (const ch of word) {
      const holder = document.createElement('span');
      holder.style.display = 'inline-block';
      holder.style.overflow = 'hidden';
      holder.style.verticalAlign = 'bottom';
      const s = document.createElement('span');
      s.style.display = 'inline-block';
      s.textContent = ch;
      holder.appendChild(s);
      w.appendChild(holder);
      out.push(s);
    }
    el.appendChild(w);
  });
  el.dataset.split = 'done';
  return out;
}

export function useScrollMotion(headlineRef: React.RefObject<HTMLElement | null>, ready: boolean) {
  useEffect(() => {
    if (!ready) return;

    const triggers: ScrollTrigger[] = [];
    let lenis: Lenis | null = null;
    let lenisRaf = 0;

    try {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.09 });
      const onScroll = () => ScrollTrigger.update();
      lenis.on('scroll', onScroll);
      const raf = (t: number) => {
        lenis?.raf(t);
        lenisRaf = requestAnimationFrame(raf);
      };
      lenisRaf = requestAnimationFrame(raf);

      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (!id) return;
          const el = document.querySelector(id);
          if (el) {
            e.preventDefault();
            lenis?.scrollTo(el as HTMLElement, { offset: -20 });
          }
        });
      });
    } catch {
      /* smooth scroll is an enhancement; scroll still works natively without it */
    }

    if (headlineRef.current) {
      const letters = Array.from(headlineRef.current.children) as HTMLElement[];
      gsap.set(letters, { yPercent: 118, opacity: 0 });
      gsap.to(letters, { yPercent: 0, opacity: 1, duration: 1.05, ease: 'power4.out', stagger: 0.05, delay: 1.35 });
    }

    const heroBits = gsap.utils.toArray<HTMLElement>('#top [data-reveal]');
    gsap.fromTo(
      heroBits,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 1.6 },
    );

    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
      const chars = splitChars(el);
      if (!chars.length) return;
      gsap.set(chars, { yPercent: 110, opacity: 0 });
      const tw = gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.012,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
      if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
    });

    const rest = gsap.utils.toArray<HTMLElement>('[data-reveal]').filter((el) => !heroBits.includes(el));
    gsap.set(rest, { y: 22 });
    const batched = ScrollTrigger.batch(rest, {
      start: 'top 92%',
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08 }),
      onEnterBack: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.45 }),
    });
    if (batched) triggers.push(...batched);

    const refreshTimeout = setTimeout(() => ScrollTrigger.refresh(), 700);

    return () => {
      clearTimeout(refreshTimeout);
      cancelAnimationFrame(lenisRaf);
      lenis?.destroy();
      triggers.forEach((t) => {
        try {
          t.kill();
        } catch {
          /* already killed */
        }
      });
    };
  }, [ready, headlineRef]);
}
