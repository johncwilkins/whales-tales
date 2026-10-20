import * as T from './vendor/three.module.js';
import {createTreeDoorWalls,TREE_DOORWAY} from './scene-events.mjs';

export function createClubRoom(woodMap){
 const group=new T.Group();group.name='Reference-inspired dark timber club room';
 const timber=new T.MeshPhysicalMaterial({map:woodMap,color:'#30231f',roughness:.48,clearcoat:.24});
 const plaster=new T.MeshStandardMaterial({color:'#dfd8c6',roughness:1});
 const brass=new T.MeshStandardMaterial({color:'#b1935a',metalness:.7,roughness:.35});
 const leather=new T.MeshPhysicalMaterial({color:'#541f27',roughness:.42,clearcoat:.28});
 function mesh(geometry,material,parent=group,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const box=(w,h,d,m,p=group,x=0,y=0,z=0)=>mesh(new T.BoxGeometry(w,h,d),m,p,x,y,z);
 const cylinder=(rt,rb,h,m,p=group,x=0,y=0,z=0)=>mesh(new T.CylinderGeometry(rt,rb,h,20),m,p,x,y,z);

 function batchBoxes(pieces,material,name){const batch=new T.InstancedMesh(new T.BoxGeometry(1,1,1),material,pieces.length),matrix=new T.Matrix4();batch.name=name;for(const [i,p] of pieces.entries()){matrix.compose(new T.Vector3(p.x,p.y,p.z),new T.Quaternion(),new T.Vector3(p.w,p.h,p.d));batch.setMatrixAt(i,matrix);}batch.castShadow=true;batch.receiveShadow=true;group.add(batch);return batch;}
 // Long, staggered oak boards and narrow dark joints replace the tile floor.
 box(25,.12,24,timber,group,0,-.13,-2);
 const floorMats=Array.from({length:6},(_,i)=>new T.MeshStandardMaterial({map:woodMap,color:['#72503a','#694831','#7a5439','#62432e','#805b40','#6e4d36'][i],roughness:.58}));
 const boards=floorMats.map(()=>[]);for(let row=0;row<44;row++)for(let j=0;j<5;j++){const x=-12.5+j*5+(row%2?2.5:0),left=Math.max(-12.5,x),right=Math.min(12.5,x+5);if(right>left)boards[(row+j)%6].push({w:right-left-.018,h:.025,d:.528,x:(left+right)/2,y:-.054,z:-13.65+row*.54});}boards.forEach((pieces,i)=>batchBoxes(pieces,floorMats[i],'Staggered oak floorboards'));
 // Cream upper walls, very dark paneling, broad cross rails and ceiling beams.
 box(25,7.8,.2,plaster,group,0,3.8,-10);
 group.add(createTreeDoorWalls(plaster));
 for(let i=0;i<31;i++){const x=-12+i*.8;box(.78,2.35,.11,timber,group,x,1.15,-9.82);box(.055,2.4,.16,timber,group,x-.37,1.18,-9.72);}
 for(const y of [.15,2.4,6.65,7.55])box(25,y===2.4?.32:.18,.24,timber,group,0,y,-9.68);
 for(const x of [-11.73,11.73]){
  for(let i=0;i<30;i++){const z=-9.6+i*.8;if(Math.abs(z-TREE_DOORWAY.z)<TREE_DOORWAY.width/2+.4)continue;box(.12,2.35,.78,timber,group,x,1.15,z);box(.16,2.4,.055,timber,group,x,1.18,z-.37);}
  for(const y of [.15,2.4,6.65,7.55]){if(y>TREE_DOORWAY.height)box(.24,.2,24,timber,group,x,y,2);else for(const [a,b] of [[-10,TREE_DOORWAY.z-TREE_DOORWAY.width/2],[TREE_DOORWAY.z+TREE_DOORWAY.width/2,14]])box(.24,y===2.4?.32:.18,b-a,timber,group,x,y,(a+b)/2);}
 }
 for(const x of [-11.6,-8.1,0,8.1,11.6])box(.26,5.25,.2,timber,group,x,4.95,-9.67);
 for(const z of [-9,-4,1,6])box(24,.28,.32,timber,group,0,7.65,z);

 const windows=[];
 function windowAt(x){
  const win=new T.Group();win.name='Tall sash window with green curtains';win.position.set(x,4.35,-9.5);group.add(win);windows.push(win);
  const c=document.createElement('canvas');c.width=256;c.height=384;const ctx=c.getContext('2d'),sky=ctx.createLinearGradient(0,0,0,384);sky.addColorStop(0,'#b5ccd0');sky.addColorStop(.6,'#d7dfc7');sky.addColorStop(1,'#9da67f');ctx.fillStyle=sky;ctx.fillRect(0,0,256,384);
  ctx.strokeStyle='#727b59';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(190,384);ctx.lineTo(175,90);ctx.moveTo(178,180);ctx.lineTo(90,110);ctx.moveTo(183,250);ctx.lineTo(245,170);ctx.stroke();
  for(let i=0;i<95;i++){ctx.fillStyle=['#71845999','#95a675aa','#bec59cbb'][i%3];ctx.beginPath();ctx.ellipse((i*73)%278-10,(i*47)%350,12+i%17,9+i%12,.2,0,Math.PI*2);ctx.fill();}
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const glass=new T.MeshStandardMaterial({map:tex,emissive:'#aebbb0',emissiveMap:tex,emissiveIntensity:.42,roughness:.4});
  box(3.05,3.7,.13,timber,win);box(2.7,3.37,.035,glass,win,0,0,.08);
  for(const y of [-1.64,0,1.64])box(2.85,.09,.11,timber,win,0,y,.14);
  for(const xx of [-1.35,0,1.35])box(.085,3.4,.11,timber,win,xx,0,.14);
  for(const xx of [-.68,.68])box(.05,1.58,.08,timber,win,xx,.83,.14);
  box(3.4,.18,.55,timber,win,0,-1.85,.1);box(3.4,.17,.25,timber,win,0,1.94,0);
  const curtain=new T.MeshStandardMaterial({color:'#43513b',roughness:1,side:T.DoubleSide});
  for(const side of [-1,1]){const geo=new T.PlaneGeometry(.72,3.55,20,12),p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin((p.getX(i)+.36)*Math.PI*16)*.055);geo.computeVertexNormals();const cloth=mesh(geo,curtain,win,side*1.44,-.03,.28);cloth.name='Pleated olive curtain';box(.8,.11,.1,timber,win,side*1.44,1.83,.22);}
  const light=new T.PointLight('#e5ead7',12,9,2);light.position.set(0,.7,1.2);win.add(light);
 }
 windowAt(-4.8);windowAt(4.8);

 const fireplace=new T.Group();fireplace.name='Red brick fireplace with dark timber mantel';fireplace.position.set(0,0,-9.15);group.add(fireplace);
 const stone=new T.MeshStandardMaterial({color:'#5c5850',roughness:.9}),mortar=new T.MeshStandardMaterial({color:'#a39b8a',roughness:1});
 box(5.1,.14,1.3,stone,fireplace,0,.02,.2);box(4.65,2.45,.5,mortar,fireplace,0,1.3,0);
 const brickMats=['#804e43','#965f51','#71483f','#a16d59','#885547'].map(color=>new T.MeshStandardMaterial({color,roughness:.95}));
 for(let row=0;row<12;row++)for(let col=0;col<10;col++){const x=-2.23+col*.48+(row%2?.24:0);if(x>2.3)continue;box(.448,.174,.06,brickMats[(row*7+col)%5],fireplace,x,.17+row*.2,.28);}
 box(2.72,1.75,.065,new T.MeshStandardMaterial({color:'#171714',roughness:1}),fireplace,0,.97,.33);
 box(2.86,.11,.13,timber,fireplace,0,1.88,.35);for(const x of [-1.42,1.42])box(.1,1.75,.13,timber,fireplace,x,1,.35);
 box(5.05,.25,.85,timber,fireplace,0,2.62,.08);box(4.8,.15,.65,timber,fireplace,0,2.42,.05);
 const grate=box(2.3,.04,.42,new T.MeshStandardMaterial({color:'#2c2c27',metalness:.5,roughness:.8}),fireplace,0,.2,.52);grate.name='Unlit hearth';

 // A small decorative roundel, with no portraits or photo composite.
 const roundel=new T.Group();roundel.name='Geometric stained-glass roundel';roundel.position.set(0,5.3,-9.45);group.add(roundel);
 const rim=mesh(new T.TorusGeometry(.82,.11,8,48),timber,roundel);const disc=mesh(new T.CircleGeometry(.77,48),new T.MeshStandardMaterial({color:'#4d655d',roughness:.5}),roundel,0,0,.015);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const gem=mesh(new T.CircleGeometry(.19,6),new T.MeshStandardMaterial({color:i%2?'#b29356':'#8a4d45',roughness:.5}),roundel,Math.sin(a)*.47,Math.cos(a)*.47,.03);gem.rotation.z=a;}
 mesh(new T.CircleGeometry(.24,8),brass,roundel,0,0,.045);

 function chair(x,z,angle){
  const chair=new T.Group();chair.name='Burgundy tufted leather club chair';chair.position.set(x,0,z);chair.rotation.y=angle;group.add(chair);
  box(1.1,.3,1.05,leather,chair,0,.62,0);box(1.2,1.1,.25,leather,chair,0,1.08,-.49);
  for(const side of [-1,1]){box(.2,.68,1.13,timber,chair,side*.64,.75,0);box(.25,.15,1.18,leather,chair,side*.64,1.1,0);for(const zz of [-.4,.4])box(.09,.4,.09,timber,chair,side*.48,.2,zz);}
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){const button=mesh(new T.SphereGeometry(.026,8,6),brass,chair,-.42+col*.28,.82+row*.25,-.35);button.scale.z=.4;}
 }
 chair(-3,-8.5,.3);chair(3,-8.5,-.3);
 const lamps=[];
 function tableLamp(x){const lamp=new T.Group();lamp.name='Warm brass lamp with pleated shade';lamp.position.set(x,0,-8.3);group.add(lamp);lamps.push(lamp);
  box(.9,.1,.8,timber,lamp,0,.9,0);for(const side of [-1,1])box(.065,.85,.065,timber,lamp,side*.34,.45,0);
  cylinder(.18,.22,.07,brass,lamp,0,1.02,0);cylinder(.027,.04,.7,brass,lamp,0,1.4,0);
  const shade=mesh(new T.CylinderGeometry(.27,.44,.64,32,1,true),new T.MeshStandardMaterial({color:'#ddc29a',side:T.DoubleSide,emissive:'#b88a48',emissiveIntensity:.2,roughness:1}),lamp,0,1.95,0);shade.name='Pleated parchment shade';
  for(let i=0;i<24;i++){const a=i*Math.PI/12;const rib=cylinder(.006,.006,.65,new T.MeshStandardMaterial({color:'#ae906c'}),lamp,Math.sin(a)*.355,1.95,Math.cos(a)*.355);rib.rotation.z=Math.sin(a)*.25;rib.rotation.x=-Math.cos(a)*.25;}
  const bulb=new T.PointLight('#ffd298',10,6,2);bulb.position.y=1.85;lamp.add(bulb);
 }
 tableLamp(-2);tableLamp(2);
 const column=new T.Group();column.name='Fluted dark timber column';column.position.set(-10.8,0,-.3);group.add(column);
 cylinder(.34,.4,7.5,timber,column,0,3.7,0);for(let i=0;i<18;i++){const a=i*Math.PI/9;cylinder(.028,.028,7.15,timber,column,Math.sin(a)*.355,3.7,Math.cos(a)*.355);}for(const y of [.15,7.25])cylinder(.48,.48,.22,timber,column,0,y,0);
 return {group,windows,fireplace,lamps};
}
