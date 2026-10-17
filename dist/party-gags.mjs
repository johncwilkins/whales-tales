import * as T from './vendor/three.module.js';
const bright=new T.MeshBasicMaterial({color:'#101110'}),dark=new T.MeshBasicMaterial({color:'#f4eee0'}),green=new T.MeshBasicMaterial({color:'#a8b85d'});
function limb(parent,material,r=.045){const m=new T.Mesh(new T.CylinderGeometry(r,r,1,8),material);parent.add(m);return m;}
function connect(mesh,a,b){const delta=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.y=delta.length();if(delta.lengthSq()>0)mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());}
export function createVomitRig(parent,avatar){
 const group=new T.Group();group.name='Cartoon stick-figure break';group.visible=false;parent.add(group);
 const torso=new T.Group();group.add(torso);const head=new T.Mesh(new T.SphereGeometry(.18,14,10),bright);head.position.set(0,1,0);torso.add(head);
 for(const side of [-1,1]){const eye=new T.Mesh(new T.SphereGeometry(.026,6,4),dark);eye.position.set(side*.065,1.025,.158);torso.add(eye);}
 const mouth=new T.Mesh(new T.TorusGeometry(.032,.009,6,14),dark);mouth.position.set(0,.935,.176);mouth.name='Front of face';torso.add(mouth);
 const spine=limb(torso,bright);connect(spine,new T.Vector3(0,0,0),new T.Vector3(0,.82,0));
 const arms=[];for(const side of [-1,1]){const upper=limb(torso,bright),fore=limb(torso,bright);connect(upper,new T.Vector3(0,.72,0),new T.Vector3(side*.32,.42,.06));connect(fore,new T.Vector3(side*.32,.42,.06),new T.Vector3(side*.3,.12,.17));arms.push(upper,fore);}
 const legs=Array.from({length:4},()=>limb(group,bright));const puddle=new T.Mesh(new T.CircleGeometry(.35,20),green);puddle.rotation.x=-Math.PI/2;puddle.position.set(0,.025,-.78);puddle.visible=false;group.add(puddle);
 const particles=Array.from({length:14},(_,i)=>{const p=new T.Mesh(new T.SphereGeometry(.027+(i%3)*.006,6,4),green);p.visible=false;group.add(p);return p;});
 const marker=new T.Mesh(new T.ConeGeometry(.16,.32,3),new T.MeshBasicMaterial({color:'#ffd66f'}));marker.rotation.z=Math.PI;marker.position.y=3.1;group.add(marker);
 return {group,avatar,torso,head,mouth,legs,puddle,particles,marker,start:0,until:0,duration:5800};
}
export function startVomit(rig,time){if(time<rig.until)return false;rig.start=time;rig.until=time+rig.duration;return true;}
export function updateVomit(r,time){
 const elapsed=time-r.start,active=time>=r.start&&time<r.until;r.group.visible=active;r.avatar.visible=!active;if(!active)return false;
 const stand=Math.min(1,elapsed/600),sit=Math.max(0,Math.min(1,(elapsed-4800)/1000)),rise=stand*(1-sit),bend=Math.max(0,Math.min(1,(elapsed-950)/500,(4600-elapsed)/600));
 r.group.position.z=-.78*rise;r.torso.position.set(0,1.02+rise*.4,0);r.group.rotation.y=Math.PI*Math.max(0,Math.min(1,(elapsed-250)/550))*(1-sit);r.torso.rotation.x=bend*1.25;
 for(let j=0;j<2;j++){const side=j?1:-1,hip=new T.Vector3(side*.1,r.torso.position.y,0),knee=new T.Vector3(side*.16,.65,.34*(1-rise)),foot=new T.Vector3(side*.22,.1,.36*(1-rise));connect(r.legs[j*2],hip,knee);connect(r.legs[j*2+1],knee,foot);}
 r.marker.position.y=3+Math.sin(time/150)*.1;r.marker.rotation.y=time/550;
 const vomiting=elapsed>1600&&elapsed<4050;r.puddle.visible=elapsed>2050;r.puddle.scale.setScalar(Math.min(1,Math.max(.1,(elapsed-2050)/1800)));
 r.group.updateMatrixWorld(true);const mouth=r.mouth.localToWorld(new T.Vector3());r.group.worldToLocal(mouth);const forward=new T.Vector3(0,0,1).applyQuaternion(r.torso.quaternion);r.puddle.position.set(mouth.x+forward.x*.65,.025,mouth.z+forward.z*.65);
 for(const [i,p] of r.particles.entries()){p.visible=vomiting;if(vomiting){const u=(elapsed/660+i/14)%1;p.position.copy(mouth).addScaledVector(forward,u*.65);p.position.x+=Math.sin(i*2.4)*u*.1;p.position.y=Math.max(.04,p.position.y-u*u*1.5);}}
 return true;
}
export function createJointProp(){const g=new T.Group();g.name='Joint and ashtray';g.position.set(1.04,1.72,.13);const tray=new T.Mesh(new T.CylinderGeometry(.16,.16,.025,24),new T.MeshStandardMaterial({color:'#7c827c',metalness:.65,roughness:.35}));g.add(tray);const joint=new T.Mesh(new T.CylinderGeometry(.014,.01,.27,12),new T.MeshStandardMaterial({color:'#e4dec5'}));joint.rotation.z=1.35;joint.position.set(0,.035,0);joint.name='Rolled joint';g.add(joint);return g;}

export function createDanceRig(parent,avatar,seed=0){
 const r=createVomitRig(parent,avatar);r.group.name='Smiley abstract stick-figure dance';
 r.mouth.geometry.dispose();r.mouth.geometry=new T.TorusGeometry(.075,.012,6,20,Math.PI);r.mouth.rotation.z=Math.PI;r.mouth.position.y=.98;
 r.marker.visible=false;r.seed=seed;r.danceUntil=0;r.danceStart=0;r.arms=r.torso.children.filter(o=>o.geometry?.type==='CylinderGeometry').slice(1);return r;
}
export function startDance(r,time){r.danceStart=time;r.danceUntil=time+5000;}
export function updateDance(r,time){
 const active=time>=r.danceStart&&time<r.danceUntil;r.group.visible=active;if(!active)return false;
 r.avatar.visible=false;const t=(time-r.danceStart)/1000,s=r.seed,beat=t*8+s;
 r.group.position.copy(r.avatar.position);r.group.position.y+=Math.abs(Math.sin(beat))*.3;r.group.rotation.set(0,r.avatar.rotation.y+Math.sin(t*3+s)*.7,Math.sin(beat)*.14);
 r.torso.position.set(0,1.15,0);r.torso.rotation.set(Math.sin(beat*.7)*.3,Math.sin(beat*.5)*.4,Math.cos(beat)*.35);
 r.head.scale.set(1+Math.sin(beat)*.12,1-Math.sin(beat)*.12,1);
 for(let j=0;j<2;j++){
  const side=j?1:-1,shoulder=new T.Vector3(0,.72,0),elbow=new T.Vector3(side*(.32+Math.sin(beat+j)*.12),.75+Math.cos(beat+j*2)*.38,.1),hand=new T.Vector3(side*(.5+Math.cos(beat)*.18),.8+Math.sin(beat+j*2)*.65,.18+Math.cos(beat)*.25);
  connect(r.arms[j*2],shoulder,elbow);connect(r.arms[j*2+1],elbow,hand);
  const hip=new T.Vector3(side*.1,1.15,0),knee=new T.Vector3(side*(.25+Math.sin(beat+j)*.15),.6,.1+Math.cos(beat+j)*.22),foot=new T.Vector3(side*(.35+Math.cos(beat+j)*.18),.1+Math.max(0,Math.sin(beat+j*3))*.32,.15);
  connect(r.legs[j*2],hip,knee);connect(r.legs[j*2+1],knee,foot);
 }
 return true;
}

export function attachBackgroundSmoke(avatar){
 const hand=avatar.userData.hands[1],arm=avatar.userData.arms[1];
 const joint=new T.Mesh(new T.CylinderGeometry(.017,.013,.22,8),new T.MeshStandardMaterial({color:'#eee6c8'}));joint.rotation.x=Math.PI/2;hand.add(joint);joint.position.set(0,0,.11);joint.name='Background smoker doobie';
 const ember=new T.Mesh(new T.SphereGeometry(.019,6,4),new T.MeshBasicMaterial({color:'#ed8548'}));ember.position.set(0,0,.225);hand.add(ember);
 const smoke=new T.Group();smoke.name='Drifting doobie smoke';avatar.add(smoke);
 const puffs=Array.from({length:10},(_,i)=>{const p=new T.Mesh(new T.SphereGeometry(.045,7,5),new T.MeshBasicMaterial({color:'#c8d2c6',transparent:true,opacity:0,depthWrite:false}));smoke.add(p);return p;});
 return {avatar,hand,arm,joint,ember,puffs,handRest:hand.position.clone(),armRest:arm.rotation.clone()};
}
export function updateBackgroundSmoke(r,time){
 const t=time/1000,drag=Math.pow(Math.max(0,Math.sin(t*.8)),2);
 r.hand.position.copy(r.handRest).lerp(new T.Vector3(.16,1.91,.48),drag);r.arm.rotation.copy(r.armRest);r.arm.rotation.x-=drag*.7;r.ember.scale.setScalar(.7+drag*.7);
 r.avatar.updateMatrixWorld(true);const origin=r.avatar.worldToLocal(r.joint.localToWorld(new T.Vector3(0,.11,0)));
 for(const [i,p] of r.puffs.entries()){const u=(t*.35+i/r.puffs.length)%1;p.position.copy(origin);p.position.x+=Math.sin(t+i)*u*.18;p.position.y+=u*1.35;p.position.z+=u*.15;p.scale.setScalar(.4+u*3);p.material.opacity=(1-u)*.3;}
}
