import * as THREE from 'three';

// Original procedural sculptures, with book / screen distinctions in the lore.
// Closed surfaces, continuous facial deformation, layered textile folds and
// instanced dragon scales remain geometry when the scene is exported to GLB.
const TAU = Math.PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const gaussian = (x, y, cx, cy, wx, wy) => Math.exp(-((x - cx) ** 2 / wx ** 2 + (y - cy) ** 2 / wy ** 2));
function random(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function reliefTexture(kind, rnd) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#858585'; ctx.fillRect(0, 0, 512, 512);
  if (kind === 'cloth') {
    for (let y = 0; y < 512; y += 3) for (let x = 0; x < 512; x += 3) {
      ctx.fillStyle = ((x / 3 + y / 3) % 2) ? '#999999' : '#6c6c6c'; ctx.fillRect(x, y, 2, 2);
    }
  } else if (kind === 'hair') {
    for (let i = 0; i < 160; i++) {
      ctx.strokeStyle = `rgba(235,235,235,${.2 + rnd() * .4})`; ctx.lineWidth = .5;
      ctx.beginPath(); ctx.moveTo(i * 3.2, 0);
      for (let y = 0; y <= 512; y += 8) ctx.lineTo(i * 3.2 + Math.sin(y * .035 + i) * 2, y);
      ctx.stroke();
    }
  } else if (kind === 'stone') {
    for (let y = 0; y < 512; y += 48) for (let x = -(y / 48 % 2) * 48; x < 512; x += 96) {
      ctx.strokeStyle = '#575757'; ctx.lineWidth = 2; ctx.strokeRect(x, y, 96, 48);
    }
  }
  for (let i = 0; i < 12000; i++) {
    const k = 75 + Math.floor(rnd() * 115); ctx.fillStyle = `rgb(${k},${k},${k})`;
    ctx.fillRect(rnd() * 512, rnd() * 512, .6 + rnd(), .6 + rnd());
  }
  const map = new THREE.CanvasTexture(canvas); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 8;
  map.repeat.set(kind === 'cloth' ? 5 : 2, kind === 'cloth' ? 7 : 2); return map;
}

function repairCollapsedNormals(geo) {
  const p=geo.attributes.position;let n=geo.attributes.normal;
  if(!n||n.count!==p.count){geo.deleteAttribute('normal');geo.computeVertexNormals();n=geo.attributes.normal;}
  const collapsed=[];
  for(let i=0;i<n.count;i++){
    const length=Math.hypot(n.getX(i),n.getY(i),n.getZ(i));
    if(!Number.isFinite(length))throw new Error(`Invalid sculpture normal at vertex ${i}`);
    if(length<1e-12)collapsed.push(i);
  }
  if(!collapsed.length)return;
  // Parametric poles repeat one position along the UV seam. Some copies touch
  // only collapsed triangles; inherit the smooth normal of their welded peers.
  const key=i=>`${Math.round(p.getX(i)*1e6)},${Math.round(p.getY(i)*1e6)},${Math.round(p.getZ(i)*1e6)}`;
  const sums=new Map(collapsed.map(i=>[key(i),new THREE.Vector3()]));
  for(let i=0;i<n.count;i++){const sum=sums.get(key(i));if(sum)sum.add(V(n.getX(i),n.getY(i),n.getZ(i)));}
  const missing=new Set(collapsed),adjacent=new Map(collapsed.map(i=>[i,new THREE.Vector3()]));
  const idx=geo.index?.array,count=idx?.length??p.count;
  for(let j=0;j<count;j+=3){const triangle=[idx?idx[j]:j,idx?idx[j+1]:j+1,idx?idx[j+2]:j+2];for(const i of triangle)if(missing.has(i)){const sum=adjacent.get(i);for(const q of triangle)sum.add(V(n.getX(q),n.getY(q),n.getZ(q)));}}
  geo.computeBoundingBox();const center=geo.boundingBox.getCenter(new THREE.Vector3());
  for(const i of collapsed){let normal=sums.get(key(i)).clone();if(normal.lengthSq()<1e-16)normal.copy(adjacent.get(i));if(normal.lengthSq()<1e-16)normal.set(p.getX(i),p.getY(i),p.getZ(i)).sub(center);if(normal.lengthSq()<1e-16)normal.set(0,1,0);normal.normalize();n.setXYZ(i,normal.x,normal.y,normal.z);}
  n.needsUpdate=true;
}

function surface(fn, nu, nv, material, parent, thickness = 0) {
  const positions = [], uvs = [], indices = [], stride = nu + 1;
  for (let v = 0; v <= nv; v++) for (let u = 0; u <= nu; u++) { positions.push(...fn(u / nu, v / nv)); uvs.push(u / nu, v / nv); }
  for (let v = 0; v < nv; v++) for (let u = 0; u < nu; u++) {
    const a = v * stride + u; indices.push(a, a + 1, a + stride, a + 1, a + stride + 1, a + stride);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(indices); geo.computeVertexNormals();
  if (thickness) {
    const p = geo.attributes.position, n = geo.attributes.normal, count = p.count;
    for (let i = 0; i < count; i++) { positions.push(p.getX(i) - n.getX(i) * thickness, p.getY(i) - n.getY(i) * thickness, p.getZ(i) - n.getZ(i) * thickness); uvs.push(uvs[i * 2], uvs[i * 2 + 1]); }
    const topIndices = indices.slice(); for (let i = 0; i < topIndices.length; i += 3) indices.push(topIndices[i] + count, topIndices[i + 2] + count, topIndices[i + 1] + count);
    const seam = (a, b) => indices.push(a, a + count, b, b, a + count, b + count);
    for (let i = 0; i < nu; i++) { seam(i + 1, i); seam(nv * stride + i, nv * stride + i + 1); }
    for (let i = 0; i < nv; i++) { seam(i * stride, (i + 1) * stride); seam((i + 1) * stride + nu, i * stride + nu); }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(indices);
    // computeVertexNormals reuses an existing buffer. Thickness doubles the
    // vertex count, so the old normal attribute must be replaced first.
    geo.deleteAttribute('normal');geo.computeVertexNormals();
  }
  repairCollapsedNormals(geo);
  const mesh = new THREE.Mesh(geo, material); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

function sweepFunction(points, radius, steps = 72, ellipse = [1, 1]) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => V(...p))); const frames = curve.computeFrenetFrames(steps, false);
  const fn = (u, v) => {
    const a = u * TAU, i = Math.min(steps, Math.round(v * steps)), r = typeof radius === 'function' ? radius(v) : radius;
    return curve.getPoint(v).addScaledVector(frames.normals[i], Math.cos(a) * r * ellipse[0]).addScaledVector(frames.binormals[i], Math.sin(a) * r * ellipse[1]).toArray();
  };
  return { curve, frames, fn };
}

function batch(group) {
  group.updateMatrixWorld(true); const buckets = new Map(), inv = group.matrixWorld.clone().invert();
  group.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || o.material.transparent || Array.isArray(o.material)) return;
    let p = o; while (p && p !== group) { if (p.userData.dynamic) return; p = p.parent; }
    const list = buckets.get(o.material.uuid) || []; list.push(o); buckets.set(o.material.uuid, list);
  });
  for (const objects of buckets.values()) {
    if (objects.length < 2) continue;
    const positions = [], normals = [], uvs = [], indices = []; let offset = 0;
    for (const o of objects) {
      const geo = o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); if (!geo.attributes.normal) geo.computeVertexNormals();
      const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
      for (let i = 0; i < p.count; i++) { positions.push(p.getX(i), p.getY(i), p.getZ(i)); normals.push(n.getX(i), n.getY(i), n.getZ(i)); uvs.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0); }
      if (geo.index) for (let i = 0; i < geo.index.count; i++) indices.push(geo.index.getX(i) + offset); else for (let i = 0; i < p.count; i++) indices.push(i + offset);
      offset += p.count; geo.dispose();
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(indices); geo.computeBoundingSphere();
    const merged = new THREE.Mesh(geo, objects[0].material); merged.name = 'Baked sculpture detail'; merged.castShadow = merged.receiveShadow = true;
    for (const o of objects) { o.parent.remove(o); o.geometry.dispose(); } group.add(merged);
  }
}

function sculptContext(seed) {
  const group = new THREE.Group(), rnd = random(seed);
  const mat = (color, roughness = .7, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const clothMap = reliefTexture('cloth', rnd), hairMap = reliefTexture('hair', rnd), pores = reliefTexture('skin', rnd), stoneMap = reliefTexture('stone', rnd);
  const cloth = color => mat(color, .86, 0, { bumpMap: clothMap, bumpScale: .009, side: THREE.DoubleSide });
  const m = {
    skin: mat('#d9b99f', .63, 0, { bumpMap: pores, bumpScale: .0028 }), lip: mat('#9c6960', .76),
    bone: mat('#d2c6a3', .56), black: mat('#121619', .52), sclera: mat('#d4d3bd', .21),
    gold: mat('#c0ab72', .27, .83), silver: mat('#d3d3be', .24, .86), iron: mat('#8e9891', .3, .8),
    green: cloth('#394f37'), paleGreen: cloth('#63705a'), blue: cloth('#5b6a7b'), grey: cloth('#7a848b'),
    leather: mat('#594132', .72, .03, { bumpMap: pores, bumpScale: .012 }), darkLeather: mat('#2d3027', .8, 0, { bumpMap: pores, bumpScale: .015 }),
    hairBlond: mat('#bcaa78', .57, .1, { bumpMap: hairMap, bumpScale: .007 }), hairDark: mat('#2b2623', .54, .03, { bumpMap: hairMap, bumpScale: .008 }),
    stone: mat('#727a74', .93, 0, { bumpMap: stoneMap, bumpScale: .06 }), darkStone: mat('#2c3431', .94, 0, { bumpMap: stoneMap, bumpScale: .045 }),
    wood: mat('#62472d', .77, 0, { bumpMap: hairMap, bumpScale: .014 }), leaf: mat('#665f38', .85),
  };
  const mesh = (geo, material, pos = [0, 0, 0], scale = [1, 1, 1], parent = group) => { repairCollapsedNormals(geo);const o = new THREE.Mesh(geo, material); o.position.set(...pos); o.scale.set(...scale); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const sphere = (r, material, pos, scale = [1, 1, 1], parent = group, nu = 48, nv = 32) => mesh(new THREE.SphereGeometry(r, nu, nv), material, pos, scale, parent);
  const cylinder = (rt, rb, h, material, pos, parent = group, sides = 48) => mesh(new THREE.CylinderGeometry(rt, rb, h, sides), material, pos, undefined, parent);
  const box = (w, h, d, material, pos, parent = group) => mesh(new THREE.BoxGeometry(w, h, d), material, pos, undefined, parent);
  const torus = (r, tube, material, pos, parent = group) => mesh(new THREE.TorusGeometry(r, tube, 12, 72), material, pos, undefined, parent);
  const sweep = (points, radius, material, parent = group, steps = 64, sides = 16, ellipse = [1, 1]) => surface(sweepFunction(points, radius, steps, ellipse).fn, sides, steps, material, parent);
  const base = (radius, height = .65) => { cylinder(radius, radius * .96, height, m.darkStone, [0, -height / 2, 0], group, 112); cylinder(radius * .99, radius * .99, .075, m.gold, [0, -.01, 0], group, 112); cylinder(radius * .975, radius * .975, .06, m.stone, [0, .045, 0], group, 112); };
  const clothSurface = (profile, material, parent, { start = 0, arc = TAU, folds = 22, depth = .72, offset = [0, 0, 0], fullness = .028 } = {}) => {
    const curve = new THREE.CatmullRomCurve3(profile.map(([r, y]) => V(r, y, 0)));
    return surface((u, v) => { const p = curve.getPoint(v), a = start + u * arc, fold = (Math.sin(a * folds + .24 * Math.sin(v * 8)) * fullness + Math.sin(a * (folds * 2 + 1) + v * 7) * .004) * (1 - .35 * v), r = p.x + fold;
      return [Math.sin(a) * r + offset[0], p.y + Math.sin(a * 8) * .009 * (1 - v) + offset[1], Math.cos(a) * r * depth + offset[2]];
    }, 144, 90, material, parent, .006);
  };
  return { group, rnd, m, mat, mesh, sphere, cylinder, box, torus, sweep, base, clothSurface };
}

function pointedEar(c, side, y, parent) {
  const { m, sweep } = c;
  const outline = [[side * .335, y + .04, -.012], [side * .46, y + .17, -.026], [side * .54, y + .225, -.028], [side * .505, y + .04, .008], [side * .429, y - .14, .028], [side * .349, y - .16, .022]];
  const center = V(side * .412, y - .006, .07), ring = outline.map(p => V(...p));
  const pos = [...center.toArray(), ...ring.flatMap(p => p.toArray()), ...V(side * .412, y - .006, -.045).toArray()];
  const indices = []; for (let i = 0; i < ring.length; i++) { const a = i + 1, b = (i + 1) % ring.length + 1; indices.push(0, side === 1 ? b : a, side === 1 ? a : b, 7, side === 1 ? a : b, side === 1 ? b : a); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(indices); geo.computeVertexNormals(); c.mesh(geo, m.skin, undefined, undefined, parent);
  sweep(outline.concat([outline[0]]), () => .012, m.skin, parent, 60, 10);
  sweep([[side * .382, y - .093, .065], [side * .448, y - .02, .068], [side * .486, y + .115, .018]], v => .008 * (1 - .4 * v), m.lip, parent, 36, 8);
}

function elfFace(c, id, parent) {
  const { m, mesh, sphere, sweep } = c; const y0 = 5.42, r = .397, older = id === 'elrond';
  const geo = new THREE.SphereGeometry(r, 144, 112), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i) * .85, y = p.getY(i) * 1.22, z = p.getZ(i) * .85; const forward = clamp(z / (r * .36), 0, 1); x *= 1 - .14 * clamp(-y / r, 0, 1);
    let shape = .076 * gaussian(x, y, 0, .015, .044, .14) + .083 * gaussian(x, y, 0, -.108, .064, .046) + .034 * gaussian(x, y, 0, -.30, .15, .075);
    for (const s of [-1, 1]) { shape += .032 * gaussian(x, y, s * .153, -.084, .08, .082) + .025 * gaussian(x, y, s * .145, .132, .099, .03) - .055 * gaussian(x, y, s * .147, .054, .079, .036); shape -= .006 * gaussian(x, y, s * .074, -.19, .014, .074); }
    if (older) shape -= .003 * Math.sin(y * 125) ** 2 * gaussian(x, y, 0, .24, .25, .11);
    z += forward * shape; p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals(); const face = mesh(geo, m.skin, [0, y0, 0], undefined, parent); face.name = 'Continuous sculpted elf face';
  cylinderNeck(c, parent);
  const iris = c.mat(older ? '#727e82' : '#657779', .24, .08), pupil = c.mat('#0c1214', .12), cornea = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .045, metalness: 0, transparent: true, opacity: .16, clearcoat: 1, clearcoatRoughness: .03 });
  for (const s of [-1, 1]) {
    pointedEar(c, s, y0, parent);
    sphere(.061, m.sclera, [s * .144, y0 + .052, .288], [1.15, .48, .56], parent, 48, 32);
    sphere(.025, iris, [s * .144, y0 + .052, .326], [1, 1, .18], parent, 48, 32);
    sphere(.011, pupil, [s * .144, y0 + .052, .331], [1, 1, .13], parent, 32, 24);
    sphere(.026, cornea, [s * .144, y0 + .052, .332], [1, 1, .19], parent, 32, 24);
    for (const upper of [true, false]) { const ps = []; for (let j = 0; j <= 18; j++) { const t = j / 18; ps.push([s * .144 - .069 + t * .138, y0 + .052 + Math.sin(t * Math.PI) * (upper ? .026 : -.02), .292 + Math.sin(t * Math.PI) * .032]); } sweep(ps, () => upper ? .009 : .0065, m.skin, parent, 40, 10); }
    for (let j = 0; j < 15; j++) { const x = s * .144 - .076 + j * .01; sweep([[x, y0 + .129 + Math.sin(j / 14 * Math.PI) * .011, .296], [x + s * .012, y0 + .138 + Math.sin(j / 14 * Math.PI) * .012, .300]], () => .0032, older ? m.hairDark : m.hairBlond, parent, 8, 5); }
    sphere(.013, m.lip, [s * .036, y0 - .109, .355], [1, .5, .35], parent, 24, 16);
    if (older) for (let j = 0; j < 3; j++) sweep([[s * .212, y0 + .02 + j * .012, .272], [s * .24, y0 + .002 + j * .017, .248]], () => .002, m.lip, parent, 12, 5);
  }
  sweep([[-.092, y0 - .205, .293], [-.041, y0 - .21, .317], [0, y0 - .214, .323], [.041, y0 - .21, .317], [.092, y0 - .205, .293]], v => .006 + Math.sin(v * Math.PI) * .005, m.lip, parent, 48, 12);
  sweep([[-.082, y0 - .221, .298], [0, y0 - .238, .32], [.082, y0 - .221, .298]], v => .005 + Math.sin(v * Math.PI) * .006, m.skin, parent, 40, 12);
  return y0;
}

function cylinderNeck(c, parent) { c.cylinder(.145, .185, .4, c.m.skin, [0, 4.94, -.005], parent, 56); }

function longElfHair(c, id, y0, parent) {
  const { m, rnd, sweep } = c, material = id === 'legolas' ? m.hairBlond : m.hairDark;
  const maxTheta = phi => mix(1.75, .98, Math.max(0, Math.sin(phi)));
  surface((u, v) => { const phi = u * TAU, theta = v * maxTheta(phi), wave = .004 * Math.sin(phi * 25 + v * 13);
    return [(.35 + wave) * Math.cos(phi) * Math.sin(theta), y0 + .503 * Math.cos(theta), (.352 + wave) * Math.sin(phi) * Math.sin(theta) - .007];
  }, 128, 64, material, parent);
  // Individual tapered locks follow the skull, ears and shoulder line. The
  // anterior opening leaves the eyes, cheek planes and ear tips visible.
  for (let i = 0; i < 84; i++) {
    const phi = i / 84 * TAU, forward = Math.sin(phi), side = Math.cos(phi), theta = .42 + rnd() * .42;
    if (forward > .66) {
      const s = side < 0 ? -1 : 1, x = side * .31;
      sweep([[x, y0 + .41, forward * .13], [s * .29, y0 + .27, .245], [s * .37, y0 + .17, .10], [s * .37, y0 - .13, -.04]], v => .025 * (1 - .82 * v), material, parent, 54, 12);
    } else {
      const root = [Math.cos(phi) * .345 * Math.sin(theta), y0 + .50 * Math.cos(theta), Math.sin(phi) * .35 * Math.sin(theta)];
      const endY = 4.18 + rnd() * .48, x = side * (.36 + rnd() * .055), z = forward * .34 - .08;
      sweep([root, [side * .365, y0 + .14, forward * .34], [x, y0 - .32, z], [x + Math.sin(phi * 3) * .042, 4.77, z - .04], [x * .89, endY, z + .028]], v => (.027 + rnd() * .007) * (1 - v * .81), material, parent, 78, 16, [1, .8]);
    }
  }
  if (id === 'legolas') for (const s of [-1, 1]) for (let strand = 0; strand < 3; strand++) {
    const ps = []; for (let j = 0; j <= 60; j++) { const t = j / 60, a = t * TAU * 11 + strand * TAU / 3; ps.push([s * (.363 + Math.sin(a) * .009), y0 + .24 - t * .99, -.03 + Math.cos(a) * .009]); }
    sweep(ps, v => .007 * (1 - .35 * v), material, parent, 90, 7);
  }
}

function hand(c, origin, side, parent) {
  const { m, sphere, sweep } = c, [x, y, z] = origin;
  sphere(.13, m.skin, origin, [.73, 1.20, .5], parent, 64, 48);
  for (let i = 0; i < 4; i++) { const fx = x + (i - 1.5) * .046, length = .15 + (1 - Math.abs(i - 1.5) / 2) * .038;
    sweep([[fx, y - .05, z + .045], [fx + side * .009, y - length * .65, z + .057], [fx + side * .004, y - length - .036, z + .035]], v => .023 * (1 - v * .31), m.skin, parent, 30, 14);
    sphere(.017, m.bone, [fx + side * .004, y - length - .006, z + .052], [.75, 1, .15], parent, 24, 16);
    for (let k = 0; k < 2; k++) sweep([[fx - .013, y - length * (.32 + k * .32), z + .055], [fx + .013, y - length * (.33 + k * .32), z + .055]], () => .0015, m.lip, parent, 8, 4);
  }
  sweep([[x - side * .075, y + .008, z], [x - side * .135, y - .043, z + .06], [x - side * .106, y - .114, z + .052]], v => .031 * (1 - .22 * v), m.skin, parent, 36, 14);
}

function leafBrooch(c, pos, parent, size = 1) {
  const shape = new THREE.Shape(); shape.moveTo(0, -.105); shape.bezierCurveTo(-.09, -.04, -.07, .07, .025, .14); shape.bezierCurveTo(.092, .025, .067, -.036, 0, -.105);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: .012, bevelEnabled: true, bevelSize: .004, bevelThickness: .004, bevelSegments: 3, curveSegments: 24 });
  const o = c.mesh(geo, c.m.silver, pos, [size, size, size], parent); o.rotation.z = -.25;
  c.sweep([[pos[0], pos[1] - .08 * size, pos[2] + .018], [pos[0] + .01 * size, pos[1], pos[2] + .018], [pos[0] + .028 * size, pos[1] + .11 * size, pos[2] + .018]], () => .002, c.m.green, parent, 32, 5);
}

function leafEmbroidery(c, parent, color, x, y, z, size = .1, tilt = 0) {
  const ps = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU, sx = Math.sin(a) * size * .36, sy = Math.cos(a) * size; ps.push([x + sx * Math.cos(tilt) - sy * Math.sin(tilt), y + sx * Math.sin(tilt) + sy * Math.cos(tilt), z + Math.sin(a) ** 2 * .006]); }
  c.sweep(ps, () => .0035, color, parent, 32, 5);
}

function elf(id) {
  const c = sculptContext(id === 'legolas' ? 171 : 172), { group, m, rnd, cylinder, mesh, sphere, sweep, torus, clothSurface } = c;
  group.name = id === 'legolas' ? 'Legolas — elven archer sculpture' : 'Elrond — master of Rivendell sculpture';
  c.base(3.25, .62); const figure = new THREE.Group(); group.add(figure); const lord = id === 'elrond';
  const body = lord ? m.blue : m.green;
  // A slim, human-proportioned elf: head height is less than one eighth of the
  // standing figure. Fitted volumes overlap at joints and cloth covers seams.
  for (const s of [-1, 1]) {
    sweep([[s * .28, 3.12, -.01], [s * .31, 2.15, .03], [s * .29, 1.14, .03], [s * .30, .50, .045]], v => .18 + .045 * Math.sin(v * Math.PI) - .045 * v, lord ? m.grey : m.darkLeather, figure, 82, 40, [1, .85]);
    const bootGeo = new THREE.SphereGeometry(.24, 56, 40), bp = bootGeo.attributes.position;
    for (let i = 0; i < bp.count; i++) { const x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i); bp.setXYZ(i, x * .76, Math.max(-.15, y * .6), z * 1.65 + .11 * clamp(z / .24, 0, 1)); }
    bootGeo.computeVertexNormals(); mesh(bootGeo, m.darkLeather, [s * .3, .28, .19], undefined, figure);
    if (!lord) { cylinder(.153, .17, .95, m.leather, [s * .30, .75, .04], figure, 56); for (let i = 0; i < 8; i++) sweep([[s * .30 - .10, .50 + i * .08, .16], [s * .30 + .10, .54 + i * .08, .16]], () => .006, m.darkLeather, figure, 12, 6); }
  }
  clothSurface(lord ? [[1.0, .21], [.91, .70], [.76, 2.05], [.55, 3.22], [.57, 3.9], [.72, 4.43], [.58, 4.63], [.23, 4.83]] : [[.66, 2.58], [.60, 2.87], [.49, 3.22], [.53, 3.92], [.68, 4.39], [.56, 4.59], [.20, 4.78]], body, figure, { folds: lord ? 25 : 19, depth: .71, fullness: lord ? .041 : .018 });
  if (lord) {
    clothSurface([[1.05, .23], [.97, .75], [.82, 2.10], [.65, 3.4], [.75, 4.45], [.39, 4.81]], m.grey, figure, { start: .74, arc: TAU - 1.48, depth: .73, offset: [0, 0, -.05], folds: 27, fullness: .042 });
    // Actual narrow woven trim with repeated leaf embroidery down the front.
    for (const s of [-1, 1]) {
      surface((u, v) => { const y = mix(.25, 4.76, v), x = s * mix(.55, .19, v), z = .35 + Math.sin(v * Math.PI) * .074; return [x + (u - .5) * .095, y, z + Math.sin(u * Math.PI) * .006]; }, 12, 100, m.blue, figure, .008);
      for (let j = 0; j < 31; j++) { const t = j / 30; leafEmbroidery(c, figure, m.gold, s * mix(.55, .19, t), mix(.33, 4.7, t), .36 + Math.sin(t * Math.PI) * .074, .058, s * .35); }
    }
    for (let j = 0; j < 26; j++) leafEmbroidery(c, figure, m.silver, Math.sin(j / 25 * TAU) * 1.00, .30, Math.cos(j / 25 * TAU) * .73, .05);
  } else {
    clothSurface([[.83, .45], [.86, 1.03], [.76, 2.60], [.65, 3.48], [.71, 4.42], [.32, 4.76]], m.paleGreen, figure, { start: .90, arc: TAU - 1.8, folds: 23, depth: .81, offset: [0, 0, -.16], fullness: .038 });
    for (const s of [-1, 1]) sweep([[s * .24, 4.72, .18], [s * .20, 4.43, .44], [s * .08, 3.9, .39], [s * .17, 3.28, .38], [s * .34, 2.70, .35]], () => .011, m.leather, figure, 78, 10);
    for (let j = 0; j < 12; j++) for (const s of [-1, 1]) leafEmbroidery(c, figure, m.paleGreen, s * (.20 + Math.sin(j / 11 * Math.PI) * .15), 3.42 + j * .095, .393, .058, s * .62);
    sweep([[-.49, 3.18, 0], [-.35, 3.2, .35], [0, 3.2, .405], [.35, 3.2, .35], [.49, 3.18, 0]], () => .045, m.leather, figure, 76, 12); c.box(.13, .13, .026, m.silver, [0, 3.20, .45], figure);
    const strap = []; for (let j = 0; j <= 25; j++) { const t = j / 25; strap.push([mix(-.55, .50, t), mix(4.35, 3.18, t), .39 + Math.sin(t * Math.PI) * .05]); } sweep(strap, () => .037, m.leather, figure, 72, 12, [1, .35]);
  }
  const palms = [];
  for (const s of [-1, 1]) {
    const arm = [[s * .61, 4.42, 0], [s * .78, 3.98, .02], [s * .88, 3.58, .15], [s * .84, 3.20, .23]];
    sweep(arm, v => .19 * (1 - .25 * v) + .009 * Math.sin(v * 34) ** 2, lord ? m.grey : body, figure, 96, 44, [1, .91]);
    if (lord) {
      sweep([[s * .77, 3.98, .01], [s * .83, 3.66, .06], [s * .86, 3.25, .2]], v => .20 + .16 * v, m.grey, figure, 76, 40, [1, .83]);
      for (let j = 0; j < 10; j++) leafEmbroidery(c, figure, m.gold, s * .89 + (j % 2 - .5) * .14, 3.30 + Math.floor(j / 2) * .075, .435, .045, s * .4);
    } else sweep([[s * .86, 3.71, .125], [s * .85, 3.41, .21], [s * .84, 3.22, .23]], v => .161 - .022 * v, m.leather, figure, 64, 40, [1, .93]);
    const palm = [s * .85, 3.13, .25]; palms.push(palm); hand(c, palm, s, figure);
  }
  const headY = elfFace(c, id, figure); longElfHair(c, id, headY, figure);
  if (lord) {
    // Pale gold highlights sit on a silver diadem, matching the book's metal.
    const band = []; for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU; band.push([Math.sin(a) * .347, 5.68 + Math.cos(a) * .012, Math.cos(a) * .344]); }
    sweep(band, () => .016, m.silver, figure, 120, 12);
    for (const s of [-1, 1]) { sweep([[s * .29, 5.68, .20], [s * .16, 5.67, .313], [s * .056, 5.61, .348], [0, 5.66, .359]], () => .012, m.gold, figure, 68, 10); sweep([[s * .13, 5.685, .323], [s * .075, 5.75, .337], [0, 5.72, .354]], () => .008, m.silver, figure, 48, 9); }
    sphere(.028, m.silver, [0, 5.67, .369], [.77, 1.25, .48], figure, 32, 24);
    const ring = torus(.027, .007, m.gold, [.871, 2.978, .301], figure); ring.rotation.x = Math.PI / 2;
    const sapphire = c.mat('#397baa', .12, .4, { emissive: '#183c58', emissiveIntensity: .08 }); sphere(.019, sapphire, [.871, 2.979, .323], [.8, .8, .55], figure, 32, 24);
    leafBrooch(c, [0, 4.67, .30], figure, .64);
  } else {
    leafBrooch(c, [0, 4.65, .285], figure, .77);
    // A long curved bow and taut single string; arrows are complete shafts,
    // points and feather vanes, with two white film knives at the quiver.
    const bow = [[-1.13, .92, .30], [-1.45, 1.53, .27], [-1.35, 2.33, .29], [-1.0, 3.14, .30], [-1.32, 3.98, .28], [-1.40, 4.75, .29], [-1.10, 5.34, .30]];
    sweep(bow, v => .035 + Math.sin(v * Math.PI) * .033, m.wood, figure, 132, 24, [1, .80]);
    sweep([bow[0], [-1.106, 3.13, .301], bow[6]], () => .005, m.bone, figure, 92, 6);
    for (let j = 0; j < 12; j++) sweep([[-1.051, 2.96 + j * .031, .35], [-.965, 2.975 + j * .031, .33]], () => .009, m.darkLeather, figure, 14, 6);
    const quiver = new THREE.Group(); quiver.position.set(.34, 3.81, -.36); quiver.rotation.z = -.25; quiver.rotation.x = -.12; figure.add(quiver);
    cylinder(.21, .17, 1.47, m.leather, [0, -.2, 0], quiver, 64); const rim = torus(.213, .021, m.silver, [0, .54, 0], quiver); rim.rotation.x = Math.PI / 2;
    for (let j = 0; j < 15; j++) { const a = j * 2.39996, rad = Math.sqrt((j + .5) / 15) * .17, x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      sweep([[x, -.76, z], [x, .94 + (j % 3) * .035, z]], () => .012, m.wood, quiver, 32, 8);
      for (let f = 0; f < 3; f++) { const feather = new THREE.Shape(); feather.moveTo(0, 0); feather.bezierCurveTo(.075, .01, .070, .19, 0, .23); feather.lineTo(0, 0); const fg = new THREE.ExtrudeGeometry(feather, { depth: .003, bevelEnabled: false, curveSegments: 8 }); const fm = mesh(fg, m.bone, [x, .61 + (j % 3) * .035, z], undefined, quiver); fm.rotation.y = f * TAU / 3; }
    }
    for (const s of [-1, 1]) { const knife = new THREE.Group(); knife.position.set(s * .29, 4.33, -.51); knife.rotation.z = s * .32; figure.add(knife); c.box(.09, 1.12, .055, m.darkLeather, [0, -.35, 0], knife); cylinder(.032, .032, .30, m.bone, [0, .39, 0], knife, 24); c.box(.22, .04, .07, m.silver, [0, .20, 0], knife); sphere(.044, m.silver, [0, .575, 0], undefined, knife, 32, 24); }
  }
  for (let i = 0; i < 22; i++) { const a = i * 2.39996, r = 2.35 + rnd() * .5; leafEmbroidery(c, group, m.leaf, Math.cos(a) * r, .092, Math.sin(a) * r, .08); }
  batch(figure); figure.userData.dynamic = true; figure.rotation.y = -.12; batch(group);
  const tour = lord ? [
    { title: 'Gospodarz Imladris', position: [7, 4.5, 10], target: [0, 3.10, 0], text: 'Pełna sylwetka: długa szata, płaszcz, wysmukłe proporcje i wykończenie tkaniny.' },
    { title: 'Pamięć wielu epok', position: [1.8, 5.7, 3.25], target: [0, 5.43, 0], text: 'Ciągła rzeźba twarzy, szare oczy, elfickie uszy oraz jasny diadem.' },
    { title: 'Vilya i sploty', position: [2.5, 3.6, 3.8], target: [.5, 3.33, .15], text: 'Drobny pierścień, ornament i fałdy materiału prowadzą ku ukrytej potędze Elronda.' },
  ] : [
    { title: 'Łucznik Puszczy', position: [7, 4.8, 10], target: [0, 3, 0], text: 'Zielono-brązowy strój, długi łuk i wysmukła postawa elfickiego zwiadowcy.' },
    { title: 'Wzrok elfów', position: [1.7, 5.7, 3.2], target: [0, 5.42, 0], text: 'Modelowane oczodoły i powieki, długie pasma włosów i spiczaste uszy.' },
    { title: 'Kołczan i białe noże', position: [-4.6, 5.6, -5], target: [0, 4.2, -.2], text: 'Pióra strzał, kołczan oraz dwa noże należą do filmowej interpretacji wyposażenia.' },
  ];
  return { group, camera: [8, 5, 11], target: [0, 3, 0], fog: '#737d79', background: '#a3afa5', sun: [-7, 12, 8], tours:tour, animate: t => { figure.rotation.y = -.12 + Math.sin(t * .17) * .012; figure.scale.y = 1 + Math.sin(t * .7) * .0014; } };
}

function scaleGeometry() {
  // A real raised shield with a six-sided rim, closed back and thickness.
  const outline = [[0, .57], [.38, .20], [.35, -.29], [0, -.5], [-.35, -.29], [-.38, .20]], positions = [0, .015, .105], indices = [];
  for (const [x, y] of outline) positions.push(x, y, .014);
  positions.push(0, .015, -.012); for (const [x, y] of outline) positions.push(x, y, -.012);
  for (let i = 0; i < 6; i++) { const a = i + 1, b = (i + 1) % 6 + 1, aa = a + 7, bb = b + 7; indices.push(0, b, a, 7, aa, bb, a, b, aa, b, bb, aa); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setIndex(indices); geo.computeVertexNormals(); return geo;
}

function scalesOn(fn, nu, nv, material, parent, rnd, width, length, filter = null) {
  const geo = scaleGeometry(), capacity = nu * nv, inst = new THREE.InstancedMesh(geo, material, capacity), dummy = new THREE.Object3D(), basis = new THREE.Matrix4(), color = new THREE.Color(); let count = 0;
  for (let v = 0; v < nv; v++) for (let u = 0; u < nu; u++) {
    const uu = ((u + .5 * (v % 2)) / nu) % 1, vv = (v + .5) / nv; if (filter && !filter(uu, vv)) continue;
    const p = V(...fn(uu, vv)), du = V(...fn((uu + .0003) % 1, vv)).sub(p).normalize(), dv = V(...fn(uu, Math.min(.99999, vv + .0003))).sub(p).normalize();
    const n = du.clone().cross(dv).normalize(); dv.copy(n).cross(du).normalize(); basis.makeBasis(du, dv, n); dummy.position.copy(p).addScaledVector(n, .009); dummy.quaternion.setFromRotationMatrix(basis); dummy.scale.set(width, length, width * .62); dummy.updateMatrix(); inst.setMatrixAt(count, dummy.matrix);
    color.setRGB(.83 + rnd() * .22, .78 + rnd() * .21, .68 + rnd() * .25); inst.setColorAt(count++, color);
  }
  inst.count = count; inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true; inst.castShadow = inst.receiveShadow = true; inst.name = `${count} individual overlapping scales`; parent.add(inst); return inst;
}

function wing(c, side, parent, scaleMat, membrane) {
  const { m, sweep } = c, g = new THREE.Group(); g.position.set(side * 1.43, 5.15, .3); g.scale.x = side; parent.add(g);
  const wrist = [5.25, 2.6, 1.10], elbow = [2.8, 1.65, -.15];
  sweep([[0, 0, 0], [1.4, .45, -.1], elbow, wrist], v => .44 * (1 - .58 * v), scaleMat, g, 104, 36, [1, .92]);
  const tips = [[12.3, 3.3, 4.2], [12.5, 2.7, -.2], [10.5, 1.7, -4.7], [7.3, .45, -8.1], [3.3, -.35, -7.5], [.18, -1.22, -4.1]];
  const curves = tips.map((p, i) => new THREE.QuadraticBezierCurve3(V(...wrist), V(mix(wrist[0], p[0], .52), mix(wrist[1], p[1], .55) + .42, mix(wrist[2], p[2], .5)), V(...p)));
  for (let i = 0; i < curves.length - 1; i++) {
    const a = curves[i], b = curves[i + 1];
    const fn = (u, v) => { const p = a.getPoint(v).lerp(b.getPoint(v), u), sag = Math.sin(u * Math.PI) * v ** 1.8;
      p.y -= sag * (.7 + i * .13); p.y += Math.sin(v * 24 + u * 14) * .034 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI); p.z += Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * .12; return p.toArray(); };
    const sheet = surface(fn, 44, 54, membrane, g, .025); sheet.name = 'Curved, thick wing membrane';
    // The membrane has thickness, curved scallops and branching veins, rather
    // than a flat triangle stretched between three points.
    for (let j = 1; j < 6; j++) { const ps = []; for (let k = 0; k <= 28; k++) { const v = .16 + k / 28 * .82, u = j / 6 + Math.sin(v * 5 + j) * .025; const p = V(...fn(u, v)); p.y += .022; ps.push(p.toArray()); } sweep(ps, v => .017 * (1 - .55 * v), scaleMat, g, 36, 6); }
    const edge = []; for (let j = 0; j <= 44; j++) edge.push(fn(j / 44, .997)); sweep(edge, () => .045, scaleMat, g, 66, 10);
  }
  for (let i = 0; i < curves.length - 1; i++) { const ps = []; for (let j = 0; j <= 48; j++) ps.push(curves[i].getPoint(j / 48).toArray()); sweep(ps, v => (.115 - .057 * v) * (i === 0 ? 1.5 : 1), scaleMat, g, 84, 20); }
  for (let i = 0; i < 3; i++) sweep([[wrist[0] - .1 + i * .16, wrist[1] + .1, wrist[2] + .05], [wrist[0] + .18 + i * .13, wrist[1] + .64, wrist[2] + .37], [wrist[0] + .34 + i * .10, wrist[1] + .54, wrist[2] + .69]], v => .095 * (1 - v * .93), m.bone, g, 52, 14);
  batch(g); g.userData.dynamic = true; return g;
}

function dragon() {
  const c = sculptContext(173), { group, m, rnd, mat, mesh, sphere, sweep, cylinder, box } = c;
  group.name = 'Smaug — cinematic four-limbed dragon on the treasure of Erebor'; c.base(17.5, 1.15);
  const skin = mat('#883c29', .54, .18, { bumpMap: m.leather.bumpMap, bumpScale: .018 }), armor = mat('#a15130', .43, .38), copper = mat('#bc7543', .40, .36), bellyMat = mat('#b88851', .43, .44), membrane = mat('#6b3025', .73, .09, { side: THREE.DoubleSide, bumpMap: m.leather.bumpMap, bumpScale: .022 }), horn = mat('#67594a', .55, .12), mouthMat = mat('#241719', .60), gumMat = mat('#78443b', .68);
  const mound = (x, z) => .15 + .60 * Math.exp(-(x * x + (z - 1) ** 2) / 92) + .16 * Math.sin(x * .6) * Math.cos(z * .4);
  surface((u, v) => { const a = u * TAU, r = v * 15.6, x = Math.cos(a) * r, z = Math.sin(a) * r; return [x, mound(x, z), z]; }, 144, 92, m.gold, group);
  const coinGeo = new THREE.CylinderGeometry(.078, .078, .016, 10), coins = new THREE.InstancedMesh(coinGeo, m.gold, 1950), dummy = new THREE.Object3D();
  for (let i = 0; i < 1950; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 15.2, x = Math.cos(a) * r, z = Math.sin(a) * r; dummy.position.set(x, mound(x, z) + rnd() * .18, z); dummy.rotation.set((rnd() - .5) * .6, rnd() * TAU, (rnd() - .5) * .6); const s = .85 + rnd() * .8; dummy.scale.set(s, 1, s); dummy.updateMatrix(); coins.setMatrixAt(i, dummy.matrix); } coins.castShadow = coins.receiveShadow = true; coins.name = '1950 individual gold coins'; group.add(coins);
  // Geometric Dwarven masonry frames the creature without covering its wings.
  for (const s of [-1, 1]) {
    box(1.18, 7.8, 1.12, m.darkStone, [s * 8.1, 3.9, -11], group); box(1.60, .40, 1.55, m.stone, [s * 8.1, .30, -11], group);
    for (let j = 0; j < 6; j++) box(1.35, .12, 1.3, m.stone, [s * 8.1, 1.1 + j * 1.14, -11], group);
    const top = box(6.0, 1.0, 1.20, m.darkStone, [s * 4.33, 9.27, -11], group); top.rotation.z = -s * .41;
    for (let j = 0; j < 10; j++) { const y = 1.2 + j * .58; sweep([[s * 8.1 - .16, y, -10.42], [s * 8.1, y + .18, -10.4], [s * 8.1 + .16, y, -10.42]], () => .013, m.gold, group, 12, 5); }
  }
  box(2.5, 1.3, 1.3, m.stone, [0, 10.24, -11], group);
  const dragonBody = new THREE.Group(); group.add(dragonBody);
  const bodyFn = (u, v) => { const a = u * TAU, z = mix(-6.8, 3.30, v), bulge = Math.sin(v * Math.PI) ** .75, r = .60 + 1.78 * bulge, y = 3.8 + .30 * Math.sin(v * Math.PI); return [Math.cos(a) * r, y + Math.sin(a) * r * .79, z]; };
  surface(bodyFn, 152, 130, skin, dragonBody); scalesOn(bodyFn, 64, 54, armor, dragonBody, rnd, .235, .27, (u, v) => v > .045 && v < .955);
  const neckData = sweepFunction([[0, 4.10, 3.22], [.04, 5.55, 4.04], [.38, 7.53, 4.79], [.70, 9.0, 6.25], [1.02, 9.12, 8.0]], v => .89 - .32 * v + .11 * Math.sin(v * Math.PI), 142, [1, .95]);
  surface(neckData.fn, 88, 142, skin, dragonBody); scalesOn(neckData.fn, 36, 40, copper, dragonBody, rnd, .18, .26);
  const tailData = sweepFunction([[0, 3.5, -6.6], [-2.2, 2.5, -8.5], [-7.0, 1.20, -8.2], [-11, .95, -3.2], [-10, .92, 4.2], [-5.1, 1.02, 8.5], [-1.7, 1.08, 8.35]], v => .72 * (1 - v) ** .73 + .025, 160, [1, .86]);
  const tail = new THREE.Group(); dragonBody.add(tail); surface(tailData.fn, 68, 160, skin, tail); scalesOn(tailData.fn, 30, 58, armor, tail, rnd, .12, .26);
  for (let j = 0; j < 40; j++) { const t = j / 42, p = tailData.curve.getPoint(t); sweep([[p.x, p.y + .62 * (1 - t), p.z], [p.x, p.y + .95 * (1 - t) + .1, p.z - .16], [p.x, p.y + 1.09 * (1 - t) + .10, p.z - .34]], v => .07 * (1 - v * .97) * (1 - t * .68), horn, tail, 28, 10); }
  for (const s of [-1, 1]) {
    const hip = [s * 1.61, 3.5, -3.8], knee = [s * 3.12, 1.75, -2.20], ankle = [s * 2.82, .84, .15];
    const legData = sweepFunction([hip, [s * 2.30, 2.8, -3.1], knee, [s * 2.87, 1.23, -.70], ankle], v => .77 * (1 - .55 * v) + .12 * Math.sin(v * Math.PI), 94, [1, .82]);
    surface(legData.fn, 48, 94, skin, dragonBody); scalesOn(legData.fn, 20, 25, armor, dragonBody, rnd, .17, .19);
    for (let j = 0; j < 4; j++) { const x = s * 2.83 + (j - 1.5) * .30;
      sweep([[x, .93, .08], [x + s * .035, .51, .64], [x + s * .015, .38, 1.24]], v => .15 * (1 - .45 * v), skin, dragonBody, 56, 16);
      sweep([[x + s * .015, .39, 1.22], [x + s * .055, .40, 1.64], [x + s * .085, .30, 1.94]], v => .11 * (1 - v * .98), m.bone, dragonBody, 50, 14);
    }
  }
  // Throat and chest armor form separate curved plates, rather than painted
  // rectangles. A small missing patch alludes to Bilbo's discovery.
  for (let j = 0; j < 25; j++) { const t = j / 25, point = neckData.curve.getPoint(t), center = point.clone().add(V(0, -.2, .60 - t * .12));
    surface((u, v) => { const a = (u - .5) * Math.PI * .80, width = .68 - t * .19, yy = (v - .5) * .28; return [center.x + Math.sin(a) * width, center.y + yy - Math.cos(a) * .05, center.z + Math.cos(a) * .16]; }, 28, 9, bellyMat, dragonBody, .035);
  }
  for (let j = 0; j < 12; j++) { const z = mix(-3.5, 2.1, j / 11); surface((u, v) => { const a = (u - .5) * Math.PI, width = 1.62 + Math.sin(j / 11 * Math.PI) * .4; return [Math.sin(a) * width, 2.20 - Math.cos(a) * .22 + v * .10, z + (v - .5) * .51]; }, 36, 10, bellyMat, dragonBody, .05); }
  for (let j = 0; j < 22; j++) { const z = mix(-5.9, 2.8, j / 21), h = 5.6 + .27 * Math.sin(j / 21 * Math.PI); sweep([[0, h, z], [0, h + .60, z - .18], [0, h + .70, z - .39]], v => .13 * (1 - v * .98), horn, dragonBody, 32, 12); }
  const head = new THREE.Group(); head.position.set(1.02, 9.12, 7.65); dragonBody.add(head);
  const headFn = (u, v) => { const a = u * TAU, z = mix(-.43, 3.16, v), width = .41 + .57 * Math.exp(-(((v - .31) / .27) ** 2)) - .11 * v, height = .35 + .23 * Math.exp(-(((v - .23) / .25) ** 2)) - .09 * v;
    let x = Math.cos(a) * width, y = Math.sin(a) * height - .11 * v; y += .085 * Math.sin(v * 18) ** 2 * Math.max(0, Math.sin(a)); return [x, y, z]; };
  surface(headFn, 112, 98, skin, head); scalesOn(headFn, 26, 27, copper, head, rnd, .13, .15, (u, v) => v < .83 && !(u > .36 && u < .60));
  const lowerFn = (u, v) => { const a = u * TAU, width = .69 * (1 - .47 * v), y = -.63 + .14 * v; return [Math.cos(a) * width, y + Math.sin(a) * .18, mix(.30, 3.16, v)]; };
  surface(lowerFn, 76, 82, skin, head);
  surface((u, v) => [mix(-.51, .51, u) * (1 - .40 * v), -.435 + .12 * v, mix(.38, 3.03, v)], 34, 64, mouthMat, head, .03);
  sweep([[-.38, -.33, 2.74], [0, -.22, 2.90], [.38, -.33, 2.74]], () => .05, gumMat, head, 44, 14);
  sweep([[-.35, -.49, 2.81], [0, -.40, 2.96], [.35, -.49, 2.81]], () => .045, gumMat, head, 44, 14);
  const eyeMat = mat('#f3b532', .15, .25, { emissive: '#d86519', emissiveIntensity: .42 }), pupilMat = mat('#11100d', .22), eyes = [];
  for (const s of [-1, 1]) {
    const eye = sphere(.185, eyeMat, [s * .86, .16, .79], [.43, .75, 1], head, 64, 48); eye.rotation.y = s * .35; eyes.push(eye);
    const pupil = sphere(.08, pupilMat, [s * .925, .175, .84], [.22, 1.25, .63], head, 40, 32); pupil.rotation.y = s * .35;
    sweep([[s * .86, .32, .60], [s * .96, .35, .79], [s * .88, .285, 1.03]], () => .076, skin, head, 54, 18);
    sweep([[s * .83, .017, .65], [s * .93, .001, .82], [s * .83, .04, 1.02]], () => .035, skin, head, 48, 12);
    sphere(.038, m.black, [s * .278, .052, 2.91], [.6, .52, 1], head, 32, 24);
    sweep([[s * .39, .64, -.17], [s * .62, .94, -.65], [s * .80, 1.28, -1.25], [s * .74, 1.43, -1.81]], v => .21 * (1 - v * .96), horn, head, 88, 20);
    sweep([[s * .82, .34, -.05], [s * 1.15, .42, -.55], [s * 1.23, .34, -.96]], v => .12 * (1 - v * .97), horn, head, 58, 16);
    for (let j = 0; j < 20; j++) { const t = j / 19, z = .66 + t * 2.29, x = s * (.62 - t * .30), long = j % 4 === 0 ? .32 : .17;
      sweep([[x, -.27, z], [x * .97, -.27 - long * .55, z + .04], [x * .94, -.27 - long, z + .08]], v => .047 * (1 - v * .98), m.bone, head, 24, 10);
      sweep([[x * .91, -.49, z], [x * .91, -.41, z + .018], [x * .89, -.33, z + .04]], v => .034 * (1 - v * .98), m.bone, head, 20, 9);
    }
    for (let j = 0; j < 6; j++) sweep([[s * .69, .37, .09 + j * .14], [s * (1.05 + j * .026), .61 - j * .034, -.23 + j * .08], [s * (1.21 + j * .031), .56 - j * .034, -.49 + j * .08]], v => .062 * (1 - v * .98), horn, head, 28, 10);
  }
  sweep([[0, .46, 1.05], [0, .70, .55], [0, .92, -.10]], v => .09 * (1 - v * .97), horn, head, 52, 14);
  const wings = [wing(c, -1, dragonBody, skin, membrane), wing(c, 1, dragonBody, skin, membrane)];
  batch(tail); tail.userData.dynamic = true; batch(head); head.userData.dynamic = true; batch(dragonBody); dragonBody.userData.dynamic = true; batch(group);
  const tour = [
    { title: 'Smaug nad skarbem', position: [25, 14, 30], target: [0, 5, 0], text: 'Wielki smok w Ereborze: długi korpus, zwinięty ogon, dwie nogi i skrzydła jako przednie kończyny.' },
    { title: 'Rozmowa w ciemności', position: [9, 11.8, 18], target: [1.0, 9.15, 9.2], text: 'Rogaty pysk, łuski, pionowe źrenice oraz zakrzywione kły z oddzielną szczęką.' },
    { title: 'Błona i łuski', position: [-22, 12, 2], target: [-7, 6.1, -1], text: 'Zakrzywione błony mają grubość i żyłki; tysiące osobnych łusek łapią światło na grzbiecie i ogonie.' },
  ];
  return { group, camera: [25, 14, 30], target: [0, 5, 0], fog: '#242c2b', background: '#3b4641', sun: [-12, 20, 16], tours:tour, animate: t => { const breath = Math.sin(t * .57); dragonBody.scale.y = 1 + breath * .0022; wings[0].rotation.z = -.022 + breath * .011; wings[1].rotation.z = .022 - breath * .011; head.rotation.x = Math.sin(t * .31) * .008; tail.rotation.y = Math.sin(t * .24) * .003; } };
}

export function buildExtraCharacter(id) {
  if (id === 'legolas' || id === 'elrond') return elf(id);
  if (id === 'smaug') return dragon();
  throw new Error(`Unknown extra character: ${id}`);
}

export const extraCharacters = [
  {
    id: 'legolas', title: 'Legolas', subtitle: 'Syn Thranduila · łucznik Drużyny',
    summary: 'Wysłannik leśnego króla, którego wzrok, lekkość kroku i łuk wspierają wyprawę. Jego przyjaźń z Gimlim zmienia dawne uprzedzenia w wierność.',
    history: ['Przybywa na Radę Elronda z wiadomością o ucieczce Golluma i reprezentuje elfy w Drużynie. Po jej rozpadzie towarzyszy Aragornowi i Gimliemu w pościgu za porywaczami hobbitów.', 'Walczy w Rohanie i Gondorze. Po wojnie pomaga odnowić Ithilien; później buduje okręt i odpływa na Zachód, zabierając według przekazu także Gimlego.'],
    facts: ['Książka opisuje zielono-brązowy ubiór, łuk i długi biały nóż.', 'Blond włosy i para białych noży należą do filmowego wizerunku wykorzystanego w rzeźbie.', 'Legolas jest synem Thranduila; nie występuje w książkowym Hobbicie.'],
    storyboard: [{ title: 'Wysłannik', text: 'Przybysz z leśnego królestwa przynosi wiadomość, która dotyczy losu Pierścienia.' }, { title: 'Przyjaźń', text: 'Wspólna droga z Gimlim otwiera możliwość rozmowy ponad dawną krzywdą.' }, { title: 'Morze', text: 'Wołanie Zachodu wraca, gdy wojna już przemija. Odnowiony ogród Ithilien pozostaje jego śladem.' }],
    sources: [{ title: 'Legolas — opis i przypisy do Władcy Pierścieni', url: 'https://tolkiengateway.net/wiki/Legolas' }, { title: 'Wētā Workshop — oficjalny filmowy wizerunek Legolasa', url: 'https://www.wetanz.com/us/legolas-greenleaf' }],
  },
  {
    id: 'elrond', title: 'Elrond', subtitle: 'Półelf · gospodarz Imladris · strażnik Vilyi',
    summary: 'Mądrość Elronda łączy pamięć dawnych wojen z troską o tych, którzy dopiero wyruszą. Jego dom staje się schronieniem i miejscem podjęcia najtrudniejszej decyzji.',
    history: ['Syn Eärendila i Elwingi wybiera los elfów. W Drugiej Erze zakłada Imladris jako schronienie przed Sauronem; pozostaje opiekunem wiedzy i spadkobierców Isildura.', 'Odczytuje księżycowe litery na mapie Thorina. Później przewodniczy radzie rozstrzygającej los Jedynego Pierścienia; po zwycięstwie odpływa ze Śródziemia.'],
    facts: ['Książka wymienia ciemne włosy, szare oczy i srebrny diadem.', 'Vilya jest jednym z Trzech Pierścieni Elfów.', 'Elrond jest ojcem Arwen, Elladana i Elrohira; jego brat Elros wybrał życie śmiertelnika.'],
    storyboard: [{ title: 'Schronienie', text: 'W głębokiej dolinie powstaje dom dla wygnańców, pamięci i pieśni.' }, { title: 'Rada', text: 'Gospodarz słucha głosów różnych ludów. Odpowiedź zależy od wspólnej wiedzy i odwagi małego powiernika.' }, { title: 'Odejście', text: 'Pokój nadchodzi razem z końcem elfickiego czasu. Elrond zostawia ukochaną dolinę ludziom.' }],
    sources: [{ title: 'Elrond — biografia, wygląd i książkowe przypisy', url: 'https://tolkiengateway.net/wiki/Elrond' }, { title: 'Tolkien Estate — Rivendell na ilustracjach autora', url: 'https://www.tolkienestate.com/painting/the-hobbit/' }],
  },
  {
    id: 'smaug', title: 'Smaug', subtitle: 'Smok Ereboru · strażnik zagarniętego skarbu',
    summary: 'Ogień i przenikliwy umysł strzegą bogactwa Samotnej Góry. Smaug widzi w Bilbie zagadkę, a w swoim skarbie miarę własnej niepodważalnej potęgi.',
    history: ['W 2770 roku zajmuje Erebor i niszczy Dale, wypędzając krasnoludy oraz ludzi. Przez wiele pokoleń jego obecność zamyka drogę do Królestwa pod Górą.', 'W 2941 Bilbo rozmawia z nim wśród skarbu i dostrzega słabość pancerza. Smok rusza przeciw Esgaroth, gdzie Bard trafia w odsłonięte miejsce i kończy jego panowanie.'],
    facts: ['Ilustracje Tolkiena pokazują czerwonego, długiego smoka i ogromną komorę skarbu.', 'Rekonstrukcja korzysta z dojrzałego projektu filmowego: dwie tylne nogi i dwa skrzydła pełniące rolę przednich kończyn.', 'Rysunek autora i wersja filmowa różnią się anatomią; nie są jednym projektem.'],
    storyboard: [{ title: 'Skarb', text: 'Bogactwo pokrywa podłogę sali. Smok zna je na pamięć, lecz nie dostrzega małego intruza.' }, { title: 'Zagadka', text: 'Bilbo mówi obrazami, Smaug odpowiada pychą. Uważna obserwacja przynosi wiadomość o jego słabości.' }, { title: 'Ostatni lot', text: 'Ogień spada na miasto, a pojedyncza strzała otwiera nowy rozdział losów Północy.' }],
    sources: [{ title: 'Tolkien Estate — Conversation with Smaug oraz Death of Smaug', url: 'https://www.tolkienestate.com/painting/the-hobbit/' }, { title: 'Wētā FX — Smaug, budowa i animacja filmowego smoka', url: 'https://www-ext.wetafx.co.nz/films/case-studies/smaug' }, { title: 'Smaug — książkowa biografia i przypisy', url: 'https://tolkiengateway.net/wiki/Smaug' }],
  },
];
