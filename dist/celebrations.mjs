import * as T from './vendor/three.module.js';
const material=(color,roughness=.65)=>new T.MeshStandardMaterial({color,roughness});
function part(parent,geometry,mat,x=0,y=0,z=0){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
export function attachCelebrationRig(avatar,id,skin){
 const hands=avatar.userData.hands,arms=avatar.userData.arms;
 const r={id,hands,arms,restHands:hands.map(h=>({position:h.position.clone(),rotation:h.rotation.clone()})),restArms:arms.map(a=>({position:a.position.clone(),rotation:a.rotation.clone()})),start:0,until:0,props:[],forearm:part(avatar,new T.CapsuleGeometry(.065,.87,3,8),skin)};
 r.forearm.visible=false;
 if(id==='rueben'){
  const racket=new T.Group();racket.name='Tennis racket';hands[1].add(racket);racket.position.set(0,0,.035);racket.rotation.x=Math.PI/2;
  const rim=part(racket,new T.TorusGeometry(.27,.022,8,40),material('#d9dfcf',.3),0,.62,0);rim.scale.y=1.32;
  const grip=part(racket,new T.CylinderGeometry(.028,.032,.24,10),material('#263237'),0,.07,0);
  for(const side of [-1,1]){const throat=part(racket,new T.CylinderGeometry(.013,.013,.24,8),material('#738656',.35),side*.057,.27,0);throat.rotation.z=-side*.46;}
  const strings=material('#d8d5ae',.8);
  for(let k=-4;k<=4;k++){const x=k*.05,half=Math.sqrt(.25**2-x*x)*1.32;part(racket,new T.BoxGeometry(.004,half*2,.004),strings,x,.62,0);const y=k*.065,wide=Math.sqrt(.25**2-(y/1.32)**2);part(racket,new T.BoxGeometry(wide*2,.004,.004),strings,0,.62+y,.003);}
  for(let k=0;k<5;k++)part(racket,new T.TorusGeometry(.031,.003,4,10),material('#b9b9a2'),0,-.025+k*.04,0).rotation.x=Math.PI/2;
  r.props.push(racket);
 }else if(id==='colman'){
  const red=material('#aa2633',.32),cuff=material('#f0e6cf');
  for(let j=0;j<2;j++){const glove=new T.Group();glove.name='Boxing glove';hands[j].add(glove);const fist=part(glove,new T.SphereGeometry(.115,16,12),red,0,.015,.07);fist.scale.set(.95,.82,1.25);const thumb=part(glove,new T.SphereGeometry(.055,12,8),red,(j?1:-1)*.09,-.025,.025);thumb.scale.set(.65,.85,1.2);part(glove,new T.BoxGeometry(.14,.09,.1),red,0,-.04,-.06);part(glove,new T.BoxGeometry(.143,.035,.105),cuff,0,-.04,-.095);r.props.push(glove);}
 }
 for(const prop of r.props)prop.visible=false;
 avatar.userData.celebrationRig=r;return r;
}
export function startCelebration(avatar,time,duration){const r=avatar.userData.celebrationRig;if(!r||time<r.until)return false;r.start=time;r.until=time+duration;return true;}
export function updateCelebrationPose(avatar,time){
 const r=avatar.userData.celebrationRig;if(!r)return;
 const amount=time>=r.start&&time<r.until?Math.max(0,Math.min(1,(time-r.start)/350,(r.until-time)/400)):0;
 for(const prop of r.props)prop.visible=amount>.06;
 // The right upper arm and forearm lift the hand above the head; the prop stays attached to the palm.
 const arm=r.arms[1],hand=r.hands[1],restArm=r.restArms[1],restHand=r.restHands[1];
 const pump=r.id==='colman'?Math.sin((time-r.start)/170)*.055*amount:0;
 arm.position.copy(restArm.position).lerp(new T.Vector3(.39,1.92,.06),amount);arm.rotation.set(restArm.rotation.x*(1-amount),restArm.rotation.y,restArm.rotation.z+(-.35-restArm.rotation.z)*amount);
 hand.position.copy(restHand.position).lerp(new T.Vector3(.5,2.55+pump,.09),amount);hand.rotation.set(restHand.rotation.x+(-Math.PI/2-restHand.rotation.x)*amount,restHand.rotation.y*(1-amount),0);
 const elbow=new T.Vector3(.49,2.15,.06),delta=hand.position.clone().sub(elbow);r.forearm.visible=amount>.04;r.forearm.position.copy(elbow).add(hand.position).multiplyScalar(.5);r.forearm.scale.y=delta.length();if(delta.lengthSq()>0)r.forearm.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
}

export function attachGeneralRig(avatar,shirt){
 const uniform=new T.Group();uniform.name='One-star Army general uniform';avatar.add(uniform);
 const olive=material('#3e4934'),gold=material('#c6a258',.32),silver=material('#e5e6dd',.24),black=material('#20251f');
 for(const side of [-1,1]){
  const lapel=part(uniform,new T.BoxGeometry(.11,.3,.025),olive,side*.075,1.48,.278);lapel.rotation.z=side*.25;
  part(uniform,new T.BoxGeometry(.18,.036,.14),olive,side*.3,1.74,.07);
  // One five-point silver star per shoulder: brigadier-general insignia.
  const star=new T.Shape();for(let k=0;k<10;k++){const a=k*Math.PI/5,r=k%2?.017:.04;const x=Math.sin(a)*r,y=Math.cos(a)*r;k?star.lineTo(x,y):star.moveTo(x,y)}star.closePath();
  const insignia=part(uniform,new T.ShapeGeometry(star),silver,side*.3,1.766,.07);insignia.rotation.x=-Math.PI/2;
  part(uniform,new T.BoxGeometry(.17,.02,.018),gold,side*.16,1.35,.282);
  part(uniform,new T.BoxGeometry(.18,.07,.019),olive,side*.16,1.29,.28);
 }
 for(let k=0;k<4;k++)part(uniform,new T.SphereGeometry(.018,8,6),gold,0,1.5-k*.13,.29);
 for(let row=0;row<2;row++)for(let col=0;col<3;col++)part(uniform,new T.BoxGeometry(.036,.02,.018),material(['#7b2737','#c8ac62','#3b6495'][col]),-.18+col*.039,1.48+row*.025,.29);
 part(uniform,new T.BoxGeometry(.54,.055,.025),black,0,.98,.26);part(uniform,new T.BoxGeometry(.07,.055,.032),gold,0,.98,.28);
 const legs=new T.Group();legs.name='Standing uniform trousers';uniform.add(legs);
 for(const side of [-1,1]){part(legs,new T.CapsuleGeometry(.09,.84,3,10),olive,side*.16,.16,.02);part(legs,new T.BoxGeometry(.2,.12,.34),black,side*.16,-.36,.12);part(legs,new T.BoxGeometry(.014,.9,.023),gold,side*.247,.16,.04);}
 const hidden=avatar.children.filter(o=>o!==uniform&&o.isMesh&&(o.position.y<.95||o.material?.color?.getHexString()==='eee5cf'));
 uniform.visible=false;const r={uniform,hidden,shirt,restColor:shirt.color.clone(),restY:avatar.position.y,start:0,until:0};avatar.userData.generalRig=r;return r;
}
export function startGeneral(avatar,time){const r=avatar.userData.generalRig;if(!r)return false;if(time>=r.until)r.restY=avatar.position.y;r.start=time;r.until=time+15000;return true;}
export function updateGeneralPose(avatar,time){const r=avatar.userData.generalRig;if(!r)return;const amount=time>=r.start&&time<r.until?Math.max(0,Math.min(1,(time-r.start)/550,(r.until-time)/450)):0;r.uniform.visible=amount>.04;avatar.position.y=r.restY+amount*.45;r.shirt.color.copy(r.restColor).lerp(new T.Color('#3e4934'),amount);for(const piece of r.hidden)piece.visible=amount<.04;}

export function attachHairFire(head){const fire=new T.Group();fire.name='Martens’s hair flare-up';head.add(fire);fire.position.set(0,.28,0);fire.visible=false;const orange=new T.MeshBasicMaterial({color:'#f26a18'}),yellow=new T.MeshBasicMaterial({color:'#ffe47c'});for(let j=0;j<5;j++){const flame=new T.Group();fire.add(flame);flame.position.set((j-2)*.083,0,Math.sin(j*2)*.065);const profile=[[0,0],[.055,.015],[.072,.08],[.04,.2],[.018,.3],[0,.4]].map(([r,y])=>new T.Vector2(r,y));part(flame,new T.LatheGeometry(profile,10),orange);const core=part(flame,new T.LatheGeometry(profile,10),yellow,0,0,.025);core.scale.set(.56,.65,.56);}head.userData.hairFire={fire,start:0,until:0,next:0};return fire;}
export function startHairFire(head,time){const r=head.userData.hairFire;if(!r||time<r.next)return false;r.start=time;r.until=time+5000;r.next=time+18000;return true;}
export function updateHairFire(head,time){const r=head.userData.hairFire;if(!r)return;r.fire.visible=time>=r.start&&time<r.until;if(!r.fire.visible)return;const edge=Math.min(1,(time-r.start)/220,(r.until-time)/300);for(const [j,flame] of r.fire.children.entries()){flame.scale.set(1,Math.max(.05,edge*(.7+.25*Math.sin(time/80+j*1.9))),1);flame.rotation.z=Math.sin(time/130+j)*.14;}}

export function attachAttRig(avatar,skin){
 const arms=avatar.userData.arms,hands=avatar.userData.hands;
 const rig={arms,hands,restArms:arms.map(a=>({position:a.position.clone(),quaternion:a.quaternion.clone(),scale:a.scale.clone()})),restHands:hands.map(h=>({position:h.position.clone(),rotation:h.rotation.clone()})),forearms:[],start:0,until:0};
 for(let i=0;i<2;i++){const forearm=part(avatar,new T.CapsuleGeometry(.065,.87,3,8),skin);forearm.visible=false;rig.forearms.push(forearm);}avatar.userData.attRig=rig;return rig;
}
export function startAttPose(avatar,time,duration=3400){const rig=avatar.userData.attRig;if(!rig)return false;rig.start=time-1;rig.until=time+duration;return true;}
export function updateAttPose(avatar,time){
 const r=avatar.userData.attRig;if(!r)return;const amount=time>=r.start&&time<r.until?Math.max(0,Math.min(1,(time-r.start)/280,(r.until-time)/350)):0;
 const shoulders=[new T.Vector3(-.3,1.65,0),new T.Vector3(.3,1.65,0)],elbows=[new T.Vector3(-.6,2.12,-.09),new T.Vector3(.65,2,.02)],targets=[new T.Vector3(-.12,2.08,-.25),new T.Vector3(1,2.35,.02)];
 for(let j=0;j<2;j++){const arm=r.arms[j],hand=r.hands[j],rest=r.restArms[j],upper=elbows[j].clone().sub(shoulders[j]);arm.position.copy(rest.position).lerp(shoulders[j].clone().add(elbows[j]).multiplyScalar(.5),amount);arm.quaternion.copy(rest.quaternion).slerp(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),upper.clone().normalize()),amount);arm.scale.copy(rest.scale);arm.scale.y=rest.scale.y+(upper.length()/.58-rest.scale.y)*amount;
 hand.position.copy(r.restHands[j].position).lerp(targets[j],amount);hand.rotation.set(r.restHands[j].rotation.x+((j===0?.4:-Math.PI/2)-r.restHands[j].rotation.x)*amount,r.restHands[j].rotation.y*(1-amount),0);
 const delta=targets[j].clone().sub(elbows[j]),forearm=r.forearms[j];forearm.visible=amount>.04;forearm.position.copy(elbows[j]).add(hand.position).multiplyScalar(.5);forearm.scale.y=delta.length();forearm.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),hand.position.clone().sub(elbows[j]).normalize());
 }
}

export function runSignatureMoves(actors,time){let triggered=0;for(const p of actors){if(p.away)continue;let did=false;const a=p.avatar;if(a.userData.safetyRig){a.userData.safetyRig.start=time;a.userData.safetyRig.until=time+3000;did=true;}if(a.userData.celebrationRig){a.userData.celebrationRig.until=0;startCelebration(a,time,5000);did=true;}if(a.userData.generalRig){startGeneral(a,time);a.userData.generalRig.until=time+5000;did=true;}if(a.userData.attRig){startAttPose(a,time,4000);did=true;}if(p.head?.userData.hairFire){p.head.userData.hairFire.next=0;startHairFire(p.head,time);did=true;}if(did)triggered++;}return triggered;}
