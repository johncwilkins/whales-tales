import * as T from './vendor/three.module.js';
const clamp=x=>Math.max(0,Math.min(1,x));
// Fine woven cloth detail shared across the costumes; no extra image downloads.
const weavePixels=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,v=225+Math.round(Math.sin(x*Math.PI/2)*5+Math.cos(y*Math.PI/2)*5+Math.sin(x*17+y*29)*3);weavePixels[i]=weavePixels[i+1]=weavePixels[i+2]=v;weavePixels[i+3]=255;}
const weave=new T.DataTexture(weavePixels,64,64);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(4,4);weave.needsUpdate=true;
const material=color=>new T.MeshStandardMaterial({color,roughness:.78});
const cloth=color=>new T.MeshStandardMaterial({color,map:weave,bumpMap:weave,bumpScale:.009,roughness:.86});
const skin=new T.MeshStandardMaterial({color:'#dcb08f',roughness:.56}),red=cloth('#b91f30'),green=cloth('#217851'),white=material('#fff2dc'),black=material('#242321'),gold=new T.MeshStandardMaterial({color:'#c8a450',roughness:.34,metalness:.64});
function shape(parent,geometry,mat,x=0,y=0,z=0){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function ball(p,r,m,x,y,z,sx=1,sy=1,sz=1){const o=shape(p,new T.SphereGeometry(r,16,12),m,x,y,z);o.scale.set(sx,sy,sz);return o;}
function box(p,w,h,d,m,x,y,z){return shape(p,new T.BoxGeometry(w,h,d),m,x,y,z);}
function limb(parent,x,y,length,mat,r=.09){const joint=new T.Group();joint.position.set(x,y,0);parent.add(joint);shape(joint,new T.CylinderGeometry(r,r*.85,length,10),mat,0,-length/2,0);return joint;}
function tailoredTorso(parent,elf,mat,x=0,y=0,z=0,extra=0){
 const profile=elf?[[.24,-.42],[.28,-.32],[.21,-.12],[.23,.13],[.3,.3],[.24,.4],[.13,.45]]:[[.27,-.43],[.39,-.32],[.46,-.09],[.43,.16],[.4,.32],[.31,.42],[.15,.46]];
 const o=shape(parent,new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r+extra,h)),28),mat,x,y,z);o.scale.z=elf?.74:.81;return o;
}
function humanArm(parent,x,y){
 const shoulder=limb(parent,x,y,.29,skin,.085),elbow=new T.Group();elbow.position.y=-.29;shoulder.add(elbow);ball(elbow,.077,skin,0,0,0);shape(elbow,new T.CylinderGeometry(.073,.05,.28,12),skin,0,-.14,0);
 const hand=new T.Group();hand.name='Sculpted hand with fingers';hand.position.set(0,-.31,0);elbow.add(hand);ball(hand,.065,skin,0,0,0,.75,1.1,.4);
 for(let i=0;i<4;i++){const finger=shape(hand,new T.CapsuleGeometry(.012,.065-(i===3?.012:0),3,6),skin,-.033+i*.022,-.065,.003);finger.rotation.z=(1.5-i)*.065;}
 const thumb=shape(hand,new T.CapsuleGeometry(.017,.042,3,6),skin,.055,-.015,.01);thumb.rotation.z=-.65;shoulder.userData.elbow=elbow;return shoulder;
}
function performer(elf=false){
 const root=new T.Group(),body=new T.Group();root.add(body);root.name=elf?'Adult elf dancer':'Santa dancer';
 const torso=tailoredTorso(body,elf,skin,0,1.15,0);torso.name="Shaped human torso";shape(body,new T.CylinderGeometry(.095,.12,.21,16),skin,0,1.7,0);
 const head=new T.Group();head.position.y=1.94;body.add(head);ball(head,.23,skin,0,0,0,.86,1.13,.92);ball(head,.13,skin,0,-.14,.055,.9,.55,1);
 const nose=ball(head,.045,skin,0,-.015,.212,.7,1.3,1.3);nose.name='Sculpted nose';
 const lid=material('#b78064'),iris=material(elf?'#57827a':'#65849b'),lip=material('#a96c61');
 for(const side of [-1,1]){ball(head,.047,skin,side*.194,-.01,0,.45,1.3,.7);ball(head,.047,lid,side*.077,.045,.188,1,.64,.5);ball(head,.035,white,side*.077,.047,.208,1,.56,.4);ball(head,.014,iris,side*.077,.047,.221);ball(head,.007,black,side*.077,.047,.232);ball(head,.004,white,side*.073,.052,.238);const brow=ball(head,.045,elf?gold:white,side*.078,.1,.2,1,.2,.35);brow.rotation.z=side*-.1;ball(head,.058,skin,side*.12,-.055,.178,1,.7,.45);}
 const smile=shape(head,new T.TorusGeometry(.069,.009,6,18,Math.PI),lip,0,-.108,.205);smile.rotation.z=Math.PI;
 if(!elf){
  for(let i=0;i<15;i++){const a=i*2.399,r=.025+Math.sqrt(i/15)*.15;ball(head,.057,white,Math.cos(a)*r,-.15+Math.sin(a)*r*.6,.13+Math.cos(a)*.025,1,.9,.85);}
  for(const side of [-1,1])ball(head,.075,white,side*.058,-.068,.218,1,.43,.55);
  for(let i=0;i<11;i++){const a=i/10*Math.PI;ball(head,.065,white,Math.cos(a)*.185,.04+Math.sin(a)*.16,-.07,1,1.1,.85);}
 }else{
  ball(head,.23,gold,0,.035,-.1,1,1.12,.85);
  for(const side of [-1,1])for(let i=0;i<4;i++)ball(head,.065,gold,side*(.16+i*.008),.08-i*.095,-.085,.8,1.4,.8);
  for(let i=0;i<5;i++){const lock=ball(head,.072,gold,-.12+i*.055,.16+Math.sin(i)*.018,.12,1,.5,.7);lock.rotation.z=-.3;}
 }
 const arms=[humanArm(body,-(elf?.3:.4),1.5),humanArm(body,elf?.3:.4,1.5)];
 const legs=[limb(body,-.17,.76,.66,skin,.105),limb(body,.17,.76,.66,skin,.105)];
 for(const leg of legs)ball(leg,.14,black,0,-.65,.065,.62,.46,1.25);
 // Swimwear stays on throughout the routine, under the removable costume.
 const swim=shape(body,new T.CylinderGeometry(elf?.29:.34,elf?.18:.2,.2,16),elf?red:green,0,.77,0);swim.name=elf?'Bikini bottom':'Speedo';
 if(elf){for(const x of [-.135,.135])ball(body,.145,red,x,1.35,.18,1,.85,.6);box(body,.54,.035,.035,red,0,1.29,.15);}
 const garments=[];
 function garment(name,group,at,kind){group.name=name;body.add(group);garments.push({group,at,kind,rest:group.position.clone()});return group;}
 const hat=new T.Group();hat.position.y=2.12;shape(hat,new T.ConeGeometry(.255,.48,16),elf?green:red,0,.21,0);shape(hat,new T.TorusGeometry(.23,.045,8,20),white).rotation.x=Math.PI/2;ball(hat,.07,white,0,.48,0);garment('Removable hat',hat,.7,'hat');
 const coat=new T.Group();coat.position.y=1.13;
 tailoredTorso(coat,elf,elf?green:red,0,.02,0,.027);
 box(coat,.08,.8,.055,white,0,0,elf?.255:.365);box(coat,elf?.65:.96,.08,elf?.5:.72,black,0,-.16,0);box(coat,.13,.1,.045,gold,0,-.16,elf?.27:.38);
 const sleeves=[];for(const x of [-1,1]){const sleeve=limb(coat,x*(elf?.3:.4),.37,.29,elf?green:red,.105);const lower=limb(sleeve,0,-.29,.27,elf?green:red,.093);shape(lower,new T.CylinderGeometry(.095,.095,.065,12),white,0,-.265,0);sleeves.push({sleeve,lower});}coat.userData.sleeves=sleeves;
 for(let i=0;i<3;i++)ball(coat,.022,gold,.08,.25-i*.12,elf?.21:.36);
 garment(elf?'Removable elf tunic':'Removable Santa coat',coat,2.1,'coat');
 const pants=new T.Group();pants.position.y=.74;
 for(const x of [-.17,.17])shape(pants,new T.CylinderGeometry(.14,.13,.62,10),elf?green:red,x,-.28,0);
 garment('Removable trousers',pants,3.5,'pants');
 return {root,body,torso,arms,legs,head,garments,elf};
}
function moveCDs(rig,aside){
 const cds=rig.cds;if(!cds)return;
 let stack=cds.userData.danceStack;
 if(!stack){stack=new T.Group();stack.name="Tubby's movable CD collection";for(const child of [...cds.children])if(child.name!=='Deck side bar')stack.add(child);cds.add(stack);cds.userData.danceStack=stack;}
 stack.position.set(aside?-1.9:0,0,aside?-.08:0);stack.scale.set(aside?.23:1,1,aside?.8:1);
}
export function placeSantaDance(rig,onCruiser=false,cds=null){
 moveCDs(rig,false);rig.cds=cds;rig.group.position.set(onCruiser?-4.1:-7.3,1.99,onCruiser?-3.9:-5.2);rig.group.scale.setScalar(onCruiser?.8:1);rig.deckBar.visible=onCruiser&&!cds;
}
export function createSantaDance(){const group=new T.Group();group.name='Santa back-left bar dance';group.visible=false;const santa=performer(),elf=performer(true);group.add(santa.root,elf.root);
 const deckBar=new T.Group();deckBar.name='Holiday deck bar';box(deckBar,3.6,.12,1.45,green,0,-.06,0);box(deckBar,3.4,2.3,1.25,white,0,-1.27,0);deckBar.visible=false;group.add(deckBar);
 const rig={group,santa,elf,deckBar,start:-Infinity,until:0,duration:7000,withElf:false,cds:null};placeSantaDance(rig);return rig;}
export function startSantaDance(rig,time,withElf=false){
 if(time<rig.until)return null;
 rig.start=time;rig.until=time+rig.duration;rig.withElf=withElf;rig.group.visible=true;rig.elf.root.visible=withElf;moveCDs(rig,true);updateSantaDance(rig,time);
 for(const p of [rig.santa,rig.elf])for(const g of p.garments){g.group.position.copy(g.rest);g.group.rotation.set(0,0,0);g.group.scale.setScalar(1);g.group.visible=true;}
 return {duration:rig.duration,withElf};
}
export function cancelSantaDance(rig){rig.until=0;rig.group.visible=false;moveCDs(rig,false);}
export function updateSantaDance(rig,time){
 if(time<rig.start||time>=rig.until){rig.group.visible=false;moveCDs(rig,false);return false;}
 rig.group.visible=true;const t=(time-rig.start)/1000;
 for(const p of [rig.santa,rig.elf]){
  if(p.elf&&!rig.withElf)continue;
  const phase=t+(p.elf?.7:0),offset=rig.withElf?(p.elf?.64:-.64):0;
  // Appear already on the bar: no approach, climb, or departure animation.
  p.root.position.set(offset,.045,0);p.root.rotation.y=Math.sin(phase*1.4)*.3;
  p.body.position.y=.02+Math.sin(phase*4)*.02;p.body.position.x=Math.sin(phase*2)*.055;
  p.body.rotation.z=Math.sin(phase*2)*.045;p.body.rotation.y=Math.sin(phase*2+.3)*.09;p.head.rotation.z=Math.sin(phase*2+.8)*.06;
  for(let i=0;i<2;i++){p.arms[i].rotation.z=(i?1:-1)*(.48+Math.sin(phase*2.5+i)*.38);p.arms[i].rotation.x=Math.sin(phase*2+i)*.3;p.arms[i].userData.elbow.rotation.x=-.5-Math.sin(phase*2.5+i)*.3;p.legs[i].rotation.x=Math.sin(phase*2+i*Math.PI)*.12;}
  for(const g of p.garments){
   const u=t-g.at;g.group.position.copy(g.rest);g.group.rotation.set(0,0,0);g.group.scale.setScalar(1);
   if(u<0)continue;
   // The hands reach to the garment, pull it away, then fling it onto the bar.
   if(u<.85){const pull=clamp(u/.85);for(let i=0;i<2;i++){p.arms[i].rotation.z=(i?1:-1)*.3;p.arms[i].rotation.x=g.kind==='hat'?-2.7:g.kind==='coat'?-1.25:.35;}
    g.group.position.y+=g.kind==='pants'?-pull*.62:pull*.45;g.group.position.z+=pull*.38;g.group.scale.x=1+pull*.18;
   }else{const flight=u-.85,side=p.elf?-1:1;g.group.position.x=side*Math.min(flight*2.7,2.1);g.group.position.z=.4+Math.min(flight*1.1,1.2);g.group.position.y=g.rest.y+.45+flight*1.7-flight*flight*3;g.group.rotation.set(flight*5,flight*3,side*flight*4);if(g.group.position.y<.06){g.group.position.y=.06;g.group.rotation.set(Math.PI/2,0,side*.8);g.group.scale.set(1,.18,1);}}
  }
  const coat=p.garments.find(g=>g.kind==='coat').group;for(const [i,r] of coat.userData.sleeves.entries()){r.sleeve.rotation.copy(p.arms[i].rotation);r.lower.rotation.copy(p.arms[i].userData.elbow.rotation);}
 }
 return true;
}
