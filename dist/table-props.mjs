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
 // White battery closet light, sensor dome and softly glowing LED face.
 const light=new T.Group();light.name='Mr. Beams closet light';light.position.set(.04,.01,.2);light.rotation.y=-.25;group.add(light);
 const housing=disc(.205,.075,material('#e4e4d9'),light,0,.04,0);housing.scale.x=1.35;
 const bezel=disc(.155,.025,material('#bcc1b5'),light,-.04,.087,0);bezel.scale.x=1.2;
 const lens=disc(.133,.018,material('#fff3c5',{emissive:'#ffe2a0',emissiveIntensity:1.3}),light,-.04,.106,0);lens.scale.x=1.2;
 const sensor=add(new T.SphereGeometry(.045,12,8),material('#273532',{roughness:.2}),light,.186,.078,0);sensor.scale.y=.55;
 const brand=lettering('Mr. Beams',.19,.045,light,-.02,.127,.12);brand.rotation.x=-Math.PI/2;
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
export function updateRibSteam(plate,time){for(const [i,wisp] of (plate?.userData.steam||[]).entries()){const life=(time/3800+i/7)%1;wisp.position.set(Math.sin(time/1900+i*2)*(.025+life*.075),.1+life*.65,Math.cos(time/2300+i)*.055);wisp.scale.setScalar(.08+life*.24);wisp.material.opacity=Math.sin(life*Math.PI)*.33;}}
