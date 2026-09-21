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
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

const BASE_SIZE = 40;
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
  panelHeight: number;
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

  return (
    <motion.div
      onMouseMove={({ pageX }) => mouseX.set(pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={className}
      style={{
        // fixed height — this panel never resizes or shifts. Items align to
        // its top edge (see DockItem's restOffset/marginTop) so a magnified
        // item's top stays put and only its bottom grows — it pops out from
        // underneath the dock instead of the whole dock growing/moving.
        height: panelHeight,
        display: 'flex',
        alignItems: 'flex-start',
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
      <DockContext.Provider value={{ mouseX, spring, distance, magnification, panelHeight }}>{children}</DockContext.Provider>
    </motion.div>
  );
}

export function DockItem({ children, className, onClick, href }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, mouseX, spring, panelHeight } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(mouseDistance, [-distance, 0, distance], [BASE_SIZE, magnification, BASE_SIZE]);
  const width = useSpring(widthTransform, spring);

  // The panel aligns items to its top edge (not centered) so growth only
  // ever extends downward. This constant top margin re-centers the item
  // at rest, within that same top-anchored flow — no per-frame offset
  // needed, since a taller/shorter box just keeps its top fixed.
  const restOffset = (panelHeight - BASE_SIZE) / 2;

  const content = Children.map(children, (child) => cloneElement(child as ReactElement, { width, isHovered } as Record<string, unknown>));
  const shared = {
    ref: ref as never,
    style: {
      width,
      height: width,
      marginTop: restOffset,
      borderRadius: '50%',
      background: '#12161c',
      border: '1px solid rgba(255,255,255,0.08)',
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'inherit',
      textDecoration: 'none',
      flexShrink: 0,
    } as const,
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
          animate={{ opacity: 1, y: 10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
          role="tooltip"
          style={{
            position: 'absolute',
            // the item's own height grows downward on hover (its top edge
            // stays put — see DockItem's restOffset), so anchoring to its
            // bottom (100%) rather than a fixed px offset keeps the label
            // following that growing edge instead of getting swallowed by it.
            top: '100%',
            marginTop: 8,
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
