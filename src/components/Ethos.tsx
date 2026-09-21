export default function Ethos() {
  return (
    <section
      id="ethos"
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(60px,9vh,110px) clamp(18px,4vw,54px)',
        background: 'linear-gradient(180deg,rgba(7,9,12,0.15),rgba(7,9,12,0.88) 40%,rgba(7,9,12,0.88))',
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: 6,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          minHeight: 'clamp(380px,62vh,620px)',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(115deg,#111721 0px,#111721 9px,#0b0f15 9px,#0b0f15 18px)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 'clamp(16px,2vw,28px)' }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: '0.2em', color: 'var(--muted-2)', textAlign: 'right', maxWidth: '22ch' }}>
            [ FULL-BLEED PORTRAIT / WORKSPACE IMAGE — DROP YOURS HERE ]
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg,rgba(7,9,12,0.15) 0%,rgba(7,9,12,0.55) 45%,rgba(7,9,12,0.94) 100%)',
          }}
        />
        <div style={{ position: 'relative', padding: 'clamp(24px,4vw,58px)', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
          <span data-reveal style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: '0.22em', color: 'var(--accent)' }}>
            ETHOS / 01
          </span>
          <h2 data-split style={{ fontSize: 'clamp(28px,5vw,66px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.04 }}>
            Ship the smallest thing that proves the idea. Then make it fast.
          </h2>
          <p data-reveal style={{ fontSize: 'clamp(15px,1.4vw,18px)', lineHeight: 1.75, color: 'var(--muted)', maxWidth: '58ch' }}>
            Most projects fail on scope, not on code. I work in short cycles against something real on a device, so decisions are made against a
            working build instead of a document.
          </p>
        </div>
      </div>
    </section>
  );
}
