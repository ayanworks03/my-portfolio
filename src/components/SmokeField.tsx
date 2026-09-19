import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// The "spotlight" is a reveal, not a light: the smoke's real colour only
// shows through where an expanding, fading ripple ring is currently
// passing. Computed per-pixel in the shader so overlapping ripples blend
// naturally instead of fighting over a CSS mask.
const CANVAS_SCALE = 0.55; // matches the renderer's render-at-half-res factor below
const MAX_RIPPLES = 8; // must match the fragment shader's fixed-size arrays
const RIPPLE_SPEED = 300 * CANVAS_SCALE; // canvas px/sec the ring radius grows
const RIPPLE_LIFETIME_MS = 850; // how long a ripple lives before fully fading
const RIPPLE_BAND = 100 * CANVAS_SCALE; // half-width (canvas px) of the ring's glow band
const SPAWN_INTERVAL_MS = 110; // min gap between cursor-triggered ripple spawns
const AMBIENT_REVEAL = 0.12; // baseline visibility of the smoke with no ripples active

const FRAGMENT_SHADER = `
precision mediump float;
uniform float uTime; uniform vec2 uRes;
uniform vec2 uRippleOrigin[${MAX_RIPPLES}];
uniform float uRippleBorn[${MAX_RIPPLES}];
uniform int uRippleCount;

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

  float reveal = ${AMBIENT_REVEAL.toFixed(3)};
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    if (i >= uRippleCount) break;
    float age = uTime - uRippleBorn[i];
    float life = 1.0 - age / ${(RIPPLE_LIFETIME_MS / 1000).toFixed(3)};
    if (age > 0.0 && life > 0.0) {
      float radius = age * ${RIPPLE_SPEED.toFixed(2)};
      float d = distance(gl_FragCoord.xy, uRippleOrigin[i]);
      float ringDist = d - radius;
      float band = exp(-(ringDist*ringDist) / (2.0 * ${RIPPLE_BAND.toFixed(2)} * ${RIPPLE_BAND.toFixed(2)}));
      reveal += life * band;
    }
  }
  reveal = clamp(reveal, 0.0, 1.0);

  vec3 dark = vec3(0.027,0.035,0.047);
  gl_FragColor = vec4(mix(dark, col, reveal), 1.0);
}
`;

const VERTEX_SHADER = 'void main(){ gl_Position = vec4(position.xy,0.0,1.0); }';

type Ripple = { x: number; y: number; born: number };

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
    const rippleOrigin = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector2(-9999, -9999));
    const rippleBorn = new Array(MAX_RIPPLES).fill(-9999);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uRippleOrigin: { value: rippleOrigin },
      uRippleBorn: { value: rippleBorn },
      uRippleCount: { value: 0 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    // all ripple/shader timing shares this epoch (seconds since mount).
    const t0 = performance.now();
    const nowSecFrom = (msNow: number) => (msNow - t0) / 1000;

    const ripples: Ripple[] = [];
    let lastSpawn = -Infinity;

    // pointer positions arrive in CSS/viewport pixels; the shader works in
    // the renderer's internal (half-resolution) canvas pixels.
    function spawnRipple(clientX: number, clientY: number, nowSec: number) {
      const nowMs = nowSec * 1000;
      if (nowMs - lastSpawn < SPAWN_INTERVAL_MS) return;
      lastSpawn = nowMs;
      ripples.push({ x: clientX * CANVAS_SCALE, y: (window.innerHeight - clientY) * CANVAS_SCALE, born: nowSec });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
    }

    const onMove = (e: PointerEvent) => {
      spawnRipple(e.clientX, e.clientY, nowSecFrom(performance.now()));
    };
    window.addEventListener('pointermove', onMove, { passive: true });

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

    let last = 0;
    const FRAME = 1000 / 30;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (dead) return;

      const nowSec = (now - t0) / 1000;

      // age out dead ripples — no idle/ambient spawning, so the smoke stays
      // still and dark whenever the pointer isn't actually moving.
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (nowSec - ripples[i].born > RIPPLE_LIFETIME_MS / 1000) ripples.splice(i, 1);
      }

      for (let i = 0; i < MAX_RIPPLES; i++) {
        if (i < ripples.length) {
          rippleOrigin[i].set(ripples[i].x, ripples[i].y);
          rippleBorn[i] = ripples[i].born;
        } else {
          rippleBorn[i] = -9999;
        }
      }
      uniforms.uRippleCount.value = ripples.length;

      if (now - last < FRAME) return;
      last = now;
      uniforms.uTime.value = nowSec;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
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
