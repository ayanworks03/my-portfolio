import { Dock, DockIcon, DockItem, DockLabel } from './Dock';

const ICON: React.CSSProperties = { width: '52%', height: '52%' };

const ITEMS = [
  {
    href: '#ethos',
    label: 'Ethos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={ICON}>
        <path d="M12 2 13.8 8.6 20.4 10.4 13.8 12.2 12 18.8 10.2 12.2 3.6 10.4 10.2 8.6 12 2Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '#work',
    label: 'Work',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={ICON}>
        <rect x="3" y="7.5" width="18" height="12" rx="2" />
        <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12.5h18" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function NavDock() {
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, top: 'clamp(14px,3vh,26px)', zIndex: 45, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
        <Dock>
          {ITEMS.map((item) => (
            <DockItem key={item.href} href={item.href}>
              <DockIcon>{item.icon}</DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          ))}
        </Dock>
      </div>
    </div>
  );
}
