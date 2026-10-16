const ordinary=[
 'Hold it! That’s on you!',
 'Wrong turn! Take a sip.',
 'Nice try. That one’s yours!',
 'Caught you! Cup up.',
 'You’ve lost the plot. Take a sip!',
 'Objection! That’s your drink.',
 'Hold it! A bold strategy, being completely wrong.',
 'That’s on you! We appreciate the confidence.',
 'Wrong turn! You’ve navigated straight into a drink.',
 'Cup up! You’ve been defeated by single digits.'
];
const peep=[
 'Peepage! That Nay wasn’t yours.',
 'Peepage! Take your drink.',
 'Peepage! Nobody rang your doorbell. Cup up.',
 'Peepage! Wrong chair, big mouth. Take a sip.',
 'Peepage! Save some Nay for the rest of us.',
 'Peepage! An excellent answer to somebody else’s question.',
 'Peepage! Your enthusiasm has earned you a drink.',
 'Peepage! Thanks for volunteering. Cup up.',
 'Peepage! All mouth, no invitation.',
 'Peepage! You’re not the main character of this number.',
 'Peepage! We’ll call you when we need the commentary.',
 'Peepage! Your chair was minding its own business.',
 'Peepage! We found the table’s unsolicited spokesperson.',
 'Peepage! That answer came from the cheap seats.'
];
const silence=[
 'Silence! Drink and start.',
 'Silence! That’s your drink. Start us off.',
 'Silence! Anybody home? Drink and start.',
 'Silence! Blink twice if you know your number.',
 'Silence! That chair came with a speaking part.',
 'Silence! We ordered a Nay, not a moment of reflection.',
 'Silence! The empty chair’s putting in more effort.',
 'Silence! Your turn wasn’t a suggestion. Drink and start.',
 'Silence! Somebody check if that chair has a pulse.',
 'Silence! You’ve been out-talked by the furniture.',
 'Silence! We can hear the number rolling around in there.',
 'Silence! Your Nay appears to be on back order.',
 'Silence! Are you buffering or just decorative?',
 'Silence! That was your cue, not a sightseeing opportunity.'
];
const quick=['Quick Who! Let them say Nay first.','Quick Who! Jumped the gun. Cup up.','Quick Who! Easy there. That’s your drink.'];
const slow=[
 'Sundial tails! Any time this week.',
 'Sundial tails! We’re growing roots over here.',
 'Sundial tails! The suspense is killing us.',
 'Sundial tails! We’ll put your answer in the next newsletter.',
 'Sundial tails! Even the beer’s getting impatient.',
 'Sundial tails! Did you send that number by mail?',
 'Sundial tails! The ice caps moved faster.',
 'Sundial tails! Should we come back after breakfast?',
 'Sundial tails! Your answer’s arrived by sailboat.',
 'Sundial tails! We’ve aged out of this conversation.',
 'Sundial tails! The committee can stop deliberating now.',
 'Sundial tails! Even the closet light’s lost interest.'
];
const wrong=[
 'Wrong word! Right mouth, wrong script.',
 'Wrong word! There are only three things to say. Impressive.',
 'Wrong word! The answer was hiding in the instructions.',
 'Wrong word! The vocabulary was limited for a reason.',
 'Wrong word! A strong entry in the wrong competition.',
 'Wrong word! That wasn’t one of the options.',
 'Wrong word! You had one syllable to work with.',
 'Wrong word! The chair understood the assignment better.',
 'Wrong word! Close, if we were playing a different game.',
 'Wrong word! Try listening with the ears next time.',
 'Wrong word! Your brain called the wrong department.',
 'Wrong word! We’re going to need a smaller instruction manual.'
];
const flag=[
 'For God’s sake, get his number!',
 'Flag on the play! Someone get this man a calculator.',
 'Two in a row! That flag’s doing more work than you are.',
 'Flag up! We’ve identified the weak link.',
 'Two in a row! Your chair’s on a losing streak.',
 'Flag on the play! One more and the cup gets emptied.',
 'There’s your flag! We should’ve brought a tutor.',
 'Two in a row! For God’s sake, get his number!'
];
const chug=[
 'Three in a row! The table calls for a chug!',
 'Three in a row! Your cup’s got a meeting with gravity. Chug!',
 'Three in a row! You’ve unlocked the bottom of the cup. Chug!',
 'Three in a row! A perfect record of being wrong. Chug!',
 'Three in a row! Less counting, more tilting. Chug!',
 'Three in a row! Time for the liquid portion of the exam. Chug!',
 'Three in a row! The table has reached a drinking verdict. Chug!',
 'Three in a row! Your flag’s retired. Your cup’s up. Chug!'
];
const recent=new Map(),remaining=new Map();
function choose(kind,pool,previous,random){
 const history=recent.get(kind)||[];
 const bag=remaining.get(kind)?.length?remaining.get(kind):[...pool];
 let choices=bag.filter(s=>s!==previous&&!history.includes(s));if(!choices.length)choices=bag.filter(s=>s!==previous);if(!choices.length)choices=pool.filter(s=>s!==previous);
 const line=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
 remaining.set(kind,bag.filter(s=>s!==line));recent.set(kind,[...history,line].slice(-Math.min(3,pool.length-1)));return line;
}
export function pickCallout(reason,name='',previous='',random=Math.random){
 const kind=/peepage/i.test(reason)?'peep':/silence/i.test(reason)?'silence':/quick who/i.test(reason)?'quick':/sundial|time|slow|hesitat/i.test(reason)?'slow':/said |wrong word|wrong reply/i.test(reason)?'wrong':'ordinary';
 const prefix=name?name+'! ':'';
 return prefix+choose(kind,{peep,silence,quick,slow,wrong,ordinary}[kind],previous.startsWith(prefix)?previous.slice(prefix.length):previous,random);
}
export function pickCeremonyCallout(kind,random=Math.random){return choose(kind,kind==='flag'?flag:chug,'',random)}
