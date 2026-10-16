// One native dispatch per line. Missing mobile events must never replay speech.
export class SpeechChannel{
 constructor(native,Utterance=globalThis.SpeechSynthesisUtterance){this.native=native;this.Utterance=Utterance;this.active=null}
 resume(){try{if(this.native.paused)this.native.resume?.()}catch{}}
 cancel(){const job=this.active;this.active=null;if(job){job.done=true;for(const t of job.timers)clearTimeout(t);job.resolve();}try{if(job||this.native.speaking||this.native.pending)this.native.cancel()}catch{}}
 speak(text,options={}){
  const {onStart,maxDuration=0,maxStartDelay=1800,...utteranceOptions}=options;
  const interrupted=Boolean(this.active||this.native.speaking||this.native.pending);this.cancel();
  return new Promise(resolve=>{
   const job={done:false,resolve,timers:new Set(),started:false,began:Date.now()};this.active=job;
   const live=()=>this.active===job&&!job.done;
   const later=(fn,ms)=>{if(!live())return;const t=setTimeout(()=>{job.timers.delete(t);if(live())fn()},ms);job.timers.add(t)};
   const begin=()=>{if(!live()||job.started)return;job.started=true;if(maxDuration)later(()=>finish(true),maxDuration);onStart?.()};
   const finish=(cancelNative=false)=>{if(!live())return;begin();if(!live())return;job.done=true;for(const t of job.timers)clearTimeout(t);this.active=null;resolve();if(cancelNative)try{this.native.cancel()}catch{}};
   const check=()=>{
    if(!live())return;
    // Some phone engines speak normally but omit onstart/onboundary.
    if(this.native.speaking)begin();
    if(!job.started&&Date.now()-job.began>=maxStartDelay){finish(true);return}
    if(job.started&&!this.native.speaking&&!this.native.pending){finish();return}
    if(Date.now()-job.began>Math.max(4000,text.length*120)){finish(true);return}
    later(check,180);
   };
   const play=()=>{if(!live())return;job.began=Date.now();this.resume();const u=new this.Utterance(text);Object.assign(u,utteranceOptions);u.onstart=begin;u.onboundary=begin;u.onend=()=>finish();u.onerror=()=>finish(true);try{this.native.speak(u);later(check,180)}catch{finish(true)}};
   if(interrupted)later(play,45);else play();
  });
 }
}
