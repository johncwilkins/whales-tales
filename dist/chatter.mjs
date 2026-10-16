export const CHATTER=[
 ['Who’s going to Ruptilla this year?','Depends. Who’s bringing the boat?'],
 ['I heard Wargo’s getting a new boat.','Heard that one before. Has he picked a color yet?'],
 ['Are we actually playing pong later?','Only if somebody finds the other paddle.'],
 ['Anybody know what time it is?','Late enough to stop asking.'],
 ['Who moved my cup?','The same guy who moved your number.'],
 ['We doing breakfast tomorrow?','Let’s get through counting first.']
];
export const chatterGap=(random=Math.random)=>20+Math.floor(random()*11);
export function chooseChatter(previous=-1,random=Math.random){const indices=CHATTER.map((_,i)=>i).filter(i=>i!==previous);const index=indices[Math.floor(random()*indices.length)];return {index,lines:CHATTER[index]}}
