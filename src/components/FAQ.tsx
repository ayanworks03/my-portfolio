import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LABEL: React.CSSProperties = { fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)' };

const FAQS = [
  {
    q: 'What does the process look like?',
    a: "Short cycles against something real. I scope the smallest version that proves the idea, build it on a device or in a live preview, then iterate from what you actually see — not from a spec document.",
  },
  {
    q: 'Web, mobile, or both?',
    a: 'Both, usually from one codebase — React for the web, React Native for iOS/Android. If the project only needs one, I keep the other out of scope rather than over-engineering for a platform nobody asked for.',
  },
  {
    q: 'How fast is turnaround?',
    a: "I reply within a day, and most builds move in weekly increments you can see running. Exact timelines depend on scope, but you'll never be waiting on a status update — there's always something to click through.",
  },
  {
    q: "Can you plug in AI features — chatbots, agents, automations?",
    a: "Yes — that's a regular part of the work, from a support agent answering off a knowledge base to background automations. I'm upfront about where AI genuinely helps versus where it's just noise.",
  },
  {
    q: 'Do you sign NDAs and handle IP transfer?',
    a: "Standard on any paid engagement. NDA before scoping if you need one, and full IP/code ownership transfers to you on completion — nothing stays locked to my accounts.",
  },
  {
    q: "I only need something small — is that worth reaching out?",
    a: 'Yes. A focused MVP or a single feature is often the better starting point anyway — it gives us a working build to make the bigger decisions against instead of guessing upfront.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(14px,2.4vw,28px)',
          padding: 'clamp(20px,2.8vh,30px) 0',
          background: 'none',
          border: 0,
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--fg)',
        }}
      >
        <span aria-hidden="true" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--muted-3)', flexShrink: 0 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span style={{ flex: 1, fontSize: 'clamp(16px,1.9vw,22px)', fontWeight: 500, letterSpacing: '-0.01em' }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: 999,
            border: '1px solid var(--border-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: open ? 'var(--accent)' : 'var(--muted)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                paddingBottom: 'clamp(20px,2.8vh,30px)',
                paddingLeft: 'clamp(38px,5.4vw,58px)',
                maxWidth: '62ch',
                fontSize: 15,
                lineHeight: 1.75,
                color: 'var(--muted)',
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <section
      id="faq"
      style={{ position: 'relative', zIndex: 2, padding: 'clamp(60px,9vh,110px) clamp(18px,4vw,54px)', background: 'rgba(7,9,12,0.9)' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', marginBottom: 'clamp(26px,4vh,48px)' }}>
        <h2 data-split style={{ fontSize: 'clamp(26px,4vw,52px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Questions, answered.
        </h2>
        <span style={LABEL}>FAQ · 06</span>
      </div>

      <div data-reveal style={{ borderTop: '1px solid var(--border)', maxWidth: 820 }}>
        {FAQS.map((item, i) => (
          <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
        ))}
      </div>
    </section>
  );
}
