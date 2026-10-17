let context=null,master=null,enabled=true;
export function unlockSound(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;try{if(!context){context=new Audio();master=context.createGain();master.gain.value=enabled ? .18 : 0;master.connect(context.destination)}context.resume().catch(()=>{});loadBelch()}catch{}}
export function setSoundEnabled(on){enabled=on;if(!on)stopBelch();if(master)master.gain.setValueAtTime(on ? .18 : 0,context.currentTime)}
export function playCue(kind){if(!enabled||!context||context.state!=='running')return;const sequences={mistake:[[155,0,.13],[110,.16,.22]],flag:[[440,0,.12],[554,.14,.12],[659,.28,.26]],chug:[[110,0,.11],[110,.15,.11],[110,.3,.11],[220,.5,.25],[330,.8,.4]],restart:[[392,0,.11],[523,.12,.11],[659,.24,.22]]};for(const [frequency,delay,length] of sequences[kind]||[]){const o=context.createOscillator(),g=context.createGain();o.type=kind==='mistake'?'sawtooth':kind==='chug'?'triangle':'sine';o.frequency.value=frequency;const t=context.currentTime+delay;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+length);o.connect(g);g.connect(master);o.onended=()=>{o.disconnect();g.disconnect()};o.start(t);o.stop(t+length+.02)}}
let belchStop=null,belchBuffer=null,belchLoading=null,belchSerial=0;
function loadBelch(){if(belchBuffer)return Promise.resolve(belchBuffer);if(!context)return Promise.resolve(null);if(!belchLoading){const audio=context;belchLoading=fetch(new URL('./belch.wav',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Belch audio unavailable');return r.arrayBuffer()}).then(bytes=>audio.decodeAudioData(bytes)).then(buffer=>belchBuffer=buffer).catch(()=>{belchLoading=null;return null;});}return belchLoading;}
export function stopBelch(){belchSerial++;belchStop?.();belchStop=null;}
export async function playBelch(onStart=()=>{}){
 stopBelch();const job=belchSerial;if(!enabled||!context||context.state!=='running')return 520;
 let timeout;const buffer=await Promise.race([loadBelch(),new Promise(resolve=>{timeout=setTimeout(()=>resolve(null),900)})]);clearTimeout(timeout);
 if(job!==belchSerial||!enabled)return 0;
 if(!buffer){onStart();return 520;}
 const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;gain.gain.value=2.5;source.connect(gain);gain.connect(master);
 let ended=false;const cleanup=()=>{if(ended)return;ended=true;try{source.stop()}catch{}source.disconnect();gain.disconnect();if(belchStop===cleanup)belchStop=null;};belchStop=cleanup;source.onended=cleanup;source.start();onStart();return Math.round(buffer.duration*1000);
}
