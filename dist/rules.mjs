export function targetFor(origin,number,count,direction=1){return ((origin+direction*number)%count+count)%count}
export function nextStep(state,value,count,away=-1,mode={}){
 if(state.phase==='number'){
  const origin=state.numberOrigin??state.actor,seat=targetFor(origin,Number(value),count,mode.direction??1),covered=seat===away,actor=covered?state.actor:seat;
  return {phase:mode.olympic?'number':'nay',caller:state.actor,actor,target:actor,goldenChair:covered?seat:-1,countOrigin:origin,calledNumber:Number(value),calledSeat:seat,...(mode.olympic?{numberOrigin:seat}:{})};
 }
 if(state.phase==='nay')return {...state,phase:'who',actor:state.caller};
 return {...state,phase:'number',actor:state.target,numberOrigin:state.goldenChair>=0?state.goldenChair:state.target};
}
export function validResponse(phase,value,count){return phase==='number'?Number.isInteger(Number(value))&&Number(value)>=1&&Number(value)<=count:value===phase}
export function penaltyFor(lastLoser,streak,loser){const next=lastLoser===loser?streak+1:1;return {lastLoser:next>=3?-1:loser,streak:next>=3?0:next,flag:next===2,chug:next>=3,consecutive:next}}
export function keyResponse(key,layout='as'){if(key.toLowerCase()==='a'||key===' ')return 'nay';if(key.toLowerCase()==='s'||key==='ArrowDown')return 'who';return /^[1-9]$/.test(key)?key:null}
