import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import './App.css';
import Loader from './components/Loader';
import Header from './components/Header';
import NavDock from './components/NavDock';
import Hero from './components/Hero';
import Ethos from './components/Ethos';
import Work from './components/Work';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ThemeSwitcher from './components/ThemeSwitcher';
import CustomCursor from './components/CustomCursor';
import { useScrollMotion } from './hooks/useScrollMotion';
import { loadTheme, saveTheme, type Theme } from './theme';

// Three.js accounts for most of the JS bundle and is purely decorative —
// splitting it into its own chunk lets the rest of the page (text, nav,
// form) paint without waiting on it to download.
const SmokeField = lazy(() => import('./components/SmokeField'));

export default function App() {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);

  useScrollMotion(headlineRef, ready);

  // useLayoutEffect (not useEffect): the whole tree's layout effects finish
  // before ANY component's passive effects run, so this is guaranteed to
  // set the CSS variables before SmokeField's own (passive) effect reads
  // them to re-sync the shader's accent uniform — with plain useEffect,
  // child-before-parent ordering meant SmokeField read the stale value.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  return (
    <div style={{ position: 'relative', background: 'var(--bg)', overflowX: 'hidden' }}>
      <Loader onDone={() => setReady(true)} />
      <CustomCursor />

      <Suspense fallback={null}>
        <SmokeField theme={theme} />
      </Suspense>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(7,9,12,0) 0%, rgba(7,9,12,0) 62%, rgba(7,9,12,0.55) 100%)',
        }}
      />

      <Header />
      <NavDock />

      <Hero ref={headlineRef} />
      <Ethos />
      <Work />
      <Contact />
      <Footer />

      <ThemeSwitcher theme={theme} onChange={setTheme} />
    </div>
  );
}
