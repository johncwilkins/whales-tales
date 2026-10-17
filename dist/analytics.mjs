import {goatCounterEndpoint} from './analytics-config.mjs';
// Leave the endpoint empty until the owner supplies their GoatCounter site.
if(goatCounterEndpoint){
 try{const url=new URL(goatCounterEndpoint);if(url.protocol==='https:'&&url.pathname==='/count'){
 const script=document.createElement('script');script.async=true;script.src='https://gc.zgo.at/count.js';script.dataset.goatcounter=url.href;document.head.append(script);
 }}catch{/* An incomplete analytics address must never affect play. */}
}
