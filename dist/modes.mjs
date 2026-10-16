export const MODES={
 regular:{name:'Regular tales',direction:1,description:'Clockwise · Nay → Who → number'},
 reverse:{name:'Reverse tails',direction:-1,description:'Counterclockwise · Nay → Who → number'},
 olympic:{name:'Olympic tails',direction:1,olympic:true,description:'Clockwise · NUMBERS ONLY · respond quickly'},
 'olympic-reverse':{name:'Olympic reverse tails',direction:-1,olympic:true,description:'Counterclockwise · NUMBERS ONLY · respond quickly'},
 oscillating:{name:'Oscillating tails',direction:1,description:'Direction switches after EVERY number call'},
 modulus:{name:'Modulus tails',direction:1,multiplier:2,description:'Clockwise · numbers up to twice the player count'}
};
export function chooseAlternate(random=Math.random){const n=random();return n<.25?'reverse':n<.5?'olympic':n<.7?'olympic-reverse':n<.96?'oscillating':'modulus'}
export function specialGap(random=Math.random){return 10+Math.floor(random()*6)}
export function modeAnnouncement(id,count){const m=MODES[id];return id==='regular'?'Whale’s Tales, calls tales on…':`${m.name}! ${id==='oscillating'?'Clockwise first, then alternate direction each call.':m.direction<0?'Count counterclockwise.':'Count clockwise.'} ${m.olympic?'Numbers only. No Nay, no Who. Keep it quick!':id==='modulus'?`One to ${count*2}. Twice around the table!`:'Nay, Who, then your number.'}`}
