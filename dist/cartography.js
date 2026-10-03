import * as THREE from 'three';
// Calibrated against Pauline Baynes's pictorial map, made in consultation with Tolkien.
// The original reference remains visible in the colophon; relief heights are interpretive.
const landmarks=[
 ['shire',-30,-14,.307,.350],['bree',-19,-13,.375,.346],['rivendell',1,-22,.508,.326],
 ['gondor',17,28,.628,.548],['rohan',5,15,.513,.485],['mordor',33,23,.724,.549],['eye',35,18,.739,.528],
 ['misty',5,-23,.524,.326],['goblintown',6,-26,.532,.312],['beorn',13,-26,.564,.329],
 ['laketown',25,-26,.651,.304],['erebor',25,-33,.663,.291],['mirkwood',22,-18,.600,.357],['thranduil',23,-29,.629,.315]
];
const chains=[[[.475,.247],[.530,.274],[.534,.319],[.516,.365],[.498,.409],[.481,.458]],[[.344,.504],[.414,.500],[.471,.506],[.550,.531],[.619,.549]],[[.666,.605],[.646,.565],[.646,.522],[.712,.506],[.782,.499],[.858,.488]],[[.667,.607],[.741,.617],[.817,.598]],[[.169,.277],[.177,.318],[.185,.377],[.200,.400]]];
function dist(x,y,a,b){const vx=b[0]-a[0],vy=b[1]-a[1],t=THREE.MathUtils.clamp(((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy),0,1);return Math.hypot(x-a[0]-t*vx,y-a[1]-t*vy);}
const fract=n=>n-Math.floor(n);const grain=(x,y)=>fract(Math.sin(x*317.6+y*173.4)*43758.5);
function sourceUV(x,z){const u=.51+x*.0061+z*.0007,v=.426+z*.0047+x*.0004;const nearest=landmarks.map(a=>({a,d:Math.hypot(x-a[1],z-a[2])})).sort((a,b)=>a.d-b.d).slice(0,4);if(nearest[0].d<.01)return [nearest[0].a[3],nearest[0].a[4]];let du=0,dv=0,total=0;for(const {a,d}of nearest){const w=1/Math.pow(d,3);du+=(a[3]-(.51+a[1]*.0061+a[2]*.0007))*w;dv+=(a[4]-(.426+a[2]*.0047+a[1]*.0004))*w;total+=w;}return [u+du/total,v+dv/total];}
export function buildIllustratedMap(kind){
 const rect=kind==='bilbo'?[.215,.77,.246,.467]:[.15,.915,.298,.677];
 const [u0,u1,v0,v1]=rect,width=105,depth=width*((v1-v0)/(u1-u0))*2000/1424;
 const group=new THREE.Group();group.name=kind==='bilbo'?'Atlas Bilba — Eriador i Dzikie Kraje':'Atlas Froda — droga ku Mordorowi';
 const uvToWorld=(u,v)=>[(u-(u0+u1)/2)/(u1-u0)*width,(v-(v0+v1)/2)/(v1-v0)*depth];
 const worldToUV=(x,z)=>[(x/width)*(u1-u0)+(u0+u1)/2,(z/depth)*(v1-v0)+(v0+v1)/2];
 const elevation=(x,z)=>{const [u,v]=worldToUV(x,z);let h=.08;for(let c=0;c<chains.length;c++){let d=1;for(let i=1;i<chains[c].length;i++)d=Math.min(d,dist(u,v,chains[c][i-1],chains[c][i]));h+=Math.exp(-d*d/.000055)*(c===0?1.25:.85)*(.62+.38*Math.sin(v*610+u*110)**2);}h+=Math.exp(-((u-.663)**2+(v-.291)**2)/.00010)*1.55;h+=.07*Math.sin(x*.22)*Math.sin(z*.19);return h;};
 const geo=new THREE.PlaneGeometry(width,depth,560,360);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,elevation(p.getX(i),p.getZ(i)));geo.computeVertexNormals();
 const material=new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false});
 const terrain=new THREE.Mesh(geo,material);terrain.castShadow=true;terrain.receiveShadow=true;group.add(terrain);
 const ready=new Promise(resolve=>new THREE.TextureLoader().load('assets/baynes-map.jpg',texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=16;texture.offset.set(u0,1-v1);texture.repeat.set(u1-u0,v1-v0);material.map=texture;material.needsUpdate=true;resolve();},undefined,()=>resolve()));
 const base=new THREE.Mesh(new THREE.BoxGeometry(width+.2,.36,depth+.2),new THREE.MeshStandardMaterial({color:'#a68a52',roughness:.9}));base.position.y=-.25;group.add(base);
 const pages=new THREE.Mesh(new THREE.BoxGeometry(width-.15,.12,depth-.1),new THREE.MeshStandardMaterial({color:'#ddd0a4',roughness:1}));pages.position.y=-.46;group.add(pages);
 const pins=[];const allowed=kind==='bilbo'?['shire','rivendell','misty','goblintown','beorn','mirkwood','thranduil','laketown','erebor']:['shire','bree','rivendell','rohan','gondor','mordor','eye'];
 const gold=new THREE.MeshStandardMaterial({color:'#be7b38',metalness:.5,roughness:.45,emissive:'#a94120',emissiveIntensity:.13});
 for(const [id,x,z,u,v]of landmarks){if(!allowed.includes(id))continue;const [px,pz]=uvToWorld(u,v),py=elevation(px,pz);const pin=new THREE.Mesh(new THREE.SphereGeometry(.21,20,14),gold);pin.position.set(px,py+.32,pz);group.add(pin);pins.push({id,position:new THREE.Vector3(px,py+.95,pz)});}
 return {group,ready,pins,mountainLabels:[],camera:kind==='bilbo'?[0,83,9]:[0,103,10],target:[0,0,0],background:'#d6c7a0',fog:'#d6c7a0',sun:[-45,80,-25],isIllustrated:true,mapKind:kind,project:coords=>uvToWorld(...sourceUV(...coords)),heightAt:elevation,bounds:[-width/2,width/2,-depth/2,depth/2],animate:()=>{}};
}
