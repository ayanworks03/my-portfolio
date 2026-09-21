import { forwardRef } from 'react';
import LetterField from './LetterField';
import { Magnetic } from './Magnetic';

const Hero = forwardRef<HTMLHeadingElement>(function Hero(_props, ref) {
  return (
    <section
      id="top"
      style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '104px clamp(18px,4vw,54px) 34px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', display: 'block' }} />
          <span
            data-reveal
            style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: '0.22em', color: '#dfe4eb', textTransform: 'uppercase' }}
          >
            Building quietly, shipping often.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(40px,6vh,80px)', padding: 'clamp(18px,4vh,48px) 0' }}>
        <LetterField ref={ref} text="AYAN ALI" />
        <div data-reveal style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,2vw,26px)' }}>
          <span style={{ width: 'clamp(24px,6vw,90px)', height: 1, background: 'var(--border-2)', display: 'block' }} />
          <p
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: 'clamp(9px,1.05vw,13px)',
              letterSpacing: '0.34em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            Interfaces, agents, and the wiring in between.
          </p>
          <span style={{ width: 'clamp(24px,6vw,90px)', height: 1, background: 'var(--border-2)', display: 'block' }} />
        </div>

        <div data-reveal style={{ padding: 36 }}>
          <Magnetic intensity={0.4} range={140} actionArea="parent">
            <a
              href="#contact"
              className="btn-accent"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 16,
                fontSize: 20,
                fontWeight: 600,
                padding: '24px 44px',
                background: 'var(--accent)',
                color: 'var(--bg)',
                borderRadius: 999,
              }}
            >
              Get in touch
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </Magnetic>
        </div>
      </div>

      <div
        data-reveal
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 'clamp(18px,2.6vh,30px)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'clamp(22px,3vw,48px)',
          alignItems: 'flex-start',
        }}
      >
        <p style={{ flex: '1 1 240px', minWidth: 0, fontSize: 'clamp(14px,1.25vw,17px)', lineHeight: 1.6, color: 'var(--muted)', maxWidth: '36ch' }}>
          Full-stack mobile and web developer building React and React Native products, and the AI agents, chatbots and automations running underneath
          them.
        </p>

        <div style={{ flex: '2 1 320px', minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 'clamp(10px,1.6vw,26px)' }}>
          {[
            { n: '4+', l: 'YEARS<br>SHIPPING' },
            { n: '2', l: 'PLATFORMS,<br>ONE CODEBASE' },
            { n: '<24h', l: 'REPLY<br>TIME' },
          ].map((s) => (
            <div key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: "'Poppins',Helvetica,Arial,sans-serif", fontSize: 'clamp(22px,2.6vw,36px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {s.n}
              </span>
              <span
                style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted-2)', lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{ __html: s.l }}
              />
            </div>
          ))}
        </div>

        <a
          href="#work"
          className="btn-accent"
          style={{
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 15,
            fontWeight: 500,
            padding: '14px 26px 14px 14px',
            background: 'var(--accent)',
            color: 'var(--bg)',
            borderRadius: 999,
          }}
        >
          <span style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(7,9,12,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
            ↗
          </span>
          Explore work →
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 22 }}>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, letterSpacing: '0.3em', color: '#c3cad3' }}>SCROLL</span>
      </div>
    </section>
  );
});

export default Hero;
