import { useState } from 'react';

const FIELD: React.CSSProperties = {
  background: 'transparent',
  border: 0,
  borderBottom: '1px solid #222a35',
  color: 'var(--fg)',
  fontSize: 15,
  padding: '12px 2px',
  // no outline:none here — that would defeat index.css's :focus-visible
  // ring (an inline style always wins over an external stylesheet rule),
  // leaving keyboard users with only the underline-color change as
  // feedback.
};

// Visually identical to having no label (placeholder still carries the
// visible design), but gives screen readers a persistent name for the
// field instead of losing it the moment the placeholder is replaced by
// typed text.
const SR_ONLY: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(60px,9vh,110px) clamp(18px,4vw,54px) clamp(50px,7vh,90px)',
        background: 'rgba(7,9,12,0.9)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 'clamp(28px,4vw,64px)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2 data-split style={{ fontSize: 'clamp(30px,5.6vw,76px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
            Tell me what you're building.
          </h2>
          <p data-reveal style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.75, maxWidth: '42ch' }}>
            Freelance and contract work, mobile or web. Send a short brief and I'll reply within a day.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              borderTop: '1px solid var(--border)',
              paddingTop: 24,
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 13,
              color: 'var(--muted)',
            }}
          >
            <a href="mailto:ayan.works.03@gmail.com">ayan.works.03@gmail.com</a>
            <a href="tel:+923240146711">0324 0146711</a>
            <div style={{ display: 'flex', gap: 18, paddingTop: 4 }}>
              <a href="https://github.com/ayanworks03" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/ayan-works" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href="#top">Résumé ↓</a>
            </div>
          </div>
        </div>

        <form
          data-reveal
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: 'clamp(20px,2.6vw,38px)',
            background: 'rgba(13,18,25,0.7)',
          }}
        >
          <label htmlFor="contact-name" style={SR_ONLY}>
            Name
          </label>
          <input id="contact-name" name="name" type="text" placeholder="Name" className="field-input" style={FIELD} required />

          <label htmlFor="contact-email" style={SR_ONLY}>
            E-mail
          </label>
          <input id="contact-email" name="email" type="email" placeholder="E-mail" className="field-input" style={FIELD} required />

          <label htmlFor="contact-budget" style={SR_ONLY}>
            Budget / timeline
          </label>
          <input id="contact-budget" name="budget" type="text" placeholder="Budget / timeline" className="field-input" style={FIELD} />

          <label htmlFor="contact-message" style={SR_ONLY}>
            What are you building?
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            placeholder="What are you building?"
            className="field-input"
            style={{ ...FIELD, resize: 'vertical' }}
            required
          />
          <button
            type="submit"
            className="btn-accent"
            style={{
              alignSelf: 'flex-start',
              fontSize: 15,
              fontWeight: 500,
              padding: '14px 30px',
              background: 'var(--accent)',
              color: 'var(--bg)',
              border: 0,
              borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            {sent ? 'Sent ✓' : 'Send message →'}
          </button>
        </form>
      </div>
    </section>
  );
}
