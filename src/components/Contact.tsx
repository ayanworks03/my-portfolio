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

const ROW_ICON: React.CSSProperties = { width: 20, height: 20, flexShrink: 0, marginTop: 3, color: 'var(--muted)' };
const ROW_LABEL: React.CSSProperties = { fontSize: 17, fontWeight: 600, color: 'var(--fg)' };
const ROW_VALUE: React.CSSProperties = { fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' };

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {icon}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={ROW_LABEL}>{label}</span>
        {children}
      </div>
    </div>
  );
}

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))',
          gap: 'clamp(28px,4vw,64px)',
          alignItems: 'start',
          marginBottom: 'clamp(48px,7vh,88px)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2 data-split style={{ fontSize: 'clamp(30px,5.6vw,76px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
            Tell me what you're building.
          </h2>
          <p data-reveal style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.75, maxWidth: '42ch' }}>
            Freelance and contract work, mobile or web. Send a short brief and I'll reply within a day.
          </p>
        </div>

        <div data-reveal style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3.4vh,34px)', fontFamily: "'Inter',sans-serif" }}>
          <InfoRow
            label="Availability"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={ROW_ICON}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          >
            <span style={ROW_VALUE}>Usually replies within 24 hours</span>
          </InfoRow>

          <InfoRow
            label="Phone"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={ROW_ICON}>
                <path
                  d="M6.6 3.8 9.2 8.3c.3.5.2 1.1-.2 1.5L7.3 11.5c1 2.3 3 4.3 5.3 5.3l1.7-1.7c.4-.4 1-.5 1.5-.2l4.5 2.6c.6.3.8 1.1.4 1.6l-1.6 2.1c-.4.5-1 .8-1.6.8C9.9 22 2 14.1 2 4.6c0-.6.3-1.2.8-1.6L4.9 1.4c.5-.4 1.3-.2 1.6.4Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            <a href="tel:+923240146711" style={{ ...ROW_VALUE, display: 'block' }}>
              0324 0146711
            </a>
          </InfoRow>

          <InfoRow
            label="Mail"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={ROW_ICON}>
                <rect x="2.5" y="5" width="19" height="14" rx="2.4" />
                <path d="M3.5 6.5 12 13l8.5-6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          >
            <a href="mailto:ayan.works.03@gmail.com" style={{ ...ROW_VALUE, display: 'block' }}>
              ayan.works.03@gmail.com
            </a>
          </InfoRow>

          <InfoRow
            label="Follow"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={ROW_ICON}>
                <path
                  d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <a href="https://github.com/ayanworks03" target="_blank" rel="noreferrer" className="social-btn" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/ayan-works" target="_blank" rel="noreferrer" className="social-btn" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.89 1.63-1.85 3.35-1.85 3.59 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
                </svg>
              </a>
              <a href="#top" style={{ ...ROW_VALUE, marginLeft: 4 }}>
                Résumé ↓
              </a>
            </div>
          </InfoRow>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 'clamp(28px,4vw,64px)', alignItems: 'center' }}>
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
            maxWidth: 640,
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

        <div data-reveal style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: "'Poppins',Helvetica,Arial,sans-serif", fontSize: 'clamp(26px,3.4vw,42px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Let's start the conversation.
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.75, maxWidth: '38ch' }}>
            A few lines about what you're building is enough to start — I'll read it myself and reply with real next steps, not a template.
          </p>
        </div>
      </div>
    </section>
  );
}
