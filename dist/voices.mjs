export function voiceScore(v){
 let score=/natural|neural/i.test(v.name)?100:/premium/i.test(v.name)?95:/enhanced/i.test(v.name)?85:/siri/i.test(v.name)?80:/online/i.test(v.name)?65:/google/i.test(v.name)?55:/ava|allison|samantha|evan|daniel|oliver|karen|tessa|serena|moira|alex/i.test(v.name)?40:10;
 if(v.localService===false)score+=10;if(/^en-US/i.test(v.lang))score+=8;else if(/^en-GB/i.test(v.lang))score+=5;
 if(/David Desktop|Zira Desktop|Mark Desktop|eSpeak|Microsoft Sam/i.test(v.name))score-=30;
 if(/^(Fred|Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Junior|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox)(\b|$)/i.test(v.name))score-=100;
 return score;
}
export function rankVoices(list){return list.filter(v=>/^en(?:-|_)/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a))}
export function selectVoice(list,player,uri='auto',{single=false}={}){
 const ranked=rankVoices(list);if(uri!=='auto'){const chosen=ranked.find(v=>(v.voiceURI||v.name)===uri);if(chosen)return chosen}
 if(!ranked.length)return undefined;if(single)return ranked[0];
 const quality=ranked.filter(v=>voiceScore(v)>=voiceScore(ranked[0])-12).slice(0,6);return quality[player%quality.length];
}
