export const CHATTER=[
 ['Does anyone know if Les is coming over?','Save him a chair. Someone else can use the practice.'],
 ['Anyone heard from Les? Is he coming over?','Tell him we’ve already warmed up the excuses.'],
 ['Who’s going to Ruptilla this year?','Depends. Who’s bringing the boat?'],
 ['I heard Wargo’s getting a new boat.','Heard that one before. Has he picked a color yet?'],
 ['Are we actually playing pong later?','Only if somebody finds the other paddle.'],
 ['Anybody know what time it is?','Late enough to stop asking.'],
 ['Who moved my cup?','The same guy who moved your number.'],
 ['We doing breakfast tomorrow?','Let’s get through counting first.']
];
export const chatterGap=(random=Math.random)=>20+Math.floor(random()*11);
export const TUBBY_CHATTER=[
 ['Do we have to listen to this Tubby music?','It’s a classic. You people have no taste.'],
 ['Tubby, did you bring every CD you own?','Just the essentials. The rest are in the car.'],
 ['Whose idea was it to let Tubby DJ?','You’re welcome. This table needed some culture.']
];
export function chooseChatter(previous=-1,random=Math.random,presentIds=[]){const pool=[...CHATTER,...(presentIds.includes('tubby')?TUBBY_CHATTER:[])];const indices=pool.map((_,i)=>i).filter(i=>i!==previous);const index=indices[Math.floor(random()*indices.length)];return {index,lines:pool[index],tubby:index>=CHATTER.length};}
