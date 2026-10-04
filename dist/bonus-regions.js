import * as THREE from 'three';

/* Seven interpretive dioramas along Bilbo's road. Their silhouettes follow
 * Tolkien's own Hobbit illustrations and the production references published
 * by Wētā. Every surface below is constructed locally, with deterministic detail.
 * Furnished interiors support eye-level tours and optional architectural cutaways. */
const TAU = Math.PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function orientLandscape(result,angle){const rotation=new THREE.Matrix4().makeRotationY(angle),point=p=>V(...p).applyMatrix4(rotation).toArray();result.group.rotation.y+=angle;result.camera=point(result.camera);result.target=point(result.target);result.sun=point(result.sun);for(const stop of result.tours){stop.position=point(stop.position);stop.target=point(stop.target);}return result;}
function completeNormals(geo){const p=geo.attributes.position;let n=geo.attributes.normal;if(!n||n.count!==p.count){geo.deleteAttribute('normal');geo.computeVertexNormals();n=geo.attributes.normal;}const missing=new Map();for(let i=0;i<n.count;i++)if(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))<1e-12)missing.set(i,new THREE.Vector3());if(!missing.size)return;const index=geo.index?.array,count=index?.length??p.count;for(let j=0;j<count;j+=3){const ids=[index?index[j]:j,index?index[j+1]:j+1,index?index[j+2]:j+2];for(const i of ids){const sum=missing.get(i);if(sum)for(const k of ids)sum.add(V(n.getX(k),n.getY(k),n.getZ(k)));}}geo.computeBoundingBox();const center=geo.boundingBox.getCenter(new THREE.Vector3());for(const[i,normal]of missing){if(normal.lengthSq()<1e-16)normal.set(p.getX(i),p.getY(i),p.getZ(i)).sub(center);if(normal.lengthSq()<1e-16)normal.set(0,1,0);normal.normalize();n.setXYZ(i,normal.x,normal.y,normal.z);}n.needsUpdate=true;}
function seeded(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let n = Math.imul(seed ^ seed >>> 15, 1 | seed); n ^= n + Math.imul(n ^ n >>> 7, 61 | n); return ((n ^ n >>> 14) >>> 0) / 4294967296; };
}
function surfaceMaps(kind, base, seed) {
  if (typeof document === 'undefined') return {};
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d'); const rnd = seeded(seed); ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
  if (kind === 'wood' || kind === 'thatch') {
    for (let x = 0; x < 512; x += kind === 'thatch' ? 2 : 3) {
      ctx.strokeStyle = `rgba(${rnd() > .48 ? '238,205,145' : '18,13,9'},${.06 + rnd() * .25})`; ctx.lineWidth = .5 + rnd(); ctx.beginPath();
      for (let y = 0; y <= 512; y += 8) { const px = x + Math.sin(y * .018 + x * .08) * (kind === 'thatch' ? .9 : 3); if (!y) ctx.moveTo(px, y); else ctx.lineTo(px, y); } ctx.stroke();
    }
    if (kind === 'wood') for (let i = 0; i < 18; i++) { const x = rnd() * 512, y = rnd() * 512; ctx.strokeStyle = 'rgba(24,14,8,.2)'; ctx.beginPath(); ctx.ellipse(x, y, 3 + rnd() * 5, 11 + rnd() * 20, 0, 0, TAU); ctx.stroke(); }
  } else if (kind === 'slate' || kind === 'masonry') {
    const h = kind === 'slate' ? 32 : 64, w = kind === 'slate' ? 44 : 96;
    for (let y = 0; y < 512; y += h) for (let x = -(y / h % 2) * w / 2; x < 512; x += w) {
      ctx.fillStyle = `rgba(${rnd() > .5 ? '255,242,222' : '8,14,18'},${rnd() * .16})`; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      ctx.strokeStyle = 'rgba(8,12,14,.27)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(245,237,222,.16)'; ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + w - 2, y + 2); ctx.stroke();
    }
  } else if (kind === 'water') {
    for (let i = 0; i < 220; i++) { ctx.strokeStyle = `rgba(191,228,216,${.035 + rnd() * .13})`; const x = rnd() * 512, y = rnd() * 512; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 25, y - 3, x + 42, y + 3, x + 72, y); ctx.stroke(); }
  } else if (kind === 'rock') {
    for (let y = -20; y < 540; y += 8 + rnd() * 16) { ctx.strokeStyle = `rgba(${rnd() > .3 ? '21,25,26' : '235,235,217'},${rnd() * .21})`; ctx.lineWidth = .6 + rnd(); ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= 512; x += 18) ctx.lineTo(x, y + Math.sin(x * .011 + y * .11) * 8); ctx.stroke(); }
  }
  for (let i = 0; i < 11500; i++) { ctx.fillStyle = `rgba(${rnd() > .55 ? '249,244,220' : '10,13,10'},${rnd() * .14})`; ctx.fillRect(rnd() * 512, rnd() * 512, .6 + rnd() * 1.8, .6 + rnd() * 1.5); }
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 8;
  const bumpMap = new THREE.CanvasTexture(canvas); bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping; bumpMap.anisotropy = 4;
  return { map, bumpMap, bumpScale: kind === 'water' ? .035 : kind === 'wood' ? .025 : .055 };
}
function bake(group) {
  group.updateMatrixWorld(true); const rootInverse = group.matrixWorld.clone().invert(); const buckets = new Map();
  group.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || o.userData.dynamic || Array.isArray(o.material)) return;
    let shell = false, parent = o;
    while (parent && parent !== group) { if (parent.userData.cutawayShell) shell = true; parent = parent.parent; }
    if (shell) o.userData.cutawayShell = true;
    const key = o.material.uuid + (shell ? ':cutawayShell' : ':structure');
    const bucket = buckets.get(key) || []; bucket.push(o); buckets.set(key, bucket);
  });
  for (const objects of buckets.values()) {
    if (objects.length < 2) continue;
    const pos = [], nor = [], uv = [], colors = [], idx = []; let offset = 0; const useColors = objects.some(o => !!o.geometry.attributes.color);
    for (const o of objects) {
      const g = o.geometry.clone(); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(rootInverse, o.matrixWorld)); if (!g.attributes.normal) g.computeVertexNormals();completeNormals(g);
      const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv, color = g.attributes.color;
      for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0); if (useColors) colors.push(color ? color.getX(i) : 1, color ? color.getY(i) : 1, color ? color.getZ(i) : 1); }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + offset); else for (let i = 0; i < p.count; i++) idx.push(i + offset);
      offset += p.count; g.dispose();
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); if (useColors) geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geo.setIndex(idx); geo.computeBoundingSphere();
    const merged = new THREE.Mesh(geo, objects[0].material); merged.name = 'Handcrafted architectural and landscape details'; merged.castShadow = !merged.material.transparent; merged.receiveShadow = true;
    if (objects[0].userData.cutawayShell) { merged.userData.cutawayShell = true; merged.name = 'Removable architectural roof or upper cave vault'; }
    for (const o of objects) { o.parent.remove(o); o.geometry.dispose(); } group.add(merged);
  }
}
function workshop(seed) {
  const rnd = seeded(seed), group = new THREE.Group(), animators = []; const mat = (color, roughness = .88, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const tex = (color, kind, roughness = .9, extra = {}) => { const maps = surfaceMaps(kind, color, seed + color.length); return mat(maps.map ? '#ffffff' : color, roughness, 0, { ...maps, ...extra }); };
  const m = {
    grass: tex('#526443', 'grain'), meadow: tex('#747b4f', 'grain'), earth: tex('#594c3c', 'grain'), moss: tex('#47503c', 'grain'),
    slate: tex('#66747a', 'rock'), darkStone: tex('#343c3e', 'rock'), paleStone: tex('#b9bbb0', 'masonry'), stone: tex('#899185', 'rock'), snow: mat('#e2e7de', .96),
    wood: tex('#6b4b31', 'wood'), darkWood: tex('#372d25', 'wood'), paleWood: tex('#af9160', 'wood'), bark: tex('#4c4438', 'wood'), thatch: tex('#b49b62', 'thatch'), roof: tex('#58625f', 'slate'), redWood: tex('#814f39', 'wood'),
    iron: mat('#353c3c', .47, .65), gold: mat('#c5a56a', .39, .66), copper: mat('#aa784d', .56, .48), leaves: mat('#435d39'), darkLeaves: mat('#233c2c'), pine: mat('#2d4438'), fern: mat('#62774c'),
    water: tex('#487779', 'water', .21, { metalness: .28 }), glass: mat('#e6b971', .27, .15, { emissive: '#e6a65e', emissiveIntensity: .63 }),
    fire: mat('#f6ae35', .22, 0, { emissive: '#ff7621', emissiveIntensity: 3.2 }), ember: mat('#b74728', .7, 0, { emissive: '#e85127', emissiveIntensity: 1.2 }),
    black: mat('#152024'), web: mat('#c2c6ae', .8, 0, { transparent: true, opacity: .35, depthWrite: false, side: THREE.DoubleSide }), mist: mat('#aebdc0', 1, 0, { transparent: true, opacity: .095, depthWrite: false, side: THREE.DoubleSide })
  };
  const mesh = (geo, material, at = [0, 0, 0], scale = [1, 1, 1], parent = group) => { completeNormals(geo);const o = new THREE.Mesh(geo, material); o.position.set(...at); o.scale.set(...scale); o.castShadow = !material.transparent; o.receiveShadow = true; parent.add(o); return o; };
  const box = (w, h, d, material, at, parent) => mesh(new THREE.BoxGeometry(w, h, d), material, at, undefined, parent);
  const cyl = (r1, r2, h, material, at, segments = 20, parent) => mesh(new THREE.CylinderGeometry(r1, r2, h, segments, 1), material, at, undefined, parent);
  const ball = (r, material, at, scale, parent, seg = 24) => mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * .66)), material, at, scale, parent);
  const beam = (a, b, radius, material = m.wood, parent = group, topRadius = radius) => { const av = V(...a), bv = V(...b); const o = cyl(topRadius, radius, av.distanceTo(bv), material, av.clone().add(bv).multiplyScalar(.5).toArray(), 12, parent); o.quaternion.setFromUnitVectors(V(0, 1, 0), bv.sub(av).normalize()); return o; };
  const tube = (points, radius, material, parent = group, segments = 40, sides = 9) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => V(...p))), segments, radius, sides, false), material, undefined, undefined, parent);
  const rock = (at, scale = [1, 1, 1], material = m.stone, detail = 2, parent = group) => { const geo = new THREE.IcosahedronGeometry(1, detail), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const n = 1 + .07 * Math.sin(x * 17 + z * 7) * Math.cos(y * 11) + .06 * Math.sin(z * 19 - y * 5); p.setXYZ(i, x * n, y * n, z * n); } geo.computeVertexNormals(); return mesh(geo, material, at, scale, parent); };
  const parametric = (fn, nu, nv, material, parent = group) => { const pos = [], uv = [], idx = []; for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { pos.push(...fn(i / nu, j / nv)); uv.push(i / nu * 5, j / nv * 5); } for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i; idx.push(a, a + 1, a + nu + 1, a + 1, a + nu + 2, a + nu + 1); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return mesh(g, material, undefined, undefined, parent); };
  const ground = (r, height, material = m.grass, segments = 224, outline = null) => {
    const extent = outline ? r * 1.065 : r;
    const geo = new THREE.PlaneGeometry(extent * 2, extent * 2, segments, segments); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, colors = [], cc = new THREE.Color();
    for (let i = 0; i < p.count; i++) { let x = p.getX(i), z = p.getZ(i); const d = Math.hypot(x, z), boundary = outline ? outline(Math.atan2(z, x)) : r; if (d > boundary) { x *= boundary / d; z *= boundary / d; } const y = height(x, z); p.setXYZ(i, x, y, z); const k = .89 + Math.sin(x * 1.7 + z * 2.1) * .04 + rnd() * .035; cc.setRGB(k, k + .025, k - .03); colors.push(cc.r, cc.g, cc.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geo.computeVertexNormals(); const own = material.clone(); own.vertexColors = true; return mesh(geo, own);
  };
  const landscape=(width,depth,height,material=m.grass,nx=300,nz=240)=>{
    const geo=new THREE.PlaneGeometry(width,depth,nx,nz);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,uv=geo.attributes.uv,colors=[];
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,height(x,z));uv.setXY(i,uv.getX(i)*8,uv.getY(i)*8);const k=.9+.06*Math.sin(x*.43+z*.29);colors.push(k,k+.02,k-.025);}
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const own=material.clone();own.vertexColors=true;const land=mesh(geo,own);land.name='Continuous landscape beyond the settlement';return land;
  };
  const plinth = (radius = 20, material = m.earth, depth = 1.4) => { cyl(radius, radius * .93, depth, material, [0, -depth / 2 - .11, 0], 112); cyl(radius * .945, radius * .925, .1, m.darkWood, [0, -depth - .12, 0], 112); };
  // An irregular landscape section avoids a round display plate in open country.
  const section = (radius, height, depth = 1.5, material = m.earth) => {
    const outline = a => radius * (1 + .035 * Math.sin(a * 5 + .4) + .018 * Math.cos(a * 9));
    parametric((u, v) => { const a = u * TAU, r = outline(a) * (1 - v * .035), x = Math.cos(a) * r, z = Math.sin(a) * r; return [x, lerp(height(Math.cos(a) * outline(a), Math.sin(a) * outline(a)) - .04, -depth, v), z]; }, 160, 3, material);
    return outline;
  };
  const path = (points, width, material = m.earth, parent = group, steps = 144) => { const curve = new THREE.CatmullRomCurve3(points.map(p => V(...p))); const pos = [], uv = [], idx = []; for (let i = 0; i <= steps; i++) { const t = i / steps, p = curve.getPoint(t), dir = curve.getTangent(t), side = V(-dir.z, 0, dir.x).normalize().multiplyScalar(width / 2); pos.push(p.x + side.x, p.y, p.z + side.z, p.x - side.x, p.y, p.z - side.z); uv.push(0, t * 14, 1, t * 14); if (i < steps) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); const o = mesh(g, material, undefined, undefined, parent); o.material.side = THREE.DoubleSide; return o; };
  const roof = (w, rise, d, y, material = m.roof, parent = group, centerZ = 0, sides = [-1, 1]) => { for (const side of sides) { const o = box(Math.hypot(w / 2, rise), .16, d, material, [side * w / 4, y + rise / 2, centerZ], parent); o.rotation.z = -side * Math.atan2(rise, w / 2); } box(.15, .2, d + .3, m.darkWood, [0, y + rise, centerZ], parent); };
  const gable = (w, h, d, material, at, parent = group) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(0, h); s.lineTo(w / 2, 0); s.closePath(); return mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), material, at, undefined, parent); };
  const arch = (width, height, depth, material, at, parent = group, thick = .21) => { const r = width / 2, stem = height - r, s = new THREE.Shape(); s.moveTo(-r, 0); s.lineTo(-r, stem); s.absarc(0, stem, r, Math.PI, 0, true); s.lineTo(r, 0); s.lineTo(r - thick, 0); s.lineTo(r - thick, stem); s.absarc(0, stem, r - thick, 0, Math.PI, false); s.lineTo(-r + thick, 0); s.closePath(); return mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: .035, bevelThickness: .035, bevelSegments: 2, curveSegments: 28 }), material, at, undefined, parent); };
  const window = (x, y, z, w, h, parent = group) => { box(w, h, .065, m.glass, [x, y, z], parent); for (const side of [-1, 1]) { box(.065, h + .12, .09, m.paleWood, [x + side * w / 2, y, z + .06], parent); box(w + .12, .065, .09, m.paleWood, [x, y + side * h / 2, z + .06], parent); } box(.055, h, .12, m.darkWood, [x, y, z + .07], parent); box(w, .055, .12, m.darkWood, [x, y, z + .07], parent); };
  const lantern = (at, parent = group, light = false) => { const [x, y, z] = at; box(.22, .32, .22, m.glass, at, parent); cyl(0, .21, .18, m.iron, [x, y + .22, z], 4, parent); box(.28, .07, .28, m.iron, [x, y - .2, z], parent); for (const dx of [-.12, .12]) for (const dz of [-.12, .12]) box(.03, .34, .03, m.iron, [x + dx, y, z + dz], parent); if (light) { const l = new THREE.PointLight('#ffc280', 3.5, 7); l.position.set(x, y, z); parent.add(l); } };
  const fire = (at, size = 1) => { const [x, y, z] = at; for (let i = 0; i < 7; i++) { const a = i * TAU / 7; rock([x + Math.cos(a) * size * .7, y, z + Math.sin(a) * size * .7], [size * .32, size * .16, size * .28], m.darkStone, 1); } for (let i = 0; i < 5; i++) { const a = i * TAU / 5; beam([x - Math.cos(a) * size * .5, y + .09, z - Math.sin(a) * size * .5], [x + Math.cos(a) * size * .5, y + .19, z + Math.sin(a) * size * .5], size * .1, m.darkWood); } const flames = []; for (let i = 0; i < 3; i++) { const o = mesh(new THREE.ConeGeometry(size * .23, size * .9, 10, 8), m.fire, [x + (i - 1) * size * .17, y + size * .42, z]); o.userData.dynamic = true; flames.push(o); } const light = new THREE.PointLight('#ffba65', 6 * size, 10 * size); light.position.set(x, y + .8 * size, z); group.add(light); animators.push(t => { flames.forEach((o, i) => { o.scale.y = .85 + Math.sin(t * 4.1 + i * 2) * .15; }); light.intensity = 5.5 * size + Math.sin(t * 3.7) * size * .5; }); };
  const pine = (x, y, z, size = 1, parent = group) => { const t = new THREE.Group(); t.position.set(x, y, z); t.scale.setScalar(size); parent.add(t); cyl(.07, .16, 3.2, m.bark, [0, 1.5, 0], 12, t); for (let level = 0; level < 5; level++) { const r = .96 - level * .15, h = 1.4 - level * .12; const geo = new THREE.ConeGeometry(r, h, 16, 4); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const yy = p.getY(i); p.setY(i, yy + Math.sin(i * 2.1) * .045); } geo.computeVertexNormals(); mesh(geo, m.pine, [0, 1.18 + level * .52, 0], undefined, t); } return t; };
  const ancientTree = (x, y, z, size = 1, canopy = true, parent = group, reduced = false) => { const t = new THREE.Group(),phase=rnd()*TAU,branchCount=5+Math.floor(rnd()*4);t.position.set(x, y, z); t.scale.setScalar(size);t.rotation.y=phase;parent.add(t); const geo = new THREE.CylinderGeometry(.3+rnd()*.2,.7+rnd()*.3,6,reduced ? 18 : 28,reduced ? 18 : 28); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const yy = p.getY(i), a = Math.atan2(p.getZ(i), p.getX(i)); const f = 1 + .1 * Math.sin(a * 7 + yy * 2+phase) + .055 * Math.cos(a * 13 - yy+phase*.3); p.setXYZ(i, p.getX(i) * f + Math.sin(yy * .8+phase) * .22, yy, p.getZ(i) * f + Math.cos(yy * .65+phase) * .2); } geo.computeVertexNormals(); mesh(geo, m.bark, [0, 3, 0], undefined, t);
    const crowns=[];for (let i = 0; i < branchCount; i++) { const a = i * TAU / branchCount + rnd() * .35, dx = Math.sin(a), dz = Math.cos(a),reach=.75+rnd()*.6,tipY=6.1+rnd()*1.9; tube([[dx * .23, 1.12, dz * .23], [dx * .8, .32, dz * .75], [dx * 1.7, .1, dz * 1.45], [dx * 2.5, .015, dz * 2.15]], .1 + rnd() * .075, m.bark, t, reduced ? 16 : 28, reduced ? 6 : 9); const points = [[0, 3.3+rnd(), 0], [dx * 1.2, 5.1+rnd()*.8, dz * 1.3], [dx * 2.7*reach, tipY-.6, dz * 2.6*reach], [dx * 3.45*reach, tipY, dz * 3.5*reach]]; tube(points, .13 + rnd() * .1, m.bark, t, reduced ? 18 : 36, reduced ? 7 : 10);crowns.push([dx*2.7*reach,tipY,dz*2.65*reach]); }
    if(canopy){const leafGeo=new THREE.BufferGeometry();leafGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,.024,0,.19,0,.09,.08,0,.07,-.11,0,0,-.2,0,-.07,-.11,0,-.09,.08,0],3));leafGeo.setIndex([0,1,2,0,2,3,0,3,4,0,4,5,0,5,6,0,6,1]);leafGeo.computeVertexNormals();const leafMat=m.leaves.clone();leafMat.side=THREE.DoubleSide;const count=reduced?260:650,leaves=new THREE.InstancedMesh(leafGeo,leafMat,count),dummy=new THREE.Object3D(),color=new THREE.Color();for(let i=0;i<count;i++){const crown=crowns[i%crowns.length],a=rnd()*TAU,r=Math.sqrt(rnd())*2.15;dummy.position.set(crown[0]+Math.cos(a)*r,crown[1]+(rnd()-.5)*1.4,crown[2]+Math.sin(a)*r*.9);dummy.rotation.set(rnd()*Math.PI,rnd()*TAU,rnd()*TAU);dummy.scale.setScalar(.72+rnd()*.85);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);color.setHSL(.25+rnd()*.065,.21+rnd()*.2,.2+rnd()*.12);leaves.setColorAt(i,color);}leaves.castShadow=leaves.receiveShadow=true;leaves.name='Individual leaves on branching old woodland trees';t.add(leaves);}return t; };
  const fern = (x, y, z, size = 1, parent = group) => { for (let j = 0; j < 5; j++) { const a = j * TAU / 5, dx = Math.sin(a), dz = Math.cos(a); const center = []; for (let i = 0; i <= 8; i++) { const u = i / 8; center.push([x + dx * u * size, y + Math.sin(u * Math.PI * .78) * size * .6, z + dz * u * size]); } tube(center, .008 * size, m.fern, parent, 12, 5); for (let i = 1; i < 7; i++) { const u = i / 8, len = Math.sin(u * Math.PI) * .18 * size; for (const side of [-1, 1]) beam([x + dx * u * size, y + Math.sin(u * Math.PI * .78) * size * .6, z + dz * u * size], [x + dx * (u + .07) * size + dz * len * side, y + Math.sin(u * Math.PI * .78) * size * .61, z + dz * (u + .07) * size - dx * len * side], .018 * size, m.fern, parent, .002); } } };
  const scatter = (height, count, radius, predicate = () => true, material = m.moss) => { const geo = new THREE.ConeGeometry(.055, .34, 4); geo.translate(0, .17, 0); const inst = new THREE.InstancedMesh(geo, material, count), d = new THREE.Object3D(); let made = 0; for (let i = 0; i < count * 14 && made < count; i++) { const x = (rnd() - .5) * radius * 2, z = (rnd() - .5) * radius * 2; if (Math.hypot(x, z) > radius || !predicate(x, z)) continue; d.position.set(x, height(x, z), z); d.rotation.y = rnd() * TAU; d.scale.set(.6 + rnd(), .5 + rnd(), .6 + rnd()); d.updateMatrix(); inst.setMatrixAt(made++, d.matrix); } inst.count = made; inst.castShadow = false; group.add(inst); };
  const finish = (camera = [26, 19, 32], target = [0, 3, 0], fog = '#8f9b93', background = '#aab2a0', sun = [-16, 25, 16], tours = []) => { bake(group); return { group, camera, target, fog, background, sun, tours, animate: (t,dt=1/60) => animators.forEach(fn => fn(t,dt)) }; };
  return { rnd, group, animators, m, mat, mesh, box, cyl, ball, beam, tube, rock, parametric, ground, landscape, plinth, section, path, roof, gable, arch, window, lantern, fire, pine, ancientTree, fern, scatter, finish };
}

function misty() {
  const c = workshop(294101), { m, rnd, group, ground, path, pine, rock, finish } = c;
  const peaks = [[-5,-12,30,8,11],[2,2,25,8,9],[-4,21,31,10,13],[7,-28,38,11,12],[-2,-54,46,12,15],[2,49,39,12,15],[-5,71,43,13,17],[6,-77,42,13,15],[-20,-20,14,11,15],[20,27,17,10,14]];
  const height = (x, z) => { let h = .2; for (const [px, pz, ph, wx, wz] of peaks) { const q = Math.sqrt((x - px) ** 2 / wx ** 2 + (z - pz) ** 2 / wz ** 2); h = Math.max(h, ph * Math.max(0, 1 - q / 2.2) ** 1.52); } const ridge = Math.sin(x * 2.3 + z * .51) * .28 + Math.cos(x * 4.2 - z * .8) * .13 + Math.sin(z * 3.4 + x * .73) * .12; return h + ridge * clamp(h / 3, 0, 1) + .045 * Math.sin(x * .5) * Math.cos(z * .9); };
  const mountain = c.landscape(140,190,height,m.slate,360,320), p = mountain.geometry.attributes.position, colors = mountain.geometry.attributes.color, color = new THREE.Color(); mountain.material.map = null; mountain.material.color.set('#ffffff'); mountain.material.bumpScale = .075;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i), z = p.getZ(i), n = .045 * Math.sin(x * 9 + z * 4); if (y < 5) color.set('#637453'); else if (y > 22 + Math.sin(x * 1.9) * 1.4 + Math.cos(z * 2.1) * .7) color.set('#dee4dc'); else color.set('#78888f'); const k = .83 + n + .1 * Math.sin(z * 3 + x); color.multiplyScalar(k); colors.setXYZ(i, color.r, color.g, color.b); }
  // The ridge runs north–south; the High Pass climbs from the western foothills
  // over its saddle and descends east, instead of circling an isolated cone.
  const route = []; for (let i = 0; i <= 28; i++) { const t=i/28,x=-51+t*102,z=1+Math.sin(t*TAU)*7.5;route.push([x,height(x,z)+.075,z]);}path(route,.8,m.paleStone,group,240);
  for (let i = 0; i < 240; i++) { const x=(rnd()-.5)*126,z=(rnd()-.5)*174,h=height(x,z);if(h<7.5&&Math.abs(x)>14)pine(x,h,z,.65+rnd()*1.25); }
  for (let i = 0; i < 36; i++) { const x = (rnd() - .5) * 32, z = (rnd() - .5) * 35; if (Math.hypot(x, z) < 20) rock([x, height(x, z) + .2, z], [.3 + rnd() * .7, .4 + rnd(), .3 + rnd() * .8], m.slate); }
  c.scatter(height,5000,68,(x,z)=>height(x,z)<5,m.meadow);
  // Thin banked mist stays beneath the high peaks rather than covering their silhouettes.
  for (let i = 0; i < 8; i++) c.ball(1, m.mist, [-7 + i * 2, 2.8 + i % 3 * .25, -7 + i * 2], [5.8, .35, 1.3], group, 32);
  const cave = route[12], [cx, cy, cz] = cave;
  c.box(3.9, .24, 3, m.slate, [cx, cy + .06, cz - .3]);
  for (const side of [-1, 1]) rock([cx + side * 1.72, cy + 1.65, cz - .65], [.9, 1.9, 1.45], m.darkStone, 2);
  rock([cx, cy + 3.3, cz - .9], [2.5, .75, 1.6], m.slate, 2);
  c.box(2.8, 2.8, .08, m.black, [cx, cy + 1.48, cz - 1.65]);
  const ledgeY = height(8, -5.8) + .45;
  rock([8.5, ledgeY - .45, -6], [2.5, .85, 2.1], m.slate, 2);
  c.box(4.1, .18, 2.8, m.slate, [8.2, ledgeY, -5.8]);
  const nest = c.mesh(new THREE.TorusGeometry(.75, .13, 8, 32), m.darkWood, [9.2, ledgeY + .18, -6.1]); nest.rotation.x = Math.PI / 2;
  for (let i = 0; i < 17; i++) { const a = i * TAU / 17; c.beam([9.2 + Math.cos(a) * .8, ledgeY + .15, -6.1 + Math.sin(a) * .8], [9.2 + Math.cos(a + .5) * .68, ledgeY + .3, -6.1 + Math.sin(a + .5) * .68], .026, m.paleWood); }
  const foot = index => { const q = route[index]; return [q[0], q[1] + 1.62, q[2]]; };
  const tours = [
    { title: 'Podejście do Wysokiej Przełęczy', position: foot(3), target: [route[8][0], route[8][1] + 1.1, route[8][2]], text: 'Wąska droga pnie się ponad ostatnimi sosnami. To przełęcz kompanii Bilba, odrębna od Caradhrasu.' },
    { title: 'Ścieżka na skalnym grzbiecie', position: foot(15), target:[route[18][0],route[18][1]+1.1,route[18][2]], text: 'Popękana szara skała i grzbiety ciągną się z północy na południe; droga przechodzi na wschodni stok.' },
    { title: 'Schronienie w jaskini', position: [cx, cy + 1.82, cz + 1.35], target: [cx, cy + 1.5, cz - 1.2], text: 'Wędrowcy szukają schronienia przed burzą. Za takim skalnym wejściem opowieść prowadzi ku ukrytemu przejściu goblinów.' },
    { title: 'Orla półka — widok ku zachodowi', position: [7.2, ledgeY + 1.72, -5.2], target: [-6, 5.8, -8], text: 'Z wysoko położonej półki widać kolejne pasma i doliny. Gniazdo jest bez postaci; punkt widokowy interpretuje rysunek Tolkiena z 1937 roku.' },
    { title: 'Zejście do Dzikich Krajów', position: foot(24),target:[route[28][0],route[28][1]+1.1,route[28][2]],text:'Za grzbietem ścieżka opada ku dolinie Anduiny na wschodzie. Rivendell i Eriador pozostają za plecami.' },
    {title:'Łańcuch północ–południe',position:[-45,43,69],target:[2,22,-34],text:'Odległe granie kontynuują pasmo poza okolicą Wysokiej Przełęczy.'},
  ];
  return finish([75,56,103],[0,15,0],'#9baeb5','#b6c2c1',[-55,85,42],tours);
}

function cavern(c, radius = 17, roofHeight = 13, material = c.m.darkStone) {
  material.side = THREE.DoubleSide;
  const shape = (u, v) => { const a = .10 + u * Math.PI * 1.60, angle = v * Math.PI / 2, r = radius * Math.cos(angle); const wave = 1 + .045 * Math.sin(a * 17 + v * 19) + .025 * Math.cos(a * 31 - v * 27); return [Math.cos(a) * r * wave, .12 + roofHeight * Math.sin(angle) * wave, -2 - Math.sin(a) * r * wave]; };
  const wall = c.parametric((u, v) => shape(u, v * .32), 256, 24, material);
  const vault = c.parametric((u, v) => shape(u, .32 + v * .68), 256, 48, material);
  wall.name = 'Permanent lower living-rock cavern wall'; vault.userData.cutawayShell = true; vault.name = 'Upper living-rock cave vault';
  return { wall, vault };
}
function timberBridge(c, a, b, width = 1.6, rail = true, sag = .35, parent = c.group) {
  const av = V(...a), bv = V(...b), dir = bv.clone().sub(av), length = Math.hypot(dir.x, dir.z), side = V(-dir.z, 0, dir.x).normalize(), steps = Math.ceil(length / .24);
  const yAt = t => lerp(a[1], b[1], t) - Math.sin(t * Math.PI) * sag;
  for (let i = 0; i <= steps; i++) { const t = i / steps, p = av.clone().lerp(bv, t); p.y = yAt(t); const board = c.box(width, .09, length / steps * .86, c.m.wood, p.toArray(), parent); board.rotation.y = Math.atan2(side.x, side.z) - Math.PI / 2;
    if (rail && (i % 5 === 0 || i === steps)) for (const s of [-1, 1]) c.beam(p.clone().addScaledVector(side, width * .48 * s).toArray(), p.clone().addScaledVector(side, width * .48 * s).add(V(0, .94, 0)).toArray(), .035, c.m.darkWood, parent);
  }
  for (const s of [-1, 1]) { const points = []; for (let i = 0; i <= 32; i++) { const t = i / 32, p = av.clone().lerp(bv, t).addScaledVector(side, width * .48 * s); p.y = yAt(t) + (rail ? .84 : -.07); points.push(p.toArray()); } c.tube(points, rail ? .035 : .08, rail ? c.m.paleWood : c.m.darkWood, parent, 64, 8); }
}
function carvedHall(c,name,at,width,depth,height,culture='dwarf',options={}){
  const {m}=c,hall=new THREE.Group(),elf=culture==='elf',doorWidth=options.doorWidth??(elf?3.6:4.8),opening=Math.min(options.doorHeight??4.5,height*.82);
  hall.name=name;hall.position.set(...at);hall.userData.chamber={width,depth,floor:at[1],culture};c.group.add(hall);
  const floorShape=new THREE.Shape();
  if(elf){for(let i=0;i<=80;i++){const a=i/80*TAU,f=1+.016*Math.sin(a*5);const x=Math.cos(a)*width/2*f,z=Math.sin(a)*depth/2*f;if(i)floorShape.lineTo(x,z);else floorShape.moveTo(x,z);}}
  else{floorShape.moveTo(-width/2,-depth/2);floorShape.lineTo(width/2,-depth/2);floorShape.lineTo(width/2,depth/2);floorShape.lineTo(-width/2,depth/2);floorShape.closePath();}
  for(const[x,z,w,d]of options.floorHoles??[]){const h=new THREE.Path();h.moveTo(x-w/2,z-d/2);h.lineTo(x-w/2,z+d/2);h.lineTo(x+w/2,z+d/2);h.lineTo(x+w/2,z-d/2);h.closePath();floorShape.holes.push(h);}
  const fg=new THREE.ExtrudeGeometry(floorShape,{depth:.35,bevelEnabled:false});fg.rotateX(Math.PI/2);c.mesh(fg,m.paleStone,[0,0,0],undefined,hall);
  if(elf){
    const wall=c.parametric((u,v)=>{const a=u*TAU,f=1+.016*Math.sin(a*5);return[Math.cos(a)*width/2*f,v*height,Math.sin(a)*depth/2*f];},160,20,m.darkStone,hall),p=wall.geometry.attributes.position,index=[];
    for(let i=0;i<wall.geometry.index.count;i+=3){const ids=[0,1,2].map(j=>wall.geometry.index.getX(i+j)),x=ids.reduce((s,j)=>s+p.getX(j),0)/3,y=ids.reduce((s,j)=>s+p.getY(j),0)/3,z=ids.reduce((s,j)=>s+p.getZ(j),0)/3;if(!(y<opening&&(Math.abs(x)<doorWidth/2+.25||Math.abs(z)<doorWidth/2+.25)))index.push(...ids);}
    wall.geometry.setIndex(index);wall.geometry.computeVertexNormals();completeNormals(wall.geometry);
  }else{
    for(const side of[-1,1]){for(const direction of[-1,1]){c.box(.55,height,(depth-doorWidth)/2,m.darkStone,[side*width/2,height/2,direction*(depth+doorWidth)/4],hall);c.box((width-doorWidth)/2,height,.55,m.darkStone,[direction*(width+doorWidth)/4,height/2,side*depth/2],hall);}c.box(.55,height-opening,doorWidth,m.darkStone,[side*width/2,(height+opening)/2,0],hall);c.box(doorWidth,height-opening,.55,m.darkStone,[0,(height+opening)/2,side*depth/2],hall);}
  }
  for(const side of[-1,1]){c.arch(doorWidth,opening,.6,m.paleStone,[0,0,side*depth/2],hall,.22);const a=c.arch(doorWidth,opening,.6,m.paleStone,[side*width/2,0,0],hall,.22);a.rotation.y=Math.PI/2;}
  const roof=new THREE.Group();roof.name='Removable vault — '+name;roof.userData.cutawayShell=true;hall.add(roof);const stone=m.stone.clone();stone.side=THREE.DoubleSide;
  if(elf)c.parametric((u,v)=>{const a=u*TAU,r=1-v;return[Math.cos(a)*width/2*r,height+Math.sin(v*Math.PI/2)*height*.35,Math.sin(a)*depth/2*r];},100,35,stone,roof);
  else c.parametric((u,v)=>[lerp(-width/2,width/2,u),height+(1-Math.abs(u*2-1))*height*.28,lerp(-depth/2,depth/2,v)],36,30,stone,roof);
  for(const z of[-depth*.32,-depth*.12,depth*.12,depth*.32])for(const side of[-1,1]){const x=side*(elf?width*.32:width/2-2.5);c.cyl(elf?.22:.44,elf?.43:.69,height-.2,m.paleStone,[x,height/2,z],elf?18:8,hall);c.box(elf?.9:1.45,.28,elf?.9:1.45,m.darkStone,[x,.14,z],hall);if(elf)c.tube([[x,height-.5,z],[x*.75,height+.6,z],[0,height*1.29,z]],.14,m.paleStone,roof,20,9);else{c.box(1.6,.34,1.6,m.stone,[x,height-.32,z],hall);c.beam([x,height-.3,z],[0,height*1.28,z],.22,m.stone,roof);for(let j=0;j<3;j++)c.box(.85,.11,.91,m.gold,[x,1+j*.34,z],hall);}}
  for(const side of[-1,1])c.lantern([side*width*.28,height*.52,depth*.08],hall,options.light===true);return hall;
}
function furniture(c,hall,kind,width,depth){
  const {m}=c;
  if(kind==='feast'||kind==='council')for(const side of[-1,1]){const x=side*width*.22;c.box(width*.25,.16,depth*.5,m.paleWood,[x,1,0],hall);for(const z of[-depth*.19,depth*.19])for(const dx of[-width*.08,width*.08])c.box(.16,.92,.16,m.darkWood,[x+dx,.48,z],hall);for(const s of[-1,1])c.box(.4,.16,depth*.53,m.wood,[x+s*width*.16,.58,0],hall);}
  if(kind==='work'||kind==='arms')for(const side of[-1,1])for(const z of[-depth*.25,depth*.23]){const x=side*width*.34;c.box(2.6,.88,1.6,m.darkStone,[x,.44,z],hall);c.box(2.8,.22,1.8,kind==='arms'?m.iron:m.darkWood,[x,1,z],hall);for(let j=0;j<5;j++){if(kind==='arms')c.beam([x-1+j*.5,1.2,z-.48],[x-1+j*.5,2.8,z-.48],.045,m.iron,hall);else c.box(.37,.17,.26,m.copper,[x-.8+j*.4,1.22,z],hall);}}
  if(kind==='archive')for(const side of[-1,1])for(let j=0;j<6;j++){const x=side*width*.35;c.box(.62,.12,depth*.45,m.wood,[x,.7+j*.52,0],hall);for(let k=0;k<12;k++)c.box(.19,.35,.4,k%3?m.darkWood:m.redWood,[x,.93+j*.52,-depth*.2+k*depth*.034],hall);}
  if(kind==='home')for(const side of[-1,1])for(const z of[-depth*.23,depth*.24]){const x=side*width*.31;c.box(2.3,.34,3,m.darkWood,[x,.28,z],hall);c.box(2.15,.2,2.86,m.thatch,[x,.55,z],hall);c.box(.75,.75,.7,m.wood,[x+side*1.6,.4,z],hall);}
}
function connectRooms(c,a,b,width=3.5,height=4.5){
  stonePassage(c,[a,b],width,height);if(Math.abs(a[1]-b[1])>.12)stoneStairs(c,a,b,width);return [a,b];
}
function stonePassage(c,points,width=3.5,height=4.2){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p))),stone=c.m.darkStone.clone();stone.side=THREE.DoubleSide;const roof=c.parametric((u,v)=>{const p=curve.getPoint(v),d=curve.getTangent(v),side=V(-d.z,0,d.x).normalize(),a=u*Math.PI;return p.addScaledVector(side,Math.cos(a)*width/2).add(V(0,Math.sin(a)*height,0)).toArray();},40,140,stone);roof.userData.cutawayShell=true;c.path(points,width,c.m.stone,c.group,180);return roof;}
function stoneStairs(c,a,b,width=3.5){const av=V(...a),bv=V(...b),length=Math.hypot(b[0]-a[0],b[2]-a[2]),count=Math.max(2,Math.ceil(length/.38),Math.ceil(Math.abs(b[1]-a[1])/.16)),angle=Math.atan2(b[0]-a[0],b[2]-a[2]);for(let i=0;i<count;i++){const p=av.clone().lerp(bv,(i+.5)/count),step=c.box(width,.19,length/count*1.06,c.m.paleStone,p.toArray());step.rotation.y=angle;}for(const side of[-1,1]){const offset=V(Math.cos(angle)*side*width/2,1,Math.sin(angle)*-side*width/2);c.beam(av.clone().add(offset).toArray(),bv.clone().add(offset).toArray(),.045,c.m.stone);}}
function goblintown() {
  const c=workshop(294102),{m,rnd,group,box,beam,tube,rock,cyl,lantern,finish}=c;
  const lakeCentre=[54,-62],deepRoute=[[30,.2,-43],[41,-4.5,-46],[47,-9.5,-52],[49,-13.6,-61]],height=(x,z)=>{
    const base=.18+.22*Math.sin(x*.36)*Math.cos(z*.43),q=Math.hypot((x-lakeCentre[0])/13.8,(z-lakeCentre[1])/11.8);let y=q<1.3?lerp(-14.8,base,clamp((q-.86)/.44,0,1)):base;
    for(let i=1;i<deepRoute.length;i++){const a=deepRoute[i-1],b=deepRoute[i],vx=b[0]-a[0],vz=b[2]-a[2],t=clamp(((x-a[0])*vx+(z-a[2])*vz)/(vx*vx+vz*vz),0,1);if(Math.hypot(x-a[0]-t*vx,z-a[2]-t*vz)<1.9)y=Math.min(y,lerp(a[1],b[1],t)-.6);}return y;
  };
  c.landscape(185,190,height,m.darkStone,250,260);
  const main=cavern(c,67,40,m.darkStone);main.wall.scale.z=1.24;main.vault.scale.z=1.24;
  // Permanent lower rock is pierced where the western, eastern and deep routes
  // meet the settlement; the optional roof never seals those connections.
  const p=main.wall.geometry.attributes.position,index=[];for(let i=0;i<main.wall.geometry.index.count;i+=3){const ids=[0,1,2].map(j=>main.wall.geometry.index.getX(i+j)),x=ids.reduce((s,j)=>s+p.getX(j),0)/3,y=ids.reduce((s,j)=>s+p.getY(j),0)/3,z=ids.reduce((s,j)=>s+p.getZ(j),0)/3*1.24;if(!((Math.abs(x)>52&&z>-16&&z<19&&y<21)||(x>38&&z<-39&&y<13)))index.push(...ids);}main.wall.geometry.setIndex(index);main.wall.geometry.computeVertexNormals();
  const roofDetails=new THREE.Group();roofDetails.userData.cutawayShell=true;group.add(roofDetails);
  for(let i=0;i<75;i++){const a=.2+i/74*Math.PI*1.5,r=62+rnd()*4,x=Math.cos(a)*r,z=-2-Math.sin(a)*r*1.24;rock([x,8+rnd()*8,z],[2.6+rnd()*2.2,8+rnd()*9,2.1+rnd()*1.8],i%4?m.stone:m.slate,2);}
  for(let i=0;i<88;i++){const a=rnd()*TAU,r=Math.sqrt(rnd())*51,x=Math.cos(a)*r,z=-18+Math.sin(a)*r*.86;const y=34+Math.sqrt(Math.max(0,1-(r/67)**2))*5;rock([x,y,z],[.22+rnd()*.5,1.8+rnd()*4,.24+rnd()*.6],m.stone,1,roofDetails);}
  const platform=(x,y,z,w,d,posts=true)=>{
    for(let i=0;i<Math.ceil(d/.34);i++)box(w,.16,.31,m.wood,[x,y,z-d/2+i*.34]);
    for(const side of[-1,1])box(.22,.31,d,m.darkWood,[x+side*(w/2-.25),y-.28,z]);
    if(posts)for(const dx of[-w*.38,w*.38])for(const dz of[-d*.36,d*.36]){beam([x+dx,height(x+dx,z+dz),z+dz],[x+dx,y,z+dz],.17,m.darkWood);beam([x-dx,y-2.1,z+dz],[x+dx,y-.2,z+dz],.105,m.paleWood);}
  };
  // A broad gathering hall dominates the centre; three uneven galleries wrap
  // around it, with stairs, diagonal links and occupied working platforms.
  platform(0,5.6,-20,36,28);platform(0,8.1,-31,12,6);
  for(let i=0;i<16;i++)box(6,.16,.49,m.paleWood,[0,5.72+i*.15,-22.8-i*.49]);
  box(3,.85,2.6,m.darkStone,[0,8.61,-31.5]);box(3.2,4.6,.65,m.stone,[0,11.33,-33]);box(3.5,.38,2.6,m.darkWood,[0,9.23,-31.3]);for(const side of[-1,1]){rock([side*1.8,10.4,-31.5],[.47,1.35,.48],m.stone,2);cyl(0,.28,1.2,m.paleStone,[side*1.8,13.6,-33],6);}for(let i=0;i<11;i++)cyl(0,.16,.7+rnd()*.5,m.paleStone,[-5+i,8.67,-28.2],6);
  const tiers=[],allNodes=[];for(let level=0;level<3;level++){
    const nodes=[];for(let i=0;i<16;i++){const a=i/16*TAU,r=level===0?40:level===1?46:52,x=Math.cos(a)*r,z=-20+Math.sin(a)*r*.77,y=[3.4,12.4,20.4][level]+Math.sin(a*3+level)*.5;nodes.push([x,y,z]);allNodes.push([x,y,z]);platform(x,y,z,5.2,5.2,level===0);if(i%3===0)lantern([x+2.1,y+1.3,z]);}
    for(let i=0;i<nodes.length;i++)timberBridge(c,nodes[i],nodes[(i+1)%nodes.length],3.0,true,.13);
    tiers.push(nodes);
  }
  const stairs=[];for(const[level,i,j]of[[0,1,2],[0,7,7],[0,12,13],[1,4,5],[1,10,10],[1,14,15]]){const a=tiers[level][i],b=tiers[level+1][j];stairs.push([a,b]);timberBridge(c,a,b,2.2,true,0);const dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),count=Math.ceil(Math.abs(b[1]-a[1])/.18),angle=Math.atan2(dx,dz);for(let k=0;k<count;k++){const q=V(...a).lerp(V(...b),(k+.5)/count),step=box(2.1,.18,length/count*.94,m.paleWood,q.toArray());step.rotation.y=angle;}}
  timberBridge(c,tiers[0][8],[-18,5.6,-20],3,true,0);timberBridge(c,tiers[0][0],[18,5.6,-20],3,true,0);timberBridge(c,tiers[1][12],[0,8.1,-31],2.6,true,0);timberBridge(c,tiers[0][4],[0,5.6,-6],3,true,0);
  let workshops=0;for(let level=0;level<3;level++)for(const i of[0,2,5,8,10,13]){
    const [x,y,z]=tiers[level][i],a=i/16*TAU,cx=x+Math.cos(a)*4,cz=z+Math.sin(a)*4,w=7.2+(i%3)*.6,d=6.2+(level%2);platform(cx,y,cz,w,d,level===0);timberBridge(c,[x,y,z],[cx,y,cz],2.2,true,0);workshops++;
    const shed=new THREE.Group();shed.position.set(cx,y+.08,cz);shed.rotation.y=-a;group.add(shed);shed.name=['Forge platform','Caged storage loft','Timber craft workshop'][level];
    for(const side of[-1,1])for(const zz of[-d*.33,d*.33])beam([side*w*.38,0,zz],[side*w*.38,3.4,zz],.12,m.darkWood,shed);box(w*.78,2.3,.18,m.darkWood,[0,1.3,-d*.34],shed);c.roof(w*.9,1.5,d*.85,3.4,level===1?m.iron:m.darkWood,shed);
    if(level===0){box(2.6,1,1.7,m.darkStone,[-1,.5,0],shed);box(2.8,.3,1.8,m.iron,[-1,1.1,0],shed);for(let k=0;k<6;k++)box(.4,.3,.42,m.copper,[-2+k*.42,1.42,0],shed);}
    else if(level===1){for(let k=0;k<8;k++)beam([-2+k*.52,0,1.2],[-2+k*.52,2.9,1.2],.035,m.iron,shed);for(const yy of[.15,2.9])box(4.3,.08,.1,m.iron,[0,yy,1.2],shed);box(2.6,.27,1.6,m.wood,[0,.22,0],shed);}
    else{box(3,.2,1.5,m.paleWood,[0,1,0],shed);for(const dx of[-1.1,1.1])for(const dz of[-.5,.5])box(.14,.95,.14,m.darkWood,[dx,.46,dz],shed);for(let k=0;k<5;k++)beam([-1.1+k*.55,1.2,0],[-1.1+k*.55,1.2,1],.08,m.darkWood,shed);}
  }
  // Hoists and hanging cargo make the vertical levels visually legible.
  for(const[level,i]of[[2,1],[2,6],[2,11],[1,3],[1,9]]){const[x,y,z]=tiers[level][i];beam([x,y,z],[x,y+4,z],.2,m.darkWood);beam([x,y+4,z],[x-3,y+3.8,z],.16,m.paleWood);beam([x-3,y+3.8,z],[x-3,1.2,z],.025,m.darkWood);box(1.5,1.3,1.5,m.wood,[x-3,1.85,z]);const wheel=c.mesh(new THREE.TorusGeometry(.54,.08,8,24),m.iron,[x-2.8,y+3.8,z]);wheel.rotation.y=Math.PI/2;}
  for(let i=0;i<32;i++){const x=(rnd()-.5)*66,z=-50+rnd()*81;if(Math.abs(x)<20&&z>-35&&z<-5)continue;rock([x,height(x,z)+.35,z],[.35+rnd()*1.1,.4+rnd()*1.6,.4+rnd()*1.2],i%3?m.stone:m.slate,2);if(i%3===0){cyl(.4,.49,1.1,m.darkWood,[x,height(x,z)+.55,z],12);for(const y of[.23,.88]){const ring=c.mesh(new THREE.TorusGeometry(.46,.025,6,16),m.iron,[x,height(x,z)+y,z]);ring.rotation.x=Math.PI/2;}}}
  c.fire([-18,.35,17],1.1);c.fire([27,.3,-3],.95);
  const west=[[-78,16,7],[-64,14,2],[-53,11.5,-2],tiers[1][8]],east=[tiers[0][0],[53,2.4,-13],[64,1.6,-4],[78,1,8]],deep=deepRoute;
  for(const route of[west,east,deep]){stonePassage(c,route,route===deep?2.3:3.8,route===deep?2.8:4.3);for(let i=1;i<route.length;i++)stoneStairs(c,route[i-1],route[i],route===deep?2.1:3.5);}
  const water=m.water.clone();water.color.set('#142b31');const lake=c.mesh(new THREE.CircleGeometry(11.7,96),water,[54,-14.15,-62]);lake.rotation.x=-Math.PI/2;lake.scale.set(1,.8,1);rock([56,-13.74,-63],[1.85,.7,1.35],m.darkStone,2);
  const lakeRock=m.darkStone.clone();lakeRock.side=THREE.DoubleSide;const lakeRoof=c.parametric((u,v)=>{const a=u*TAU,e=v*Math.PI/2,r=14*Math.cos(e);return[54+Math.cos(a)*r,-14+10*Math.sin(e),-62+Math.sin(a)*r*.87];},100,40,lakeRock);lakeRoof.userData.cutawayShell=true;
  for(let i=0;i<20;i++){const a=i/20*TAU;if(a>2.8&&a<4.0)continue;rock([54+Math.cos(a)*12.5,-12.4,-62+Math.sin(a)*11],[1.3,2.5,1.1],m.darkStone,2);}
  c.path([[18,height(18,-1)+.09,-1],[24,height(24,-19)+.09,-19],[30,.27,-43]],2.1,m.stone,group,170);
  const tours=[
    {title:'Wysokie zachodnie wejście',position:[-73,17.05,5.2],target:[-64,15.2,2],text:'Zachodnia droga zaczyna się wysoko przy ukrytym przejściu pod Wysoką Przełęczą. Stopnie schodzą do wielopoziomowej osady wewnątrz pasma.',cutaway:false},
    {title:'Dolna galeria warsztatów',position:[...tiers[0][7].map((v,i)=>i===1?v+1.7:v)],target:[-39,7,-20],text:'Szerokie dolne pomosty prowadzą do kuźni, warsztatów i składowisk. Wielka sala zajmuje środek sieci.',cutaway:false},
    {title:'Wielka sala goblinów',position:[0,7.3,-10],target:[0,11.3,-32],text:'Rozległy drewniany pokład mieści zgromadzenia i szerokie schody ku podestowi Wielkiego Goblina. Galerie obiegają halę z trzech wysokości.',cutaway:false},
    {title:'Podest Wielkiego Goblina',position:[4,9.8,-30],target:[0,11,-32],text:'Kamienny tron i wysoki podest dominują nad właściwą dużą halą, oddzieloną od głębokiego jeziora.',cutaway:false},
    {title:'Środkowe galerie i składy',position:[tiers[1][3][0],tiers[1][3][1]+1.7,tiers[1][3][2]],target:[0,8,-20],text:'Klatki, drewniane składy, liny i dźwigi zapełniają środkowe rusztowania. Poprzeczne mosty oraz stopnie łączą pierścienie.',cutaway:false},
    {title:'Najwyższa galeria rzemieślników',position:[tiers[2][10][0],tiers[2][10][1]+1.7,tiers[2][10][2]],target:[0,12,-20],text:'Najwyższe warsztaty zajmują duże platformy pod sklepieniem. Różne poziomy, szerokości i diagonalne połączenia tworzą czytelne dzielnice.',cutaway:false},
    {title:'Droga u podstawy rusztowań',position:[-24,height(-24,15)+1.7,15],target:[-18,1.2,17],text:'Pod galeriami widać podporowe słupy, ukośne belki, kamienne dno i palenisko, a ponad nimi całą pracującą osadę.',cutaway:false},
    {title:'Wschodni tunel ku Dzikim Krajom',position:[72,2.97,4],target:[64,3,-4],text:'Niższy wschodni wylot prowadzi z goblinich podziemi na drugą stronę pasma, w stronę Wilderlandu.',cutaway:false},
    {title:'Głębokie odgałęzienie',position:[41,-2.8,-46],target:[47,-7.8,-52],text:'Osobny wąski korytarz schodzi daleko poniżej zamieszkanych galerii. Dopiero na jego końcu znajduje się komora jeziora.',cutaway:false},
    {title:'Jezioro Golluma',position:[49,-11.9,-61],target:[56,-13.4,-63],text:'Ciemna woda i niewielka wyspa leżą w odrębnej głębokiej jaskini, ponad czternaście jednostek niżej od skalnego dna osady.',cutaway:false},
    {title:'Plan wielopoziomowej osady',position:[104,75,52],target:[0,9,-21],text:'Pełna sieć galerii, osiemnaście warsztatów, duża sala i odległe jezioro rozwijają książkowe relacje wejść oraz filmowe pomosty. Dokładny rzut pozostaje interpretacją.',cutaway:true},
  ];
  const result=finish([138,103,137],[0,10,-20],'#4b4a40','#555346',[-70,105,69],tours);result.planCutaway=true;result.cityBounds={min:[-79,-15,-82],max:[79,27,24]};result.settlement={buildings:workshops+1,workshops,districts:4,galleryLevels:3,platforms:allNodes.length+workshops+2,mainHall:[36,28],gollumLakeDepth:14.15,interpretation:true};return result;
}
function beorn() {
  const c = workshop(294103), { m, rnd, group, box, cyl, beam, tube, ground, rock, finish } = c;
  const riverX=z=>50+Math.sin(z*.05)*3;const height=(x,z)=>{const base=.11+.18*Math.sin(x*.23)*Math.cos(z*.31)+Math.max(0,Math.abs(x)-45)*.018;return lerp(-.12,base,clamp((Math.abs(x-riverX(z))-4)/3,0,1));};c.landscape(160,155,height,m.meadow,300,280);
  // A huge, high timber mead hall. The roof and near side are cut away to reveal
  // the central hearth, column aisle, benches and a provisioned domestic interior.
  const hall = new THREE.Group(); hall.position.set(-2, .18, -4); group.add(hall); box(9.5, .42, 16.2, m.paleStone, [0, .12, 0], hall);
  box(9.3, 5.1, .4, m.wood, [0, 2.8, -8], hall); box(.4, 4.7, 16, m.wood, [-4.55, 2.6, 0], hall);
  for (const z of [-7.6, -4.3, -.9, 2.6, 6.5]) for (const side of [-1, 1]) { const x = side * 3.3; cyl(.25, .34, 5.2, m.darkWood, [x, 3, z], 28, hall); cyl(.39, .42, .27, m.paleStone, [x, .63, z], 24, hall); cyl(.34, .3, .22, m.paleWood, [x, 5.35, z], 24, hall);
    for (let j = 0; j < 4; j++) { const yy = 1.4 + j * .77; tube([[x - .27, yy, z + .17], [x, yy + .2, z + .3], [x + .27, yy + .45, z + .17]], .024, m.paleWood, hall, 24, 6); }
    beam([x, 4.9, z], [0, 8.3, z], .17, m.paleWood, hall); beam([x, 4.2, z], [x * .45, 5.5, z], .12, m.darkWood, hall);
  }
  for (const z of [-7.6, -4.3, -.9, 2.6, 6.5]) { beam([-4.9, 5.35, z], [4.9, 5.35, z], .18, m.darkWood, hall); beam([-4.9, 5.35, z], [0, 8.55, z], .13, m.paleWood, hall); beam([0, 8.55, z], [4.9, 5.35, z], .13, m.paleWood, hall); }
  const roofShell=new THREE.Group();roofShell.userData.cutawayShell=true;hall.add(roofShell);c.roof(10.5,3.15,17.3,5.4,m.thatch,roofShell);box(.4,4.7,16,m.wood,[4.55,2.6,0],roofShell);
  box(1.5,.035,1.65,m.black,[0,8.6,0],roofShell);for(const x of [-.84,.84])box(.12,.18,1.8,m.paleWood,[x,8.66,0],roofShell);
  c.gable(9.2, 3.1, .35, m.wood, [0, 5.3, -8], hall); for (let i = 0; i < 8; i++) { const x = -4 + i * 1.13; beam([x, 5.35, -8.06], [x * .28, 7.75, -8.06], .065, m.paleWood, hall); }
  for(const side of [-1,1])box(3.2,4.65,.3,m.wood,[side*3.0,2.7,8.1],hall);for (const x of [-4.45, -2.2, 2.2, 4.45]) box(.24, 5.05, .42, m.wood, [x, 2.7, 8.1], hall); box(9.5, .3, .45, m.wood, [0, 5.35, 8.1], hall); c.gable(9.4, 2.8, .12, m.paleWood, [0, 5.53, 8.2], hall);
  // Open doors frame the entry; their leaves sit to the side of the opening.
  for (const side of [-1, 1]) { const door = box(1.13, 3.5, .16, m.darkWood, [side * 1.49, 2.33, 8.48], hall); door.rotation.y = side * .77; for (const y of [1, 3.5]) box(1.11, .09, .19, m.iron, [side * 1.49, y, 8.57], hall); }
  for (const side of [-1, 1]) for (const z of [-4.7, -.2, 4.1]) { box(1.1, .16, 3.4, m.wood, [side * 2.1, 1.3, z], hall); for (const zz of [-1.3, 1.3]) box(.14, 1, .85, m.darkWood, [side * 2.1, .83, z + zz], hall); box(.39, .14, 3.4, m.paleWood, [side * 2.85, .91, z], hall); }
  for (let i = 0; i < 12; i++) { cyl(.1, .11, .17, m.paleWood, [-4 + i % 6 * 1.5, 1.46, -5.1 + Math.floor(i / 6) * 4.9], 14, hall); }
  c.fire([-2, .77, -4], 1.35); box(1.9, .3, 3.1, m.paleStone, [-2, .52, -4]);
  beam([-3, 3.9, -4], [-1, 3.9, -4], .05, m.iron); tube([[-2, 3.9, -4], [-2, 2.8, -4]], .027, m.iron); cyl(.46, .33, .58, m.iron, [-2, 2.3, -4], 24);
  // Carved animal terminals above the roof ridge, in the mead-hall tradition.
  for (const z of [-12.3, 4.8]) { tube([[-2, 8.7, z], [-2, 9.02, z + .4], [-2, 9.42, z + .65]], .14, m.darkWood); rock([-2, 9.39, z + .65], [.2, .25, .39], m.darkWood, 1); }
  const barn = new THREE.Group(); barn.position.set(-23,height(-23,-21),-21); group.add(barn); box(4.5, 2.6, 5.5, m.wood, [0, 1.4, 0], barn); c.roof(5, 1.65, 6.1, 2.7, m.thatch, barn); c.gable(4.5, 1.6, .15, m.paleWood, [0, 2.7, 2.7], barn); box(1.8, 2.3, .1, m.darkWood, [0, 1.25, 2.81], barn); beam([-1, .15, 2.95], [1, 2.35, 2.95], .075, m.paleWood, barn); beam([1, .15, 2.95], [-1, 2.35, 2.95], .075, m.paleWood, barn);
  // Lower domestic wings enclose the approach courtyard described in the book.
  for (const x of [-7.8, 3.8]) { const wing = new THREE.Group(); wing.position.set(x, .18, 8.2); group.add(wing); box(3.2, 2.2, 7.4, m.wood, [0, 1.3, 0], wing); c.roof(3.6, 1.2, 7.9, 2.4, m.thatch, wing); c.gable(3.2, 1.1, .2, m.paleWood, [0, 2.4, 3.65], wing); for (const zz of [-2.5, 0, 2.5]) { box(3.25, .12, .14, m.darkWood, [0, .6, zz], wing); box(3.25, .12, .14, m.darkWood, [0, 2.1, zz], wing); } box(.8, 1.65, .1, m.darkWood, [0, 1.04, 3.8], wing); }
  const fence = (a, b) => { const d = V(...a).distanceTo(V(...b)), n = Math.ceil(d / 1.7); for (let i = 0; i <= n; i++) { const t = i / n, x = lerp(a[0], b[0], t), z = lerp(a[2], b[2], t), y = height(x, z); cyl(.045, .07, 1.2, m.paleWood, [x, y + .55, z], 8); if (i) for (const lift of [.35, .78]) beam([lerp(a[0], b[0], (i - 1) / n), y + lift, lerp(a[2], b[2], (i - 1) / n)], [x, y + lift, z], .045, m.wood); } };
  fence([-36,0,-31],[-12,0,-31]);fence([-12,0,-31],[-12,0,-9]);fence([-12,0,-9],[-36,0,-9]);
  for (let i = 0; i < 8; i++) { const x=-29+i*1.35,z=-18,h=height(x,z);box(.9,.15,.95,m.paleWood,[x,h+.12,z]);c.mesh(new THREE.LatheGeometry([[.49,.12],[.5,.4],[.41,.75],[.24,.98],[0,1.03]].map(p=>new THREE.Vector2(...p)),32),m.thatch,[x,h,z]);for(let j=0;j<5;j++){const ring=c.mesh(new THREE.TorusGeometry(.47-j*.04,.012,6,32),m.darkWood,[x,h+.2+j*.145,z]);ring.rotation.x=Math.PI/2;} }
  for (let i=0;i<7;i++){const z=-29+i*1.15;box(9.4,.2,.7,m.earth,[-24,height(-24,z),z]);for(let j=0;j<21;j++)c.ball(.15,i%2?m.fern:m.leaves,[-28.4+j*.41,height(-24,z)+.22,z],[1,.7,1],group,12);}
  c.path([[-2,.24,5],[-2,.2,10],[1,.14,24],[3,.14,44]],1.6);c.path([[-2,.2,4],[-14,.2,1],[-19,.21,-10],[-24,.23,-20]],1.1);c.scatter(height,14000,69,(x,z)=>Math.abs(x-riverX(z))>5&&!(x>-8&&x<4&&z>-13&&z<14),m.meadow);
  for(let i=0;i<17;i++){const a=1.8+i/16*3.8,x=Math.cos(a)*41,z=Math.sin(a)*44;c.ancientTree(x,height(x,z),z,.8+rnd()*.35);}
  // A dense thorn hedge and a northern gate enclose the house and its pasture.
  for(let i=0;i<258;i++){const a=i*TAU/258;if(a>.026&&a<.116)continue;const x=Math.sin(a)*41,z=Math.cos(a)*42,y=height(x,z);rock([x,y+.73,z],[.54,.92,.55],i%3?m.darkLeaves:m.leaves,1);for(let j=0;j<3;j++)beam([x,y+.3,z],[x+(rnd()-.5)*.6,y+1.45+rnd()*.2,z+(rnd()-.5)*.6],.014,m.darkWood);}
  for(const x of [1.36,4.54]){cyl(.12,.18,2.3,m.darkWood,[x,height(x,41.9)+1.08,41.9],16);c.lantern([x,height(x,41.9)+1.45,41.9]);}beam([1.36,2.39,41.9],[4.54,2.39,41.9],.12,m.paleWood);
  const northGate=new THREE.Group();northGate.position.set(1.41,height(1.41,41.9),41.9);northGate.rotation.y=-.91;group.add(northGate);for(const y of [.38,.97])box(3,.1,.12,m.wood,[1.5,y,0],northGate);for(let i=0;i<9;i++)box(.07,1.05,.07,m.paleWood,[.17+i*.33,.67,0],northGate);beam([0,.22,0],[3,1.12,0],.041,m.darkWood,northGate);
  const anduin=[];for(let i=0;i<=90;i++){const z=-74+i*148/90;anduin.push([riverX(z),.04,z]);}c.path(anduin,8,m.water,group,260);const carrockZ=20,carrockX=riverX(carrockZ);rock([carrockX,2.25,carrockZ],[2.2,2.8,2.35],m.stone,3);for(let i=0;i<12;i++){const a=i*TAU/12;rock([carrockX+Math.cos(a)*2.2,.2,carrockZ+Math.sin(a)*2.3],[.5,.4,.6],m.stone,1);}
  for(let i=0;i<36;i++){const x=-66+rnd()*9,z=-68+i*3.8;c.ancientTree(x,height(x,z),z,.85+rnd()*.35,true,group,true);}
  return orientLandscape(finish([62,36,75],[-1,3.4,-2],'#a9ad87','#bec3a1',[-52,65,46],[
    {title:'Północna brama zagrody',position:[3,1.91,44],target:[3,1.35,41.9],text:'Długa droga prowadzi przez pastwisko od północnej bramy ku odległemu domowi.'},
    {title:'Dziedziniec między skrzydłami',position:[-2,1.94,10],target:[-2,3.1,4.4],text:'Dwa niższe drewniane skrzydła flankują wejście do długiej głównej hali.'},
    {title:'Ogień w hali Beorna',position:[-.77,2.12,1.62],target:[-2,1.82,-4],text:'Pośrodku sali płonie ogień, nad nim wisi kocioł. Słupy i ławy wyznaczają podłużną nawę.',cutaway:false},
    {title:'Stół, zapasy i ławy',position:[-2.48,2.05,-8],target:[-4.1,1.56,-4.2],text:'Wnętrze łączy dawną halę biesiadną z codziennym gospodarstwem Beorna.',cutaway:false},
    {title:'Słomiane ule i ogród',position:[-25,1.95,-14.7],target:[-24,.81,-18],text:'Dzwonowate ule i warzywne grządki zajmują południową część przestronnego obejścia.'},
    {title:'Anduina i Carrock na zachodzie',position:[40,3.2,22],target:[carrockX,1.5,carrockZ],text:'Carrock wyrasta jako skalna wyspa z nurtu Anduiny. Na wschodzie rozciągają się pastwiska i odległa ściana lasu.'},
    {title:'Przekrój drewnianej hali',position:[17,15,18],target:[-2,3,-4],text:'Otwarty dach pozwala obejrzeć więźbę, palenisko i ustawienie ław.',cutaway:true},
  ]),Math.PI);
}

function lakeHouse(c, x, y, z, w, d, height, angle = 0, color = c.m.wood, grand = false,roofMaterial=c.m.roof) {
  const { m, box, beam, window } = c; const h = new THREE.Group(); h.position.set(x, y, z); h.rotation.y = angle; c.group.add(h);
  if(grand){
    box(w,.14,d,m.paleWood,[0,.06,0],h);for(const side of [-1,1])box(.18,height,d,color,[side*w/2,height/2,0],h);box(w,height,.18,color,[0,height/2,-d/2],h);for(const side of [-1,1])box((w-1.5)/2,height,.18,color,[side*(w+1.5)/4,height/2,d/2],h);box(1.5,height-2.4,.18,color,[0,(height+2.4)/2,d/2],h);
    const top=new THREE.Group();top.userData.cutawayShell=true;h.add(top);c.gable(w,w*.61,d,color,[0,height,-d/2],top);c.roof(w+.46,w*.65,d+.54,height,m.redWood,top);
  }else{box(w,height,d,color,[0,height/2,0],h);c.gable(w,w*.61,d,color,[0,height,-d/2],h);c.roof(w+.46,w*.65,d+.54,height,roofMaterial,h);}
  for(const xx of [-w/2,0,w/2]){if(grand&&xx===0){box(.12,height-2.4,.2,m.darkWood,[xx,(height+2.4)/2,d/2],h);box(.12,height+.04,.2,m.darkWood,[xx,height/2,-d/2],h);}else box(.12,height+.04,d+.06,m.darkWood,[xx,height/2,0],h);}for(const yy of [.12,height*.48,height]){if(grand)for(const side of [-1,1])box(w+.1,.12,.2,m.paleWood,[0,yy,side*d/2],h);else box(w+.1,.12,d+.11,m.paleWood,[0,yy,0],h);}
  for (const side of [-1, 1]) beam([side * w / 2, height, d / 2 + .08], [0, height + w * .61, d / 2 + .08], .075, m.paleWood, h);
  if (height > 3) for (const xx of [-w * .34, w * .34]) window(xx, height * .74, d / 2 + .08, w * .2, .8, h);
  if(!grand)box(.75,1.75,.08,m.darkWood,[0,.89,d/2+.08],h);else for(const side of [-1,1]){const leaf=box(.72,2.25,.12,m.darkWood,[side*.88,1.2,d/2+.49],h);leaf.rotation.y=side*.95;}for (const side of [-1, 1]) window(side * w * .29, 1.43, d / 2 + .08, w * .21, .73, h);
  for (const side of [-1, 1]) { beam([side * w / 2, .3, d / 2 + .08], [side * w * .16, height * .48, d / 2 + .08], .055, m.darkWood, h); beam([side * w / 2, height * .5, d / 2 + .08], [side * w * .13, height, d / 2 + .08], .055, m.darkWood, h); }
  return h;
}
function boat(c, x, y, z, angle = 0, size = 1) {
  const b = new THREE.Group(); b.position.set(x, y, z); b.rotation.y = angle; b.scale.setScalar(size); c.group.add(b); c.m.wood.side = THREE.DoubleSide;
  c.parametric((u, v) => { const a = u * Math.PI, t = v * 2 - 1, width = Math.sqrt(Math.max(0, 1 - t * t)) * .65; return [Math.cos(a) * width, .35 - Math.sin(a) * width * .64 + Math.abs(t) ** 3 * .12, t * 1.75]; }, 28, 42, c.m.wood, b);
  for (const zz of [-.8, 0, .8]) c.box(1.12, .06, .25, c.m.paleWood, [0, .28, zz], b); for (const s of [-1, 1]) c.tube([[0, .47, -1.75], [s * .63, .36, -.4], [s * .63, .36, .4], [0, .47, 1.75]], .045, c.m.darkWood, b, 40, 7); return b;
}
function laketown() {
  const c=workshop(294104),{m,rnd,group,box,cyl,beam,finish}=c,deckY=2.2;
  // Tolkien gives a quadrilateral piled town, a market pool and a boat channel;
  // parcel sizes and this irregular network of streets are an interpretation.
  const lake=c.landscape(240,390,(x,z)=>.045+.025*Math.sin(x*2.7+z*1.3),m.water,220,280);lake.position.z=-77;
  if(m.water.map)c.animators.push(t=>{m.water.map.offset.set(t*.004,t*.002);});
  const shape=new THREE.Shape(),pool=[4,8],radius=10,angle=Math.acos(.45),mouthZ=8+Math.sqrt(100-4.5**2);
  shape.moveTo(-47.5,-58.5);shape.lineTo(43,-58.5);shape.lineTo(47.5,-50);shape.lineTo(47.5,58.5);shape.lineTo(8.5,58.5);shape.lineTo(8.5,mouthZ);shape.absarc(pool[0],pool[1],radius,angle,Math.PI-angle,true);shape.lineTo(-.5,58.5);shape.lineTo(-43,58.5);shape.lineTo(-47.5,51);shape.closePath();
  const dg=new THREE.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:false});dg.rotateX(Math.PI/2);const deck=c.mesh(dg,m.wood,[0,deckY,0]);deck.name='Continuous 95 × 117 piled town deck, open market basin and southern boat channel';
  const onDeck=(x,z)=>Math.abs(x)<47.3&&Math.abs(z)<58.3&&Math.hypot(x-4,z-8)>10.1&&!(z>mouthZ&&x>-.5&&x<8.5);
  const pilePoints=[];for(let x=-46;x<=46;x+=3.3)for(let z=-57;z<=57;z+=3.3)if(onDeck(x,z))pilePoints.push([x,z]);
  const piles=new THREE.InstancedMesh(new THREE.CylinderGeometry(.13,.2,3.6,10),m.darkWood,pilePoints.length),dummy=new THREE.Object3D();
  pilePoints.forEach(([x,z],i)=>{dummy.position.set(x,.36,z);dummy.updateMatrix();piles.setMatrixAt(i,dummy.matrix);});piles.name='Individually supported timber piles beneath the entire town';piles.castShadow=piles.receiveShadow=true;group.add(piles);
  // Batched joists and visible joints give the deck the grain of a real wharf.
  for(let x=-45;x<46;x+=6.6){for(const[a,b]of[[-58,-3],[20,58]])if(!(x>-.5&&x<8.5&&b>mouthZ))box(.22,.28,b-a,m.darkWood,[x,deckY-.37,(a+b)/2]);}
  for(let z=-57;z<58;z+=1.1){let run=null;for(let x=-47;x<48;x+=.5){const valid=onDeck(x,z);if(valid&&run===null)run=x;if(run!==null&&(!valid||x>47)){box(x-run,.013,.024,m.darkWood,[(x+run)/2,deckY+.008,z]);run=null;}}}
  const westStreet=z=>-21+Math.sin(z*.06)*2.7,eastStreet=z=>27+Math.sin(z*.1)*2.1,northStreet=x=>-35+Math.sin(x*.08)*2.3,southStreet=x=>34+Math.sin(x*.09)*2;
  const occupied=[],houses=[],goal=144;
  const streetClear=(x,z,rx,rz)=>!(Math.abs(z+6)<3+rz||Math.abs(x-westStreet(z))<2.2+rx||Math.abs(x-eastStreet(z))<1.8+rx||Math.abs(z-northStreet(x))<1.7+rz||Math.abs(z-southStreet(x))<1.65+rz||Math.hypot(x-4,z-8)<16+Math.max(rx,rz)||(x>-8-rx&&x<16+rx&&z>-29-rz&&z<-10+rz)||(z>15&&x>-.5-rx&&x<8.5+rx));
  for(let i=0;i<80000&&houses.length<goal;i++){
    const x=-43+rnd()*86,z=-54+rnd()*108,tight=i>3500,w=(tight?2.8:3.4)+rnd()*(tight?1.2:1.8),d=(tight?3.2:3.8)+rnd()*(tight?1.25:1.9),h=3.2+rnd()*3.0;
    const face=(Math.abs(x-westStreet(z))<Math.abs(z-northStreet(x))?Math.PI/2:0)*(x>0?-1:1),a=face+(rnd()-.5)*.1,rx=(Math.abs(Math.cos(a))*w+Math.abs(Math.sin(a))*d)/2+.3,rz=(Math.abs(Math.sin(a))*w+Math.abs(Math.cos(a))*d)/2+.3;
    if(!onDeck(x,z)||Math.abs(x)+rx>46||Math.abs(z)+rz>57||!streetClear(x,z,rx,rz)||occupied.some(p=>Math.abs(p[0]-x)<p[2]+rx&&Math.abs(p[1]-z)<p[3]+rz))continue;
    occupied.push([x,z,rx,rz]);houses.push([x,z,w,d,h,a]);
  }
  const roofColors=['#70878a','#938b7d','#96796f','#80958b','#76868b'].map(color=>{const material=m.roof.clone();material.color.set(color);return material;});
  houses.forEach(([x,z,w,d,h,a],i)=>{
    const home=lakeHouse(c,x,deckY+.09,z,w,d,h,a,i%5===0?m.redWood:i%4===0?m.paleWood:m.wood,false,roofColors[i%5]);home.name=['Fisherfolk house','Merchant gabled house','Workshop dwelling','Timber warehouse','Lake-town lodging'][i%5];
    if(i%7===0){box(.62,1.65,.66,m.darkStone,[w*.25,h+w*.35,-d*.17],home);box(.83,.14,.84,m.paleStone,[w*.25,h+w*.35+.84,-d*.17],home);}
    if(i%4===0){box(w*.68,.13,1.25,m.paleWood,[0,h*.54,d/2+.61],home);for(const side of[-1,1])beam([side*w*.3,h*.54,d/2+1.18],[side*w*.3,h*.54+.9,d/2+1.18],.035,m.darkWood,home);beam([-w*.3,h*.54+.9,d/2+1.18],[w*.3,h*.54+.9,d/2+1.18],.036,m.paleWood,home);}
    if(i%9===0){const awning=new THREE.Group();awning.position.set(w*.57,0,0);home.add(awning);box(w*.35,2.1,d*.65,m.darkWood,[0,1.05,0],awning);c.roof(w*.46,.9,d*.75,2.1,m.thatch,awning);}
    if(i%6===0)c.lantern([x+rxFor(a,w,d),deckY+1.5,z+d*.5+.8]);
  });
  function rxFor(a,w,d){return Math.min(2.7,(Math.abs(Math.cos(a))*w+Math.abs(Math.sin(a))*d)/2+.2);}
  // The largest house stands immediately north of the common market, with an
  // open council interior and stairs to an actual rear gallery.
  const hall=lakeHouse(c,4,deckY+.09,-19,14,15,8.1,0,m.redWood,true);hall.name='Largest Great House of the Master beside the market';
  for(const side of[-1,1])for(const z of[-5,-1,3]){cyl(.19,.27,7.9,m.darkWood,[side*4.8,3.95,z],18,hall);beam([side*4.8,7.6,z],[side*3.4,8.9,z],.12,m.paleWood,hall);}
  box(4.8,.17,2,m.paleWood,[0,1,-.5],hall);for(const x of[-1.95,1.95])for(const z of[-1.25,.25])box(.16,.93,.16,m.darkWood,[x,.48,z],hall);for(const side of[-1,1])box(5,.14,.42,m.wood,[0,.59,-.5+side*1.4],hall);
  box(12.8,.22,2.6,m.wood,[0,4.25,-5.8],hall);for(let i=0;i<19;i++)box(1.6,.15,.43,m.paleWood,[-5.75,.16+i*.222,2.4-i*.43],hall);
  for(let x=-6.2;x<6.3;x+=.4)box(.055,.92,.055,m.paleWood,[x,4.82,-4.48],hall);beam([-6.3,5.28,-4.48],[6.3,5.28,-4.48],.05,m.darkWood,hall);
  for(const side of[-1,1])c.lantern([side*6.3,3.2,3],hall,true);const belfry=new THREE.Group();belfry.position.set(0,0,-3);hall.add(belfry);box(3,3,3,m.wood,[0,13.35,0],belfry);c.roof(3.8,2.1,3.8,14.85,m.roof,belfry);cyl(.21,.1,.55,m.copper,[0,13.8,0],20,belfry);
  for(let i=0;i<28;i++){const a=i/28*TAU,x=4+Math.cos(a)*10.7,z=8+Math.sin(a)*10.7;if(z>mouthZ-.7&&x>-.7&&x<8.7)continue;cyl(.11,.14,2.9,m.darkWood,[x,.75,z],10);if(i%4===0)c.lantern([x,deckY+1.25,z]);}
  for(let i=0;i<12;i++){const a=Math.PI*.92+i/11*Math.PI*1.12,x=4+Math.cos(a)*14,z=8+Math.sin(a)*14;if(z<-5)continue;box(2.4,.2,1.2,m.paleWood,[x,deckY+.86,z]);for(const dx of[-1,1])for(const dz of[-.44,.44])beam([x+dx,deckY,z+dz],[x+dx,deckY+2.4,z+dz],.055,m.darkWood);const roof=new THREE.Group();roof.position.set(x,deckY+2.4,z);group.add(roof);c.roof(2.9,.8,1.8,0,i%2?m.thatch:m.redWood,roof);for(let j=0;j<5;j++)box(.29,.22,.31,j%2?m.copper:m.paleWood,[x-.85+j*.42,deckY+1.11,z]);}
  for(const z of[31,49]){timberBridge(c,[-5,deckY,z],[0,4.9,z],2.2,true,0);timberBridge(c,[0,4.9,z],[8,4.9,z],2.2,true,0);timberBridge(c,[8,4.9,z],[13,deckY,z],2.2,true,0);}
  // Peripheral slips, cranes and boats are connected to both street and water.
  for(const side of[-1,1])for(const z of[-49,-22,5,27,48]){box(6,.22,3,m.wood,[side*50,deckY,z]);for(const x of[side*49,side*52])cyl(.16,.2,3.6,m.darkWood,[x,.36,z],10);boat(c,side*54,.12,z,0,1.2);beam([side*49.2,deckY,z],[side*49.2,deckY+4,z],.18,m.darkWood);beam([side*49.2,deckY+4,z],[side*53,deckY+3.6,z],.12,m.paleWood);beam([side*53,deckY+3.6,z],[side*53,.65,z],.014,m.darkWood);}
  for(const[x,z,a]of[[4,9,.2],[4,23,0],[4,42,0],[-57,-33,.6],[60,40,-.4],[14,66,.2]])boat(c,x,.12,z,a,1.1);
  const shoreX=z=>-78+Math.sin(z*.035)*3,shoreHeight=(x,z)=>.14+3.5*clamp((shoreX(z)-x)/27,0,1)**1.4;m.meadow.side=THREE.DoubleSide;
  c.parametric((u,v)=>{const z=-155+v*250,x=lerp(-113,shoreX(z),u);return[x,shoreHeight(x,z),z];},70,170,m.meadow);
  timberBridge(c,[-92,deckY,-6],[-47.5,deckY,-6],3.2,true,0);
  const gate=new THREE.Group();gate.position.set(-47.5,deckY,-6);gate.rotation.y=-Math.PI/2;group.add(gate);for(const side of[-1,1]){box(.7,4.4,1,m.redWood,[side*2.1,2.2,0],gate);const cap=new THREE.Group();cap.position.set(side*2.1,0,0);gate.add(cap);c.roof(1.8,1.1,1.8,4.4,m.roof,cap);}box(5.2,.32,.8,m.paleWood,[0,4.3,0],gate);
  lakeHouse(c,-95,shoreHeight(-95,-12),-12,6,7,4.1,0,m.darkWood);for(let i=0;i<16;i++)cyl(.36,.4,.9,m.wood,[-96+i%4*.95,shoreHeight(-96+i%4*.95,-3)+.45,-3+Math.floor(i/4)*1.02],16);
  c.path([[-110,shoreHeight(-110,-6)+.07,-6],[-99,shoreHeight(-99,-6)+.07,-6],[-92,deckY,-6]],3,m.earth);
  for(let i=0;i<45;i++){const x=-109+rnd()*19,z=-100+rnd()*173;c.pine(x,shoreHeight(x,z),z,.9+rnd());}c.rock([-76,1.9,-67],[8,3.6,16],m.stone,3);
  const distant=m.slate.clone();distant.color.set('#788d95');c.parametric((u,v)=>{const a=u*TAU,r=v*38;return[8+Math.sin(a)*r,2+51*(1-v)**1.75*(1+.06*Math.sin(a*7)),-218+Math.cos(a)*r];},80,60,distant);
  const tours=[
    {title:'Długi most i brama miasta',position:[-87,deckY+1.65,-6],target:[-47.5,5.4,-6],text:'Strażnica pozostaje na lądzie. Długi most prowadzi przez spokojną zachodnią zatokę do bramy i głównej ulicy miasta na palach.'},
    {title:'Trakt od bramy do rynku',position:[-27,deckY+1.65,-6],target:[4,6,-11],text:'Szeroki trakt dochodzi do rynku. Wspólne pokłady pod domami tworzą zwarte miasto z ulicami i placami.'},
    {title:'Okrągły basen rynku',position:[-8,deckY+1.65,8],target:[4,.5,8],text:'Rynek otacza okrągły basen. Jego południowy kanał pozostaje wodą aż do otwartego jeziora.'},
    {title:'Wnętrze największej sali Zarządcy',position:[5.5,deckY+1.74,-14.5],target:[4,deckY+2.2,-21],text:'Największy dom stoi przy rynku. W środku są kolumny, stół rady, ławy i schody do tylnej galerii.',cutaway:false},
    {title:'Galeria wielkiego domu',position:[6.1,deckY+5.95,-25],target:[4,deckY+2.2,-17],text:'Rzeczywisty górny pokład daje widok na wnętrze rady oraz wejście od strony rynku.',cutaway:false},
    {title:'Północne kwartały rzemieślników',position:[westStreet(-43),deckY+1.65,-43],target:[-4,6,-48],text:'Wąskie gable, warsztaty, boczne przybudówki i domy o różnej wysokości otaczają kręte ulice. Dokładne parcele są interpretacją.'},
    {title:'Wschodnie nabrzeże kupców',position:[eastStreet(25),deckY+1.65,25],target:[49,5,27],text:'Ulice wschodnich kwartałów prowadzą do żurawi, przystani i łodzi przy zewnętrznych nabrzeżach.'},
    {title:'Wysoki most nad kanałem',position:[4,6.55,31],target:[4,.7,52],text:'Przejście dla pieszych biegnie wysoko nad drogą łodzi. Pod środkowym przęsłem pozostaje ponad cztery jednostki wolnej wysokości.'},
    {title:'Woda od rynku do jeziora',position:[4,1.25,57],target:[4,.6,8],text:'Otwarty południowy kanał łączy basen rynku z Długim Jeziorem. Pale pod wspólnym pokładem podtrzymują odrębny system ulic.'},
    {title:'Północne nabrzeże i odległa Góra',position:[0,deckY+1.65,-57],target:[8,24,-218],text:'Erebor leży daleko na północy, poza rozległą wodą; nie stoi przy końcu miejskiego mostu.'},
    {title:'Zachodnia zatoka i skalny cypel',position:[-101,shoreHeight(-101,-57)+1.7,-57],target:[-54,5,0],text:'Skalny cypel osłania zatokę. Szeroki widok pokazuje miasto oddzielone od brzegu oraz jego gęste, połączone kwartały.'},
  ];
  const result=finish([126,91,147],[0,5,0],'#a4b8b6','#b0c1bb',[-75,110,65],tours);result.cityBounds={min:[-53,-1.5,-58.5],max:[53,20,58.5]};result.settlement={buildings:houses.length+2,dwellings:houses.length,districts:6,deck:[95,117],pileCount:pilePoints.length,interpretation:true};return result;
}
function dwarfStatue(c, x, y, z, s = 1, parent = c.group) {
  const { m, box, rock, cyl, beam } = c; const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
  box(1.5, .45, 1.1, m.paleStone, [0, .22, 0], g); for (const side of [-1, 1]) { box(.53, 1.05, .61, m.stone, [side * .36, .92, 0], g); box(.58, .29, .85, m.stone, [side * .36, .49, .12], g); box(.57, 1.16, .6, m.stone, [side * .83, 2.58, 0], g); }
  box(1.34, 1.48, .73, m.paleStone, [0, 2.08, 0], g); box(1.6, .38, .85, m.stone, [0, 2.95, 0], g); box(.6, .72, .68, m.paleStone, [0, 3.48, .04], g); box(.85, .33, .83, m.stone, [0, 3.88, .01], g); c.gable(.85, .34, .77, m.stone, [0, 4.04, -.37], g);
  // Dwarven beards and armour are geometric, chiselled stone reliefs.
  for (let i = -3; i <= 3; i++) { const length = .8 - Math.abs(i) * .08; const b = box(.095, length, .13, m.stone, [i * .092, 2.94, .49], g); b.rotation.z = -i * .035; }
  for (const side of [-1, 1]) box(.17, .075, .1, m.darkStone, [side * .16, 3.57, .4], g); box(.11, .24, .16, m.stone, [0, 3.47, .42], g);
  beam([.8, .64, .57], [.8, 3.31, .57], .063, m.darkStone, g); box(.75, .59, .1, m.paleStone, [1.12, 3.1, .57], g); c.gable(.72, .32, .12, m.stone, [1.08, 3.33, .51], g); for (let j = 0; j < 4; j++) box(.88, .055, .79, m.stone, [0, 1.65 + j * .28, 0], g); return g;
}
function erebor() {
  const c=workshop(294105),{m,rnd,group,box,rock,beam,finish}=c;
  // A whole kingdom is excavated below the six-spurred massif. The book gives
  // the near-gate Chamber of Thrór, the lowest Hall of Thráin and secret route;
  // the surrounding civic, domestic and working halls are a spatial reading.
  const specs=[
    ['Great Chamber of Thrór',[0,2,-18],26,40,12,'council'],
    ['Lowest Great Hall of Thráin',[0,-11,-75],38,36,16,'treasure'],
    ['Western dwelling court',[-38,2,-20],24,24,8,'home'],
    ['Eastern banquet court',[38,2,-20],24,24,10,'feast'],
    ['Great western smithies',[-38,-3,-49],24,24,11,'work'],
    ['Eastern armoury',[38,-2,-49],24,24,9,'arms'],
    ['Western working gallery',[-38,-6,-80],24,30,10,'work'],
    ['Eastern residential gallery',[38,-7,-80],24,30,8,'home'],
    ['Deep western records',[-38,-8,-113],24,24,8,'archive'],
    ['Deep eastern stores',[38,-8,-113],24,24,8,'work'],
    ['Northern counting hall',[0,-11,-115],28,24,10,'council'],
    ['Far western forge',[-68,-4,-49],20,24,9,'work'],
    ['Far eastern armour gallery',[68,-3,-49],20,24,8,'arms'],
  ];
  const routes=[],link=(a,b,w=4.8,h=5.4)=>{routes.push(connectRooms(c,a,b,w,h));};
  link([0,2,2],[0,2,6],7,9);link([0,2,-38],[0,-11,-57],7.4,8.2);
  for(const side of[-1,1]){
    link([side*13,2,-18],[side*26,2,-20]);
    link([side*38,2,-32],[side*38,side<0?-3:-2,-37]);
    link([side*38,side<0?-3:-2,-61],[side*38,side<0?-6:-7,-65]);
    link([side*19,-11,-75],[side*26,side<0?-6:-7,-80]);
    link([side*38,side<0?-6:-7,-95],[side*38,-8,-101]);
    link([side*14,-11,-115],[side*26,-8,-113]);
    link([side*50,side<0?-3:-2,-49],[side*58,side<0?-4:-3,-49]);
  }
  link([0,-11,-93],[0,-11,-103],6,6.8);
  const secret=[[-18.4,-11,-75],[-26,-8,-86],[-49,-3,-99],[-67,3,-93],[-78,5,-83]];for(let i=1;i<secret.length;i++)link(secret[i-1],secret[i],1.25,2.1);
  const spurs=[-.52,.5,1.72,2.82,3.88,4.9],baseHeight=(x,z)=>{
    let y=.1+.12*Math.sin(x*.2)*Math.cos(z*.23);
    for(const a of spurs){const dx=Math.sin(a),dz=Math.cos(a),long=Math.abs(a)<.6?124:94,t=clamp(((x*dx+(z+48)*dz)-26)/(long-26),0,1),d=Math.hypot(x-dx*(26+t*(long-26)),z+48-dz*(26+t*(long-26)));y=Math.max(y,30*(1-t)**.78*Math.max(0,1-d/(21-t*10))**1.35);}
    return y;
  };
  const height=(x,z)=>{
    let y=baseHeight(x,z);for(const[,at,w,d]of specs)if(Math.abs(x-at[0])<w/2+.7&&Math.abs(z-at[2])<d/2+.7)y=Math.min(y,at[1]-.65);
    for(const route of routes){const a=route[0],b=route[1],vx=b[0]-a[0],vz=b[2]-a[2],t=clamp(((x-a[0])*vx+(z-a[2])*vz)/(vx*vx+vz*vz),0,1);if(Math.hypot(x-a[0]-t*vx,z-a[2]-t*vz)<4.1)y=Math.min(y,lerp(a[1],b[1],t)-.5);}
    const river=4.6*clamp((z-6)/28,0,1)+Math.sin(z*.11)*.6;if(z>5)y=lerp(.015,y,clamp((Math.abs(x-river)-1.8)/1.2,0,1));return y;
  };
  c.landscape(230,265,height,m.darkStone,290,310);
  const mountainShell=new THREE.Group();mountainShell.name='Removable six-spurred rock above the complete underground kingdom';mountainShell.userData.cutawayShell=true;group.add(mountainShell);
  const mountain=c.parametric((u,v)=>{const a=u*TAU,y=v*83,r=79*(1-v)**.83,f=1+.072*Math.cos(a*6)+.04*Math.sin(a*23-v*18);return[Math.sin(a)*r*f,y+Math.sin(a*13)*.6*(1-v),-51+Math.cos(a)*r*f*.79];},200,120,m.slate,mountainShell),mp=mountain.geometry.attributes.position,index=[];
  for(let i=0;i<mountain.geometry.index.count;i+=3){const ids=[0,1,2].map(j=>mountain.geometry.index.getX(i+j)),x=ids.reduce((s,j)=>s+mp.getX(j),0)/3,y=ids.reduce((s,j)=>s+mp.getY(j),0)/3,z=ids.reduce((s,j)=>s+mp.getZ(j),0)/3;if(!(Math.abs(x)<5.5&&y<15&&z>-8))index.push(...ids);}mountain.geometry.setIndex(index);mountain.geometry.computeVertexNormals();completeNormals(mountain.geometry);
  const halls=specs.map(([name,at,w,d,h,kind],i)=>{const hall=carvedHall(c,name,at,w,d,h,'dwarf',{doorWidth:i<2?7.4:4.8,doorHeight:i===0?9:6.8,light:i===0||i===1||i===4});furniture(c,hall,kind,w,d);return hall;});
  // The treasury is the largest and lowest room. Its walking axis is kept free
  // between separate hoard banks instead of burying the visitor inside a pile.
  const treasury=halls[1],hoard=(x,z)=>.12+4.3*Math.exp(-((Math.abs(x)-10)**2+(z+8)**2)/33)+2.4*Math.exp(-((Math.abs(x)-11)**2+(z-8)**2)/29);m.gold.side=THREE.DoubleSide;
  for(const side of[-1,1])c.parametric((u,v)=>{const x=side*lerp(3.9,17.4,u),z=lerp(-16,16,v);return[x,hoard(x,z),z];},70,70,m.gold,treasury);
  const coins=new THREE.InstancedMesh(new THREE.CylinderGeometry(.069,.069,.026,10),m.gold,4400),dummy=new THREE.Object3D();for(let i=0;i<coins.count;i++){const x=(i%2?-1:1)*(4+rnd()*13.3),z=-15.8+rnd()*31.6;dummy.position.set(x,hoard(x,z)+.04,z);dummy.rotation.set((rnd()-.5)*.48,rnd()*TAU,(rnd()-.5)*.5);dummy.scale.setScalar(.8+rnd()*1.2);dummy.updateMatrix();coins.setMatrixAt(i,dummy.matrix);}coins.castShadow=coins.receiveShadow=true;coins.name='Thousands of coins on banks beside the treasury aisle';treasury.add(coins);
  for(let i=0;i<38;i++){const x=(i%2?-1:1)*(6+rnd()*9),z=-14+rnd()*28,y=hoard(x,z)+.2;if(i%3)box(.8,.24,.37,m.gold,[x,y,z],treasury);else c.mesh(new THREE.LatheGeometry([[0,0],[.19,0],[.34,.28],[.38,.7],[.22,1.1],[.31,1.2]].map(p=>new THREE.Vector2(...p)),18),m.gold,[x,y,z],undefined,treasury);}
  for(const i of[4,11]){const at=specs[i][1];for(const side of[-1,1]){box(3.5,2.5,2.6,m.darkStone,[at[0]+side*7,at[1]+1.25,at[2]-7]);c.fire([at[0]+side*7,at[1]+.25,at[2]-5.3],.8);}}
  let gateAngle=0;const leaves=[];for(const side of[-1,1]){box(1.6,11,2.6,m.paleStone,[side*4.7,7.3,6]);beam([side*5.5,12.8,6.8],[0,16,6.8],.6,m.paleStone);dwarfStatue(c,side*8.1,.3,8.4,2.2);const hinge=new THREE.Group();hinge.position.set(side*3.55,2,6.6);group.add(hinge);box(3.55,9.5,.36,m.darkStone,[-side*1.775,4.75,0],hinge);for(const y of[.7,3,5.3,7.6,9])box(3.3,.12,.43,m.gold,[-side*1.775,y,.1],hinge);for(const y of[2,4.4,6.8]){const diamond=box(.8,.8,.12,m.stone,[-side*1.775,y,.29],hinge);diamond.rotation.z=Math.PI/4;}hinge.traverse(o=>{if(o.isMesh)o.userData.dynamic=true;});leaves.push({hinge,side});}
  c.animators.push((t,dt=1/60)=>leaves.forEach(({hinge,side})=>{hinge.rotation.y=lerp(hinge.rotation.y,side*gateAngle,1-Math.pow(1-.075,dt*60));}));
  for(let i=0;i<18;i++)box(8.2,.18,.56,m.paleStone,[0,2-(i+.5)*.105,7+i*.54]);
  const back=new THREE.Group();back.position.set(...secret.at(-1));back.rotation.y=.6;group.add(back);for(const side of[-1,1])box(.22,2.2,.34,m.slate,[side*.78,1.1,0],back);box(1.8,.22,.34,m.slate,[0,2.2,0],back);box(1.3,1.9,.13,m.darkStone,[0,.95,0],back);box(.04,.04,.1,m.gold,[.2,1.04,.12],back);
  const running=[],approach=[];for(let i=0;i<=130;i++){const z=6+i*.9,x=4.6*clamp((z-6)/28,0,1)+Math.sin(z*.11)*.6;running.push([x,.11,z]);if(z>17)approach.push([-2+Math.sin(z*.06),height(-2+Math.sin(z*.06),z)+.09,z]);}c.path(running,3.4,m.water,group,250);c.path(approach,3.5,m.paleStone,group,220);
  for(let i=0;i<18;i++){const x=(i%2?-1:1)*(9+rnd()*14),z=33+Math.floor(i/2)*6.4,y=height(x,z);box(5.3,.2,5.8,m.stone,[x,y+.1,z]);box(5.3,1.4,.35,m.stone,[x,y+.7,z-2.7]);for(let j=0;j<6;j++)rock([x+(rnd()-.5)*4.7,y+.2,z+(rnd()-.5)*4.5],[.3+rnd()*.5,.4+rnd()*.5,.4],m.stone,1);}
  const ravenX=-47,ravenZ=55,ravenY=height(ravenX,ravenZ);rock([ravenX,ravenY-.2,ravenZ],[4.6,1.5,4.3],m.slate,2);for(const side of[-1,1])box(.4,2.4,5,m.stone,[ravenX+side*2.2,ravenY+1.1,ravenZ]);box(4.8,1.5,.4,m.darkStone,[ravenX,ravenY+.75,ravenZ-2.2]);
  for(let i=0;i<56;i++){const x=(rnd()-.5)*180,z=18+rnd()*95;if(Math.abs(x)>20)rock([x,height(x,z)+.3,z],[.5+rnd()*1.6,.5+rnd()*1.7,.5+rnd()],m.slate,2);}
  const tours=[
    {title:'Dolina Przedniej Bramy',position:[-1,2.0,23],target:[0,9,6],text:'Południowa dolina między ramionami Góry prowadzi do Przedniej Bramy. Rzeka płynie stąd ku osobnemu Dale i Długiemu Jezioru.'},
    {title:'Komnata Thróra przy Bramie',position:[0,3.72,-1],target:[0,7,-31],text:'Wysoka komnata rady i uczt znajduje się tuż za wejściem. Jej reprezentacyjna oś prowadzi ku szerokim schodom.',cutaway:false},
    {title:'Wielkie schody w głąb Góry',position:[0,-1.68,-46],target:[0,-7,-57],text:'Szerokie kamienne stopnie schodzą z wyższej komnaty do największej i najniższej Sali Thráina.',cutaway:false},
    {title:'Najniższa Sala Thráina',position:[0,-9.3,-62],target:[10,-6.5,-84],text:'Potężna sala skarbca ma wolną środkową aleję, dwa wielkie brzegi złota i galerie biegnące między filarami.',cutaway:false},
    {title:'Zachodni dziedziniec mieszkalny',position:[-38,3.7,-14],target:[-44,4,-25],text:'Krasnoludzkie królestwo obejmuje osobne komory mieszkalne i wspólne dziedzińce, połączone z salą przy wejściu.',cutaway:false},
    {title:'Wielkie kuźnie zachodnie',position:[-38,-1.3,-44],target:[-45,-1.2,-55],text:'Długie robocze sale, paleniska i stanowiska rzemieślników tworzą zachodnie skrzydło podziemnego miasta.',cutaway:false},
    {title:'Wschodnia zbrojownia',position:[38,-.3,-43],target:[45,0,-55],text:'Osobne warsztaty i zbrojownie zajmują wschodni zespół komór. Poprzeczne galerie prowadzą do kolejnych pomieszczeń.',cutaway:false},
    {title:'Głębokie archiwum',position:[-38,-6.3,-109],target:[-46,-5.5,-113],text:'Północne galerie otwierają się na składy, archiwa i salę rachuby. Różne poziomy łączą rzeczywiste korytarze oraz schody.',cutaway:false},
    {title:'Tajna zachodnia droga',position:[-58,1.65,-96],target:[-49,-1.4,-99],text:'Wąskie przejście po zachodniej stronie Góry dochodzi osobno do skarbca. Jego rozmiar zachowuje kontrast z publiczną osią szerokich schodów.',cutaway:false},
    {title:'Ravenhill i południowo-zachodni grzbiet',position:[ravenX+1,ravenY+3.05,ravenZ+1.1],target:[0,29,-45],text:'Ravenhill leży na końcu południowo-zachodniego ramienia. Samotna Góra ma rozchodzące się grzbiety, a Dale pozostaje zrujnowanym miastem w dolinie.'},
    {title:'Pełny przekrój królestwa',position:[110,76,32],target:[0,2,-61],text:'Rozległy zespół sal obejmuje ucztowanie, mieszkanie, pracę, zbrojownie i najniższy skarbiec. Dokładna liczba sal, ich rzut i wymiary są interpretacją relacji opisanych w książce.',cutaway:true},
  ];
  const result=finish([152,104,157],[0,22,-30],'#7d8786','#a9b2ac',[-85,130,77],tours);result.setTour=index=>{gateAngle=index>0?1.26:0;};result.planCutaway=true;result.cityBounds={min:[-80,-11.5,-128],max:[80,19,16.5]};result.settlement={buildings:specs.length,districts:5,halls:specs.length,levels:[2,-3,-7,-11],treasury:[38,36],coins:coins.count,interpretation:true};return result;
}
function spiderWeb(c, at, size, angle = 0) {
  const g = new THREE.Group(); g.position.set(...at); g.rotation.y = angle; c.group.add(g);
  for (let i = 0; i < 13; i++) { const a = i * TAU / 13, r = size * (1 + .09 * Math.sin(i * 2)); c.beam([0, 0, .015], [Math.cos(a) * r, Math.sin(a) * r, 0], .0055, c.m.web, g); }
  for (let ring = 1; ring <= 10; ring++) { const points = []; for (let i = 0; i <= 52; i++) { const a = i / 52 * TAU, r = size * ring / 10 * (1 + .025 * Math.sin(a * 13)); points.push([Math.cos(a) * r, Math.sin(a) * r, .017 * Math.sin(a * 4)]); } c.tube(points, .0045, c.m.web, g, 64, 5); }
}
function mirkwood() {
  const c = workshop(294106), { m, rnd, ground, rock, finish } = c;
  const riverZ=x=>-2.1+Math.sin(x*.23)*.55;const height=(x,z)=>{const base=.19+.48*Math.sin(x*.3)*Math.cos(z*.26)+.24*Math.sin(z*.7+x*.2),distance=Math.abs(z-riverZ(x));return lerp(.02,base,clamp((distance-.68)/.7,0,1));};c.landscape(150,175,height,m.moss,300,280);
  const pathNodes=[[-2,76],[-1,60],[7,44],[6,31],[-2,20],[1.3,14.8],[0,7],[.48,-.57],[-1,-7],[4,-23],[-5,-38],[-2,-54],[3,-65],[0,-76]],roadX=z=>{for(let i=1;i<pathNodes.length;i++){const a=pathNodes[i-1],b=pathNodes[i];if(z<=a[1]&&z>=b[1])return lerp(a[0],b[0],(a[1]-z)/(a[1]-b[1]));}return z>0?-2:0;};
  const road=pathNodes.map(([x,z])=>[x,height(x,z)+.035,z]);c.path(road,1.13,m.earth,c.group,480);
  // Irregular groves follow four distinct stretches of the northern path:
  // old oak slopes, the stream banks, a web-filled hollow, and lighter beech.
  // A grove has clustered trunks and a shared clearing, not repeated tree rows.
  const groves=[[-30,58,22,20,'oak'],[-17,32,16,17,'oak'],[26,54,22,22,'oak'],[36,26,19,17,'oak'],[-26,4,19,18,'stream'],[25,-12,17,17,'stream'],[-24,-33,20,19,'web'],[29,-37,23,20,'web'],[-22,-64,22,21,'beech'],[23,-67,23,23,'beech']],trunks=[],beechBark=m.bark.clone();beechBark.color.set('#737461');
  for(const [cx,cz,radius,count,kind]of groves){for(let i=0;i<count*4;i++){if(trunks.filter(p=>p[2]===cx&&p[3]===cz).length>=count)break;const a=i*2.399963+rnd()*.25,r=radius*Math.sqrt((i%count+.3)/count),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(Math.abs(x)>70||Math.abs(z)>82||Math.abs(x-roadX(z))<3.2||Math.abs(z-riverZ(x))<2.1||trunks.some(p=>Math.hypot(x-p[0],z-p[1])<3.5))continue;trunks.push([x,z,cx,cz]);const size=kind==='beech'?.93+rnd()*.34:kind==='stream'?.77+rnd()*.34:1.03+rnd()*.57,tree=c.ancientTree(x,height(x,z),z,size,true,c.group,true);if(kind==='beech')tree.traverse(o=>{if(o.isInstancedMesh)o.material.color.set('#a1ad68');else if(o.isMesh&&o.material===m.bark)o.material=beechBark;});}}
  for(const [x,z]of[[-3,73],[3.6,71],[-5,57],[8.5,25],[-6.2,16],[6.5,-18],[-6.8,-29],[6.4,-43],[-4,-61],[6.8,-73]])c.ancientTree(x,height(x,z),z,1.14+rnd()*.35,true,c.group,true);
  for(const [x,z]of[[-11,-25],[10,-35],[-13,-42]]){const root=c.tube([[x,height(x,z),z],[x*.6,height(x*.6,z+1)+.75,z+1],[x*.2,height(x*.2,z+2)+.15,z+2]],.28,m.bark);root.name='Roots around the spider hollow';spiderWeb(c,[x,3.5,z],3.3,(rnd()-.5)*.5);}
  for(const [x,z,s]of[[-31,45,2.4],[-26,48,2],[17,30,2.5]])rock([x,height(x,z)+.8,z],[s,1.5,s*.8],m.moss,3);
  for (let i = 0; i < 19; i++) { const x = (rnd() - .5) * 33, z = (rnd() - .5) * 33; if (Math.hypot(x, z) < 18 && Math.abs(x - Math.sin((18 - z) / 1.4 * .43) * 2.5) > 2) { rock([x, height(x, z) + .2, z], [1 + rnd(), .25 + rnd() * .6, .6 + rnd()], m.moss); c.fern(x + 1, height(x + 1, z), z, .5 + rnd() * .6); } }
  // Giant webs bridge branches and roots; their actual radial and spiral threads
  // remain visible when the viewer orbits into the forest canopy.
  spiderWeb(c, [-6, 3.2, 4], 2.4, .18); spiderWeb(c, [5.9, 3.5, -2], 2.8, -.3); spiderWeb(c, [-8, 4.7, -9], 2.3, .35); spiderWeb(c, [10, 2.7, 7], 1.9, -.65);
  const log = c.tube([[-11, .6, 9], [-8, .8, 8], [-5.5, .75, 6.5]], .57, m.bark, c.group, 52, 18); c.tube([[-8, 1, 8], [-7, 2, 7.5], [-6.5, 2.2, 7]], .12, m.bark); for (const [x, z] of [[-8, 8], [-7, 7.4], [8, -5], [9, -5.6]]) { c.cyl(.035, .052, .25, m.paleStone, [x, height(x, z) + .16, z], 10); c.ball(.17, m.copper, [x, height(x, z) + .29, z], [1, .27, 1], c.group, 14); }
  // The enchanted stream interrupts the forest path. A tethered black boat,
  // rather than a permanent bridge, provides the crossing described in Hobbit.
  const enchanted=m.water.clone();enchanted.color.set('#637880');enchanted.roughness=.14;const stream=[];for(let i=0;i<=120;i++){const x=-72+i*1.2;stream.push([x,.079+Math.sin(i*.8)*.009,riverZ(x)]);}c.path(stream,1.58,enchanted,c.group,300);
  const skiff=boat(c,.43,.105,riverZ(.43),0,.54);skiff.traverse(o=>{if(o.isMesh&&o.material===m.wood)o.material=m.darkWood;});c.tube([[1.3,height(1.3,-.55)+.08,-.55],[.9,.33,-1.02],[.72,.31,-1.35]],.013,m.paleWood);
  for(const x of [-9,-3,5,12]){const ripple=c.mesh(new THREE.RingGeometry(.2,.215,40),m.web,[x,.098,riverZ(x)]);ripple.rotation.x=-Math.PI/2;ripple.scale.set(2.8,.6,1);}
  if(enchanted.map)c.animators.push(t=>{enchanted.map.offset.x=t*.006;});
  c.scatter(height,18000,73,(x,z)=>Math.abs(x-roadX(z))>1.5&&Math.abs(z-riverZ(x))>.9,m.fern);
  return orientLandscape(finish([83,40,101],[0,4,0],'#344c41','#61766a',[-45,74,35],[
    {title:'Ścieżka w Mrocznej Puszczy',position:[1.3,height(1.3,14.8)+1.65,14.8],target:[2,height(2,10.2)+1.33,10.2],text:'Wąska droga niknie między starymi pniami, korzeniami i paprociami.'},
    {title:'Zaczarowana rzeka',position:[.48,height(.48,-.57)+1.6,-.57],target:[.45,.41,-2.35],text:'Czarna woda przecina szlak. Przy brzegu czeka mała łódź przywiązana liną; książkowa przeprawa nie jest mostem.'},
    {title:'Pajęcze sieci między konarami',position:[-2.3,height(-2.3,4.1)+1.66,4.1],target:[-6,3.2,4],text:'Rzeczywiste promieniste i spiralne nici łączą gałęzie w gęstym lesie.'},
    {title:'Korzenie i powalony pień',position:[-5.2,height(-5.2,9.1)+1.6,9.1],target:[-8,.92,8],text:'Powalone drewno i podrost tworzą drugi, bliski plan pod wysokimi koronami.'},
    {title:'Ponad leśnym baldachimem',position:[9.2,13.8,10.5],target:[0,7.8,-4],text:'Wyższy punkt obserwacji pokazuje zagubiony wśród koron przebieg drogi.'},
    {title:'Zachodni skraj Elfiej Ścieżki',position:[roadX(69),height(roadX(69),69)+1.7,69],target:[roadX(52),3,52],text:'Od zachodniego wejścia droga wspina się między starymi dębami, mija skalne zbocza i prowadzi na wschód przez północną puszczę.'},
    {title:'Jaśniejsze buki na wschodzie',position:[roadX(-64),height(roadX(-64),-64)+1.7,-64],target:[0,3,-75],text:'Po przekroczeniu rzeki i pajęczej kotliny droga dochodzi do jaśniejszych bukowych gajów. Sale króla pozostają odrębnym miejscem dalej na wschodzie.'},
    {title:'Kotlina olbrzymich pajęczyn',position:[roadX(-29),height(roadX(-29),-29)+1.7,-29],target:[10,3.5,-35],text:'W osobnej niskiej kotlinie korzenie i zawieszone sieci otaczają drogę. Układ stref lasu jest interpretacją podróży, nie losowym powtarzaniem identycznych drzew.'},
  ]),-Math.PI/2);
}

function thranduil() {
  const c=workshop(294107),{m,rnd,group,box,cyl,beam,tube,rock,finish}=c;
  // Many unequal living-rock chambers branch through a wooded northern bank.
  // Audience and domestic rooms are high, cells lower, barrel cellars lowest.
  const specs=[
    ['High audience chamber',[0,4,-17],24,32,10,'throne'],
    ['Western council grove',[-32,4,-17],20,22,7,'council'],
    ['Great woodland feast chamber',[-32,5,-46],24,27,9,'feast'],
    ['Western sleeping chambers',[-63,5,-46],22,21,6,'home'],
    ['Eastern library',[32,5,-28],24,23,8,'archive'],
    ['Eastern household chambers',[63,5,-28],22,25,6.5,'home'],
    ['Upper branching antechamber',[0,6,-44],19,16,7,'council'],
    ['High private court',[0,7,-67],24,23,8,'home'],
    ['Western shrine chamber',[-31,7,-78],24,24,9,'archive'],
    ['Lower service court',[34,1,-57],24,22,6,'work'],
    ['Lower prison gallery',[64,1,-59],20,24,5,'cells'],
    ['Lower waiting chamber',[0,1,-93],23,18,6,'council'],
    ['Lowest barrel cellar',[35,-2,-86],26,25,5.5,'barrels'],
    ['Eastern wine cellar',[67,-2,-92],22,22,5,'barrels'],
    ['Western store chamber',[-29,-2,-105],25,21,5,'work'],
  ];
  const routes=[],link=(a,b,w=3.6,h=4.2)=>{routes.push(connectRooms(c,a,b,w,h));};
  link([0,4,-1],[0,4,2],5.8,7);
  link([-12,4,-17],[-22,4,-17]);link([-32,4,-28],[-32,5,-32.5]);link([-44,5,-46],[-52,5,-46]);
  link([12,4,-17],[20,5,-28]);link([44,5,-28],[52,5,-28]);
  link([0,4,-33],[0,6,-36]);link([0,6,-52],[0,7,-55.5]);link([-12,7,-67],[-19,7,-78]);link([-32,5,-59.5],[-31,7,-66]);
  link([32,5,-39.5],[34,1,-46]);link([46,1,-57],[54,1,-59]);link([34,1,-68],[35,-2,-73.5]);
  link([35,-2,-98.5],[0,1,-102]);link([0,7,-78.5],[0,1,-84]);link([48,-2,-86],[56,-2,-92]);link([-11.5,1,-93],[-16.5,-2,-105]);
  const forestRiver=x=>12.2+Math.sin(x*.032)*1.8,underground=[[35,-3.4,-86],[56,-3.25,-88],[75,-2.4,-63],[81,-1.1,-37],[78,-.1,-13],[68,.11,forestRiver(68)]];
  const base=(x,z)=>.12+.22*Math.sin(x*.17)*Math.cos(z*.19),height=(x,z)=>{
    let y=lerp(-.07,base(x,z),clamp((Math.abs(z-forestRiver(x))-3.4)/1.5,0,1));
    for(const[,a,w,d]of specs)if(((x-a[0])/(w/2+1))**2+((z-a[2])/(d/2+1))**2<1.05)y=Math.min(y,a[1]-.6);
    for(const route of [...routes,...underground.slice(1).map((b,i)=>[underground[i],b])]){const a=route[0],b=route[1],vx=b[0]-a[0],vz=b[2]-a[2],t=clamp(((x-a[0])*vx+(z-a[2])*vz)/(vx*vx+vz*vz),0,1);if(Math.hypot(x-a[0]-t*vx,z-a[2]-t*vz)<3)y=Math.min(y,lerp(a[1],b[1],t)-.5);}
    return y;
  };
  c.landscape(230,230,height,m.moss,240,260);
  const hillShell=new THREE.Group();hillShell.userData.cutawayShell=true;hillShell.name='Removable forested rock above three levels of connected chambers';group.add(hillShell);
  const hill=c.parametric((u,v)=>{const a=u*TAU,e=v*Math.PI/2,r=91*Math.cos(e)*(1+.025*Math.sin(a*13+v*9));return[Math.sin(a)*r,42*Math.sin(e),-52+Math.cos(a)*r*.76];},190,100,m.darkStone,hillShell),p=hill.geometry.attributes.position,index=[];
  for(let i=0;i<hill.geometry.index.count;i+=3){const ids=[0,1,2].map(j=>hill.geometry.index.getX(i+j)),x=ids.reduce((s,j)=>s+p.getX(j),0)/3,y=ids.reduce((s,j)=>s+p.getY(j),0)/3,z=ids.reduce((s,j)=>s+p.getZ(j),0)/3;if(!(Math.abs(x)<4.5&&y<13&&z>-8))index.push(...ids);}hill.geometry.setIndex(index);hill.geometry.computeVertexNormals();completeNormals(hill.geometry);
  const halls=specs.map(([name,at,w,d,h,kind],i)=>{const hall=carvedHall(c,name,at,w,d,h,'elf',{doorWidth:i===0?5.8:3.6,doorHeight:i===0?7:4.2,floorHoles:i===12?[[3,0,2.1,3.1]]:[],light:i===0||i===2||i===12});furniture(c,hall,kind,w,d);return hall;});
  const audience=halls[0];for(let i=0;i<12;i++)box(6-i*.13,.2,.53,m.paleStone,[0,.13+i*.15,-4.7-i*.5],audience);box(7,.38,4.1,m.stone,[0,1.95,-11.1],audience);box(1.9,.5,1.5,m.gold,[0,2.5,-11.5],audience);box(1.85,1.8,.25,m.darkWood,[0,3.6,-12.1],audience);
  for(const side of[-1,1]){tube([[side*1.2,2,-11.1],[side*.95,3.4,-11.5],[side*1.3,5.4,-12.2],[side*2.4,6.8,-12.3]],.13,m.paleWood,audience,30,10);for(let i=0;i<6;i++)tube([[side*.85,3.3+i*.4,-12.1],[side*(1.5+i*.12),4.1+i*.4,-12.3],[side*(2+i*.22),4.8+i*.4,-12.1]],.035,m.gold,audience,18,6);}
  // The lower gallery has real individual chambers, a free centre aisle and
  // open iron doors, instead of bars spread through the walking route.
  const cells=halls[10];let cellCount=0;for(const side of[-1,1])for(const z of[-7.3,-2.6,2.6,7.3]){const x=side*5.8;if(((x/10)**2+(z/12)**2)>.9)continue;cellCount++;box(3.3,.15,3.7,m.darkStone,[x,.08,z],cells);for(const dz of[-1.9,1.9])box(3.8,3.5,.16,m.stone,[x,1.75,z+dz],cells);for(let i=0;i<7;i++)if(i!==3&&i!==4)cyl(.028,.028,3.25,m.iron,[side*3.85,1.68,z-1.6+i*.53],8,cells);for(const y of[.2,3.25])beam([side*3.85,y,z-1.7],[side*3.85,y,z+1.7],.04,m.iron,cells);box(1.45,.24,2.5,m.darkWood,[side*6,.26,z],cells);box(1.36,.1,2.4,m.thatch,[side*6,.43,z],cells);}
  const makeBarrel=(parent,x,y,z,s=1)=>{const b=new THREE.Group();b.position.set(x,y,z);b.scale.setScalar(s);parent.add(b);c.mesh(new THREE.LatheGeometry([[.32,-.48],[.41,-.3],[.45,0],[.41,.3],[.32,.48]].map(p=>new THREE.Vector2(...p)),20),m.wood,undefined,undefined,b);cyl(.325,.325,.035,m.darkWood,[0,.49,0],16,b);for(const yy of[-.3,.3]){const ring=c.mesh(new THREE.TorusGeometry(.412,.026,7,20),m.iron,[0,yy,0],undefined,b);ring.rotation.x=Math.PI/2;}return b;};
  let barrels=0;for(const i of[12,13]){const[,at,w,d]=specs[i],hall=halls[i];for(const side of[-1,1])for(let row=0;row<4;row++)for(let col=0;col<6;col++){const x=side*(4.6+row*1.15),z=-d*.3+col*1.3;if((x/(w/2-1))**2+(z/(d/2-1))**2>.92||(i===12&&x>1.8&&x<4.3&&Math.abs(z)<2))continue;makeBarrel(hall,x,.53,z,.9+((row+col)%3)*.1);barrels++;if(row===2&&col%2===0){makeBarrel(hall,x,1.52,z,.9);barrels++;}}if(i===13)box(2.1,.16,3.1,m.darkWood,[3,.1,0],hall);}
  // An open floor hatch lowers barrels to the stream under the lowest cellar.
  const cellar=halls[12],hatch=box(1.97,.13,2.97,m.wood,[4.1,.99,0],cellar);hatch.rotation.z=-1.19;for(const z of[-1.62,1.62])beam([1.92,.04,z],[4.08,.04,z],.06,m.darkWood,cellar);
  const water=m.water.clone();water.color.set('#2e5a5c');c.path(underground,2.3,water,group,300);
  // This is a barrel sluice beneath the cellar floor, not a tall pedestrian
  // vault through the cellar. Its ceiling opens beneath the actual trapdoor.
  const streamVault=stonePassage(c,underground,3.2,1.04),streamP=streamVault.geometry.attributes.position,streamIndices=[];
  for(let i=0;i<streamVault.geometry.index.count;i+=3){const ids=[0,1,2].map(j=>streamVault.geometry.index.getX(i+j)),x=ids.reduce((s,j)=>s+streamP.getX(j),0)/3,y=ids.reduce((s,j)=>s+streamP.getY(j),0)/3,z=ids.reduce((s,j)=>s+streamP.getZ(j),0)/3;if(!(x>36.8&&x<39.2&&z>-87.7&&z<-84.3&&y>-2.95))streamIndices.push(...ids);}streamVault.geometry.setIndex(streamIndices);streamVault.geometry.computeVertexNormals();completeNormals(streamVault.geometry);
  for(let i=0;i<3;i++){const b=makeBarrel(group,35+i*2.1,-3.05,-86-i*.2,.95);b.rotation.z=Math.PI/2;}
  const grate=new THREE.Group();grate.position.set(78,-.14,-13);grate.rotation.y=-.3;group.add(grate);c.arch(3.25,2.75,.35,m.paleStone,[0,0,0],grate,.2);for(let i=0;i<11;i++)box(.065,2.2,.075,m.iron,[-1.4+i*.28,1.1,0],grate);for(const y of[.16,1.3,2.15])box(3,.075,.09,m.iron,[0,y,0],grate);box(1.7,.22,2.5,m.stone,[75,-.21,-15]);
  const river=[];for(let i=0;i<=150;i++){const x=-111+i*222/150;river.push([x,.12,forestRiver(x)]);}c.path(river,6.8,m.water,group,330);if(m.water.map)c.animators.push(t=>{m.water.map.offset.y=t*.003;});
  // Bridge, separate rising stair and heavy stone gate follow the author's
  // drawing, with no river-level doorway pretending to be the hill entrance.
  for(let i=0;i<=46;i++){const t=i/46,z=7.4+t*11.5,y=.75+Math.sin(t*Math.PI)*1.1;box(4,.28,.26,m.paleStone,[0,y,z]);for(const side of[-1,1])box(.2,.63,.26,m.stone,[side*1.95,y+.43,z]);}
  for(const side of[-1,1])tube([[side*1.96,1.17,7.4],[side*1.96,2.36,13.15],[side*1.96,1.17,18.9]],.1,m.paleStone);
  stoneStairs(c,[0,.91,7.4],[0,4,2],4);box(5.8,.28,2.2,m.stone,[0,3.86,1.8]);c.arch(6.7,9.1,1,m.paleStone,[0,4,2.1],group,.36);
  const doorLeaves=[];let doorAngle=0;for(const side of[-1,1]){const hinge=new THREE.Group();hinge.position.set(side*2.95,4,2.8);group.add(hinge);box(2.95,7,.36,m.stone,[-side*1.475,3.5,0],hinge);for(const y of[.5,2.2,3.9,5.6])box(2.7,.1,.08,m.paleStone,[-side*1.475,y,.23],hinge);tube([[-side*1.4,.8,.26],[-side*1.65,3,.26],[-side*1.2,5,.26],[-side*1.5,6.6,.26]],.045,m.gold,hinge,32,7);hinge.traverse(o=>{if(o.isMesh)o.userData.dynamic=true;});doorLeaves.push({hinge,side});}
  c.animators.push((t,dt=1/60)=>doorLeaves.forEach(({hinge,side})=>{hinge.rotation.y=lerp(hinge.rotation.y,side*doorAngle,1-Math.pow(1-.075,dt*60));}));
  for(const side of[-1,1])for(let i=0;i<9;i++){const z=27+i*7,x=side*(9+Math.sin(i*1.5)*1.5);c.ancientTree(x,height(x,z),z,1.3+rnd()*.3,true,group,true);}c.path([[0,height(0,96)+.05,96],[0,height(0,52)+.05,52],[0,.88,19]],3.5,m.earth);
  for(let i=0;i<58;i++){const a=rnd()*TAU,r=98+rnd()*12,x=Math.sin(a)*r,z=-50+Math.cos(a)*r;if(Math.abs(x)>111||Math.abs(z)>111)continue;c.ancientTree(x,height(x,z),z,.9+rnd()*.5,true,group,true);}
  // Trees on the rock itself belong to the same removable shell, so the plan
  // exposes the architecture without leaving floating trunks over the halls.
  for(let i=0;i<36;i++){const a=i*2.399963,r=18+rnd()*64,x=Math.sin(a)*r,z=-52+Math.cos(a)*r*.76,y=42*Math.sqrt(Math.max(0,1-(r/91)**2));c.ancientTree(x,y,z,.74+rnd()*.32,true,hillShell,true);}
  const raftHouse=new THREE.Group();raftHouse.position.set(90,.3,20);group.add(raftHouse);box(6.8,3,5.4,m.wood,[0,1.5,0],raftHouse);c.roof(7.5,2.5,6.2,3,m.thatch,raftHouse);box(8,.18,3,m.wood,[90,.72,24]);for(let i=0;i<8;i++)makeBarrel(group,87+i*.84,1.3,24,.9);timberBridge(c,[90,.8,22],[84,.8,16],1.6,true,0);
  c.scatter(height,6500,109,(x,z)=>!(Math.abs(x)<91&&z<17&&z>-120)&&Math.abs(z-forestRiver(x))>4,m.fern);
  const tours=[
    {title:'Most na Leśnej Rzece',position:[0,3.45,13.1],target:[0,8,2.1],text:'Leśna aleja biegnie przez most ku północnemu skalnemu brzegowi. Osobne schody prowadzą do wysoko położonych kamiennych wrót.'},
    {title:'Kamienne wrota króla',position:[.8,4.65,3.9],target:[0,8,2],text:'Ciężkie kamienne skrzydła otwierają wejście do rozgałęzionego zespołu żywych skalnych komór.',cutaway:false},
    {title:'Wysoka sala audiencyjna',position:[0,5.7,-5],target:[0,8,-27],text:'Reprezentacyjna sala z korzennymi kolumnami i tronem leży wysoko ponad poziomem więziennych galerii oraz piwnic.',cutaway:false},
    {title:'Zachodnie sale uczt i rady',position:[-32,6.7,-38],target:[-38,8,-50],text:'Różnej wielkości naturalne sale rozchodzą się ku mieszkaniom, wspólnym stołom i bocznym komorom. Korytarze otwierają się w prawdziwych portalach.',cutaway:false},
    {title:'Wschodnie archiwum',position:[32,6.7,-22],target:[40,7,-29],text:'Kolejna gałąź wysokich sal mieści księgi i domowe pomieszczenia. Jej kręte połączenia nie powtarzają jednego małego pokoju.',cutaway:false},
    {title:'Najwyższy prywatny dziedziniec',position:[0,8.7,-61],target:[-6,9,-71],text:'Stopnie prowadzą od audiencji przez komorę rozgałęzień do wyżej położonych prywatnych pomieszczeń.',cutaway:false},
    {title:'Niższa galeria więzienna',position:[64,2.7,-54],target:[64,2.6,-65],text:'Niższy poziom ma osobne kamienne cele z otwartymi żelaznymi drzwiami i wolną aleją pośrodku. Schody prowadzą dalej do zaplecza i najniższych piwnic.',cutaway:false},
    {title:'Najniższe piwnice beczek',position:[35,-.3,-79],target:[43,.1,-87],text:'Kamienne nabrzeża, stosy beczek i otwarta klapa stoją ponad podziemnym nurtem. Poziom piwnic leży poniżej galerii więziennej.',cutaway:false},
    {title:'Klapa ponad podziemną wodą',position:[36,-.3,-86],target:[38,-2.8,-86],text:'Otwarta klapa w rzeczywiście przerwanej posadzce prowadzi do strumienia pod komorą. Beczki płyną niższym wodnym tunelem.',cutaway:false},
    {title:'Osobny zakratowany wylot',position:[75,1.6,-15],target:[78,.8,-13],text:'Wodny korytarz kończy się osobną kratą na zboczu. Dalej nurt łączy się z Leśną Rzeką, która płynie ku wschodnim mokradłom.',cutaway:false},
    {title:'Leśna przystań spławu',position:[86.2,2.45,24],target:[90,2,20],text:'Za podziemnym wyjściem Leśna Rzeka prowadzi do osobnej nadrzecznej osady i dalej ku Długiemu Jezioru.'},
    {title:'Rozgałęziony przekrój trzech poziomów',position:[117,80,51],target:[9,4,-56],text:'Wysokie sale, niższe cele i najniższe piwnice tworzą piętnaście różnych komór połączonych przejściami. Funkcje i kolejność pochodzą z opowieści; dokładny rzut i liczba pomieszczeń są interpretacją.',cutaway:true},
  ];
  const result=finish([156,99,147],[0,17,-40],'#687b6d','#8d9d85',[-85,125,77],tours);result.setTour=index=>{doorAngle=index>=1?1.17:0;};result.planCutaway=true;result.cityBounds={min:[-77,-3.6,-118],max:[83,18,20]};result.settlement={buildings:specs.length,halls:specs.length,districts:5,levels:[7,4,1,-2],cells:cellCount,barrels,interpretation:true};return result;
}
export const BONUS_REGION_NOTES = {
  misty: 'An interpretive High Pass through the Misty Mountains; serrated rock and sparse snow recall Tolkien’s 1937 Eagles’ Eyrie drawing.',
  goblintown: 'A large central gathering hall, three uneven occupied galleries and eighteen workshops form a connected timber stronghold inside living rock. Separate high western and lower eastern routes follow the book’s relations; a narrow descending branch reaches a distinct deep Gollum lake. Exact platform counts and dimensions are an interpretation of the book and film references.',
  beorn: 'Beorn’s timber hall follows the Anglo-Saxon mead-hall character described by the Tolkien Estate. The roof cutaway reveals the hearth and aisle.',
  laketown: 'A continuous 95 × 117 quadrilateral piled deck in the western bay supports 144 varied dwellings, irregular connected streets and peripheral wharves. A land guardhouse and long bridge reach the gate; the largest Master’s house adjoins the market pool, whose open southern boat channel passes under raised street bridges. Source relationships follow The Hobbit and Tolkien’s drawing; parcel counts and dimensions are an interpretation.',
  erebor: 'Six mountain spurs surround the southern gate valley. Thirteen connected halls fill the underground kingdom: the higher near-gate Great Chamber of Thrór leads down broad stairs to the largest and lowest Great Hall of Thráin, with transverse domestic courts, armouries, workshops, records and stores. A distinct narrow western passage reaches the hoard. Exact room counts, sculpture, plans and dimensions are an interpretation.',
  mirkwood: 'The northern Elf-path runs west to east through old oak slopes, the enchanted-stream crossing, a spider hollow and lighter eastern beech groves. Individual trunks and groves vary; exact vegetation and path bends are an interpretation.',
  thranduil: 'Forest avenue, bridge, rising northern rock-bank stairs and heavy stone doors follow Tolkien’s illustration. Fifteen unequal natural chambers branch between higher audience, household and feast rooms, lower cells and the lowest barrel cellars. Real floor openings reach the underground stream, which has a distinct grated outlet to the Forest River. Functional relations follow The Hobbit; exact chamber counts, dimensions, plans and root ornament are an interpretation.'
};
export const BONUS_REGION_SOURCES = {
  misty: ['https://www.tolkienestate.com/painting/the-hobbit/', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/534-large.jpg'],
  goblintown: ['https://www.wetafx.co.nz/films/filmography/the-hobbit-an-unexpected-journey'],
  beorn: ['https://www.tolkienestate.com/painting/the-hobbit/', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/540-large.jpg'],
  laketown: ['https://www.tolkienestate.com/painting/the-hobbit/', 'https://tolkiengateway.net/wiki/Lake-town', 'https://www.wetafx.co.nz/films/filmography/the-hobbit-the-desolation-of-smaug'],
  erebor: ['https://www.tolkienestate.com/painting/the-hobbit/', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/564dhv0021.jpg', 'https://tolkiengateway.net/wiki/Great_Hall_of_Thr%C3%A1in', 'https://tolkiengateway.net/wiki/Great_Chamber_of_Thr%C3%B3r', 'https://tolkiengateway.net/wiki/Thr%C3%B3r%27s_Map'],
  mirkwood: ['https://www.tolkienestate.com/painting/the-hobbit/', 'https://tolkiengateway.net/wiki/Elf-path'],
  thranduil: ['https://www.tolkienestate.com/painting/the-hobbit/', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/554-croppedjpg.jpg', 'https://tolkiengateway.net/wiki/Elvenking%27s_Halls', 'https://www.wetafx.co.nz/films/filmography/the-hobbit-the-desolation-of-smaug']
};
export function buildBonusRegion(id) {
  const makers = { misty, goblintown, beorn, laketown, erebor, mirkwood, thranduil };
  if (!makers[id]) throw new Error(`Unknown bonus region: ${id}`);
  const result = makers[id](); result.group.name = `Bilbo’s road — ${id}`; return result;
}
