import * as T from './vendor/three.module.js';
const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.65});
function part(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,typeof color==='string'?mat(color):color);m.position.set(x,y,z);g.add(m);return m;}
const box=(g,w,h,d,c,x=0,y=0,z=0)=>part(g,new T.BoxGeometry(w,h,d),c,x,y,z);
export const needsCruiser=ids=>ids.some(id=>id==='wargo'||id==='wilkins');
export const needsSpotlight=ids=>ids.includes('recker');
export function nerfPair(people){const thrower=people.find(p=>p.characterId==='brodeur');const target=people.find(p=>['recker','pekalsky'].includes(p.characterId));return thrower&&target?{thrower,target}:null;}
export function createCruiser(){
 const group=new T.Group();group.name='Cabin cruiser aft deck';
 const sea=part(group,new T.PlaneGeometry(160,160),new T.MeshStandardMaterial({color:'#287b96',roughness:.28,metalness:.25}),0,-.72,0);sea.rotation.x=-Math.PI/2;
 box(group,12,.4,12,'#f1eee2',0,-.3,0);
 for(let i=0;i<29;i++)box(group,.39,.035,10.8,i%3?'#b59466':'#ad895b',-5.6+i*.4,-.065,0);
 for(const x of [-5.9,5.9]){box(group,.2,.6,11.8,'#eeeee3',x,.22,0);for(let z=-5;z<=5;z+=2){part(group,new T.CylinderGeometry(.035,.035,1.1,8),'#aebfc5',x,.9,z);}box(group,.055,.055,11.8,'#bdc9cc',x,1.45,0);}
 // Raised white cabin, dark wraparound windows and bow roof behind the players.
 box(group,5.8,2.8,2.1,'#f1f1e8',0,1.35,-5.7);box(group,5.4,1.15,.035,'#244554',0,2.05,-4.63);box(group,.15,1.2,.08,'#eaece6',0,2.05,-4.55);box(group,6.3,.18,2.7,'#faf9ed',0,2.83,-5.7);
 for(const x of [-4.4,4.4]){const ring=part(group,new T.TorusGeometry(.43,.12,8,24),'#f59d4e',x,.85,-5.35);ring.rotation.y=.1;}
 const waves=[];for(let i=0;i<35;i++){const w=box(group,1.2+(i%4)*.5,.012,.06,'#76bdc5',((i*7)%23)-11,-.69,-9-Math.floor(i/12)*3);waves.push(w);}
 return {group,sea,waves};
}
export function createTube(parent,avatar,index){const group=new T.Group();group.name='Inner-tube swimmer';parent.add(group);group.position.set(index?6.8:-6.8,-.45,-2.7-index*2);group.rotation.y=index?-.7:.7;avatar.removeFromParent();avatar.position.set(0,-.76,0);avatar.rotation.set(0,0,0);group.add(avatar);const tube=part(group,new T.TorusGeometry(.64,.22,12,32),index?'#e5ae47':'#498da6',0,.22,0);tube.rotation.x=Math.PI/2;return {group,avatar};}
export function createAirTed(){const group=new T.Group();group.name='Air Ted flyby';group.visible=false;
 const body=part(group,new T.CylinderGeometry(.16,.24,2.2,12),'#e6ded0');body.rotation.z=Math.PI/2;box(group,1,.08,3.5,'#d23e37',-.15,.08,0);box(group,.65,.07,1.3,'#e6ded0',.88,.14,0);box(group,.45,.65,.07,'#d23e37',.83,.32,0);const prop=box(group,.05,1.05,.06,'#202c31',-1.16,0,0);
 box(group,2.6,.035,.025,'#62635a',2.4,0,0);
 const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#fff2c8';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#b32a2e';ctx.font='bold 150px sans-serif';ctx.textAlign='center';ctx.fillText('Air Ted',512,183);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const banner=part(group,new T.PlaneGeometry(3.3,.85),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}),4.8,0,0);banner.rotation.x=-.45;
 return {group,prop,banner,start:0,until:0,next:performance.now()+75000};}
export function startAirTed(r,time){r.start=time;r.until=time+6500;r.next=time+105000+Math.random()*90000;}
export function updateAirTed(r,time){const u=(time-r.start)/6500;r.group.visible=time>=r.start&&time<r.until;if(!r.group.visible)return 0;r.group.position.set(17-u*39,3.8+Math.sin(u*Math.PI)*.3,1.4);r.group.rotation.z=Math.sin(u*12)*.025;r.prop.rotation.x=time*.07;r.banner.rotation.y=Math.sin(time*.008)*.08;return Math.sin(Math.PI*Math.max(0,Math.min(1,(u-.2)/.65)))*.6;}
function throwingRig(avatar){
 const arm=avatar.userData.arms[1],hand=avatar.userData.hands[1];const forearm=part(avatar,new T.CylinderGeometry(.065,.055,1,8),'#cba28b');forearm.visible=false;
 return {avatar,arm,hand,forearm,restHand:hand.position.clone(),restArm:{position:arm.position.clone(),quaternion:arm.quaternion.clone(),scale:arm.scale.clone()},restBody:avatar.rotation.z};
}
function restoreThrow(r){r.arm.position.copy(r.restArm.position);r.arm.quaternion.copy(r.restArm.quaternion);r.arm.scale.copy(r.restArm.scale);r.hand.position.copy(r.restHand);r.avatar.rotation.z=r.restBody;r.forearm.visible=false;}
function throwPose(r,hand,elbow,lean=0){
 const shoulder=new T.Vector3(.3,1.65,0);const upper=elbow.clone().sub(shoulder);r.arm.position.copy(shoulder).add(elbow).multiplyScalar(.5);r.arm.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),upper.clone().normalize());r.arm.scale.set(1,upper.length()/.58,1);r.hand.position.copy(hand);
 const lower=hand.clone().sub(elbow);r.forearm.position.copy(elbow).add(hand).multiplyScalar(.5);r.forearm.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),lower.clone().normalize());r.forearm.scale.y=lower.length();r.forearm.visible=true;r.avatar.rotation.z=r.restBody+lean;
}
const mix=(a,b,t)=>a.clone().lerp(b,Math.max(0,Math.min(1,t)));
function targetDirection(thrower,target){const point=target.group.getWorldPosition(new T.Vector3());thrower.group.worldToLocal(point);point.y=0;return point.lengthSq()?point.normalize():new T.Vector3(0,0,1);}
function hardThrowPose(r,elapsed,direction){
 const rest=r.restHand,pickup=new T.Vector3(.38,.72,.15),cocked=new T.Vector3(.45,2.38,-.48),follow=new T.Vector3(.3,1.85,0).addScaledVector(direction,1.1);let hand,elbow,lean;
 if(elapsed<1000){hand=mix(rest,pickup,Math.sin(elapsed/1000*Math.PI/2));elbow=new T.Vector3(.55,1.18,.05);lean=-.13;}
 else if(elapsed<1800){hand=mix(pickup,cocked,(elapsed-1000)/800);elbow=new T.Vector3(.73,2.05,-.25);lean=-.22;}
 else if(elapsed<2100){const u=(elapsed-1800)/300;hand=mix(cocked,follow,u);elbow=mix(new T.Vector3(.73,2.05,-.25),new T.Vector3(.35,1.9,0).addScaledVector(direction,.6),u);lean=-.22+u*.48;}
 else if(elapsed<2800){const u=(elapsed-2100)/700;hand=mix(follow,rest,u);elbow=mix(new T.Vector3(.35,1.9,0).addScaledVector(direction,.6),new T.Vector3(.36,1.5,.18),u);lean=.26*(1-u);}
 else{restoreThrow(r);return;}
 throwPose(r,hand,elbow,lean);
}
export function createNerf(scene,pair){const group=new T.Group();group.name='Brodeur Nerf basketball';scene.add(group);const ball=part(group,new T.SphereGeometry(.15,14,10),'#f28b28');const hoop=new T.Group();pair.target.group.add(hoop);hoop.position.set(0,3.15,0);box(hoop,1.1,.7,.06,'#ece8db',0,.35,-.24);const rim=part(hoop,new T.TorusGeometry(.35,.035,8,28),'#ee8427');rim.rotation.x=Math.PI/2;for(let i=0;i<10;i++){const a=i*Math.PI/5;const line=part(hoop,new T.CylinderGeometry(.008,.008,.35,4),'#e4e4d6',Math.cos(a)*.29,-.18,Math.sin(a)*.29);line.rotation.z=Math.cos(a)*.18;}
 return {group,ball,hoop,...pair,pose:throwingRig(pair.thrower.avatar)};}
export function updateNerf(r,time){
 r.group.visible=!r.thrower.away&&!r.target.away;r.hoop.visible=r.group.visible;if(!r.group.visible){restoreThrow(r.pose);return;}
 const elapsed=((time%5000)+5000)%5000,direction=targetDirection(r.thrower,r.target);hardThrowPose(r.pose,elapsed,direction);r.thrower.avatar.updateMatrixWorld(true);
 const releaseLocal=new T.Vector3(.3,1.85,0).addScaledVector(direction,1.1),from=r.thrower.avatar.localToWorld(releaseLocal),head=r.target.group.localToWorld(new T.Vector3(0,2.3,.08)),hoop=r.target.group.localToWorld(new T.Vector3(0,3.15,0));
 r.ball.visible=elapsed>=650&&elapsed<3850;
 if(elapsed<1000){r.ball.position.copy(r.thrower.group.localToWorld(new T.Vector3(.38,.72,.15)));}
 else if(elapsed<2100){r.ball.position.copy(r.thrower.avatar.localToWorld(r.pose.hand.position.clone()));}
 else if(elapsed<2500){r.ball.position.lerpVectors(from,head,(elapsed-2100)/400);r.ball.position.y+=Math.sin((elapsed-2100)/400*Math.PI)*.12;}
 else if(elapsed<3500){const u=(elapsed-2500)/1000;r.ball.position.lerpVectors(head,hoop,u);r.ball.position.y+=Math.sin(u*Math.PI)*.9;}
 else if(elapsed<3850){r.ball.position.copy(hoop);r.ball.position.y-=(elapsed-3500)/350*.8;}
 const hit=Math.max(0,1-Math.abs(elapsed-2500)/160);r.target.head.rotation.x+=hit*.25;
}
export function createBeerThrow(scene,thrower,target,time){
 const group=new T.Group();group.name='BVN flying beer';scene.add(group);const cup=part(group,new T.CylinderGeometry(.14,.1,.34,12),'#c33132');const drops=Array.from({length:12},()=>part(group,new T.SphereGeometry(.045,6,4),'#d8a743'));const pose=throwingRig(thrower.avatar);
 return {group,cup,drops,thrower,target,pose,restHand:pose.restHand,start:time,until:time+2200};
}
export function updateBeerThrow(r,time){
 const elapsed=Math.max(0,time-r.start),direction=targetDirection(r.thrower,r.target);
 // A short backswing followed by a 140ms snap, then a fast, low flight.
 hardThrowPose(r.pose,elapsed<450?1000+elapsed/450*800:elapsed<590?1800+(elapsed-450)/140*300:2100+(elapsed-590)/650*700,direction);
 r.thrower.avatar.updateMatrixWorld(true);const from=r.thrower.avatar.localToWorld(new T.Vector3(.3,1.85,0).addScaledVector(direction,1.1)),to=r.target.group.localToWorld(new T.Vector3(0,2,.2));
 if(elapsed<590){r.group.position.copy(r.thrower.avatar.localToWorld(r.pose.hand.position.clone()));r.cup.rotation.z=-elapsed/450*.6;}
 else{const u=Math.min(1,(elapsed-590)/380);r.group.position.lerpVectors(from,to,u);r.group.position.y+=Math.sin(u*Math.PI)*.15;r.cup.rotation.z=(elapsed-590)*.018;}
 r.cup.visible=elapsed<1020;for(const [i,p] of r.drops.entries()){const splash=Math.max(0,(elapsed-970)/1230);p.position.set(Math.sin(i*2.4)*splash*1.1,-splash*splash*1.4,Math.cos(i*2.4)*splash*.9);p.visible=elapsed>=970;}
 if(time>=r.until){restoreThrow(r.pose);r.pose.forearm.removeFromParent();r.pose.forearm.geometry.dispose();return false;}return true;
}
export function createPizza(){const group=new T.Group();group.name='Rueben pizza';group.position.set(-.55,1.72,.78);part(group,new T.CylinderGeometry(.38,.38,.025,28),'#e2ddd0');part(group,new T.CylinderGeometry(.34,.34,.05,28),'#bd793b',0,.035,0);part(group,new T.CylinderGeometry(.3,.3,.012,28),'#e5bc58',0,.065,0);const crust=part(group,new T.TorusGeometry(.315,.026,8,28),'#ce9449',0,.065,0);crust.rotation.x=Math.PI/2;for(let i=0;i<11;i++){const a=i*2.4,r=.08+(i%3)*.065;part(group,new T.CylinderGeometry(.037,.037,.013,8),'#a84630',Math.sin(a)*r,.079,Math.cos(a)*r);}return group;}
