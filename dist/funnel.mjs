import * as T from './vendor/three.module.js';

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
 return {group,actor,legs,funnel,beer,hose,start:-Infinity,until:0,duration:6500,target:null,originals:[]};
}
export function cancelFunnelVisit(r){
 if(r.target){r.target.head.rotation.x=0;r.target.beerCup.visible=r.cupVisible;}
 for(const original of r.originals)original.avatar.visible=!original.away;
 r.originals=[];r.target=null;r.until=0;r.start=-Infinity;r.group.visible=false;
}
export function startFunnelVisit(r,time,people,{originals=[],random=Math.random,force=false}={}){
 if(time<r.until&&!force)return null;
 const eligible=people.filter(p=>!p.away&&p.characterId!=='carson');if(!eligible.length)return null;
 cancelFunnelVisit(r);r.target=eligible[Math.min(eligible.length-1,Math.floor(random()*eligible.length))];r.cupVisible=r.target.beerCup.visible;
 r.originals=originals.filter(p=>(p.characterId||p.avatar.userData.characterId)==='carson');
 r.start=time;r.until=time+r.duration;r.group.visible=true;
 const targetPosition=r.target.group.position.clone().setY(0),outward=targetPosition.clone().normalize();
 r.top=outward.multiplyScalar(1.72);r.top.y=1.71;
 r.actor.avatar.position.copy(r.top);
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
 // Appear in place on the tabletop for the whole routine; no entrance or exit.
 a.position.copy(r.top);a.lookAt(r.target.group.position.x,a.position.y,r.target.group.position.z);a.rotation.z=Math.sin(s*2)*.012;
 for(const leg of r.legs)leg.rotation.x=0;
 r.funnel.visible=r.hose.visible=true;
 const hold=new T.Vector3(.38,1.72,.4);a.localToWorld(hold);r.funnel.position.copy(hold);r.funnel.position.y+=.07;
 for(let i=0;i<2;i++){const hand=a.userData.hands[i],arm=a.userData.arms[i],side=i?1:-1;hand.position.set(side*.38,1.72,.4);limb(arm,new T.Vector3(side*.34,1.65,0),hand.position);}
 r.target.head.rotation.x=-.35;r.target.beerCup.visible=false;
  const mouth=new T.Vector3(0,-.1,.3);r.target.head.localToWorld(mouth);const end=r.group.worldToLocal(mouth);
  const start=r.funnel.position.clone();start.y-=.22;
  const sag=start.clone().lerp(end,.55);sag.y-=.3;
  const geometry=new T.TubeGeometry(new T.QuadraticBezierCurve3(start,sag,end),32,.045,8,false);r.hose.geometry.dispose();r.hose.geometry=geometry;
  r.beer.scale.setScalar(Math.max(.05,1-ease((s-.6)/4.8)));
 return true;
}
