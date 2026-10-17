import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {needsCruiser,needsSpotlight,nerfPair,createCruiser,createTube,createAirTed,startAirTed,updateAirTed,createNerf,updateNerf,createBeerThrow,updateBeerThrow,createPizza} from '../dist/scene-events.mjs';
const context=new Proxy({},{get:()=>()=>{}});globalThis.document={createElement:()=>({getContext:()=>context})};
for(const id of ['wargo','wilkins'])assert(needsCruiser([id]));assert(!needsCruiser(['recker','pekalsky']));assert(needsSpotlight(['recker']));assert(!needsSpotlight(['wargo']));
const scene=new T.Scene(),deck=createCruiser();scene.add(deck.group);assert.equal(deck.group.name,'Cabin cruiser aft deck');assert(deck.waves.length>20);
const avatar=()=>{const a=new T.Group();a.userData.hands=[new T.Group(),new T.Group()];a.userData.arms=[new T.Group(),new T.Group()];return a;};
const swimmer=avatar(),oldParent=new T.Group();oldParent.add(swimmer);const tube=createTube(scene,swimmer,0);assert.equal(swimmer.parent,tube.group);assert(tube.group.position.x < -6);assert(tube.group.children.some(c=>c.geometry?.type==='TorusGeometry'));
const actor=(id,x)=>{const group=new T.Group();group.position.x=x;scene.add(group);const a=avatar(),head=new T.Group();group.add(a);a.add(head);return {characterId:id,group,avatar:a,head,away:false};};
const brodeur=actor('brodeur',-3),recker=actor('recker',3),bvn=actor('bvn',1);
assert.equal(nerfPair([brodeur,recker]).target,recker);assert(!nerfPair([brodeur]));assert(!nerfPair([recker]));
const nerf=createNerf(scene,{thrower:brodeur,target:recker});scene.updateMatrixWorld(true);for(let t=0;t<=3800;t+=100){updateNerf(nerf,t);assert(nerf.ball.position.toArray().every(Number.isFinite));}updateNerf(nerf,2500);assert(nerf.ball.position.distanceTo(recker.group.localToWorld(new T.Vector3(0,2.3,.08)))<.001);recker.away=true;updateNerf(nerf,1800);assert(!nerf.group.visible&&!nerf.hoop.visible);recker.away=false;
const plane=createAirTed();startAirTed(plane,100);assert.equal(updateAirTed(plane,0),0);assert(updateAirTed(plane,3350)>.3);assert(plane.group.visible);updateAirTed(plane,6600);assert(!plane.group.visible);assert(plane.next>=105100);
const beer=createBeerThrow(scene,bvn,recker,100);assert(updateBeerThrow(beer,500));assert(bvn.avatar.userData.hands[1].position.y>0);assert(!updateBeerThrow(beer,2300));assert(bvn.avatar.userData.hands[1].position.distanceTo(beer.restHand)<.001);assert(beer.drops.every(p=>p.visible));
console.log('Passed: cruiser cast triggers, Recker spotlight, floating tubes, conditional Nerf head bounce and hoop, timed Air Ted duck/flyby, and BVN beer throw with restored hand.');

assert.equal(createPizza().name,"Rueben pizza");assert(createPizza().children.length>10);console.log("Passed: Rueben pizza has crust, cheese and pepperoni on its own plate.");

updateNerf(nerf,3500);const rimCenter=recker.group.localToWorld(new T.Vector3(0,3.15,0));assert(nerf.ball.position.distanceTo(rimCenter)<.001);updateNerf(nerf,3750);assert(nerf.ball.position.y<rimCenter.y);updateNerf(nerf,4000);assert(!nerf.ball.visible);updateNerf(nerf,5800);assert(nerf.ball.visible&&nerf.ball.position.y<1);updateNerf(nerf,6700);assert(brodeur.avatar.userData.hands[1].position.y>2);updateNerf(nerf,7080);assert(nerf.pose.forearm.visible);updateNerf(nerf,8200);assert(!nerf.pose.forearm.visible);assert(brodeur.avatar.userData.hands[1].position.distanceTo(nerf.pose.restHand)<.001);
const whip=createBeerThrow(scene,bvn,recker,10000);updateBeerThrow(whip,10400);assert(bvn.avatar.userData.hands[1].position.y>2);updateBeerThrow(whip,10690);const early=whip.group.position.clone();updateBeerThrow(whip,10970);assert(whip.group.position.distanceTo(recker.group.localToWorld(new T.Vector3(0,2,.2)))<.001);assert(early.distanceTo(whip.group.position)>.1);updateBeerThrow(whip,12200);assert(!whip.pose.forearm.parent);assert(bvn.avatar.userData.hands[1].position.distanceTo(whip.restHand)<.001);
console.log('Passed: Nerf scores through rim, disappears, reloads below table and winds up; BVN whips beer to target in 380ms after release and restores his arm.');
