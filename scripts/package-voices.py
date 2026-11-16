import json,subprocess,shutil
from pathlib import Path
root=Path(__file__).resolve().parent.parent;raw=root/'dist/assets/voices';dest=root/'dist/assets/voice-library';dest.mkdir(parents=True,exist_ok=True)
manifest=json.loads((raw/'manifest.json').read_text());durations={}
for filename in {f for entries in manifest.values() for f in entries.values()}:
 p=raw/filename
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(p)],stderr=subprocess.DEVNULL))
 durations[filename]=duration
# Reject empty or overlong takes before packing; a clean alternate take keeps the phrase usable.
for text,entries in list(manifest.items()):
 core=text.isdigit() or text in ('Nay!','Who?','Chug!','Mexican!')
 maximum=2.5 if core else max(4,len(text.split())*.8+2)
 valid=[f for f in entries.values() if .15<durations[f]<maximum]
 if not valid:
  if core:raise RuntimeError('No clean core take: '+text)
  del manifest[text];print('Device fallback reserved for:',text);continue
 for voice,f in entries.items():
  if not .15<durations[f]<maximum:shutil.copyfile(raw/valid[0],raw/f);durations[f]=durations[valid[0]]
lookup={}
for voice in ['cedar','ash','onyx','echo']:
 files=[entries[voice] for entries in manifest.values() if voice in entries]
 for batch in range(0,len(files),22):
  group=files[batch:batch+22];name=f'{voice}-{batch//22}.mp3';offset=0
  pcm=b''
  for f in group:
   part=subprocess.check_output(['ffmpeg','-v','error','-i',str(raw/f),'-f','s16le','-ar','24000','-ac','1','pipe:1'])
   duration=len(part)/48000
   lookup[f]={'file':name,'offset':round(offset,6),'duration':duration};offset+=duration;pcm+=part
  subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ar','24000','-ac','1','-i','pipe:0','-b:a','64k',str(dest/name)],input=pcm,check=True)
  actual=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(dest/name)]))
  if abs(actual-offset)>.15:raise RuntimeError('Sprite timing mismatch: '+name)
result={text:{voice:lookup[file] for voice,file in entries.items()} for text,entries in manifest.items()}
(dest/'manifest.json').write_text(json.dumps(result,separators=(',',':')))
print(f'Packaged {len(lookup)} clips into {len(list(dest.glob("*.mp3")))} audio bundles')
