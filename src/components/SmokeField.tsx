import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// The reveal boundary is computed per-pixel in-shader (not a CSS mask), so
// it can be distorted by the same noise driving the smoke itself — the
// edge reads as cloud/smoke pulling back rather than a hard geometric
// circle, while still following the cursor smoothly.
const CANVAS_SCALE = 0.55;
const BASE_RADIUS = 260 * CANVAS_SCALE; // canvas px, roughly matches the old mask's size
const EDGE_SOFTNESS = 70 * CANVAS_SCALE; // canvas px width of the soft transition band
const RADIUS_NOISE_AMOUNT = 0.55; // how much the boundary bulges/recedes (fraction of BASE_RADIUS)
const AMBIENT_REVEAL = 0.1; // baseline visibility with the spotlight far away

const FRAGMENT_SHADER = `
precision mediump float;
uniform float uTime; uniform vec2 uRes; uniform vec2 uFocal;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0; float a=0.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.02+vec2(1.7,9.2); a*=0.5; } return v; }

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5*uRes.xy)/uRes.y;
  float t = uTime*0.05;
  vec2 w = vec2(fbm(p*1.0 + vec2(t, -t*0.7)), fbm(p*1.0 + vec2(5.2 - t*0.6, 1.3 + t*0.4)));
  float f = fbm(p*1.3 + 2.1*w);
  float dens = smoothstep(0.0, 0.85, f);
  vec3 col = vec3(0.02,0.026,0.035);
  col = mix(col, vec3(0.06,0.22,0.28), smoothstep(0.0,0.4,dens));
  col = mix(col, vec3(0.16,0.60,0.66), smoothstep(0.35,0.75,dens));
  col = mix(col, vec3(0.62,0.95,0.96), smoothstep(0.72,1.0,dens)*0.85);

  // organic, slowly-drifting distortion of the reveal boundary so it reads
  // as smoke pulling back rather than a compass-drawn circle.
  float edgeNoise = fbm(gl_FragCoord.xy * 0.012 + vec2(uTime*0.12, -uTime*0.09));
  float effectiveRadius = ${BASE_RADIUS.toFixed(2)} * (1.0 - ${RADIUS_NOISE_AMOUNT.toFixed(2)} * 0.5 + ${RADIUS_NOISE_AMOUNT.toFixed(2)} * edgeNoise);
  float d = distance(gl_FragCoord.xy, uFocal);
  float reveal = 1.0 - smoothstep(effectiveRadius - ${EDGE_SOFTNESS.toFixed(2)}, effectiveRadius + ${EDGE_SOFTNESS.toFixed(2)}, d);
  reveal = max(reveal, ${AMBIENT_REVEAL.toFixed(3)});

  vec3 dark = vec3(0.027,0.035,0.047);
  gl_FragColor = vec4(mix(dark, col, reveal), 1.0);
}
`;

const VERTEX_SHADER = 'void main(){ gl_Position = vec4(position.xy,0.0,1.0); }';

export default function SmokeField() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let dead = false;
    let raf = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x07090c, 1);
    const cvs = renderer.domElement;
    host.appendChild(cvs);
    cvs.style.width = '100%';
    cvs.style.height = '100%';
    cvs.style.display = 'block';
    cvs.style.filter = 'blur(5px)';
    cvs.style.transform = 'scale(1.06)';

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uFocal: { value: new THREE.Vector2(0, 0) },
    };

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
    const FRAME = 1000 / 30;

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

      // convert CSS/viewport pixels to the renderer's half-res, bottom-origin canvas space
      uniforms.uFocal.value.set(sx * CANVAS_SCALE, (window.innerHeight - sy) * CANVAS_SCALE);

      if (now - last < FRAME) return;
      last = now;
      uniforms.uTime.value = (now - t0) / 1000;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if (cvs.parentNode) cvs.parentNode.removeChild(cvs);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.95 }}
    />
  );
}
