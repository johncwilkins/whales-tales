import * as T from './vendor/three.module.js';
export function frameMobileTable(camera,count,aspect,view=0){
 camera.aspect=aspect;
 const target=new T.Vector3(0,1.85,0),direction=new T.Vector3([0,.3,-.3][view]||0,1,1.02).normalize();
 camera.position.copy(target).add(direction);camera.lookAt(target);camera.updateMatrixWorld(true);
 const inverse=camera.quaternion.clone().invert(),tanV=Math.tan(T.MathUtils.degToRad(camera.fov)/2),tanH=tanV*aspect;
 let distance=1;
 const include=point=>{const p=point.sub(target).applyQuaternion(inverse);distance=Math.max(distance,p.z+Math.abs(p.x)/(tanH*.91),p.z+Math.abs(p.y)/(tanV*.9));};
 for(let i=0;i<32;i++){const a=i*Math.PI/16;include(new T.Vector3(Math.sin(a)*2.75,1.7,Math.cos(a)*2.75));}
 for(let i=0;i<count;i++){
  const angle=i*Math.PI*2/count,x=-Math.sin(angle)*3.25,z=Math.cos(angle)*3.25;
  for(const dx of [-.36,.36])for(const y of [1.25,2.6])for(const dz of [-.35,.35]){
   include(new T.Vector3(x+dx,y,z+dz));
  }
 }
 camera.position.copy(target).addScaledVector(direction,distance+.1);camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 return {distance,target};
}
export function sideLabelLayout(anchors,width,height){
 const result=[];
 for(const side of ['left','right']){
  const list=anchors.filter(a=>(a.x<width/2?'left':'right')===side).sort((a,b)=>a.y-b.y);
  const top=20,bottom=Math.max(top,height-22),gap=Math.min(17,(bottom-top)/Math.max(1,list.length-1));
  let previous=top-gap;
  const rows=list.map(a=>{const y=Math.max(previous+gap,Math.min(bottom,a.y+18));previous=y;return {...a,y,side}});
  for(let i=rows.length-1;i>=0;i--)rows[i].y=Math.min(rows[i].y,i===rows.length-1?bottom:rows[i+1].y-gap);
  for(const row of rows)result.push({...row,x:side==='left'?6:width-6});
 }
 return result;
}
