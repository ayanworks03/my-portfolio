// Ported from Motion Primitives' <Dock> (https://motion-primitives.com/docs/dock),
// swapping its Tailwind classes for this project's inline-style + CSS-var
// theming — the animation logic (mouseX-driven width springs, magnification
// falloff) is kept as-is.
import {
  motion,
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

const DOCK_HEIGHT = 120;
const DEFAULT_MAGNIFICATION = 84;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 68;

type DockProps = {
  children: ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
};

type DockLabelProps = {
  className?: string;
  children: ReactNode;
};

type DockIconProps = {
  className?: string;
  children: ReactNode;
};

type DockContextType = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};

const DockContext = createContext<DockContextType | undefined>(undefined);

function useDock() {
  const context = useContext(DockContext);
  if (!context) throw new Error('useDock must be used within a Dock');
  return context;
}

export function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(() => Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4), [magnification]);
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={className}
        style={{
          height: panelHeight,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '0 20px',
          borderRadius: 999,
          background: 'rgba(13,18,25,0.72)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid var(--border-2)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        }}
        role="toolbar"
        aria-label="Section navigation"
      >
        <DockContext.Provider value={{ mouseX, spring, distance, magnification }}>{children}</DockContext.Provider>
      </motion.div>
    </motion.div>
  );
}

export function DockItem({ children, className, onClick, href }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(mouseDistance, [-distance, 0, distance], [40, magnification, 40]);
  const width = useSpring(widthTransform, spring);

  const content = Children.map(children, (child) => cloneElement(child as ReactElement, { width, isHovered } as Record<string, unknown>));
  const shared = {
    ref: ref as never,
    style: { width, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'inherit', textDecoration: 'none' } as const,
    onHoverStart: () => isHovered.set(1),
    onHoverEnd: () => isHovered.set(0),
    onFocus: () => isHovered.set(1),
    onBlur: () => isHovered.set(0),
    onClick,
    className,
    tabIndex: 0,
  };

  // Real <a href> so the site-wide anchor-click listener in useScrollMotion
  // (which wires up Lenis smooth-scroll for every `a[href^="#"]`) picks
  // these up the same way as any other in-page link.
  if (href) {
    return (
      <motion.a href={href} aria-haspopup="true" {...shared}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div role="button" aria-haspopup="true" {...shared}>
      {content}
    </motion.div>
  );
}

export function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as MotionValue<number>;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', (latest) => setIsVisible(latest === 1));
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
          role="tooltip"
          style={{
            position: 'absolute',
            top: -30,
            left: '50%',
            x: '-50%',
            whiteSpace: 'pre',
            borderRadius: 6,
            border: '1px solid var(--border-2)',
            background: '#161d27',
            padding: '4px 9px',
            fontSize: 11,
            letterSpacing: '0.04em',
            color: 'var(--fg)',
            fontFamily: "'Inter',sans-serif",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const width = restProps['width'] as MotionValue<number>;
  const widthTransform = useTransform(width, (val) => val / 2);

  return (
    <motion.div style={{ width: widthTransform, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg)' }} className={className}>
      {children}
    </motion.div>
  );
}
