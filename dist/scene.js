import {createSantaDance,placeSantaDance,startSantaDance,updateSantaDance,cancelSantaDance} from './santa-dance.mjs';
import {chooseTreeCrew,createChristmasTree,startChristmasTree,updateChristmasTree,clearTreeCrew,needsCruiser,needsSpotlight,nerfPair,createCruiser,createTube,createAirTed,startAirTed,updateAirTed,createNerf,updateNerf,createBeerThrow,updateBeerThrow,createPizza,createTubbyCDs,placeTubbyCDs} from './scene-events.mjs';
import {createVomitRig,startVomit,updateVomit,createJointProp,createDanceRig,startDance,updateDance,attachBackgroundSmoke,updateBackgroundSmoke} from './party-gags.mjs';
import {attachSafetyRig,updateSafetyPose} from './referee.mjs';
import {attachCelebrationRig,updateCelebrationPose,startCelebration,attachGeneralRig,startGeneral,updateGeneralPose,attachHairFire,startHairFire,updateHairFire,attachAttRig,startAttPose,updateAttPose,runSignatureMoves} from './celebrations.mjs';
import {createTableProps,createRibPlate,updateRibSteam,createSmoker} from './table-props.mjs';
import {frameMobileTable,sideLabelLayout,chooseVisibleSide} from './table-layout.mjs';
import {CHARACTERS,SUPPORTING_CHARACTERS,choosePongCast,seatCast,HOUSE_NAMES} from './roster.mjs';
import * as T from './vendor/three.module.js';
const mount=document.querySelector('#scene'), labels=document.querySelector('#labels'), bubbles=document.querySelector('#bubbles');
export const people=[];
const phone=()=>window.matchMedia('(max-width:1000px)').matches;
let renderer;
try{renderer=new T.WebGLRenderer({antialias:!phone(),powerPreference:'high-performance'});}catch(e){mount.insertAdjacentHTML('beforeend','<p style="padding:200px 30px">This 3D room needs WebGL. Please enable hardware acceleration in your browser.</p>');throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,phone()?1:1.7));renderer.shadowMap.enabled=!phone();renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;mount.prepend(renderer.domElement);
const santaDance=createSantaDance();
const scene=new T.Scene();scene.add(santaDance.group);scene.background=new T.Color('#201b19');scene.fog=new T.FogExp2('#211d19',.025);
const camera=new T.PerspectiveCamera(43,1,.1,65);let view=0;try{view=Math.max(0,Math.min(2,Number(localStorage.getItem('whales-camera-view'))||0))}catch{}let active=-1,ceremonyIndex=-1,ceremonyKind='';
const mat=(c,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color:c,roughness,metalness});
const wood=mat('#795033'),darkWood=mat('#30221b'),brass=mat('#b3995f',.35,.65),black=mat('#1e2422'),green=mat('#264b39');
function mesh(geo,material,parent=scene,x=0,y=0,z=0){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(w,h,d,m,p=scene,x=0,y=0,z=0){return mesh(new T.BoxGeometry(w,h,d),m,p,x,y,z)}
function sphere(r,m,p=scene,x=0,y=0,z=0){return mesh(new T.SphereGeometry(r,24,16),m,p,x,y,z)}
function cylinder(rt,rb,h,m,p=scene,x=0,y=0,z=0){return mesh(new T.CylinderGeometry(rt,rb,h,48),m,p,x,y,z)}
const textureLoader=new T.TextureLoader();
const plywoodMap=textureLoader.load('./assets/plywood.jpg');plywoodMap.colorSpace=T.SRGBColorSpace;plywoodMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
const plywoodMat=new T.MeshStandardMaterial({map:plywoodMap,bumpMap:plywoodMap,bumpScale:.008,roughness:.7});
const greenBoardMap=textureLoader.load('./assets/green-board.jpg');greenBoardMap.colorSpace=T.SRGBColorSpace;greenBoardMap.anisotropy=8;
const timber=new T.MeshPhysicalMaterial({map:plywoodMap,bumpMap:plywoodMap,bumpScale:.01,roughness:.52,color:'#72523c',clearcoat:.2,clearcoatRoughness:.35});
// Soft rectangular light sources reflected in varnish, brass and bottle glass.
const reflectionCanvas=document.createElement('canvas');reflectionCanvas.width=1024;reflectionCanvas.height=512;const reflections=reflectionCanvas.getContext('2d');const glow=reflections.createLinearGradient(0,0,0,512);glow.addColorStop(0,'#4c473d');glow.addColorStop(.5,'#81705a');glow.addColorStop(1,'#29261f');reflections.fillStyle=glow;reflections.fillRect(0,0,1024,512);reflections.fillStyle='#ffe4ad';for(const x of [130,460,790])reflections.fillRect(x,130,30,160);reflections.fillStyle='#c4cbd1';reflections.fillRect(270,170,95,100);const environment=new T.CanvasTexture(reflectionCanvas);environment.mapping=T.EquirectangularReflectionMapping;environment.colorSpace=T.SRGBColorSpace;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(environment).texture;scene.environmentIntensity=.55;environment.dispose();pmrem.dispose();
function panelMaterial(index){const map=plywoodMap.clone();map.repeat.set(.28,1);map.offset.x=(index*.173)% .72;map.needsUpdate=true;return new T.MeshPhysicalMaterial({map,bumpMap:map,bumpScale:.015,color:index%3===0?'#75543e':'#856047',roughness:.48,clearcoat:.18,clearcoatRoughness:.5})}

const tileCanvas=document.createElement('canvas');tileCanvas.width=512;tileCanvas.height=512;
const tileCtx=tileCanvas.getContext('2d');tileCtx.fillStyle='#302f2a';tileCtx.fillRect(0,0,512,512);
for(let row=0;row<4;row++)for(let col=0;col<4;col++){tileCtx.fillStyle=(row+col)%2?'#4a4434':'#3b392f';tileCtx.fillRect(col*128+3,row*128+3,122,122);tileCtx.strokeStyle='#ffffff15';tileCtx.strokeRect(col*128+5,row*128+5,118,118);}
const tileMap=new T.CanvasTexture(tileCanvas);tileMap.colorSpace=T.SRGBColorSpace;tileMap.wrapS=tileMap.wrapT=T.RepeatWrapping;tileMap.repeat.set(5,5);
const indoorShellStart=scene.children.length;
box(25,.15,24,new T.MeshStandardMaterial({map:tileMap,roughness:.86}),scene,0,-.13,-2);
box(25,8,.25,darkWood,scene,0,3.8,-10);box(.25,8,24,darkWood,scene,-12,3.8,-2);box(.25,8,24,darkWood,scene,12,3.8,-2);
// Narrow photographic boards, recessed joints, raised dado and skirting.
for(let i=0;i<34;i++){const x=-12.35+i*.74;box(.72,7.65,.09,panelMaterial(i),scene,x,3.8,-9.81)}
for(let i=0;i<32;i++){const z=-9.6+i*.74;box(.09,7.65,.72,panelMaterial(i+34),scene,-11.81,3.8,z);box(.09,7.65,.72,panelMaterial(i+66),scene,11.81,3.8,z)}
for(const y of [.16,2.2,6.9]){box(24.9,y===.16?.26:.14,.16,timber,scene,0,y,-9.69);box(.16,y===.16?.26:.14,23.8,timber,scene,-11.69,y,2);box(.16,y===.16?.26:.14,23.8,timber,scene,11.69,y,2)}
box(24,.035,.04,brass,scene,0,2.29,-9.59);

scene.add(new T.HemisphereLight('#e1d4aa','#3e3730',2.2));const sun=new T.DirectionalLight('#ffdab0',2.8);sun.position.set(-3,9,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-11,right:11,top:11,bottom:-11});sun.shadow.bias=-.001;scene.add(sun);
function lamp(x,z){cylinder(.03,.03,2,black,scene,x,6.4,z);cylinder(.28,.75,.55,mat('#31594b',.3,.3),scene,x,5.3,z);cylinder(.7,.7,.04,mat('#ffe8a6'),scene,x,5.02,z);const l=new T.PointLight('#ffd393',30,12,2);l.position.set(x,4.8,z);scene.add(l)}lamp(0,0);lamp(5,-5);lamp(-6,-6);
const indoorShell=scene.children.slice(indoorShellStart).filter(o=>!o.isLight);
const tableStart=scene.children.length;
// The round table: inlaid edge, planked top, pedestal and brass foot rail.
cylinder(2.7,2.7,.23,darkWood,scene,0,1.5,0);cylinder(2.66,2.66,.045,brass,scene,0,1.64,0);cylinder(2.58,2.58,.045,plywoodMat,scene,0,1.67,0);cylinder(.35,.55,1.35,darkWood,scene,0,.72,0);cylinder(1.15,1.35,.16,darkWood,scene,0,.12,0);
const rail=mesh(new T.TorusGeometry(1.75,.04,10,80),brass,scene,0,.36,0);rail.rotation.x=Math.PI/2;
const tableProps=createTableProps();scene.add(tableProps);const roomDecorStart=scene.children.length;
function textPanel(text,w,h,bg='#17392e',fg='#d9c290',size=70){const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,1024,512);g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(22,22,980,468);g.textAlign='center';g.textBaseline='middle';g.fillStyle=fg;g.font=`${size}px Georgia`;text.split('\n').forEach((s,i,a)=>g.fillText(s,512,256+(i-(a.length-1)/2)*100));const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}))}
const sign=textPanel('THE BITTER RADISH\nSOCIAL CLUB',5.4,2.7);sign.position.set(-3.8,4.4,-9.78);
box(4.2,2.5,.15,brass,scene,5,4.3,-9.77);
const shipMap=textureLoader.load('./assets/ship-painting.jpg');shipMap.colorSpace=T.SRGBColorSpace;
mesh(new T.PlaneGeometry(3.95,2.25),new T.MeshStandardMaterial({map:shipMap,roughness:.9}),scene,5,4.3,-9.67);
// A paneled oak bar with a polished bullnose, brass rail, and upholstered stools.
const barTop=new T.MeshPhysicalMaterial({map:plywoodMap,bumpMap:plywoodMap,bumpScale:.004,color:'#4c2c1c',roughness:.25,clearcoat:.8,clearcoatRoughness:.2});
box(4.6,1.8,1.2,timber,scene,-8,.9,-5.2);box(4.98,.16,1.52,barTop,scene,-8,1.91,-5.2);
const bullnose=cylinder(.085,.085,4.98,barTop,scene,-8,1.91,-4.44);bullnose.rotation.z=Math.PI/2;
for(let i=0;i<4;i++){const x=-9.68+i*1.12;box(1.0,1.34,.055,darkWood,scene,x,.94,-4.575);box(.86,1.17,.06,panelMaterial(i+90),scene,x,.94,-4.53);for(const y of [.31,1.57])box(1.02,.06,.07,timber,scene,x,y,-4.48)}
for(const y of [.15,1.71])box(4.72,.12,.16,timber,scene,-8,y,-4.5);
const barFoot=cylinder(.035,.035,4.55,brass,scene,-8,.34,-4.1);barFoot.rotation.z=Math.PI/2;
for(const x of [-10,-8,-6]){const support=cylinder(.022,.022,.44,brass,scene,x,.34,-4.33);support.rotation.x=Math.PI/2}
function labelMap(title,cream,ink){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');g.fillStyle=cream;g.fillRect(0,0,256,256);g.strokeStyle=ink;g.lineWidth=5;g.strokeRect(12,12,232,232);g.strokeRect(19,19,218,218);g.fillStyle=ink;g.textAlign='center';g.font='20px Georgia';g.fillText('BITTER RADISH',128,48);g.font='bold 34px Georgia';title.split(' ').forEach((word,j,all)=>g.fillText(word,128,115+j*38-(all.length-1)*15));g.font='15px Georgia';g.fillText('SMALL BATCH · No. 9',128,214);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
const labelsForBottles=[labelMap('HOUSE GIN','#d9d1b0','#20352c'),labelMap('RADISH RYE','#d8b77d','#442c1c'),labelMap('PORT LIGHT','#7c3028','#eee0bc'),labelMap('SALT OAK','#ded6be','#2b3c43')];
function bottle(parent,x,y,z,index){const g=new T.Group();parent.add(g);g.position.set(x,y,z);const k=.82+(index%4)*.12;g.scale.setScalar(k);g.rotation.y=(index%3-1)*.12;
 const profile=[[0,0],[.1,0],[.122,.025],[.122,.38],[.115,.43],[.052,.51],[.046,.64],[.055,.65],[.055,.69],[0,.69]].map(([r,y])=>new T.Vector2(r,y));
 const glass=new T.MeshPhysicalMaterial({color:['#254d2b','#9d5f24','#476753','#663f22'][index%4],roughness:.12,metalness:.04,transparent:true,opacity:.85,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.6});mesh(new T.LatheGeometry(profile,24),glass,g);
 cylinder(.038,.038,.07,index%3===0?brass:mat('#202622',.4),g,0,.69,0);cylinder(.1,.1,.28,mat(index%2?'#9e6122':'#415535',.22),g,0,.16,0);
 const label=mesh(new T.CylinderGeometry(.124,.124,.23,24,1,true,-.88,1.76),new T.MeshStandardMaterial({map:labelsForBottles[index%4],roughness:.7,side:T.DoubleSide}),g,0,.26,0);
 const seal=cylinder(.049,.049,.045,brass,g,0,.58,0);
}
for(let row=0;row<3;row++){const y=2.35+row*.85;box(4.8,.12,.76,barTop,scene,-8,y,-9.18);box(4.8,.035,.045,brass,scene,-8,y+.075,-8.79);for(let i=0;i<9;i++)bottle(scene,-9.94+i*.48,y+.07,-8.98,row*9+i)}
const backlight=new T.PointLight('#ffc178',13,7,2);backlight.position.set(-8,3.3,-8.1);scene.add(backlight);
function leatherMap(){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');g.fillStyle='#6b7561';g.fillRect(0,0,256,256);let seed=43;for(let i=0;i<16000;i++){seed=seed*16807%2147483647;const x=seed%256;seed=seed*16807%2147483647;const y=seed%256;g.fillStyle=i%2?'#15231935':'#c5c7a01a';g.fillRect(x,y,1,1)}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
const leatherTexture=leatherMap(),leather=new T.MeshPhysicalMaterial({map:leatherTexture,bumpMap:leatherTexture,bumpScale:.006,color:'#263d2d',roughness:.45,clearcoat:.12});
function strut(a,b,r,material,parent){const from=new T.Vector3(...a),to=new T.Vector3(...b),delta=to.clone().sub(from);const m=cylinder(r,r,delta.length(),material,parent);m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m}
for(const x of [-9.45,-8,-6.55]){const stool=new T.Group();scene.add(stool);stool.position.set(x,0,-3.65);
 cylinder(.37,.38,.12,timber,stool,0,1.13,0);cylinder(.365,.38,.14,leather,stool,0,1.24,0);
 const piping=mesh(new T.TorusGeometry(.365,.012,8,48),mat('#85906f',.6),stool,0,1.28,0);piping.rotation.x=Math.PI/2;
 const button=sphere(.035,leather,stool,0,1.316,0);button.scale.y=.25;
 for(let j=0;j<8;j++){const a=j*Math.PI/4;sphere(.016,brass,stool,Math.sin(a)*.365,1.19,Math.cos(a)*.365)}
 for(let j=0;j<4;j++){const a=j*Math.PI/2+Math.PI/4;strut([Math.sin(a)*.29,.055,Math.cos(a)*.29],[Math.sin(a)*.2,1.1,Math.cos(a)*.2],.045,timber,stool);cylinder(.047,.047,.08,brass,stool,Math.sin(a)*.285,.09,Math.cos(a)*.285)}
 const foot=mesh(new T.TorusGeometry(.25,.022,10,48),brass,stool,0,.47,0);foot.rotation.x=Math.PI/2;
}
function cup(parent,x,y,z,scale=1){const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);mesh(new T.CylinderGeometry(.14,.095,.34,32,1,true),new T.MeshStandardMaterial({color:'#d1c8ab',roughness:.4,side:T.DoubleSide}),g,0,.17,0);cylinder(.095,.095,.015,darkWood,g,0,.015,0);g.userData.liquid=cylinder(.124,.124,.012,mat('#b67e28',.2),g,0,.325,0);const rim=mesh(new T.TorusGeometry(.13,.014,8,30),mat('#eee6cc'),g,0,.35,0);rim.rotation.x=Math.PI/2;return g}
// A running paddle-pong game, with floating paddles and cups.
const roomDecor=scene.children.slice(roomDecorStart);
const pong=new T.Group();scene.add(pong);pong.position.set(5.1,0,-5.3);pong.rotation.y=-.12;box(4.7,.16,1.95,plywoodMat,pong,0,1.5,0);for(const x of [-1.65,1.65])for(const z of [-.62,.62]){box(.45,1.42,.45,mat('#303c35'),pong,x,.72,z);for(let j=0;j<4;j++)box(.49,.045,.49,black,pong,x,.2+j*.3,z)}box(.08,.22,2,new T.MeshStandardMaterial({map:greenBoardMap,bumpMap:greenBoardMap,bumpScale:.006,roughness:.8}),pong,0,1.69,0);cup(pong,-1.93,1.6,.42,.85);cup(pong,1.93,1.6,-.42,.85);
const graffitiCanvas=document.createElement('canvas');graffitiCanvas.width=512;graffitiCanvas.height=512;const ink=graffitiCanvas.getContext('2d');ink.translate(256,256);ink.rotate(-.2);ink.textAlign='center';ink.font='bold 85px cursive';ink.fillStyle='#1f211cce';ink.fillText('BAG',0,-15);ink.fillText('CHEW',0,80);
const inkMap=new T.CanvasTexture(graffitiCanvas);inkMap.colorSpace=T.SRGBColorSpace;const graffiti=mesh(new T.PlaneGeometry(.58,.58),new T.MeshStandardMaterial({map:inkMap,transparent:true,depthWrite:false,roughness:.95}),pong,-.75,1.585,.5);graffiti.rotation.x=-Math.PI/2;graffiti.rotation.z=.35;
function paddle(x){const g=new T.Group();pong.add(g);g.position.set(x,1.9,0);const face=cylinder(.23,.23,.06,mat('#ac7545'),g);face.rotation.z=Math.PI/2;box(.06,.35,.085,darkWood,g,0,-.32,0);return g}const p1=paddle(-2.4),p2=paddle(2.4),ball=sphere(.055,mat('#f6f0dc'),pong,0,2,0);
const personColors=['#b9c88a','#b56443','#57777b','#c2964e','#725b81','#558077','#9b5961','#7483a0','#b49c79'];
const names=HOUSE_NAMES;
let voiceIndex=-1,bubbleIndex=-1,bubbleEl=null,bubbleUntil=0,bubblesEnabled=true;
const cruiser=createCruiser();scene.add(cruiser.group);cruiser.group.visible=false;let onCruiser=false;const tubeActors=[];const airTed=createAirTed();scene.add(airTed.group);const christmasTree=createChristmasTree();scene.add(christmasTree.group);let nerf=null,beerThrows=[];
function createAvatar(character,i){
 const isBVN=character?.id==='bvn',isTichanski=character?.id==='tichanski',isBell=character?.id==='bell',isSapperstien=character?.id==='sapperstien',isMcLaen=character?.id==='mclaen',isTubby=character?.id==='tubby',isBrodeur=character?.id==='brodeur',isKomar=character?.id==='komar',isWargo=character?.id==='wargo',isPekalsky=character?.id==='pekalsky',isSaunders=character?.id==='saunders',isRose=character?.id==='rose',isMartens=character?.id==='martens',isRueben=character?.id==='rueben',isCindy=character?.id==='cindy',isColman=character?.id==='colman',isRecker=character?.id==='recker',isAtt=character?.id==='att',isWilkins=character?.id==='wilkins',isGraham=character?.id==='graham',isLefko=character?.id==='lefko',isLevitt=character?.id==='levitt',isHeard=character?.id==='heard',isDauenheimer=character?.id==='dauenheimer',isWatson=character?.id==='watson',isRooks=character?.id==='rooks';
 const shirt=mat(character?.shirt||personColors[i]);const skin=mat(character?.skin||['#d7a378','#b77a57','#ebba91','#ab7354','#d3a080','#e1b58b','#bd8e69','#d3a986','#936447'][i]);const hair=mat(character?.hair||['#514338','#5b2c1e','#2a2522','#35201c','#69675e','#a27b42','#58453c','#3c2e29','#232322'][i]);

 const avatar=new T.Group();avatar.userData.hands=[];avatar.userData.arms=[];
 const body=mesh(new T.CapsuleGeometry(.31,.45,6,16),shirt,avatar,0,1.24,0);body.scale.set(isWatson?.76:isRooks?1.5:isWargo?1.3:isBrodeur||isRose||isWilkins||isDauenheimer?1.23:isSaunders||isCindy||isRecker?.95:1.08,isRooks?.88:1,isRooks?.96:isWargo?.92:.75);
 const head=new T.Group();avatar.add(head);head.position.set(0,isRooks?1.86:1.99,.025);head.userData.restY=head.position.y;const face=sphere(.285,skin,head);face.scale.set(isWatson?.77:isRooks?1.14:isBrodeur||isWargo||isRose||isWilkins?1.08:isLevitt?1.02:isLefko||isGraham?.98:isSaunders||isMartens||isRecker?.82:isCindy?.84:isColman?.99:.85,isWargo||isRose?1.2:isPekalsky||isSaunders||isMartens||isRueben||isRecker?1.25:isCindy?1.12:1.15,isWargo?.98:.88);
 const hairTop=sphere(.29,hair,head,0,isWargo?.16:.13,isWargo?-.15:-.025);hairTop.scale.set(isWargo?1:.87,isWargo?.4:.68,isWargo?.72:.85);
 if(isWargo){
  const olive=mat('#596044'),band=mat('#3d382a');const brimGeometry=new T.RingGeometry(.23,.48,32,4);const pos=brimGeometry.attributes.position;for(let k=0;k<pos.count;k++){const a=Math.atan2(pos.getY(k),pos.getX(k)),r=Math.hypot(pos.getX(k),pos.getY(k));pos.setZ(k,Math.sin(a*3+.4)*.045*(r/.48)**2)}brimGeometry.computeVertexNormals();const brim=mesh(brimGeometry,olive,head,0,.245,-.025);brim.material.side=T.DoubleSide;brim.rotation.x=-Math.PI/2;brim.scale.z=1.1;
  const crown=mesh(new T.CylinderGeometry(.23,.29,.2,24),olive,head,0,.355,-.025);crown.scale.z=1.04;const hatTop=sphere(.235,olive,head,0,.46,-.025);hatTop.scale.set(1,.16,1.04);cylinder(.291,.292,.045,band,head,0,.285,-.025);
 }
 if(isWatson){hairTop.position.set(0,.18,-.025);hairTop.scale.set(.88,.62,.93);const sweep=sphere(.16,hair,head,-.08,.23,.08);sweep.scale.set(1,.4,.75);}
 if(isRooks){hairTop.position.set(0,.2,-.045);hairTop.scale.set(1.08,.42,.98);}

 if(isLevitt){hairTop.position.set(0,.23,-.04);hairTop.scale.set(1,.74,.98);for(let j=0;j<7;j++){const tuft=sphere(.09,j%2?hair:mat('#b1b1a4'),head,-.21+j*.07,.28+(j%3)*.025,-.01);tuft.scale.set(.48,1.1,1.05);}}
 if(isColman){hairTop.position.set(0,.21,-.055);hairTop.scale.set(1.13,.83,1.1);for(let k=0;k<22;k++){const a=k*2.399,r=.12+(k%4)*.047;const curl=sphere(.072,k%3?hair:mat('#b0afa0'),head,Math.cos(a)*r,.21+Math.sin(a)*.055+((k%3)*.043),-.025+Math.sin(a)*.18);curl.scale.set(.8,1.1,.65);curl.rotation.z=a;}for(const side of [-1,1]){const sideburn=sphere(.1,hair,head,side*.24,.035,-.035);sideburn.scale.set(.45,1.25,.8);const brow=box(.12,.034,.022,mat('#555044'),head,side*.102,.112,.255);brow.rotation.z=side*-.1;}for(let k=0;k<38;k++){const a=k*2.399,r=.035+Math.sqrt(k/38)*.14;const x=Math.cos(a)*r,y=-.19+Math.sin(a)*r*.46;if(y>-.14&&Math.abs(x)<.11)continue;const stubble=sphere(.007,k%2?mat('#8f887b'):mat('#b6afa0'),head,x,y,.253);stubble.scale.z=.35;}}
 if(isAtt){hairTop.scale.set(.94,.35,.9);hairTop.position.y=.15;const beard=sphere(.165,hair,head,0,-.19,.11);beard.scale.set(.92,.75,.78);const moustache=box(.17,.028,.024,hair,head,0,-.095,.27);}
 if(isWilkins){hairTop.position.set(0,.2,-.055);hairTop.scale.set(1.08,.58,.98);for(let k=0;k<11;k++){const strand=mesh(new T.CapsuleGeometry(.025,.11+(k%3)*.02,3,6),k%2?hair:mat('#b6b8ad'),head,-.24+k*.048,.27+Math.sin(k*1.7)*.025,-.015+(k%3)*.04);strand.rotation.z=(k-5)*-.13;strand.rotation.x=.25;}}
 if(isHeard||isDauenheimer){hairTop.visible=false;for(const side of [-1,1]){const sideHair=sphere(.15,hair,head,side*.235,.075,-.075);sideHair.scale.set(.36,1.1,1.1);}const backHair=sphere(.22,hair,head,0,.09,-.19);backHair.scale.set(1.05,.65,.48);}
 if(isDauenheimer){const beard=sphere(.205,hair,head,0,-.17,.145);beard.scale.set(1.12,.95,.62);for(let k=0;k<27;k++){const a=k*2.399,rad=.035+Math.sqrt(k/27)*.13;const fleck=sphere(.012,k%3?mat('#a1a199'):hair,head,Math.cos(a)*rad,-.17+Math.sin(a)*rad*.78,.264);fleck.scale.set(.8,1.2,.45);}const mustache=box(.19,.028,.026,hair,head,0,-.095,.278);}
 if(isLefko){hairTop.scale.set(1,.35,.95);const cap=mat('#8c3446');const crown=mesh(new T.SphereGeometry(.31,24,16,0,Math.PI*2,0,Math.PI/2),cap,head,0,.16,-.015);crown.scale.y=.78;const brim=sphere(.32,cap,head,0,.18,.24);brim.scale.set(1.05,.065,.75);for(let k=0;k<6;k++)box(.017,.018,.008,mat('#ddcdb3'),head,-.055+k*.022,.29+Math.sin(k/5*Math.PI)*.015,.26);}
 if(isRose){hairTop.position.set(0,.18,-.08);hairTop.scale.set(1.06,.55,.96);for(let k=0;k<5;k++){const strand=sphere(.1,hair,head,-.18+k*.09,.25,-.03);strand.scale.set(.4,.75,1.25)}}
 if(isMartens){hairTop.position.y=.21;hairTop.scale.set(.97,.72,1);const sweep=sphere(.21,hair,head,-.08,.25,.05);sweep.scale.set(1,.45,.85)}
 if(isRueben){hairTop.position.y=.23;hairTop.scale.set(1.18,1.05,1.1);for(let k=0;k<9;k++){const curl=sphere(.11,hair,head,Math.sin(k*2.4)*.23,.2+(k%3)*.065,Math.cos(k*2.4)*.16);curl.scale.y=.85}}
 if(isBVN){hairTop.scale.set(1.1,.8,1);for(let k=0;k<7;k++){const tuft=sphere(.07,hair,head,-.2+k*.06,.25,.08);tuft.scale.set(1,1.3,.7);}box(.28,.56,.035,mat('#eeeee5'),avatar,0,1.36,.26);for(const side of [-1,1]){const lapel=box(.14,.43,.035,shirt,avatar,side*.18,1.43,.28);lapel.rotation.z=side*.25;}box(.065,.4,.025,mat('#202e46'),avatar,0,1.36,.3);}
 if(isTichanski){hairTop.position.set(0,.22,-.045);hairTop.scale.set(1.13,.88,1.08);for(let k=0;k<8;k++){const fringe=sphere(.07,hair,head,-.2+k*.056,.19+(k%2)*.025,.17);fringe.scale.set(.7,1.2,.7);}const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#c7d6dd';ctx.fillRect(0,0,64,64);ctx.fillStyle='#7d9aa9';for(let x=0;x<64;x+=8)ctx.fillRect(x,0,2,64);shirt.map=new T.CanvasTexture(c);shirt.map.colorSpace=T.SRGBColorSpace;for(const side of [-1,1]){const collar=box(.14,.15,.024,shirt,avatar,side*.075,1.62,.275);collar.rotation.z=side*.4;}const tie=mat('#d7c873');const knot=box(.075,.075,.025,tie,avatar,0,1.58,.29);knot.rotation.z=Math.PI/4;const shape=new T.Shape();shape.moveTo(-.03,0);shape.lineTo(-.06,-.38);shape.lineTo(0,-.44);shape.lineTo(.06,-.38);shape.lineTo(.03,0);shape.closePath();mesh(new T.ShapeGeometry(shape),tie,avatar,0,1.53,.3);for(let k=0;k<6;k++){const dot=mesh(new T.TorusGeometry(.009,.003,4,8),mat('#665c3d'),avatar,(k%2?-.022:.018),1.49-k*.06,.305);dot.scale.y=.7;}}
 if(isBell){hairTop.scale.set(1,.3,.9);const cap=mat('#a63e4f');const crown=mesh(new T.SphereGeometry(.315,20,12,0,Math.PI*2,0,Math.PI/2),cap,head,0,.18,-.015);crown.scale.y=.75;const brim=sphere(.33,cap,head,0,.19,.24);brim.scale.set(1.05,.065,.78);for(const side of [-1,1]){const rim=mesh(new T.TorusGeometry(.088,.007,6,24),mat('#b9bcb5',.25,.6),head,side*.115,.035,.288);rim.scale.set(1,.66,1);box(.013,.017,.17,brass,head,side*.215,.035,.19);const collar=box(.14,.1,.018,shirt,avatar,side*.08,1.62,.26);collar.rotation.z=side*.4;}box(.055,.012,.016,brass,head,0,.045,.29);box(.15,.13,.02,mat('#eceadf'),avatar,0,1.6,.25);}
 if(isSapperstien){hairTop.visible=false;for(const side of [-1,1]){const sideHair=sphere(.16,hair,head,side*.225,.075,-.08);sideHair.scale.set(.35,1,.95);const collar=box(.14,.12,.022,shirt,avatar,side*.07,1.63,.26);collar.rotation.z=side*.4;}const beard=sphere(.19,hair,head,0,-.19,.12);beard.scale.set(1,.62,.68);for(let k=0;k<18;k++){const a=k*2.4;const salt=sphere(.009,mat('#b2b0a4'),head,Math.sin(a)*.13,-.2+Math.cos(a)*.05,.23);salt.scale.z=.4;}const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#688070';ctx.fillRect(0,0,64,64);ctx.fillStyle='#d1d4c0';for(let j=0;j<64;j+=8){ctx.fillRect(j,0,2,64);ctx.fillRect(0,j,64,2);}shirt.map=new T.CanvasTexture(c);shirt.map.colorSpace=T.SRGBColorSpace;for(let j=0;j<5;j++)sphere(.012,mat('#e7dfcd'),avatar,0,1.55-j*.09,.27);}
 if(isMcLaen){hairTop.visible=false;const beard=sphere(.21,hair,head,0,-.29,.15);beard.scale.set(.83,1.65,.7);const tip=mesh(new T.ConeGeometry(.14,.38,16),hair,head,0,-.56,.15);tip.rotation.z=Math.PI;for(let k=0;k<16;k++){const strand=mesh(new T.CapsuleGeometry(.009,.26+(k%4)*.035,2,5),k%3?hair:mat('#ede8d5'),head,(k-7.5)*.016,-.4,.26-Math.abs(k-7.5)*.008);strand.rotation.z=(k-7.5)*-.015;}for(const side of [-1,1]){const moustache=sphere(.085,hair,head,side*.07,-.1,.246);moustache.scale.set(1,.25,.45);}const c=document.createElement('canvas');c.width=320;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#b75a42';ctx.fillRect(38,50,242,13);ctx.fillStyle='#bba54d';ctx.fillRect(38,99,242,10);ctx.fillStyle='#34372c';ctx.font='bold 25px sans-serif';ctx.textAlign='center';ctx.fillText('ACROSS THE YEARS',160,91);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(.48,.24),new T.MeshStandardMaterial({map,transparent:true,depthWrite:false}),avatar,0,1.37,.27);}
 if(isTubby){hairTop.position.set(0,.18,-.045);hairTop.scale.set(1.05,.66,1);for(const side of [-1,1]){const wave=sphere(.19,hair,head,side*.13,.235,.065);wave.scale.set(.9,.47,.9);wave.rotation.z=-side*.28;const collar=box(.13,.14,.023,mat('#a3cfde'),avatar,side*.066,1.64,.271);collar.rotation.z=side*.45;const lapel=box(.11,.36,.025,shirt,avatar,side*.18,1.43,.28);lapel.rotation.z=side*.17;}box(.26,.56,.022,mat('#99c3d5'),avatar,0,1.34,.264);const tie=mat('#d8bfc3');const knot=box(.069,.08,.025,tie,avatar,0,1.59,.29);knot.rotation.z=Math.PI/4;const shape=new T.Shape();shape.moveTo(-.03,0);shape.lineTo(-.055,-.36);shape.lineTo(0,-.42);shape.lineTo(.055,-.36);shape.lineTo(.03,0);shape.closePath();mesh(new T.ShapeGeometry(shape),tie,avatar,0,1.54,.3);for(let k=0;k<5;k++){const dot=box(.014,.014,.004,mat('#65777b'),avatar,(k%2?-.014:.014),1.49-k*.065,.304);dot.rotation.z=Math.PI/4;}}
 if(isBrodeur){hairTop.visible=false;const beard=mesh(new T.SphereGeometry(.16,18,12),hair,head,0,-.185,.16);beard.scale.set(.82,.8,.62);const chin=mesh(new T.SphereGeometry(.115,16,10),mat('#9a978e'),head,0,-.245,.2);chin.scale.set(.78,.53,.4);for(const side of [-1,1]){const moustache=box(.083,.026,.025,hair,head,side*.045,-.095,.268);moustache.rotation.z=side*.17;const collar=box(.14,.14,.022,shirt,avatar,side*.075,1.64,.25);collar.rotation.z=side*.4;}const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e8e3d7';ctx.fillRect(0,0,128,128);for(let k=0;k<128;k+=32){ctx.fillStyle='#35537899';ctx.fillRect(k,0,12,128);ctx.fillRect(0,k,128,12);ctx.fillStyle='#ad344acc';ctx.fillRect(k+18,0,5,128);ctx.fillRect(0,k+18,128,5);}shirt.map=new T.CanvasTexture(c);shirt.map.colorSpace=T.SRGBColorSpace;for(let k=0;k<5;k++)sphere(.013,mat('#ece8da'),avatar,0,1.55-k*.09,.27);}
 if(isKomar){hairTop.position.set(0,.2,-.04);hairTop.scale.set(.94,.4,.87);for(const side of [-1,1]){const frame=mat('#3b3028',.4);const lens=new T.MeshPhysicalMaterial({color:'#c3c4b1',transparent:true,opacity:.15,roughness:.12});for(const y of [-.018,.098])box(.195,.018,.022,frame,head,side*.112,y,.286);for(const x of [-.095,.095])box(.018,.12,.022,frame,head,side*.112+x,.04,.286);box(.17,.09,.012,lens,head,side*.112,.04,.29);box(.018,.02,.19,frame,head,side*.217,.05,.19);const collar=box(.14,.14,.022,shirt,avatar,side*.075,1.64,.25);collar.rotation.z=side*.4;box(.19,.085,.14,mat('#eee5cf'),avatar,side*.36,1.57,.34);}box(.05,.02,.023,black,head,0,.055,.291);box(.017,.48,.025,mat('#b8ad91'),avatar,0,1.36,.26);for(let j=0;j<5;j++)sphere(.012,mat('#f2eddf'),avatar,0,1.55-j*.09,.281);}
 if(isCindy){
  hairTop.position.set(0,.15,-.075);hairTop.scale.set(1.06,.84,1.04);
  for(const side of [-1,1])for(let k=0;k<5;k++){
   const x=side*(.21+k*.023),z=-.085+k*.034;
   const curve=new T.CatmullRomCurve3([new T.Vector3(x*.7,.23,z-.03),new T.Vector3(x+side*.035,.07,z+.025),new T.Vector3(x-side*.025,-.12,z),new T.Vector3(x+side*.045,-.31,z-.015),new T.Vector3(x+side*.015,-.47+(k%2)*.06,z+.03)]);
   const lock=mesh(new T.TubeGeometry(curve,16,.047,8,false),k%2?hair:mat('#49302b'),head);lock.scale.z=.85;
  }
  const fringe=sphere(.2,hair,head,-.085,.235,.075);fringe.scale.set(1,.4,.55);fringe.rotation.z=.2;
  for(const side of [-1,1])mesh(new T.TorusGeometry(.055,.009,8,24),brass,head,side*.247,-.135,.105);
 }

 if(isPekalsky){hairTop.position.y=.19;hairTop.scale.set(1,.9,.95);const fringe=sphere(.17,hair,head,-.07,.24,.1);fringe.scale.set(1,.65,.6)}
 if(isWargo){for(const side of [-1,1]){const sideHair=sphere(.12,hair,head,side*.263,.075,-.035);sideHair.scale.set(.35,1.5,.95)}}else if(!character&&i%3===1){sphere(.16,hair,head,0,.16,-.24)}
 sphere(.065,skin,head,-.255,0,0);sphere(.065,skin,head,.255,0,0);const nose=sphere(isCindy?.041:.058,skin,head,0,-.035,.255);if(isCindy){nose.scale.set(.8,1,.8);for(const side of [-1,1]){const cheek=sphere(.055,mat('#d69b87'),head,side*.16,-.072,.218);cheek.scale.set(1,.55,.22);}}
 for(const x of [-.1,.1]){const eye=sphere(.047,mat('#ede8d8'),head,x,.025,.235);const iris=sphere(isCindy?.019:.022,isCindy?mat('#4f5740'):black,head,x,.025,.274);const brow=box(isCindy?.075:.09,isCindy?.012:.025,.025,hair,head,x,.115,.25);brow.rotation.z=x<0?.1:-.1;if(isCindy){eye.scale.set(.9,.48,.45);iris.scale.set(.95,.85,.4);const lash=box(.075,.008,.012,mat('#40352d'),head,x,.052,.268);lash.rotation.z=x<0?.07:-.07;}}
 const mouth=isTichanski||isBell||isSapperstien||isTubby||isWargo||isRose||isMartens||isRueben||isCindy||isColman||isRecker||isWilkins||isDauenheimer?mesh(new T.TorusGeometry(.085,.013,8,24,Math.PI),mat('#6b3d32'),head,0,-.135,.282):box(.11,.023,.025,mat('#663a2c'),head,0,-.14,.247);
 if(isTichanski||isBell||isSapperstien||isTubby||isRose||isMartens||isRueben||isCindy||isColman||isRecker||isWilkins||isDauenheimer){mouth.rotation.z=Math.PI;box(.12,.024,.014,mat('#f1e8da'),head,0,-.154,.286);}
 if(isWargo){mouth.rotation.z=Math.PI;box(.12,.023,.015,mat('#e7dbc7'),head,0,-.155,.288);for(const side of [-1,1]){box(.22,.135,.035,mat('#171b1b',.14,.16),head,side*.124,.036,.29);box(.025,.035,.22,black,head,side*.255,.046,.19)}box(.06,.03,.03,black,head,0,.05,.3);}

 if(!character&&(i===2||i===6)){const glasses=brass;for(const x of [-.1,.1]){const r=mesh(new T.TorusGeometry(.07,.012,6,20),glasses,head,x,.03,.28)}box(.06,.012,.012,glasses,head,0,.03,.28)}

 if(isPekalsky){const text=document.createElement('canvas');text.width=256;text.height=100;const cg=text.getContext('2d');cg.textAlign='center';cg.fillStyle='#d1bf75';cg.font='bold 23px Georgia';cg.fillText('SQUAM LAKES',128,46);cg.font='12px Georgia';cg.fillText('RECREATION CLUB',128,68);const map=new T.CanvasTexture(text);map.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(.42,.18),new T.MeshStandardMaterial({map,transparent:true,depthWrite:false}),avatar,0,1.43,.258);}
 if(isSaunders||isRecker||isGraham){const cap=mat('#283d78',.75);const crown=mesh(new T.SphereGeometry(.31,24,16,0,Math.PI*2,0,Math.PI/2),cap,head,0,.17,-.01);crown.scale.y=.75;const brim=sphere(.32,cap,head,0,.18,.24);brim.scale.set(1.05,.065,.74);const patch=document.createElement('canvas');patch.width=128;patch.height=128;const cg=patch.getContext('2d');cg.font='bold 90px Georgia';cg.textAlign='center';cg.lineWidth=5;cg.strokeStyle='#e2d8c6';cg.strokeText(isGraham?'T':'C',64,95);cg.fillStyle='#b8483b';cg.fillText(isGraham?'T':'C',64,95);const map=new T.CanvasTexture(patch);map.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(.15,.15),new T.MeshStandardMaterial({map,transparent:true,depthWrite:false}),head,0,.3,.245);
 for(const side of [-1,1]){box(.105,.07,.02,black,avatar,side*.06,1.48,.255)}box(.04,.012,.015,black,avatar,0,1.5,.265);box(.014,.16,.015,black,avatar,.1,1.56,.25);box(.07,.11,.025,mat('#8e8779'),avatar,0,1.57,.23);for(let j=0;j<2;j++)sphere(.014,brass,avatar,0,1.59-j*.05,.25);
 }

 if(isRueben){const frame=mat('#f0eee3',.4);for(const side of [-1,1]){box(.22,.16,.04,frame,head,side*.118,.035,.277);box(.174,.116,.014,mat('#25212a',.1),head,side*.118,.035,.302);box(.023,.034,.22,frame,head,side*.24,.06,.18)}box(.055,.032,.03,frame,head,0,.06,.3);const label=document.createElement('canvas');label.width=256;label.height=128;const cg=label.getContext('2d');cg.fillStyle='#2d4c83';cg.font='bold 27px sans-serif';cg.textAlign='center';cg.fillText('new balance',128,61);cg.fillRect(25,80,206,5);const map=new T.CanvasTexture(label);map.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(.48,.24),new T.MeshStandardMaterial({map,transparent:true,depthWrite:false}),avatar,0,1.4,.255);}
 if(isColman){for(const side of [-1,1]){const collar=box(.13,.12,.018,shirt,avatar,side*.065,1.63,.25);collar.rotation.z=side*.45}for(let j=0;j<3;j++)sphere(.014,mat('#ded9c9'),avatar,0,1.55-j*.075,.26);}
 if(isCindy){const neckline=mesh(new T.TorusGeometry(.13,.012,6,24,Math.PI),mat('#292a30'),avatar,0,1.62,.255);neckline.rotation.z=Math.PI;}

 if(isRose){const cap=mat('#872f3c',.8);const crown=mesh(new T.SphereGeometry(.33,24,16,0,Math.PI*2,0,Math.PI/2),cap,head,0,.17,-.015);crown.scale.y=.7;const brim=sphere(.34,cap,head,0,.18,.25);brim.scale.set(1.1,.06,.75);const patch=box(.19,.055,.012,mat('#bca895'),head,0,.295,.26);for(const side of [-1,1]){const collar=box(.13,.1,.02,shirt,avatar,side*.065,1.64,.25);collar.rotation.z=side*.4;}}
 if(isMartens||isRecker||isAtt||isHeard||isGraham){const glass=mat('#151a1b',.13,.15);for(const side of [-1,1]){box(.2,.11,.035,glass,head,side*.115,.035,.288);box(.02,.025,.2,black,head,side*.238,.045,.19)}box(.05,.025,.03,black,head,0,.05,.3);}
 if(isMartens){const c=document.createElement('canvas');c.width=320;c.height=180;const cg=c.getContext('2d');cg.fillStyle='#e4d9c7';cg.textAlign='center';cg.font='bold 35px Georgia';cg.fillText('NANTUCKET',160,64);cg.beginPath();cg.ellipse(155,110,39,18,0,0,Math.PI*2);cg.fill();cg.fillRect(129,115,8,23);cg.fillRect(176,115,8,23);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(.48,.25),new T.MeshStandardMaterial({map,transparent:true,depthWrite:false}),avatar,0,1.41,.26);}


 if(isLefko){const lens=new T.MeshPhysicalMaterial({color:'#a8b6b3',transparent:true,opacity:.23,roughness:.08});const frame=mat('#aea28a',.3,.5);for(const side of [-1,1]){const x=side*.115;const rim=mesh(new T.TorusGeometry(.084,.008,6,24),frame,head,x,.035,.285);rim.scale.y=.7;const glass=mesh(new T.CircleGeometry(.076,20),lens,head,x,.035,.286);glass.scale.y=.7;box(.012,.02,.18,frame,head,side*.22,.035,.2);}box(.055,.011,.014,frame,head,0,.04,.29);}
 if(isDauenheimer){const c=document.createElement('canvas');c.width=256;c.height=200;const cg=c.getContext('2d');cg.textAlign='center';cg.fillStyle='#cfd4ce';cg.font='30px sans-serif';for(const [j,line] of ['COAST','GUARD','PARK'].entries())cg.fillText(line,128,60+j*40);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(.42,.32),new T.MeshStandardMaterial({map,transparent:true,depthWrite:false}),avatar,0,1.4,.26);}

 if(isLevitt){for(const side of [-1,1]){const frame=box(.21,.115,.025,black,head,side*.115,.42,-.045);frame.rotation.x=1.05;const lens=box(.17,.08,.014,mat('#3b385e',.12,.15),head,side*.115,.433,-.018);lens.rotation.x=1.05;}box(.06,.02,.02,black,head,0,.43,-.04);}
 if(isGraham||isLevitt){const c=document.createElement('canvas');c.width=256;c.height=150;const cg=c.getContext('2d');cg.textAlign='center';cg.fillStyle=isGraham?'#e9e6d9':'#e0d0b6';cg.font=isGraham?'bold 54px sans-serif':'bold 42px Georgia';cg.fillText(isGraham?'DVL':'CREW',128,85);cg.fillRect(38,104,180,4);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(.43,.25),new T.MeshStandardMaterial({map,transparent:true,depthWrite:false}),avatar,0,1.42,.26);}
 if(isWatson||isRooks){
  if(isRooks){const apron=mat('#29352f');box(.56,.66,.045,apron,avatar,0,1.25,.285);box(.34,.18,.025,mat('#3f4b40'),avatar,0,1.06,.32);for(const side of [-1,1]){const strap=box(.06,.38,.025,apron,avatar,side*.16,1.57,.26);strap.rotation.z=side*.3;}const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#a65b42';ctx.fillRect(0,0,128,128);ctx.fillStyle='#ead2ae';for(let k=0;k<128;k+=24){ctx.fillRect(k,0,3,128);ctx.fillRect(0,k,128,3);}shirt.map=new T.CanvasTexture(c);shirt.map.colorSpace=T.SRGBColorSpace;}
  const c=document.createElement('canvas');c.width=320;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#dfc483';ctx.textAlign='center';ctx.font=isWatson?'bold 37px Georgia':'bold 36px sans-serif';ctx.fillText(isWatson?'WEST POINT':'PIT BOSS',160,67);ctx.font='bold 28px sans-serif';ctx.fillText(isWatson?'★ ARMY ★':'BARBECUE',160,111);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(isWatson?.39:.44,.22),new T.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false}),avatar,0,1.42,isRooks?.315:.258);
 }

 // Arms rest toward the table; hands are visible on the near edge.
 for(const s of [-1,1]){const arm=mesh(new T.CapsuleGeometry(.1,.38,4,12),isMcLaen?mat('#486995'):shirt,avatar,s*.34,1.58,.19);arm.rotation.x=-.9;arm.rotation.z=-s*.15;avatar.userData.arms.push(arm);if(isHeard){const sleeve=mesh(new T.CapsuleGeometry(.083,.22,4,10),shirt,avatar,s*.365,1.67,.36);sleeve.rotation.x=-1.1;}const hand=new T.Group();hand.position.set(s*.38,1.73,.49);hand.rotation.x=-.1;hand.rotation.y=-s*.14;avatar.add(hand);avatar.userData.hands.push(hand);
 const palm=mesh(new T.CapsuleGeometry(.062,.09,3,8),skin,hand);palm.rotation.x=Math.PI/2;palm.scale.set(1,.95,.48);
 for(let f=0;f<4;f++){const finger=mesh(new T.CapsuleGeometry(.015,.055-Math.abs(f-1.5)*.012,2,6),skin,hand,(f-1.5)*.03,0,.085);finger.rotation.x=Math.PI/2;}
 const thumb=mesh(new T.CapsuleGeometry(.022,.045,2,6),skin,hand,-s*.073,-.008,.025);thumb.rotation.x=Math.PI/2;thumb.rotation.z=s*.55;if(isWargo||isSaunders||isRose||isMartens||isGraham||isLefko||isDauenheimer){box(.235,.27,.25,mat(isSaunders?'#c77067':isMartens?'#d3cbb5':isGraham?'#387483':isDauenheimer?'#313136':'#a59b75'),avatar,s*.2,.65,.16);cylinder(.085,.075,.4,skin,avatar,s*.2,.32,.18);}else box(.18,.62,.2,mat(isKomar?'#375774':isWilkins?'#a89c80':'#303c3b'),avatar,s*.18,.48,.16);box(.2,.12,.35,black,avatar,s*(isWargo||isSaunders||isRose||isMartens||isGraham||isLefko||isDauenheimer?.2:.18),.12,.24)}
 if(isCindy){body.scale.set(.88,1,.72);for(let j=0;j<2;j++){const side=j===0?-1:1;const arm=avatar.userData.arms[j],hand=avatar.userData.hands[j];arm.position.set(side*.31,1.35,0);arm.rotation.set(0,0,side*.09);hand.position.set(side*.34,1.04,.03);hand.rotation.set(0,0,0);}for(const side of [-1,1]){box(.17,.93,.2,black,avatar,side*.15,.55,.02);box(.19,.12,.32,black,avatar,side*.15,.12,.1);}avatar.scale.set(.96,1.17,.96);}
 if(isRueben||isColman)attachCelebrationRig(avatar,character.id,skin);
 if(isAtt)attachAttRig(avatar,skin);
 if(isMartens)attachHairFire(head);
 if(isKomar)attachGeneralRig(avatar,shirt);
 if(isSaunders)attachSafetyRig(avatar,avatar.userData.arms,avatar.userData.hands,skin);
 return {avatar,head,mouth};
}
function createCompanion(character){
 if(character?.id!=='graham')return null;
 const {avatar}=createAvatar(SUPPORTING_CHARACTERS.cindy,0);avatar.name='Cindy · Graham’s companion';avatar.position.set(.95,.12,-.55);avatar.rotation.y=-.14;avatar.userData.chairSide=true;avatar.userData.supporting=true;return avatar;
}
let tubbyCDs=null;
let jointProp=null,gagIndex=-1,gagNotice=null;
const pongActors=[];let backgroundSmoker=null;
function refreshBackgroundSmoker(){if(backgroundSmoker){scene.remove(backgroundSmoker.avatar);backgroundSmoker.avatar.traverse(o=>{o.geometry?.dispose();});backgroundSmoker=null;}if(!people.some(p=>['levitt','sapperstien'].includes(p.characterId)))return;const used=new Set([...people.map(p=>p.characterId),...pongActors.map(p=>p.avatar.userData.characterId)]);const profile=Object.values(CHARACTERS).find(c=>!used.has(c.id));const actor=createAvatar(profile,31);actor.avatar.userData.characterId=profile.id;actor.avatar.position.set(-4.8,0,-4.2);actor.avatar.rotation.y=.4;actor.avatar.name='Background smoker';scene.add(actor.avatar);backgroundSmoker=attachBackgroundSmoke(actor.avatar);}

export function setPongPlayers(){
 const chosen=choosePongCast(people.map(p=>p.characterId));for(const r of tubeActors){r.avatar.removeFromParent();scene.remove(r.group);r.group.traverse(o=>{if(o!==r.avatar)o.geometry?.dispose();});}tubeActors.length=0;
 pong.add(p1,p2);p1.visible=p2.visible=!onCruiser;for(const actor of pongActors){actor.danceRig.group.traverse(o=>o.geometry?.dispose());actor.danceRig.group.removeFromParent();actor.avatar.removeFromParent();actor.avatar.traverse(o=>o.geometry?.dispose())}pongActors.length=0;
 for(const [j,id] of chosen.entries()){
  const actor=createAvatar(CHARACTERS[id]||CHARACTERS.wargo,j+1),side=j===0?-1:1;actor.avatar.position.set(side*3.02,0,0);actor.avatar.rotation.y=-side*Math.PI/2;actor.avatar.userData.characterId=id;pong.add(actor.avatar);const companion=createCompanion(CHARACTERS[id]);if(companion)actor.avatar.add(companion);
  const hand=actor.avatar.userData.hands[j===0?1:0],racket=j===0?p1:p2;hand.add(racket);racket.position.set(0,.22,.09);racket.rotation.set(0,Math.PI/2,0);
  if(onCruiser){const tube=createTube(scene,actor.avatar,j);tubeActors.push(tube);}
  const danceRig=createDanceRig(actor.avatar.parent,actor.avatar,j+20);const companionDance=null;pongActors.push({...actor,hand,side,danceRig,companionDance,companion});
 }
}
export function seatPlayers(n){clearTreeCrew(christmasTree);cancelSantaDance(santaDance);for(const p of people){scene.remove(p.group);p.label.remove();p.group.traverse(o=>{if(o.geometry)o.geometry.dispose()})}people.length=0;clearBubble();for(let i=0;i<n;i++){
 const angle=i*Math.PI*2/n;const g=new T.Group();scene.add(g);g.position.set(-Math.sin(angle)*3.25,0,Math.cos(angle)*3.25);g.rotation.y=Math.PI+angle*-1;
 // Face the center using a local forward axis of +z.
 g.lookAt(0,0,0);
 const character=CHARACTERS[seatCast[i]];
 const chairSeat=box(.78,.12,.75,darkWood,g,0,.72,0);const chairBack=box(.8,.9,.13,green,g,0,1.18,-.37);for(const x of [-.28,.28])for(const z of [-.27,.27])box(.07,.72,.07,darkWood,g,x,.36,z);
 const {avatar,head,mouth}=createAvatar(character,i);g.add(avatar);const vomitRig=createVomitRig(g,avatar);const danceRig=createDanceRig(g,avatar,i*1.7);
 const companion=createCompanion(character);if(companion)g.add(companion);const companionDance=companion?createDanceRig(g,companion,i+10):null;
 const smoker=character?.id==='rooks'?createSmoker():null;if(smoker)g.add(smoker);
 const ribPlate=character?.id==='rooks'?createRibPlate():null;if(ribPlate)g.add(ribPlate);
 const pizza=character?.id==='rueben'?createPizza():null;if(pizza)g.add(pizza);
 const beerCup=cup(g,.48,1.69,.86,.85);
 const label=document.createElement('div');label.className='seat-label'+(i===0?' you':'');label.textContent=i===0?'YOU':character?.name||names[i];labels.append(label);
 const ring=mesh(new T.TorusGeometry(.48,.025,8,48),new T.MeshBasicMaterial({color:'#d5e79f',transparent:true,opacity:0}),g,0,.06,0);ring.rotation.x=Math.PI/2;
 people.push({group:g,avatar,companion,ribPlate,smoker,vomitRig,danceRig,companionDance,characterId:character?.id,chairSeat,chairBack,away:false,head,mouth,ring,label,name:character?.name||names[i],seed:i*1.6,beerCup,fill:1,flags:0,crushedCount:0,flagMarker:null,drinkUntil:0});
}active=-1;gagIndex=-1;if(gagNotice){gagNotice.remove();gagNotice=null;}if(jointProp){scene.remove(jointProp);jointProp.traverse(o=>o.geometry?.dispose());jointProp=null;}if(people.some(p=>['levitt','sapperstien'].includes(p.characterId))){jointProp=createJointProp();scene.add(jointProp);}if(tubbyCDs){scene.remove(tubbyCDs);tubbyCDs.traverse(o=>o.geometry?.dispose());}tubbyCDs=createTubbyCDs(people.map(p=>p.characterId));if(tubbyCDs)scene.add(tubbyCDs);onCruiser=needsCruiser(people.map(p=>p.characterId));placeTubbyCDs(tubbyCDs,onCruiser);for(const o of [...indoorShell,...roomDecor])o.visible=!onCruiser;pong.visible=!onCruiser;cruiser.group.visible=onCruiser;scene.background.set(onCruiser?'#9dcedc':'#201b19');scene.fog.color.set(onCruiser?'#9dcedc':'#211d19');tableProps.getObjectByName('Mr. Beams spotlight').visible=needsSpotlight(people.map(p=>p.characterId));if(nerf){scene.remove(nerf.group);nerf.hoop.removeFromParent();nerf=null;}for(const r of beerThrows)r.group.removeFromParent();beerThrows=[];const pair=nerfPair(people);if(pair)nerf=createNerf(scene,pair);setPongPlayers();refreshBackgroundSmoker();resize();}

export function clearFlags(){for(let i=0;i<people.length;i++){const p=people[i];if(p.flagMarker){p.group.remove(p.flagMarker);p.flagMarker.traverse(o=>{if(o.geometry)o.geometry.dispose()});p.flagMarker=null}p.flags=0;p.crushedCount=0;p.label.textContent=p.away?p.name+' ◇':i===0?'YOU':p.name;}}
export function playerDrinks(i,{flag=false,chug=false}={}){
 const p=people[i];if(!p)return;
 p.drinkStart=performance.now();p.drinkUntil=p.drinkStart+(chug?4400:1250);
 p.fill=chug?0:Math.max(.12,p.fill-.18);p.beerCup.userData.liquid.position.y=.045+.28*p.fill;
 if(flag){p.flags=1;p.crushedCount++;const marker=new T.Group();p.group.add(marker);p.flagMarker=marker;
 cylinder(.015,.015,.65,brass,marker,.32,2.88,0);
 const banner=box(.42,.25,.025,mat('#d7dc95'),marker,.52,3.04,0);banner.rotation.z=-.08;
 const crushed=cup(marker,-.43,1.71,.85,.8);crushed.scale.y=.26;crushed.rotation.z=.24;
 p.label.textContent=(i===0?'YOU':p.name)+' ⚑';
 }
 if(chug){setTimeout(()=>{if(people[i]===p){p.fill=1;p.beerCup.userData.liquid.position.y=.325}},4500)}
}
export function setAway(i,away){const p=people[i];if(!p)return;p.away=away;p.avatar.visible=!away;if(p.companion)p.companion.visible=!away;p.chairSeat.material=away?brass:darkWood;p.chairBack.material=away?brass:green;p.label.textContent=away?p.name+' ◇':(i===0?'YOU':p.name)+(p.flags?' ⚑':'');p.label.classList.toggle('golden',away);}
export function refereeSafety(){const p=people.find(person=>person.name==='Saunders'&&!person.away);if(!p)return false;const r=p.avatar.userData.safetyRig;r.start=performance.now();r.until=r.start+2600;return true;}
let nextHairFireRound=2;
export function roundVisuals(round){if(round<nextHairFireRound)return;const actor=people.find(p=>p.characterId==='martens'&&!p.away)||pongActors.find(p=>p.avatar.userData.characterId==='martens');if(actor&&startHairFire(actor.head,performance.now()))nextHairFireRound=round+4+Math.floor(Math.random()*4);}
export function previewSignatureMoves(){const now=performance.now();let n=runSignatureMoves([...people,...pongActors],now);for(const p of people){if(p.characterId!=='bvn'||p.away)continue;const target=people.find(q=>q!==p&&!q.away);if(target&&!beerThrows.some(r=>r.thrower===p)){beerThrows.push(createBeerThrow(scene,p,target,now));n++;}}return n;}
export function previewSanta(withElf=false){if(performance.now()<santaDance.until)return null;placeSantaDance(santaDance,onCruiser,tubbyCDs);return startSantaDance(santaDance,performance.now(),withElf);}
export function previewChristmasTree(){if(onCruiser)return null;const ids=chooseTreeCrew(people.map(p=>p.characterId),[...pongActors.map(p=>p.avatar.userData.characterId),backgroundSmoker?.avatar.userData.characterId]);return startChristmasTree(christmasTree,performance.now(),ids,(id,i)=>createAvatar(CHARACTERS[id],i+40),onCruiser);}
export function previewAirTed(){startAirTed(airTed,performance.now());}
export function previewStickDance(){const now=performance.now();for(const p of [...people,...pongActors]){if(p.away)continue;startDance(p.danceRig,now);if(p.companionDance)startDance(p.companionDance,now);}return 5000;}
export function previewVomit(){if(gagIndex>=0&&performance.now()<people[gagIndex]?.vomitRig.until)return null;const available=people.map((p,i)=>i).filter(i=>i>0&&!people[i].away);if(!available.length)return null;gagIndex=available[Math.floor(Math.random()*available.length)];const p=people[gagIndex];startVomit(p.vomitRig,performance.now());if(gagNotice)gagNotice.remove();gagNotice=document.createElement('div');gagNotice.className='gag-caption';gagNotice.textContent=p.name+' needs a moment…';mount.append(gagNotice);return{index:gagIndex,duration:p.vomitRig.duration};}
export function previewAttPose(){const seated=people.find(p=>p.characterId==='att'&&!p.away),background=pongActors.find(p=>p.avatar.userData.characterId==='att');const actor=seated||background;return actor?startAttPose(actor.avatar,performance.now()):false;}
export function setCeremony(i,kind=''){
 const now=performance.now();
 if(kind==='chug'&&(ceremonyKind!=='chug'||ceremonyIndex!==i))for(const p of people){if(p.away)continue;if(p.characterId==='rueben')startCelebration(p.avatar,now,15000);if(p.characterId==='komar')startGeneral(p.avatar,now);if(p.characterId==='att')startAttPose(p.avatar,now,15000);}if(kind==='chug'&&ceremonyKind!=='chug')for(const p of pongActors)if(p.avatar.userData.characterId==='att')startAttPose(p.avatar,now,15000);
 if(kind!=='chug'&&ceremonyKind==='chug')for(const p of people){for(const rig of [p.avatar.userData.generalRig,p.avatar.userData.celebrationRig,p.avatar.userData.attRig])if(rig&&rig.until>now)rig.until=now+450;}
 ceremonyIndex=i;ceremonyKind=kind;
}
export function setActive(i){active=i}
export function setBubblesEnabled(on){bubblesEnabled=on;bubbles.style.display=on?'':'none'}
function hideBubble(){if(bubbleEl)bubbleEl.remove();bubbleEl=null;bubbleIndex=-1}
export function clearBubble(){hideBubble();voiceIndex=-1}
export function showBubble(i,text,duration=2000){clearBubble();setTalking(i);bubbleIndex=i;bubbleUntil=performance.now()+duration;bubbleEl=document.createElement('div');bubbleEl.className='bubble'+(/^\d+$/.test(text)?' number':'');bubbleEl.textContent=text;bubbles.append(bubbleEl)}
export function setTalking(i){voiceIndex=i;const p=people[i];if(p?.characterId==='colman'&&!p.away&&Math.random()<.22)startCelebration(p.avatar,performance.now(),2800);if(p?.characterId==='martens'&&!p.away&&Math.random()<.08)startHairFire(p.head,performance.now());}
export function changeView(){view=(view+1)%3;try{localStorage.setItem('whales-camera-view',String(view))}catch{}resize()}
let w=1,h=1;
function resize(){if(!mount.clientWidth||!mount.clientHeight)return;w=mount.clientWidth;h=mount.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;renderer.setPixelRatio(Math.min(devicePixelRatio,phone()?1:1.7));renderer.shadowMap.enabled=!phone();
 if(window.matchMedia('(max-width:1000px)').matches)frameMobileTable(camera,people.length||6,w/h,view);
 else{const positions=[[0,7.4,11.8],[5,8.4,12],[-5,8.4,12]];camera.position.set(...positions[view]);camera.lookAt(0,1.35,-.5);camera.updateProjectionMatrix()}
 placeChairProps();
}
function placeChairProps(){camera.updateMatrixWorld(true);scene.updateMatrixWorld(true);const labelsAt=people.map(p=>{const point=new T.Vector3(0,2.68,0);p.group.localToWorld(point).project(camera);return{x:(point.x*.5+.5)*w,y:(-.5*point.y+.5)*h}});
 for(const p of people){if(p.companion){const candidates=[{x:1.05,z:-.55},{x:-1.05,z:-.55},{x:1.25,z:-.2},{x:-1.25,z:-.2},{x:1.1,z:-1.1},{x:-1.1,z:-1.1}];const chosen=chooseVisibleSide(camera,p.group,candidates,labelsAt,w,h,2.5);p.companion.userData.sideOffset=chosen;p.companion.position.set(chosen.x,.12,chosen.z);}
 if(p.smoker){const heads=people.map(person=>{const point=new T.Vector3(0,1.7,0);person.group.localToWorld(point).project(camera);return{x:(point.x*.5+.5)*w,y:(-.5*point.y+.5)*h}});const candidates=[{x:1.15,z:-.85},{x:-1.15,z:-.85},{x:1.5,z:-.3},{x:-1.5,z:-.3},{x:.95,z:-1.5},{x:-.95,z:-1.5}];const chosen=chooseVisibleSide(camera,p.group,candidates,heads,w,h,1.2);p.smoker.position.set(chosen.x,0,chosen.z);}}
}
new ResizeObserver(resize).observe(mount);
const v=new T.Vector3();function project(p,x,y,z){v.set(x,y,z);p.group.localToWorld(v);v.project(camera);return [(v.x*.5+.5)*w,(-v.y*.5+.5)*h,v.z]}
let lastRender=0;
function animate(t){requestAnimationFrame(animate);if(document.hidden||!mount.clientWidth||!mount.clientHeight||phone()&&t-lastRender<32)return;lastRender=t;const sec=t/1000;for(let i=0;i<people.length;i++){const p=people[i];const gagActive=updateVomit(p.vomitRig,t);if(p.away)p.avatar.visible=false;updateSafetyPose(p.avatar,t);updateAttPose(p.avatar,t);updateCelebrationPose(p.avatar,t);updateGeneralPose(p.avatar,t);updateRibSteam(p.ribPlate,t);updateRibSteam(p.smoker,t);updateHairFire(p.head,t);if(p.companion){const offset=p.companion.userData.sideOffset||{x:.95,z:-.55};p.companion.position.x=offset.x+Math.sin(sec*.27+p.seed)*.035;p.companion.position.z=offset.z+Math.cos(sec*.27+p.seed)*.03;p.companion.rotation.y=-.14+Math.sin(sec*.4)*.06;}const talking=voiceIndex===i;p.head.rotation.z=Math.sin(sec*.8+p.seed)*.035+(talking?Math.sin(sec*13+p.seed)*.06:0);p.head.position.y=(p.head.userData.restY??1.99)+Math.sin(sec*1.2+p.seed)*.016+(talking?Math.abs(Math.sin(sec*14))*.075:0);p.mouth.scale.y=voiceIndex===i?(1+Math.abs(Math.sin(sec*18))*3):1;p.ring.material.color.set(gagActive?'#ffe46a':ceremonyIndex===i?(ceremonyKind==='mistake'?'#ff865d':'#ffe09b'):'#d5e79f');p.ring.material.opacity=(gagActive||ceremonyIndex===i||active===i)?.65+Math.sin(sec*(ceremonyIndex===i?7:3))*.25:0;const d=p.drinkUntil>t?Math.sin(Math.min(1,(t-p.drinkStart)/(p.drinkUntil-p.drinkStart))*Math.PI):0;
 p.beerCup.position.set(.48-d*.32,1.69+d*.22,.86-d*.48);p.beerCup.rotation.x=-d*.9;p.head.rotation.x=-d*.15+(talking?Math.sin(sec*14)*.09:0);
 }
 if(gagIndex>=0&&t>=people[gagIndex]?.vomitRig.until){gagIndex=-1;if(gagNotice){gagNotice.remove();gagNotice=null;}}
 const anchors=people.map((p,i)=>{const a=project(p,0,phone()?2.15:2.68,0);p.label.style.display=a[2]>1?'none':'';p.label.classList.toggle('speaking',voiceIndex===i);return {index:i,x:a[0],y:a[1]}});
 for(const row of (phone()?sideLabelLayout(anchors,w,h):anchors.map(a=>({...a,side:'center'})))){const label=people[row.index].label;label.style.left=row.x+'px';label.style.top=row.y+'px';label.style.transform=row.side==='center'?'translate(-50%,-50%)':row.side==='left'?'translate(0,-50%)':'translate(-100%,-50%)';label.style.textAlign=row.side==='center'?'center':row.side==='left'?'left':'right';}
 if(bubbleEl&&people[bubbleIndex]){const a=project(people[bubbleIndex],0,people[bubbleIndex].flags?3.4:2.85,0);bubbleEl.style.left=Math.max(55,Math.min(w-55,a[0]))+'px';bubbleEl.style.top=Math.max(65,a[1])+'px';if(t>bubbleUntil)hideBubble()}
 const cycle=sec*1.25,swing=Math.sin(cycle);ball.position.set(swing*2.43,1.72+Math.abs(Math.cos(cycle))*.65,Math.sin(cycle*2)*.22);
 for(const actor of pongActors){actor.head.position.y=actor.head.userData.restY??1.99;updateHairFire(actor.head,t);updateSafetyPose(actor.avatar,t);updateCelebrationPose(actor.avatar,t);updateGeneralPose(actor.avatar,t);updateAttPose(actor.avatar,t);const posing=[actor.avatar.userData.attRig,actor.avatar.userData.safetyRig,actor.avatar.userData.celebrationRig,actor.avatar.userData.generalRig].some(r=>r&&t<r.until);const hit=Math.pow(Math.max(0,-actor.side*swing),12);if(!posing)actor.hand.position.x=(actor.side<0?1:-1)*.38+Math.sin(cycle*2)*.15;if(!posing)actor.hand.rotation.x=-.1+hit*.3;actor.head.rotation.y=Math.sin(cycle)*.1;actor.avatar.rotation.z=actor.side*hit*.035;}
 for(const p of people){if(p.away)p.danceRig.group.visible=false;else if(updateDance(p.danceRig,t))p.vomitRig.group.visible=false;if(p.companionDance){if(!p.away){p.companion.visible=true;updateDance(p.companionDance,t);}else p.companionDance.group.visible=false;}}
 for(const p of pongActors){p.avatar.visible=true;updateDance(p.danceRig,t);if(p.companionDance){p.companion.visible=true;updateDance(p.companionDance,t);}}
 if(backgroundSmoker)updateBackgroundSmoke(backgroundSmoker,t);
 for(const [j,r] of tubeActors.entries()){r.group.position.y=-.45+Math.sin(sec*1.5+j)*.12;r.group.rotation.z=Math.sin(sec+j)*.08;}for(const [j,wave] of cruiser.waves.entries())wave.position.y=-.69+Math.sin(sec+j)*.025;
 if(t>=airTed.next)startAirTed(airTed,t);const duck=updateAirTed(airTed,t,camera);for(const p of [...people,...pongActors])if(!p.away){p.head.position.y-=duck;p.avatar.rotation.x=duck*.35;}
 if(nerf)updateNerf(nerf,t);beerThrows=beerThrows.filter(r=>{if(updateBeerThrow(r,t))return true;r.group.removeFromParent();r.group.traverse(o=>o.geometry?.dispose());return false;});
 if(!onCruiser&&t>=christmasTree.next)previewChristmasTree();updateChristmasTree(christmasTree,t);
 updateSantaDance(santaDance,t);
 renderer.render(scene,camera);
}seatPlayers(6);resize();requestAnimationFrame(animate);
