import express from 'express';
import {bundle} from '@remotion/bundler';
import {renderMedia,selectComposition} from '@remotion/renderer';
import {mkdir,stat,unlink,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {projectSchema,tooLong,type Project} from '../src/model';
import {synthesize,voiceStatus} from './tts';
import {buildNarration} from '../src/narration';
import {validateMovie} from './quality';
import {catalog} from '../src/catalog';
import {prepareStory} from './story';
const app=express();app.use(express.json({limit:'100kb'}));
const root=process.cwd(),output=path.join(root,'renders');await mkdir(output,{recursive:true});
type Job={status:'queued'|'speaking'|'rendering'|'checking'|'done'|'error';progress:number;message:string;error?:string;file?:string;project?:Project};
const jobs=new Map<string,Job>();let busy=false;
const browserExecutable=process.env.CHROMIUM_PATH|| (process.platform==='linux'?'/usr/bin/chromium':undefined);
const idPattern=/^[a-f0-9-]{36}$/;
app.get('/api/health',(_req,res)=>res.json({ok:true,renderer:'Remotion',busy}));
app.get('/api/voices',async(_req,res)=>{try{res.json(await voiceStatus());}catch{res.status(503).json({error:'Vozes locais indisponíveis. Execute npm ci e consulte docs/VOICES.md.'});}});
app.post('/api/render',async(req,res)=>{
 const parsed=projectSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Roteiro inválido: confira título, falas e duração.'});
 if(tooLong(parsed.data))return res.status(400).json({error:'Texto longo demais. Reduza as falas ou escolha 30 segundos.'});
 if(busy)return res.status(409).json({error:'O estúdio já está gerando um vídeo. Aguarde a conclusão.'});
 busy=true;const id=randomUUID();const job:Job={status:'queued',progress:0,message:'Preparando sua história…'};jobs.set(id,job);res.status(202).json({id});
 const directory=path.join(output,id);
 try{
  await mkdir(directory,{recursive:true});
  // Automatic shortening uses distinct complete stories from the same category;
  // user-edited dialogue is never silently replaced or accelerated.
  let project=prepareStory(parsed.data);
  const alternatives=project.status==='roteiro'?catalog.filter(p=>p.category===project.category&&p.title!==project.title).sort((a,b)=>a.scenes.reduce((n,s)=>n+s.line.length,0)-b.scenes.reduce((n,s)=>n+s.line.length,0)).slice(0,3):[];
  let prepared:ReturnType<typeof buildNarration>|undefined;
  let voiceInfo:unknown[]=[];
  for(let attempt=0;attempt<=alternatives.length;attempt++){
   if(attempt)project={...project,...structuredClone(alternatives[attempt-1])};
   const clips=[];voiceInfo=[];
   job.status='speaking';job.message=attempt?'Ajustando a história ao tempo disponível…':'Criando as vozes de Palito e Tico…';
   for(const [i,scene] of project.scenes.entries()){
    const wavPath=path.join(directory,`${i}.wav`);if(attempt)await unlink(wavPath).catch(()=>{});const audio=await synthesize(scene.line,scene.speaker,wavPath);const bytes=await readFile(wavPath);
    clips.push({duration:audio.duration,envelope:audio.envelope,src:`data:audio/wav;base64,${bytes.toString('base64')}`});
    voiceInfo.push({speaker:scene.speaker,voice:audio.voice,engine:audio.engine,duration:audio.duration,sha256:createHash('sha256').update(bytes).digest('hex')});job.progress=.05+.2*(i+1)/project.scenes.length;
   }
   try{prepared=buildNarration(project,clips);break;}catch(error){if(attempt===alternatives.length)throw error;}
  }
  if(!prepared)throw Error('Não foi possível ajustar as falas à duração. Escolha 30 segundos.');
  const narration=prepared;job.project=project;
  const serveUrl=await bundle({entryPoint:path.join(root,'src/remotion.tsx'),publicDir:path.join(root,'public')});
  job.status='rendering';job.message='Animando os personagens e renderizando o MP4…';
  const inputProps={project,narration};const composition=await selectComposition({serveUrl,id:'PalitoShow',inputProps,browserExecutable});
  const mp4=path.join(output,`${id}.mp4`);
  await renderMedia({serveUrl,composition,inputProps,codec:'h264',pixelFormat:'yuv420p',audioCodec:'aac',outputLocation:mp4,browserExecutable,concurrency:2,onProgress:({progress})=>job.progress=.25+.65*progress,chromiumOptions:{disableWebSecurity:false},crf:22});
  job.status='checking';job.progress=.92;job.message='Conferindo vídeo, vozes e sincronização…';
  const quality=await validateMovie(mp4,project.duration,narration);
  const manifest={id,project,voices:voiceInfo,narration:{...narration,scenes:narration.scenes.map((s,i)=>({...s,src:`/api/audio/${id}/${i}.wav`}))},quality,created:new Date().toISOString()};
  await writeFile(path.join(directory,'production.json'),JSON.stringify(manifest,null,2));
  job.status='done';job.progress=1;job.message='Vídeo com vozes pronto para assistir.';job.file=`/api/files/${id}.mp4`;
  await writeFile(path.join(directory,'job.json'),JSON.stringify(job));
 }catch(e){job.status='error';job.error=e instanceof Error&&e.message.length<350?e.message:'Falha ao gerar o vídeo. Confira as vozes locais, o Chromium e o FFmpeg.';console.error('Geração:',e);await unlink(path.join(output,`${id}.mp4`)).catch(()=>{});}finally{busy=false;}
});
app.get('/api/jobs/:id',async(req,res)=>{if(!idPattern.test(req.params.id))return res.status(404).json({error:'Exportação não encontrada.'});let job=jobs.get(req.params.id);if(!job){try{job=JSON.parse(await readFile(path.join(output,req.params.id,'job.json'),'utf8'));}catch{return res.status(404).json({error:'Exportação não encontrada. Tente gerar novamente.'});}}res.json(job);});
app.get('/api/productions/:id',async(req,res)=>{if(!idPattern.test(req.params.id))return res.status(404).json({error:'Produção não encontrada.'});try{res.json(JSON.parse(await readFile(path.join(output,req.params.id,'production.json'),'utf8')));}catch{res.status(404).json({error:'Produção ainda não concluída ou removida.'});}});
app.get('/api/audio/:id/:file',(req,res)=>{if(!idPattern.test(req.params.id)||!/^\d\.wav$/.test(req.params.file))return res.status(404).end();res.sendFile(path.join(output,req.params.id,req.params.file),e=>{if(e&&!res.headersSent)res.status(404).end();});});
app.get('/api/files/:file',async(req,res)=>{if(!/^[a-f0-9-]{36}\.mp4$/.test(req.params.file))return res.status(404).json({error:'Arquivo não encontrado.'});const file=path.join(output,req.params.file);try{await stat(file);res.download(file,'palito-show.mp4');}catch{res.status(404).json({error:'Arquivo não encontrado. Gere o vídeo novamente.'});}});
app.use(express.static(path.join(root,'dist')));
app.use('/api',(_req,res)=>res.status(404).json({error:'Rota não encontrada.'}));
app.get('/{*path}',(_req,res)=>res.sendFile(path.join(root,'dist/index.html')));
app.use((_err:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(400).json({error:'Requisição inválida.'}));
app.listen(Number(process.env.PORT||3001),'0.0.0.0',()=>console.log('PALITO SHOW: servidor na porta '+(process.env.PORT||3001)));
