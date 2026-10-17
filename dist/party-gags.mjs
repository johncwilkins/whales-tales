import * as T from './vendor/three.module.js';
const bright=new T.MeshBasicMaterial({color:'#f1e7ad'}),dark=new T.MeshBasicMaterial({color:'#292b20'}),green=new T.MeshBasicMaterial({color:'#a8b85d'});
function limb(parent,material,r=.045){const m=new T.Mesh(new T.CylinderGeometry(r,r,1,8),material);parent.add(m);return m;}
function connect(mesh,a,b){const delta=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.y=delta.length();if(delta.lengthSq()>0)mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());}
export function createVomitRig(parent,avatar){
 const group=new T.Group();group.name='Cartoon stick-figure break';group.visible=false;parent.add(group);
 const torso=new T.Group();group.add(torso);const head=new T.Mesh(new T.SphereGeometry(.18,14,10),bright);head.position.set(0,1,0);torso.add(head);
 for(const side of [-1,1]){const eye=new T.Mesh(new T.SphereGeometry(.026,6,4),dark);eye.position.set(side*.065,1.025,.158);torso.add(eye);}
 const spine=limb(torso,bright);connect(spine,new T.Vector3(0,0,0),new T.Vector3(0,.82,0));
 const arms=[];for(const side of [-1,1]){const upper=limb(torso,bright),fore=limb(torso,bright);connect(upper,new T.Vector3(0,.72,0),new T.Vector3(side*.32,.42,.06));connect(fore,new T.Vector3(side*.32,.42,.06),new T.Vector3(side*.3,.12,.17));arms.push(upper,fore);}
 const legs=Array.from({length:4},()=>limb(group,bright));const puddle=new T.Mesh(new T.CircleGeometry(.35,20),green);puddle.rotation.x=-Math.PI/2;puddle.position.set(0,.025,-.78);puddle.visible=false;group.add(puddle);
 const particles=Array.from({length:14},(_,i)=>{const p=new T.Mesh(new T.SphereGeometry(.027+(i%3)*.006,6,4),green);p.visible=false;group.add(p);return p;});
 const marker=new T.Mesh(new T.ConeGeometry(.16,.32,3),new T.MeshBasicMaterial({color:'#ffd66f'}));marker.rotation.z=Math.PI;marker.position.y=3.1;group.add(marker);
 return {group,avatar,torso,head,legs,puddle,particles,marker,start:0,until:0,duration:5800};
}
export function startVomit(rig,time){if(time<rig.until)return false;rig.start=time;rig.until=time+rig.duration;return true;}
export function updateVomit(r,time){
 const elapsed=time-r.start,active=time>=r.start&&time<r.until;r.group.visible=active;r.avatar.visible=!active;if(!active)return false;
 const stand=Math.min(1,elapsed/600),sit=Math.max(0,Math.min(1,(elapsed-4800)/1000)),rise=stand*(1-sit),bend=Math.max(0,Math.min(1,(elapsed-950)/500,(4600-elapsed)/600));
 r.group.position.z=-.78*rise;r.torso.position.set(0,1.02+rise*.4,0);r.torso.rotation.x=-bend*1.25;
 for(let j=0;j<2;j++){const side=j?1:-1,hip=new T.Vector3(side*.1,r.torso.position.y,0),knee=new T.Vector3(side*.16,.65,.34*(1-rise)),foot=new T.Vector3(side*.22,.1,.36*(1-rise));connect(r.legs[j*2],hip,knee);connect(r.legs[j*2+1],knee,foot);}
 r.marker.position.y=3+Math.sin(time/150)*.1;r.marker.rotation.y=time/550;
 const vomiting=elapsed>1600&&elapsed<4050;r.puddle.visible=elapsed>2050;r.puddle.scale.setScalar(Math.min(1,Math.max(.1,(elapsed-2050)/1800)));
 r.group.updateMatrixWorld(true);const mouth=r.torso.localToWorld(new T.Vector3(0,.94,.16));r.group.worldToLocal(mouth);
 for(const [i,p] of r.particles.entries()){p.visible=vomiting;if(vomiting){const u=(elapsed/660+i/14)%1;p.position.set(mouth.x+Math.sin(i*2.4)*u*.14,Math.max(.06,mouth.y-u*1.6),mouth.z-u*.65);}}
 return true;
}
export function createJointProp(){const g=new T.Group();g.name='Joint and ashtray';g.position.set(1.04,1.72,.13);const tray=new T.Mesh(new T.CylinderGeometry(.16,.16,.025,24),new T.MeshStandardMaterial({color:'#7c827c',metalness:.65,roughness:.35}));g.add(tray);const joint=new T.Mesh(new T.CylinderGeometry(.014,.01,.27,12),new T.MeshStandardMaterial({color:'#e4dec5'}));joint.rotation.z=1.35;joint.position.set(0,.035,0);joint.name='Rolled joint';g.add(joint);return g;}
