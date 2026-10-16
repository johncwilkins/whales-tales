import assert from 'node:assert/strict';
import {responseDelay} from '../dist/timing.mjs';
import {pickCallout,pickCeremonyCallout} from '../dist/callouts.mjs';
const samples=Array.from({length:100},(_,i)=>responseDelay({pace:'normal',phase:'nay',seat:1},()=>i/100));assert(Math.min(...samples)>=150);assert(Math.max(...samples)>1300);assert(new Set(samples).size>90);assert(samples.filter(n=>n>=700).length>=25);
for(let i=0;i<100;i++){const random=()=>i/100;for(const pace of ['easy','normal','fast'])for(const phase of ['nay','who','number'])for(let seat=1;seat<=8;seat++){
 const ordinary=responseDelay({pace,phase,seat},random);assert(ordinary>=70&&ordinary<=2000);
 const olympic=responseDelay({pace,phase,seat,olympic:true},random);assert(olympic>=85&&olympic<=525);
 const self=responseDelay({pace,phase,seat,selfCall:true},random);assert(self>=45&&self<=200);
}}
for(const reason of ['Silence!','Sundial tails!','Peepage!']){const seen=new Set(),recent=[];let previous='';for(let n=0;n<40;n++){const line=pickCallout(reason,'',previous,()=>0);assert(line.startsWith(reason.split('!')[0]+'!'));assert(!recent.includes(line));assert(!line.includes('undefined'));seen.add(line);recent.push(line);if(recent.length>3)recent.shift();previous=line;}assert(seen.size>=7);}
for(const kind of ['flag','chug']){const seen=new Set(),recent=[];for(let n=0;n<40;n++){const line=pickCeremonyCallout(kind,()=>0);assert(line&&typeof line==='string');assert(!recent.includes(line));if(kind==='chug')assert.match(line,/Chug|chug/);seen.add(line);recent.push(line);if(recent.length>3)recent.shift();}assert(seen.size>=7);}
// Small pools (Quick Who) remain valid even after repeated use.
let previous='';for(let n=0;n<20;n++){const line=pickCallout('Quick Who!','Heard',previous,()=>0);assert.match(line,/^Heard! Quick Who!/);assert(!line.includes('undefined'));assert.notEqual(line,previous);previous=line;}
console.log('Passed: varied human-scale bot timing, Olympic/self-call bounds, all five rotating callout categories, three-line repetition protection and small-pool recovery.');
