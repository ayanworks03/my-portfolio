import { THEMES, THEME_META, type Theme } from '../theme';

export default function ThemeSwitcher({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  return (
    // No solid pill/backdrop-blur behind these — this widget is `position:
    // fixed`, so it scrolls over arbitrary body text on a long page (it was
    // previously found overlapping and blocking paragraph text on mobile).
    // Individual dots with a drop-shadow for contrast keep the "blocked"
    // area down to a few small circles instead of a wide opaque rectangle.
    <div
      style={{
        position: 'fixed',
        right: 'clamp(12px,3vw,28px)',
        bottom: 'clamp(12px,3vw,28px)',
        zIndex: 50,
        display: 'flex',
        gap: 'clamp(8px,1.6vw,10px)',
        alignItems: 'center',
      }}
    >
      {THEMES.map((t) => {
        const active = t === theme;
        return (
          <button
            key={t}
            type="button"
            className="theme-swatch"
            onClick={() => onChange(t)}
            aria-label={`${THEME_META[t].label} theme`}
            aria-pressed={active}
            title={THEME_META[t].label}
            style={
              {
                width: 'clamp(14px,3.4vw,18px)',
                height: 'clamp(14px,3.4vw,18px)',
                padding: 0,
                borderRadius: '50%',
                background: THEME_META[t].swatch,
                border: active ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.5)',
                boxShadow: active
                  ? `0 1px 4px rgba(0,0,0,0.6), 0 0 10px ${THEME_META[t].swatch}`
                  : '0 1px 4px rgba(0,0,0,0.6)',
                cursor: 'pointer',
                // --swatch-base is inline (this component's own active-state
                // scale); App.css's .theme-swatch:hover bumps
                // --swatch-hover-scale on top of it via calc(), since a
                // plain CSS :hover{transform} rule would otherwise just be
                // overridden by this inline style.
                '--swatch-base': active ? 1.08 : 1,
                transform: 'scale(calc(var(--swatch-base) * var(--swatch-hover-scale, 1)))',
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
