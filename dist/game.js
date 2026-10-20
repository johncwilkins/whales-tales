import {CHARACTERS,seatCast,HOUSE_NAMES,assignCharacter} from './roster.mjs';
import {SpeechChannel} from './speech.mjs';
import {rankVoices,selectVoice} from './voices.mjs';
import {chatterGap,chooseChatter} from './chatter.mjs';
import {responseDelay} from './timing.mjs';
import {pickCallout,pickCeremonyCallout} from './callouts.mjs';
import {unlockSound,setSoundEnabled,playCue,playBelch,stopBelch} from './sound.js';
import {people,seatPlayers,setActive,showBubble,clearBubble,changeView,setTalking,playerDrinks,clearFlags,setCeremony,setBubblesEnabled,setAway,refereeSafety,previewSignatureMoves,previewVomit,previewStickDance,previewAirTed,previewChristmasTree,previewFunnel,previewSanta,roundVisuals} from './scene.js';
import {MODES,chooseAlternate,specialGap,modeAnnouncement} from './modes.mjs';
import {nextStep,validResponse,penaltyFor,keyResponse} from './rules.mjs';
let selfGolden=false;
const $=s=>document.querySelector(s);let count=6,state={actor:0,caller:0,target:0,phase:'number'},running=false,paused=false,muted=false,waiting=false,token=0,passes=0,mistakes=0,round=1,frame=0,started=false,lastLoser=-1,lossStreak=0,speechSerial=0,away=-1,turns=0,bathroomAt=3,returnAt=0,lastCallout='',activeSpeaker=-1,peepBusy=false;
let restoringSettings=true,savedSettings={};try{const parsed=JSON.parse(localStorage.getItem('whales-settings')||'{}');if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))savedSettings=parsed;}catch{}
count=Number.isInteger(savedSettings.count)&&savedSettings.count>=2&&savedSettings.count<=9?savedSettings.count:6;$('#players').value=String(count);
if(Array.isArray(savedSettings.cast))for(let i=1;i<9;i++)assignCharacter(seatCast,i,CHARACTERS[savedSettings.cast[i]]?savedSettings.cast[i]:'house');
if(['easy','normal','fast','blitz'].includes(savedSettings.pace))$('#pace').value=savedSettings.pace;
for(const [key,id] of [['guide','#guide'],['bubbles','#show-bubbles']])if(typeof savedSettings[key]==='boolean')$(id).checked=savedSettings[key];
seatPlayers(count);setBubblesEnabled($('#show-bubbles').checked);
function persistSettings(){if(restoringSettings)return;try{localStorage.setItem('whales-settings',JSON.stringify({count:Number($('#players').value),cast:[...seatCast],pace:$('#pace').value,guide:$('#guide').checked,bubbles:$('#show-bubbles').checked,sound:!muted,controlsOnly:!document.body.classList.contains('mobile-table')}))}catch{}}
let keyboardLayout='as';try{const saved=localStorage.getItem('whales-keyboard-layout');if(['as','space-arrow'].includes(saved))keyboardLayout=saved;}catch{}
const mobileDevice=()=>typeof window.matchMedia==='function'&&window.matchMedia('(max-width:1000px)').matches;
let desiredVoice='auto';try{desiredVoice=localStorage.getItem('whales-voice')||'auto'}catch{}
const pendingPeepers=new Set(),paidPeepers=new Set(),pauseWaiters=new Set();
let mistakeEvents=0;function reactToMistake(){if(++mistakeEvents%3===0)refereeSafety()}
let humanSince=null,quickPoints=0,pressure=null,pauseSnapshot=null,announcementState=null,introOpen=false,introRevision=0;
function untilResumed(){return paused&&running?new Promise(resolve=>pauseWaiters.add(resolve)):Promise.resolve()}
function releasePause(){for(const resolve of pauseWaiters)resolve();pauseWaiters.clear();}
const speechChannel='speechSynthesis' in window?new SpeechChannel(speechSynthesis):null;
const voices=()=>('speechSynthesis' in window?speechSynthesis.getVoices():[]);
function refreshVoices(){const select=$('#voice'),chosen=desiredVoice;select.replaceChildren();const auto=document.createElement('option');auto.value='auto';auto.textContent=mobileDevice()?'Auto · clearest mobile voice':'Auto · best available';select.append(auto);for(const v of rankVoices(voices())){const option=document.createElement('option');option.value=v.voiceURI||v.name;option.textContent=v.name;select.append(option)}select.value=chosen;if(!select.value)select.value='auto'}
refreshVoices();if('speechSynthesis' in window)speechSynthesis.addEventListener?.('voiceschanged',refreshVoices);

const options={easy:{limit:9000,rate:1.35,botMiss:.025},normal:{limit:4500,rate:1.6,botMiss:.04},fast:{limit:3000,rate:1.85,botMiss:.055},blitz:{limit:1800,rate:2.1,botMiss:.07}};
const pace=()=>options[$('#pace').value];
let modeId='regular',direction=1,nextSpecial=1+specialGap(),numberDraft='',numberTimer=0,botPending=null,humanPending=null;
let nextChatter=chatterGap(),lastChatter=-1,nextTubbyFlags=6,nextTubbyMexican=5,nextVomitRound=10,nextSantaRound=18,nextBelchTurn=12,nextFunnelRound=12;
const mode=()=>({...MODES[modeId],direction});
const maxCall=()=>count*(MODES[modeId].multiplier||1);
function clearNumberDraft(){clearTimeout(numberTimer);numberDraft='';}
function selectRoundMode(){modeId=round>=nextSpecial?chooseAlternate():'regular';if(modeId!=='regular')nextSpecial=round+specialGap();direction=MODES[modeId].direction;clearNumberDraft();renderMode();roundVisuals(round);}
function renderMode(){const m=MODES[modeId],special=modeId!=='regular',dir=direction===1?'↻ CLOCKWISE · LEFT IS 1':'↺ COUNTERCLOCKWISE · RIGHT IS 1';document.body.classList.toggle('alternate-round',special);document.body.classList.toggle('modulus-round',modeId==='modulus');document.body.classList.toggle('olympic-round',Boolean(m.olympic));const banner=$('#mode-banner');banner.hidden=!special;$('#mode-name').textContent=m.name;$('#mode-detail').textContent=(modeId==='oscillating'?dir+' · switches after this call':m.description)+(modeId==='modulus'?' · 1–'+maxCall():'');$('#direction-label').textContent=dir;keypad.classList.toggle('modulus',modeId==='modulus');document.querySelectorAll('#keypad .response').forEach(b=>b.hidden=Number(b.dataset.value)> (modeId==='modulus'?18:9));buttons();}

async function announceOpening(actor,text,myToken){
 const before=state,revision=++introRevision;announcementState=before;waiting=false;humanPending=null;humanSince=null;cancelAnimationFrame(frame);$('#timer-fill').style.width='0';
 await say(actor,text,myToken,{opening:true});
 if(myToken!==token||revision!==introRevision||state!==before||!running)return;
 announcementState=null;$('#toast').hidden=true;setCeremony(-1);
 if(document.hidden){paused=true;status('TAKING A BREATHER','Round paused.','Resume when you’re ready.');buttons();return}
 if(!paused){buttons();pump(myToken,{openingNumber:actor!==0})}
}
function chooseIntroMode(id){
 if(!running||paused||peepBusy||!introOpen||state.actor!==0||state.phase!=='number')return;
 modeId=id;direction=MODES[id].direction;clearNumberDraft();renderMode();
 status('YOUR OPENING · '+MODES[id].name.toUpperCase(),'Call your opening number.',MODES[id].description);
 announceOpening(0,modeAnnouncement(id,count),token);
}


function renderCast(){const container=$('#seat-selects');container.replaceChildren();for(let i=1;i<count;i++){const row=document.createElement('label');row.className='cast-row';const title=document.createElement('span');title.textContent='Chair '+i+(i===1?' · your left':'');row.append(title);const select=document.createElement('select');select.setAttribute('aria-label','Player in chair '+i);const house=document.createElement('option');house.value='house';house.textContent=HOUSE_NAMES[i]+' · house player';select.append(house);for(const character of Object.values(CHARACTERS).sort((a,b)=>a.name.localeCompare(b.name))){const option=document.createElement('option');option.value=character.id;option.textContent=character.name;select.append(option)}select.value=seatCast[i];select.onchange=()=>{pendingPeepers.clear();paidPeepers.clear();stop();assignCharacter(seatCast,i,select.value);seatPlayers(count);away=selfGolden?0:-1;if(selfGolden)setAway(0,true);turns=0;bathroomAt=3;lastLoser=-1;lossStreak=0;$('#welcome').hidden=false;$('#toast').hidden=true;renderCast();status('CAST YOUR TABLE','Ready when you are.','Your selected players are seated. Pull up a chair to begin.');buttons()};row.append(select);container.append(row);}}
renderCast();

const keypad=$('#keypad');for(let n=1;n<=18;n++){const b=document.createElement('button');b.className='response';b.dataset.value=n;b.textContent=n;b.setAttribute('aria-label','Call '+n);keypad.append(b)}
function buttons(){document.querySelectorAll('.response').forEach(b=>b.disabled=selfGolden||!running||paused||state.phase==='restart'||(Number(b.dataset.value)>maxCall()));$('#players').disabled=false;$('#pause').disabled=!running;$('#pause').textContent=paused?'▶ Resume':'Ⅱ Pause';$('#self-num').textContent=count;$('#mobile-start').hidden=running;$('#settings-toggle').disabled=false;$('#golden-chair').checked=selfGolden;$('#golden-chair-label').textContent=selfGolden?'Golden chair · watching':'Golden chair · watch';}
function advance(value){const numberCall=state.phase==='number';if(numberCall&&introOpen){introOpen=false;introRevision++;announcementState=null;$('#toast').hidden=true;setCeremony(-1);}if(state.phase==='nay'){pendingPeepers.clear();paidPeepers.clear();}state=nextStep(state,value,count,away,mode());if(numberCall&&modeId==='oscillating')direction*=-1;turns++;renderMode();}
function stats(){$('#passes').textContent=passes;$('#mistakes').textContent=mistakes;$('#round').textContent=round}
function status(tag,title,detail){$('#status-tag').textContent=tag;$('#prompt').textContent=title;$('#detail').textContent=detail}
function updatePrompt(){const goldenCount=state.actor===0&&state.phase==='number'&&state.numberOrigin!==undefined&&state.numberOrigin!==0;$('#count-origin').textContent=goldenCount?'Count '+(direction===1?'clockwise':'counterclockwise')+' from '+people[state.numberOrigin].name+'’s empty chair.':'Count '+(direction===1?'clockwise':'counterclockwise')+' from the caller.';$('#count-ending').textContent=goldenCount?' to call the golden chair again.':' to call yourself.';const guide=$('#guide').checked;const person=people[state.actor]?.name||'Player';setActive(guide?state.actor:-1);if(state.actor===0){status('YOUR TURN',guide?(state.phase==='number'?'Call a number.':state.phase==='nay'?'Say “Nay!”':'Say “Who?”'):'You’re up.',guide?(state.phase==='number'?`${state.numberOrigin!==undefined&&state.numberOrigin!==0?'Count from '+people[state.numberOrigin].name+'’s golden chair. Its '+(direction===1?'left':'right')+' neighbor is 1.':'Choose 1–'+maxCall()+'. Your '+(direction===1?'left':'right')+' is 1. '+count+' calls yourself.'}`:state.phase==='nay'?`${state.goldenChair>=0?'Golden chair! You cover '+people[state.goldenChair].name:people[state.caller].name==='You'?'You called yourself':people[state.caller].name+' called you'}. ${state.calledNumber?'Call '+state.calledNumber+' landed on your chair. ':''}Answer with ${keyboardLayout==='as'?'A':'Spacebar'} or the Nay button.`:`${state.target===0?'You':people[state.target].name} said Nay. Ask Who with ${keyboardLayout==='as'?'S':'Down Arrow'} or the Who button.`):'Follow the calls. Nay, Who, or a number?')}else status(selfGolden?'GOLDEN CHAIR · WATCHING':'AROUND THE TABLE',guide?`${person}’s turn.`:'Listen closely.',guide?(state.phase==='number'?`${person} is choosing the next number.`:state.phase==='nay'?state.goldenChair>=0?`${person} covers ${people[state.goldenChair].name}’s golden chair.`:`${person} answers the call.`:`${person} asks “Who?”`):'Follow the voices and speech bubbles.');if(introOpen&&state.actor===0){$('#detail').textContent='Before your opening number: Y = Olympic · R = reverse · O = oscillating · M = modulus.';}}
const wait=async ms=>{await new Promise(r=>setTimeout(r,ms));await untilResumed()};
async function say(i,text,myToken,{opening=false,ceremony=false,selfCall=false,onStart,belch=false}={}){
 if(myToken!==token)return;const speechId=++speechSerial;
 const rate=mobileDevice()?(ceremony?1: selfCall?1.75:opening?1.4:MODES[modeId].olympic?1.65:Math.max(1.3,pace().rate)):(ceremony?(/get his number/i.test(text)?1.05:1.12):selfCall?1.85:opening?1.5:MODES[modeId].olympic?1.8:pace().rate);
 const shortMobile=mobileDevice()&&!opening&&!ceremony&&/^(?:\d+|Nay!|Who\?)$/.test(text),mobileBudget=Number(text)>=10?700:550;
 const duration=Math.max(150,text.length*55/rate);let began=false;const begin=()=>{if(began||myToken!==token||speechId!==speechSerial)return;began=true;activeSpeaker=i;showBubble(i,belch?'Buuurp!':text,duration+1800);$('#last').textContent=`${people[i].name}: “${belch?'Buuurp!':text}”`;onStart?.();};
 if(belch){if(muted){begin();await wait(570);}else{const length=await playBelch(begin);await wait(length);}}
 else if(muted||!speechChannel){begin();await wait(Math.min(duration,1200));}
 else{const voice=selectVoice(voices(),i,$('#voice').value||'auto',{single:mobileDevice()});await speechChannel.speak(text,{...(voice?{voice}:{}),rate,pitch:1,volume:1,onStart:begin,...(shortMobile?{maxDuration:mobileBudget,maxStartDelay:900}:{})});await untilResumed();if(myToken!==token||speechId!==speechSerial)return;begin();}
 await untilResumed();if(myToken===token&&speechId===speechSerial){activeSpeaker=-1;setTalking(-1);}
}

function stop(){stopBelch();introOpen=false;introRevision++;announcementState=null;releasePause();humanSince=null;pressure=null;clearNumberDraft();botPending=null;humanPending=null;activeSpeaker=-1;peepBusy=false;token++;speechSerial++;running=false;paused=false;waiting=false;cancelAnimationFrame(frame);$('#timer-fill').style.width='0';speechChannel?.cancel();clearBubble();setActive(-1);setCeremony(-1);buttons()}
function humanTurn(myToken){if(humanPending===state&&waiting)return;humanPending=state;humanSince=performance.now();waiting=true;buttons();const duration=MODES[modeId].olympic?({easy:1800,normal:1300,fast:1000,blitz:750}[$('#pace').value]):pace().limit;const deadline=performance.now()+duration,turn=state;function tick(){if(myToken!==token||!waiting||paused||state!==turn||humanPending!==turn)return;if(duration){const left=deadline-performance.now();$('#timer-fill').style.width=Math.max(0,left/duration*100)+'%';if(left<=0){fail(0,state.phase==='nay'?'Silence! No Nay.':MODES[modeId].olympic?'Sundial tails! Olympic numbers must be quick.':'Time’s up.');return}}frame=requestAnimationFrame(tick)}tick()}
const goldenReasons=['Off to the bathroom.','I have to blow.','Got to call my girlfriend.','My bladder just called a meeting.','Going to see a man about a urinal.','The beer has reached its final destination.','Need to go drain the holding tank.','My kidneys have filed a complaint.','Got to return this rental beer.','My girlfriend wants proof I’m still alive.','Going to check if the bathroom has a better counting game.','Nature just sent a second reminder.','I need a minute with the porcelain committee.','Taking this beer on its final voyage.','The downstairs department needs immediate attention.','Got to go negotiate with my bladder.'];let lastGoldenReason=goldenReasons[2];
async function bathroomBeat(myToken){
 if(state.phase!=='restart'||selfGolden)return true;
 const before=state;
 if(away>=0&&round>=returnAt){const returning=away;away=-1;setAway(returning,false);await say(returning,'Back! Golden chair’s closed.',myToken,{ceremony:true});}
 else if(away<0&&round>=bathroomAt){const eligible=people.map((_,i)=>i).filter(i=>i>0&&i!==state.actor);if(eligible.length){const leaving=eligible[Math.floor(Math.random()*eligible.length)];away=leaving;returnAt=round+2+Math.floor(Math.random()*2);bathroomAt=returnAt+3+Math.floor(Math.random()*3);setAway(leaving,true);const reason=goldenReasons.filter(r=>r!==lastGoldenReason)[Math.floor(Math.random()*(goldenReasons.length-1))];lastGoldenReason=reason;await say(leaving,'Golden chair! '+reason,myToken,{ceremony:true});}}
 return myToken===token&&running&&!paused&&state===before;
}
async function chatterBeat(myToken){
 if(state.phase!=='restart'||round<nextChatter)return true;
 const before=state,voices=people.map((_,i)=>i).filter(i=>i>0&&i!==away);
 if(voices.length<2)return true;
 nextChatter=round+chatterGap();const chat=chooseChatter(lastChatter,Math.random,people.filter((p,i)=>i!==away&&!p.away).map(p=>p.characterId));lastChatter=chat.index;
 const first=Math.floor(Math.random()*voices.length);let speakers=[voices[first],voices[(first+1)%voices.length]];if(chat.tubby){const tubby=voices.find(i=>people[i].characterId==='tubby');speakers=[voices.find(i=>i!==tubby),tubby];}
 status('BETWEEN ROUNDS','A word at the table.','The next round starts after the chatter.');
 for(let j=0;j<chat.lines.length;j++){await say(speakers[j],chat.lines[j],myToken,{ceremony:true});if(myToken!==token||!running||state!==before)return false;}
 return true;
}

async function rareFunnelBeat(myToken){
 if(myToken!==token||!running||paused||state.phase!=='restart'||round<nextFunnelRound||Math.random()>=.025)return true;
 const result=previewFunnel();if(!result)return true;nextFunnelRound=round+25+Math.floor(Math.random()*20);
 status('CARSON’S BEER FUNNEL',result.target+' takes the funnel.','The next round starts after Carson’s visit.');
 await wait(result.duration);return myToken===token&&running&&state.phase==='restart';
}

async function rareSantaBeat(myToken){
 if(myToken!==token||!running||paused||state.phase!=='restart'||round<nextSantaRound||Math.random()>=.018)return true;
 const result=previewSanta(Math.random()<.3);if(!result)return true;
 nextSantaRound=round+35+Math.floor(Math.random()*26);
 status('A HOLIDAY INTERRUPTION',result.withElf?'Santa brought company.':'Santa takes the bar.','The next round starts after the dance.');
 await wait(result.duration);return myToken===token&&running&&state.phase==='restart';
}

async function rareVomitBeat(myToken){
 if(myToken!==token||!running||state.phase!=='restart'||round<nextVomitRound||Math.random()>=.035)return true;
 const result=previewVomit();if(!result)return true;nextVomitRound=round+25+Math.floor(Math.random()*16);
 await wait(result.duration);return myToken===token&&running;
}

async function tubbyMexicanBeat(turn,myToken){
 if(myToken!==token||!running||paused||state!==turn||turn.phase==='restart'||turn.actor===0||turn.actor===away||people[turn.actor]?.name!=='Tubby'||round<nextTubbyMexican||Math.random()>=.025)return false;
 nextTubbyMexican=round+10+Math.floor(Math.random()*9);
 await say(turn.actor,'Mexican!',myToken,{ceremony:true});
 if(myToken===token&&running&&state===turn&&!paused)fail(turn.actor,'Mexican! Tubby volunteered for the drink.',{instantDrink:true});
 return true;
}

async function pump(myToken,{openingNumber=false}={}){if(myToken!==token||!running||paused||peepBusy)return;
 if(state.phase==='restart'){await restartLoser(myToken);return}
 coverSpectator();updatePrompt();if(state.actor===0){humanTurn(myToken);return}
 const turn=state;if(botPending===turn)return;botPending=turn;waiting=false;buttons();
 const live=()=>myToken===token&&running&&!paused&&state===turn&&!peepBusy;
 await wait(openingNumber?0:responseDelay({pace:$('#pace').value,phase:turn.phase,selfCall:turn.caller===turn.target,olympic:MODES[modeId].olympic,seat:turn.actor}));if(!live())return;
 if(!openingNumber&&await tubbyMexicanBeat(turn,myToken))return;if(!live())return;
 const extra=pressure?.seat===turn.actor?pressure.extra:0;if(extra)pressure=null;
 if(!openingNumber&&Math.random()<Math.min(.5,pace().botMiss+extra)){
  // A missed number is a timeout, never an audible call that secretly doesn't count.
  if(turn.phase==='number'||Math.random()<.45){await wait(MODES[modeId].olympic?800:550);if(live())fail(turn.actor,turn.phase==='nay'?'Silence! No Nay.':'Sundial tails! Too slow.');}
  else{const wrong=turn.phase==='nay'?'Who?':'Nay!';await say(turn.actor,wrong,myToken);if(live())fail(turn.actor,wrong==='Nay!'?'Peepage! Nay was not yours.':`Said ${wrong} instead.`);}
  return;
 }
 let value=turn.phase;if(turn.phase==='number')value=Math.random()<.35?(((direction*(0-(turn.numberOrigin??turn.actor)))%count+count)%count||count):1+Math.floor(Math.random()*maxCall());
 const belch=turn.phase==='nay'&&turns>=nextBelchTurn&&Math.random()<.03;if(belch)nextBelchTurn=turns+24+Math.floor(Math.random()*24);
 let next=null;
 await say(turn.actor,turn.phase==='number'?String(value):turn.phase==='nay'?'Nay!':'Who?',myToken,{belch,selfCall:turn.caller===turn.target,onStart:()=>{
  if(!live())return;advance(value);next=state;updatePrompt();if(state.actor===0)pump(myToken);
 }});
 if(myToken===token&&running&&!paused&&state===next&&state.actor!==0)pump(myToken);
}

function fail(loser,reason,{instantDrink=false}={}){const peepers=[...pendingPeepers];for(const peeper of peepers)if(!paidPeepers.has(peeper))playerDrinks(peeper,{});pendingPeepers.clear();paidPeepers.clear();const expected=/quick who/i.test(reason)?'the other player’s Nay before your Who':loser===0&&state.actor!==0?'to wait for your turn':state.phase==='number'?`a number from 1 to ${maxCall()}`:state.phase==='nay'?'Nay':'Who';const p=penaltyFor(lastLoser,lossStreak,loser);lastLoser=p.lastLoser;lossStreak=p.streak;clearFlags();if(loser===0)mistakes++;round++;stats();stop();running=true;reactToMistake();
 const name=people[loser].name,callout=pickCallout(reason,loser===0?'':name,lastCallout);lastCallout=callout;state={actor:loser,caller:loser,target:loser,phase:'restart',penalty:p,reason,expected,callout,peepers,preDrank:instantDrink,preDrinkAt:instantDrink?performance.now():null};if(instantDrink)playerDrinks(loser,p);
 status(p.chug?'THREE LOSSES · CHUG':p.flag?'TWO LOSSES · FLAG':'SLIP-UP · TAKE A SIP',callout,`${reason} Expected ${expected}. ${p.chug?'Chug, then restart.':p.flag?'Flag and crushed cup earned.':'Take a sip.'} ${loser===0?'You open':name+' opens'} the next round.`);
 const toast=$('#toast');toast.hidden=false;toast.replaceChildren();const title=document.createElement('b');title.textContent=callout;toast.dataset.kind='mistake';toast.append(title,document.createTextNode(`${reason} Expected ${expected}.${peepers.length?' '+peepers.map(i=>people[i].name).join(', ')+' also drank for peepage.'+(/silence/i.test(reason)?' The silent player restarts.':''):''}`));buttons();pump(token)
}
function ceremonyToast(kind,title,detail){const toast=$('#toast');toast.hidden=false;toast.dataset.kind=kind;toast.replaceChildren();const heading=document.createElement('b');heading.textContent=title;toast.append(heading,document.createTextNode(detail));}
async function restartLoser(myToken){
 const loser=state.actor,penalty=state.penalty,name=people[loser].name,crowd=Array.from({length:count-1},(_,j)=>(loser+j+1)%count).filter(i=>i!==away),shouter=crowd[Math.floor(Math.random()*crowd.length)]??loser;
 const alive=()=>myToken===token&&running;
 setActive(loser);setCeremony(loser,'mistake');playCue('mistake');
 await wait(500);if(!alive())return;
 await say(shouter,state.callout,myToken,{ceremony:true});if(!alive())return;
 await wait(500);if(!alive())return;
 if(penalty.chug){
  setCeremony(loser,'chug');playCue('chug');ceremonyToast('chug','THREE IN A ROW. CHUG!',`${name==='You'?'You have':name+' has'} the floor. The whole table is watching.`);
  status('THE CHUG CEREMONY','All eyes on '+(loser===0?'you.':name+'.'),'Three consecutive losses. Flag and crushed cup cleared.');
  await say(shouter,`${loser===0?'You':name}! ${pickCeremonyCallout('chug')}`,myToken,{ceremony:true});if(!alive())return;
  if(!state.preDrank)playerDrinks(loser,penalty);const start=state.preDrinkAt??performance.now();
  for(let j=1;j<=3;j++){await say(crowd[(j-1)%crowd.length]??loser,'Chug!',myToken,{ceremony:true});if(!alive())return;await wait(220);if(!alive())return;}
  await wait(Math.max(0,4550-(performance.now()-start)));if(!alive())return;
 }else{
  setCeremony(loser,penalty.flag?'flag':'sip');
  ceremonyToast(penalty.flag?'flag':'sip',penalty.flag?'FLAG ON THE PLAY.':name==='You'?'Take your sip.':`${name} takes a sip.`,penalty.flag?'Two losses in a row. Get their number!':'Then the floor is yours.');
  if(!state.preDrank)playerDrinks(loser,penalty);
  if(penalty.flag){playCue('flag');await say(shouter,pickCeremonyCallout('flag'),myToken,{ceremony:true});if(!alive())return;}
  else{await wait(1350);if(!alive())return;}
 }
 setCeremony(-1);if(!await rareFunnelBeat(myToken))return;if(!await rareSantaBeat(myToken))return;if(!await rareVomitBeat(myToken))return;if(!await bathroomBeat(myToken))return;if(!await voluntaryFlagsBeat(myToken))return;if(!await chatterBeat(myToken))return;
 setCeremony(loser,'restart');playCue('restart');ceremonyToast('restart','THE FLOOR IS '+(loser===0?'YOURS.':name.toUpperCase()+"’S."),'Whale’s Tales… calls tales on…');
 await wait(400);if(!alive())return;
 selectRoundMode();if(modeId!=='regular'){playCue('restart');ceremonyToast('alternate',MODES[modeId].name.toUpperCase(),MODES[modeId].description);}
 const opener=selfGolden&&loser===0?1:loser;state={actor:opener,caller:opener,target:opener,phase:'number'};introOpen=opener===0;buttons();
 await announceOpening(opener,modeAnnouncement(modeId,count),myToken);

}

async function voluntaryFlagsBeat(myToken){
 if(state.phase!=='restart'||myToken!==token||!running||round<nextTubbyFlags||lossStreak>=2)return true;
 const tubby=people.findIndex((p,i)=>i>0&&i!==state.actor&&p.name==='Tubby'&&!p.away&&i!==away);
 if(tubby<0||Math.random()>=.07)return true;
 const alive=()=>myToken===token&&running;
 const lines=['Flags on me! I’m taking the express lane to a chug.','Voluntary flags! Why wait for talent to let me down?','I’ll take flags. Put me one bad decision from a chug.','Flags on myself! Consider it a down payment.'];
 setCeremony(tubby,'flag');ceremonyToast('flag','VOLUNTARY FLAGS · TUBBY','He asked for it. His next mistake is a chug; someone else’s mistake clears it.');
 await say(tubby,lines[Math.floor(Math.random()*lines.length)],myToken,{ceremony:true});if(!alive())return false;
 clearFlags();lastLoser=tubby;lossStreak=2;nextTubbyFlags=round+12+Math.floor(Math.random()*9);playerDrinks(tubby,{flag:true});playCue('flag');
 const shouter=people.findIndex((p,i)=>i!==tubby&&i!==away&&!p.away);
 await say(shouter<0?tubby:shouter,'For God’s sake, get his number! He volunteered!',myToken,{ceremony:true});if(!alive())return false;
 await wait(700);if(!alive())return false;setCeremony(-1);return true;
}

async function registerPeep(peeper){
 if(peepBusy||pendingPeepers.has(peeper))return;
 pendingPeepers.add(peeper);if(peeper===0)mistakes++;stats();reactToMistake();
 token++;botPending=null;humanPending=null;const myToken=token;peepBusy=true;waiting=false;buttons();speechChannel?.cancel();cancelAnimationFrame(frame);
 const expectedActor=state.actor,shouter=people.map((_,i)=>i).find(i=>i!==peeper&&i!==away&&i!==expectedActor)??expectedActor;
 setCeremony(peeper,'mistake');playCue('mistake');status('PEEPAGE','That Nay wasn’t yours.',`${people[peeper].name} drinks. ${people[expectedActor].name} still owes a Nay.`);
 ceremonyToast('mistake','PEEPAGE!',`${people[peeper].name} takes a sip. ${people[expectedActor].name} must still answer Nay.`);
 await say(peeper,'Nay!',myToken);if(myToken!==token||!running)return;
 const peepCallout=pickCallout('Peepage!','',lastCallout);lastCallout=peepCallout;
 await say(shouter,peepCallout,myToken,{ceremony:true});if(myToken!==token||!running)return;
 playerDrinks(peeper,{});paidPeepers.add(peeper);await wait(1350);if(myToken!==token||!running)return;
 peepBusy=false;setCeremony(-1);$('#toast').hidden=true;if(document.hidden){paused=true;buttons();status('TAKING A BREATHER','Round paused.','Resume when you’re ready.');return}buttons();pump(myToken);
}
async function respond(value,{belch=false}={}){if(selfGolden||!running||paused||state.phase==='restart'||peepBusy)return;clearNumberDraft();if(value==='who'&&state.phase==='nay'&&state.caller===0&&state.actor!==0){fail(0,'Quick Who! You jumped the Nay.');return}if(value==='nay'&&state.actor!==0&&state.phase==='nay'){registerPeep(0);return}if(state.actor!==0){fail(0,value==='nay'?'Peepage! Nay was not yours.':'You spoke out of turn.');return}if(!validResponse(state.phase,value,maxCall())){fail(0,value==='nay'?'Peepage! Nay was not yours.':`You said ${value==='who'?'Who':value}.`);return}const elapsed=humanSince===null?Infinity:performance.now()-humanSince,points=elapsed<=500?3:elapsed<=1000?2:elapsed<=1800?1:0,numberCall=state.phase==='number';quickPoints+=points;$('#speed-bonus').textContent=quickPoints?(points?'QUICK +'+points+' · ':'')+quickPoints+' quick pts':'';humanSince=null;waiting=false;cancelAnimationFrame(frame);$('#timer-fill').style.width='0';passes++;stats();buttons();const myToken=token;const phrase=state.phase==='number'?String(value):value==='nay'?'Nay!':'Who?';
 advance(value);if(numberCall&&points&&state.actor!==0)pressure={seat:state.actor,extra:points*.1};const next=state;const speaking=say(0,phrase,myToken,{belch:belch&&value==='nay',selfCall:state.caller===state.target});
 if(state.actor===0){pump(myToken);return}
 updatePrompt();buttons();await speaking;if(myToken===token&&running&&!paused&&state===next)pump(myToken)}
async function startRound(){pendingPeepers.clear();paidPeepers.clear();unlockSound();speechChannel?.resume();if(started)round++;started=true;stop();count=Number($('#players').value);if(people.length!==count){seatPlayers(count);away=selfGolden?0:-1;if(selfGolden)setAway(0,true);turns=0;bathroomAt=3;lastLoser=-1;lossStreak=0}const opener=1;state={actor:opener,caller:opener,target:opener,phase:'number'};running=true;selectRoundMode();$('#welcome').hidden=true;$('#toast').hidden=true;stats();buttons();const myToken=token;status('THE ROUND IS STARTING',people[opener].name+' opens.',"Listen to the opening number. You’ll be prompted when it’s your turn.");setActive(opener);introOpen=false;await announceOpening(opener,"I’ll start. "+(modeId==='regular'?"Whale’s Tales. Prince of Wales calls tales on…":modeAnnouncement(modeId,count)),myToken)}

function coverSpectator(){
 if(!selfGolden||state.phase==='restart')return;
 if(state.actor!==0&&state.caller!==0&&state.target!==0)return;
 const cover=state.caller>0?state.caller:state.target>0?state.target:1;
 state={...state,actor:state.actor===0?cover:state.actor,caller:state.caller===0?cover:state.caller,target:state.target===0?cover:state.target,...(state.target===0?{goldenChair:0}:{}),...(state.phase==='number'&&state.actor===0?{numberOrigin:state.numberOrigin??0}:{})};
}
$('#golden-chair').onchange=()=>{
 const wasRunning=running,wasPaused=paused,oldState=state;
 selfGolden=$('#golden-chair').checked;$('#golden-chair').blur();
 if(away>=0)setAway(away,false);away=selfGolden?0:-1;setAway(0,selfGolden);bathroomAt=round+3;
 const affected=selfGolden&&state.phase!=='restart'&&!peepBusy&&(state.actor===0||state.caller===0||state.target===0);
 if(affected&&wasRunning){stop();state=oldState;running=true;paused=wasPaused;coverSpectator();if(!paused)pump(token);}
 buttons();if(!running)status(selfGolden?'GOLDEN CHAIR':'TAKE YOUR SEAT',selfGolden?'Watch the table.':'Ready when you are.',selfGolden?'Start the game. Your empty chair stays in the count; the caller covers it.':'You’re back in your chair.');
 else if(!paused&&state.phase!=='restart'&&!peepBusy)updatePrompt();
};

$('#start').onclick=startRound;$('#mobile-start').onclick=startRound;$('#new-round').onclick=startRound;document.querySelectorAll('.response').forEach(b=>b.onclick=()=>respond(b.dataset.value));
document.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/SELECT|INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.key.toLowerCase()==='n'){e.preventDefault();previewFunnel();return;}if(e.key.toLowerCase()==='c'){e.preventDefault();previewChristmasTree();return;}if(['p','l'].includes(e.key.toLowerCase())){e.preventDefault();previewSanta(e.key.toLowerCase()==='l');return;}if(e.key.toLowerCase()==='i'){e.preventDefault();if(!previewSignatureMoves())$('#last').textContent='Seat a player with a signature move to preview it with I.';return;}if(e.key.toLowerCase()==='t'){e.preventDefault();previewAirTed();return;}if(e.key.toLowerCase()==='f'){e.preventDefault();previewStickDance();return;}if(e.key.toLowerCase()==='b'){e.preventDefault();previewVomit();return;}if($('#rules').open||$('#configuration').open||/SELECT|INPUT|TEXTAREA/.test(e.target.tagName))return;
 if(e.key.toLowerCase()==='q'){e.preventDefault();respond('nay',{belch:true});return;}
 const introMode={y:'olympic',r:'reverse',o:'oscillating',m:'modulus'}[e.key.toLowerCase()];if(introMode&&introOpen&&running&&!paused&&state.actor===0&&state.phase==='number'){e.preventDefault();chooseIntroMode(introMode);return}
 if(modeId==='modulus'&&running&&!paused&&state.phase!=='restart'){
  if(e.key==='Enter'&&numberDraft){e.preventDefault();respond(numberDraft);return}
  if(e.key==='Backspace'){e.preventDefault();clearNumberDraft();return}
  if(/^[0-9]$/.test(e.key)){e.preventDefault();if(numberDraft){respond(numberDraft+e.key);return}if(e.key==='1'){numberDraft='1';$('#last').textContent='Call 1… type a second digit, or Enter for 1.';numberTimer=setTimeout(()=>respond('1'),400);return}respond(e.key);return}
 }
 const value=keyResponse(e.key,keyboardLayout);if(value===null)return;e.preventDefault();respond(value)});
$('#pause').onclick=()=>{if(!running)return;clearNumberDraft();paused=!paused;waiting=false;humanPending=null;cancelAnimationFrame(frame);$('#timer-fill').style.width='0';
 if(paused){stopBelch();botPending=null;pauseSnapshot=[$('#status-tag').textContent,$('#prompt').textContent,$('#detail').textContent];speechChannel?.cancel();clearBubble();setActive(-1);status('TAKING A BREATHER','Round paused.','Talking stopped. Resume when you’re ready.');}
 else{unlockSound();speechChannel?.resume();if(pauseSnapshot)status(...pauseSnapshot);releasePause();if(state.phase!=='restart'&&!peepBusy&&state!==announcementState)pump(token);}
 buttons();};
function setMuted(value){muted=value;setSoundEnabled(!muted);$('#audio-enabled').checked=!muted;$('#preview-voice').disabled=muted;$('#sound').textContent=muted?'◖ Sound off':'◖ Sound on';$('#sound').setAttribute('aria-pressed',String(!muted));persistSettings();if(muted)speechChannel?.cancel();else{unlockSound();speechChannel?.resume();}}
$('#sound').onclick=()=>setMuted(!muted);$('#audio-enabled').onchange=()=>setMuted(!$('#audio-enabled').checked);

$('#players').onchange=()=>{$('#players').blur();pendingPeepers.clear();paidPeepers.clear();stop();$('#welcome').hidden=false;count=Number($('#players').value);seatPlayers(count);renderCast();away=selfGolden?0:-1;if(selfGolden)setAway(0,true);turns=0;bathroomAt=3;lastLoser=-1;lossStreak=0;buttons();$('#toast').hidden=true;if(!running)status('TAKE YOUR SEAT','Ready when you are.',`A court of ${count}. You and ${count-1} computer players.`)};
$('#pace').onchange=()=>$('#pace').blur();$('#voice').onchange=()=>{desiredVoice=$('#voice').value||'auto';try{localStorage.setItem('whales-voice',desiredVoice)}catch{}$('#voice').blur();};
$('#show-bubbles').onchange=()=>{setBubblesEnabled($('#show-bubbles').checked);persistSettings();$('#show-bubbles').blur();};
$('#guide').onchange=()=>{if(running&&!paused&&state.phase!=='restart')updatePrompt()};$('#view').onclick=changeView;
let helpPaused=false;$('#help').onclick=()=>{helpPaused=running&&!paused;if(helpPaused)$('#pause').click();$('#rules').showModal()};function closeHelp(){$('#rules').close();if(helpPaused&&running&&paused)$('#pause').click();helpPaused=false}$('#close-rules').onclick=closeHelp;$('#got-it').onclick=closeHelp;$('#rules').addEventListener('cancel',e=>{e.preventDefault();closeHelp()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(!muted)unlockSound();speechChannel?.resume();}if(document.hidden&&running&&!paused)$('#pause').click()});renderMode();buttons();stats();

function applyKeyboardLayout(){ $('#keyboard-layout').value=keyboardLayout;$('#nay-key').textContent=keyboardLayout==='as'?'A':'SPACE';$('#who-key').textContent=keyboardLayout==='as'?'S':'↓';}
applyKeyboardLayout();
$('#keyboard-layout').onchange=()=>{keyboardLayout=$('#keyboard-layout').value==='as'?'as':'space-arrow';try{localStorage.setItem('whales-keyboard-layout',keyboardLayout)}catch{}$('#keyboard-layout').blur();applyKeyboardLayout();if(running&&!paused&&!peepBusy&&state.phase!=='restart')updatePrompt();};
let settingsPaused=false;
$('#settings-toggle').onclick=()=>{settingsPaused=running&&!paused;if(settingsPaused)$('#pause').click();$('#configuration').showModal();};
function closeSettings(){speechChannel?.cancel();$('#configuration').close();if(settingsPaused&&running&&paused)$('#pause').click();settingsPaused=false;}
$('#close-configuration').onclick=closeSettings;$('#configuration').addEventListener('cancel',e=>{e.preventDefault();closeSettings()});
$('#table-toggle').onclick=()=>{const showing=document.body.classList.toggle('mobile-table');$('#table-toggle').textContent=showing?'Controls only':'Show table';$('#table-toggle').setAttribute('aria-pressed',String(showing));persistSettings();};

$('#preview-voice').onclick=async()=>{if(muted||!speechChannel)return;unlockSound();speechChannel.resume();const voice=selectVoice(voices(),0,$('#voice').value||'auto',{single:true});await speechChannel.speak('Whale’s Tales. Nay. Who? For God’s sake, get his number!',{...(voice?{voice}:{}),rate:1,pitch:1,volume:1});};

$('#configuration').addEventListener('change',persistSettings);if(savedSettings.sound===false)setMuted(true);if(savedSettings.controlsOnly===true){document.body.classList.remove('mobile-table');$('#table-toggle').textContent='Show table';$('#table-toggle').setAttribute('aria-pressed','false');}

restoringSettings=false;
