import * as T from './vendor/three.module.js';
const clamp=x=>Math.max(0,Math.min(1,x));
const material=color=>new T.MeshStandardMaterial({color,roughness:.85});
const skin=material('#e5b18c'),red=material('#b91f30'),green=material('#217851'),white=material('#fff2dc'),black=material('#242321'),gold=material('#e5bd48');
function shape(parent,geometry,mat,x=0,y=0,z=0){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function ball(p,r,m,x,y,z,sx=1,sy=1,sz=1){const o=shape(p,new T.SphereGeometry(r,16,12),m,x,y,z);o.scale.set(sx,sy,sz);return o;}
function box(p,w,h,d,m,x,y,z){return shape(p,new T.BoxGeometry(w,h,d),m,x,y,z);}
function limb(parent,x,y,length,mat,r=.09){const joint=new T.Group();joint.position.set(x,y,0);parent.add(joint);shape(joint,new T.CylinderGeometry(r,r*.85,length,10),mat,0,-length/2,0);return joint;}
function performer(elf=false){
 const root=new T.Group(),body=new T.Group();root.add(body);root.name=elf?'Adult elf dancer':'Santa dancer';
 const torso=ball(body,1,skin,0,1.12,0,elf?.29:.46,elf?.44:.48,elf?.21:.33);
 const head=new T.Group();head.position.y=1.93;body.add(head);ball(head,.24,skin,0,0,0);ball(head,.065,skin,0,-.015,.23);
 for(const x of [-.085,.085])ball(head,.018,black,x,.045,.217);
 if(!elf){ball(head,.24,white,0,-.16,.12,1,.9,.65);ball(head,.2,white,0,.085,-.09,1.2,.8,1);}
 else {ball(head,.26,gold,0,.035,-.08,1,.95,.85);for(const x of [-.25,.25])ball(head,.075,skin,x,0,0,.7,1.5,.7);}
 const arms=[limb(body,-(elf?.3:.47),1.48,.58,skin),limb(body,elf?.3:.47,1.48,.58,skin)];
 for(const arm of arms)ball(arm,.095,skin,0,-.6,0);
 const legs=[limb(body,-.17,.76,.66,skin,.105),limb(body,.17,.76,.66,skin,.105)];
 for(const leg of legs)box(leg,.19,.12,.33,black,0,-.67,.07);
 // Swimwear stays on throughout the routine, under the removable costume.
 const swim=shape(body,new T.CylinderGeometry(elf?.29:.34,elf?.18:.2,.2,16),elf?red:green,0,.77,0);swim.name=elf?'Bikini bottom':'Speedo';
 if(elf){for(const x of [-.135,.135])ball(body,.145,red,x,1.35,.18,1,.85,.6);box(body,.54,.035,.035,red,0,1.29,.15);}
 const garments=[];
 function garment(name,group,at,kind){group.name=name;body.add(group);garments.push({group,at,kind,rest:group.position.clone()});return group;}
 const hat=new T.Group();hat.position.y=2.12;shape(hat,new T.ConeGeometry(.255,.48,16),elf?green:red,0,.21,0);shape(hat,new T.TorusGeometry(.23,.045,8,20),white).rotation.x=Math.PI/2;ball(hat,.07,white,0,.48,0);garment('Removable hat',hat,3.2,'hat');
 const coat=new T.Group();coat.position.y=1.13;
 ball(coat,1,elf?green:red,0,0,0,elf?.32:.49,elf?.47:.5,elf?.25:.36);
 box(coat,.08,.8,.055,white,0,0,elf?.255:.365);box(coat,elf?.65:.96,.08,elf?.5:.72,black,0,-.16,0);box(coat,.13,.1,.045,gold,0,-.16,elf?.27:.38);
 for(const x of [-1,1]){const sleeve=limb(coat,x*(elf?.3:.47),.35,.57,elf?green:red,.125);sleeve.rotation.z=x*.25;}
 garment(elf?'Removable elf tunic':'Removable Santa coat',coat,5.8,'coat');
 const pants=new T.Group();pants.position.y=.74;
 for(const x of [-.17,.17])shape(pants,new T.CylinderGeometry(.14,.13,.62,10),elf?green:red,x,-.28,0);
 garment('Removable trousers',pants,9,'pants');
 return {root,body,torso,arms,legs,head,garments,elf};
}
export function createSantaDance(){const group=new T.Group();group.name='Santa table dance';group.visible=false;const santa=performer(),elf=performer(true);group.add(santa.root,elf.root);return {group,santa,elf,start:-Infinity,until:0,duration:17000,withElf:false};}
export function startSantaDance(rig,time,withElf=false){
 if(time<rig.until)return null;
 rig.start=time;rig.until=time+rig.duration;rig.withElf=withElf;rig.group.visible=true;rig.elf.root.visible=withElf;
 for(const p of [rig.santa,rig.elf])for(const g of p.garments){g.group.position.copy(g.rest);g.group.rotation.set(0,0,0);g.group.scale.setScalar(1);g.group.visible=true;}
 return {duration:rig.duration,withElf};
}
export function cancelSantaDance(rig){rig.until=0;rig.group.visible=false;}
export function updateSantaDance(rig,time){
 if(time<rig.start||time>=rig.until){rig.group.visible=false;return false;}
 rig.group.visible=true;const t=(time-rig.start)/1000;
 for(const p of [rig.santa,rig.elf]){
  if(p.elf&&!rig.withElf)continue;
  const phase=t+(p.elf?.7:0),entry=clamp(t/2.3),exit=clamp((t-15)/2),offset=rig.withElf?(p.elf?.68:-.68):0;
  // Approach from the far edge, step onto the 1.7m tabletop, then dance.
  p.root.position.set(offset,entry*1.74-exit*1.74,(-3.3+entry*3.3)*(1-exit)+exit*3.5);
  p.root.rotation.y=Math.sin(phase*1.4)*.3+exit*Math.PI;
  p.body.position.y=t<2.3?Math.abs(Math.sin(t*7))*.15:Math.abs(Math.sin(phase*5))*.09;
  p.body.rotation.z=Math.sin(phase*4)*.09;p.head.rotation.z=Math.sin(phase*5)*.1;
  for(let i=0;i<2;i++){p.arms[i].rotation.z=(i?1:-1)*(.75+Math.sin(phase*5+i)*.65);p.arms[i].rotation.x=Math.sin(phase*3+i)*.45;p.legs[i].rotation.x=Math.sin(phase*5+i*Math.PI)*.3;}
  for(const g of p.garments){
   const u=t-g.at;g.group.position.copy(g.rest);g.group.rotation.set(0,0,0);g.group.scale.setScalar(1);
   if(u<0)continue;
   // The hands reach to the garment, pull it away, then fling it across the table.
   if(u<.85){const pull=clamp(u/.85);for(let i=0;i<2;i++){p.arms[i].rotation.z=(i?1:-1)*.3;p.arms[i].rotation.x=g.kind==='hat'?-2.7:g.kind==='coat'?-1.25:.35;}
    g.group.position.y+=g.kind==='pants'?-pull*.62:pull*.45;g.group.position.z+=pull*.38;g.group.scale.x=1+pull*.18;
   }else{const flight=u-.85,side=p.elf?-1:1;g.group.position.x=side*Math.min(flight*2.7,2.1);g.group.position.z=.4+Math.min(flight*1.1,1.2);g.group.position.y=g.rest.y+.45+flight*1.7-flight*flight*3;g.group.rotation.set(flight*5,flight*3,side*flight*4);if(g.group.position.y<.06){g.group.position.y=.06;g.group.rotation.set(Math.PI/2,0,side*.8);g.group.scale.set(1,.18,1);}}
  }
 }
 return true;
}
