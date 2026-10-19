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
export const AIR_TED_MESSAGES=Object.freeze([
 'Bag Chew',
 'Mosquito Grill - draughts 50% off tonight',
 'Seafood Newburgh',
 'Send Me',
 'Christmas Party this Sunday',
 'Barto pin keg this Friday',
 'CHT Kamakazis 50 cents off tonight',
 "Is Les coming over?",
 "Rooks’ ribs — follow the smoke",
 'Golden chair reserved',
 'Cold beer. Questionable company.',
 'Last call? Nice try.',
 'Tubby: requests are not being taken'
]);
export function chooseAirTedMessage(previous=-1,random=Math.random){
 const eligible=AIR_TED_MESSAGES.map((_,i)=>i).filter(i=>i!==previous);
 const index=eligible[Math.min(eligible.length-1,Math.max(0,Math.floor(random()*eligible.length)))];
 return {index,text:AIR_TED_MESSAGES[index]};
}
function paintAirTedBanner(r,message){
 const ctx=r.bannerCanvas.getContext('2d'),w=r.bannerCanvas.width,h=r.bannerCanvas.height;
 ctx.fillStyle='#fff2c8';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#b32a2e';ctx.lineWidth=10;ctx.strokeRect(12,12,w-24,h-24);
 ctx.fillStyle='#a3282d';ctx.textAlign='center';ctx.textBaseline='middle';
 const lines=message==='Mosquito Grill - draughts 50% off tonight'?['Mosquito Grill','draughts 50% off tonight']:message==='CHT Kamakazis 50 cents off tonight'?['CHT Kamakazis','50 cents off tonight']:message.length>30?[message.split(' ').slice(0,3).join(' '),message.split(' ').slice(3).join(' ')]:[message];
 ctx.font='bold '+(lines.length===1?136:92)+'px sans-serif';for(const [i,line] of lines.entries())ctx.fillText(line,w/2,h/2+(i-(lines.length-1)/2)*106,w-90);
 r.banner.material.map.needsUpdate=true;r.message=message;r.banner.userData.message=message;
}
function airTedLivery(group){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,256);ctx.font='italic bold 190px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=10;ctx.strokeStyle='#fff7e4';ctx.strokeText('Air Ted',512,138);ctx.fillStyle='#9d2228';ctx.fillText('Air Ted',512,138);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const labels=[];for(const side of [-1,1]){
  const geometry=new T.PlaneGeometry(1.55,.2,20,4),vertices=geometry.attributes.position,uv=geometry.attributes.uv;
  // Conform the lettering to the curved fuselage, with correct reading order on each side.
  for(let i=0;i<vertices.count;i++){const x=vertices.getX(i)-.15,y=vertices.getY(i)-.03,profile=[[-1.2,.23],[-.75,.28],[-.2,.27],[.4,.2],[1.12,.095]],j=profile.findIndex(([end])=>end>=x),[x0,r0]=profile[Math.max(0,j-1)],[x1,r1]=profile[Math.max(1,j)],radius=r0+(r1-r0)*(x-x0)/(x1-x0);vertices.setXYZ(i,x,y,side*(Math.sqrt(Math.max(.003,radius*radius-y*y))+.006));if(side<0)uv.setX(i,1-uv.getX(i));}
  geometry.computeVertexNormals();const label=part(group,geometry,new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));label.name='Air Ted fuselage lettering '+(side>0?'starboard':'port');labels.push(label);
 }
 return labels;
}
export function createAirTed(){const group=new T.Group();group.name='Air Ted flyby';group.visible=false;
 const enamel=new T.MeshStandardMaterial({color:'#e9e4da',roughness:.32,metalness:.35});
 const crimson=new T.MeshStandardMaterial({color:'#a82c2a',roughness:.3,metalness:.3});
 const aluminum=new T.MeshStandardMaterial({color:'#9ca6aa',roughness:.28,metalness:.85});
 const glass=new T.MeshPhysicalMaterial({color:'#304f60',roughness:.12,metalness:.35,clearcoat:1,transparent:true,opacity:.88});
 const fuselage=part(group,new T.LatheGeometry([new T.Vector2(0,-1.54),new T.Vector2(.14,-1.47),new T.Vector2(.23,-1.2),new T.Vector2(.28,-.75),new T.Vector2(.27,-.2),new T.Vector2(.2,.4),new T.Vector2(.095,1.12),new T.Vector2(.04,1.48),new T.Vector2(0,1.54)],28),enamel);fuselage.rotation.z=-Math.PI/2;fuselage.name='Tapered painted aluminum fuselage';
 const cockpit=part(group,new T.SphereGeometry(1,24,12),glass,-.38,.22,0);cockpit.scale.set(.51,.25,.23);cockpit.name='Glazed cockpit canopy';
 for(const x of [-.73,-.16]){const frame=part(group,new T.TorusGeometry(.23,.012,6,24),aluminum,x,.22,0);frame.rotation.y=Math.PI/2;frame.scale.y=1.1;}
 // Beveled, tapered wings catch the room light rather than reading as flat blocks.
 function airfoil(name,span,chord,x,y,material){const outline=new T.Shape();outline.moveTo(-chord*.5,0);outline.lineTo(-chord*.4,span*.46);outline.quadraticCurveTo(-chord*.34,span*.51,chord*.03,span*.5);outline.lineTo(chord*.45,span*.45);outline.lineTo(chord*.5,0);outline.lineTo(chord*.45,-span*.45);outline.quadraticCurveTo(chord*.03,-span*.53,-chord*.4,-span*.46);outline.closePath();const wing=part(group,new T.ExtrudeGeometry(outline,{depth:.035,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.012}),material,x,y,0);wing.rotation.x=Math.PI/2;wing.name=name;return wing;}
 airfoil('Main tapered wing',4.15,.92,-.2,.12,crimson);airfoil('Tail stabilizer',1.42,.55,1.14,.08,enamel);
 const finShape=new T.Shape();finShape.moveTo(.7,.05);finShape.lineTo(1.17,.69);finShape.quadraticCurveTo(1.38,.76,1.42,.1);finShape.closePath();part(group,new T.ExtrudeGeometry(finShape,{depth:.035,bevelEnabled:true,bevelSize:.015,bevelThickness:.01,bevelSegments:2,steps:1}),crimson,0,0,-.018).name='Swept vertical tail';
 for(const side of [-1,1]){box(group,.85,.018,.032,enamel,-.17,.145,side*1.82);box(group,.42,.012,.025,aluminum,.11,.145,side*1.12);const strut=box(group,.035,.52,.035,aluminum,-.55,-.34,side*.36);strut.rotation.x=side*-.45;const tire=part(group,new T.TorusGeometry(.115,.045,8,20),'#202326',-.55,-.6,side*.48);tire.name='Rubber landing tire';part(group,new T.CylinderGeometry(.065,.065,.11,12),aluminum,-.55,-.6,side*.48).rotation.x=Math.PI/2;}
 const prop=new T.Group();prop.position.x=-1.6;group.add(prop);for(let i=0;i<2;i++){const blade=part(prop,new T.SphereGeometry(1,12,8),'#25292b',0,(i?1:-1)*.3,0);blade.scale.set(.025,.39,.065);box(prop,.03,.075,.11,'#e9c466',0,(i?1:-1)*.61,0);}
 const spinner=part(group,new T.ConeGeometry(.13,.23,20),aluminum,-1.68,0,0);spinner.rotation.z=Math.PI/2;
 for(let i=0;i<5;i++){for(const side of [-1,1])part(group,new T.SphereGeometry(.012,6,4),aluminum,-1.1+i*.19,.06,side*.267);box(group,.055,.07,.018,'#323837',-.98+i*.07,-.02,.226);}
 box(group,2.6,.016,.016,'#62635a',2.8,0,0);
 const livery=airTedLivery(group);
 const c=document.createElement('canvas');c.width=1536;c.height=384;const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const banner=part(group,new T.PlaneGeometry(4.6,1.15),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}),5.4,0,0);banner.rotation.x=-.45;
 const rig={group,prop,banner,livery,bannerCanvas:c,messageIndex:-1,message:'',start:0,until:0,direction:-1,next:performance.now()+120000};paintAirTedBanner(rig,'Bag Chew');return rig;}
export function startAirTed(r,time){if(time<r.until)return false;const message=chooseAirTedMessage(r.messageIndex);r.messageIndex=message.index;paintAirTedBanner(r,message.text);r.direction=-r.direction;r.start=time;r.until=time+6500;r.next=time+180000+Math.random()*150000;return true;}
export function updateAirTed(r,time,camera){const u=(time-r.start)/6500;r.group.visible=time>=r.start&&time<r.until;if(!r.group.visible)return 0;r.group.position.set(r.direction*(19.5-u*39),3.8+Math.sin(u*Math.PI)*.3,1.4);r.group.rotation.set(0,r.direction===1?0:Math.PI,Math.sin(u*12)*.025);r.prop.rotation.x=time*.07;
 // Face the camera independently of the aircraft heading: never mirror the lettering.
 const facing=camera?camera.quaternion:new T.Quaternion().setFromEuler(new T.Euler(-.45,0,0));
 r.group.updateMatrixWorld(true);r.banner.quaternion.copy(r.group.getWorldQuaternion(new T.Quaternion()).invert()).multiply(facing);
 return Math.sin(Math.PI*Math.max(0,Math.min(1,(u-.2)/.65)))*.6;}
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
export function createTubbyCDs(ids){
 if(!ids.includes('tubby'))return null;
 const group=new T.Group();group.name='Tubby back-bar CD collection';group.position.set(-8,2.005,-5.2);group.userData.caseCount=200;
 const shell=new T.InstancedMesh(new T.BoxGeometry(.39,.028,.36),new T.MeshStandardMaterial({color:'#63707b',metalness:.3,roughness:.35}),200);shell.name='200 scattered and stacked jewel cases';group.add(shell);
 const covers=new T.InstancedMesh(new T.BoxGeometry(.34,.002,.33),new T.MeshStandardMaterial({color:'#ffffff',roughness:.8}),200);covers.name='Assorted album covers';group.add(covers);
 const spines=new T.InstancedMesh(new T.BoxGeometry(.008,.012,.31),mat('#c1c6c7'),200);spines.name='Jewel case spines';group.add(spines);
 const transform=new T.Object3D(),palette=['#9b655a','#637e9b','#799076','#aa9a60','#827291','#c5b9a0'];let index=0;
 function addCase(x,y,z,angle){transform.position.set(x,y,z);transform.rotation.set(0,angle,0);transform.updateMatrix();shell.setMatrixAt(index,transform.matrix);transform.position.y+=.016;transform.updateMatrix();covers.setMatrixAt(index,transform.matrix);covers.setColorAt(index,new T.Color(palette[index%palette.length]));transform.position.set(x-Math.cos(angle)*.179,y,z+Math.sin(angle)*.179);transform.updateMatrix();spines.setMatrixAt(index,transform.matrix);index++;}
 const heights=[9,18,12,21,13,17,16,11,14,15,10,12];
 for(const [j,height] of heights.entries()){const x=-1.85+(j%6)*.72,z=j<6?-.34:.13;for(let k=0;k<height;k++)addCase(x+Math.sin(k*3.7+j)*.035,.014+k*.03,z+Math.cos(k*2.4+j)*.025,(j%3-1)*.14+Math.sin(k+j)*.09);}
 for(let j=0;j<32;j++)addCase(-2.08+((j*1.618)%1)*4.16,.014+(j%4)*.03,-.54+((j*.731)%1)*1.06,(j*2.4)%Math.PI);
 const silver=new T.MeshStandardMaterial({color:'#ccd5dc',metalness:.85,roughness:.18,side:T.DoubleSide});
 for(let i=0;i<14;i++){
  const disc=new T.Group();disc.name='Music CD '+(i+1);disc.position.set(-2.08+i*.315,.005+(i%3)*.004,.56+Math.sin(i*2.4)*.025);disc.rotation.y=i*2.4;group.add(disc);
  const face=part(disc,new T.RingGeometry(.034,.17,28),silver);face.rotation.x=-Math.PI/2;
  const label=part(disc,new T.RingGeometry(.038,.083,20),palette[i%palette.length],0,.002,0);label.rotation.x=-Math.PI/2;
  for(let k=0;k<3;k++){const glint=part(disc,new T.RingGeometry(.09,.167,8,1,k*2.1,.3),new T.MeshBasicMaterial({color:['#92d6cf','#c6a6dd','#e0d18a'][k],transparent:true,opacity:.45,side:T.DoubleSide}),0,.003,0);glint.rotation.x=-Math.PI/2;}
 }
 // The deck scene has its own left-side bar surface for the same collection.
 const deckBar=new T.Group();deckBar.name='Deck side bar';deckBar.visible=false;group.add(deckBar);box(deckBar,4.98,.12,1.52,'#eee8d6',0,-.075,0);box(deckBar,4.7,1.85,1.3,'#e2e6df',0,-1.06,0);
 return group;
}
export function placeTubbyCDs(group,onCruiser){if(!group)return;group.position.set(onCruiser?-4.4:-8,2.005,onCruiser?-3.9:-5.2);group.scale.set(onCruiser?.6:1,1,onCruiser?.65:1);group.getObjectByName('Deck side bar').visible=onCruiser;}
