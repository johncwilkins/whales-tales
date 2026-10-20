import * as T from './vendor/three.module.js';

function along(points,u){const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i])),total=lengths.reduce((a,b)=>a+b,0);let d=Math.max(0,Math.min(1,u))*total;for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1)return points[i].clone().lerp(points[i+1],d/lengths[i]);d-=lengths[i];}return points[0].clone();}
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
function limb(mesh,a,b){mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());mesh.scale.y=a.distanceTo(b)/.58;}
export function createFunnelVisit(actor){
 const group=new T.Group();group.name='Carson beer funnel visit';group.visible=false;group.add(actor.avatar);
 const legs=[];for(const o of actor.avatar.children)if(o.isMesh&&o.position.y<.98)o.visible=false;
 for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.2,.98,0);actor.avatar.add(leg);const trouser=new T.Mesh(new T.CapsuleGeometry(.11,.69,3,10),new T.MeshStandardMaterial({color:'#344253'}));trouser.position.y=-.44;leg.add(trouser);const shoe=new T.Mesh(new T.BoxGeometry(.23,.12,.36),new T.MeshStandardMaterial({color:'#222422'}));shoe.position.set(0,-.87,.08);leg.add(shoe);legs.push(leg);}
 const funnel=new T.Group();funnel.name='Orange beer funnel and clear hose';group.add(funnel);
 const bowl=new T.Mesh(new T.CylinderGeometry(.35,.065,.42,24,1,true),new T.MeshStandardMaterial({color:'#f28b20',side:T.DoubleSide,roughness:.4}));funnel.add(bowl);
 const beer=new T.Mesh(new T.CircleGeometry(.3,24),new T.MeshStandardMaterial({color:'#dcab35',side:T.DoubleSide}));beer.rotation.x=-Math.PI/2;beer.position.y=.15;funnel.add(beer);
 const hose=new T.Mesh(new T.TubeGeometry(new T.LineCurve3(new T.Vector3(),new T.Vector3(0,1,0)),32,.045,8,false),new T.MeshStandardMaterial({color:'#e4c98b',transparent:true,opacity:.8,roughness:.3}));hose.name='Hose from funnel to mouth';group.add(hose);
 return {group,actor,legs,funnel,beer,hose,start:-Infinity,until:0,duration:15000,target:null,originals:[],doors:null,onCruiser:false};
}
function setDoor(r,amount){const door=r.onCruiser?r.cabinDoor:r.doors?.doors[0];if(!door)return;if(door.leaves){door.open=amount;for(const leaf of door.leaves)leaf.hinge.rotation.y=-leaf.hingeSide*amount*Math.PI*.49;}else door.rotation.y=-amount*Math.PI*.55;}
export function cancelFunnelVisit(r){
 if(r.target){r.target.head.rotation.x=0;r.target.beerCup.visible=r.cupVisible;}
 for(const original of r.originals)original.avatar.visible=!original.away;
 r.originals=[];r.target=null;r.until=0;r.start=-Infinity;r.group.visible=false;setDoor(r,0);
}
export function startFunnelVisit(r,time,people,{doors,cabinDoor,onCruiser=false,originals=[],random=Math.random,force=false}={}){
 if(time<r.until&&!force)return null;
 const eligible=people.filter(p=>!p.away&&p.characterId!=='carson');if(!eligible.length)return null;
 cancelFunnelVisit(r);r.target=eligible[Math.min(eligible.length-1,Math.floor(random()*eligible.length))];r.cupVisible=r.target.beerCup.visible;
 r.originals=originals.filter(p=>(p.characterId||p.avatar.userData.characterId)==='carson');r.doors=doors;r.cabinDoor=cabinDoor;r.onCruiser=onCruiser;
 r.start=time;r.until=time+r.duration;r.group.visible=true;
 const targetPosition=r.target.group.position.clone().setY(0),outward=targetPosition.clone().normalize();
 r.edge=outward.clone().multiplyScalar(2.15);r.top=outward.clone().multiplyScalar(1.72);r.top.y=1.71;
 r.floor=outward.clone().multiplyScalar(4.3);r.approach=new T.Vector3(-4.7,0,-3.6);
 r.entry=onCruiser?new T.Vector3(1.9,0,-5.1):new T.Vector3(-13.2,0,-6.3);
 r.path=onCruiser?[r.entry,new T.Vector3(1.9,0,-3.9),r.approach]:[r.entry,new T.Vector3(-10.95,0,-6.3),new T.Vector3(-10.95,0,-3.3),r.approach];
 const startAngle=Math.atan2(r.approach.x,r.approach.z),endAngle=Math.atan2(r.floor.x,r.floor.z);let delta=endAngle-startAngle;while(delta>Math.PI)delta-=2*Math.PI;while(delta< -Math.PI)delta+=2*Math.PI;r.around=[r.approach];for(let k=1;k<=16;k++){const angle=startAngle+delta*k/16;r.around.push(new T.Vector3(Math.sin(angle)*4.9,0,Math.cos(angle)*4.9));}r.around.push(r.floor);
 updateFunnelVisit(r,time);return {duration:r.duration,target:r.target.name};
}
export function updateFunnelVisit(r,time){
 if(!r.target)return false;
 if(time>=r.until){cancelFunnelVisit(r);return false;}
 // requestAnimationFrame timestamps can precede the key event in the same frame.
 time=Math.max(time,r.start);
 if(r.target.away){cancelFunnelVisit(r);return false;}
 const s=(time-r.start)/1000,a=r.actor.avatar;
 r.group.visible=true;for(const original of r.originals)original.avatar.visible=false;
 let from,to,u,walking=true;
 if(s<3){from=r.entry;to=r.approach;u=s/3;}
 else if(s<4.8){from=r.approach;to=r.floor;u=(s-3)/1.8;}
 else if(s<6.2){from=r.floor;to=r.top;u=(s-4.8)/1.4;}
 else if(s<10){from=r.top;to=r.top;u=0;walking=false;}
 else if(s<11.4){from=r.top;to=r.floor;u=(s-10)/1.4;}
 else if(s<12.4){from=r.floor;to=r.approach;u=s-11.4;}
 else{from=r.approach;to=r.entry;u=(s-12.4)/2.6;}
 a.position.lerpVectors(from,to,ease(u));
 if(s<3)a.position.copy(along(r.path,ease(s/3)));else if(s<4.8)a.position.copy(along(r.around,ease((s-3)/1.8)));else if(s>=11.4&&s<12.4)a.position.copy(along(r.around,1-ease(s-11.4)));else if(s>=12.4)a.position.copy(along(r.path,1-ease((s-12.4)/2.6)));
 if(walking){a.lookAt(to.x,a.position.y,to.z);a.position.y+=Math.abs(Math.sin(s*5))*.025;a.rotation.z=Math.sin(s*5)*.06+.035;}
 else{a.lookAt(r.target.group.position.x,a.position.y,r.target.group.position.z);a.rotation.z=0;}
 for(const [i,leg] of r.legs.entries())leg.rotation.x=walking?Math.sin(s*5+i*Math.PI)*(i?.13:.4):0;
 const handling=s>=5.8&&s<10.4;r.funnel.visible=r.hose.visible=handling;
 const hold=new T.Vector3(.38,1.72,.4);a.localToWorld(hold);r.funnel.position.copy(hold);r.funnel.position.y+=.07;
 for(let i=0;i<2;i++){const hand=a.userData.hands[i],arm=a.userData.arms[i],side=i?1:-1;hand.position.set(side*.38,handling?1.72:1.06,handling?.4:.06);limb(arm,new T.Vector3(side*.34,1.65,0),hand.position);}
 if(handling){r.target.head.rotation.x=-.35;r.target.beerCup.visible=false;
  const mouth=new T.Vector3(0,-.1,.3);r.target.head.localToWorld(mouth);const end=r.group.worldToLocal(mouth);
  const start=r.funnel.position.clone();start.y-=.22;
  const sag=start.clone().lerp(end,.55);sag.y-=.3;
  const geometry=new T.TubeGeometry(new T.QuadraticBezierCurve3(start,sag,end),32,.045,8,false);r.hose.geometry.dispose();r.hose.geometry=geometry;
  r.beer.scale.setScalar(Math.max(.05,1-ease((s-6.2)/3.6)));
 }else{r.target.beerCup.visible=r.cupVisible;r.beer.scale.setScalar(1);}
 setDoor(r,ease((s-.1)/.5)*(1-ease((s-1.6)/.5))+ease((s-13.2)/.5)*(1-ease((s-14.7)/.3)));
 return true;
}
