// Generated once; gameplay uses static files and never calls an AI service.
const base=new URL('./assets/voice-library/',import.meta.url);
export const normalizeLine=text=>text.normalize('NFKC').replace(/[‘’]/g,"'").replace(/…/g,'...').replace(/\s+/g,' ').trim();
const voiceNames=['cedar','ash','onyx','echo'];
export function voiceForSpeaker(id='house'){let hash=0;for(const c of String(id))hash=(hash*31+c.charCodeAt(0))>>>0;return voiceNames[hash%voiceNames.length];}
export function clipFiles(manifest,text,voice){const key=normalizeLine(text),direct=manifest[key];if(direct)return [direct[voice]||Object.values(direct)[voiceNames.indexOf(voice)%Object.keys(direct).length]];const split=key.indexOf('! ');if(split<0)return null;const name=manifest[key.slice(0,split+1)],line=manifest[key.slice(split+2)];return name&&line?[name[voice]||Object.values(name)[0],line[voice]||Object.values(line)[0]]:null;}
let context=null;
export function unlockRecordedVoices(){try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;context??=new Audio();context.resume().catch(()=>{});}catch{}}
export class RecordedSpeechChannel{
 constructor(fallback){this.fallback=fallback;this.active=null;this.buffers=new Map();this.manifest=fetch(new URL('manifest.json',base)).then(r=>{if(!r.ok)throw Error('Voice library unavailable');return r.json()}).catch(()=>null);}
 resume(){unlockRecordedVoices();this.fallback?.resume();}
 cancel(){const job=this.active;this.active=null;if(job){job.cancelled=true;try{job.source?.stop()}catch{}job.finish();}this.fallback?.cancel();}
 async load(file){if(!context)throw Error('Audio not unlocked');if(!this.buffers.has(file)){if(this.buffers.size>=8){const oldest=[...this.buffers.keys()].find(f=>!f.endsWith('-0.mp3'));if(oldest)this.buffers.delete(oldest);}const audio=context;this.buffers.set(file,fetch(new URL(file,base)).then(r=>{if(!r.ok)throw Error('Missing voice clip');return r.arrayBuffer()}).then(b=>audio.decodeAudioData(b)).catch(e=>{this.buffers.delete(file);throw e}));}return this.buffers.get(file);}
 preload(){this.manifest.then(manifest=>{if(!manifest||!context)return;for(const [text,entries] of Object.entries(manifest))if(/^(\d+|Nay!|Who\?)$/.test(text)||text.startsWith("I'll start. Whale"))for(const file of Object.values(entries))this.load(file.file).catch(()=>{});});}
 speak(text,options={}){
  this.cancel();let resolve;const done=new Promise(r=>resolve=r),job={cancelled:false,source:null,finish:resolve};this.active=job;
  const live=()=>this.active===job&&!job.cancelled;
  let began=false;const begin=()=>{if(live()&&!began){began=true;options.onStart?.();}};
  (async()=>{try{
   let timeout;const manifest=await Promise.race([this.manifest,new Promise(r=>{timeout=setTimeout(()=>r(null),1800)})]);clearTimeout(timeout);
   if(!live())return;
   const files=options.recorded===false?null:manifest&&clipFiles(manifest,text,voiceForSpeaker(options.speakerId));
   if(!files||!context||context.state!=='running')throw Error('Use device voice');
   let loadingTimer;const buffers=await Promise.race([Promise.all(files.map(f=>this.load(f.file))),new Promise((_,reject)=>{loadingTimer=setTimeout(()=>reject(Error('Voice loading timeout')),2500)})]).finally(()=>clearTimeout(loadingTimer));
   for(const [index,buffer] of buffers.entries()){
    if(!live())return;
    await new Promise(end=>{const source=context.createBufferSource(),gain=context.createGain();job.source=source;source.buffer=buffer;source.playbackRate.value=Math.max(.85,Math.min(1.35,(options.rate||1.6)/((/^\d+$|^Nay!$|^Who\?$/.test(text))?1.6:1.12)));gain.gain.value=options.volume??1;source.connect(gain);gain.connect(context.destination);source.onended=()=>{source.disconnect();gain.disconnect();end()};source.start(0,files[index].offset,files[index].duration);begin();});
   }
  }catch{
   if(live()&&!began){const {speakerId,recorded,...nativeOptions}=options;if(this.fallback)await this.fallback.speak(text,{...nativeOptions,onStart:begin});else begin();}
  }finally{if(live())this.active=null;job.finish();}
  })().catch(()=>job.finish());
  return done;
 }
}
