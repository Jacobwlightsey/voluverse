import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const ACCENT = 0x6ee7ff;

const M = {
  stucco:   () => new THREE.MeshStandardMaterial({ color: 0xd9d7d0, roughness: 0.92, metalness: 0.02 }),
  stuccoDk: () => new THREE.MeshStandardMaterial({ color: 0x2c2f34, roughness: 0.9, metalness: 0.03 }),
  wood:     () => new THREE.MeshStandardMaterial({ color: 0xb07a41, roughness: 0.55, metalness: 0.04 }),
  woodDk:   () => new THREE.MeshStandardMaterial({ color: 0x6f4a29, roughness: 0.6, metalness: 0.04 }),
  roof:     () => new THREE.MeshStandardMaterial({ color: 0x1b1e23, roughness: 0.6, metalness: 0.2 }),
  frame:    () => new THREE.MeshStandardMaterial({ color: 0x17191e, roughness: 0.35, metalness: 0.65 }),
  glass:    () => new THREE.MeshPhysicalMaterial({ color: 0x0c1219, roughness: 0.05, metalness: 0, emissive: 0xffcf96, emissiveIntensity: 0.0, transparent: true, opacity: 0.86, clearcoat: 1, clearcoatRoughness: 0.06, reflectivity: 0.6 }),
  concrete: () => new THREE.MeshStandardMaterial({ color: 0x9a9791, roughness: 0.85, metalness: 0.02 }),
  stone:    () => new THREE.MeshStandardMaterial({ color: 0x54514b, roughness: 0.9, metalness: 0.02 }),
  water:    () => new THREE.MeshPhysicalMaterial({ color: 0x0a1922, roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, reflectivity: 0.9 }),
  foliage:  () => new THREE.MeshStandardMaterial({ color: 0x33463a, roughness: 1, metalness: 0, flatShading: true }),
  trunk:    () => new THREE.MeshStandardMaterial({ color: 0x2a231e, roughness: 0.95, metalness: 0 }),
};

function box(w, h, d, material, name) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.name = name || 'Box'; m.castShadow = true; m.receiveShadow = true; return m;
}
function place(o, x, y, z) { o.position.set(x, y, z); return o; }

function glazing(w, h, cols, glassList, name) {
  const g = new THREE.Group(); g.name = name;
  const th = 0.06;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(w - th * 2, h - th * 2, 0.05), M.glass());
  glass.name = name + 'Glass'; glassList.push(glass.material); g.add(glass);
  const fm = M.frame();
  g.add(place(box(w, th, 0.14, fm), 0, h / 2 - th / 2, 0));
  g.add(place(box(w, th, 0.14, fm), 0, -h / 2 + th / 2, 0));
  g.add(place(box(th, h, 0.14, fm), -w / 2 + th / 2, 0, 0));
  g.add(place(box(th, h, 0.14, fm), w / 2 - th / 2, 0, 0));
  for (let i = 1; i < cols; i++) g.add(place(box(0.045, h - th * 2, 0.12, fm), -w / 2 + (w / cols) * i, 0, 0));
  return g;
}
function slats(w, h, count, name) {
  const g = new THREE.Group(); g.name = name; const wm = M.wood();
  for (let i = 0; i < count; i++) { const sw = (w / count) * 0.7; g.add(place(box(sw, h, 0.08, wm), -w / 2 + (w / count) * (i + 0.5), 0, 0)); }
  return g;
}
function tree(scale, name) {
  const g = new THREE.Group(); g.name = name;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.16 * scale, 4.4 * scale, 8), M.trunk());
  trunk.position.y = 2.2 * scale; trunk.castShadow = true; g.add(trunk);
  const fm = M.foliage();
  [[0, 4.7, 0, 1.5], [0.7, 4.1, 0.4, 1.0], [-0.6, 4.3, -0.3, 0.85]].forEach((p) => {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(p[3] * scale, 1), fm);
    f.position.set(p[0] * scale, p[1] * scale, p[2] * scale); f.castShadow = true; g.add(f);
  });
  return g;
}

function buildModernHouse(glassList, interiorLights) {
  const house = new THREE.Group(); house.name = 'Property';
  const plinth = box(18, 0.5, 12, M.stone(), 'Plinth'); plinth.position.set(0, 0.25, 0); house.add(plinth);
  const gW = 15, gH = 3.7, gD = 10;
  const ground = box(gW, gH, gD, M.stucco(), 'GroundMass'); ground.position.set(0, 0.5 + gH / 2, 0); house.add(ground);
  const gFront = gD / 2 + 0.02;
  house.add(place(glazing(9.2, 3.0, 5, glassList, 'FrontGlass'), 1.4, 0.5 + 1.85, gFront));
  const sideGlass = glazing(5.6, 3.0, 3, glassList, 'SideGlass'); sideGlass.rotation.y = Math.PI / 2;
  house.add(place(sideGlass, gW / 2 + 0.02, 0.5 + 1.85, -1.5));
  const uW = 9.5, uH = 3.4, uD = 8.4, uX = 2.4, uZ = -0.4;
  const upper = box(uW, uH, uD, M.stuccoDk(), 'UpperMass'); upper.position.set(uX, 0.5 + gH + uH / 2, uZ); house.add(upper);
  const uFront = uZ + uD / 2 + 0.02;
  house.add(place(glazing(6.2, 1.9, 4, glassList, 'UpperGlass'), uX, 0.5 + gH + 1.8, uFront));
  house.add(place(slats(4.6, gH + 0.2, 12, 'EntrySlats'), -5.0, 0.5 + gH / 2, gFront));
  const rG = box(gW + 1.2, 0.22, gD + 1.2, M.roof(), 'RoofGround'); rG.position.set(0, 0.5 + gH + 0.11, 0); house.add(rG);
  const rU = box(uW + 1.0, 0.2, uD + 1.0, M.roof(), 'RoofUpper'); rU.position.set(uX, 0.5 + gH + uH + 0.1, uZ); house.add(rU);
  const door = box(1.5, 2.6, 0.16, M.woodDk(), 'Door'); door.position.set(-5.0, 0.5 + 1.3, gFront - 0.35); house.add(door);
  for (let i = 0; i < 3; i++) { const s = box(3.0 - i * 0.35, 0.16, 0.55, M.concrete(), 'Step' + i); s.position.set(-5.0, 0.42 + (2 - i) * 0.16, gFront + 0.5 + i * 0.55); house.add(s); }
  const path = box(1.9, 0.06, 7, M.concrete(), 'Path'); path.position.set(-5.0, 0.5, gFront + 4.6); house.add(path);
  const pool = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 3.2), M.water()); pool.name = 'Pool'; pool.position.set(2.5, 0.06, gFront + 4.4); pool.receiveShadow = true; house.add(pool);
  const poolRim = box(8.5, 0.16, 3.7, M.concrete(), 'PoolRim'); poolRim.position.set(2.5, 0.04, gFront + 4.4); house.add(poolRim);
  const hedge = box(6.5, 0.7, 0.6, M.foliage(), 'Hedge'); hedge.position.set(-1.5, 0.5 + 0.35, gFront + 0.9); house.add(hedge);
  house.add(place(tree(1.05, 'TreeA'), 9.2, 0.5, 3.4));
  house.add(place(tree(0.72, 'TreeB'), -8.4, 0.5, 1.0));
  const p1 = new THREE.PointLight(0xffb877, 0, 20, 2); p1.position.set(0.5, 2.6, 1.0); house.add(p1); interiorLights.push(p1);
  const p2 = new THREE.PointLight(0xffc79a, 0, 16, 2); p2.position.set(uX, 0.5 + gH + 1.8, uZ + 1.2); house.add(p2); interiorLights.push(p2);
  return house;
}

const PRESETS = {
  daylight: { key: { c: 0xfff4e6, i: 3.1, p: [16, 21, 13] }, hemiSky: 0xa9c8ec, hemiGr: 0x2b2e33, hemiI: 0.95, rim: 0x8fbfff, rimI: 0.5, interior: 0.35, exposure: 1.05, fog: 0xdfe7ef, sky: '#bcd6f0', horizon: '#eaf1f8', ground: '#c7cdd4' },
  golden:   { key: { c: 0xffb257, i: 3.4, p: [-18, 8.5, 15] }, hemiSky: 0xffd8a6, hemiGr: 0x241c16, hemiI: 0.6, rim: 0xff8a4c, rimI: 1.15, interior: 0.85, exposure: 1.14, fog: 0x40291f, sky: '#f4a259', horizon: '#f6c79a', ground: '#3a2a22' },
  twilight: { key: { c: 0x7f97dc, i: 1.0, p: [-14, 11, -12] }, hemiSky: 0x2b3a66, hemiGr: 0x0a0c14, hemiI: 0.55, rim: 0x9a7cff, rimI: 1.05, interior: 2.6, exposure: 1.2, fog: 0x151b30, sky: '#26355e', horizon: '#4b4a86', ground: '#0b0d18' },
  overcast: { key: { c: 0xe2e6ec, i: 1.5, p: [6, 23, 9] }, hemiSky: 0xc2cbd4, hemiGr: 0x3b3e43, hemiI: 1.35, rim: 0xb3bcc6, rimI: 0.3, interior: 0.5, exposure: 1.0, fog: 0xccd1d6, sky: '#c3ccd5', horizon: '#dbe0e5', ground: '#b4b9bf' },
};

function backdropCss(style, p) {
  const glow = 'radial-gradient(ellipse 90% 60% at 50% 118%, rgba(110,231,255,0.14), transparent 60%)';
  if (style === 'sky') return `${glow}, linear-gradient(180deg, ${p.sky} 0%, ${p.horizon} 55%, ${p.ground} 55%, ${shade(p.ground, -18)} 100%)`;
  if (style === 'horizon') return `radial-gradient(ellipse 120% 100% at 50% 92%, ${p.horizon} 0%, ${shade(p.ground, -8)} 70%, ${shade(p.ground, -22)} 100%)`;
  return `${glow}, radial-gradient(ellipse 140% 90% at 50% 8%, ${shade(p.sky, -6)} 0%, transparent 55%), linear-gradient(180deg, ${shade(p.horizon, -30)} 0%, ${shade(p.ground, -26)} 100%)`;
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

class VoluModel extends HTMLElement {
  static get observedAttributes() { return ['src', 'preset', 'backdrop', 'autorotate-speed']; }
  connectedCallback() { if (this._booted) return; this._booted = true; this._boot(); }
  disconnectedCallback() { this._alive = false; if (this._ro) this._ro.disconnect(); if (this._io) this._io.disconnect(); if (this._renderer) this._renderer.dispose(); }
  attributeChangedCallback(name, o, v) {
    if (!this._scene || o === v) return;
    if (name === 'src') this._loadSrc(v);
    if (name === 'preset') this.setPreset(v);
    if (name === 'backdrop') this.setBackdrop(v);
    if (name === 'autorotate-speed' && this._controls) this._controls.autoRotateSpeed = parseFloat(v) || 0.4;
  }
  setPreset(name) { this._preset = PRESETS[name] ? name : 'golden'; this._applyPreset(); this._applyBackdrop(); }
  setBackdrop(style) { this._backdrop = ['studio', 'sky', 'horizon'].includes(style) ? style : 'studio'; this._applyBackdrop(); }
  _applyPreset() {
    const p = PRESETS[this._preset]; if (!p || !this._key) return;
    this._key.color.setHex(p.key.c); this._key.intensity = p.key.i; this._key.position.set(...p.key.p);
    this._hemi.color.setHex(p.hemiSky); this._hemi.groundColor.setHex(p.hemiGr); this._hemi.intensity = p.hemiI;
    this._rim.color.setHex(p.rim); this._rim.intensity = p.rimI;
    this._interior.forEach((l) => { l.intensity = (l.userData.base || 24) * p.interior; });
    this._glass.forEach((g) => { g.emissiveIntensity = 0.12 + p.interior * 0.5; });
    this._renderer.toneMappingExposure = p.exposure;
    this._scene.fog.color.setHex(p.fog);
  }
  _applyBackdrop() { const p = PRESETS[this._preset]; if (!p) return; this.style.background = backdropCss(this._backdrop || 'studio', p); }
  _boot() {
    this.style.display = 'block'; this.style.width = '100%'; this.style.height = '100%'; this._alive = true;
    this._preset = PRESETS[this.getAttribute('preset')] ? this.getAttribute('preset') : 'golden';
    this._backdrop = this.getAttribute('backdrop') || 'studio';
    this._glass = []; this._interior = [];
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });
    this.appendChild(renderer.domElement); this._renderer = renderer;
    const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x141a2e, 0.01); this._scene = scene;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.4, 400); camera.position.set(24, 12, 26); this._camera = camera;
    this._hemi = new THREE.HemisphereLight(0xa9c8ec, 0x2b2e33, 0.95); scene.add(this._hemi);
    this._key = new THREE.DirectionalLight(0xfff4e6, 3.1); this._key.position.set(16, 21, 13);
    this._key.castShadow = true; this._key.shadow.mapSize.set(2048, 2048); this._key.shadow.bias = -0.0005;
    const sc = this._key.shadow.camera; sc.left = -26; sc.right = 26; sc.top = 26; sc.bottom = -26; sc.near = 1; sc.far = 90; scene.add(this._key);
    this._rim = new THREE.DirectionalLight(0x8fbfff, 0.5); this._rim.position.set(-18, 8, -14); scene.add(this._rim);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.32 });
    const shadowGround = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), shadowMat);
    shadowGround.rotation.x = -Math.PI / 2; shadowGround.position.y = 0.01; shadowGround.receiveShadow = true; scene.add(shadowGround);
    try { const house = buildModernHouse(this._glass, this._interior); this._interior.forEach((l) => (l.userData.base = 24)); scene.add(house); this._house = house; }
    catch (err) { console.warn('[volu-model] house build failed', err); }
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.065; controls.enablePan = false;
    controls.minDistance = 18; controls.maxDistance = 64; controls.minPolarAngle = 0.2; controls.maxPolarAngle = 1.46;
    controls.target.set(0, 2.6, 0); controls.autoRotate = true;
    controls.autoRotateSpeed = parseFloat(this.getAttribute('autorotate-speed')) || 0.4; controls.update(); this._controls = controls;
    let resume = 0;
    controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(resume); });
    controls.addEventListener('end', () => { resume = setTimeout(() => { controls.autoRotate = true; }, 1800); });
    const resize = () => { const w = this.clientWidth || 800, h = this.clientHeight || 450; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    resize(); this._ro = new ResizeObserver(resize); this._ro.observe(this);
    this._visible = true;
    if (typeof IntersectionObserver !== 'undefined') { this._io = new IntersectionObserver((es) => es.forEach((e) => { this._visible = e.isIntersecting; }), { rootMargin: '120px' }); this._io.observe(this); }
    this._applyPreset(); this._applyBackdrop();
    const loop = () => { if (!this._alive) return; requestAnimationFrame(loop); if (!this._visible) return; controls.update(); renderer.render(scene, camera); };
    loop();
    const src = this.getAttribute('src'); if (src) this._loadSrc(src);
    this.dispatchEvent(new CustomEvent('volu-ready'));
  }
  _loadSrc(src) {
    if (!src) return;
    const loader = new GLTFLoader();
    const draco = new DRACOLoader(); draco.setDecoderPath('https://unpkg.com/three@0.184.0/examples/jsm/libs/draco/gltf/'); loader.setDRACOLoader(draco);
    loader.load(src, (gltf) => {
      const model = gltf.scene; model.name = 'ImportedProperty';
      const bb = new THREE.Box3().setFromObject(model); const size = bb.getSize(new THREE.Vector3()); const center = bb.getCenter(new THREE.Vector3());
      const scale = 15 / Math.max(size.x, size.z, 0.001);
      model.scale.setScalar(scale); model.position.set(-center.x * scale, -bb.min.y * scale, -center.z * scale);
      model.traverse((o) => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true; if (o.material && o.material.metalness > 0.45) o.material.metalness = 0.35; });
      if (this._house) this._scene.remove(this._house);
      this._house = model; this._scene.add(model);
      const hh = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()).y;
      this._controls.target.set(0, hh * 0.42, 0); this._controls.update();
      this.dispatchEvent(new CustomEvent('volu-loaded'));
    }, undefined, (err) => { console.warn('[volu-model] could not load', src, err); this.dispatchEvent(new CustomEvent('volu-error')); });
  }
}
if (!customElements.get('volu-model')) customElements.define('volu-model', VoluModel);
