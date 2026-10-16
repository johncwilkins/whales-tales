// Mix quick answers with real thinking pauses. No fixed phone cadence.
export function responseDelay({pace='normal',phase='nay',selfCall=false,olympic=false,seat=1}={},random=Math.random){
 const u=random();
 if(olympic)return Math.round(85+u*440);
 if(selfCall)return Math.round(45+u*155);
 const beat=u<.7?160+u/.7*480:700+(u-.7)/.3*750;
 const paceScale={easy:1.15,normal:1,fast:.6}[pace]??1;
 const personality=.9+(seat%3)*.1;
 return Math.round(beat*paceScale*personality*(phase==='who'?.85:phase==='number'?1.05:1));
}
