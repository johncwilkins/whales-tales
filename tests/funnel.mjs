import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {createFunnelVisit,startFunnelVisit,updateFunnelVisit,cancelFunnelVisit} from '../dist/funnel.mjs';
import {CHARACTERS} from '../dist/roster.mjs';
import {createCruiser} from '../dist/scene-events.mjs';
assert.equal(CHARACTERS.carson.name,'Carson');assert.equal(CHARACTERS.carson.hair,'#171919');
function actor(){const avatar=new T.Group(),head=new T.Group();head.position.y=2;avatar.add(head);avatar.userData.hands=[new T.Group(),new T.Group()];avatar.userData.arms=[new T.Mesh(new T.CapsuleGeometry(.1,.38)),new T.Mesh(new T.CapsuleGeometry(.1,.38))];avatar.add(...avatar.userData.hands,...avatar.userData.arms);return {avatar,head};}
function person(id,x,z){const p={...actor(),group:new T.Group(),beerCup:new T.Group(),characterId:id,name:id,away:false};p.group.position.set(x,0,z);p.group.add(p.avatar,p.beerCup);return p;}
const scene=new T.Group(),seated=[person('carson',0,3.25),person('recker',-3.25,0),person('rooks',0,-3.25)];scene.add(...seated.map(p=>p.group));
const r=createFunnelVisit(actor());scene.add(r.group);const hinge=new T.Group(),doors={doors:[{leaves:[{hinge,hingeSide:-1}]}]};
assert.equal(startFunnelVisit(r,0,[seated[0]]),null);
assert.equal(startFunnelVisit(r,100,seated,{doors,originals:seated,random:()=>0}).target,'recker');assert.equal(startFunnelVisit(r,200,seated),null);
assert(!seated[0].avatar.visible);assert(r.group.visible);
assert(updateFunnelVisit(r,99),'A frame timestamp slightly before the key event must not cancel the visit');assert(r.target);assert(r.group.visible);
for(let t=100;t<15100;t+=100){assert(updateFunnelVisit(r,t));r.group.updateMatrixWorld(true);r.group.traverse(o=>{assert(o.position.toArray().every(Number.isFinite));assert(o.quaternion.toArray().every(Number.isFinite));});
 if(t<3100){const p=r.actor.avatar.position;assert(!(p.x> -10.6&&p.x< -5.4&&p.z< -4.3&&p.z> -6.1),'Carson must clear the back bar');}
 if(t===7100){assert(r.funnel.visible);assert(r.hose.visible);assert(!r.target.beerCup.visible);assert(r.actor.avatar.position.y>1.7);assert(hinge.rotation.y!==undefined);const end=new T.Vector3(0,-.1,.3);r.target.head.localToWorld(end);r.group.worldToLocal(end);const positions=r.hose.geometry.attributes.position;let average=new T.Vector3();for(let i=positions.count-9;i<positions.count;i++)average.add(new T.Vector3().fromBufferAttribute(positions,i));average.divideScalar(9);assert(average.distanceTo(end)<.02,'Hose must meet the front of the recipient’s mouth');}
}
assert(!updateFunnelVisit(r,15100));assert(!r.group.visible);assert(seated[0].avatar.visible);assert(seated[1].beerCup.visible);assert.equal(hinge.rotation.y,0);
startFunnelVisit(r,16000,seated,{doors,originals:seated,random:()=>0});updateFunnelVisit(r,23000);cancelFunnelVisit(r);assert(seated[1].beerCup.visible);assert(seated[0].avatar.visible);
const cruiser=createCruiser();scene.add(cruiser.group);assert(cruiser.cabinDoor);
startFunnelVisit(r,30000,seated,{onCruiser:true,cabinDoor:cruiser.cabinDoor,random:()=>.99});updateFunnelVisit(r,31000);assert(Math.abs(cruiser.cabinDoor.rotation.y)>1);cancelFunnelVisit(r);assert(Math.abs(cruiser.cabinDoor.rotation.y)<1e-9);
startFunnelVisit(r,50000,seated,{random:()=>0});seated[1].away=true;assert(!updateFunnelVisit(r,51000));assert(!r.group.visible);assert(seated[1].beerCup.visible);
console.log('Passed: Carson enters around the bar, climbs to table height, funnels another player through a mouth-connected hose, avoids duplicates, restores cups and doors, and cancels safely on cast/away changes.');

seated[1].away=false;startFunnelVisit(r,60000,seated,{originals:seated,random:()=>0});updateFunnelVisit(r,67000);assert(!seated[1].beerCup.visible);const again=startFunnelVisit(r,67500,seated,{originals:seated,random:()=>.99,force:true});assert.equal(again.target,'rooks');assert(seated[1].beerCup.visible);assert(updateFunnelVisit(r,67499));assert(r.group.visible);assert.equal(r.until,82500);cancelFunnelVisit(r);assert(seated[0].avatar.visible);assert(seated[2].beerCup.visible);
const fs=await import('node:fs');const sceneSource=fs.readFileSync(new URL('../dist/scene.js',import.meta.url),'utf8');const previewSource=sceneSource.slice(sceneSource.indexOf('export function previewFunnel('),sceneSource.indexOf('export function previewChristmasTree(')).replace('export function','function');let cleared=0,forced=false;const activeTree={until:999999};const preview=new Function('performance','christmasTree','clearTreeCrew','startFunnelVisit','funnelVisit','people','cruiser','onCruiser','pongActors','backgroundSmoker',previewSource+';return previewFunnel')({now:()=>100},activeTree,()=>cleared++,(_r,_t,_p,opts)=>{forced=opts.force;return {target:'Recker'}},r,seated,{cabinDoor:null},false,[],null);assert.equal(preview(),null);assert.equal(cleared,0);assert.equal(preview({force:true}).target,'Recker');assert.equal(cleared,1);assert(forced);console.log('Passed: early animation timestamps retain Carson; manual N restarts his visit cleanly and takes priority over the tree without leaving hidden players or cups.');
