import * as T from './vendor/three.module.js';
export function createTableProps(){
 const group=new T.Group();group.name='Table paraphernalia';group.position.y=1.698;
 const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.6,...extra});
 const add=(geometry,mat,parent=group,x=0,y=0,z=0)=>{const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);parent.add(m);m.castShadow=true;return m};
 const disc=(r,h,mat,parent,x,y,z)=>add(new T.CylinderGeometry(r,r,h,20),mat,parent,x,y,z);
 const cream=material('#e5d8b9'),steel=material('#a7adaa',{metalness:.7,roughness:.3});
 function lettering(text,w,h,parent,x,y,z,color='#344031'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.clearRect(0,0,512,128);ctx.fillStyle=color;ctx.font='bold 60px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,84);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  const p=add(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}),parent,x,y,z);return p;
 }
 function pitcher(x,z,angle){
  const p=new T.Group();p.name='Beer pitcher';p.position.set(x,.01,z);p.rotation.y=angle;group.add(p);
  const glass=new T.MeshPhysicalMaterial({color:'#e7e4ce',transparent:true,opacity:.22,roughness:.12,metalness:0,depthWrite:false,side:T.DoubleSide});
  add(new T.CylinderGeometry(.21,.18,.55,24,1,true),glass,p,0,.29,0);disc(.18,.035,glass,p,0,.025,0);
  disc(.178,.35,material('#b47a20',{roughness:.25}),p,0,.215,0);disc(.181,.045,cream,p,0,.413,0);
  const rim=add(new T.TorusGeometry(.21,.013,6,24),glass,p,0,.565,0);rim.rotation.x=Math.PI/2;
  const handle=add(new T.TorusGeometry(.145,.027,6,18,Math.PI*1.55),glass,p,.238,.31,0);handle.rotation.z=-Math.PI*.275;handle.scale.x=.8;
  const spout=add(new T.ConeGeometry(.06,.1,4),glass,p,-.205,.558,0);spout.rotation.z=Math.PI/2;
 }
 for(const [x,z] of [[-.64,-.16],[.55,-.35],[-.1,.68],[.73,.36]]){disc(.24,.015,material('#304232'),group,x,.009,z);const ring=add(new T.TorusGeometry(.205,.008,4,20),cream,group,x,.018,z);ring.rotation.x=Math.PI/2;}
 pitcher(-.64,-.16,-.3);pitcher(.55,-.35,2.5);
 // Black twin-LED Mr. Beams spotlight on its adjustable mounting foot.
 const light=new T.Group();light.name='Mr. Beams spotlight';light.position.set(.04,.01,.2);light.rotation.y=-.45;group.add(light);
 const plastic=material('#242627',{roughness:.6}),rimMat=material('#383b3c'),reflector=material('#d9dedc',{metalness:.8,roughness:.16});
 disc(.145,.045,plastic,light,0,.025,-.035);const stem=add(new T.BoxGeometry(.07,.15,.085),plastic,light,0,.12,-.035);
 const pivot=disc(.065,.15,rimMat,light,0,.18,-.035);pivot.rotation.z=Math.PI/2;
 const head=new T.Group();head.name='Adjustable spotlight head';head.position.set(0,.33,0);head.rotation.x=-.2;light.add(head);
 const housing=disc(.18,.24,plastic,head,0,0,0);housing.rotation.x=Math.PI/2;
 const bezel=disc(.188,.045,rimMat,head,0,0,.13);bezel.rotation.x=Math.PI/2;
 const face=disc(.167,.012,plastic,head,0,0,.158);face.rotation.x=Math.PI/2;
 for(const x of [-.074,.074]){const lens=disc(.059,.018,reflector,head,x,.055,.172);lens.rotation.x=Math.PI/2;lens.name='LED reflector';const led=add(new T.SphereGeometry(.013,8,6),material('#fff4b7',{emissive:'#fff0b8',emissiveIntensity:1.1}),head,x,.055,.188);led.scale.z=.25;}
 const sensor=add(new T.SphereGeometry(.073,12,8),material('#d6d9d6',{roughness:.42,flatShading:true}),head,0,-.071,.167);sensor.name='Frosted motion sensor';sensor.scale.set(1,.85,.48);
 for(let k=0;k<6;k++){const a=k*Math.PI/3;const rib=add(new T.BoxGeometry(.012,.012,.16),rimMat,head,Math.sin(a)*.178,Math.cos(a)*.178,.025);rib.rotation.z=-a;}
 const brand=lettering('Mr. Beams',.17,.033,light,0,.065,.11,'#c1c4bc');
 const cards=new T.Group();cards.name='Playing cards';cards.position.set(-.23,.02,-.75);cards.rotation.y=.25;group.add(cards);
 for(let i=0;i<3;i++){const c=add(new T.BoxGeometry(.14,.008,.21),cream,cards,i*.055,i*.008,0);c.rotation.y=i*.18;const pip=disc(.018,.004,material(i%2?'#263632':'#a84237'),cards,i*.055,.008+i*.008,0);}
 const opener=new T.Group();opener.name='Bottle opener';opener.position.set(.66,.028,.4);opener.rotation.y=-.55;group.add(opener);add(new T.BoxGeometry(.07,.027,.24),steel,opener);const loop=add(new T.TorusGeometry(.055,.018,6,14),steel,opener,0,0,-.15);loop.rotation.x=Math.PI/2;
 for(let i=0;i<2;i++){const die=new T.Group();die.name='Dice';die.position.set(-.05+i*.14,.07,.72);die.rotation.y=i*.6;group.add(die);add(new T.BoxGeometry(.095,.095,.095),cream,die);for(let j=0;j<i+2;j++)disc(.007,.002,material('#2d3430'),die,(j%2-.5)*.035,.049,(Math.floor(j/2)-.5)*.035);}
 return group;
}

export function createRibPlate(){
 const plate=new T.Group();plate.name='Rooks’s smoking barbecue ribs';plate.position.set(-.4,1.72,.95);plate.rotation.y=.3;
 const cream=new T.MeshStandardMaterial({color:'#e8dfc8',roughness:.32}),glaze=new T.MeshStandardMaterial({color:'#79321c',roughness:.27}),bone=new T.MeshStandardMaterial({color:'#e8d7b5',roughness:.75}),char=new T.MeshStandardMaterial({color:'#3b2117',roughness:.8});
 const add=(geometry,material,x,y,z)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;plate.add(m);return m;};
 add(new T.CylinderGeometry(.29,.25,.027,32),cream,0,0,0);const rim=add(new T.TorusGeometry(.265,.016,6,32),cream,0,.018,0);rim.rotation.x=Math.PI/2;
 for(let k=0;k<4;k++){const x=(k-1.5)*.096;add(new T.BoxGeometry(.084,.055,.3),glaze,x,.049,0);const rib=add(new T.CapsuleGeometry(.013,.33,2,8),bone,x,.032,0);rib.rotation.x=Math.PI/2;for(let j=0;j<3;j++){const mark=add(new T.BoxGeometry(.083,.003,.009),char,x,.078,-.09+j*.09);mark.rotation.y=.2;}}
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),fade=ctx.createRadialGradient(32,32,0,32,32,32);fade.addColorStop(0,'rgba(220,218,202,.65)');fade.addColorStop(.4,'rgba(207,207,197,.25)');fade.addColorStop(1,'rgba(207,207,197,0)');ctx.fillStyle=fade;ctx.fillRect(0,0,64,64);const texture=new T.CanvasTexture(canvas);
 plate.userData.steam=[];for(let i=0;i<7;i++){const wisp=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,color:'#e2e0d5'}));wisp.name='Rib steam';plate.add(wisp);plate.userData.steam.push(wisp);}return plate;
}
export function updateRibSteam(plate,time){const origin=plate?.userData.steamOrigin||{x:0,y:0,z:0};for(const [i,wisp] of (plate?.userData.steam||[]).entries()){const life=(time/3800+i/7)%1;wisp.position.set(origin.x+Math.sin(time/1900+i*2)*(.025+life*.075),origin.y+.1+life*.65,origin.z+Math.cos(time/2300+i)*.055);wisp.scale.setScalar(.08+life*.24);wisp.material.opacity=Math.sin(life*Math.PI)*.33;}}

export function createSmoker(){
 const smoker=new T.Group();smoker.name='Rooks’s backyard rib smoker';smoker.position.set(.88,0,-1.05);smoker.rotation.y=-.35;
 const iron=new T.MeshStandardMaterial({color:'#292d2c',roughness:.77}),metal=new T.MeshStandardMaterial({color:'#7f8581',metalness:.65,roughness:.4});
 const add=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;smoker.add(m);return m;};
 const barrel=add(new T.CylinderGeometry(.29,.29,.82,24),iron,0,1.07,0);barrel.rotation.z=Math.PI/2;
 for(const x of [-.3,.3])for(const z of [-.18,.18]){const leg=add(new T.CylinderGeometry(.025,.025,.91,8),iron,x,.52,z);leg.rotation.z=x<0?-.08:.08;}
 for(const x of [-.3,.3]){const wheel=add(new T.CylinderGeometry(.11,.11,.045,14),iron,x,.12,-.21);wheel.rotation.x=Math.PI/2;}
 const seam=add(new T.TorusGeometry(.294,.008,6,24,Math.PI),metal,0,1.07,0);seam.rotation.y=Math.PI/2;
 add(new T.BoxGeometry(.28,.035,.05),metal,0,1.24,.28);for(const x of [-.12,.12])add(new T.BoxGeometry(.025,.09,.035),iron,x,1.23,.23);
 const gauge=add(new T.CylinderGeometry(.045,.045,.017,16),new T.MeshStandardMaterial({color:'#e1dac7'}),.18,1.25,.2);gauge.rotation.x=Math.PI/2;
 add(new T.CylinderGeometry(.043,.043,.55,10),iron,.31,1.53,-.08);add(new T.CylinderGeometry(.073,.073,.022,12),iron,.31,1.82,-.08);
 const firebox=add(new T.CylinderGeometry(.17,.17,.3,16),iron,-.52,.92,0);firebox.rotation.z=Math.PI/2;
 for(let k=0;k<3;k++)add(new T.BoxGeometry(.025,.016,.11),new T.MeshStandardMaterial({color:'#9d5b25',emissive:'#a64c10',emissiveIntensity:.65}),-.68,.88+k*.035,.08);
 const smokeCanvas=document.createElement('canvas');smokeCanvas.width=smokeCanvas.height=64;const ctx=smokeCanvas.getContext('2d'),fade=ctx.createRadialGradient(32,32,0,32,32,32);fade.addColorStop(0,'rgba(183,183,175,.65)');fade.addColorStop(1,'rgba(183,183,175,0)');ctx.fillStyle=fade;ctx.fillRect(0,0,64,64);const texture=new T.CanvasTexture(smokeCanvas);
 smoker.userData.steamOrigin={x:.31,y:1.76,z:-.08};smoker.userData.steam=[];for(let i=0;i<8;i++){const wisp=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,color:'#aeb2ab'}));wisp.name='Smoker chimney smoke';smoker.add(wisp);smoker.userData.steam.push(wisp);}return smoker;
}
