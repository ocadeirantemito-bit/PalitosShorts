import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {generate} from '../src/catalog';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3001';
const project=generate('Humor',15,true);project.title='Minha primeira história';project.scenes[0].line='Hoje eu criei meu primeiro vídeo!';
const start=await fetch(`${origin}/api/render`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(project)});assert.equal(start.status,202);const {id}=await start.json();
const deadline=Date.now()+600000;
let done=false;
while(Date.now()<deadline){const response=await fetch(`${origin}/api/jobs/${id}`);assert.equal(response.status,200);const job=await response.json();console.log(job.status,Math.round(job.progress*100)+'%');assert.notEqual(job.status,'error',job.error);if(job.status==='done'){const file=await fetch(`${origin}${job.file}`);assert.equal(file.status,200);await writeFile('examples/palito-show.mp4',Buffer.from(await file.arrayBuffer()));done=true;break;}await new Promise(r=>setTimeout(r,4000));}
assert.ok(done,'Renderização excedeu 10 minutos');
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json','examples/palito-show.mp4'],{encoding:'utf8'}));const video=probe.streams.find((s:any)=>s.codec_type==='video');assert.equal(video.codec_name,'h264');assert.equal(video.width,1080);assert.equal(video.height,1920);assert.equal(Number(video.duration),15);assert.equal(Number(video.nb_frames),450);assert.ok(Math.abs(Number(probe.format.duration)-15)<0.1);assert.ok(probe.streams.some((s:any)=>s.codec_type==='audio'&&s.codec_name==='aac'));
execFileSync('ffmpeg',['-v','error','-i','examples/palito-show.mp4','-f','null','-'],{stdio:'inherit'});console.log('MP4 validado: H.264, 1080×1920, 15s, AAC e decodificação integral sem erros.');
