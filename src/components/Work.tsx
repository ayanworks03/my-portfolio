import { motion } from 'framer-motion';
import { useTilt } from '../hooks/useTilt';

const LABEL: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.2em', color: 'var(--accent)' };
const CARD: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 6,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  willChange: 'transform',
};

export default function Work() {
  const tilt1 = useTilt<HTMLAnchorElement>();
  const tilt2 = useTilt<HTMLAnchorElement>();
  const tilt3 = useTilt<HTMLAnchorElement>();
  const tilt4 = useTilt<HTMLAnchorElement>();

  return (
    <section
      id="work"
      style={{ position: 'relative', zIndex: 2, padding: 'clamp(60px,9vh,110px) clamp(18px,4vw,54px)', background: 'rgba(7,9,12,0.88)' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', marginBottom: 'clamp(26px,4vh,48px)' }}>
        <h2 data-split style={{ fontSize: 'clamp(26px,4vw,52px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Selected projects
        </h2>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-3)' }}>
          04 PROJECTS · 2024—2026
        </span>
      </div>

      <div className="work-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,330px),1fr))', gap: 'clamp(14px,1.8vw,24px)' }}>
        <motion.a
          data-reveal
          href="#contact"
          className="work-card work-card--wide"
          ref={tilt1.ref}
          onMouseMove={tilt1.onMouseMove}
          onMouseLeave={tilt1.onMouseLeave}
          style={{ ...CARD, ...tilt1.style, gridColumn: 'span 2', minWidth: 0, background: 'linear-gradient(135deg,#10161f,#0a0e14)' }}
        >
          <div
            style={{
              aspectRatio: '21/9',
              position: 'relative',
              background:
                'radial-gradient(70% 120% at 20% 0%, rgba(var(--accent-rgb),0.16), rgba(10,14,20,0) 60%),repeating-linear-gradient(90deg,#141b25 0px,#141b25 1px,transparent 1px,transparent 54px),repeating-linear-gradient(0deg,#141b25 0px,#141b25 1px,transparent 1px,transparent 54px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted-2)' }}>
              [ HEXALOGIC — SITE SCREENSHOT ]
            </span>
          </div>
          <div style={{ padding: 'clamp(20px,2.2vw,32px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={LABEL}>01 · REACT · MARKETING SITE</span>
            <h3 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 700, letterSpacing: '-0.02em' }}>Hexalogic</h3>
            <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, maxWidth: '64ch' }}>
              Services and marketing site for a tech solutions company. A small component system lets the team assemble new pages without touching
              layout code.
            </p>
          </div>
        </motion.a>

        <motion.a
          data-reveal
          href="#contact"
          className="work-card"
          ref={tilt2.ref}
          onMouseMove={tilt2.onMouseMove}
          onMouseLeave={tilt2.onMouseLeave}
          style={{ ...CARD, ...tilt2.style, minWidth: 0, background: 'var(--card-bg)' }}
        >
          <div
            style={{
              aspectRatio: '4/3',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 10,
              padding: '26px 20px 0',
              background: 'linear-gradient(180deg,rgba(var(--accent-rgb),0.1),rgba(10,14,20,0))',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ width: '34%', aspectRatio: '9/17', border: '1px solid var(--border-2)', borderRadius: '14px 14px 0 0', background: '#0d131b' }} />
            <div style={{ width: '38%', aspectRatio: '9/17', border: '1px solid var(--border-3)', borderRadius: '14px 14px 0 0', background: '#111823' }} />
            <div style={{ width: '34%', aspectRatio: '9/17', border: '1px solid var(--border-2)', borderRadius: '14px 14px 0 0', background: '#0d131b' }} />
          </div>
          <div style={{ padding: 'clamp(18px,2vw,28px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={LABEL}>02 · REACT NATIVE</span>
            <h3 style={{ fontSize: 'clamp(20px,2.2vw,28px)', fontWeight: 700, letterSpacing: '-0.01em' }}>Recipe Finder</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
              Search by what's already in the kitchen. Saved collections and offline favourites, one codebase for both platforms.
            </p>
          </div>
        </motion.a>

        <motion.a
          data-reveal
          href="#contact"
          className="work-card"
          ref={tilt3.ref}
          onMouseMove={tilt3.onMouseMove}
          onMouseLeave={tilt3.onMouseLeave}
          style={{ ...CARD, ...tilt3.style, minWidth: 0, background: 'var(--card-bg)' }}
        >
          <div
            style={{
              aspectRatio: '4/3',
              position: 'relative',
              background: '#0b1017',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', width: '64%', aspectRatio: '1', border: '1px solid var(--border-2)', borderRadius: 999 }} />
            <div style={{ position: 'absolute', width: '64%', aspectRatio: '1', border: '1px solid #223040', borderRadius: 999, transform: 'scaleX(0.42)' }} />
            <div style={{ position: 'absolute', width: '64%', height: 1, background: '#223040' }} />
            <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: 999, background: 'var(--accent)', transform: 'translate(34px,-22px)' }} />
          </div>
          <div style={{ padding: 'clamp(18px,2vw,28px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={LABEL}>03 · REACT NATIVE</span>
            <h3 style={{ fontSize: 'clamp(20px,2.2vw,28px)', fontWeight: 700, letterSpacing: '-0.01em' }}>Country Finder</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
              Browse countries by region against live data, with search, filters and a detail view for every country.
            </p>
          </div>
        </motion.a>

        <motion.a
          data-reveal
          href="#contact"
          className="work-card work-card--wide"
          ref={tilt4.ref}
          onMouseMove={tilt4.onMouseMove}
          onMouseLeave={tilt4.onMouseLeave}
          style={{
            ...CARD,
            ...tilt4.style,
            gridColumn: 'span 2',
            minWidth: 0,
            background: 'var(--card-bg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))',
          }}
        >
          <div style={{ padding: 'clamp(20px,2.2vw,32px)', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
            <span style={LABEL}>04 · AI / AUTOMATION</span>
            <h3 style={{ fontSize: 'clamp(22px,2.6vw,34px)', fontWeight: 700, letterSpacing: '-0.02em' }}>Support Agent</h3>
            <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, maxWidth: '48ch' }}>
              Placeholder slot — an agent answering from a company knowledge base, escalating to a human when confidence drops. Swap in your own
              fourth project.
            </p>
          </div>
          <div
            style={{
              minHeight: 200,
              borderLeft: '1px solid var(--border)',
              padding: 'clamp(18px,2vw,28px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              justifyContent: 'center',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 11,
              color: 'var(--muted-3)',
              background: '#080c11',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>user › where is my order?</span>
            <span>agent › checking order #4412…</span>
            <span>agent › shipped tuesday, arriving thu.</span>
            <span style={{ color: '#4b535e' }}>— 0.8s · 2 tools called</span>
          </div>
        </motion.a>
      </div>
    </section>
  );
}
