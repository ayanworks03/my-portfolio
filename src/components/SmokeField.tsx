import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const FRAGMENT_SHADER = `
precision mediump float;
uniform float uTime; uniform vec2 uRes;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0; float a=0.5;
  for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.02+vec2(1.7,9.2); a*=0.5; } return v; }
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5*uRes.xy)/uRes.y;
  float t = uTime*0.06;
  vec2 w = vec2(fbm(p*1.1 + vec2(t, -t*0.7)), fbm(p*1.1 + vec2(5.2 - t*0.6, 1.3 + t*0.4)));
  float f = fbm(p*1.5 + 1.8*w);
  float dens = smoothstep(0.18, 0.92, f);
  vec3 col = vec3(0.027,0.035,0.047);
  col = mix(col, vec3(0.05,0.20,0.27), smoothstep(0.0,0.35,dens)*0.9 + 0.35);
  col = mix(col, vec3(0.14,0.62,0.70), smoothstep(0.25,0.80,dens));
  col = mix(col, vec3(0.66,0.97,0.98), smoothstep(0.70,1.0,dens)*0.8);
  gl_FragColor = vec4(col,1.0);
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
    cvs.style.filter = 'blur(6px)';
    cvs.style.transform = 'scale(1.06)';

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const idle = () => ({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.34 });
    let px = idle().x;
    let py = idle().y;
    let sx = px;
    let sy = py;
    let lit = 0;
    let target = 0.34;
    let active = false;
    const RADIUS = 420;

    host.style.opacity = '0';

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      active = true;
      target = 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const onLeave = () => {
      active = false;
      target = 0.34;
    };
    document.addEventListener('mouseleave', onLeave);

    const resize = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight;
      renderer.setSize(Math.round(w * 0.5), Math.round(h * 0.5), false);
      uniforms.uRes.value.set(Math.round(w * 0.5), Math.round(h * 0.5));
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
        px = home.x + Math.sin(tsec * 0.23) * 90;
        py = home.y + Math.cos(tsec * 0.19) * 40;
      }
      const follow = active ? 0.14 : 0.03;
      sx += (px - sx) * follow;
      sy += (py - sy) * follow;
      lit += (target - lit) * 0.06;
      host.style.opacity = lit.toFixed(3);
      const m =
        'radial-gradient(circle ' +
        Math.round(RADIUS * (0.78 + 0.22 * lit)) +
        'px at ' +
        sx.toFixed(0) +
        'px ' +
        sy.toFixed(0) +
        'px, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.15) 78%, rgba(0,0,0,0) 100%)';
      host.style.webkitMaskImage = m;
      host.style.maskImage = m;

      if (lit < 0.02) return;
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
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
    />
  );
}
