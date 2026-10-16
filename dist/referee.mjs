import * as T from './vendor/three.module.js';
export function attachSafetyRig(avatar,arms,hands,skin){
 const rig={arms,hands,restArms:arms.map(a=>({position:a.position.clone(),rotation:a.rotation.clone()})),restHands:hands.map(h=>({position:h.position.clone(),rotation:h.rotation.clone()})),forearms:[],start:0,until:0};
 for(let j=0;j<2;j++){const forearm=new T.Mesh(new T.CapsuleGeometry(.07,.86,3,8),skin);forearm.visible=false;avatar.add(forearm);rig.forearms.push(forearm)}
 avatar.userData.safetyRig=rig;return rig;
}
export function updateSafetyPose(avatar,time){
 const r=avatar.userData.safetyRig;if(!r)return;
 const amount=time>=r.start&&time<r.until?Math.max(0,Math.min(1,(time-r.start)/300,(r.until-time)/350)):0;
 for(let j=0;j<2;j++){
  const side=j===0?-1:1,arm=r.arms[j],hand=r.hands[j],restArm=r.restArms[j],restHand=r.restHands[j];
  arm.position.copy(restArm.position).lerp(new T.Vector3(side*.355,1.94,.04),amount);arm.rotation.set(restArm.rotation.x*(1-amount),restArm.rotation.y,restArm.rotation.z+(-side*.45-restArm.rotation.z)*amount);
  hand.position.copy(restHand.position).lerp(new T.Vector3(side*.055,2.54,.04),amount);hand.rotation.set(restHand.rotation.x+(-Math.PI/2-restHand.rotation.x)*amount,restHand.rotation.y*(1-amount),0);
  const forearm=r.forearms[j],elbow=restHand.position.clone().lerp(new T.Vector3(side*.48,2.2,.04),amount),delta=hand.position.clone().sub(elbow);forearm.visible=amount>.04;forearm.position.copy(elbow).add(hand.position).multiplyScalar(.5);forearm.scale.y=delta.length();if(delta.lengthSq()>0)forearm.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
 }
}
