import { useRef, useState } from 'react';
import './App.css';
import Loader from './components/Loader';
import GlowField from './components/GlowField';
import Header from './components/Header';
import Hero from './components/Hero';
import Ethos from './components/Ethos';
import Work from './components/Work';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useScrollMotion } from './hooks/useScrollMotion';

export default function App() {
  const [ready, setReady] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);

  useScrollMotion(headlineRef, ready);

  return (
    <div style={{ position: 'relative', background: 'var(--bg)', overflowX: 'hidden' }}>
      <Loader onDone={() => setReady(true)} />

      <GlowField />
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

      <Hero ref={headlineRef} />
      <Ethos />
      <Work />
      <Contact />
      <Footer />
    </div>
  );
}
