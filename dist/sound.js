let context=null,master=null,enabled=true;
export function unlockSound(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;try{if(!context){context=new Audio();master=context.createGain();master.gain.value=enabled ? .18 : 0;master.connect(context.destination)}context.resume().catch(()=>{})}catch{}}
export function setSoundEnabled(on){enabled=on;if(!on)stopBelch();if(master)master.gain.setValueAtTime(on ? .18 : 0,context.currentTime)}
export function playCue(kind){if(!enabled||!context||context.state!=='running')return;const sequences={mistake:[[155,0,.13],[110,.16,.22]],flag:[[440,0,.12],[554,.14,.12],[659,.28,.26]],chug:[[110,0,.11],[110,.15,.11],[110,.3,.11],[220,.5,.25],[330,.8,.4]],restart:[[392,0,.11],[523,.12,.11],[659,.24,.22]]};for(const [frequency,delay,length] of sequences[kind]||[]){const o=context.createOscillator(),g=context.createGain();o.type=kind==='mistake'?'sawtooth':kind==='chug'?'triangle':'sine';o.frequency.value=frequency;const t=context.currentTime+delay;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+length);o.connect(g);g.connect(master);o.onended=()=>{o.disconnect();g.disconnect()};o.start(t);o.stop(t+length+.02)}}
let belchStop=null;
export function stopBelch(){belchStop?.();belchStop=null;}
export function playBelch(){
 stopBelch();if(!enabled||!context||context.state!=='running')return;
 const t=context.currentTime,duration=.52,voice=context.createOscillator(),flutter=context.createOscillator(),depth=context.createGain(),throat=context.createBiquadFilter(),low=context.createBiquadFilter(),gain=context.createGain();
 voice.type='sawtooth';voice.frequency.setValueAtTime(92,t);voice.frequency.exponentialRampToValueAtTime(39,t+duration);flutter.type='sine';flutter.frequency.setValueAtTime(27,t);flutter.frequency.linearRampToValueAtTime(17,t+duration);depth.gain.value=14;flutter.connect(depth);depth.connect(voice.frequency);
 throat.type='bandpass';throat.frequency.setValueAtTime(480,t);throat.frequency.exponentialRampToValueAtTime(220,t+duration);throat.Q.value=1.4;low.type='lowpass';low.frequency.value=1200;
 gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(1.3,t+.035);gain.gain.setValueAtTime(.95,t+.18);gain.gain.linearRampToValueAtTime(.6,t+.38);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
 voice.connect(throat);throat.connect(low);low.connect(gain);gain.connect(master);
 // Short breathy noise gives the low flutter a rough, throaty edge.
 const noise=context.createBufferSource(),buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);let seed=713;for(let i=0;i<data.length;i++){seed=seed*16807%2147483647;data[i]=(seed/2147483647-.5)*.18;}noise.buffer=buffer;noise.connect(throat);
 let ended=false;const cleanup=()=>{if(ended)return;ended=true;for(const node of [voice,flutter,noise]){try{node.stop()}catch{}}for(const node of [voice,flutter,depth,noise,throat,low,gain])node.disconnect();if(belchStop===cleanup)belchStop=null;};belchStop=cleanup;voice.onended=cleanup;
 voice.start(t);flutter.start(t);noise.start(t);voice.stop(t+duration);flutter.stop(t+duration);noise.stop(t+duration);
}
