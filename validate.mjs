import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import {regions,characters,journeys,visualReferences} from './dist/lore.js';
import {referenceAssets} from './dist/reference-assets.js';
import {buildRegion} from './dist/regions.js';
import {buildBonusRegion} from './dist/bonus-regions.js';
import {buildExtraCharacter,extraCharacters} from './dist/extra-characters.js';
import {buildRoute} from './dist/world.js';
const bonus=new Set(['misty','goblintown','beorn','laketown','erebor','mirkwood','thranduil']);
const selected=process.argv.includes('--regions-only')?[...regions,...characters]:[...regions,...characters,...extraCharacters];
const cityIds=new Set(['shire','bree','rivendell','gondor','rohan','laketown','erebor','thranduil','goblintown']);
let total=0,stops=0;
for(const data of selected){
 const s=bonus.has(data.id)?buildBonusRegion(data.id):extraCharacters.some(c=>c.id===data.id)?buildExtraCharacter(data.id):buildRegion(data.id);
 let triangles=0,meshes=0;
 s.group.updateMatrixWorld(true);s.animate?.(2);s.setTour?.(1);s.setTour?.(-1);
 for(const a of [s.camera,s.target,...s.tours.flatMap(t=>[t.position,t.target])])if(a.length!==3||a.some(n=>!Number.isFinite(n)))throw Error(`Invalid camera ${data.id}`);
 if(!s.tours.length)throw Error(`Missing tour ${data.id}`);
 s.group.traverse(o=>{
  if(o.isMesh){meshes++;const g=o.geometry;triangles+=(g.index?.count||g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);
   for(const [name,a] of Object.entries(g.attributes))for(const n of a.array)if(!Number.isFinite(n))throw Error(`Nonfinite ${name} in ${data.id}`);
   if(g.index)for(const n of g.index.array)if(!Number.isInteger(n)||n<0||n>=g.attributes.position.count)throw Error(`Out-of-range index in ${data.id}`);
   if(o.isInstancedMesh)for(const n of o.instanceMatrix.array)if(!Number.isFinite(n))throw Error(`Invalid instance ${data.id}`);
  }
  for(const n of o.matrixWorld.elements)if(!Number.isFinite(n))throw Error(`Invalid world transform ${data.id}`);
 });
 const bounds=new THREE.Box3().setFromObject(s.group);if(bounds.isEmpty()||!Number.isFinite(bounds.max.length()))throw Error(`Empty bounds ${data.id}`);
 if(cityIds.has(data.id)){
  const cb=s.cityBounds;if(!cb)throw Error(`Missing city plan bounds ${data.id}`);
  for(const v of [cb.min,cb.max])if(v.length!==3||v.some(n=>!Number.isFinite(n)))throw Error(`Invalid city plan ${data.id}`);
  if(cb.max.some((n,i)=>n<=cb.min[i]))throw Error(`Collapsed city plan ${data.id}`);
  const settlement=s.settlement;if(!settlement||!settlement.interpretation)throw Error(`Missing settlement interpretation ${data.id}`);
  if(!(settlement.buildings>0||settlement.halls>0||settlement.rooms>0))throw Error(`Missing settlement coverage ${data.id}`);
  if(s.buildingFootprints)for(const f of s.buildingFootprints){
   if([f.x,f.z,f.y,f.w,f.d].some(n=>!Number.isFinite(n))||f.w<=0||f.d<=0)throw Error(`Invalid building footprint ${data.id}`);
   if(f.x<cb.min[0]-.5||f.x>cb.max[0]+.5||f.z<cb.min[2]-.5||f.z>cb.max[2]+.5)throw Error(`Building outside city plan ${data.id}`);
  }
  if(['erebor','thranduil','goblintown'].includes(data.id)&&!s.planCutaway)throw Error(`Underground plan cannot be revealed ${data.id}`);
 }
 console.log(`${data.id}: ${meshes} meshes, ${Math.round(triangles)} triangles, ${s.tours.length} stops`);total+=triangles;stops+=s.tours.length;
}
for(const r of regions){if(!visualReferences[r.id]?.images?.length)throw Error(`Missing visual references ${r.id}`);for(const im of visualReferences[r.id].images){const local=referenceAssets[im.url];if(!local||!fs.existsSync(path.join('dist',local)))throw Error(`Missing illustration ${r.id}`);}}
for(const j of Object.values(journeys))for(const s of j.steps){if(s.region&&!regions.some(r=>r.id===s.region))throw Error('Invalid journey region');if(s.coords.some(n=>!Number.isFinite(n)))throw Error('Invalid route point');}
for(const [id,j] of Object.entries(journeys)){
 const route=buildRoute(j.steps);for(let step=0;step<=j.steps.length-1;step+=.25){const p=route.update(step);if(p.toArray().some(n=>!Number.isFinite(n)))throw Error(`Invalid travel marker ${id}`);const i=Math.floor(step),f=step-i,a=j.steps[i].coords,b=j.steps[Math.min(i+1,j.steps.length-1)].coords;if(Math.abs(p.x-THREE.MathUtils.lerp(a[0],b[0],f))>1e-6||Math.abs(p.z-THREE.MathUtils.lerp(a[1],b[1],f))>1e-6)throw Error(`Route stage mismatch ${id}`);}
 route.animate(30);route.group.traverse(o=>{if(!o.geometry)return;for(const a of Object.values(o.geometry.attributes))for(const n of a.array)if(!Number.isFinite(n))throw Error(`Invalid route geometry ${id}`);const range=o.geometry.drawRange;if(Number.isFinite(range.count)&&range.start+range.count>o.geometry.attributes.position.count)throw Error(`Invalid route reveal ${id}`);});
 if(id!=='fellowship'&&j.steps.some(s=>!['outbound','return','epilogue'].includes(s.phase)))throw Error(`Missing journey phase ${id}`);
}
const stationaryRoute=buildRoute(Array.from({length:3},()=>({coords:[1,2]})));for(const step of [0,.5,1,1.5,2])if(stationaryRoute.update(step).toArray().some(n=>!Number.isFinite(n)))throw Error('Repeated-place route failed');
console.log(`Validated ${selected.length} scenes, ${stops} stops, ${Math.round(total)} triangles, every region's local illustrations and ${Object.values(journeys).reduce((n,j)=>n+j.steps.length,0)} journey stages.`);
