import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const FRAGMENT_SHADER = `
precision mediump float;
uniform float uTime; uniform vec2 uRes;
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
  gl_FragColor = vec4(col,1.0);
}
`;

const VERTEX_SHADER = 'void main(){ gl_Position = vec4(position.xy,0.0,1.0); }';

export default function SmokeField() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const highlight = highlightRef.current;
    if (!host || !highlight) return;

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
    const uniforms = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } };

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
    let heat = 0;
    let targetHeat = 0;
    let lastMove = performance.now();

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      targetHeat = 1;
      lastMove = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const resize = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight;
      renderer.setSize(Math.round(w * 0.55), Math.round(h * 0.55), false);
      uniforms.uRes.value.set(Math.round(w * 0.55), Math.round(h * 0.55));
      cvs.style.width = '100%';
      cvs.style.height = '100%';
    };
    window.addEventListener('resize', resize);
    resize();

    const t0 = performance.now();
    let last = 0;
    const FRAME = 1000 / 30;

    host.style.opacity = '0.6';

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (dead) return;

      if (now - lastMove > 700) targetHeat = 0;
      heat += (targetHeat - heat) * 0.05;

      if (!(now - lastMove < 700)) {
        const home = idle();
        const tsec = (now - t0) / 1000;
        px = home.x + Math.sin(tsec * 0.2) * 100;
        py = home.y + Math.cos(tsec * 0.17) * 50;
      }
      sx += (px - sx) * 0.05;
      sy += (py - sy) * 0.05;

      highlight.style.opacity = (heat * 0.85).toFixed(3);
      highlight.style.transform = `translate(${sx.toFixed(0)}px, ${sy.toFixed(0)}px)`;

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
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if (cvs.parentNode) cvs.parentNode.removeChild(cvs);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
      <div
        ref={highlightRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1100,
          height: 1100,
          marginLeft: -550,
          marginTop: -550,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(150,240,242,0.4) 0%, rgba(120,225,228,0.22) 30%, rgba(95,212,214,0.1) 55%, rgba(95,212,214,0) 78%)',
          filter: 'blur(20px)',
          mixBlendMode: 'screen',
          opacity: 0,
          willChange: 'transform, opacity',
        }}
      />
    </div>
  );
}
