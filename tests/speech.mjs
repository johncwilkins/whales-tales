import assert from 'node:assert/strict';
import {SpeechChannel} from '../dist/speech.mjs';
let clock=0,id=0,resumes=0;const timers=new Map(),spoken=[];Date.now=()=>clock;
globalThis.setTimeout=(fn,ms)=>(timers.set(++id,{fn,due:clock+ms}),id);globalThis.clearTimeout=i=>timers.delete(i);
const native={pending:false,speaking:false,paused:false,resume(){resumes++;this.paused=false},cancel(){this.pending=false;this.speaking=false;spoken.at(-1)?.onerror?.()},speak(u){spoken.push(u);this.pending=true}};
const channel=new SpeechChannel(native,class{constructor(text){this.text=text}});
const tick=async()=>{const e=[...timers].sort((a,b)=>a[1].due-b[1].due)[0];assert(e);timers.delete(e[0]);clock=e[1].due;e[1].fn();await Promise.resolve()};
let starts=0,promise=channel.speak('3',{onStart:()=>starts++});assert.equal(starts,0);native.pending=false;native.speaking=true;spoken.at(-1).onstart();spoken.at(-1).onboundary();assert.equal(starts,1);native.speaking=false;spoken.at(-1).onend();await promise;
promise=channel.speak('4',{onStart:()=>starts++});const canceled=spoken.at(-1);channel.cancel();await promise;canceled.onstart();assert.equal(starts,1);
// Missing start, boundary and end events must NOT replay an audible word.
for(const flags of ['speaking','pending','neither']){const before=spoken.length;promise=channel.speak('Nay!',{maxDuration:550,maxStartDelay:900});native.pending=flags==='pending';native.speaking=flags==='speaking';let done=false;promise.then(()=>done=true);for(let n=0;n<15&&!done;n++)await tick();assert(done);assert.equal(spoken.length,before+1);assert.equal(channel.active,null);}
// Post-start and pre-start native errors both finish once, never retry.
for(const started of [true,false]){const before=spoken.length;promise=channel.speak('Who?');if(started)spoken.at(-1).onstart();spoken.at(-1).onerror();await promise;assert.equal(spoken.length,before+1);}
assert.equal(resumes,0,'Do not repeatedly resume an unpaused mobile engine');native.paused=true;channel.resume();assert.equal(resumes,1);channel.resume();assert.equal(resumes,1);
// A natural end settles immediately; a stuck speaking flag releases at the cap.
promise=channel.speak('Nay!',{maxDuration:550});native.pending=false;native.speaking=true;spoken.at(-1).onstart();const began=clock;let done=false;promise.then(()=>done=true);for(let n=0;n<10&&!done;n++)await tick();await promise;assert.equal(clock-began,550);assert.equal(native.speaking,false);
// Random idle gaps cannot make a retired utterance reappear.
for(const gap of [150,750,1450]){const before=spoken.length;promise=channel.speak('7',{maxDuration:550,maxStartDelay:900});native.pending=false;native.speaking=true;await tick();native.speaking=false;await tick();await promise;const old=spoken.at(-1);clock+=gap;old.onend();old.onstart();assert.equal(spoken.length,before+1);assert.equal(timers.size,0);}
console.log('Passed: one dispatch per line with missing mobile events, errors and random idle gaps; no retry duplicates, stale callbacks or unpaused resume calls; speech caps, cancellation and audible-start callbacks.');
