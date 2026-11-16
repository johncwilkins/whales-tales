import json,urllib.request,urllib.error,concurrent.futures,subprocess,threading,time
from pathlib import Path
root=Path(__file__).resolve().parent.parent
key=next(l.split('=',1)[1].strip() for l in (root.parent/'.env.local').read_text().splitlines() if l.startswith('OPENAI_API_KEY='))
catalog=json.loads(Path('/tmp/wales-voice-catalog.json').read_text());dest=root/'dist/assets/voices';dest.mkdir(parents=True,exist_ok=True)
names=set(['You','Maggie','Jack','Rosa','Eddie','June','Finn','Bea','Lou','Carson','BVN','Tichanski','Bell','Sapperstien','Wargo','Pekalsky','Saunders','Rose','Martens','Reuben','Colman','Recker','Att','Wilkins','Graham','Lefko','Levitt','Heard','Dauenheimer','Watson','McLaen','Tubby','Brodeur','Komar','Rooks'])
tasks=[];manifest={};lock=threading.Lock();completed=0;seconds=0;failed=[]
for line in catalog['lines']:
 core=line['text'] in ['Nay!','Who?','Chug!','Mexican!'] or line['text'].isdigit() or line['text'].rstrip('!') in names
 voices=catalog['voices'] if core else catalog['voices'][:2]
 manifest[line['key']]={v:f"{v}-{line['id']}.mp3" for v in voices}
 for v in voices:tasks.append((v,line))
(dest/'manifest.json').write_text(json.dumps(manifest,separators=(',',':')))
def generate(task):
 global completed,seconds
 voice,line=task;out=dest/f"{voice}-{line['id']}.mp3"
 if out.exists():return
 with lock:
  if seconds>10800:raise RuntimeError('Generation budget reserve reached')
 payload={'model':'gpt-4o-mini-tts','voice':voice,'input':line['text'],'instructions':'Adult male friends playing a counting game around a pub table. Warm, natural, conversational American English. Call short numbers and Nay or Who crisply with energy, without stretching syllables. For jokes be dry and playful. No background sounds or extra words.','response_format':'mp3','speed':1.15}
 for attempt in range(3):
  try:
   req=urllib.request.Request('https://api.openai.com/v1/audio/speech',data=json.dumps(payload).encode(),headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'})
   with urllib.request.urlopen(req,timeout=90) as r:audio=r.read()
   raw=out.with_suffix('.raw.mp3');raw.write_bytes(audio)
   subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af','silenceremove=start_periods=1:start_duration=0.015:start_threshold=-42dB,areverse,silenceremove=start_periods=1:start_duration=0.04:start_threshold=-42dB,areverse','-ar','24000','-ac','1','-b:a','64k',str(out)],check=True)
   raw.unlink()
   duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(out)]))
   with lock:
    completed+=1;seconds+=duration
    if completed%20==0:print(f'{completed}/{len(tasks)} clips; {seconds/60:.1f} audio minutes',flush=True)
   return
  except urllib.error.HTTPError as e:
   detail=e.read().decode()
   if e.code==429 and 'insufficient_quota' not in detail and attempt<2:time.sleep(8);continue
   raise RuntimeError(f'Audio API {e.code}: {detail[:180]}')
  except Exception:
   if attempt==2:raise
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 futures={pool.submit(generate,t):t for t in tasks}
 for f in concurrent.futures.as_completed(futures):
  try:f.result()
  except Exception as e:
   failed.append(str(e));print('Generation stopped: '+str(e),flush=True)
   for pending in futures:pending.cancel()
   break
Path('/tmp/wales-generation-result.json').write_text(json.dumps({'clips':completed,'seconds':seconds,'errors':failed}))
print('Finished '+str(completed)+' clips',flush=True)
