import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {createFunnelVisit,startFunnelVisit,updateFunnelVisit,cancelFunnelVisit} from '../dist/funnel.mjs';
import {CHARACTERS} from '../dist/roster.mjs';
assert.equal(CHARACTERS.carson.name,'Carson');assert.equal(CHARACTERS.carson.hair,'#171919');
function actor(){const avatar=new T.Group(),head=new T.Group();head.position.y=2;avatar.add(head);avatar.userData.hands=[new T.Group(),new T.Group()];avatar.userData.arms=[new T.Mesh(new T.CapsuleGeometry(.1,.38)),new T.Mesh(new T.CapsuleGeometry(.1,.38))];avatar.add(...avatar.userData.hands,...avatar.userData.arms);return {avatar,head};}
function person(id,x,z){const p={...actor(),group:new T.Group(),beerCup:new T.Group(),characterId:id,name:id,away:false};p.group.position.set(x,0,z);p.group.add(p.avatar,p.beerCup);return p;}
const scene=new T.Group(),seated=[person('carson',0,3.25),person('recker',-3.25,0),person('rooks',0,-3.25)];scene.add(...seated.map(p=>p.group));
const r=createFunnelVisit(actor());scene.add(r.group);
assert.equal(startFunnelVisit(r,0,[seated[0]]),null);
const visit=startFunnelVisit(r,100,seated,{originals:seated,random:()=>0});assert.equal(visit.target,'recker');assert.equal(visit.duration,6500);assert.equal(startFunnelVisit(r,200,seated),null);
assert(!seated[0].avatar.visible);assert(r.group.visible);assert(r.funnel.visible&&r.hose.visible);assert.equal(r.actor.avatar.position.y,1.71);
assert(updateFunnelVisit(r,99),'An early frame must retain the visit');
const tabletop=r.actor.avatar.position.clone();
for(let t=100;t<6600;t+=100){assert(updateFunnelVisit(r,t));assert(r.actor.avatar.position.distanceTo(tabletop)<1e-9,'Carson stays on the table for the full routine');assert(r.legs.every(leg=>leg.rotation.x===0));assert(r.funnel.visible&&r.hose.visible);assert(!seated[1].beerCup.visible);r.group.updateMatrixWorld(true);r.group.traverse(o=>{assert(o.position.toArray().every(Number.isFinite));assert(o.quaternion.toArray().every(Number.isFinite));});
 const end=new T.Vector3(0,-.1,.3);r.target.head.localToWorld(end);r.group.worldToLocal(end);const positions=r.hose.geometry.attributes.position;const average=new T.Vector3();for(let i=positions.count-9;i<positions.count;i++)average.add(new T.Vector3().fromBufferAttribute(positions,i));average.divideScalar(9);assert(average.distanceTo(end)<.02,'Hose meets the front of the recipient’s mouth');
}
assert(r.beer.scale.x<.1);assert(!updateFunnelVisit(r,6600));assert(!r.group.visible);assert(seated[0].avatar.visible);assert(seated[1].beerCup.visible);assert.equal(seated[1].head.rotation.x,0);
startFunnelVisit(r,10000,seated,{originals:seated,random:()=>0});updateFunnelVisit(r,12000);cancelFunnelVisit(r);assert(seated[0].avatar.visible);assert(seated[1].beerCup.visible);
startFunnelVisit(r,20000,seated,{originals:seated,random:()=>0});const again=startFunnelVisit(r,21000,seated,{originals:seated,random:()=>.99,force:true});assert.equal(again.target,'rooks');assert(seated[1].beerCup.visible);assert.equal(r.actor.avatar.position.y,1.71);cancelFunnelVisit(r);assert(seated[2].beerCup.visible);
startFunnelVisit(r,30000,seated,{random:()=>0});seated[1].away=true;assert(!updateFunnelVisit(r,31000));assert(seated[1].beerCup.visible);seated[1].away=false;
console.log('Passed: Carson appears immediately on the tabletop with the funnel, stays there throughout the routine, drains the beer through a mouth-connected hose, disappears at completion and restores the seated player and cups.');
const fs=await import('node:fs');const sceneSource=fs.readFileSync(new URL('../dist/scene.js',import.meta.url),'utf8');const previewSource=sceneSource.slice(sceneSource.indexOf('export function previewFunnel('),sceneSource.indexOf('export function previewChristmasTree(')).replace('export function','function');let cleared=0,forced=false;const activeTree={until:999999};const preview=new Function('performance','christmasTree','clearTreeCrew','startFunnelVisit','funnelVisit','people','cruiser','onCruiser','pongActors','backgroundSmoker',previewSource+';return previewFunnel')({now:()=>100},activeTree,()=>cleared++,(_r,_t,_p,opts)=>{forced=opts.force;return {target:'Recker'}},r,seated,{cabinDoor:null},false,[],null);assert.equal(preview(),null);assert.equal(cleared,0);assert.equal(preview({force:true}).target,'Recker');assert.equal(cleared,1);assert(forced);console.log('Passed: a queued funnel clears a conflicting tree at the point boundary.');

// Check world-space orientation, not only the actor's root position.
for(let count=2;count<=9;count++)for(let seat=0;seat<count;seat++){
 const angle=seat*Math.PI*2/count,target=person('target',Math.sin(angle)*3.25,Math.cos(angle)*3.25);scene.add(target.group);
 startFunnelVisit(r,40000,[target]);
 for(const dt of [0,1000,3250,6400]){updateFunnelVisit(r,40000+dt);const headPosition=r.actor.head.getWorldPosition(new T.Vector3());assert(headPosition.y>3.5,`Carson must stay upright for ${count} seats, target ${seat}`);}
 cancelFunnelVisit(r);scene.remove(target.group);
}

console.log('Passed: Carson stays upright above the tabletop for every recipient in every 2–9-player seating arrangement.');
