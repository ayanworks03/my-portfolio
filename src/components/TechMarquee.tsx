const ICON: React.CSSProperties = { width: 18, height: 18, flexShrink: 0 };

const ITEMS = [
  {
    label: 'React',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={ICON}>
        <ellipse cx="12" cy="12" rx="10" ry="4.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'React Native',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={ICON}>
        <rect x="6.5" y="2.5" width="11" height="19" rx="2.4" />
        <path d="M10 18.5h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'TypeScript',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={ICON}>
        <rect x="2.5" y="2.5" width="19" height="19" rx="4" />
        <path d="M7 8h5M9.5 8v8" strokeLinecap="round" />
        <path d="M14.5 14.3c0 1 .9 1.7 2 1.7s2-.5 2-1.4c0-2-4-1.1-4-3.1 0-.9.9-1.5 2-1.5s1.9.5 2 1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Node.js',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={ICON}>
        <path d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Three.js',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={ICON}>
        <path d="M12 3 21 19H3Z" strokeLinejoin="round" />
        <path d="M12 10 16.5 19H7.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Framer Motion',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={ICON}>
        <path d="M4 3h16v6.5h-8L20 17v.01H12v-.01L4 9.5Z" />
        <path d="M4 3h8l8 6.5h-8L4 3Z" opacity="0.45" />
      </svg>
    ),
  },
  {
    label: 'GSAP',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={ICON}>
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
      </svg>
    ),
  },
  {
    label: 'AI Agents',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={ICON}>
        <circle cx="5" cy="12" r="2.2" />
        <circle cx="19" cy="6" r="2.2" />
        <circle cx="19" cy="18" r="2.2" />
        <path d="M7 12h10M7.3 11 17 6.6M7.3 13l9.7 4.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

function MarqueeSet() {
  return (
    <>
      {ITEMS.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 clamp(24px,4vw,52px)', color: 'var(--muted)' }}>
          {item.icon}
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.label}</span>
        </div>
      ))}
    </>
  );
}

export default function TechMarquee() {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: 'clamp(14px,2.2vh,20px) 0',
        background: 'linear-gradient(90deg, rgba(var(--accent-rgb),0.14), rgba(7,9,12,0) 55%)',
      }}
    >
      <div className="marquee-track">
        <MarqueeSet />
        <MarqueeSet />
      </div>
    </div>
  );
}
