import { THEMES, THEME_META, type Theme } from '../theme';

export default function ThemeSwitcher({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 'clamp(14px,3vw,28px)',
        bottom: 'clamp(14px,3vw,28px)',
        zIndex: 50,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '9px 11px',
        borderRadius: 999,
        background: 'rgba(13,18,25,0.72)',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {THEMES.map((t) => {
        const active = t === theme;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            aria-label={`${THEME_META[t].label} theme`}
            aria-pressed={active}
            title={THEME_META[t].label}
            style={{
              width: 18,
              height: 18,
              padding: 0,
              borderRadius: '50%',
              background: THEME_META[t].swatch,
              border: active ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.28)',
              boxShadow: active ? `0 0 0 2px rgba(0,0,0,0.4), 0 0 10px ${THEME_META[t].swatch}` : 'none',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
              transform: active ? 'scale(1.08)' : 'scale(1)',
            }}
          />
        );
      })}
    </div>
  );
}
