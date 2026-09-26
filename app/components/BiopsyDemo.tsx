"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CONTOUR_POINTS, contourPath, contourPoint, reconstructionData, SLICE_COUNT, sliceHeights, specimenRadius, tissuePath } from '../lib/biopsy-model';
import styles from './BiopsyDemo.module.css';

const stages = [
  { name: '3D scan', title: 'Start with the whole specimen.', description: 'A scanning plane passes through a synthetic biopsy to establish the original three-dimensional shape.', duration: 5 },
  { name: '7 slices', title: 'Seven sections. One shared space.', description: 'Separate the specimen into seven parallel cross-sections, retaining each slice’s position in the original volume.', duration: 5 },
  { name: '2D imaging', title: 'Lay every slice on the scanner.', description: 'Seven two-dimensional images reveal a dark region at different sizes and positions through the specimen.', duration: 5 },
  { name: 'Outline', title: 'Trace the region in every image.', description: 'Coral contours outline the synthetic dark regions. Each outline belongs to its corresponding slice—not a separate, unrelated shape.', duration: 6 },
  { name: 'Reconstruct', title: 'Bring the outlines back together.', description: 'Stack the seven contours and connect them into a 3D surface. The reconstructed region rotates inside the translucent original specimen.', duration: 9 },
];
const starts = [0, 5, 10, 15, 21];
const TOTAL = 30;
const stageAt = (time: number) => time < 5 ? 0 : time < 10 ? 1 : time < 15 ? 2 : time < 21 ? 3 : 4;
const ease = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };

function SliceImage({ index, outlined, active }: { index: number; outlined: boolean; active: boolean }) {
  return <svg viewBox="0 0 120 104" role="img" aria-label={`Synthetic scan ${index + 1}${outlined ? ', dark region outlined' : ''}`}>
    <rect x="3" y="3" width="114" height="98" rx="5" fill={active ? '#eef7fa' : '#f7f5f1'} stroke={active ? '#2e818d' : '#ccd6d7'} />
    <path d={tissuePath(index)} fill="#d6b7bc" stroke="#b28e98" strokeWidth="0.8" />
    {Array.from({ length: 20 }, (_, n) => <circle key={n} cx={60 + Math.cos(n * 2.4) * (15 + n % 10)} cy={52 + Math.sin(n * 2.4) * (15 + n % 9)} r="1" fill="#bd969f" opacity=".55" />)}
    <path d={contourPath(index)} fill="#563f58" stroke={outlined ? '#f16653' : 'none'} strokeWidth="2.4" />
    <text x="10" y="16" fill="#56707a" fontSize="7" fontFamily="monospace">S0{index + 1}</text>
  </svg>;
}

export default function BiopsyDemo() {
  const host = useRef<HTMLDivElement>(null);
  const clock = useRef({ time: 0, playing: false, visible: true });
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const stage = stageAt(time);
  const progress = Math.min(1, (time - starts[stage]) / stages[stage].duration);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    // Synchronize React's fallback with the external WebGL capability check.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { setAvailable(false); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0xeaf1f2, 1);
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', 'Animated WebGL reconstruction of a synthetic biopsy');
    renderer.domElement.setAttribute('role', 'img');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(4.5, 3.1, 6.2); camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x7597a3, 2.8));
    const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(3, 5, 4); scene.add(light);
    const group = new THREE.Group(); scene.add(group);
    const shellGeometry = new THREE.SphereGeometry(1, 64, 48);
    const vertices = shellGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const y = vertices.getY(i) * 1.42;
      const a = Math.atan2(vertices.getZ(i), vertices.getX(i));
      const r = specimenRadius(y, a);
      vertices.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r * 0.76);
    }
    shellGeometry.computeVertexNormals();
    const shellMaterial = new THREE.MeshPhysicalMaterial({ color: 0xc391a8, transparent: true, opacity: 0.52, roughness: 0.32, metalness: 0, side: THREE.DoubleSide, depthWrite: false });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial); shell.renderOrder = 3; group.add(shell);
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1, 16, 12)), new THREE.LineBasicMaterial({ color: 0x517b85, transparent: true, opacity: 0.08 }));
    wire.scale.set(1.06, 1.45, 0.79); group.add(wire);

    const data = reconstructionData();
    const lesionGeometry = new THREE.BufferGeometry(); lesionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3)); lesionGeometry.setIndex(data.indices); lesionGeometry.computeVertexNormals();
    const lesionMaterial = new THREE.MeshStandardMaterial({ color: 0xec6756, roughness: 0.35, metalness: 0.12, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const lesion = new THREE.Mesh(lesionGeometry, lesionMaterial); group.add(lesion);
    const outlines = sliceHeights.map((y, s) => {
      const points = Array.from({ length: CONTOUR_POINTS }, (_, p) => { const v = contourPoint(s, p); return new THREE.Vector3(v.x, 0, v.z); });
      const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xfc624b, transparent: true, opacity: 1 }));
      line.position.y = y; group.add(line); return line;
    });
    const textures: THREE.CanvasTexture[] = [];
    const slices = sliceHeights.map((y, s) => {
      const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 384;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#eff4f2'; ctx.fillRect(0, 0, 384, 384);
      ctx.strokeStyle = '#cadcdb'; ctx.lineWidth = 1;
      for (let k = 0; k < 384; k += 24) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k, 384); ctx.moveTo(0, k); ctx.lineTo(384, k); ctx.stroke(); }
      ctx.beginPath();
      for (let p = 0; p < CONTOUR_POINTS; p++) { const a = p / CONTOUR_POINTS * Math.PI * 2, r = specimenRadius(y, a); const x = 192 + Math.cos(a) * r * 144, z = 192 + Math.sin(a) * r * 0.76 * 144; if (!p) ctx.moveTo(x, z); else ctx.lineTo(x, z); }
      ctx.closePath(); ctx.fillStyle = '#d0a9b5'; ctx.fill();
      ctx.beginPath(); for (let p = 0; p < CONTOUR_POINTS; p++) { const v = contourPoint(s, p); if (!p) ctx.moveTo(192 + v.x * 144, 192 + v.z * 144); else ctx.lineTo(192 + v.x * 144, 192 + v.z * 144); }
      ctx.closePath(); ctx.fillStyle = '#594456'; ctx.fill();
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.6667, 2.6667), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
      plane.rotation.x = -Math.PI / 2; plane.position.y = y; group.add(plane); return plane;
    });
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.8), new THREE.MeshBasicMaterial({ color: 0x36a8b3, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }));
    beam.rotation.x = -Math.PI / 2; group.add(beam);
    const beamBorder = new THREE.LineSegments(new THREE.EdgesGeometry(beam.geometry), new THREE.LineBasicMaterial({ color: 0x298c9e })); beam.add(beamBorder);
    const grid = new THREE.GridHelper(9, 24, 0xa8c5c9, 0xd3e0e1); grid.position.y = -1.65; scene.add(grid);
    const scanner = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 3.3), new THREE.MeshStandardMaterial({ color: 0xc1d3d6, roughness: 0.6 })); scanner.position.y = -0.65; scene.add(scanner);
    let lastRenderedTime = -1;
    const resize = () => { const width = el.clientWidth, height = el.clientHeight; renderer.setSize(width, height); camera.aspect = width / height; camera.zoom = Math.min(1, camera.aspect / 1.4); camera.updateProjectionMatrix(); lastRenderedTime = -1; };
    const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(el); resize();
    const visibility = new IntersectionObserver(([entry]) => { clock.current.visible = entry.isIntersecting; }); visibility.observe(el);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    clock.current.playing = !motion.matches; setPlaying(!motion.matches);
    const onMotion = () => { if (motion.matches) { clock.current.playing = false; setPlaying(false); } }; motion.addEventListener('change', onMotion);
    const contextLost = (event: Event) => { event.preventDefault(); clock.current.playing = false; setPlaying(false); setAvailable(false); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    let frame = 0, last = performance.now(), lastUi = 0;
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      const delta = Math.min((now - last) / 1000, 0.05); last = now;
      if (document.hidden || !clock.current.visible) return;
      if (clock.current.playing) {
        clock.current.time = Math.min(TOTAL, clock.current.time + delta);
        if (clock.current.time >= TOTAL) { clock.current.playing = false; setPlaying(false); setTime(TOTAL); }
        if (now - lastUi > 80) { setTime(clock.current.time); lastUi = now; }
      }
      const t = clock.current.time, s = stageAt(t), p = Math.min(1, (t - starts[s]) / stages[s].duration);
      if (lastRenderedTime === t) return;
      lastRenderedTime = t;
      group.rotation.y = s === 4 ? Math.max(0, (p - 0.35) / 0.65) * Math.PI * 2 : s === 0 ? p * 0.5 : s === 2 || s === 3 ? 0 : 0.25;
      group.scale.setScalar(s === 1 ? 0.74 : s === 2 ? 0.74 + ease(p * 3) * 0.26 : 1);
      shell.visible = s === 0 || s === 1 || s === 4; shellMaterial.opacity = s === 4 ? ease(p * 3) * 0.16 : s === 1 ? 0.15 : 0.52;
      wire.visible = s === 0 || s === 4; beam.visible = s === 0; beam.position.y = -1.5 + p * 3;
      lesion.visible = s === 4; lesionMaterial.opacity = Math.max(0, Math.min(1, (p - 0.3) * 3));
      scanner.visible = s === 2 || s === 3;
      grid.visible = s !== 2 && s !== 3;
      slices.forEach((plane, i) => {
        plane.visible = s === 1 || s === 2 || s === 3;
        if (s === 2 || s === 3) {
          const row = i < 4 ? 0 : 1, column = i < 4 ? i : i - 4;
          const spread = s === 2 ? ease(p * 3) : 1;
          plane.scale.setScalar(1 - spread * 0.61); plane.position.set((column - (row ? 1 : 1.5)) * 1.27 * spread, sliceHeights[i] * 2.1 * (1 - spread) - 0.55 * spread, (row - 0.5) * 1.45 * spread);
        } else { plane.scale.setScalar(1); plane.position.set(0, sliceHeights[i] * (1 + p * 1.1), 0); }
        const line = outlines[i]; line.visible = s === 3 ? p * 7 >= i : s === 4;
        line.geometry.setDrawRange(0, s === 3 ? Math.min(CONTOUR_POINTS, Math.max(0, Math.floor((p * 7 - i) * CONTOUR_POINTS))) : CONTOUR_POINTS);
        if (s === 3) { line.scale.setScalar(0.39); line.position.copy(plane.position); line.position.y += 0.012; }
        else {
          const gather = ease(p * 3), row = i < 4 ? 0 : 1, column = i < 4 ? i : i - 4;
          line.scale.setScalar(0.39 + gather * 0.61);
          line.position.set((column - (row ? 1 : 1.5)) * 1.27 * (1 - gather), -0.538 * (1 - gather) + sliceHeights[i] * gather, (row - 0.5) * 1.45 * (1 - gather));
        }
      });
      renderer.render(scene, camera);
    }; frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame); sizeObserver.disconnect(); visibility.disconnect(); motion.removeEventListener('change', onMotion); renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments) { object.geometry.dispose(); const mats = Array.isArray(object.material) ? object.material : [object.material]; mats.forEach(m => m.dispose()); } });
      textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  function seek(value: number) { clock.current.time = value; setTime(value); }
  function toggle() { if (clock.current.time >= TOTAL) seek(0); clock.current.playing = !clock.current.playing; setPlaying(clock.current.playing); }
  return <section className={styles.demo} aria-label="Synthetic biopsy WebGL walkthrough">
    <header className={styles.header}><span>RECONSTRUCTION LAB <i>/ 07</i></span><span className={styles.badge}>ILLUSTRATIVE PROTOTYPE</span></header>
    <div className={styles.intro}><div><p>FROM SLICES TO SPATIAL UNDERSTANDING</p><h2>What’s inside<br /><em>comes into view.</em></h2></div><p>A new visualization of the archived project’s workflow, using a synthetic specimen. No patient data or diagnostic inference.</p></div>
    <div className={styles.visual}>
      <div ref={host} className={styles.canvas} />
      {!available && <div className={styles.fallback}><strong>3D rendering is unavailable in this browser.</strong><p>Explore the same seven synthetic scans and process stages below.</p></div>}
      <div className={styles.sceneLabel}><span>0{stage + 1} / {stages[stage].name.toUpperCase()}</span><small>{stage === 4 ? '7 contours → 1 reconstructed volume' : stage === 2 || stage === 3 ? 'Scanner bed · seven registered images' : 'Synthetic specimen · not to scale'}</small></div>
      <div className={styles.legend}><span><i />Biopsy volume</span><span><i />Outlined region</span></div>
    </div>
    <div className={styles.controls}><button onClick={toggle} disabled={!available} aria-label={playing ? 'Pause biopsy animation' : 'Play biopsy animation'}>{playing ? 'Ⅱ Pause' : '▶ Play'}</button><button onClick={() => { seek(0); clock.current.playing = available; setPlaying(available); }}>↺ Replay</button><input type="range" min="0" max={TOTAL} step="0.05" value={time} aria-label="Biopsy animation timeline" onChange={e => { clock.current.playing = false; setPlaying(false); seek(Number(e.target.value)); }} /><span>{Math.floor(time).toString().padStart(2, '0')} / 30s</span></div>
    <nav className={styles.stages} aria-label="Biopsy process stages">{stages.map((item, i) => <button key={item.name} aria-current={stage === i ? 'step' : undefined} onClick={() => { clock.current.playing = false; setPlaying(false); seek(starts[i] + (i === 3 ? 5.5 : i === 4 ? 4 : 2)); }}><span>0{i + 1}</span>{item.name}</button>)}</nav>
    <div className={styles.explanation}><h3>{stages[stage].title}</h3><p>{stages[stage].description}</p></div>
    <div className={styles.scanHeader}><span>THE SEVEN SOURCE IMAGES</span><span>{stage >= 3 ? 'Coral = traced boundary' : 'Dark = synthetic region'}</span></div>
    <div className={styles.scans}>{Array.from({ length: SLICE_COUNT }, (_, i) => <figure key={i}><SliceImage index={i} active={stage >= 2} outlined={stage === 4 || (stage === 3 && progress * 7 >= i)} /><figcaption>Slice 0{i + 1}<small>z = {sliceHeights[i].toFixed(1)}</small></figcaption></figure>)}</div>
    <p className={styles.disclaimer}>Synthetic data · Illustrative segmentation and reconstruction · Not a medical device, diagnostic tool, or recording of the original application. Positions are normalized illustration units.</p>
  </section>;
}
