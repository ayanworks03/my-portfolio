export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 2,
        background: 'rgba(7,9,12,0.92)',
        borderTop: '1px solid var(--border)',
        padding: '26px clamp(18px,4vw,54px)',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 11,
        color: 'var(--muted-3)',
      }}
    >
      <span>AYAN ALI © 2026</span>
      <span>MOBILE · WEB · AI</span>
    </footer>
  );
}
