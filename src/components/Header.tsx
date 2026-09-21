export default function Header() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px clamp(18px,4vw,54px)',
      }}
    >
      <a href="#top" style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 500, letterSpacing: '0.04em' }}>
        AA<span style={{ color: 'var(--accent)' }}>.</span>
      </a>
    </header>
  );
}
