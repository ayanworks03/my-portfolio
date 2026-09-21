import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Theme } from '../theme';

// The reveal boundary is computed per-pixel in-shader (not a CSS mask), so
// it can be distorted by the same noise driving the smoke itself — the
// edge reads as cloud/smoke pulling back rather than a hard geometric
// circle, while still following the cursor smoothly.
const CANVAS_SCALE = 0.32;
const BASE_RADIUS = 260 * CANVAS_SCALE; // canvas px, roughly matches the old mask's size
const EDGE_SOFTNESS = 70 * CANVAS_SCALE; // canvas px width of the soft transition band
const RADIUS_NOISE_AMOUNT = 0.55; // how much the boundary bulges/recedes (fraction of BASE_RADIUS)
const AMBIENT_REVEAL = 0.1; // baseline visibility with the spotlight far away

// The reveal follows a short trail of recent positions rather than a single
// lagging point — moving fast stretches it into a wake behind the cursor,
// like something dragging through water; holding still collapses it back
// to one spot. TRAIL_LENGTH must match the shader's fixed-size array.
const TRAIL_LENGTH = 10;
const TRAIL_RADIUS_FALLOFF = 0.65; // how much smaller the oldest trail point's circle is
const TRAIL_WEIGHT_FALLOFF = 1.0; // how much fainter the oldest trail point is (1 = fades to 0)

const FRAGMENT_SHADER = `
precision mediump float;
uniform float uTime; uniform vec2 uRes; uniform vec2 uTrail[${TRAIL_LENGTH}]; uniform vec3 uAccent;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0; float a=0.5;
  for(int i=0;i<3;i++){ v+=a*noise(p); p=p*2.02+vec2(1.7,9.2); a*=0.5; } return v; }
// cheap 2-octave variant for the reveal edge — low-frequency noise is what
// reads as soft puffy cloud bulges anyway, so it doesn't need fbm's full cost.
float fbmEdge(vec2 p){ float v=0.0; float a=0.5;
  for(int i=0;i<2;i++){ v+=a*noise(p); p=p*2.02+vec2(1.7,9.2); a*=0.5; } return v; }

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5*uRes.xy)/uRes.y;
  float t = uTime*0.05;
  vec2 w = vec2(fbm(p*1.0 + vec2(t, -t*0.7)), fbm(p*1.0 + vec2(5.2 - t*0.6, 1.3 + t*0.4)));
  float f = fbm(p*1.3 + 2.1*w);
  float dens = smoothstep(0.0, 0.85, f);
  // low/mid/bright stops derived from the theme's single accent colour, so
  // every theme gets the same dark-to-glowing progression automatically.
  vec3 low = uAccent * 0.34;
  vec3 mid = uAccent * 0.92;
  vec3 bright = mix(uAccent, vec3(1.0), 0.62);
  vec3 col = vec3(0.02,0.026,0.035);
  col = mix(col, low, smoothstep(0.0,0.4,dens));
  col = mix(col, mid, smoothstep(0.35,0.75,dens));
  col = mix(col, bright, smoothstep(0.72,1.0,dens)*0.85);

  // organic, slowly-drifting distortion of the reveal boundary so it reads
  // as smoke pulling back rather than a compass-drawn circle.
  float edgeNoise = fbmEdge(gl_FragCoord.xy * 0.012 + vec2(uTime*0.12, -uTime*0.09));
  float noiseFactor = 1.0 - ${RADIUS_NOISE_AMOUNT.toFixed(2)} * 0.5 + ${RADIUS_NOISE_AMOUNT.toFixed(2)} * edgeNoise;

  // union of a shrinking, fading circle at each recent position — moving
  // fast spreads these apart into a tapering wake; standing still collapses
  // them onto the same spot, back into a single circle.
  float reveal = 0.0;
  for (int i = 0; i < ${TRAIL_LENGTH}; i++) {
    float fi = float(i);
    float radiusFactor = 1.0 - fi / ${(TRAIL_LENGTH - 1).toFixed(1)} * ${TRAIL_RADIUS_FALLOFF.toFixed(2)};
    float weight = 1.0 - fi / ${(TRAIL_LENGTH - 1).toFixed(1)} * ${TRAIL_WEIGHT_FALLOFF.toFixed(2)};
    float effectiveRadius = ${BASE_RADIUS.toFixed(2)} * radiusFactor * noiseFactor;
    float d = distance(gl_FragCoord.xy, uTrail[i]);
    float point = (1.0 - smoothstep(effectiveRadius - ${EDGE_SOFTNESS.toFixed(2)}, effectiveRadius + ${EDGE_SOFTNESS.toFixed(2)}, d)) * weight;
    reveal = max(reveal, point);
  }
  reveal = max(reveal, ${AMBIENT_REVEAL.toFixed(3)});

  vec3 dark = vec3(0.027,0.035,0.047);
  gl_FragColor = vec4(mix(dark, col, reveal), 1.0);
}
`;

const VERTEX_SHADER = 'void main(){ gl_Position = vec4(position.xy,0.0,1.0); }';

// reads the *current* --accent-rgb custom property off <html> (set by
// index.css's [data-theme] blocks) so the shader never needs its own copy
// of each theme's colour values.
function readAccentRgb(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb');
  const parts = raw.split(',').map((n) => parseFloat(n.trim()) / 255);
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return [parts[0], parts[1], parts[2]];
  }
  return [0.373, 0.831, 0.839]; // teal fallback
}

export default function SmokeField({ theme }: { theme: Theme }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const accentUniformRef = useRef<{ value: THREE.Vector3 } | null>(null);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // re-sync the shader's accent colour whenever the theme changes, without
  // tearing down and rebuilding the whole WebGL context.
  useEffect(() => {
    if (reduceMotion) return;
    const u = accentUniformRef.current;
    if (!u) return;
    const [r, g, b] = readAccentRgb();
    u.value.set(r, g, b);
  }, [theme, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const host = hostRef.current;
    if (!host) return;

    let dead = false;
    let raf = 0;

    // high-performance (not low-power): on hybrid-GPU laptops the low-power
    // hint can force the weak integrated chip, which was likely the actual
    // cause of the reported lag rather than the shader cost itself.
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x07090c, 1);
    const cvs = renderer.domElement;
    host.appendChild(cvs);
    cvs.style.width = '100%';
    cvs.style.height = '100%';
    cvs.style.display = 'block';
    cvs.style.filter = 'blur(2px)';
    cvs.style.transform = 'scale(1.06)';

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const [ar, ag, ab] = readAccentRgb();
    const trail = Array.from({ length: TRAIL_LENGTH }, () => new THREE.Vector2(0, 0));
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTrail: { value: trail },
      uAccent: { value: new THREE.Vector3(ar, ag, ab) },
    };
    accentUniformRef.current = uniforms.uAccent;

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const idle = () => ({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 });
    let px = idle().x;
    let py = idle().y;
    let sx = px;
    let sy = py;
    let active = false;
    // seed the trail at the idle position so it doesn't streak in from the
    // canvas origin over its first few frames.
    for (const t of trail) t.set(sx * CANVAS_SCALE, (window.innerHeight - sy) * CANVAS_SCALE);

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      active = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    const onLeave = () => {
      active = false;
    };
    document.addEventListener('mouseleave', onLeave);

    const resize = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight;
      renderer.setSize(Math.round(w * CANVAS_SCALE), Math.round(h * CANVAS_SCALE), false);
      uniforms.uRes.value.set(Math.round(w * CANVAS_SCALE), Math.round(h * CANVAS_SCALE));
      cvs.style.width = '100%';
      cvs.style.height = '100%';
    };
    window.addEventListener('resize', resize);
    resize();

    const t0 = performance.now();
    let last = 0;
    const FRAME = 1000 / 24;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (dead) return;

      if (!active) {
        const home = idle();
        const tsec = (now - t0) / 1000;
        px = home.x + Math.sin(tsec * 0.2) * 100;
        py = home.y + Math.cos(tsec * 0.17) * 50;
      }
      const follow = active ? 0.16 : 0.04;
      sx += (px - sx) * follow;
      sy += (py - sy) * follow;

      // shift the trail back and drop the smoothed position in at the front —
      // convert CSS/viewport pixels to the renderer's half-res, bottom-origin canvas space
      for (let i = TRAIL_LENGTH - 1; i > 0; i--) trail[i].copy(trail[i - 1]);
      trail[0].set(sx * CANVAS_SCALE, (window.innerHeight - sy) * CANVAS_SCALE);

      if (now - last < FRAME) return;
      last = now;
      uniforms.uTime.value = (now - t0) / 1000;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      dead = true;
      accentUniformRef.current = null;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if (cvs.parentNode) cvs.parentNode.removeChild(cvs);
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    // No WebGL, no cursor tracking, no per-frame noise — a fixed, static
    // glow keeps the hero's visual character without any motion for users
    // who've asked for less of it.
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 50% 40%, rgba(var(--accent-rgb),0.28) 0%, rgba(var(--accent-rgb),0.08) 45%, rgba(7,9,12,0) 72%)',
        }}
      />
    );
  }

  return (
    <div
      ref={hostRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.95 }}
    />
  );
}
