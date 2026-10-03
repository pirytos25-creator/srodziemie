import * as THREE from 'three';

/* Interpretive, handmade dioramas of Middle-earth. Every mesh and texture is
 * created here: no downloaded models, remote fonts or image dependencies. */
const TAU = Math.PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const mix = (a, b, t) => a + (b - a) * t;
function random(seed = 1189) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function texture(kind, color, seed = 15) {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const ctx = c.getContext('2d'); const rnd = random(seed);
  ctx.fillStyle = color; ctx.fillRect(0, 0, 512, 512);
  if (kind === 'wood') {
    for (let x = 0; x < 512; x += 3) {
      ctx.strokeStyle = `rgba(${rnd() > .5 ? '0,0,0' : '255,223,172'},${rnd() * .22})`;
      ctx.lineWidth = .5 + rnd() * 2; ctx.beginPath(); ctx.moveTo(x, 0);
      for (let y = 0; y <= 512; y += 12) ctx.lineTo(x + Math.sin(y / (40 + rnd() * 30)) * 3, y);
      ctx.stroke();
    }
    for (let x = 0; x < 512; x += 64) { ctx.strokeStyle = 'rgba(20,12,5,.36)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
  } else if (kind === 'stone' || kind === 'roof') {
    const row = kind === 'roof' ? 32 : 64; const col = kind === 'roof' ? 48 : 96;
    for (let y = 0; y < 512; y += row) for (let x = -(y / row % 2) * col / 2; x < 512; x += col) {
      ctx.fillStyle = `rgba(${rnd() > .4 ? '255,243,217' : '20,20,20'},${rnd() * .12})`;
      ctx.fillRect(x + 2, y + 2, col - 4, row - 4);
      ctx.strokeStyle = kind === 'roof' ? 'rgba(0,0,0,.3)' : 'rgba(31,28,21,.16)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, col, row);
      ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + col - 3, y + 3); ctx.stroke();
    }
  }
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(${rnd() > .5 ? '255,255,240' : '0,0,0'},${rnd() * .12})`;
    ctx.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 8;
  return tex;
}
function context(seed) {
  const group = new THREE.Group(); const rnd = random(seed); const animators = [];
  const mat = (color, roughness = .8, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const textured = (color, kind, roughness = .9) => { const map=texture(kind,color,seed);return mat(map?'#ffffff':color,roughness,0,{map}); };
  const m = {
    grass: textured('#4f623a', 'grain'), grassLight: mat('#8c9150'), grassDark: mat('#374c30'), earth: textured('#51432e', 'grain'),
    rock: textured('#8b8577', 'stone'), chalk: textured('#c8c4ac', 'stone'), white: textured('#dddcca', 'stone', .68),
    wood: textured('#61452c', 'wood'), darkWood: textured('#302920', 'wood'), paleWood: textured('#b79559', 'wood'),
    roof: textured('#685548', 'roof'), redRoof: textured('#886342', 'roof'), thatch: textured('#c2a668', 'wood'),
    gold: mat('#c8aa62', .35, .6), iron: mat('#3b3934', .48, .68), bronze: mat('#745332', .45, .45),
    leaf: mat('#69834c'), autumn: mat('#bc763b'), autumnGold: mat('#c8a556'), darkLeaf: mat('#263a2a'),
    water: mat('#629a9b', .13, .23, { transparent: true, opacity: .8 }), foam: mat('#d6efde', .3, 0, { transparent: true, opacity: .76 }),
    door: textured('#45634e', 'wood', .66), redDoor: textured('#764a35', 'wood'), glass: mat('#ffcf81', .18, .1, { emissive: '#eeb663', emissiveIntensity: .62 }),
    black: mat('#151a1b', .94), basalt: textured('#292d2b', 'stone'), lava: mat('#eb4919', .4, 0, { emissive: '#ff3b0b', emissiveIntensity: 2.5 }),
    fire: mat('#ffae31', .22, 0, { emissive: '#ff8a15', emissiveIntensity: 4 }),
    skin: mat('#d2a87d', .81), lip: mat('#92654f'), hair: mat('#735438'), hairDark: mat('#493725'), beard: mat('#bbc0b7'),
    coat: mat('#644b3f'), greenCloth: mat('#4b5741'), greyCloth: mat('#7f8178'), cream: mat('#c7bfa2'), redCloth: mat('#794b41'),
  };
  const mesh = (geometry, material, pos = [0, 0, 0], scale = [1, 1, 1], parent = group) => {
    const o = new THREE.Mesh(geometry, material); o.position.set(...pos); o.scale.set(...scale); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
  };
  const box = (w, h, d, material, pos, parent) => mesh(new THREE.BoxGeometry(w, h, d), material, pos, undefined, parent);
  const ball = (r, material, pos, scale = [1, 1, 1], parent) => mesh(new THREE.SphereGeometry(r, r < .17 ? 12 : r < .4 ? 16 : 24, r < .17 ? 8 : r < .4 ? 12 : 16), material, pos, scale, parent);
  const cyl = (rt, rb, h, material, pos, seg = 32, parent) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material, pos, undefined, parent);
  const cone = (r, h, material, pos, parent, seg = 32) => cyl(0, r, h, material, pos, seg, parent);
  const torus = (r, tube, material, pos, parent, arc = TAU) => mesh(new THREE.TorusGeometry(r, tube, 12, 64, arc), material, pos, undefined, parent);
  const beam = (a, b, radius, material, parent = group, radiusB = radius) => {
    const av = V(...a), bv = V(...b), o = cyl(radiusB, radius, av.distanceTo(bv), material, av.clone().add(bv).multiplyScalar(.5).toArray(), 12, parent);
    o.quaternion.setFromUnitVectors(V(0, 1, 0), bv.sub(av).normalize()); return o;
  };
  const tube = (points, radius, material, parent = group, segments = 64) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => V(...p))), segments, radius, 8, false), material, undefined, undefined, parent);
  const lathe = (profile, material, pos, parent = group, seg = 64) => mesh(new THREE.LatheGeometry(profile.map(p => new THREE.Vector2(...p)), seg), material, pos, undefined, parent);
  const flat = (r, material, pos = [0, 0, 0], parent = group) => { const o = mesh(new THREE.CircleGeometry(r, 96), material, pos, undefined, parent); o.rotation.x = -Math.PI / 2; return o; };
  const terrain = (radius, heightFn, material = m.grass, segments = 112) => {
    const geo = new THREE.PlaneGeometry(radius * 2, radius * 2, segments, segments); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position; const colors = []; const color = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), distance = Math.hypot(x, z); p.setY(i, heightFn(x, z));
      color.setRGB(.86 + Math.sin(x * 2 + z * 2.4) * .035, .9 + Math.cos(z * 1.7) * .035, .77 + rnd() * .09); colors.push(color.r, color.g, color.b);
      if (distance > radius) { p.setX(i, x * radius / distance); p.setZ(i, z * radius / distance); p.setY(i, heightFn(x * radius / distance, z * radius / distance)); }
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geo.computeVertexNormals();
    const materialClone = material.clone(); materialClone.vertexColors = true; mesh(geo, materialClone);
    return heightFn;
  };
  const island = (r = 18, material = m.earth, thickness = 1.9) => {
    cyl(r, r * .94, thickness, material, [0, -thickness / 2 - .09, 0], 96);
    cyl(r * .98, r * .88, .16, m.gold, [0, -thickness - .09, 0], 96);
  };
  // A wide, irregular landscape section keeps buildings at their authored size.
  // Only country expands: rivers, fields and the distances between settlements.
  const landscape = (radius, heightFn, material = m.grass, segments = 176, stretch = [1, 1], palette = {}) => {
    const outline = a => radius * (1 + .045 * Math.sin(a * 5 + .8) + .018 * Math.cos(a * 11));
    const geo = new THREE.PlaneGeometry(radius * 2.14 * stretch[0], radius * 2.14 * stretch[1], segments, segments); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position, colors = [], low = new THREE.Color(palette.low || '#63734b'), stone = new THREE.Color(palette.rock || '#7c8788'), snow = new THREE.Color(palette.snow || '#d6ddd6'), color = new THREE.Color();
    const rockAt = palette.rockAt ?? 13, snowAt = palette.snowAt ?? 26;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), z = p.getZ(i); const dx = x / stretch[0], dz = z / stretch[1], r = Math.hypot(dx, dz), limit = outline(Math.atan2(dz, dx));
      if (r > limit) { x *= limit / r; z *= limit / r; }
      const y = heightFn(x, z); p.setXYZ(i, x, y, z);
      color.copy(low).lerp(stone, clamp((y - rockAt) / 6, 0, 1)); color.lerp(snow, clamp((y - snowAt) / 7, 0, 1));
      color.multiplyScalar(.88 + .055 * Math.sin(x * .59 + z * .7) + .045 * Math.cos(x * 1.7 - z * .9) + rnd() * .045); colors.push(color.r, color.g, color.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geo.computeVertexNormals();
    const own = material.clone(); own.map = null; own.color.set('#ffffff'); own.vertexColors = true; own.roughness = .95;
    const country = mesh(geo, own); country.name = 'Continuous country, valleys and distant horizon';
    const skirt = [], uv = [], idx = [], steps = 176;
    for (let i = 0; i <= steps; i++) { const a = i / steps * TAU, r = outline(a), x = Math.cos(a) * r * stretch[0], z = Math.sin(a) * r * stretch[1]; skirt.push(x, heightFn(x, z) - .025, z, x * .99, -2.6, z * .99); uv.push(i / steps * 20, 0, i / steps * 20, 1); if (i < steps) { const n = i * 2; idx.push(n, n + 2, n + 1, n + 1, n + 2, n + 3); } }
    const edge = new THREE.BufferGeometry(); edge.setAttribute('position', new THREE.Float32BufferAttribute(skirt, 3)); edge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); edge.setIndex(idx); edge.computeVertexNormals(); mesh(edge, palette.edgeMaterial || m.earth);
    return country;
  };
  const distantTrees = (heightFn, points, conifer = false) => {
    if (!points.length) return;
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.065, .2, 2.8, 8), m.wood, points.length);
    const crowns = new THREE.InstancedMesh(conifer ? new THREE.ConeGeometry(.95, 2.3, 9) : new THREE.IcosahedronGeometry(1, 1), conifer ? m.darkLeaf : m.leaf, points.length * 3);
    const dummy = new THREE.Object3D(), color = new THREE.Color();
    points.forEach(([x, z, size = 1], i) => {
      const y = heightFn(x, z); dummy.position.set(x, y + size * 1.4, z); dummy.rotation.set(0, rnd() * TAU, 0); dummy.scale.setScalar(size); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix);
      for (let j = 0; j < 3; j++) { const a = i * 2.399 + j * TAU / 3; dummy.position.set(x + (conifer ? 0 : Math.sin(a) * size * .6), y + size * (conifer ? 2.1 + j * .59 : 3.25 + (j % 2) * .34), z + (conifer ? 0 : Math.cos(a) * size * .6)); dummy.rotation.set(0, a, 0); dummy.scale.set(size * (conifer ? 1 - j * .17 : 1.14), size * (conifer ? 1 : .83), size * (conifer ? 1 - j * .17 : 1.05)); dummy.updateMatrix(); crowns.setMatrixAt(i * 3 + j, dummy.matrix); color.setRGB(.72 + rnd() * .22, .77 + rnd() * .22, .66 + rnd() * .2); crowns.setColorAt(i * 3 + j, color); }
    });
    trunks.castShadow = crowns.castShadow = false; trunks.receiveShadow = crowns.receiveShadow = true; group.add(trunks, crowns);
  };
  const ribbon = (points, width, material, parent = group) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => V(...p))); const steps = 120; const positions = [], uvs = [], indices = [];
    for (let i = 0; i <= steps; i++) { const t = i / steps, p = curve.getPoint(t), dir = curve.getTangent(t), side = V(-dir.z, 0, dir.x).normalize().multiplyScalar(width / 2);
      positions.push(p.x + side.x, p.y, p.z + side.z, p.x - side.x, p.y, p.z - side.z); uvs.push(0, t * 12, 1, t * 12);
      if (i < steps) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(indices); geo.computeVertexNormals();
    const o = mesh(geo, material, undefined, undefined, parent); o.material.side = THREE.DoubleSide; return o;
  };
  const rock = (x, y, z, size = 1, material = m.rock, parent = group) => {
    const o = mesh(new THREE.DodecahedronGeometry(size, 1), material, [x, y, z], [.8 + rnd() * .6, .8 + rnd() * .65, .7 + rnd() * .6], parent); o.rotation.set(rnd() * 2, rnd() * 5, rnd() * .6); return o;
  };
  const tree = (x, y, z, size = 1, type = 'oak', parent = group) => {
    const t = new THREE.Group(); t.position.set(x, y, z); t.scale.setScalar(size); parent.add(t);
    const trunkGeo=new THREE.CylinderGeometry(.135,.32,2.85,24,20);const tp=trunkGeo.attributes.position;
    for(let i=0;i<tp.count;i++){const yy=tp.getY(i)+1.425,a=Math.atan2(tp.getZ(i),tp.getX(i)),k=1+Math.sin(a*8+yy*3)*.06;tp.setX(i,tp.getX(i)*k+Math.sin(yy*.72)*.13);tp.setZ(i,tp.getZ(i)*k+Math.sin(yy*.43)*.08);}trunkGeo.computeVertexNormals();mesh(trunkGeo,m.wood,[0,1.41,0],undefined,t);
    if (type === 'pine') {
      beam([.09,2.4,.07],[.07,4.35,.04],.1,m.wood,t,.014);const branches=[];
      for(let level=0;level<8;level++)for(let j=0;j<7;j++){const a=j*TAU/7+level*.48,y=1.18+level*.36,r=1.12-level*.125;const end=[Math.sin(a)*r,y-.22,Math.cos(a)*r];beam([.06,y+.04,.04],end,.039,m.wood,t,.008);branches.push({a,y,r});}
      const needleGeo=new THREE.BufferGeometry();needleGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,.105,0,-.024,-.065,0,.024,-.065,0,0,.105,0,0,-.065,-.022,0,-.065,.022],3));needleGeo.setIndex([0,1,2,3,4,5]);needleGeo.computeVertexNormals();const needlesMaterial=m.darkLeaf.clone();needlesMaterial.side=THREE.DoubleSide;const count=2600,needles=new THREE.InstancedMesh(needleGeo,needlesMaterial,count),dummy=new THREE.Object3D(),color=new THREE.Color();
      for(let i=0;i<count;i++){const b=branches[i%branches.length],f=.08+rnd()*.98,r=b.r*f,a=b.a+(rnd()-.5)*.35;dummy.position.set(Math.sin(a)*r,b.y-.22*f+(rnd()-.5)*.22,Math.cos(a)*r);dummy.rotation.set(Math.PI/2+(rnd()-.5)*1.5,a,rnd()*TAU);const s=.7+rnd()*.7;dummy.scale.setScalar(s);dummy.updateMatrix();needles.setMatrixAt(i,dummy.matrix);color.setRGB(.8+rnd()*.35,.84+rnd()*.4,.78+rnd()*.32);needles.setColorAt(i,color);}needles.castShadow=true;needles.receiveShadow=true;t.add(needles);
    } else {
      const leaf = type === 'gold' ? m.autumnGold : type === 'autumn' ? m.autumn : m.leaf;
      const crowns=[];
      for(let i=0;i<9;i++){const a=i*2.39996,extent=.92+rnd()*.4;const p0=[.11,1.35+i*.055,.05],p1=[Math.sin(a)*.65,2.26+rnd()*.25,Math.cos(a)*.65],p2=[Math.sin(a)*extent,2.9+rnd()*.55,Math.cos(a)*extent];
        beam(p0,p1,.105,m.wood,t,.072);beam(p1,p2,.074,m.wood,t,.035);for(let j=0;j<3;j++){const aa=a+(j-1)*.55,end=[p2[0]+Math.sin(aa)*.52,p2[1]+.3+rnd()*.25,p2[2]+Math.cos(aa)*.52];beam(p2,end,.035,m.wood,t,.013);crowns.push(end);}
      }
      // Individual curved, pointed leaves catch the light and reveal the real
      // branch structure. There are no opaque spheres standing in for foliage.
      const leafGeo=new THREE.BufferGeometry();leafGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,-.16,0,-.08,-.07,.016,-.095,.03,.024,-.06,.11,.015,0,.18,0,.06,.11,.015,.095,.03,.024,.08,-.07,.016,0,.03,.043],3));leafGeo.setIndex([0,1,8,1,2,8,2,3,8,3,4,8,4,5,8,5,6,8,6,7,8,7,0,8]);leafGeo.computeVertexNormals();
      const leafMat=leaf.clone();leafMat.side=THREE.DoubleSide;leafMat.roughness=.88;const count=size>2?1450:720;const leaves=new THREE.InstancedMesh(leafGeo,leafMat,count),dummy=new THREE.Object3D(),color=new THREE.Color();
      for(let i=0;i<count;i++){const crown=crowns[i%crowns.length],a=rnd()*TAU,r=Math.sqrt(rnd())*.55;dummy.position.set(crown[0]+Math.cos(a)*r,crown[1]+(rnd()-.5)*.66,crown[2]+Math.sin(a)*r);dummy.rotation.set((rnd()-.5)*2.4,rnd()*TAU,rnd()*TAU);const s=.64+rnd()*.66;dummy.scale.set(s,s,s);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);color.setRGB(.72+rnd()*.36,.78+rnd()*.31,.67+rnd()*.3);leaves.setColorAt(i,color);}
      leaves.castShadow=true;leaves.receiveShadow=true;t.add(leaves);
      for(let i=0;i<6;i++){const a=i*TAU/6;beam([0,.17,0],[Math.sin(a)*.66,.035,Math.cos(a)*.66],.1,m.wood,t,.035);}
    }
    return t;
  };
  const grass = (heightFn, predicate, count = 2300, radius = 17.3, color = m.grassLight) => {
    const blade = new THREE.ConeGeometry(.036, .34, 3); blade.translate(0, .17, 0);
    const inst = new THREE.InstancedMesh(blade, color, count); const dummy = new THREE.Object3D(); let made = 0;
    for (let attempts = 0; made < count && attempts < count * 12; attempts++) { const x = (rnd() - .5) * radius * 2, z = (rnd() - .5) * radius * 2; if (Math.hypot(x, z) > radius || !predicate(x, z)) continue;
      dummy.position.set(x, heightFn(x, z) + .012, z); dummy.rotation.set((rnd() - .5) * .2, rnd() * TAU, (rnd() - .5) * .3); dummy.scale.set(1, .7 + rnd() * .9, 1); dummy.updateMatrix(); inst.setMatrixAt(made++, dummy.matrix);
    }
    inst.count = made; inst.receiveShadow = true; group.add(inst); return inst;
  };
  const window = (x, y, z, size, parent, round = false) => {
    if (round) { const glass = cyl(size * .82, size * .82, .055, m.glass, [x, y, z], 32, parent); glass.rotation.x = Math.PI / 2; torus(size, size * .08, m.paleWood, [x, y, z + .03], parent);
      box(size * .08, size * 1.8, .09, m.paleWood, [x, y, z + .06], parent); box(size * 1.8, size * .08, .09, m.paleWood, [x, y, z + .06], parent);
    } else { box(size, size * 1.5, .04, m.glass, [x, y, z], parent); box(size + .15, .09, .12, m.paleWood, [x, y + size * .8, z], parent);
      box(size + .15, .09, .12, m.paleWood, [x, y - size * .8, z], parent); box(.07, size * 1.6, .12, m.darkWood, [x, y, z + .025], parent); box(size, .07, .12, m.darkWood, [x, y, z + .03], parent);
    }
  };
  const arch = (width, height, depth, material, pos, parent = group, thickness = .18) => {
    const shape = new THREE.Shape(); const r = width / 2; const stem = height - r;
    shape.moveTo(-r, 0); shape.lineTo(-r, stem); shape.absarc(0, stem, r, Math.PI, 0, true); shape.lineTo(r, 0); shape.lineTo(r - thickness, 0); shape.lineTo(r - thickness, stem);
    shape.absarc(0, stem, r - thickness, 0, Math.PI, false); shape.lineTo(-r + thickness, 0); shape.lineTo(-r, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .035, bevelThickness: .025, curveSegments: 24 });
    return mesh(geo, material, pos, undefined, parent);
  };
  const gable = (w, h, d, material, pos, parent = group) => {
    const shape = new THREE.Shape(); shape.moveTo(-w / 2, 0); shape.lineTo(0, h); shape.lineTo(w / 2, 0); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false }); return mesh(geo, material, pos, undefined, parent);
  };
  const roof = (w, rise, d, material, y, parent = group) => {
    const a = Math.atan2(rise, w / 2), length = Math.hypot(w / 2, rise);
    for (const side of [-1, 1]) { const o = box(length, .14, d, material, [side * w / 4, y + rise / 2, 0], parent); o.rotation.z = -side * a; }
    box(.15, .15, d + .12, m.darkWood, [0, y + rise, 0], parent);
  };
  const fence = (points, material = m.paleWood, parent = group) => {
    for (let i = 0; i < points.length; i++) { const p = points[i]; cyl(.06, .075, .75, material, [p[0], p[1] + .35, p[2]], 8, parent);
      if (i) { const q = points[i - 1]; for (const lift of [.2, .5]) beam([q[0], q[1] + lift, q[2]], [p[0], p[1] + lift, p[2]], .035, material, parent); }
    }
  };
  const house = (x, y, z, s = 1, kind = 'bree', angle = 0, parent = group) => {
    const h = new THREE.Group(); h.position.set(x, y, z); h.scale.setScalar(s); h.rotation.y = angle; parent.add(h);
    const w = 2.2, depth = 2.1, tall = kind === 'rohan' ? 1.6 : 2.1;
    box(w, tall, depth, kind === 'rohan' ? m.wood : kind === 'stone' ? m.chalk : m.cream, [0, tall / 2, 0], h);
    gable(w, .95, depth, kind === 'rohan' ? m.paleWood : kind === 'stone' ? m.chalk : m.cream, [0, tall, -depth / 2], h);
    roof(w + .38, 1.05, depth + .46, kind === 'rohan' ? m.thatch : m.roof, tall, h);
    for (const px of [-w / 2, 0, w / 2]) box(.105, tall + .1, depth + .07, m.darkWood, [px, tall / 2, 0], h);
    for (const py of [.12, tall * .55, tall]) box(w + .08, .1, depth + .08, m.darkWood, [0, py, 0], h);
    beam([-w / 2, tall * .55, depth / 2 + .06], [0, tall, depth / 2 + .06], .047, m.darkWood, h);
    beam([0, tall, depth / 2 + .06], [w / 2, tall * .55, depth / 2 + .06], .047, m.darkWood, h);
    box(.47, .96, .09, m.darkWood, [0, .5, depth / 2 + .06], h); ball(.038, m.bronze, [.15, .46, depth / 2 + .13], undefined, h);
    window(-.73, 1.23, depth / 2 + .06, .35, h); window(.73, 1.23, depth / 2 + .06, .35, h);
    if (kind !== 'rohan') { box(.3, 1.8, .38, m.rock, [.63, tall + .63, -.4], h); box(.4, .13, .47, m.rock, [.63, tall + 1.55, -.4], h); }
    else {
      for (const face of [-1, 1]) { beam([-.24, tall + .83, face * (depth / 2 + .27)], [.27, tall + 1.35, face * (depth / 2 + .4)], .065, m.paleWood, h); beam([.24, tall + .83, face * (depth / 2 + .27)], [-.27, tall + 1.35, face * (depth / 2 + .4)], .065, m.paleWood, h); }
      for (let i = -1; i <= 1; i++) { const a = arch(.38, .65, .07, m.paleWood, [i * .55, tall * .6, depth / 2 + .08], h, .05); a.scale.y = .8; }
    }
    return h;
  };
  const lantern = (x, y, z, parent = group) => {
    box(.23, .33, .23, m.glass, [x, y, z], parent); cone(.22, .17, m.iron, [x, y + .23, z], parent, 4); box(.28, .06, .28, m.iron, [x, y - .2, z], parent);
    const light = new THREE.PointLight('#ffc880', 1.4, 4, 2); light.position.set(x, y, z); parent.add(light);
  };
  const waterfall = (x, top, z, height, width) => {
    const water = m.foam.clone(); water.opacity = .5;
    for (let i = 0; i < 9; i++) { const o = mesh(new THREE.PlaneGeometry(width / 5, height, 3, 32), water, [x + (i / 8 - .5) * width, top - height / 2, z + Math.sin(i) * .05]);
      o.material.side = THREE.DoubleSide; o.rotation.y = .1; o.userData.dynamic = true; animators.push(t => { o.position.z = z + Math.sin(t * 3 + i) * .035; o.scale.x = .9 + Math.sin(t * 2 + i) * .12; });
    }
    for (let i = 0; i < 12; i++) ball(.23 + rnd() * .13, m.foam, [x + (rnd() - .5) * width * 1.5, top - height + .06, z + .25 + rnd() * .9], [1.8, .3, 1.2]);
  };
  const finish = (camera, target, fog, background, sun, tours = []) => {
    batchStaticMeshes(group);
    return { group, camera, target, fog, background, sun, tours, animate: t => animators.forEach(fn => fn(t)) };
  };
  return { group, rnd, animators, m, mat, mesh, box, ball, cyl, cone, torus, beam, tube, lathe, flat, terrain, island, landscape, distantTrees, ribbon, rock, tree, grass, window, arch, gable, roof, fence, house, lantern, waterfall, finish };
}

// Bake static architecture into one indexed geometry per material. This keeps
// hundreds of roof beams, individual stones and leaves without hundreds of draws.
function batchStaticMeshes(group) {
  group.updateMatrixWorld(true); const buckets = new Map();
  group.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || o.userData.dynamic || Array.isArray(o.material) || o.material.transparent) return;
    let shell=false,p=o;while(p&&p!==group){if(p.userData.cutawayShell)shell=true;p=p.parent;}
    const key=o.material.uuid+(shell?':cutawayShell':'');const bucket = buckets.get(key) || []; bucket.push(o); buckets.set(key, bucket);
    if(shell)o.userData.cutawayShell=true;
  });
  const matrix = new THREE.Matrix4().copy(group.matrixWorld).invert();
  for (const objects of buckets.values()) {
    if (objects.length < 3) continue;
    const positions = [], normals = [], uvs = [], indices = []; let vertexOffset = 0;
    for (const o of objects) {
      const geo = o.geometry.clone(); geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(matrix, o.matrixWorld));
      if (!geo.attributes.normal) geo.computeVertexNormals(); const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
      for (let i = 0; i < p.count; i++) { positions.push(p.getX(i),p.getY(i),p.getZ(i)); normals.push(n.getX(i),n.getY(i),n.getZ(i)); uvs.push(uv ? uv.getX(i) : 0,uv ? uv.getY(i) : 0); }
      if (geo.index) for (let i = 0; i < geo.index.count; i++) indices.push(geo.index.getX(i) + vertexOffset);
      else for (let i = 0; i < p.count; i++) indices.push(i + vertexOffset);
      vertexOffset += p.count; geo.dispose();
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); geo.setIndex(indices);geo.computeBoundingSphere();
    const merged = new THREE.Mesh(geo,objects[0].material);merged.castShadow=true;merged.receiveShadow=true;merged.name='Baked diorama details';
    if(objects[0].userData.cutawayShell)merged.userData.cutawayShell=true;
    for(const o of objects){o.parent.remove(o);o.geometry.dispose();}group.add(merged);
  }
}

// Reusable architectural pieces: one box/gable mesh topology, varied plans and
// proportions, then baked by material rather than one draw per window or beam.
function settlementTools(c){
  const {group,m,rnd}=c,unit=new THREE.BoxGeometry(1,1,1),triangle=new THREE.Shape();triangle.moveTo(-.5,0);triangle.lineTo(0,1);triangle.lineTo(.5,0);triangle.closePath();
  const pediment=new THREE.ExtrudeGeometry(triangle,{depth:1,bevelEnabled:false});
  const block=(w,h,d,material,pos,parent=group)=>c.mesh(unit,material,pos,[w,h,d],parent);
  const roof=(w,rise,d,material,y,parent)=>{const length=Math.hypot(w/2,rise),a=Math.atan2(rise,w/2);for(const side of [-1,1]){const p=block(length,.15,d,material,[side*w/4,y+rise/2,0],parent);p.rotation.z=-side*a;}block(.15,.16,d+.14,m.darkWood,[0,y+rise,0],parent);};
  const gable=(w,rise,d,material,y,parent)=>c.mesh(pediment,material,[0,y,-d/2],[w,rise,d],parent);
  const dwelling=(x,y,z,w=4.2,d=5.1,tall=3.3,style='stone',angle=0,variant=0,parent=group)=>{
    const h=new THREE.Group();h.position.set(x,y,z);h.rotation.y=angle;parent.add(h);h.userData.architecture=true;
    const timber=style==='rohan',stone=style==='gondor'||style==='stone',walls=timber?m.wood:stone?m.chalk:m.cream,tiles=timber?m.thatch:style==='gondor'?m.rock:variant%3===0?m.redRoof:m.roof;
    block(w+.3,.58,d+.3,m.rock,[0,-.27,0],h);block(w,tall,d,walls,[0,tall/2,0],h);
    const rise=timber?w*.46:w*.34+.2;gable(w,rise,d,timber?m.paleWood:walls,tall,h);roof(w+.45,rise+.18,d+.5,tiles,tall,h);
    for(const side of [-1,1]){block(.13,tall+.12,d+.06,timber?m.darkWood:m.white,[side*w/2,tall/2,0],h);block(w+.13,.11,.11,m.darkWood,[0,.16,side*d/2+.035],h);}
    const floors=tall>4.4?2:1;for(let floor=0;floor<floors;floor++)for(const side of [-1,1])for(let i=0;i<3;i++){
      if(floor===0&&side===1&&i===1)continue;const wx=(i-1)*w*.31,wy=.98+floor*tall*.47,wz=side*(d/2+.05);
      block(.5,.8,.065,m.darkWood,[wx,wy,wz],h);block(.38,.62,.078,m.glass,[wx,wy,wz+side*.015],h);block(.05,.7,.09,m.paleWood,[wx,wy,wz+side*.055],h);block(.46,.045,.09,m.paleWood,[wx,wy,wz+side*.055],h);
      if(!timber){for(const s of [-1,1])block(.15,.8,.1,m.door,[wx+s*.36,wy,wz+side*.045],h);}
    }
    block(.85,1.66,.09,m.darkWood,[0,.84,d/2+.06],h);block(.69,1.52,.11,timber?m.paleWood:m.wood,[0,.81,d/2+.09],h);block(1.2,.16,.7,m.rock,[0,.03,d/2+.35],h);
    if(timber||style==='bree'){for(const xx of [-w/2,0,w/2])block(.12,tall+.05,.14,m.darkWood,[xx,tall/2,d/2+.06],h);for(const yy of [tall*.51,tall])block(w,.12,.14,m.darkWood,[0,yy,d/2+.06],h);for(const side of [-1,1])c.beam([side*w*.47,tall*.53,d/2+.15],[side*w*.06,tall*.94,d/2+.15],.055,m.darkWood,h);}
    if(!timber){block(.52,tall*.6+rise,.6,m.rock,[w*.3,tall+rise*.2,-d*.23],h);block(.74,.17,.8,m.chalk,[w*.3,tall*1.3+rise*.7,-d*.23],h);}
    else for(const face of [-1,1])for(const side of [-1,1])c.beam([side*.26,tall+rise-.2,face*(d/2+.27)],[-side*.34,tall+rise+.43,face*(d/2+.49)],.07,m.paleWood,h);
    if(variant%4===1){const wing=new THREE.Group();wing.position.set(-w*.45,0,-d*.58);wing.rotation.y=Math.PI/2;h.add(wing);block(w*.72,tall*.72,d*.56,walls,[0,tall*.36,0],wing);gable(w*.72,rise*.62,d*.56,walls,tall*.72,wing);roof(w*.8,rise*.7,d*.63,tiles,tall*.72,wing);}
    if(variant%4===2){const porch=new THREE.Group();porch.position.z=d/2+.75;h.add(porch);roof(w*.7,.48,1.7,tiles,1.92,porch);for(const side of [-1,1])block(.1,1.95,.1,m.paleWood,[side*w*.29,.98,.65],porch);}
    if(variant%4===3){const dormer=new THREE.Group();dormer.position.set(w*.18,tall+rise*.32,d*.15);dormer.rotation.y=Math.PI/2;h.add(dormer);gable(1.45,.64,1.7,walls,0,dormer);roof(1.65,.75,1.8,tiles,.05,dormer);block(.47,.46,.08,m.darkWood,[0,.22,.9],dormer);}
    return h;
  };
  const lane=(points,width,heightFn,material=m.earth,parent=group)=>c.ribbon(points.map(([x,z])=>[x,heightFn(x,z)+.09,z]),width,material,parent);
  const steps=(a,b,width,parent=group,material=m.rock)=>{const count=Math.max(2,Math.ceil(Math.abs(b[1]-a[1])/.22)),angle=Math.atan2(b[0]-a[0],b[2]-a[2]),length=Math.hypot(b[0]-a[0],b[2]-a[2]);for(let i=0;i<count;i++){const t=(i+.5)/count,p=block(width,.22,length/count+.07,material,[mix(a[0],b[0],t),mix(a[1],b[1],t)-.09,mix(a[2],b[2],t)],parent);p.rotation.y=angle;}};
  const court=(x,y,z,w,d,parent=group)=>{block(w,.18,d,m.rock,[x,y-.07,z],parent);for(let i=0;i<Math.ceil(w/1.2);i++)for(let j=0;j<Math.ceil(d/1.2);j++)block(.025,.012,1.1,m.chalk,[x-w/2+.6+i*1.2,y+.03,z-d/2+.6+j*1.2],parent);};
  return {block,dwelling,lane,steps,court,roof,gable};
}

function shire() {
  const c=context(1937);const {group,m,rnd,box,ball,cyl,torus,beam,tube,lathe,terrain,island,ribbon,tree,grass,fence,lantern,arch,finish}=c;
  group.name='Hobbiton — Wzgórze i rozległy Bag End';
  const riverZ=x=>39.8+.0014*x*x+1.1*Math.sin(x*.05),rotation=-.54,cr=Math.cos(rotation),sr=Math.sin(rotation);
  const ground=(x,z)=>{const d=Math.hypot(x,z),wide=1.4+1.6*Math.sin(x*.066)*Math.cos(z*.052)+3.4*Math.exp(-((x+37)**2+(z+30)**2)/580)+2.6*Math.exp(-((x-43)**2+(z+17)**2)/410),blend=clamp((d-23)/17,0,1),sx=cr*x-sr*(z+1),sz=sr*x+cr*(z+1),stream=Math.abs(sz-riverZ(sx));const natural=mix(.06+.12*Math.sin(x*.18)*Math.cos(z*.24),wide,blend);return mix(-.06,natural,clamp((stream-1.32)/1.5,0,1));};
  c.landscape(78,ground,m.grass,192,[1,1],{low:'#657846',rockAt:30});
  const localGround=(x,z)=>ground(cr*x+sr*z,-sr*x+cr*z-1);
  const smial=new THREE.Group();smial.rotation.y=-.54;smial.position.set(0,0,-1);group.add(smial);
  const home=new THREE.Group();home.name='Bag End — one complete unscaled house on the upper slope';home.position.set(0,6.5,5.5);smial.add(home);
  const shell=new THREE.Group();shell.name='Wzgórze — zdejmowana warstwa ziemi i sklepienia';shell.userData.cutawayShell=true;home.add(shell);
  const floorY=3.08,hallZ=-1.2,doorY=floorY+1.36;
  // One immense grassy Hill encloses the entire house. Openings are removed
  // from the actual shell; windows and the circular entrance are excavations.
  const hillBands=[[0,18.5],[.25,18.1],[.34,15.5],[.49,15],[.56,14],[.69,12],[.77,7.3],[.87,7],[.94,3.55],[1,0]];
  const hillProfile=r=>{for(let i=1;i<hillBands.length;i++)if(r<=hillBands[i][0])return mix(hillBands[i-1][1],hillBands[i][1],clamp((r-hillBands[i-1][0])/(hillBands[i][0]-hillBands[i-1][0]),0,1));return 0;};
  const radiusAt=y=>{for(let i=1;i<hillBands.length;i++)if(y>=hillBands[i][1])return mix(hillBands[i-1][0],hillBands[i][0],clamp((hillBands[i-1][1]-y)/(hillBands[i-1][1]-hillBands[i][1]),0,1));return 1;};
  const hillY=(x,z)=>hillProfile(Math.hypot((x+3)/36,(z+6)/32));
  const xSurface=-3+36*Math.sqrt(Math.max(0,radiusAt(home.position.y+doorY)**2-((home.position.z+hallZ+6)/32)**2));
  const doorX=Math.max(16.08,xSurface-home.position.x+.12),hallBack=-10.93,hallLength=doorX-.08-hallBack,hallCenter=hallBack+hallLength/2;
  const frontZ=(x,y)=>-6+32*Math.sqrt(Math.max(0,radiusAt(y)**2-((x+3)/36)**2));
  const row=[[-15,3.75,m.redDoor],[-4,3.75,c.mat('#b59b43')],[7,3.75,c.mat('#618898')]],sides=[[-26,8.15,m.door],[-18,7.85,m.redDoor],[23,7.9,m.door]],otherHoles=[];
  for(const [x,y]of [...row,...sides]){otherHoles.push({x,y,z:frontZ(x,y),r:.71});for(const side of [-1,1])otherHoles.push({x:x+side*1.65,y:y+.08,z:frontZ(x+side*1.65,y+.08),r:.34});}
  const hillGeo=new THREE.SphereGeometry(1,224,160);const hp=hillGeo.attributes.position;
  for(let i=0;i<hp.count;i++){const x=hp.getX(i)*36-3,z=hp.getZ(i)*32-6,y=hp.getY(i)>=0?hillY(x,z):0;hp.setXYZ(i,x-home.position.x,y-home.position.y,z-home.position.z);}
  const windowXs=[7,1.5,-4,-9];const hi=[];
  for(let i=0;i<hillGeo.index.count;i+=3){const a=hillGeo.index.getX(i),b=hillGeo.index.getX(i+1),d=hillGeo.index.getX(i+2);const x=(hp.getX(a)+hp.getX(b)+hp.getX(d))/3,y=(hp.getY(a)+hp.getY(b)+hp.getY(d))/3,z=(hp.getZ(a)+hp.getZ(b)+hp.getZ(d))/3;
    const portal=x>doorX-5.7&&((y-doorY)**2+(z-hallZ)**2)<1.37**2,entryTerrace=x>doorX-.3&&x<doorX+5.4&&Math.abs(z-hallZ)<1.52&&y<floorY+1.4&&y>floorY-1.5;
    const opening=z>3.9&&windowXs.some(wx=>(x-wx)**2+(y-(floorY+1.17))**2<.63**2);
    const wx=x+home.position.x,wy=y+home.position.y,wz=z+home.position.z,lowerOpening=otherHoles.some(h=>wz>h.z-2.5&&(wx-h.x)**2+(wy-h.y)**2<h.r**2);
    if(!portal&&!opening&&!lowerOpening&&!entryTerrace)hi.push(a,b,d);
  }hillGeo.setIndex(hi);hillGeo.computeVertexNormals();c.mesh(hillGeo,m.grass,undefined,undefined,shell);
  const hillSurface=(x,z)=>hillY(x+home.position.x,z+home.position.z)-home.position.y;
  const grassOnHill=(x,z)=>{
    const y=hillSurface(x,z),wx=x+home.position.x,wy=y+home.position.y,wz=z+home.position.z;
    if(Math.hypot((wx+3)/36,(wz+6)/32)>=.965)return false;
    // Use the carved openings, with clearance for the tallest grass blades.
    const lowerOpening=otherHoles.some(h=>wz>h.z-2.7&&(wx-h.x)**2+(wy-h.y)**2<(h.r+.55)**2);
    const portal=x>doorX-6&&((y-doorY)**2+(z-hallZ)**2)<1.92**2;
    const entryTerrace=x>doorX-.6&&x<doorX+5.7&&Math.abs(z-hallZ)<1.87&&y<floorY+1.95&&y>floorY-1.8;
    const windowOpening=z>3.7&&windowXs.some(w=>(x-w)**2+(y-(floorY+1.17))**2<1.1**2);
    return !lowerOpening&&!portal&&!entryTerrace&&!windowOpening;
  };
  const hillGrass=grass(hillSurface,grassOnHill,9800,45,m.grassDark);shell.add(hillGrass);
  // The old oak grows directly over the home, with exposed twisting roots.
  tree(-3,12,-11.5,2.45,'oak',shell);
  for(let i=0;i<7;i++){const a=i*TAU/7;tube([[-3,12.1,-11.5],[-3+Math.sin(a)*1.3,12,-11.5+Math.cos(a)*1.3],[-3+Math.sin(a)*2.8,11.96,-11.5+Math.cos(a)*2.8]],.12,m.wood,shell);}
  for(const [x,z] of [[7,-4.5],[-4,-5.5]]){const top=hillSurface(x,z)+.15;box(.42,2.2,.45,m.chalk,[x,top+.8,z],shell);box(.64,.18,.64,m.chalk,[x,top+1.98,z],shell);cyl(.15,.17,.25,m.darkWood,[x,top+2.19,z],16,shell);}
  // Grand polished, almost straight tunnel hall; all rooms share one floor.
  box(doorX+10.92,.18,2.95,m.paleWood,[(doorX-10.92)/2,floorY-.1,hallZ],home);
  const ceilingGeo=new THREE.CylinderGeometry(1.48,1.48,hallLength,96,180,true),cp=ceilingGeo.attributes.position,ci=[];
  for(let i=0;i<ceilingGeo.index.count;i+=3){const a=ceilingGeo.index.getX(i),b=ceilingGeo.index.getX(i+1),d=ceilingGeo.index.getX(i+2);const x=hallCenter-(cp.getY(a)+cp.getY(b)+cp.getY(d))/3,y=doorY+(cp.getX(a)+cp.getX(b)+cp.getX(d))/3,z=hallZ+(cp.getZ(a)+cp.getZ(b)+cp.getZ(d))/3;
    if(Math.abs(z-hallZ)>1.05&&windowXs.some(wx=>(x-wx)**2+(y-floorY-.92)**2<.87**2))continue;ci.push(a,b,d);
  }ceilingGeo.setIndex(ci);const innerWood=m.paleWood.clone();innerWood.side=THREE.DoubleSide;const ceiling=c.mesh(ceilingGeo,innerWood,[hallCenter,doorY,hallZ],undefined,shell);ceiling.rotation.z=Math.PI/2;
  const entryFace=new THREE.Shape();entryFace.absarc(0,0,1.48,0,TAU,false);const entryHole=new THREE.Path();entryHole.absarc(0,0,1.23,0,TAU,true);entryFace.holes.push(entryHole);const entryWall=c.mesh(new THREE.ShapeGeometry(entryFace,64),innerWood,[doorX-.08,doorY,hallZ],undefined,home);entryWall.rotation.y=Math.PI/2;
  const hallEnd=cyl(1.48,1.48,.12,innerWood,[-11.02,doorY,hallZ],96,home);hallEnd.rotation.z=Math.PI/2;hallEnd.name='Closed wooden end of the Bag End hall';
  for(let i=0;i<15;i++){const x=15.45-i*1.82;const rib=torus(1.41,.07,m.darkWood,[x,doorY,hallZ],shell);rib.rotation.y=Math.PI/2;}
  for(let x=17.27;x<doorX-.3;x+=1.82){const rib=torus(1.36,.08,m.darkWood,[x,doorY,hallZ],shell);rib.rotation.y=Math.PI/2;}
  const entryNeck=torus(1.28,.075,m.darkWood,[doorX-.18,doorY,hallZ],shell);entryNeck.rotation.y=Math.PI/2;
  const panelStops=[-10.9,-9.89,-8.11,-4.89,-3.11,.61,2.39,6.11,7.89,doorX-.14];for(const side of [-1,1])for(let i=0;i<panelStops.length;i+=2){const a=panelStops[i],b=panelStops[i+1];box(b-a,.88,.13,m.wood,[(a+b)/2,floorY+.43,hallZ+side*1.4],home);}
  // A parquet rhythm, rug runners and chair rails give the hall its scale.
  for(let i=0;i<62;i++){const x=15.65-i*.43;for(const side of [-1,1]){const plank=box(.37,.012,1.9,m.paleWood,[x,floorY+.011,hallZ+side*.46],home);plank.rotation.y=side*.58;}}
  for(let x=16.08;x<doorX-.12;x+=.43)for(const side of [-1,1]){const plank=box(.37,.012,1.9,m.paleWood,[x,floorY+.011,hallZ+side*.46],home);plank.rotation.y=side*.58;}
  const rugs=c.mat('#a56a44',.92);const rugEdge=c.mat('#b8a475',.92);
  for(const x of [8.5,3,-2.5,-8]){box(3.55,.017,1.16,rugEdge,[x,floorY+.025,hallZ],home);box(3.24,.02,.91,rugs,[x,floorY+.027,hallZ],home);for(let i=0;i<11;i++)box(.06,.025,.91,m.cream,[x-1.48+i*.29,floorY+.04,hallZ],home);}
  for(let i=0;i<9;i++){const x=10-i*2.05;beam([x,floorY+1.65,hallZ-1.37],[x,floorY+1.65,hallZ-1.18],.029,m.paleWood,home);if(i%2===0){const coat=ball(.32,i%3?m.coat:m.greenCloth,[x,floorY+1.17,hallZ-1.18],[.54,1.14,.22],home);coat.rotation.z=.09;const brim=cyl(.17,.17,.045,m.darkWood,[x,floorY+1.76,hallZ-1.15],24,home);brim.rotation.x=Math.PI/2;}}
  const roomMats=[m.redCloth,m.cream,m.greenCloth,m.paleWood];
  // Pivot at the portal's jamb and swing into the side room. Positive Y
  // rotation would place the southern leaves across the main hall instead.
  const circularDoor=(x,z,side=1)=>{const door=new THREE.Group();door.position.set(x-.75,floorY+.92,z);door.rotation.y=-side*.98;home.add(door);const p=cyl(.75,.75,.09,m.paleWood,[.75,0,0],64,door);p.rotation.x=Math.PI/2;ball(.042,m.bronze,[1.06,0,side*.085],undefined,door);torus(.86,.078,m.darkWood,[x,floorY+.92,z+side*.04],home);};
  const room=(x,z,width,depth,material)=>{
    const r=new THREE.Group();r.position.set(x,floorY,z);home.add(r);box(width,.14,depth,m.paleWood,[0,-.1,0],r);
    for(const side of [-1,1]){box(.14,1.3,depth,m.wood,[side*width/2,.65,0],r);box(.07,.09,depth,m.gold,[side*width/2,1.16,0],r);}
    const roofGroup=new THREE.Group();roofGroup.userData.cutawayShell=true;r.add(roofGroup);
    // True barrel-vaulted rooms branch from the hall and remain opaque when
    // explored from within. The optional cutaway only lifts their upper shell.
    const positions=[],uv=[],indices=[];const arcSteps=56,lengthSteps=24;
    for(let j=0;j<=lengthSteps;j++)for(let i=0;i<=arcSteps;i++){const a=i/arcSteps*Math.PI;positions.push(Math.cos(a)*width/2,1.3+Math.sin(a)*1.5,mix(-depth/2,depth/2,j/lengthSteps));uv.push(i/arcSteps,j/lengthSteps);if(i<arcSteps&&j<lengthSteps){const n=j*(arcSteps+1)+i;indices.push(n,n+1,n+arcSteps+1,n+1,n+arcSteps+2,n+arcSteps+1);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const plaster=m.cream.clone();plaster.side=THREE.DoubleSide;c.mesh(geo,plaster,undefined,undefined,roofGroup);
    const entrySide=z>0?-1:1;
    for(const side of [-1,1]){
      const shape=new THREE.Shape();shape.moveTo(-width/2,0);shape.lineTo(width/2,0);shape.lineTo(width/2,1.3);for(let k=0;k<=56;k++){const a=k/56*Math.PI;shape.lineTo(Math.cos(a)*width/2,1.3+Math.sin(a)*1.5);}shape.lineTo(-width/2,0);
      const hole=new THREE.Path();const openingR=side===entrySide?.87:z>0?.62:0;
      if(openingR){hole.absarc(0,side===entrySide?.92:1.17,openingR,0,TAU,true);shape.holes.push(hole);}
      const wallGeo=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:false,curveSegments:48});c.mesh(wallGeo,plaster,[0,0,side*depth/2],undefined,roofGroup);
      for(const s of [-1,1])box((width-1.8)/2,1.2,.14,m.wood,[s*(width+1.8)/4,.6,side*depth/2],r);
      torus(openingR||.02,.06,m.darkWood,[0,side===entrySide?.92:1.17,side*depth/2+.02],r);
    }
    const startZ=z>0?hallZ+1.4:hallZ-1.4,endZ=z+entrySide*depth/2;const branchGeo=new THREE.CylinderGeometry(.88,.88,Math.abs(endZ-startZ),64,12,true);const branch=c.mesh(branchGeo,innerWood,[x,floorY+.92,(startZ+endZ)/2],undefined,shell);branch.rotation.x=Math.PI/2;
    box(1.72,.14,Math.abs(endZ-startZ),m.paleWood,[x,floorY-.08,(startZ+endZ)/2],home);
    lantern(-width/2+.35,1.78,-.68,r);return r;
  };
  const table=(parent,x,z,w=2.2,d=1.3,h=.85)=>{box(w,.12,d,m.paleWood,[x,h,z],parent);for(const xx of [-1,1])for(const zz of [-1,1]){lathe([[.06,0],[.085,.1],[.05,.45],[.08,h]],m.darkWood,[x+xx*(w/2-.15),0,z+zz*(d/2-.15)],parent,20);}return parent;};
  const chair=(parent,x,z,angle=0)=>{const ch=new THREE.Group();ch.position.set(x,0,z);ch.rotation.y=angle;parent.add(ch);box(.62,.09,.57,m.paleWood,[0,.45,0],ch);for(const xx of [-1,1])for(const zz of [-1,1])cyl(.037,.05,zz<0?1.14:.44,m.darkWood,[xx*.24,zz<0?.59:.22,zz*.22],12,ch);for(let j=0;j<3;j++)beam([-.24,.66+j*.14,-.23],[.24,.66+j*.14,-.23],.038,m.paleWood,ch);return ch;};
  const bookcase=(parent,x,z,w=1.7)=>{box(w,1.94,.39,m.darkWood,[x,.97,z],parent);for(let k=0;k<5;k++){box(w,.055,.46,m.paleWood,[x,.13+k*.39,z+.04],parent);for(let j=0;j<11;j++)box(.06+rnd()*.04,.22+rnd()*.1,.25,roomMats[j%4],[x-w/2+.14+j*(w-.2)/11,.28+k*.39,z+.14],parent);}};
  const southRooms=[];
  for(let i=0;i<4;i++){const x=windowXs[i],r=room(x,3.9,4.9,5.15,roomMats[i]);southRooms.push(r);circularDoor(x, hallZ+1.41);const surfaceZ=frontZ(x+home.position.x,floorY+1.17+home.position.y)-home.position.z;
    c.window(x,floorY+1.17,surfaceZ+.025,.62,home,true);const recess=cyl(.66,.66,Math.max(.12,surfaceZ-6.38),m.paleWood,[x,floorY+1.17,(surfaceZ+6.38)/2],64,home);recess.rotation.x=Math.PI/2;const inner=cyl(.56,.56,Math.max(.14,surfaceZ-6.38)+.02,m.glass,[x,floorY+1.17,(surfaceZ+6.38)/2],64,home);inner.rotation.x=Math.PI/2;inner.material=inner.material.clone();inner.material.side=THREE.BackSide;
    box(1.5,.14,.72,m.paleWood,[x,floorY+.51,surfaceZ-.18],home);
  }
  // Dining-room: one broad table with chairs for an unexpected company.
  const dining=southRooms[0];table(dining,0,0,3.3,1.25,.83);for(let i=0;i<4;i++)for(const side of [-1,1])chair(dining,-1.2+i*.8,side*1.12,side>0?0:Math.PI);
  for(let i=0;i<9;i++){cyl(.13,.13,.025,m.cream,[-1.32+i*.33,.91,0],24,dining);cyl(.04,.05,.14,m.bronze,[-1.32+i*.33,1,.38],16,dining);}ball(.3,m.autumnGold,[.4,1.06,0],[1,.35,1],dining);
  // Parlour, Bilbo's study and bedroom face the garden through deep windows.
  const sitting=southRooms[1];const sofa=box(2.4,.64,.82,m.redCloth,[0,.52,.5],sitting);box(2.4,.7,.2,m.redCloth,[0,.89,.13],sitting);for(const x of [-1.13,1.13])ball(.32,m.coat,[x,.76,.46],[.5,.8,1.25],sitting);table(sitting,0,-.8,1.25,.86,.55);bookcase(sitting,-1.9,.8,.6);
  const study=southRooms[2];table(study,0,.83,2.65,1.02,.83);chair(study,0,-.12,Math.PI);bookcase(study,-1.85,-.53,.7);bookcase(study,1.4,-1.7,1.4);box(.48,.04,.66,m.redCloth,[.48,.93,.74],study);box(.68,.009,.45,m.cream,[-.45,.93,.79],study);beam([-.63,.97,.82],[-.23,1.28,.86],.012,m.cream,study);cyl(.07,.1,.13,m.iron,[-.65,.99,.64],16,study);
  const bedroom=southRooms[3];box(1.6,.4,2.8,m.darkWood,[0,.32,0],bedroom);box(1.5,.21,2.65,m.cream,[0,.64,.02],bedroom);box(1.53,.04,1.6,m.greenCloth,[0,.77,.45],bedroom);ball(.43,m.cream,[0,.86,-.95],[1.5,.32,.67],bedroom);box(1.7,1.05,.14,m.paleWood,[0,.6,-1.4],bedroom);table(bedroom,1.64,-.8,.68,.58,.69);
  // Kitchens, pantries, wardrobe and bathroom lie on the right of the hall.
  const kitchen=room(7,-5.85,4.9,5.35,m.cream);circularDoor(7,hallZ-1.42,-1);table(kitchen,0,0,2.2,1.5,.83);box(1.43,1.48,.92,m.chalk,[1.48,.75,-1.83],kitchen);arch(.71,.87,.18,m.darkWood,[1.48,.26,-1.35],kitchen,.1);box(1.6,.13,1,m.darkWood,[1.48,1.48,-1.83],kitchen);cyl(.36,.4,.15,m.iron,[1.48,1.6,-1.83],32,kitchen);torus(.36,.035,m.iron,[1.48,1.6,-1.83],kitchen).rotation.x=Math.PI/2;
  for(let i=0;i<4;i++){box(1.65,.1,.35,m.paleWood,[-1.4,.48+i*.4,-2.05],kitchen);for(let j=0;j<6;j++){lathe([[.065,0],[.1,.1],[.06,.24],[.06,.27]],j%2?m.cream:m.autumn,[ -2.03+j*.22,.52+i*.4,-2.05],kitchen,16);}}
  const pantry=room(1.5,-5.85,4.9,5.35,m.cream);circularDoor(1.5,hallZ-1.42,-1);
  for(const side of [-1,1])for(let level=0;level<4;level++){box(.64,.075,4.4,m.paleWood,[side*1.88,.42+level*.42,0],pantry);for(let j=0;j<11;j++){const jar=lathe([[.07,0],[.1,.06],[.1,.17],[.05,.21],[.05,.24]],j%3?m.cream:m.autumn,[side*1.88,.47+level*.42,-1.9+j*.36],pantry,16);cyl(.06,.06,.024,m.darkWood,[side*1.88,.72+level*.42,-1.9+j*.36],16,pantry);}}
  for(let i=0;i<8;i++){const x=(i%4-.5)*.45,z=-1.3+Math.floor(i/4)*.8;cyl(.26,.22,.62,m.wood,[x,.35,z],24,pantry);for(const y of [.12,.52])torus(.265,.022,m.iron,[x,y,z],pantry).rotation.x=Math.PI/2;}
  const wardrobe=room(-4,-5.85,4.9,5.35,m.cream);circularDoor(-4,hallZ-1.42,-1);for(const x of [-1.4,.7]){box(1.23,2.2,.79,m.darkWood,[x,1.1,-1.8],wardrobe);box(1.13,2.07,.07,m.paleWood,[x,1.08,-1.36],wardrobe);ball(.04,m.bronze,[x+.31,1.06,-1.3],undefined,wardrobe);}box(1.85,.6,.69,m.wood,[0,.31,.7],wardrobe);for(let i=0;i<4;i++)box(1.7,.02,.55,m.redCloth,[0,.63+i*.028,.7],wardrobe);
  const bath=room(-9,-5.85,4.9,5.35,m.cream);circularDoor(-9,hallZ-1.42,-1);const tub=cyl(.82,.67,.73,m.paleWood,[0,.39,0],64,bath);tub.scale.z=1.55;cyl(.69,.69,.03,m.water,[0,.75,0],64,bath).scale.z=1.56;table(bath,1.53,-1.45,.76,.64,.87);lathe([[.28,0],[.35,.1],[.29,.18]],m.cream,[1.53,.94,-1.45],bath,32);
  // The entrance itself is the recognisable perfectly round green door.
  const entryLeaf=new THREE.Group();entryLeaf.position.set(doorX,doorY,hallZ-1.23);home.add(entryLeaf);let doorAngle=0,doorDestination=0;
  const entrance=cyl(1.23,1.23,.19,m.door,[0,0,1.23],96,entryLeaf);entrance.rotation.z=Math.PI/2;
  const doorRing=torus(1.3,.15,m.paleWood,[doorX+.13,doorY,hallZ],home);doorRing.rotation.y=Math.PI/2;
  const innerRing=torus(1.05,.026,m.darkWood,[.12,0,1.23],entryLeaf);innerRing.rotation.y=Math.PI/2;
  ball(.09,m.gold,[.25,0,1.23],undefined,entryLeaf);entryLeaf.traverse(o=>{if(o.isMesh)o.userData.dynamic=true;});c.animators.push(()=>{doorAngle=mix(doorAngle,doorDestination,.085);entryLeaf.rotation.y=doorAngle;});
  for(let i=0;i<25;i++){const a=i*TAU/25;const stone=box(.27,.28,.3,m.chalk,[doorX+.02,doorY+Math.sin(a)*1.53,hallZ+Math.cos(a)*1.53],home);stone.rotation.x=-a;}
  const porch=new THREE.Group();porch.position.set(doorX+.18,floorY,hallZ);home.add(porch);box(1.45,.13,3.5,m.chalk,[.56,-.03,0],porch);for(let i=0;i<12;i++)box(.35,.17,2.55,[m.chalk,m.rock][i%2],[1.28+i*.22,-.12-i*.075,0],porch);
  lantern(doorX+.22,floorY+1.87,hallZ-1.63,home);
  ribbon([[doorX+4.02,hillSurface(doorX+4.02,hallZ)+.09,hallZ],[doorX+5.92,hillSurface(doorX+5.92,hallZ)+.09,hallZ],[29,hillSurface(29,1.4)+.09,1.4]],1.05,m.earth,home);
  // Continuous terraced gardens and footways belong to one great Hill.
  for(const z of [12.8,16.2,19.1,22.1,25.6])for(let i=0;i<29;i++){const x=-23+i*1.15;if(hillY(x,z)<.15)continue;const y=hillY(x,z)+.055;box(1.04,.07,.69,m.earth,[x,y,z],smial);for(let j=0;j<3;j++)ball(.067,i%3?m.leaf:m.autumnGold,[x-.3+j*.3,y+.11,z],[1,.65,1],smial);}
  for(const radius of [.67,.855,.946]){const walk=[];for(let i=0;i<=55;i++){const a=.11*Math.PI+i/55*.78*Math.PI,x=-3+36*radius*Math.cos(a),z=-6+32*radius*Math.sin(a);walk.push([x,hillY(x,z)+.06,z]);}ribbon(walk,1.0,m.earth,smial);fence(walk.filter((_,i)=>i%3===0).map(q=>[q[0],q[1]-.02,q[2]-.45]),m.paleWood,smial);}
  const doorsOnHill=[...row,...sides];for(const [x,y,color]of doorsOnHill){const z=frontZ(x,y)+.07,g=new THREE.Group();g.position.set(x,y-.83,z);smial.add(g);const leaf=cyl(.64,.64,.12,color,[0,.83,.025],64,g);leaf.rotation.x=Math.PI/2;torus(.71,.087,m.paleWood,[0,.83,.13],g);ball(.045,m.bronze,[.16,.83,.2],undefined,g);for(const side of [-1,1]){const wx=x+side*1.65,wz=frontZ(wx,y+.08)+.09;c.window(wx,y+.08,wz,.32,smial,true);}box(4.5,.16,2.7,m.paleWood,[0,-.08,-1.24],g);for(const side of [-1,1])box(.15,1.8,2.7,m.earth,[side*2.2,.83,-1.23],g);box(4.5,1.75,.14,m.earth,[0,.84,-2.5],g);box(1.25,.13,.66,m.chalk,[0,.02,.48],g);for(let i=0;i<7;i++)box(1.2,.13,.41,m.rock,[0,-.13-i*.34,.83+i*.42],g);box(1.3,.08,.7,m.paleWood,[-1,.67,-1.4],g);for(const side of [-1,1])cyl(.055,.08,.63,m.wood,[-1+side*.45,.31,-1.4],12,g);}
  const hillRoad=[[4,35.5],[18,30],[28,19],[29,9],[25,3],[22,4.3]].map(([x,z])=>[x,Math.max(localGround(x,z),hillY(x,z))+.08,z]);ribbon(hillRoad,1.85,m.earth,smial);
  const westWalk=[[-21,29],[-29,17],[-29,2],[-23,-4]].map(([x,z])=>[x,Math.max(localGround(x,z),hillY(x,z))+.07,z]);ribbon(westWalk,.85,m.earth,smial);
  const water=[];for(let i=0;i<=40;i++){const x=-58+i*2.8;water.push([x,-.015,riverZ(x)]);}ribbon(water,2.6,m.water,smial);
  // Hobbiton occupies both banks of the Water below the great Hill. The Green
  // Dragon belongs to Bywater and is deliberately absent from this settlement.
  const villageTools=settlementTools(c),villageFootprints=[],villageRoads=[],villageDistricts=['Wzgórze i Bagshot Row','Północny brzeg i Stary Młyn','Stara Grange i ogrody','Południowy brzeg Wody','Dalsze nory i sady'];
  const villageRoad=(points,width=.95)=>{const pts=points.map(([x,z])=>[x,localGround(x,z)+.085,z]);ribbon(pts,width,m.earth,smial);villageRoads.push({points:pts,width});};
  const lowerSmial=(x,z,angle=0,variant=0,district=villageDistricts[1])=>{
    const h=new THREE.Group(),y=localGround(x,z)+.025,w=5.1+(variant%3)*.45,deep=4.4+(variant%2)*.5;h.position.set(x,y,z);h.rotation.y=angle;smial.add(h);h.name=`Hobbiton — ${district} ${villageFootprints.length+1}`;
    const mound=ball(1,m.grass,[0,.1,-.8],[w*.56,1.75+variant%3*.16,deep*.58],h),p=mound.geometry.attributes.position;
    // A clipped earthen mound has an actual flat front for the round façade.
    // The door, windows, garden and footpath all belong to this one small home.
    for(let i=0;i<p.count;i++)p.setZ(i,Math.min(p.getZ(i),.62));mound.geometry.computeVertexNormals();
    box(w,1.45,.26,m.earth,[0,.7,.88],h);const color=[m.door,m.redDoor,c.mat('#507580'),c.mat('#9b823c')][variant%4];
    const leaf=cyl(.61,.61,.14,color,[0,.76,1.06],48,h);leaf.rotation.x=Math.PI/2;torus(.69,.1,m.paleWood,[0,.76,1.16],h);ball(.049,m.bronze,[0,.76,1.25],undefined,h);
    for(const side of [-1,1]){c.window(side*w*.31,.89,1.06,.31+variant%2*.03,h,true);ball(.26,variant%2?m.autumnGold:m.leaf,[side*w*.46,.25,1.42],[1.6,.65,1.1],h);}
    box(1.35,.13,1.05,m.chalk,[0,.04,1.58],h);if(variant%3===1){const porch=new THREE.Group();porch.position.z=1.7;h.add(porch);villageTools.roof(2.15,.48,1.4,m.thatch,1.61,porch);for(const side of [-1,1])box(.09,1.67,.09,m.paleWood,[side*.82,.82,.4],porch);}
    if(variant%3===2){box(.31,1.3,.35,m.rock,[-w*.25,1.73,-.88],h);box(.47,.13,.5,m.chalk,[-w*.25,2.35,-.88],h);}
    const localPath=[[0,.07,2],[0,.07,3.2],[.4,.07,4.25]];ribbon(localPath,.72,m.earth,h);
    for(let row=0;row<3;row++){box(1.35,.055,.4,m.earth,[w*.57,.07,-.9+row*.6],h);for(let j=0;j<4;j++)ball(.065,row%2?m.leaf:m.autumnGold,[w*.57-.42+j*.28,.16,-.9+row*.6],[1,.65,1],h);}
    villageFootprints.push({x,z,y,w:w*1.12,d:deep*1.16,height:2.65,angle,district,kind:'hobbit-hole'});return h;
  };
  // Four staggered rows, with space reserved for the bridge, mill, Grange and
  // party field, create a lived-in village rather than isolated façades.
  for(let i=0;i<13;i++){
    const x=-46+i*8.1;
    if(Math.abs(x-4)>4&&Math.abs(x-14)>8&&!(x>-16&&x<0))lowerSmial(x,riverZ(x)-7.3,(i%3-1)*.035,i,villageDistricts[1]);
    lowerSmial(x,riverZ(x)+9.1,Math.PI+(i%3-1)*.035,i+13,villageDistricts[3]);
  }
  for(let i=0;i<12;i++){
    const x=-44+i*8.3;if(x>-39&&x<-24||x>-16&&x<2)continue;
    lowerSmial(x,riverZ(x)-14.1,(i%3-1)*.05,i+27,villageDistricts[2]);
  }
  for(let i=0;i<8;i++){const x=-41+i*11.7;lowerSmial(x,riverZ(x)+17.2,Math.PI+(i%2-.5)*.065,i+40,villageDistricts[4]);}
  const bankPath=(offset)=>Array.from({length:25},(_,i)=>{const x=-50+i*4.2;return[x,riverZ(x)+offset];});
  villageRoad(bankPath(-3.55),1.3);villageRoad(bankPath(4.65),1.35);villageRoad(bankPath(-10.75),.9);villageRoad(bankPath(13.75),.95);
  for(const x of [-42,-25,-8,4,22,39,49]){
    villageRoad([[x,riverZ(x)-14.1],[x,riverZ(x)-10.75],[x+2.8,riverZ(x)-7.6],[x+2.8,riverZ(x)-3.55]],.72);
    villageRoad([[x,riverZ(x)+4.65],[x+3.8,riverZ(x)+8.0],[x+3.8,riverZ(x)+13.75],[x+6,riverZ(x)+17.2]],.75);
  }
  // The old mill is a substantial working building on the north bank, with
  // its own granary, mill race and an animated wheel on the river side.
  const millZ=riverZ(12)-7.2,millY=localGround(12,millZ),oldMill=villageTools.dwelling(12,millY,millZ,5.4,4.4,3.0,'stone',Math.PI-.05,2,smial);oldMill.name='Stary Młyn — północny brzeg, spichlerz i koło wodne';
  const granary=villageTools.dwelling(18,localGround(18,millZ-2.5),millZ-2.5,3.5,3.6,2.2,'bree',0,0,smial);granary.name='Spichlerz Starego Młyna';
  villageFootprints.push({x:12,z:millZ,y:millY,w:5.9,d:5.1,height:6.2,angle:Math.PI-.05,district:villageDistricts[1],kind:'mill'},{x:18,z:millZ-2.5,y:granary.position.y,w:4,d:4.1,height:4.7,angle:0,district:villageDistricts[1],kind:'granary'});
  const wheel=new THREE.Group();wheel.position.set(15.2,localGround(15.2,riverZ(15.2)-2)+1.05,riverZ(15.2)-2);wheel.rotation.y=Math.PI/2;smial.add(wheel);torus(1.3,.085,m.darkWood,[0,0,0],wheel);torus(1.16,.05,m.paleWood,[0,0,.37],wheel);for(let i=0;i<16;i++){const a=i*TAU/16;beam([0,0,0],[Math.sin(a)*1.26,Math.cos(a)*1.26,0],.045,m.paleWood,wheel);const paddle=box(.41,.16,.5,m.wood,[Math.sin(a)*1.29,Math.cos(a)*1.29,.18],wheel);paddle.rotation.z=-a;}wheel.traverse(o=>{if(o.isMesh)o.userData.dynamic=true;});c.animators.push(t=>{wheel.rotation.z=t*.12;});
  ribbon([[16,localGround(16,millZ)+.03,millZ],[15.2,localGround(15.2,riverZ(15.2)-2)+.03,riverZ(15.2)-2],[16,-.01,riverZ(16)+.2]],.85,m.water,smial);
  const bridge=[];for(let i=0;i<=30;i++){const t=i/30;bridge.push([4,.2+Math.sin(t*Math.PI)*.85,35.5+t*10]);}ribbon(bridge,2.3,m.chalk,smial);for(const side of [-1,1]){tube(bridge.map(p=>[p[0]+side*1.13,p[1]+.63,p[2]]),.065,m.rock,smial);for(let i=0;i<bridge.length;i+=3)box(.13,.63,.18,m.chalk,[4+side*1.12,bridge[i][1]+.3,bridge[i][2]],smial);}villageRoads.push({points:bridge,width:2.3});
  villageRoad([[18,30],[8,31],[4,35.5]],1.4);villageRoad([[4,45.5],[4,riverZ(4)+13.75],[8,59],[25,72]],1.5);
  const grangeZ=28.2,grangeY=localGround(-9,grangeZ),grange=villageTools.dwelling(-9,grangeY,grangeZ,5.4,5.9,2.7,'stone',.06,1,smial);grange.name='Stara Grange — na zachód od drogi pod Wzgórze';
  const barn=new THREE.Group();barn.position.set(-15,localGround(-15,grangeZ-1.4),grangeZ-1.4);smial.add(barn);box(3.9,2.1,4.5,m.wood,[0,1.05,0],barn);c.gable(3.9,1.2,4.5,m.paleWood,[0,2.1,-2.25],barn);c.roof(4.3,1.3,5,m.thatch,2.1,barn);box(1.4,1.75,.12,m.darkWood,[0,.88,2.28],barn);
  villageFootprints.push({x:-9,z:grangeZ,y:grangeY,w:7.8,d:7.2,height:5.4,angle:.06,district:villageDistricts[2],kind:'grange'},{x:-15,z:grangeZ-1.4,y:barn.position.y,w:4.3,d:5,height:3.5,angle:0,district:villageDistricts[2],kind:'barn'});
  villageRoad([[-15,31],[-9,33],[-2,33],[4,35.5]],1.0);
  const party=new THREE.Group();party.position.set(-30,localGround(-30,28)+.05,28);smial.add(party);tree(0,0,0,1.05,'oak',party);for(const z of [-2.3,2.3]){box(3.8,.12,.9,m.paleWood,[4,.76,z],party);for(const x of [2.5,5.5])box(.14,.72,.62,m.wood,[x,.36,z],party);}villageRoad([[-30,28],[-30,32],[-28,riverZ(-28)-3.55]],.8);

  const orchard=[];for(let row=0;row<4;row++)for(let j=0;j<6;j++){const lx=-43+j*4.2,lz=1+row*4.4;orchard.push([cr*lx+sr*lz,-sr*lx+cr*lz-1,.7+rnd()*.25]);}for(let i=0;i<90;i++){const a=rnd()*TAU,r=34+rnd()*31,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(sr*x+cr*(z+1)-riverZ(cr*x-sr*(z+1)))>5)orchard.push([x,z,.8+rnd()*1.5]);}c.distantTrees((x,z)=>Math.max(ground(x,z),hillY(cr*x-sr*(z+1),sr*x+cr*(z+1))),orchard);
  for(let i=0;i<13;i++){const a=i*TAU/13,x=Math.sin(a)*19,z=Math.cos(a)*19;if(z<13&&hillY(cr*x-sr*(z+1),sr*x+cr*(z+1))<.1)tree(x,ground(x,z),z,.75+rnd()*.9,'oak');}
  grass(ground,(x,z)=>Math.hypot(x,z)>38&&z<12,4800,73);
  for(const x of [12,4,-5])lantern(x,floorY+1.87,hallZ-1.14,smial);
  smial.updateMatrixWorld(true);const worldPoint=p=>smial.localToWorld(V(...p)).toArray(),homePoint=p=>home.localToWorld(V(...p)).toArray();
  const tours=[
    {title:'Zielone drzwi pod Wzgórzem',position:homePoint([doorX+3.3,4.0,hallZ+.2]),target:homePoint([doorX,doorY,hallZ]),text:'Mosiężna gałka leży w środku okrągłych zielonych drzwi. Dom zajmuje górny stok wspólnego, wielkiego Pagórka.',cutaway:false},
    {title:'Długi hall Bag End',position:homePoint([13.9,floorY+1.22,hallZ]),target:homePoint([1,floorY+1.13,hallZ]),text:'Polerowane drewno, dywany i wieszaki prowadzą niemal prosto w głąb Wzgórza; okrągłe przejścia otwierają się po obu stronach.',cutaway:false},
    {title:'Spiżarnie Bilba',position:homePoint([2.5,floorY+1.24,-4.28]),target:homePoint([.8,floorY+.96,-6.6]),text:'Półki z glinianymi naczyniami, zapasy i beczki zajmują chłodne pomieszczenia po prawej stronie hallu.',cutaway:false},
    {title:'Jadalnia i niespodziewani goście',position:homePoint([5.35,floorY+1.25,2.31]),target:homePoint([7.6,floorY+.94,4.45]),text:'Najlepsze pokoje wychodzą na ogród. W dużej jadalni stół czeka na przybyszów.',cutaway:false},
    {title:'Pracownia i Czerwona Księga',position:homePoint([-5.4,floorY+1.25,2.4]),target:homePoint([-3.6,floorY+.91,4.82]),text:'Biurko, atrament i księgi zamieniają dom podróżnika w miejsce zapisywania opowieści.',cutaway:false},
    {title:'Sypialnia we Wzgórzu',position:homePoint([-10.6,floorY+1.28,2.31]),target:homePoint([-8.65,floorY+.85,4.3]),text:'Wszystkie pokoje pozostają na jednym poziomie. Łóżko i głębokie okno należą do tej samej wygodnej nory.',cutaway:false},
    {title:'Tarasowy ogród Bag End',position:worldPoint([5,hillY(5,13.8)+1.5,13.8]),target:worldPoint([-3,hillY(-3,12.8)+.35,12.8]),text:'Warzywne grządki, kwiaty i niski płot schodzą ku rzece u stóp Wzgórza.',cutaway:false},
    {title:'Przekrój całego smialu',position:homePoint([29,26,22]),target:homePoint([2,3,-1]),text:'Przekrój pokazuje długi hall i odchodzące od niego sklepione pomieszczenia. Układ wnętrz jest interpretacją opartą na opisie Hobbita.',cutaway:true},
    {title:'Hobbiton po obu brzegach Wody',position:worldPoint([4,2.55,40.6]),target:worldPoint([0,11,6]),text:'Most łączy dwie części osady. Stary Młyn stoi na północnym brzegu, a Bag End góruje dalej ponad ogrodami i łąkami.',cutaway:false},
    {title:'Sady i rozległy krajobraz Shire',position:worldPoint([56,23,57]),target:worldPoint([0,5.5,8]),text:'Pagórek, Bagshot Row, pola i Hobbiton mają odrębne miejsce w krajobrazie. Droga biegnie dalej ku osobnemu Bywater.',cutaway:false},
  ];
  tours.push({title:'Trzy domy Bagshot Row',position:worldPoint([-4,4.65,27.1]),target:worldPoint([-4,3.8,23.9]),text:'Trzy mniejsze domy mają osobny dolny poziom we wspólnym Wzgórzu. Ogrody, ziemne murki i stopnie prowadzą ku Wodzie.',cutaway:false},{title:'Boczne stoki i ścieżka ogrodowa',position:worldPoint([-29,9.9,10]),target:worldPoint([-20,8.8,10]),text:'Inne fasady są wkopane w boczne stoki tej samej dużej bryły. Wąska ścieżka schodzi zachodnią stroną ku łąkom.',cutaway:false});
  tours.push(
    {title:'Południowy brzeg Hobbitonu',position:worldPoint([-8,localGround(-8,riverZ(-8)+4.65)+1.65,riverZ(-8)+4.65]),target:worldPoint([-8,localGround(-8,riverZ(-8)+9)+.9,riverZ(-8)+9]),text:'Drugi brzeg ma własne okrągłe fasady, ogrody i dwie połączone aleje. Cała osada rozwija się wzdłuż Wody.',cutaway:false},
    {title:'Stary Młyn i spichlerz',position:worldPoint([12,localGround(12,riverZ(12)-3.55)+1.65,riverZ(12)-3.55]),target:worldPoint([14,2.3,millZ]),text:'Duży młyn stoi na północnym brzegu. Spichlerz, młynówka i obracające się koło tworzą jeden gospodarczy zespół.',cutaway:false},
    {title:'Stara Grange i wspólne ogrody',position:worldPoint([-9,localGround(-9,34)+1.65,34]),target:worldPoint([-9,grangeY+1.5,grangeZ]),text:'Grange, drewniana stodoła i boczne ogrody zajmują zachodnią część osady. Konkretne plany posesji stanowią interpretację.',cutaway:false}
  );
  const cityBox=new THREE.Box3().setFromObject(home);for(const f of villageFootprints)for(const sx of [-1,1])for(const sz of [-1,1])for(const y of [f.y,f.y+f.height]){const x=f.x+Math.cos(f.angle)*sx*f.w/2+Math.sin(f.angle)*sz*f.d/2,z=f.z-Math.sin(f.angle)*sx*f.w/2+Math.cos(f.angle)*sz*f.d/2;cityBox.expandByPoint(V(...worldPoint([x,y,z])));}cityBox.expandByScalar(.8);
  const info=finish(worldPoint([82,62,102]),worldPoint([0,7,12]),'#a8b6a0','#c0c9af',[-45,75,50],tours);info.cutawayCamera=homePoint([29,26,22]);info.cutawayTarget=homePoint([2,3,-1]);
  info.cityBounds={min:cityBox.min.toArray(),max:cityBox.max.toArray()};info.planTarget=worldPoint([0,6,10]);
  info.buildingFootprints=villageFootprints.map(f=>{const p=worldPoint([f.x,f.y,f.z]);return{...f,x:p[0],y:p[1],z:p[2],angle:f.angle+rotation};});info.roads=villageRoads.map(r=>({...r,points:r.points.map(worldPoint)}));
  info.settlement={buildings:villageFootprints.length+7,hillHomes:7,bagEndRooms:8,hobbitHoles:villageFootprints.filter(f=>f.kind==='hobbit-hole').length,districts:villageDistricts,interpretation:'Wzgórze i wnętrze Bag End zachowują wcześniejszy model. Dwa brzegi Wody, Stary Młyn, most i Grange wynikają z opisu; liczba i szczegółowe plany małych nor, ogrodów oraz dalszych alejek są autorską interpretacją pełnej osady.'};
  info.setTour=index=>{doorDestination=index>0&&index<6?1.27:0;};return info;
}

function bree() {
  const c=context(1431),{group,m,rnd,box,ball,cyl,beam,torus,ribbon,lantern,finish}=c,{block,dwelling,lane,court}=settlementTools(c);
  group.name='Bree — sto kamiennych domów zachodniego zbocza';
  const hill=(x,z)=>12.4*Math.exp(-((x-32)**2/250+(z+10)**2/620));
  const height=(x,z)=>.28+.11*Math.sin(x*.11)*Math.cos(z*.09)+hill(x,z)+.7*clamp((Math.hypot(x,z)-42)/24,0,1);
  c.landscape(70,height,m.grassDark,192,[1.08,1],{low:'#65734b',rockAt:19});
  const footprints=[],roads=[],districts=['Dolne Bree i rynek','Trzy uliczki zachodniego stoku','Podwórza rzemieślników','Górne kamienne domy','Hobbickie nory na Bree-hill'];
  const road=(points,width,material=m.rock)=>{lane(points,width,height,material);roads.push({points:points.map(([x,z])=>[x,height(x,z)+.09,z]),width});};
  // The authored plan has a western and a southern gate. Greenway crosses
  // the East Road outside Bree; its position is not a fourth village street.
  road([[-73,20],[-57,20],[-43,20],[-37,20],[-31,21],[-27,24],[-22,30],[-12,34],[-5,35],[4,48],[35,62],[70,62]],3.5);
  road([[-57,-66],[-57,-25],[-57,20],[-56,41],[-54,65]],2.9,m.earth);
  const streets=[z=>-18+Math.sin(z*.105)*2,z=>-1+Math.sin(z*.11+.8)*2.4,z=>16+Math.sin(z*.092+1.4)*2.6];
  streets.forEach((fn,i)=>road(Array.from({length:15},(_,j)=>{const z=-32+j*4.5;return[fn(z),z];}),i===0?2.6:2.1));
  const crossingZ=[-27.45,-12.15,3.15,23.55];for(const z of crossingZ)road([[-34,z],[streets[0](z),z],[streets[1](z),z],[streets[2](z),z],[29,z]],1.25);
  const addHouse=(x,z,w,d,tall,angle,variant,district)=>{const y=height(x,z);const h=dwelling(x,y,z,w,d,tall,'bree',angle,variant);h.name=`Bree ${district} ${footprints.length+1}`;footprints.push({x,z,y,w:w+.5,d:d+.5,height:tall+w*.4+1.7,angle,district});return h;};
  // Six continuous frontage rows fill the town. The different plots have
  // workshops, porches, rear wings and second floors, instead of one cottage.
  for(let street=0;street<3;street++)for(let row=0;row<12;row++)for(const side of [-1,1]){
    const z=-30+row*5.1,x=streets[street](z)+side*5.0;
    if(street===0&&side===-1&&(z>7&&z<20||z>-19&&z<-10||z>25))continue;
    let variant=(street*17+row*5+(side>0?2:0))%4;if(variant===1&&crossingZ.some(q=>Math.abs(q-z)<3.3))variant=0;
    addHouse(x,z,3.05+rnd()*.48,3.35+rnd()*.55,2.65+(row+street)%3*.68,side<0?Math.PI/2:-Math.PI/2,variant,districts[street===2?3:1]);
  }
  for(let row=0;row<12;row++){
    const z=-30+row*5.15;if(z>-20&&z<-7||Math.abs(z-20)<3.8)continue;
    addHouse(-34+Math.sin(z*.1)*.7,z,3.3,4.4,3.1+(row%2)*1.3,Math.PI/2,row%4,districts[2]);
  }
  for(let row=0;row<12;row++){
    const z=-29+row*4.85,x=28+Math.sin(z*.12)*1.2;
    addHouse(x,z,2.65+rnd()*.32,3.05,2.5+(row%3)*.45,-Math.PI/2,row%4,districts[3]);
  }
  for(const x of [-32,-24,-16,-8,0,8])addHouse(x,-34.4,3.25,3.2,3.0+(x===0?.9:0),0,0,districts[2]);
  road([[-35,-32.3],[-20,-32.3],[-4,-32.3],[11,-32.3]],.85);
  // Back yards have real gates, sheds, stacked firewood and vegetable beds.
  for(let i=0;i<15;i++){
    const z=[-22,-8,5,18,29][Math.floor(i/3)],x=i%3===0?-29:(streets[i%3-1](z)+streets[i%3](z))/2,y=height(x,z);
    const shed=new THREE.Group();shed.position.set(x,y,z);group.add(shed);block(2,1.65,1.8,m.wood,[0,.83,0],shed);c.roof(2.3,.7,2.2,m.roof,1.68,shed);
    footprints.push({x,z,y,w:2.3,d:2.2,height:2.5,angle:0,district:districts[2],kind:'outbuilding'});
    for(let j=0;j<4;j++){block(2.3,.08,.45,m.earth,[x,height(x,z+2.2+j*.6)+.05,z+2.2+j*.6]);for(let k=0;k<4;k++)ball(.09,m.leaf,[x-.8+k*.5,height(x,z+2.2+j*.6)+.17,z+2.2+j*.6],[1,.55,1]);}
    for(let j=0;j<5;j++)beam([x+1.8,y+.2+j*.14,z-1],[x+1.8,y+.2+j*.14,z+1],.07,m.wood);
  }
  // The Prancing Pony: a three-storey roadside front and two rear wings.
  const inn=new THREE.Group();inn.position.set(-32,height(-32,-14),-14);inn.rotation.y=Math.PI/2;group.add(inn);inn.name='Pod Rozbrykanym Kucykiem — trzy kondygnacje, łuk i gospodarcze skrzydła';
  block(8.8,2.3,4.5,m.chalk,[0,1.15,0],inn);block(8.8,4.4,4.5,m.cream,[0,4.5,0],inn);c.gable(8.8,2.4,4.5,m.cream,[0,6.7,-2.25],inn);c.roof(9.3,2.5,5.05,m.roof,6.7,inn);
  for(const x of [-4.35,-2.2,0,2.2,4.35])block(.17,4.5,4.65,m.darkWood,[x,4.5,0],inn);for(const y of [2.3,4.5,6.7])block(8.96,.16,4.66,m.darkWood,[0,y,0],inn);
  for(let floor=0;floor<3;floor++)for(const x of [-3.3,-1.3,1.3,3.3]){if(floor===0&&Math.abs(x)<2)continue;c.window(x,1.05+floor*2.17,2.3,.59,inn);}
  c.arch(2.1,2.3,.28,m.darkWood,[-1.1,.02,2.27],inn,.19);block(1.1,1.96,.14,m.wood,[1.35,1,2.33],inn);
  for(const side of [-1,1]){
    const wing=new THREE.Group();wing.position.set(side*3.45,0,-6);inn.add(wing);block(2,4.3,7.5,m.chalk,[0,2.15,0],wing);c.gable(2,1.25,7.5,m.cream,[0,4.3,-3.75],wing);c.roof(2.4,1.37,8,m.roof,4.3,wing);
    for(const z of [-2.7,-.6,1.5])for(const y of [1.1,3.05]){const w=new THREE.Group();w.position.set(-side*1.03,y,z);w.rotation.y=-side*Math.PI/2;wing.add(w);c.window(0,0,0,.48,w);}
  }
  court(0,.04,-5.5,4.7,7.6,inn);for(let i=0;i<9;i++){cyl(.3,.32,.7,m.wood,[-1.6+(i%3)*.72,.39,-8+Math.floor(i/3)*.72],16,inn);}
  block(.65,4,.7,m.rock,[-3.2,7.7,-1],inn);block(.9,.2,.95,m.chalk,[-3.2,9.65,-1],inn);
  beam([1.35,2.7,2.38],[1.35,2.7,3.5],.055,m.iron,inn);block(1.1,.88,.12,m.paleWood,[1.35,2.2,3.45],inn);ball(.22,m.darkWood,[1.35,2.25,3.53],[1.05,.48,.2],inn);beam([1.45,2.3,3.55],[1.58,2.6,3.55],.045,m.darkWood,inn);ball(.07,m.darkWood,[1.62,2.6,3.55],[1.1,.6,.3],inn);lantern(1.2,1.95,2.65,inn);lantern(-2.3,1.8,2.65,inn);
  footprints.push({x:-32,z:-14,y:inn.position.y,w:9.3,d:5.05,height:9.8,angle:Math.PI/2,district:districts[0],kind:'inn',parts:[{x:-38,z:-17.45,w:2.4,d:8,angle:Math.PI/2},{x:-38,z:-10.55,w:2.4,d:8,angle:Math.PI/2}]});
  road([[-19,-14],[-23,-14],[-29,-14]],2.4);road([[-29,-3],[-29,3],[-28,8]],1.8);
  const marketY=height(-26,13);court(-26,marketY+.09,13,12.3,10.2);
  cyl(.82,.9,.85,m.rock,[-26,marketY+.42,13],32);cyl(.63,.63,.9,m.black,[-26,marketY+.47,13],32);torus(.83,.11,m.chalk,[-26,marketY+.92,13]).rotation.x=Math.PI/2;
  for(const x of [-27.15,-24.85])block(.16,2.6,.16,m.wood,[x,marketY+1.3,13]);beam([-27.2,marketY+2.6,13],[-24.8,marketY+2.6,13],.09,m.wood);beam([-26,marketY+2.6,13],[-26,marketY+.7,13],.021,m.paleWood);
  for(let i=0;i<4;i++){const x=-30+i*2.6,z=16.5,y=height(x,z);const stall=new THREE.Group();stall.position.set(x,y,z);group.add(stall);block(1.95,.12,1.2,m.paleWood,[0,.8,0],stall);for(const side of [-1,1])block(.09,2,.09,m.wood,[side*.85,1,-.55],stall);c.roof(2.2,.6,1.7,i%2?m.redRoof:m.thatch,2,stall);for(let j=0;j<5;j++)ball(.08,m.autumnGold,[-.7+j*.35,.94,0],undefined,stall);}
  // Hobbit homes occupy the high slope above the stone town.
  for(let i=0;i<7;i++){const x=35+(i%2)*1.2,z=-25+i*7.4,y=height(x,z),h=new THREE.Group();h.position.set(x,y,z);h.rotation.y=-Math.PI/2;group.add(h);ball(1,m.grass,[0,.22,-1],[2.35,1.6,2.1],h);block(3.8,1.35,.28,m.earth,[0,.68,.85],h);const p=cyl(.55,.55,.1,i%2?m.door:m.redDoor,[0,.7,1.04],32,h);p.rotation.x=Math.PI/2;torus(.62,.09,m.paleWood,[0,.7,1.11],h);for(const side of [-1,1])c.window(side*1.15,.8,1.04,.26,h,true);road([[x,z],[31,z],[28,z]],.9,m.earth);footprints.push({x,z,y,w:4.6,d:4.3,height:2,angle:-Math.PI/2,district:districts[4],kind:'hobbit-hole'});}
  // A continuous hedge and ditch enclose the town footprint, ending at the hill.
  const boundaryPlan=[[-43,22],[-41,-34],[-30,-37],[14,-37],[36,-31],[42,-10],[40,16],[29,32],[-5,35],[-34,35],[-43,22]],boundary=[];
  for(let j=0;j<boundaryPlan.length-1;j++){const a=boundaryPlan[j],b=boundaryPlan[j+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.1);for(let i=0;i<n;i++){const t=i/n,x=mix(a[0],b[0],t),z=mix(a[1],b[1],t);boundary.push([x,height(x,z)+.02,z]);}}
  ribbon(boundary,1.25,m.earth);for(const p of boundary){if(Math.hypot(p[0]+43,p[2]-20)<3.4||Math.hypot(p[0]+5,p[2]-35)<3.8)continue;ball(.6,m.darkLeaf,[p[0],p[1]+.62,p[2]],[.9,1.2,.95]);}
  const gate=(x,z,angle)=>{const g=new THREE.Group();g.position.set(x,height(x,z),z);g.rotation.y=angle;group.add(g);for(const side of [-1,1]){block(.45,3.7,.45,m.wood,[side*2.3,1.85,0],g);lantern(side*2.3,2,.25,g);}beam([-2.3,3.5,0],[2.3,3.5,0],.17,m.wood,g);};gate(-43,20,Math.PI/2);gate(-5,35,0);
  const woods=[];for(let i=0;i<55;i++){const a=rnd()*TAU,r=48+rnd()*20,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x+57)>4&&Math.abs(z-62)>4)woods.push([x,z,.7+rnd()*1.05]);}c.distantTrees(height,woods);
  c.grass(height,(x,z)=>Math.hypot(x,z)>47&&Math.abs(x+57)>4,2500,68);
  const tours=[
    {title:'Droga pod Kucykiem',position:[-23,height(-23,-14)+1.75,-14],target:[-29.6,inn.position.y+4,-14],text:'Trzy kondygnacje gospody wyrastają przy drodze. Dwa gospodarcze skrzydła obejmują prawdziwy dziedziniec na zboczu.'},
    {title:'Dziedziniec zajazdu',position:[-38,inn.position.y+1.75,-14],target:[-34,inn.position.y+2,-14],text:'Łuk, beczki i okna skrzydeł prowadzą do osłoniętej przestrzeni za frontem Pod Rozbrykanym Kucykiem.'},
    {title:'Zachodnia brama i żywopłot',position:[-48,height(-48,20)+1.75,20],target:[-43,height(-43,20)+1.85,20],text:'Wielki Gościniec wchodzi od zachodu. Droga skręca w osadzie i opuszcza ją południową bramą.'},
    {title:'Nory wysoko na Bree-hill',position:[31.8,height(31.8,-10)+1.75,-10],target:[36,height(36,-10)+.85,-10],text:'Nory hobbitów zajmują górny stok nad kamiennymi domami ludzi. Liczba i rozkład konkretnych fasad są interpretacją.'},
    {title:'Greenway poza osadą',position:[-57,height(-57,26)+1.75,26],target:[-57,height(-57,13)+1,13],text:'Zielona Droga przecina Wielki Gościniec poza zachodnią bramą; nie przebiega przez rynek Bree.'},
    {title:'Bree — pełny plan osady',position:[-57,38,58],target:[-1,7,0],text:'Trzy kręte uliczki, podwórza, rynek, gospodarcze budynki i hobbickie nory wypełniają zachodnie zbocze. Plan rozwija opis i autorski szkic Tolkiena.'},
    {title:'Rynek z kamienną studnią',position:[-26,marketY+1.75,10],target:[-26,marketY+1.1,13],text:'Otwarty plac łączy stoiska, studnię i dolną ulicę. Zabudowa ma własne podwórza i przejścia.'},
    {title:'Środkowa uliczka rzemieślników',position:[streets[1](-18),height(streets[1](-18),-18)+1.75,-18],target:[streets[1](-6),height(streets[1](-6),-6)+2,-6],text:'Warsztaty, dwukondygnacyjne domy i boczne zaułki wypełniają środkową część osady.'},
    {title:'Górna kamienna ulica',position:[streets[2](15),height(streets[2](15),15)+1.75,15],target:[streets[2](0),height(streets[2](0),0)+2,0],text:'Trzecia ulica wznosi się nad dolnym Bree. Domy zwracają drzwi ku drodze; wyżej zaczynają się nory hobbitów.'},
    {title:'Południowa brama',position:[-5,height(-5,40)+1.75,40],target:[-5,height(-5,35)+1.8,35],text:'Gościniec opuszcza zabudowaną osadę przez południową bramę i biegnie dalej przez Bree-land.'},
  ];
  const info=finish([-62,45,69],[-2,5,-2],'#8b9992','#b1b7a3',[-45,80,35],tours);
  info.cityBounds={min:[-44,0,-38],max:[43,22,36]};info.planTarget=[-2,4,-1];info.buildingFootprints=footprints;info.roads=roads;info.settlement={buildings:footprints.length,dwellings:footprints.filter(f=>!f.kind).length,hobbitHoles:7,districts,interpretation:'Rozmieszczenie pojedynczych posesji, proporcje i rzemieślnicze podwórza stanowią interpretację. Zachodnie zbocze, trzy uliczki, rów, żywopłot i dwie bramy opierają się na Planie Bree i opisach książkowych.'};return info;
}

function roofInn(c,parent){c.roof(4.1,.46,2.12,c.m.roof,2.17,(()=>{const g=new THREE.Group();g.position.z=2;parent.add(g);return g;})());}

function rivendell(){
  const c=context(2209),{group,m,rnd,ball,cyl,cone,beam,tube,ribbon,rock,tree,waterfall,finish}=c;
  const a=settlementTools(c),{block,roof,gable,steps,court}=a,buildings=[],roads=[];
  group.name='Imladris — Great House, five inhabited valley terraces and the Bruinen';
  const roofs=c.mat('#427575',.74),paleRoof=c.mat('#648783',.75),gardenStone=c.mat('#a7b2a0',.92),moss=c.mat('#4d6243',.97);
  // Narrow pointed openings and softly rising copper eaves give Imladris
  // its own architectural language at every scale, including guest rooms.
  const arch=(w,h,depth,material,pos,parent=group,thickness=.11)=>{
    const r=w/2,s=h*.51,t=thickness,shape=new THREE.Shape();shape.moveTo(-r,0);shape.lineTo(-r,s);shape.quadraticCurveTo(-r,h*.81,0,h);shape.quadraticCurveTo(r,h*.81,r,s);shape.lineTo(r,0);shape.lineTo(r-t,0);shape.lineTo(r-t,s);shape.quadraticCurveTo(r-t,h*.77,0,h-t*2);shape.quadraticCurveTo(-r+t,h*.77,-r+t,s);shape.lineTo(-r+t,0);shape.closePath();
    return c.mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:1,curveSegments:15}),material,pos,undefined,parent);
  };
  const elvenRoof=(w,rise,d,material,y,parent)=>{
    const profile=t=>rise*(1-t)**1.34+Math.min(.62,rise*.28)*t**10;
    for(const side of [-1,1]){
      const p=[],uv=[],indices=[],nx=22,nz=8;
      for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const t=i/nx,z=mix(-d/2,d/2,j/nz);p.push(side*t*w/2,y+profile(t)+.2*(Math.abs(z)/(d/2))**9,z);uv.push(t,j/nz);if(i<nx&&j<nz){const n=j*(nx+1)+i;indices.push(n,n+1,n+nx+1,n+1,n+nx+2,n+nx+1);}}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();material.side=THREE.DoubleSide;c.mesh(geo,material,undefined,undefined,parent);
      const eave=[];for(let j=0;j<=12;j++){const z=mix(-d/2,d/2,j/12);eave.push([side*w/2,y+profile(1)+.2*(Math.abs(z)/(d/2))**9,z]);}tube(eave,.047,m.gold,parent,28);
      for(const z of [-d/2,d/2]){const rib=[];for(let j=0;j<=12;j++){const t=j/12;rib.push([side*t*w/2,y+profile(t)+.23,z]);}tube(rib,.033,m.gold,parent,28);}
    }
    tube([[0,y+rise+.18,-d/2-.25],[0,y+rise+.06,-d*.34],[0,y+rise+.05,0],[0,y+rise+.06,d*.34],[0,y+rise+.18,d/2+.25]],.07,m.gold,parent,32);
    for(const side of [-1,1]){tube([[0,y+rise+.18,side*(d/2+.18)],[0,y+rise+.38,side*(d/2+.4)],[0,y+rise+.73,side*(d/2+.62)]],.043,m.gold,parent,12);ball(.1,m.gold,[0,y+rise+.76,side*(d/2+.62)],[.55,1.6,.75],parent);}
  };
  const terraces=[
    {name:'Dom Elronda',x:-21,z:-16,w:41,d:29,y:11.5},
    {name:'Domy gościnne',x:-29,z:15,w:25,d:25,y:7.7},
    {name:'Ogrody nadrzeczne',x:-8.5,z:25,w:16,d:25,y:5.2},
    {name:'Biblioteki i krużganki',x:23,z:-12,w:24,d:24,y:9.5},
    {name:'Dolny wschodni dziedziniec',x:23,z:21,w:26,d:27,y:5.2},
  ];
  const riverX=z=>7.1+1.15*Math.sin(z*.082)+.025*Math.max(z-32,0);
  const height=(x,z)=>{
    let y=.22+2.4*Math.exp(-((x+29)**2/540+(z-5)**2/650))+3.2*Math.exp(-((x-30)**2/570+(z+8)**2/580));
    y+=Math.max(0,Math.abs(x)-42)*.65+18*Math.exp(-((z+52)**2)/102)*(.55+.45*Math.cos(x*.071)**2);
    for(const t of terraces){const outside=Math.max(Math.abs(x-t.x)-t.w/2,Math.abs(z-t.z)-t.d/2),f=1-clamp(outside/4,0,1);y=mix(y,t.y,f*f*(3-2*f));}
    return z>-42?mix(.13,y,clamp((Math.abs(x-riverX(z))-2.3)/2.8,0,1)):y;
  };
  const country=c.landscape(70,height,m.grassDark,204,[1,1.08],{low:'#4f694e',rock:'#788b8f',snow:'#d8e2dc',rockAt:13,snowAt:30,edgeMaterial:m.rock});
  // Cliff colour follows actual surface slope, so terrace banks expose stone
  // with moss instead of stretching lawn vertically down the ravine.
  const cp=country.geometry.attributes.position,cn=country.geometry.attributes.normal,cc=country.geometry.attributes.color,cliff=new THREE.Color('#7f8b81'),existing=new THREE.Color();
  for(let i=0;i<cp.count;i++){const steep=clamp((.83-cn.getY(i))/.62,0,1);if(!steep)continue;existing.fromBufferAttribute(cc,i);cliff.set('#7f8b81').multiplyScalar(.86+.09*Math.sin(cp.getX(i)*1.1+cp.getZ(i)*.85));existing.lerp(cliff,steep*.97);cc.setXYZ(i,existing.r,existing.g,existing.b);}cc.needsUpdate=true;
  const river=[];for(let z=-42;z<=72;z+=3)river.push([riverX(z),.25,z]);ribbon(river,4.55,m.water);
  // Broken stone rims and lightly planted ground replace five white slabs.
  // Each terrace follows a different irregular outline around its buildings.
  for(const t of terraces){
    const rim=[[-t.w/2+1.4,-t.d/2],[-t.w*.25,-t.d/2-.25],[t.w*.23,-t.d/2+.18],[t.w/2-1.3,-t.d/2],[t.w/2,-t.d/2+1.4],[t.w/2+.22,0],[t.w/2-.14,t.d/2-1.5],[t.w/2-1.5,t.d/2],[t.w*.1,t.d/2+.23],[-t.w*.24,t.d/2-.14],[-t.w/2+1.2,t.d/2],[-t.w/2,t.d/2-1.3],[-t.w/2-.18,-t.d*.13],[-t.w/2,-t.d/2+1.3]];
    const shape=new THREE.Shape();rim.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:1.2,bevelEnabled:true,bevelSize:.26,bevelThickness:.13,bevelSegments:2});geo.rotateX(-Math.PI/2);c.mesh(geo,[t.name.includes('Ogrody')?m.grassDark:gardenStone,m.rock],[t.x,t.y-1.13,t.z]);
    const gaps=(x,z)=>(Math.abs(x+29)<2.2&&(Math.abs(z+1.5)<2||Math.abs(z-2.5)<2))||(Math.abs(z-20)<1.6&&x>-19&&x<-12)||(Math.abs(z-17.5)<1.8&&x>-2&&x<12)||(Math.abs(x-22)<2&&z>-.8&&z<9)||(Math.abs(z+16)<1.6&&x>10&&x<14)||(Math.abs(z+8.4)<1.6&&x<-39)||(x>-3&&x<1&&z>-13&&z<-6);
    for(let j=0;j<rim.length;j++){
      const p=rim[j],q=rim[(j+1)%rim.length],length=Math.hypot(q[0]-p[0],q[1]-p[1]),n=Math.ceil(length/1.6);
      for(let k=0;k<n;k++){const f=k/n,x=t.x+mix(p[0],q[0],f),z=t.z+mix(p[1],q[1],f),nx=t.x+mix(p[0],q[0],(k+1)/n),nz=t.z+mix(p[1],q[1],(k+1)/n);if(gaps(x,z)||gaps(nx,nz))continue;
        cyl(.046,.085,.84,m.white,[x,t.y+.47,z],9);ball(.07,m.gold,[x,t.y+.95,z],[.7,1.1,.7]);beam([x,t.y+.89,z],[nx,t.y+.89,nz],.038,m.gold);beam([x,t.y+.34,z],[nx,t.y+.34,nz],.022,m.white);
        const stone=rock(x,t.y-.52,z,.5+rnd()*.4,m.rock);stone.scale.y=.73;
        if(k%3===0){const mark=rock(x,t.y-.09,z,.25+rnd()*.13,moss);mark.scale.set(1.3,.2,1.1);}
      }
    }
  }
  const footprint=(x,y,z,w,d,tall,angle=0,name='Elven building')=>{buildings.push({x,y,z,w,d,angle,height:tall,name,compound:name.includes('Great House')?'Great House':undefined});};
  const walk=(points,width=2.1,material=m.white)=>{ribbon(points,width,material);roads.push({points,width});};
  const route=(points,width=2.1,material=m.white)=>walk(points.map(([x,z])=>[x,height(x,z)+.16,z]),width,material);
  const colonnade=(parent,w,d,tall,y=0)=>{
    for(const side of [-1,1])for(let i=0;i<=Math.round(w/2.5);i++){
      const n=Math.round(w/2.5),x=-w/2+i*w/n;if(parent.userData.passageGap!==undefined&&Math.abs(x-parent.userData.passageGap)<.9)continue;cyl(.105,.17,tall,m.white,[x,y+tall/2,side*d/2],12,parent);
      cyl(.24,.2,.14,m.gold,[x,y+.08,side*d/2],12,parent);
      if(i<n)arch(w/n-.12,1.65,.12,m.white,[x+w/n/2,y+tall-1.74,side*d/2-.06],parent,.085);
    }
    block(w+.35,.22,d+.35,m.white,[0,y+tall,0],parent);
  };
  const elvenHouse=(x,y,z,w,d,tall,angle=0,variant=0,name='Dom elfów')=>{
    const h=new THREE.Group();h.position.set(x,y,z);h.rotation.y=angle;h.name=name;h.userData.architecture=true;group.add(h);
    block(w+.4,.35,d+.4,m.rock,[0,-.13,0],h);block(w*.84,tall,d*.77,m.chalk,[0,tall/2,-d*.1],h);
    const loggia=new THREE.Group();loggia.position.z=d*.42;h.add(loggia);colonnade(loggia,w*.9,.94,tall*.9,.1);
    elvenRoof(w+.8,w*.5,d+.85,variant%2?roofs:paleRoof,tall+.18,h);
    for(const zz of [-d/2,d/2]){beam([-w*.44,tall+.24,zz],[0,tall+w*.46,zz],.035,m.gold,h);beam([0,tall+w*.46,zz],[w*.44,tall+.24,zz],.035,m.gold,h);arch(w*.39,w*.27,.09,m.white,[0,tall+.13,zz],h,.055);}
    for(const side of [-1,1]){
      block(.12,tall,d*.77,m.white,[side*w*.42,tall/2,-d*.1],h);
      for(let j=0;j<2;j++){const x=side*w*.25,wy=1.38+j*tall*.36;block(.5,.94,.07,m.glass,[x,wy,d*.286],h);arch(.73,1.41,.11,m.white,[x,wy-.48,d*.293],h,.07);}
      tube([[side*w*.37,.22,d*.39],[side*w*.45,tall*.47,d*.37],[side*w*.42,tall*.86,d*.37]],.034,m.gold,h,12);
    }
    block(.89,2.1,.09,m.darkWood,[0,1.08,d*.286],h);arch(1.15,2.55,.16,m.white,[0,0,d*.293],h,.085);
    // A small upper gallery has individual carved uprights, rather than the
    // square windows and uninterrupted plaster front of a human cottage.
    block(w*.85,.12,1.02,m.white,[0,tall*.61,d*.42],h);for(let i=0;i<7;i++){const xx=-w*.37+i*w*.74/6;cyl(.027,.052,.65,m.white,[xx,tall*.61+.38,d*.54],9,h);}beam([-w*.39,tall*.61+.73,d*.54],[w*.39,tall*.61+.73,d*.54],.027,m.gold,h);
    if(variant%3===1){const port=new THREE.Group();port.position.z=d/2+1;h.add(port);colonnade(port,w*.83,1.6,2.5);elvenRoof(w*.96,.7,2.15,roofs,2.63,port);}
    else if(variant%3===2){const bay=new THREE.Group();bay.position.set(-w*.43,0,-d*.25);bay.rotation.y=Math.PI/2;h.add(bay);colonnade(bay,2.15,1.8,tall*.72,.12);elvenRoof(2.65,1.15,3,roofs,tall*.72+.17,bay);}
    footprint(x,y,z,w+.85,d+(variant%3===1?2.9:.85),tall+w*.49,angle,name);return h;
  };
  // The Great House fills its own upper terrace. Deep rear rooms, two long
  // inhabited wings and two storeys of open arcades surround a real court.
  const great=new THREE.Group();great.position.set(-21,11.66,-21);great.name='Great House — Dom Elronda i dwa skrzydła';great.userData.architecture=true;group.add(great);
  block(24,.3,11.2,m.white,[0,.08,0],great);block(24,5.8,8.2,m.chalk,[0,3,-1.45],great);
  gable(24,2.85,8.2,m.white,5.9,great);elvenRoof(25,4.4,9.25,roofs,5.9,great);
  const gallery=new THREE.Group();gallery.position.set(0,0,4.5);great.add(gallery);colonnade(gallery,23,2.8,3.15,.24);colonnade(gallery,23,2.8,2.55,3.55);elvenRoof(24,1.35,3.8,paleRoof,6.3,gallery);
  for(const x of [-9,-6,-3,0,3,6,9])for(const y of [1.8,4.45]){block(.94,1.55,.09,m.glass,[x,y,2.7],great);arch(1.2,1.9,.15,m.white,[x,y-.81,2.76],great,.12);}
  arch(2.1,3.5,.3,m.gold,[0,.3,2.78],great,.17);block(1.6,2.9,.09,m.darkWood,[0,1.73,2.72],great);
  for(const side of [-1,1]){
    const wing=new THREE.Group();wing.position.set(side*15.15,0,3.4);great.add(wing);
    block(6.8,5.3,15.1,m.chalk,[0,2.75,0],wing);gable(6.8,2.1,15.1,m.white,5.42,wing);elvenRoof(7.55,3.25,16,roofs,5.42,wing);
    for(const z of [-5,-2,1,4]){const window=new THREE.Group();window.position.set(-side*3.47,0,z);window.rotation.y=-side*Math.PI/2;wing.add(window);for(const y of [1.7,4]){block(.88,1.32,.08,m.glass,[0,y,0],window);arch(1.12,1.6,.12,m.white,[0,y-.68,.025],window,.11);}}
    const arcade=new THREE.Group();arcade.position.set(-side*4.05,0,2.7);arcade.rotation.y=Math.PI/2;wing.add(arcade);colonnade(arcade,10.8,1.5,2.8,.24);elvenRoof(11.5,.65,2.25,paleRoof,3.16,arcade);
    footprint(-21+side*15.15,11.66,-17.6,8.3,16,8.7,0,'Skrzydło Great House');
  }
  footprint(-21,11.66,-21,25,13.1,10.4,0,'Great House');
  court(-21,11.68,-6.4,23.4,6.6);route([[-32,-5],[-21,-5],[-10,-5]],2.2);
  for(const x of [-29,-13]){cyl(.82,.96,.32,m.white,[x,11.86,-6.5],32);c.flat(.69,m.water,[x,12.035,-6.5]);for(const side of [-1,1])ball(.18,m.autumnGold,[x+side*.85,11.96,-6.5],[1,.5,1]);}
  // Guest houses frame a long garden street, with readable space between roofs.
  let variant=0;for(const x of [-37,-21])for(const z of [6,15,24])elvenHouse(x,7.86,z,4.7,5.35,3.6,0,variant++,'Dom gościnny Imladris');
  for(const x of [-38,-4.3])elvenHouse(x,11.66,-4.3,4.3,4.5,3.2,0,variant++,'Pracownia i mieszkanie elfów');
  for(const x of [-40.55,-17.45]){
    const passage=new THREE.Group();passage.position.set(x,7.88,15);passage.name='Połączony ogrodowy krużganek domów gościnnych';group.add(passage);
    const columns=new THREE.Group();columns.rotation.y=Math.PI/2;columns.userData.passageGap=x>-20?4.8:undefined;passage.add(columns);colonnade(columns,19.2,1.05,2.55,.12);elvenRoof(1.72,.64,20.1,paleRoof,2.86,passage);
  }
  route([[-29,27],[-29,19],[-29,11],[-29,3]],2.4);court(-29,7.88,16,6.2,13);
  steps([-29,7.88,3],[-29,11.68,-3],3.1);roads.push({points:[[-29,7.88,3],[-29,11.68,-3]],width:3.1});
  route([[-29,20],[-23,20],[-17,20]],1.4);steps([-17,7.88,20],[-13,5.36,20],1.8);roads.push({points:[[-17,7.88,20],[-13,5.36,20]],width:1.8});route([[-13,20],[-10,22],[-8.5,24]],1.6);
  // Libraries and craft halls occupy the opposite bank, rather than a solitary tower.
  elvenHouse(22,9.66,-18,11.7,8.1,4.8,0,5,'Biblioteka i sala pamięci');
  elvenHouse(31,9.66,-4.4,5.1,6.6,4,0,3,'Dom kronikarzy');elvenHouse(15,9.66,-6.5,4.6,6.1,3.8,0,2,'Pracownia map');
  court(22,9.68,-4.3,10.2,6.6);route([[22,-1.5],[22,-4.3],[26,-4.3]],2.1);
  steps([22,9.68,.1],[22,5.38,8.1],3);roads.push({points:[[22,9.68,.1],[22,5.38,8.1]],width:3});
  for(const x of [14.5,31.6])for(const z of [13,22,30])elvenHouse(x,5.36,z,4.55,5.5,3.55,0,variant++,'Dolny dom elfów');
  elvenHouse(23,5.36,30.5,5.8,4.7,3.3,Math.PI,2,'Dom ogrodników');court(23,5.38,20,9.6,13.3);route([[23,8],[23,17],[23,25]],2.4);
  const pavilion=(x,y,z,r=2.1)=>{const h=new THREE.Group();h.position.set(x,y,z);h.name='Otwarty pawilon ogrodowy';group.add(h);cyl(r,r+.25,.22,m.white,[0,.1,0],32,h);for(let i=0;i<8;i++){const angle=i*TAU/8;cyl(.075,.12,2.7,m.white,[Math.sin(angle)*(r-.3),1.52,Math.cos(angle)*(r-.3)],12,h);}cone(r+.45,1.5,roofs,[0,3.68,0],h);cone(.11,.64,m.gold,[0,4.73,0],h);footprint(x,y,z,(r+.45)*2,(r+.45)*2,5.05,0,'Pawilon ogrodowy');};
  pavilion(-8.5,5.36,16,2.1);pavilion(-8.5,5.36,33,2.3);pavilion(31.9,9.66,-20.5,1.5);
  for(const x of [-13.7,-3.4]){
    block(1.65,.18,12.3,m.earth,[x,5.4,25]);for(let i=0;i<24;i++){const z=19.3+i*.49;ball(.11,i%3?m.autumn:m.autumnGold,[x+(rnd()-.5)*1.2,5.57,z],[.9,1.3,.9]);}
    tree(x,5.36,29,.9,'gold');tree(x,5.36,21,.8,'autumn');
  }
  route([[-8.5,19.5],[-8.5,24],[-8.5,29]],1.65);route([[-8.5,24],[-3.4,24],[-1,17.5]],1.75);
  // A restrained footbridge spans the ravine at the lower garden level.
  const bridge=[];for(let i=0;i<=24;i++){const t=i/24;bridge.push([mix(-1,10.3,t),5.36+Math.sin(Math.PI*t)*.7,17.5]);}walk(bridge,2.2,m.white);
  for(const side of [-1,1]){const z=17.5+side*.99;tube(bridge.map(p=>[p[0],p[1]+.87,z]),.065,m.gold);tube(bridge.map(p=>[p[0],p[1]-.28,z]),.21,m.white);for(let i=0;i<=24;i+=3)beam([bridge[i][0],bridge[i][1],z],[bridge[i][0],bridge[i][1]+.83,z],.055,m.white);}
  for(const x of [-.8,10.1]){cyl(.4,.75,5.1,m.rock,[x,2.66,17.5],16);block(1.5,.28,2.55,m.white,[x,5.2,17.5]);}
  route([[10.3,17.5],[16,17.5],[23,17.5]],2.2);
  // The second connection is a narrow upper path between inhabited terraces.
  steps([-1,11.66,-9],[2,8,-12],1.65);roads.push({points:[[-1,11.66,-9],[2,8,-12]],width:1.65});walk([[2,8,-12],[6.5,8.3,-14],[11,8,-16]],1.65,m.white);steps([11,8,-16],[13,9.66,-16],1.65);roads.push({points:[[11,8,-16],[13,9.66,-16]],width:1.65});
  for(const side of [-1,1])tube([[2,8.75,-12+side*.65],[6.5,9.05,-14+side*.65],[11,8.75,-16+side*.65]],.04,m.gold);
  const fallsTop=height(riverX(-43),-43)+.15;waterfall(riverX(-43),fallsTop,-42.3,Math.max(1,fallsTop-.25),3.6);
  for(const [x,z,size]of [[-46,-28,2],[-48,-4,1.8],[43,-26,2.2],[45,6,1.8],[-42,32,1.8],[42,38,2]])rock(x,height(x,z)+.2,z,size,m.rock);
  for(const [x,z,s]of [[-39,-3,.85],[-4,-27,.8],[-39,-29,.95],[-40,25,.7],[13,-23,.7],[34,-23,.8],[35,33,.7],[-15,35,.8]])tree(x,height(x,z)+.08,z,s,'gold');
  const forest=[];for(let i=0;i<125;i++){const x=(rnd()-.5)*123,z=(rnd()-.5)*139;if(Math.hypot(x,z/1.08)<67&&(Math.abs(x)>45||z>43||z<-40)&&Math.abs(x-riverX(z))>4)forest.push([x,z,1.1+rnd()*1.4]);}c.distantTrees(height,forest,true);
  const roadDistance=(x,z)=>{let best=Infinity;for(const road of roads)for(let j=1;j<road.points.length;j++){const p=road.points[j-1],q=road.points[j],vx=q[0]-p[0],vz=q[2]-p[2],t=clamp(((x-p[0])*vx+(z-p[2])*vz)/(vx*vx+vz*vz||1),0,1);best=Math.min(best,Math.hypot(x-p[0]-t*vx,z-p[2]-t*vz)-road.width/2);}return best;};
  const autumnGrove=[[-40,-28],[-3,-28],[-42,-15],[-39,-8],[-4,-2],[-34,-1],[-42,8],[-43,17],[-42,27],[-32.5,11.7],[-25.5,11.7],[-32.5,28.8],[-22,29.2],[-17,31],[-14,36],[-3,36],[13,-25],[21,-27],[35,-20],[35,-8],[27.8,3],[35,6],[38,14],[38,23],[38,33],[30,37],[15,37],[12,9],[-44,37],[-45,24],[-6,40],[35,42]];
  for(let i=0;i<autumnGrove.length;i++){const [x,z]=autumnGrove[i];if(roadDistance(x,z)<1.25||buildings.some(b=>Math.abs(x-b.x)<b.w/2+.58&&Math.abs(z-b.z)<b.d/2+.58))continue;tree(x,height(x,z)+.12,z,1.05+(i%4)*.16,i%3?'gold':'autumn');}
  // Fine trailing stems and individual leaves adhere to the rough banks.
  const leaves=[],vineMat=c.mat('#617944',.94);
  for(const t of terraces)for(let i=0;i<18;i++){
    const side=i%4,along=.12+rnd()*.76,dx=side===0?-1:side===1?1:0,dz=side===2?-1:side===3?1:0;
    const x=t.x+(dx?t.w/2*dx:mix(-t.w/2,t.w/2,along)),z=t.z+(dz?t.d/2*dz:mix(-t.d/2,t.d/2,along)),stem=[];
    for(let j=0;j<8;j++){const f=j/7,px=x+dx*(.35+f*3.15)+Math.sin(f*5+i)*.11,pz=z+dz*(.35+f*3.15)+Math.cos(f*5+i)*.11,py=height(px,pz)+.16;stem.push([px,py,pz]);if(j>0)for(let k=0;k<3;k++)leaves.push([px+(rnd()-.5)*.3,py+.08+rnd()*.22,pz+(rnd()-.5)*.3]);}
    if(stem[0][1]-stem[7][1]>1.7)tube(stem,.032,vineMat,group,20);
  }
  const leafGeo=new THREE.BufferGeometry();leafGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,.19,0,-.11,0,.035,0,-.18,0,.11,0,.035],3));leafGeo.setIndex([0,1,2,0,2,3]);leafGeo.computeVertexNormals();const leafMaterial=vineMat.clone();leafMaterial.side=THREE.DoubleSide;const vines=new THREE.InstancedMesh(leafGeo,leafMaterial,leaves.length),dummy=new THREE.Object3D(),leafColour=new THREE.Color();leaves.forEach(([x,y,z],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(rnd()*.8,rnd()*TAU,(rnd()-.5)*1.7);dummy.scale.setScalar(.65+rnd()*.6);dummy.updateMatrix();vines.setMatrixAt(i,dummy.matrix);leafColour.set(i%7===0?'#af994e':i%5===0?'#9d703f':'#5b7346');vines.setColorAt(i,leafColour);});vines.receiveShadow=true;group.add(vines);
  route([[-58,47],[-49,35],[-44,21],[-43,4],[-42,-8.4]],1.8,m.earth);steps([-42,height(-42,-8.4)+.16,-8.4],[-34,11.68,-8.4],1.8);route([[-34,-8.4],[-32,-5]],1.8);
  const tours=[
    {title:'Great House i dziedziniec Elronda',position:[-21,13.42,-4],target:[-21,16.7,-21],text:'Wielki Dom zajmuje osobny górny taras. Dwa mieszkalne skrzydła i dwupoziomowe arkady otaczają szeroki dziedziniec.'},
    {title:'Długa ulica domów gościnnych',position:[-29,9.52,19],target:[-37,10.1,15],text:'Ostrołukowe loggie, delikatne balkony i połączone ogrodowe krużganki wypełniają drugi poziom doliny. Smukłe dachy kończą się uniesionymi miedzianymi okapami.'},
    {title:'Ogrody na dolnym tarasie',position:[-8.5,7.04,26],target:[-8.5,7.3,16],text:'Złote jesienne drzewa, kwiatowe rabaty i dwa otwarte pawilony zajmują dolny taras. Cienkie balustrady biegną po nieregularnym, porośniętym mchem kamiennym brzegu.'},
    {title:'Mały most nad Bruinen',position:[-2.5,7.15,17.5],target:[8,5.5,17.5],text:'Wąski most łączy ogrody z zamieszkanym wschodnim brzegiem. Głęboka dolina i rzeka pozostają widoczne pod stopami.'},
    {title:'Biblioteka i wschodnie krużganki',position:[22,11.37,-1.5],target:[22,12.8,-18],text:'Biblioteka, pracownie map i domy kronikarzy tworzą odrębny wyższy taras. Szerokie kamienne schody schodzą do wschodniej osady.'},
    {title:'Dolny wschodni dziedziniec',position:[23,7.05,17],target:[23,7.5,30],text:'Domy po obu stronach drogi oraz dom ogrodników zamykają piąty taras. Przejście prowadzi do mostu i do biblioteki.'},
    {title:'Pięć poziomów ukrytej doliny',position:[53,36,64],target:[-4,10,3],text:'To interpretacyjny plan Imladris: duży Dom Elronda, mieszkalne tarasy, ogrody i spójne piesze połączenia zajmują dolinę pomiędzy zalesionymi zboczami.'},
  ];
  const info=finish([69,48,87],[-4,9,3],'#a8bdaf','#c7d4bd',[-38,76,42],tours);
  info.cityBounds={min:[-42,0,-31],max:[37,23,39]};info.planTarget=[-9,8,0];info.buildingFootprints=buildings;info.roads=roads;
  info.settlement={name:'Rivendell',buildings:buildings.length,districts:terraces.map(t=>t.name),terraces:5,coveredWalkways:2,interpretation:'Interpretacja literackiego Imladris: wielki dom z gościnnymi pokojami, otwarte ostrołukowe krużganki, jesienne ogrody i kamienne tarasy nad Bruinen; szczegółowy plan nie jest kanoniczną mapą.'};return info;
}



function gondor(){
  const c=context(3019),{group,m,rnd,box,ball,cyl,cone,torus,beam,ribbon,arch,finish}=c,{block,dwelling,court,steps}=settlementTools(c);
  group.name='Minas Tirith — siedem zamieszkanych kręgów';
  // Local +Z is the eastward axis of the city; the western mountain is -Z.
  const height=(x,z)=>.08+.25*Math.sin(x*.048)*Math.cos(z*.04)+clamp((-z-44)/16,0,1)*(47*Math.exp(-((x+2)**2/700+(z+67)**2/620))+18*Math.exp(-((x-36)**2/300+(z+78)**2/220))+14*Math.exp(-((x+40)**2/290+(z+76)**2/240)));
  c.landscape(105,height,m.grassDark,192,[1,1],{low:'#8d986c',rock:'#899799',snow:'#dce4df',rockAt:12,snowAt:39,edgeMaterial:m.rock});
  const radii=[44,37.5,31,24.5,18,12.5,7.6],levels=[1,5.6,10.2,14.8,19.4,24,28.6],gates=[0,-.66,.66,-.66,.66,-.66,0],footprints=[],roads=[];
  const districts=['I · Rath Celerdain i dolny rynek','II · dzielnica kupców','III · domy i rzemiosło','IV · dzielnica obywateli','V · koszary i rezydencje','VI · Domy Uzdrowień, ogrody i Fen Hollen','VII · cytadela i Dwór Fontanny'];
  const pt=(a,r,y)=>[Math.sin(a)*r,y,Math.cos(a)*r];
  const road=(points,width,material=m.chalk)=>{ribbon(points,width,material);roads.push({points,width});};
  // Solid terraced foundations, separate retaining walls and open gates give
  // each level its own elevation. The upper court is 28.6 units above Pelennor.
  for(let level=0;level<7;level++){
    const r=radii[level],y=levels[level],wall=level===0?m.black:m.white,gap=level===0?.1:.13;
    cyl(r,r+.15,y-.03,m.chalk,[0,(y-.03)/2,0],128);
    c.mesh(new THREE.CylinderGeometry(r,r+.2,2.4,144,1,true,gates[level]+gap/2,TAU-gap),wall,[0,y+1.15,0]);
    c.mesh(new THREE.CylinderGeometry(r+.08,r+.08,.18,144,1,true,gates[level]+gap/2,TAU-gap),wall,[0,y+2.37,0]);
    const count=Math.round(r*6);for(let i=0;i<count;i++){const a=i/count*TAU;if(Math.abs(Math.atan2(Math.sin(a-gates[level]),Math.cos(a-gates[level])))<gap*.68)continue;const p=block(.35,.56,.46,wall,pt(a,r,y+2.63));p.rotation.y=a;}
    const gate=new THREE.Group();gate.position.set(...pt(gates[level],r,y));gate.rotation.y=gates[level];group.add(gate);gate.name=`Brama ${level+1} — otwarte przejście`;
    for(const side of [-1,1]){cyl(.72,.9,3.8,wall,[side*(level===0?2.4:1.55),1.9,0],20,gate);cyl(.86,.86,.18,wall,[side*(level===0?2.4:1.55),3.82,0],20,gate);for(let j=0;j<8;j++){const a=j/8*TAU;block(.22,.45,.26,wall,[side*(level===0?2.4:1.55)+Math.sin(a)*.77,4.1,Math.cos(a)*.77],gate);}}
    arch(level===0?3.5:2.15,level===0?3.45:2.7,.72,wall,[-0.0,0,-.36],gate,.26);
    if(level===0){for(const side of [-1,1]){const leaf=block(1.62,2.85,.21,m.iron,[side*1.86,1.43,.03],gate);leaf.rotation.y=side*1.18;}}
    if(level===6)continue;
    const streetR=r-3.9,street=[];for(let j=0;j<=120;j++){const a=j/120*TAU;if(level===5&&a<.22||level===5&&a>TAU-.22)continue;street.push(pt(a,streetR,y+.095));}road(street,1.3,m.rock);
    // Each annulus is a district of full façades, side lanes and civic plots.
    const houseR=r-1.75,countH=Math.floor(TAU*houseR/3.15);
    for(let j=0;j<countH;j++){
      const a=(j+.5)/countH*TAU,x=Math.sin(a)*houseR,z=Math.cos(a)*houseR;
      if(Math.abs(Math.atan2(Math.sin(a-gates[level]),Math.cos(a-gates[level])))<.13||z>7.8&&Math.abs(x)<3.9)continue;
      if(level===0&&a>.7&&a<1.03||level===5&&a>3.75&&a<4.42||level===5&&a>2.4&&a<3.15)continue;
      const w=2.18+rnd()*.25,d=2.42+rnd()*.22,tall=2.38+(j+level)%3*.42;
      const h=dwelling(x,y,z,w,d,tall,'gondor',a+Math.PI,(j+level)%4===1?0:(j+level)%4);h.name=`${districts[level]} — kamienny dom ${j+1}`;
      footprints.push({x,z,y,w:w+.48,d:d+.5,height:tall+w*.4+1.3,angle:a+Math.PI,district:districts[level]});
      if(j%9===0){const cross=[];for(let k=0;k<=6;k++)cross.push(pt(a,r-1.15-k*.52,y+.115));road(cross,.6,m.chalk);}
    }
    // The ascent occupies the inner strip of the annulus. Short masonry
    // wedges support it all the way to the next gate rather than floating.
    const ascent=[],a0=gates[level],a1=gates[level+1],midR=r-4.85;
    for(let j=0;j<=64;j++){const t=j/64,a=mix(a0,a1,t)-(level===0?.18*Math.sin(Math.min(t/.24,1)*Math.PI):0),rr=j<10?mix(r-.3,midR,j/10):j>54?mix(midR,radii[level+1]+.22,(j-54)/10):midR;const yy=y+mix(.04,levels[level+1]-y+.08,t);ascent.push(pt(a,rr,yy));}
    for(let j=0;j<ascent.length-1;j++){const a=ascent[j],b=ascent[j+1],h=Math.max(.12,(a[1]+b[1])/2-y),p=block(1.52,h,Math.hypot(b[0]-a[0],b[2]-a[2])+.05,m.white,[(a[0]+b[0])/2,y+h/2,(a[2]+b[2])/2]);p.rotation.y=Math.atan2(b[0]-a[0],b[2]-a[2]);}
    road(ascent,1.55,m.chalk);
  }
  // The eastward stone keel has five actual arched holes cut through its mesh.
  // They meet the ascending roads where the route crosses the rock's axis.
  const keelShape=new THREE.Shape();keelShape.moveTo(9.5,0);keelShape.lineTo(43,0);keelShape.lineTo(43,6);keelShape.lineTo(9.5,33);keelShape.closePath();
  for(let i=0;i<5;i++){
    const z=radii[i]-4.375,base=levels[i]-.12,w=1.8,stem=3.0;
    const hole=new THREE.Path();hole.moveTo(z-w,base);hole.lineTo(z+w,base);hole.lineTo(z+w,base+stem);hole.absarc(z,base+stem,w,0,Math.PI,false);hole.lineTo(z-w,base);keelShape.holes.push(hole);
  }
  const keel=new THREE.ExtrudeGeometry(keelShape,{depth:7.1,bevelEnabled:false,curveSegments:18});keel.rotateY(-Math.PI/2);const kp=keel.attributes.position;for(let i=0;i<kp.count;i++){const z=kp.getZ(i),half=(7.1/2)*(1-.72*clamp((z-8)/36,0,1));kp.setX(i,(kp.getX(i)+3.55)/3.55*half);}keel.computeVertexNormals();const keelMesh=c.mesh(keel,m.chalk);keelMesh.name='Skalny dziób — pięć rzeczywistych tuneli';
  // Rath Celerdain's smithies and a civic market form a wide first-level plot.
  const marketA=.86,marketR=40.1,marketX=Math.sin(marketA)*marketR,marketZ=Math.cos(marketA)*marketR,market=new THREE.Group();market.position.set(marketX,1,marketZ);market.rotation.y=marketA;group.add(market);court(0,.12,0,8.4,3.6,market);
  for(let i=0;i<3;i++){const x=-2.6+i*2.6;block(1.65,.11,1.05,m.paleWood,[x,.85,0],market);for(const side of [-1,1])block(.09,1.85,.09,m.wood,[x+side*.72,.93,-.55],market);const aw=new THREE.Group();aw.position.x=x;market.add(aw);c.roof(1.95,.48,1.45,m.redRoof,1.85,aw);}
  for(const side of [-1,1]){const forge=new THREE.Group();forge.position.set(side*4.4,0,0);market.add(forge);block(1.5,2.45,2.8,m.white,[0,1.23,0],forge);arch(1.0,1.55,.2,m.rock,[0,0,1.42],forge,.15);block(.68,.45,.65,m.basalt,[0,.24,.83],forge);ball(.13,m.fire,[0,.53,.95],[1.6,.5,1],forge);block(.38,2.8,.42,m.rock,[.48,3.8,-.5],forge);c.roof(1.8,.7,3.1,m.rock,2.45,forge);}
  // Sixth-level Healing Houses, garden beds and the western Closed Door.
  const healing=new THREE.Group();healing.position.set(-9.7,24,-4.1);healing.rotation.y=-1.96;group.add(healing);healing.name='Domy Uzdrowień — krużganek i ogród';
  block(5.4,2.7,2.25,m.white,[0,1.35,0],healing);c.roof(5.8,1.0,2.7,m.rock,2.7,healing);
  for(let i=0;i<5;i++){arch(.85,2.1,.18,m.white,[-2+i*1.0,0,1.15],healing,.12);block(.56,1.36,.05,m.darkWood,[-2+i*1,1.02,-1.16],healing);}
  footprints.push({x:-9.7,z:-4.1,y:24,w:5.8,d:2.7,height:4.1,angle:-1.96,district:districts[5],kind:'healing'});
  for(let i=0;i<4;i++){const a=2.45+i*.16,p=pt(a,9.2,24.13),bed=block(1.1,.18,1.7,m.earth,p);bed.rotation.y=a;for(let j=0;j<5;j++)ball(.07,m.leaf,[p[0]+(rnd()-.5)*.7,24.32,p[2]+(rnd()-.5)*1.2]);}
  const fen=pt(Math.PI,12.42,24);arch(1.9,2.65,.4,m.white,[fen[0],fen[1],fen[2]-.2]);block(1.4,2.13,.12,m.darkWood,[0,25.1,-12.6]);
  const tombs=new THREE.Group();tombs.position.set(0,23.85,-19.7);group.add(tombs);block(7.4,4.45,10.2,m.chalk,[0,-2.23,0],tombs);court(0,.05,0,7.4,10.2,tombs);for(const side of [-1,1])for(let i=0;i<4;i++){const h=new THREE.Group();h.position.set(side*2.4,0,-3.7+i*2.45);tombs.add(h);block(1.7,1.5,1.65,m.white,[0,.75,0],h);c.roof(2,.65,1.9,m.rock,1.5,h);arch(.55,1.03,.13,m.rock,[0,0,.84],h,.08);}road([[0,24.08,-12.4],[0,24.08,-15],[0,23.92,-19.5]],1.2,m.rock);
  // Citadel halls and the fountain courtyard occupy the complete seventh ring.
  const top=28.6,citadel=new THREE.Group();citadel.position.y=top;group.add(citadel);citadel.name='Cytadela — Dom Królów, Wieża Ectheliona i Dwór Fontanny';
  court(0,.06,3.3,8.2,5.8,citadel);block(6.8,3.8,6.3,m.white,[0,1.9,-3],citadel);c.gable(6.8,1.9,6.3,m.white,[0,3.8,-6.15],citadel);c.roof(7.25,2.0,6.85,m.rock,3.8,citadel);
  arch(1.8,2.8,.3,m.white,[0,0,.2],citadel,.22);block(1.22,2.3,.11,m.darkWood,[0,1.15,.32],citadel);for(const x of [-2.4,2.4])for(const y of [1.1,2.9]){const a=arch(.83,1.1,.11,m.rock,[x,y,.23],citadel,.1);}
  for(const side of [-1,1]){const h=new THREE.Group();h.position.set(side*4.6,0,-1.2);citadel.add(h);block(1.9,2.5,4.6,m.white,[0,1.25,0],h);c.roof(2.1,1.0,5,m.rock,2.5,h);for(const z of [-1.6,0,1.6]){const a=arch(.7,1.95,.16,m.white,[-side*1.0,0,z],h,.1);a.rotation.y=-side*Math.PI/2;}}
  cyl(.8,.98,11.7,m.white,[0,6.1,-5.8],40,citadel);for(const y of [.8,4.1,8.1,11.6])cyl(1.06,1.02,.28,m.white,[0,y,-5.8],40,citadel);for(let i=0;i<12;i++){const a=i/12*TAU;const w=arch(.27,1.1,.12,m.rock,[Math.sin(a)*.87,9.72,Math.cos(a)*.87-5.8],citadel,.045);w.rotation.y=a;block(.23,.64,.29,m.white,[Math.sin(a)*1.03,12.1,Math.cos(a)*1.03-5.8],citadel);}cone(.85,1.45,m.white,[0,12.3,-5.8],citadel);cone(.11,.58,m.gold,[0,13.25,-5.8],citadel);
  cyl(1.38,1.48,.25,m.white,[0,.15,3.5],48,citadel);c.flat(1.18,m.water,[0,.29,3.5],citadel);beam([0,.31,3.5],[.09,2.8,3.5],.13,m.chalk,citadel,.055);for(let i=0;i<8;i++){const a=i/8*TAU,end=[Math.sin(a)*1.22,3.0+rnd()*.48,3.5+Math.cos(a)*1.22];beam([.05,1.6+i*.07,3.5],end,.05,m.chalk,citadel,.018);for(let j=0;j<3;j++){const b=a+(j-1)*.5;beam(end,[end[0]+Math.sin(b)*.42,end[1]+.48,end[2]+Math.cos(b)*.42],.018,m.chalk,citadel,.007);}}
  for(const side of [-1,1]){beam([side*3.6,.1,4.8],[side*3.6,5.7,4.8],.045,m.gold,citadel);block(.88,1.6,.035,m.black,[side*4.02,4.5,4.8],citadel);beam([side*4.02,4.03,4.83],[side*4.02,4.85,4.83],.027,m.white,citadel);for(let i=0;i<5;i++)ball(.05,m.white,[side*4.02+(i-2)*.14,5.0,4.84],undefined,citadel);}
  footprints.push({x:0,z:-3,y:top,w:7.25,d:6.85,height:6,angle:0,district:districts[6],kind:'palace'},{x:-4.6,z:-1.2,y:top,w:2.1,d:5,height:3.6,angle:0,district:districts[6],kind:'hall'},{x:4.6,z:-1.2,y:top,w:2.1,d:5,height:3.6,angle:0,district:districts[6],kind:'hall'},{x:0,z:-5.8,y:top,w:2.1,d:2.1,height:13.55,angle:0,district:districts[6],kind:'tower'});
  // Pelennor is a separate agricultural foreground, enclosed by distant Rammas.
  road([[0,1.06,44.1],[0,.2,52],[6,height(6,71)+.1,71],[22,height(22,96)+.1,96]],3.5,m.earth);road([[0,.2,52],[-27,.2,61],[-72,height(-72,55)+.1,55]],2.3,m.earth);
  const fields=[[-55,35],[-41,66],[-22,87],[31,61],[57,41],[68,12],[-67,-4],[13,86]],trees=[];
  fields.forEach(([x,z],i)=>{dwelling(x,height(x,z),z,4.2,5.2,2.9,'stone',i*.31,i%4);for(let j=0;j<4;j++){const p=block(10,.045,1.7,j%2?m.earth:m.grassLight,[x-3,height(x-3,z+6+j*2.3)+.07,z+6+j*2.3]);p.rotation.y=.09;}for(let j=0;j<6;j++)trees.push([x-6+j%3*3,z-6-Math.floor(j/3)*3,.6]);});c.distantTrees(height,trees);
  const rammas=[[-93,-4],[-89,34],[-68,72],[-35,96],[7,102],[47,87],[81,58],[97,20],[99,-5]];
  for(let j=0;j<rammas.length-1;j++){const a=rammas[j],b=rammas[j+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3);for(let i=0;i<n;i++){const t=(i+.5)/n,x=mix(a[0],b[0],t),z=mix(a[1],b[1],t);if(Math.hypot(x-22,z-96)<3.8)continue;const p=block(.65,1.55,Math.hypot(b[0]-a[0],b[1]-a[1])/n+.04,m.chalk,[x,height(x,z)+.77,z]);p.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);for(const s of [-.8,.8])block(.42,.25,.46,m.chalk,[x+Math.sin(p.rotation.y)*s,height(x,z)+1.67,z+Math.cos(p.rotation.y)*s]);}}
  const tours=[
    {title:'Wielka Brama',position:[0,2.75,49],target:[0,3.1,44],text:'Otwarta Wielka Brama przechodzi przez czarny pierwszy mur. Nad nią widać sześć białych obwodów i cytadelę.'},
    {title:'Ulice między murami',position:pt(1.35,33.6,7.35),target:pt(1.02,35.7,7.8),text:'Każdy krąg mieści własną ulicę, pełne kamienne domy i boczne przejścia. Oddzielna podparta pochylnia prowadzi do kolejnej bramy.'},
    {title:'Dziedziniec Białego Drzewa',position:[3.25,30.3,3.65],target:[0,31,3.5],text:'Dwór Fontanny zajmuje przednią część siódmego kręgu. Białe Drzewo stoi w kamiennej sadzawce przed Domem Królów.'},
    {title:'Wieża Ectheliona',position:[13,36,10],target:[0,38,-5.8],text:'Wzajemne wysokości odpowiadają opisowi: cytadela 700 stóp, szczyt wieży około 1000 stóp nad równiną. Skala pozioma została ułożona jako czytelna interpretacja.'},
    {title:'Droga przez Pelennor',position:[0,1.85,58],target:[0,17,4],text:'Miasto wyrasta ponad osobnym przedpolem gospodarstw, sadów i pól. Rammas Echor otacza daleką ziemię rolniczą.'},
    {title:'Minas Tirith — wszystkie siedem dzielnic',position:[81,59,95],target:[0,17,0],text:'Skalny dziób zwraca się ku wschodowi. Siedem wzniesionych obwodów jest wypełnionych miejską zabudową; Mindolluin wyrasta za zachodnią stroną.'},
    {title:'Rath Celerdain: rynek i kuźnie',position:pt(.86,37.8,2.75),target:[marketX,2.3,marketZ],text:'Ulica Lampiarzy ma rynek i otwarte kuźnie. Wyposażenie oraz rozkład stoisk stanowią interpretację życia dolnego miasta.'},
    {title:'Tunel przez skalny dziób',position:[-4.0,13.55,26.15],target:[1.7,13.1,26.15],text:'Pięć tuneli naprawdę przecina skalny klin. Droga może przejść z jednej strony miasta na drugą między naprzemiennymi bramami.'},
    {title:'Domy Uzdrowień',position:pt(4.15,8.7,25.75),target:[-9.7,25.8,-4.1],text:'Na szóstym poziomie kryty krużganek sąsiaduje z ogrodami leczniczymi. Zabudowa i grządki zajmują osobny fragment dzielnicy.'},
    {title:'Fen Hollen i Rath Dínen',position:[0,25.75,-15.3],target:[0,25.2,-19.7],text:'Zamknięte Drzwi prowadzą z szóstego obwodu na zachodnią Drogę Milczenia. Grobowce leżą poza zwykłymi dzielnicami mieszkalnymi.'},
    {title:'Brama cytadeli na wschodniej osi',position:[0,30.3,6.1],target:[0,30.1,7.7],text:'Pierwsza i siódma brama leżą na osi wschodniej. Bramy pośrednich obwodów przesuwają się naprzemiennie ku północnemu i południowemu wschodowi.'},
  ];
  const info=finish([82,63,100],[0,17,0],'#bbc3c0','#ced6ce',[-55,95,45],tours);info.cityBounds={min:[-45,0,-45],max:[45,42.2,45]};info.planTarget=[0,15,0];info.buildingFootprints=footprints;info.roads=roads;info.settlement={buildings:footprints.length+10,rings:7,districts,keelTunnels:5,citadelAbovePlain:28.6,towerAbovePlain:42.15,geographicEast:[0,0,1],interpretation:'Siedem obwodów, położenie bram, dziób, pięć tuneli i funkcje dzielnic pochodzą z opisu książkowego. Szczegółowe plany domów, pozioma skala, przebieg pochylni i układ placów są spójną interpretacją.'};return info;
}

function rohan(){
  const c=context(2759),{group,m,rnd,ball,cyl,cone,beam,tube,ribbon,rock,grass,finish}=c;
  const a=settlementTools(c),{block,dwelling,roof,gable,steps,court}=a,buildings=[],roads=[];
  group.name='Edoras — complete 55 by 65 metre hill town beneath Meduseld';
  const rx=27.5,rz=32.5,riverX=z=>41.5+2.3*Math.sin(z*.041)+Math.max(z-33,0)*.42;
  const height=(x,z)=>{
    const r=Math.hypot(x/rx,(z+2)/rz);let y=.2+14.4*Math.max(0,1-r*r)**1.36;
    const topDist=Math.max(Math.abs(x)-10.4,Math.abs(z+13)-10.4),top=1-clamp(topDist/5.5,0,1);y=mix(y,14.4,top*top*(3-2*top));
    const lowDist=Math.max(Math.abs(x)-11.5,Math.abs(z-5.8)-5.3),low=1-clamp(lowDist/2.6,0,1);y=mix(y,10.8,low*low*(3-2*low));
    if(r>1)y+=.08*Math.sin(x*.13)*Math.cos(z*.16);
    y+=clamp((-z-41)/13,0,1)*(17*Math.exp(-((z+65)**2)/155)*(.5+.5*Math.sin(x*.12+.8)**2));
    return mix(-.04,y,clamp((Math.abs(x-riverX(z))-1.65)/2.6,0,1));
  };
  c.landscape(83,height,m.grassLight,206,[1,1],{low:'#8e945e',rock:'#8a9490',snow:'#dbe0d3',rockAt:17,snowAt:27,edgeMaterial:m.rock});
  const water=[];for(let z=-78;z<=73;z+=3)water.push([riverX(z),.13,z]);ribbon(water,3.5,m.water);
  const walk=(points,width=2.5,material=m.earth)=>{ribbon(points,width,material);roads.push({points,width});};
  const road=(points,width=2.5,material=m.earth)=>walk(points.map(([x,z])=>[x,height(x,z)+.14,z]),width,material);
  const mainRoute=[[0,31],[0,28],[-7,25],[-11,20],[-7,17],[7,16],[12,12],[10.5,8],[9.5,5.8]];
  road(mainRoute,2.4);road([[0,73],[0,59],[0,43],[0,31]],3.2);
  // Separate lower and upper civic terraces are linked by broad visible stairs.
  block(23,3.5,10.6,m.rock,[0,9.1,5.8]);court(0,10.96,5.8,23,10.6);
  block(22,4.7,21,m.rock,[0,12.1,-13]);court(0,14.56,-13,22,21);
  steps([0,10.97,1],[0,14.56,-3],4.8);roads.push({points:[[0,10.97,1],[0,14.56,-3]],width:4.8,entrance:'Meduseld'});
  steps([0,height(0,16)+.14,16],[0,10.97,11.1],4.4);roads.push({points:[[0,height(0,16)+.14,16],[0,10.97,11.1]],width:4.4});
  road([[-10,6],[-14,3],[-16,-3],[-14,-10],[-12,-18]],2.2);road([[10,6],[15,1],[16,-5],[14,-11],[12,-19]],2.1);
  road([[-12,-18],[-12,-23],[-11,-24.55],[-6,-24.55],[0,-24.55],[6,-24.55],[12,-24.55],[12,-19]],.85);
  road([[-14,23],[-7,25]],1.45);road([[12,25],[0,28]],1.45);
  road([[-23,-4],[-18,-2],[-15,1]],1.45);road([[23,-4],[19,-2],[16,1]],1.45);
  // Meduseld is a long inhabited hall, with an open north-facing doorway.
  const hall=new THREE.Group();hall.position.set(0,14.65,-14);hall.name='Meduseld — Złota Hala, palenisko i tron';hall.userData.architecture=true;group.add(hall);
  block(12.2,.34,18.8,m.rock,[0,.02,0],hall);block(11.6,.18,18,m.paleWood,[0,.27,0],hall);
  for(const side of [-1,1]){block(.24,4.15,18,m.wood,[side*5.65,2.35,0],hall);block(4.35,4.15,.24,m.wood,[side*3.63,2.35,9],hall);}
  block(11.6,4.15,.24,m.wood,[0,2.35,-9],hall);block(2.35,.35,.24,m.wood,[0,4.25,9],hall);
  for(const side of [-1,1]){const leaf=block(1.06,3.35,.18,m.darkWood,[side*1.55,1.96,9.4],hall);leaf.rotation.y=side*.8;}
  const shell=new THREE.Group();shell.name='Zdejmowany złoty dach Meduseld';shell.userData.cutawayShell=true;hall.add(shell);gable(11.6,4.25,18,m.paleWood,4.42,shell);roof(12.8,4.45,19.3,m.thatch,4.42,shell);
  for(const side of [-1,1])for(let i=0;i<11;i++){
    const z=-8.1+i*1.62;block(.2,4.3,.2,m.darkWood,[side*5.69,2.35,z],hall);beam([side*5.6,4.5,z],[side*3,6.35,z],.085,m.darkWood,shell);
    for(const y of [1.0,2.1,3.3])block(.06,.065,1.55,m.paleWood,[side*5.84,y,z],hall);
  }
  for(const z of [-6,-3,0,3,6]){const window=new THREE.Group();window.position.set(5.83,3.48,z);window.rotation.y=Math.PI/2;hall.add(window);c.window(0,0,0,.57,window);}
  for(const side of [-1,1])for(const z of [-5.6,-2.1,1.4,4.9]){
    cyl(.16,.28,4.1,m.paleWood,[side*3.3,2.35,z],16,hall);for(const y of [.47,1.1,4.32])cyl(.3,.3,.09,m.gold,[side*3.3,y,z],16,hall);
    const carving=[];for(let j=0;j<42;j++){const t=j/41,angle=t*TAU*3;carving.push([side*3.3+Math.sin(angle)*.21,.8+t*3.1,z+Math.cos(angle)*.21]);}tube(carving,.027,m.darkWood,hall);
  }
  block(1.18,.17,7.7,m.rock,[0,.45,.5],hall);for(let i=0;i<18;i++){const z=-3+i*.43;ball(.16,m.lava,[(rnd()-.5)*.8,.59,z],[1.4,.3,.9],hall);beam([-.42,.62,z],[.35,.65,z+.25],.07,m.darkWood,hall);}
  const glow=new THREE.PointLight('#f4bf75',5,13);glow.position.set(0,1.9,0);hall.add(glow);
  for(const side of [-1,1]){block(.75,.14,9.6,m.paleWood,[side*4.3,1.05,.7],hall);for(const z of [-3.6,4.7])block(.17,.75,.6,m.darkWood,[side*4.3,.66,z],hall);}
  for(let i=0;i<3;i++)block(4-i*.5,.22,2.25-i*.3,m.chalk,[0,.45+i*.22,-6.8-i*.2],hall);
  block(1.45,.28,1.45,m.paleWood,[0,1.29,-7.7],hall);block(1.4,2.1,.2,m.paleWood,[0,2.23,-8.35],hall);for(const side of [-1,1]){block(.19,1.12,1.3,m.darkWood,[side*.79,1.7,-7.7],hall);cone(.13,.6,m.gold,[side*.6,3.58,-8.35],hall);}
  const portico=new THREE.Group();portico.position.z=9.1;hall.add(portico);block(12.3,.2,3.1,m.paleWood,[0,.25,1.1],portico);
  for(const x of [-5.15,-2.55,2.55,5.15]){cyl(.16,.25,4.2,m.paleWood,[x,2.4,2.15],12,portico);for(const y of [.45,1.05,4.25])cyl(.29,.29,.12,m.gold,[x,y,2.15],12,portico);}
  const portRoof=new THREE.Group();portRoof.position.z=10.15;shell.add(portRoof);roof(12.9,2.6,3.9,m.thatch,4.55,portRoof);
  for(const z of [-9.5,9.5])for(const side of [-1,1]){tube([[0,8.86,z],[side*.55,9.22,z+.25],[side*.88,9.8,z+.58],[side*.7,10.14,z+.76]],.115,m.gold,shell);ball(.19,m.gold,[side*.69,10.1,z+.75],[.85,1.3,.7],shell);cone(.09,.32,m.gold,[side*.71,10.39,z+.78],shell);}
  buildings.push({x:0,y:14.65,z:-13,w:13,d:22,angle:0,height:10.7,name:'Meduseld'});
  // Reserve every route and civic terrace before filling the whole hillside.
  const pathDistance=(x,z,points)=>{let best=Infinity;for(let i=1;i<points.length;i++){const p=points[i-1],q=points[i],vx=q[0]-p[0],vz=q[2]-p[2],t=clamp(((x-p[0])*vx+(z-p[2])*vz)/(vx*vx+vz*vz||1),0,1);best=Math.min(best,Math.hypot(x-p[0]-vx*t,z-p[2]-vz*t));}return best;};
  const occupied=(x,z,w,d)=>{
    if(Math.max(...[-1,1].flatMap(sx=>[-1,1].map(sz=>Math.hypot((x+sx*(w+.5)/2)/27.15,(z+sz*(d+.5)/2+2)/32.05))))>.985)return true;
    if(Math.abs(x)<9.6&&z>-25&&z<-2.4)return true;if(Math.abs(x)<12.3&&z>.1&&z<12)return true;if(Math.abs(x)<3.1&&z>-3.5&&z<2)return true;
    if(Math.abs(x+18)<6.4&&Math.abs(z-14)<6.3)return true;
    if(roads.some(r=>pathDistance(x,z,r.points)<r.width/2+Math.min(w,d)*.49+.18))return true;
    return buildings.some(b=>Math.abs(x-b.x)<(w+b.w)/2+.25&&Math.abs(z-b.z)<(d+b.d)/2+.25);
  };
  let n=0;for(let row=0;row<16;row++)for(let col=0;col<16;col++){
    const x=-26.5+col*3.5+(row%2)*.22,z=-31+row*4.1,w=2.45+(col+row)%3*.18,d=3.05+(row%3)*.17;
    if(occupied(x,z,w,d))continue;
    const tall=2.45+(row+col)%4*.34,y=Math.max(height(x-w/2,z-d/2),height(x+w/2,z-d/2),height(x-w/2,z+d/2),height(x+w/2,z+d/2))+.12;
    const minimum=Math.min(height(x-w/2,z-d/2),height(x+w/2,z-d/2),height(x-w/2,z+d/2),height(x+w/2,z+d/2));
    block(w+.32,Math.max(.5,y-minimum),d+.3,m.rock,[x,y-(y-minimum)/2-.05,z]);
    const h=dwelling(x,y,z,w,d,tall,'rohan',0,n%3===0?3:0);h.name=n%5===0?'Warsztat rzemieślniczy':n%7===0?'Spichlerz i dom gospodarza':'Dom mieszkańców Edoras';
    buildings.push({x,y,z,w:w+.46,d:d+.5,angle:0,height:tall+w*.48+.5,name:h.name});n++;
  }
  // Small infill huts use their own tighter rectangular plan, keeping all
  // circulation clear without copying a ring of identical cottage icons.
  for(let row=0;row<19;row++)for(let col=0;col<20&&n<76;col++){
    const x=-25.5+col*2.7,z=-29.5+row*3.2,w=1.95,d=2.25;if(occupied(x,z,w,d))continue;
    const y=height(x,z)+.32,h=dwelling(x,y,z,w,d,2.25,'rohan',0,0);h.name='Mniejszy dom i magazyn';buildings.push({x,y,z,w:w+.5,d:d+.5,angle:0,height:3.5,name:h.name});n++;
  }
  // Four small royal service houses flank the upper court, leaving narrow
  // continuous passages along both sides of the much larger central hall.
  for(const side of [-1,1])for(let i=0;i<3;i++){
    if(side>0&&i<2)continue;const x=side*8.9,z=-21+i*7.25,y=14.62,h=dwelling(x,y,z,2.15,3.3,2.7,'rohan',0,i===1?3:0);
    h.name=['Królewski skarbiec i strażnica','Kuchnia i zbrojownia','Magazyn przy górnym tarasie'][i];
    buildings.push({x,y,z,w:2.65,d:3.8,angle:0,height:4.5,name:h.name});
  }
  road([[-7.1,-22],[-7.1,-15],[-7.1,-6]],.75);road([[7.1,-22],[7.1,-15],[7.1,-6]],.75);
  // A practical stable district: two long open barns, stalls and paddock.
  const stable=(x,z,widthScale=1)=>{
    const y=Math.max(height(x-4,z-2.4),height(x+4,z+2.4))+.18,h=new THREE.Group();h.position.set(x,y,z);h.name='Otwarta stajnia ze stanowiskami';h.scale.x=widthScale;group.add(h);
    block(8.8,1.5,4.9,m.rock,[0,-.7,0],h);block(8.5,.15,4.6,m.wood,[0,.06,0],h);block(8.5,2.6,.18,m.wood,[0,1.45,-2.2],h);
    for(const xx of [-4,-2,0,2,4]){block(.15,2.9,.15,m.paleWood,[xx,1.54,2.1],h);if(Math.abs(xx)<4)block(.1,1.45,4.1,m.darkWood,[xx,.84,0],h);}gable(8.5,2.1,4.6,m.paleWood,2.9,h);roof(9.15,2.3,5.2,m.thatch,2.9,h);
    for(const xx of [-3,-1,1,3])ball(.56,m.thatch,[xx,.57,-1.2],[1,.7,.7],h);buildings.push({x,y,z,w:9.2*widthScale,d:5.2,angle:0,height:5.4,name:h.name});return y;
  };
  const stableY=stable(-18,11.5);stable(-16,17.5,.75);road([[-11,20],[-11.2,17],[-11.5,11],[-12,7]],1.55);
  const paddock=[[-24,20],[-18,23],[-13,22],[-13,19.5]];c.fence(paddock.map(([x,z])=>[x,height(x,z),z]),m.paleWood);
  for(let i=0;i<7;i++){const x=-21.5+i*.72,z=21.2;ball(.22,m.thatch,[x,height(x,z)+.3,z],[1.1,1,1]);}
  // The spring has a stone-lined channel beside the ascending gate road.
  const spring=[[8.3,14.6,-3.7],[9,13.8,-1],[11.5,10.95,3],[12,10.8,8],[15.4,height(15.4,14)+.17,14],[10,height(10,22)+.16,22],[3.2,height(3.2,28)+.16,28],[3.2,height(3.2,34)+.16,34]];
  ribbon(spring,.38,m.water);for(const side of [-1,1])tube(spring.map(p=>[p[0]+side*.29,p[1]+.04,p[2]]),.085,m.rock);
  cyl(.8,.9,.48,m.rock,[8.3,14.82,-3.7],24);c.flat(.65,m.water,[8.3,15.065,-3.7]);cyl(.12,.19,.72,m.chalk,[8.3,15.22,-3.7],12);
  cyl(.82,.96,.57,m.rock,[6.8,11.22,6.3],24);c.flat(.67,m.water,[6.8,11.515,6.3]);beam([6.8,11.68,6.3],[6.8,12.7,6.3],.055,m.paleWood);
  // Tall palisade follows the full 55 x 65 hill perimeter; the gate stays open.
  for(let i=0;i<270;i++){const angle=i*TAU/270,x=Math.sin(angle)*27.15,z=Math.cos(angle)*32.05-2;if(z>28&&Math.abs(x)<3.8)continue;const y=height(x,z);cyl(.075,.135,2.35,m.darkWood,[x,y+1.1,z],7);cone(.15,.34,m.paleWood,[x,y+2.44,z],undefined,7);if(i%3===0){const next=angle+3*TAU/270,nx=Math.sin(next)*27.15,nz=Math.cos(next)*32.05-2;if(!(nz>28&&Math.abs(nx)<3.8))for(const lift of [.6,1.45])beam([x,y+lift,z],[nx,height(nx,nz)+lift,nz],.055,m.wood);}}
  for(const side of [-1,1]){const x=side*3.75,z=30,y=height(x,z);block(.46,4.3,.5,m.paleWood,[x,y+2.1,z]);beam([x,y+4.1,z],[x+side*.55,y+4.75,z],.13,m.paleWood);const door=block(2.85,2.6,.17,m.darkWood,[side*4.6,y+1.3,z-1.2]);door.rotation.y=side*1.1;}
  beam([-3.75,height(-3.75,30)+3.4,30],[3.75,height(3.75,30)+3.4,30],.22,m.paleWood);
  for(const [x,z]of [[-5.6,28],[5.6,28]]){const y=height(x,z)+.2,h=dwelling(x,y,z,1.35,1.3,3.4,'rohan',0,0);h.name='Mała wieża straży przy bramie';buildings.push({x,y,z,w:1.8,d:1.8,angle:0,height:4.7,name:h.name});}
  const flagMat=c.mat('#315c4b',.86);for(const x of [-8.8,8.8]){const z=-2.2,y=height(x,z);beam([x,y,z],[x,y+5.1,z],.06,m.paleWood);const flag=block(1.35,2.5,.035,flagMat,[x+.72,y+3.6,z]);flag.userData.dynamic=true;c.animators.push(t=>{flag.rotation.y=Math.sin(t*1.8+x)*.11;});ball(.23,m.cream,[x+.7,y+3.68,z+.04],[1.3,.5,.12]);beam([x+.88,y+3.72,z+.06],[x+1.02,y+4.02,z+.06],.05,m.cream);ball(.09,m.cream,[x+1.03,y+4.05,z+.06],[1,.7,.3]);}
  // The royal burial mounds and Snowbourn are outside the inhabited hill.
  for(const side of [-1,1])for(let i=0;i<(side<0?9:8);i++){const x=side*7.5,z=38+i*3.8,y=height(x,z);ball(1,m.grass,[x,y-.05,z],[2.3,1.12,1.8]);for(let j=0;j<11;j++){const angle=j*TAU/11,r=.45+rnd()*1.25;ball(.065,m.cream,[x+Math.sin(angle)*r,y+.9,z+Math.cos(angle)*r],[1,.55,1]);}}
  grass(height,(x,z)=>Math.hypot(x/rx,(z+2)/rz)>1.06&&z>-37&&Math.abs(x-riverX(z))>4&&!(Math.abs(x)<12&&z>32),6400,78,m.grassLight);
  const woods=[];for(let i=0;i<32;i++){const x=-69+rnd()*138,z=-44-rnd()*29;if(Math.hypot(x,z)<78&&Math.abs(x-riverX(z))>5)woods.push([x,z,.9+rnd()*1.1]);}c.distantTrees(height,woods,true);
  for(const [x,z]of [[-31,-28],[30,-25],[-36,-7],[33,12]])rock(x,height(x,z)+.25,z,1.2,m.rock);
  const tours=[
    {title:'Brama pełnego miasta na wzgórzu',position:[0,height(0,33)+1.75,33],target:[0,11,-3],text:'Otwarta drewniana brama prowadzi przez palisadę obejmującą całe wzgórze o wymiarach około 55 na 65. Domy zajmują wszystkie jego stoki.'},
    {title:'Serpentyny ulicy królewskiej',position:[-8.8,height(-8.8,22.8)+1.75,22.8],target:[-4,11,12],text:'Droga od bramy zakręca między gęstą zabudową, stajniami i rzemieślniczymi domami. Odrębne boczne uliczki łączą sąsiednie dzielnice.'},
    {title:'Dolny taras i kamienny zdrój',position:[2.9,12.69,7.2],target:[6.8,11.6,6.3],text:'Plac z kamiennym zdrojem tworzy niższy z dwóch tarasów. Woda ze źródła spływa osobnym kamiennym kanałem ku bramie.'},
    {title:'Schody ku Złotej Hali',position:[0,12.7,2.3],target:[0,19.1,-11],text:'Szerokie schody prowadzą z dolnego placu do górnego tarasu i rzeźbionego przedsionka Meduseld.'},
    {title:'Długa hala Meduseld',position:[0,height(0,-.8)+1.75,-.8],target:[0,16.2,-18.5],text:'Między dwoma rzędami rzeźbionych słupów leży długie palenisko. Ławy i wysoki tron zajmują tę samą rozległą drewnianą halę.',cutaway:false},
    {title:'Wewnątrz Złotej Hali',position:[1.85,16.4,-8.5],target:[0,16.4,-20.8],text:'Rzeźbione słupy otaczają szeroką przestrzeń paleniska. Z wnętrza widać ławy, drewniane ściany, wschodnie okna i południowy tron.',cutaway:false,interior:true},
    {title:'Tron na trzech stopniach',position:[2.1,16.35,-20],target:[0,16.9,-21.7],text:'Trzy kamienne stopnie podnoszą tron w południowym końcu długiej hali. Miejsce monarchy pozostaje częścią rozległego wnętrza Meduseld.',cutaway:false,interior:true},
    {title:'Przekrój Złotej Hali',position:[23,30,13],target:[0,17.6,-14],text:'Zdejmowany dach odsłania pełne wnętrze Meduseld: kolumny, ogień, ławy i tron na stopniach.',cutaway:true},
    {title:'Dzielnica otwartych stajni',position:[-11.2,height(-11.2,17)+1.75,17],target:[-18,stableY+1.5,11.5],text:'Dwie długie stajnie mają otwarte fronty, osobne stanowiska i zapasy siana. Obok leży ogrodzony wybieg oraz połączenie z główną ulicą.'},
    {title:'Siedemnaście kurhanów przed Edoras',position:[0,height(0,48)+1.75,48],target:[0,11,-3],text:'Dwie grupy królewskich kurhanów stoją poza palisadą. Droga pomiędzy nimi prowadzi do samotnego, gęsto zamieszkanego wzgórza.'},
    {title:'Miasto, Snowbourn i Góry Białe',position:[49,30,47],target:[0,11,-7],text:'Edoras wypełnia pierwszy plan. Snowbourn płynie poza osadą, a odległe Góry Białe zamykają horyzont. Układ zabudowy rozwija literacki opis oraz filmową architekturę miasta.'},
  ];
  const info=finish([48,36,57],[0,9,-2],'#b9bda7','#d1d4b9',[-45,80,43],tours);
  info.cityBounds={min:[-27.5,0,-34.5],max:[27.5,26,30.5]};info.planTarget=[0,8,-2];info.cutawayCamera=[23,30,13];info.cutawayTarget=[0,17.6,-14];info.buildingFootprints=buildings;info.roads=roads;
  info.settlement={name:'Edoras',buildings:buildings.length,dwellings:n,districts:['Górny taras Meduseld','Dolny plac i zdrój','Dzielnica stajni','Wschodnie domy i warsztaty','Zachodnie domy i spichlerze'],hillSize:[55,65],terraces:2,interpretation:'Rozbudowana interpretacja Edoras: samotne wzgórze, długa Złota Hala, źródło i kurhany z opisu książkowego oraz zróżnicowana drewniana osada inspirowana architekturą ekranizacji.'};return info;
}

function eyeSculpture(c,parent=undefined,scale=1,position=[0,0,0]){
  const {group,m,box,ball,cyl,cone,torus,beam,tube,rnd,animators}=c;const eye=new THREE.Group();eye.position.set(...position);eye.scale.setScalar(scale);(parent||group).add(eye);
  // The fire is an almond in space, suspended between two horned obsidian arms.
  const aura=c.mat('#ff8f25',.22,0,{emissive:'#ff7211',emissiveIntensity:4,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false});
  const flame=c.mat('#ffcf59',.3,0,{emissive:'#ff8d12',emissiveIntensity:5});
  ball(1,m.fire,[0,0,0],[2.4,.83,.31],eye);ball(1,aura,[0,0,0],[2.65,1.05,.38],eye);ball(.71,flame,[0,0,.25],[1.4,1.12,.19],eye);
  ball(1,m.black,[0,0,.43],[.13,.7,.075],eye);ball(.98,m.lava,[0,0,.39],[.21,.79,.07],eye);ball(1,m.black,[0,0,.47],[.10,.72,.075],eye);
  for(let i=0;i<45;i++){const a=i*TAU/45;const x=Math.cos(a)*2.25,y=Math.sin(a)*.67;
    const end=[Math.cos(a)*(2.45+rnd()*.35),Math.sin(a)*(.89+rnd()*.22),rnd()*.25];const o=beam([x,y,0],end,.025+rnd()*.022,m.fire,eye,.006);o.userData.dynamic=true;animators.push(t=>{o.scale.y=.82+Math.sin(t*4+i*.74)*.19;});}
  for(const side of [-1,1])tube([[side*1.5,-4.2,-.07],[side*2.45,-2.3,0],[side*2.9,-.5,-.03],[side*2.8,1.12,-.03],[side*2.17,1.86,-.08]],.24,m.basalt,eye);
  for(const side of [-1,1])cone(.26,.83,m.black,[side*2.17,2.12,-.08],eye);
  const glow=new THREE.PointLight('#ff6219',24,16,2);glow.position.set(0,0,1);eye.add(glow);
  animators.push(t=>{m.fire.emissiveIntensity=3.6+Math.sin(t*3.9)*.45;flame.emissiveIntensity=4.5+Math.sin(t*5.3)*.65;glow.intensity=22+Math.sin(t*4.1)*2;});
  return eye;
}
function mordor(){
  const c=context(3441);const {group,m,rnd,box,ball,cyl,cone,beam,tube,lathe,terrain,island,ribbon,rock,finish}=c;
  const vx=-24,vz=15,tx=30,tz=-18;
  const height=(x,z)=>{const west=23*Math.exp(-((x+59)**2)/75)*(.61+.39*Math.abs(Math.sin(z*.18))),north=23*Math.exp(-((z+55)**2)/87)*(.57+.43*Math.abs(Math.cos(x*.19))),south=17*Math.exp(-((z-58)**2)/100)*(.54+.46*Math.abs(Math.sin(x*.16))),pass=1-.94*Math.exp(-((x+54)**2+(z+51)**2)/110),spur=9*Math.exp(-((x-30)**2/130+(z+36)**2/170))*clamp((-z-23)/10,0,1);return .12+.095*Math.sin(x*.22)*Math.cos(z*.19)+(west+north+south)*pass+spur;};
  c.landscape(74,height,m.basalt,208,[1,1],{low:'#41463d',rock:'#4d5350',snow:'#696c62',rockAt:7,snowAt:55,edgeMaterial:m.basalt});
  // Orodruin's fluted cinder cone has an actual open, glowing crater.
  const volcano=new THREE.Group();volcano.position.set(vx,0,vz);group.add(volcano);
  const profile=[[7.8,0],[7.1,.32],[5.9,1.2],[5,2.2],[4.1,3.2],[3.4,4.5],[2.7,5.6],[2.15,6.65],[1.92,7.05],[1.52,6.95],[1.05,5.98],[.45,5.6],[0,5.57]];
  const geo=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),128);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),y=p.getY(i),dist=Math.hypot(x,z);const factor=1+.045*Math.sin(a*9+y*.75)+.025*Math.sin(a*17-y*.43);p.setX(i,x*factor);p.setZ(i,z*factor);p.setY(i,y+.07*Math.sin(a*13)*clamp(dist-1,0,2));}geo.computeVertexNormals();c.mesh(geo,m.basalt,undefined,undefined,volcano);
  c.flat(1.49,m.lava,[0,6.44,0],volcano);c.torus(1.67,.075,m.lava,[0,6.88,0],volcano).rotation.x=Math.PI/2;
  for(let i=0;i<7;i++){const a=1.7+i*.58;const lava=[];for(let j=0;j<=16;j++){const t=j/16,r=1.7+t*6.1;lava.push([Math.sin(a+Math.sin(t*4)*.1)*r,7*(1-t)**1.2+.12,Math.cos(a+Math.sin(t*4)*.1)*r]);}ribbon(lava,.13+rnd()*.22,m.lava,volcano);}
  const smokeMat=c.mat('#4f433b',1,0,{transparent:true,opacity:.12,depthWrite:false});for(let i=0;i<10;i++){const o=ball(1.5,smokeMat,[vx+.2+i*.15,8+i*.68,vz],[1+i*.055,.75,1]);o.castShadow=false;c.animators.push(t=>{o.position.x=vx+.2+i*.15+Math.sin(t*.2+i)*.25;o.scale.setScalar(1+i*.07+Math.sin(t*.3+i)*.02);});}
  ribbon([[-2,.12,2],[2,.13,5],[6,.11,4],[9,.12,9],[13,.13,12],[16,.11,10]],.46,m.lava,volcano);
  ribbon([[-11,.12,1],[-13,.12,5],[-8,.12,10],[-6,.12,15]],.25,m.lava,volcano);
  // Barad-dûr: a towering assembly of black buttresses, terraces and spines.
  const tower=new THREE.Group();tower.position.set(tx,height(tx,tz)+.05,tz);group.add(tower);
  cyl(3.1,3.85,1.25,m.black,[0,.6,0],12,tower);cyl(2.42,3.08,3.2,m.basalt,[0,2.7,0],12,tower);cyl(1.7,2.5,4.6,m.black,[0,5.9,0],12,tower);cyl(1.18,1.9,3.8,m.basalt,[0,9.5,0],12,tower);cyl(.71,1.25,2.1,m.black,[0,12.28,0],12,tower);
  for(const y of [1.1,3.9,7.5,11.1,13.3]){const r=3.6-y*.21;cyl(r,r+.12,.19,m.iron,[0,y,0],12,tower);for(let i=0;i<12;i++){const a=i*TAU/12;cone(.14,.83,m.black,[Math.sin(a)*r,y+.42,Math.cos(a)*r],tower,6);}}
  for(let i=0;i<12;i++){const a=i*TAU/12;const x=Math.sin(a),z=Math.cos(a);const buttress=box(.42,7.2,.48,m.basalt,[x*2.22,3.6,z*2.22],tower);buttress.rotation.y=a;beam([x*3.6,.4,z*3.6],[x*1.13,10.9,z*1.13],.18,m.black,tower,.06);cone(.25,2.5,m.black,[x*2.16,8.2,z*2.16],tower,6);}
  for(let level=0;level<6;level++){const y=2+level*1.6,r=2.58-level*.26;for(let i=0;i<8;i++){const a=i*TAU/8;const slot=box(.13,.66,.06,m.lava,[Math.sin(a)*r,y,Math.cos(a)*r],tower);slot.rotation.y=a;}}
  eyeSculpture(c,tower,.75,[0,16.4,0]);
  box(3.3,.2,2.7,m.black,[0,13.45,1.2],tower);for(const side of [-1,1])beam([side*1.4,10.8,.3],[side*1.4,13.4,2.2],.09,m.basalt,tower);for(const x of [-1.55,1.55])box(.1,.72,2.6,m.iron,[x,13.83,1.2],tower);
  for(let i=0;i<110;i++){const a=rnd()*TAU,r=12+rnd()*57,x=Math.sin(a)*r,z=Math.cos(a)*r;if(Math.hypot(x-vx,z-vz)<9||Math.hypot(x-tx,z-tz)<5)continue;rock(x,height(x,z)+.23,z,.4+rnd()*1.6,m.basalt);}
  for(let i=0;i<26;i++){const z=-54+(rnd()-.5)*9,x=(rnd()-.5)*132;if(Math.hypot(x,z)<71)rock(x,height(x,z)+.7,z,1.3+rnd()*2,m.black);}
  // Morannon stands in the north-west mountain gap. Udûn and the ash road
  // separate it from Gorgoroth and the two distant landmarks of the plateau.
  const gate=new THREE.Group();gate.position.set(-54,height(-54,-51),-51);gate.rotation.y=-Math.PI/4;group.add(gate);
  for(const side of [-1,1]){box(2.3,5.6,2.1,m.black,[side*5.4,2.8,0],gate);cone(1.45,1.2,m.basalt,[side*5.4,6.1,0],gate,6);for(let i=0;i<6;i++)box(.22,1.2,.28,m.basalt,[side*5.4-1+i*.4,5.7,.8],gate);}box(8.6,3.8,.34,m.iron,[0,1.9,.25],gate);for(let i=0;i<18;i++){box(.18,4.45,.6,m.black,[-4.2+i*.49,2.23,.3],gate);cone(.18,.62,m.black,[-4.2+i*.49,4.75,.3],gate,4);}
  const ashRoad=[[-54,-46],[-43,-37],[-35,-27],[-20,-16],[-15,0],[-24,7]];ribbon(ashRoad.map(([x,z])=>[x,height(x,z)+.04,z]),1.5,m.earth);ribbon([[-20,-16],[3,-11],[25,-15]].map(([x,z])=>[x,height(x,z)+.04,z]),1.4,m.earth);
  const magmaLight=new THREE.PointLight('#ef4c20',16,18);magmaLight.position.set(vx,7.8,vz);group.add(magmaLight);
  c.animators.push(t=>{m.lava.emissiveIntensity=2.3+Math.sin(t*2.1)*.3;});
  return finish([90,44,104],[2,6,-3],'#413c36','#545047',[-45,72,40],[
    {title:'Popiół u stóp Barad-dûr',position:[tx+7,height(tx+7,tz+9)+1.7,tz+9],target:[tx,10,tz],text:'Barad-dûr stoi daleko na wschód i północ od Orodruiny, pod południowym odgałęzieniem Ered Lithui.'},
    {title:'Strumienie ognia pod Orodruiną',position:[vx+3,height(vx+3,vz+10)+1.7,vz+10],target:[vx,4.4,vz],text:'Lawa skupia się przy wulkanie. Pomiędzy nim a fortecą rozciąga się suchy, spustoszony płaskowyż Gorgoroth.'},
    {title:'Krawędź krateru Góry Przeznaczenia',position:[vx+2.1,8.35,vz+.6],target:[vx,6.5,vz],text:'Otwarty krater ujawnia rozżarzone wnętrze osobnego stożka wulkanicznego.'},
    {title:'Górna galeria Czarnej Wieży',position:[tx+.2,tower.position.y+15.15,tz+2.1],target:[tx,tower.position.y+16.4,tz],text:'Z kamiennej galerii widać filmowe Oko pomiędzy szponami zwieńczenia.'},
    {title:'Morannon i kotlina Udûn',position:[-43,height(-43,-38)+1.7,-38],target:[-54,gate.position.y+3,-51],text:'Czarna Brama zajmuje północno-zachodnią przerwę w górach. Droga przez Udûn prowadzi dalej ku Gorgoroth.'},
    {title:'Odrębne masywy na wielkim płaskowyżu',position:[-2,24,56],target:[2,8,-8],text:'Orodruin i Barad-dûr są rozdzielone szeroką równiną. Zachód, północ i odległe południe osłaniają łańcuchy górskie; to układ krajobrazu, nie dokładny plan w skali.'},
  ]);
}
function eye(){
  const c=context(1601);const {m,rnd,cyl,cone,rock,finish}=c;
  const height=(x,z)=>.035+clamp((Math.hypot(x,z)-6)/10,0,1)*(.16+.14*Math.sin(x*.31)*Math.cos(z*.23))+7*Math.exp(-((x+13)**2/90+(z+20)**2/80));
  c.landscape(26,height,m.basalt,132,[1,1],{low:'#303731',rock:'#454a43',rockAt:4,snowAt:70,edgeMaterial:m.basalt});
  cyl(2.55,3.05,1.1,m.basalt,[0,.6,0],12);cyl(1.68,2.43,2.1,m.black,[0,2.1,0],12);cyl(.76,1.57,2.1,m.basalt,[0,4.05,0],12);
  for(let i=0;i<12;i++){const a=i*TAU/12;cone(.17,1.4,m.black,[Math.sin(a)*2.3,1.95,Math.cos(a)*2.3],undefined,6);}
  eyeSculpture(c,undefined,1.1,[0,8.5,0]);for(let i=0;i<16;i++){const a=i*TAU/16;rock(Math.sin(a)*4.9,.25,Math.cos(a)*4.9,.45,m.basalt);}
  for(let i=0;i<30;i++){const a=rnd()*TAU,r=12+rnd()*13,x=Math.sin(a)*r,z=Math.cos(a)*r;rock(x,height(x,z)+.15,z,.4+rnd()*.9,m.basalt);}
  c.ribbon([[1,height(1,25)+.04,25],[2,height(2,16)+.04,16],[0,.07,6]],1.15,m.earth);
  return finish([35,20,43],[0,5.5,-2],'#292622','#302c25',[-28,45,29],[
    {title:'Spojrzenie Saurona',position:[3.2,8.6,8.7],target:[0,8.5,0],text:'Wydłużona czarna źrenica przecina migotliwy ogień.'},
    {title:'Obsydianowe szpony',position:[6.6,7.6,4.8],target:[1.8,8.6,0],text:'Dwa zakrzywione ramiona obejmują zawieszoną w powietrzu ognistą formę.'},
    {title:'U podstaw wieży',position:[4.7,2.35,5.1],target:[0,3.1,0],text:'Ciemne przypory i iglice tworzą rzeźbiarską podstawę filmowej interpretacji Oka.'},
    {title:'Popielna droga pod skałą',position:[2,height(2,18)+1.7,18],target:[0,7,0],text:'Oko należy do zwieńczenia Barad-dûr. Rozleglejszy krajobraz wokół podstawy odwołuje się do tego samego płaskowyżu Mordoru.'},
    {title:'Oko i horyzont Gorgoroth',position:[22,12,26],target:[0,8.5,0],text:'Odległy widok ujmuje płonące Oko jako motyw ekranizacji. Książkowe spojrzenie Saurona jest także wizją i znakiem jego woli.'},
  ]);
}

function character(id){
  const c=context(id==='bilbo'?111: id==='frodo'?112:113);const {group,m,rnd,box,ball,cyl,cone,torus,beam,tube,lathe,rock,finish}=c;
  const wizard=id==='gandalf';const g=new THREE.Group();group.add(g);const height=wizard?5.3:3.6;
  // Close-up materials have a physically small weave/pores relief. All maps are
  // generated locally; the figure remains a real sculptural mesh when exported.
  const detailMap=kind=>{
    if(typeof document==='undefined')return null;const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#808080';ctx.fillRect(0,0,512,512);
    if(kind==='cloth')for(let y=0;y<512;y+=3)for(let x=0;x<512;x+=3){const weave=(Math.floor(x/3)+Math.floor(y/3))%2;ctx.fillStyle=weave?'#a0a0a0':'#6a6a6a';ctx.fillRect(x,y,2,2);}
    if(kind==='hair')for(let i=0;i<150;i++){ctx.strokeStyle=`rgba(255,255,255,${.1+rnd()*.5})`;ctx.lineWidth=.4+rnd()*.5;ctx.beginPath();ctx.moveTo(i*3.5,0);for(let y=0;y<=512;y+=8)ctx.lineTo(i*3.5+Math.sin(y*.027+i)*2,y);ctx.stroke();}
    for(let i=0;i<15000;i++){const k=85+Math.floor(rnd()*90);ctx.fillStyle=`rgb(${k},${k},${k})`;ctx.fillRect(rnd()*512,rnd()*512,.5+rnd()*1.1,.5+rnd()*1.1);}
    const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=8;map.repeat.set(kind==='cloth'?5:2,kind==='cloth'?7:2);return map;
  };
  const clothMap=detailMap('cloth'),skinMap=detailMap('skin'),hairMap=detailMap('hair');
  for(const material of [m.coat,m.greenCloth,m.greyCloth,m.cream,m.redCloth]){material.bumpMap=clothMap;material.bumpScale=.012;material.roughness=.88;}
  m.skin.bumpMap=skinMap;m.skin.bumpScale=.0035;m.skin.roughness=.69;
  for(const material of [m.hair,m.hairDark,m.beard]){material.bumpMap=hairMap;material.bumpScale=.009;material.roughness=.67;}
  const parametric=(fn,nu,nv,material,parent=g)=>{
    const positions=[],uvs=[],indices=[];for(let v=0;v<=nv;v++)for(let u=0;u<=nu;u++){positions.push(...fn(u/nu,v/nv));uvs.push(u/nu,v/nv);}
    for(let v=0;v<nv;v++)for(let u=0;u<nu;u++){const a=v*(nu+1)+u;indices.push(a,a+1,a+nu+1,a+1,a+nu+2,a+nu+1);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return c.mesh(geo,material,undefined,undefined,parent);
  };
  const sculptBall=(radius,material,pos,scale=[1,1,1],parent=g)=>c.mesh(new THREE.SphereGeometry(radius,radius<.045?24:radius<.15?32:40,radius<.045?16:radius<.15?24:28),material,pos,scale,parent);
  const clothSurface=(profile,material,{start=0,arc=TAU,folds=15,depth=.78,offset=[0,0,0],fullness=.035}={})=>{
    const curve=new THREE.CatmullRomCurve3(profile.map(([r,y])=>V(r,y,0)));
    const object=parametric((u,v)=>{const p=curve.getPoint(v),a=start+u*arc;const fold=(Math.sin(a*folds+.28*Math.sin(v*7))*fullness+Math.sin(a*(folds*2+1)+v*6)*.006)*(1-.4*v);
      const r=p.x+fold;return [Math.sin(a)*r+offset[0],p.y+Math.sin(a*8)*.017*(1-v)+offset[1],Math.cos(a)*r*depth+offset[2]];},104,64,material);
    object.material.side=THREE.DoubleSide;return object;
  };
  const sweep=(points,radiusFn,material,steps=40,sides=14,ribs=0,parent=g)=>{
    const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)));const frames=curve.computeFrenetFrames(steps,false);
    return parametric((u,v)=>{const i=Math.min(steps,Math.round(v*steps)),p=curve.getPoint(v),a=u*TAU,r=radiusFn(v)*(1+ribs*Math.cos(a*7+v*12));const off=frames.normals[i].clone().multiplyScalar(Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r);return p.add(off).toArray();},sides,steps,material,parent);
  };
  const lapelPatch=(side,material)=>{
    const o=parametric((u,v)=>{const y=mix(1.38,2.5,v),x=side*mix(.41,.2,v);const width=.17+Math.sin(v*Math.PI)*.05;return [x+side*(u-.5)*width,y,.43+.04*Math.sin(v*Math.PI)+Math.sin(u*Math.PI)*.028];},20,48,material);o.material.side=THREE.DoubleSide;
    const seam=[];for(let i=0;i<=30;i++){const v=i/30;seam.push([side*(mix(.41,.2,v)+(.17+Math.sin(v*Math.PI)*.05)*.5),mix(1.38,2.5,v),.438+.04*Math.sin(v*Math.PI)]);}sweep(seam,()=>.008,m.paleWood,40,6);
  };
  c.island(3.4,m.darkWood,.55);cyl(3.3,3.3,.08,m.gold,[0,.02,0],96);cyl(3.15,3.15,.08,m.rock,[0,.08,0],96);
  const cloth=wizard?m.greyCloth:id==='frodo'?m.greenCloth:m.coat;
  // Densely sampled surfaces model changing cloth tension and flowing folds.
  const robeProfile=wizard?[[.95,.18],[.88,.65],[.76,1.6],[.62,2.3],[.63,3.06],[.83,3.34],[.65,3.5],[.3,3.55]]:[[.62,1.25],[.73,1.46],[.66,2.13],[.58,2.42],[.31,2.56]];
  clothSurface(robeProfile,cloth,{start:wizard?0:.67,arc:wizard?TAU:TAU-1.34,folds:wizard?19:14,depth:wizard?.76:.73,fullness:wizard?.057:.026});
  if(!wizard){
    const trousers=id==='frodo'?m.coat:m.greenCloth;
    for(const side of [-1,1]){
      sweep([[side*.28,1.63,0],[side*.29,1.19,.01],[side*.29,.82,.015]],v=>.22+Math.sin(v*Math.PI)*.05, trousers,44,28,.04);
      sculptBall(.18,m.skin,[side*.29,.66,.035],[.8,1.4,.9]);sculptBall(.23,m.skin,[side*.31,.33,.22],[1.1,.63,1.7]);
      for(let j=0;j<5;j++){const x=side*.31-.13+j*.064;sculptBall(.05,m.skin,[x,.3,.53],[1,.68,1.4]);sculptBall(.031,m.cream,[x,.324,.58],[.76,.15,.78]);}
      for(let j=0;j<22;j++){const x=side*.31+(rnd()-.5)*.26;sweep([[x,.469,.22],[x+.015,.486,.28],[x+.025,.467,.34]],v=>.004*(1-v*.6),m.hairDark,12,5);}
    }
    clothSurface([[.4,1.4],[.5,1.9],[.45,2.29],[.27,2.56]],m.cream,{depth:.82,fullness:.011,offset:[0,0,.042]});
    for(const side of [-1,1])lapelPatch(side,id==='bilbo'?m.redCloth:m.coat);
    for(let i=0;i<5;i++){sculptBall(.025,m.gold,[0,1.58+i*.135,.474],[1,1,.4]);torus(.025,.004,m.bronze,[0,1.58+i*.135,.487],g);}
    sweep([[-.24,2.51,.34],[0,2.44,.38],[.24,2.51,.34]],()=>.044,m.cream,40,12);
  }
  const shoulderY=wizard?3.23:2.29;const handY=wizard?2.53:1.75;
  for(const side of [-1,1]){
    const shoulder=[side*(wizard?.65:.54),shoulderY,0],elbow=[side*(wizard?1.0:.88),shoulderY-.48,.03],hand=[side*(wizard?1.1:.94),handY,.23];
    sweep([shoulder,elbow,hand.map((n,i)=>i===1?n+.12:n)],v=>(wizard?.255:.19)*(1-.16*v)+Math.sin(v*Math.PI*5)**2*.017,cloth,64,32,.055);
    sculptBall(.16,m.skin,hand,[.85,1.12,.62]);
    for(let j=0;j<4;j++){const fx=hand[0]+(j-1.5)*.054,fy=hand[1]-.018,fz=hand[2]+.069;const length=.16+(1-Math.abs(j-1.5)/2)*.042;
      sweep([[fx,fy,fz],[fx,fy-length*.49,fz+.014],[fx,fy-length,fz-.014]],v=>.028*(1-.28*v),m.skin,20,12);sculptBall(.022,m.cream,[fx,fy-length*.87,fz+.012],[.78,.88,.18]);
      for(let k=0;k<2;k++)sweep([[fx-.018,fy-length*(.33+k*.27),fz+.025],[fx,fy-length*(.33+k*.27)-.004,fz+.029],[fx+.018,fy-length*(.33+k*.27),fz+.025]],()=>.0018,m.lip,8,4);
    }
    sweep([[hand[0]-side*.1,hand[1]+.032,hand[2]+.015],[hand[0]-side*.17,hand[1]-.035,hand[2]+.07],[hand[0]-side*.145,hand[1]-.11,hand[2]+.065]],v=>.042*(1-.25*v),m.skin,24,14);
  }
  const headY=wizard?4.02:2.91;const headR=wizard?.43:.5;
  cyl(.2,.23,.31,m.skin,[0,headY-.52,0],32,g);
  const faceGeo=new THREE.SphereGeometry(headR,104,80),fp=faceGeo.attributes.position;const gauss=(x,y,cx,cy,wx,wy)=>Math.exp(-((x-cx)**2/wx**2+(y-cy)**2/wy**2));
  for(let i=0;i<fp.count;i++){let x=fp.getX(i)*.87,y=fp.getY(i)*1.16,z=fp.getZ(i)*.87;const forward=clamp(z/(headR*.4),0,1);x*=1-.12*clamp(-y/headR,0,1);
    let shape=.095*gauss(x,y,0,.015,.052,.16)+.095*gauss(x,y,0,-.13,.072,.053)+.03*gauss(x,y,0,-.35,.19,.09);
    for(const side of [-1,1]){shape+=.029*gauss(x,y,side*.19,-.105,.115,.1)+.036*gauss(x,y,side*.17,.155,.12,.037)-.072*gauss(x,y,side*.17,.066,.096,.046);shape-=.009*gauss(x,y,side*.105,-.23,.018,.1);}
    if(id==='bilbo')shape-=.004*Math.sin(y*135)**2*gauss(x,y,0,.28,.3,.15);
    z+=shape*forward;fp.setXYZ(i,x,y,z);
  }faceGeo.computeVertexNormals();c.mesh(faceGeo,m.skin,[0,headY,0],undefined,g);
  for(const side of [-1,1]){
    // The ear's helix and recessed concha are separate anatomical features.
    sculptBall(.112,m.skin,[side*.42,headY-.025,0],[.52,1.45,.68]);sculptBall(.063,m.lip,[side*.451,headY-.033,.055],[.3,1.18,.48]);
    sweep([[side*.45,headY-.14,.065],[side*.477,headY-.04,.075],[side*.463,headY+.09,.062],[side*.429,headY+.105,.063]],()=>.017,m.skin,28,10);
    sculptBall(.07,m.cream,[side*.17,headY+.066,.37],[1.18,.49,.52]);const iris=c.mat(id==='frodo'?'#6d8d85':'#817e57',.18,.06);sculptBall(.031,iris,[side*.17,headY+.066,.408],[.93,1,.17]);sculptBall(.014,m.black,[side*.17,headY+.066,.414],[1,1,.21]);sculptBall(.006,m.cream,[side*.16,headY+.078,.417]);
    for(let i=0;i<28;i++){const a=i*TAU/28;sweep([[side*.17+Math.sin(a)*.017,headY+.066+Math.cos(a)*.017,.413],[side*.17+Math.sin(a)*.029,headY+.066+Math.cos(a)*.029,.411]],()=>.0008,m.darkLeaf,4,3);}
    for(const upper of [true,false]){const points=[];for(let i=0;i<=16;i++){const t=i/16;points.push([side*.17-.085+t*.17,headY+.066+Math.sin(t*Math.PI)*(upper?.035:-.026),.37+Math.sin(t*Math.PI)*.028]);}sweep(points,()=>upper?.011:.008,m.skin,28,10);}
    for(let j=0;j<11;j++){const x=side*.17-.09+j*.018;sweep([[x,headY+.154+Math.sin(j/10*Math.PI)*.014,.374],[x+side*.014,headY+.169+Math.sin(j/10*Math.PI)*.014,.381]],()=>.0045,wizard?m.beard:id==='bilbo'?m.hair:m.hairDark,6,5);}
    sculptBall(.019,m.lip,[side*.047,headY-.139,.461],[1,.5,.5]);
  }
  sweep([[-.115,headY-.253,.36],[-.055,headY-.255,.39],[0,headY-.264,.4],[.055,headY-.255,.39],[.115,headY-.253,.36]],v=>.011+Math.sin(v*Math.PI)*.007,m.lip,44,12);
  sweep([[-.106,headY-.266,.363],[0,headY-.289,.397],[.106,headY-.266,.363]],v=>.006+Math.sin(v*Math.PI)*.008,m.skin,36,12);
  const hairMat=wizard?m.beard:id==='bilbo'?m.hair:m.hairDark;
  if(wizard){
    // Separate flowing locks, rather than a single cone for Gandalf's beard.
    for(let i=0;i<21;i++){const a=(i/20-.5)*Math.PI*.92,x=Math.sin(a)*.34,z=.31+Math.cos(a)*.17;const y=headY-.22;
      sweep([[x,y,z],[x*.83,y-.35,z+.04],[x*.63,y-.68,z+.13],[x*.33,y-.91,z+.16]],v=>(.04+(.5-Math.abs(i/20-.5))*.035)*(1-v*.85),m.beard,52,14,.12);
    }
    for(const side of [-1,1]){for(let i=0;i<10;i++){const z=-.25+i*.048;sweep([[side*.39,headY+.18,z],[side*.46,headY-.21,z],[side*.49,headY-.6,z+.03],[side*.4,headY-.81,z]],v=>.047*(1-.7*v),m.beard,44,12,.13);}sweep([[side*.015,headY-.18,.49],[side*.15,headY-.2,.51],[side*.25,headY-.3,.47]],v=>.043*(1-.66*v),m.beard,36,14,.1);}
    // Broad brim and a bent, hand-shaped pointed hat.
    const brim=lathe([[0,0],[.65,0],[.95,-.025],[1.13,-.08],[1.12,-.035],[.65,.04],[0,.04]],m.greyCloth,[0,4.32,0],g,80);
    const hatGeo=new THREE.CylinderGeometry(.012,.56,1.78,64,22);const hp=hatGeo.attributes.position;for(let i=0;i<hp.count;i++){const y=hp.getY(i),t=(y+.89)/1.78;hp.setX(i,hp.getX(i)-t*t*.44);hp.setZ(i,hp.getZ(i)+t*t*.12);}hatGeo.computeVertexNormals();c.mesh(hatGeo,m.greyCloth,[0,5.17,0],undefined,g);
    const hatBand=torus(.557,.046,m.darkWood,[0,4.48,0],g);hatBand.rotation.x=Math.PI/2;
    // Staff with rootwood twist and a pale light between its crown fingers.
    tube([[-1.15,.2,.37],[-1.15,1.7,.34],[-1.11,3.4,.27],[-1.2,4.35,.31],[-1.08,4.85,.3]],.07,m.wood,g);
    for(let i=0;i<5;i++){const a=i*TAU/5;tube([[-1.11,4.2,.3],[-1.1+Math.sin(a)*.2,4.65,.3+Math.cos(a)*.2],[-1.1+Math.sin(a)*.13,4.97,.3+Math.cos(a)*.13]],.037,m.paleWood,g,32);}
    ball(.115,m.glass,[-1.1,4.76,.3],undefined,g);const light=new THREE.PointLight('#cde4d7',3,5);light.position.set(-1.1,4.76,.3);g.add(light);
    // Glamdring sits in a worn scabbard at the belt.
    const sword=new THREE.Group();sword.position.set(.52,2.26,.12);sword.rotation.z=-.14;g.add(sword);box(.12,1.65,.09,m.darkWood,[0,-.75,0],sword);box(.47,.06,.09,m.iron,[0,.16,0],sword);cyl(.04,.047,.36,m.darkWood,[0,.36,0],12,sword);ball(.07,m.iron,[0,.59,0],undefined,sword);
    tube([[-.64,2.1,0],[-.46,2.16,.62],[.0,2.14,.75],[.47,2.16,.57],[.68,2.1,0]],.035,m.darkWood,g,48);
  }else{
    const hairPoint=(phi,theta,lift=0)=>[(.463+lift)*Math.cos(phi)*Math.sin(theta),headY+(.6+lift)*Math.cos(theta),(.435+lift)*Math.sin(phi)*Math.sin(theta)];
    const maxTheta=phi=>mix(1.94,1.19,Math.max(0,Math.sin(phi)));
    parametric((u,v)=>{const phi=u*TAU;return hairPoint(phi,v*maxTheta(phi),.005+Math.sin(phi*14+v*11)*.007);},96,40,hairMat);
    for(let i=0;i<76;i++){const phi=i*2.39996,theta=.32+rnd()*(maxTheta(phi)-.38),points=[];const size=.065+rnd()*.045;
      const center=V(...hairPoint(phi,theta,.033)),tangent=V(-Math.sin(phi),0,Math.cos(phi)),vertical=V(Math.cos(phi)*Math.cos(theta),-Math.sin(theta),Math.sin(phi)*Math.cos(theta));
      for(let j=0;j<=14;j++){const t=j/14,a=t*TAU*1.25+rnd()*.04;const p=center.clone().addScaledVector(tangent,Math.cos(a)*size*(1-.42*t)).addScaledVector(vertical,Math.sin(a)*size*(1-.42*t));p.addScaledVector(center.clone().sub(V(0,headY,0)).normalize(),.022*Math.sin(t*Math.PI));points.push(p.toArray());}
      sweep(points,v=>.028*(1-.62*v),hairMat,38,12,.13);
    }
    if(id==='frodo'){
      // Elven cloak with leaf clasp, hood folded behind the shoulders.
      clothSurface([[.91,.87],[.83,1.28],[.72,1.89],[.68,2.24],[.47,2.5]],m.greenCloth,{start:.62,arc:TAU-1.24,folds:18,depth:.78,offset:[0,0,-.12],fullness:.043});sculptBall(.43,m.greenCloth,[0,2.42,-.27],[1.3,.46,.8]);
      const leafShape=new THREE.Shape();leafShape.moveTo(0,-.095);leafShape.bezierCurveTo(-.084,-.03,-.045,.066,.032,.13);leafShape.bezierCurveTo(.07,.034,.062,-.031,0,-.095);const leafGeo=new THREE.ExtrudeGeometry(leafShape,{depth:.015,bevelEnabled:true,bevelSize:.006,bevelThickness:.004,bevelSegments:3,curveSegments:24});const leaf=c.mesh(leafGeo,m.gold,[0,2.41,.46],undefined,g);leaf.rotation.z=-.3;
      sweep([[0,2.32,.486],[.006,2.41,.486],[.03,2.52,.486]],()=>.003,m.darkLeaf,24,6);for(let i=0;i<5;i++)for(const side of [-1,1])sweep([[.007,2.36+i*.026,.484],[side*.036,2.39+i*.026,.484]],()=>.002,m.darkLeaf,8,4);
      // The One Ring and its chain, carefully scaled as a piece of jewellery.
      tube([[-.21,2.51,.26],[-.22,2.29,.45],[0,2.05,.535],[.22,2.29,.45],[.21,2.51,.26]],.009,m.gold,g,40);torus(.065,.015,m.gold,[0,2.06,.55],g);
      const sword=new THREE.Group();sword.position.set(-.62,1.66,.18);sword.rotation.z=.21;g.add(sword);box(.105,1.15,.075,m.darkWood,[0,-.51,0],sword);box(.37,.055,.1,m.iron,[0,.09,0],sword);cyl(.038,.039,.26,m.darkWood,[0,.23,0],10,sword);ball(.055,m.iron,[0,.4,0],undefined,sword);
    }else{
      // Bilbo carries the red leather volume and his travel pipe.
      const book=new THREE.Group();book.position.set(.89,1.81,.37);book.rotation.z=.18;g.add(book);box(.55,.76,.18,m.redCloth,[0,0,0],book);box(.48,.66,.16,m.cream,[.02,0,.02],book);box(.55,.035,.21,m.redCloth,[0,.37,0],book);box(.55,.035,.21,m.redCloth,[0,-.37,0],book);box(.07,.76,.22,m.redCloth,[-.25,0,0],book);
      for(let i=0;i<4;i++)box(.03,.045,.225,m.gold,[-.25,-.25+i*.16,0],book);
      tube([[-.9,1.73,.34],[-1.1,1.89,.37],[-1.3,1.91,.44]],.032,m.darkWood,g,24);cyl(.085,.07,.21,m.wood,[-1.32,2,.44],20,g);cyl(.06,.06,.015,m.black,[-1.32,2.11,.44],20,g);
      // Aging creases at the eyes and temple distinguish Bilbo's face.
      for(const side of [-1,1])for(let i=0;i<3;i++)tube([[side*.26,headY+.02+i*.018,.339],[side*.31,headY-.005+i*.015,.299]],.005,m.lip,g,8);
    }
  }
  // Small stones and fallen leaves frame the sculpture's circular exhibit base.
  for(let i=0;i<12;i++){const a=i*TAU/12;rock(Math.sin(a)*2.75,.18,Math.cos(a)*2.75,.1+rnd()*.1,m.rock);}
  g.rotation.y=-.12;
  return finish(wizard?[8.6,5.3,11.4]:[6.8,3.8,9.2],[0,wizard?2.75:1.65,0],'#717a6e','#9fa996',[-7,12,8],[
    {title:'Rzeźba wędrowca',position:wizard?[8.6,5.3,11.4]:[6.8,3.8,9.2],target:[0,wizard?2.75:1.65,0],text:'Interpretacja postaci łączy strój podróżny, osobiste przedmioty i organicznie ukształtowane powierzchnie.'},
    {title:'Twarz i włosy',position:[1.8,wizard?4.1:3.05,4.2],target:[0,wizard?4.02:2.91,.15],text:'Wyrzeźbione powieki, oczodoły i pasma włosów można obejrzeć z bliska.'},
    {title:wizard?'Laska i Glamdring':id==='frodo'?'Pierścień i liściasta zapinka':'Księga i fajka',position:wizard?[-3,4.8,3.3]:id==='frodo'?[1.35,2.45,2.8]:[2.2,2.1,3],target:wizard?[-1.1,4.6,.3]:id==='frodo'?[0,2.15,.47]:[.89,1.8,.37],text:wizard?'Korzeń laski obejmuje jasny kamień. Miecz pozostaje w pochwie przy pasie.':id==='frodo'?'Łańcuch, złoty Pierścień i zapinka o kształcie liścia należą do wyposażenia Powiernika.':'Bilbo trzyma oprawioną w czerwoną skórę księgę i podróżną fajkę.'},
  ]);
}

export function buildRegion(id){
  const constructors={shire,bree,rivendell,gondor,rohan,mordor,eye};
  if(constructors[id])return constructors[id]();
  if(['bilbo','frodo','gandalf'].includes(id))return character(id);
  throw new Error(`Unknown region: ${id}`);
}
