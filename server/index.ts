import {readVoiceConfig,saveVoiceConfig,publicVoiceConfig,elevenVoices} from './elevenlabs';
import {everydayCatalog} from '../src/everyday';
import express from 'express';
import {bundle} from '@remotion/bundler';
import {makeCancelSignal,renderMedia,selectComposition} from '@remotion/renderer';
import {existsSync} from 'node:fs';
import {mkdir,stat,unlink,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {projectSchema,tooLong,type Project} from '../src/model';
import {synthesize,voiceStatus} from './tts';
import {buildNarration} from '../src/narration';
import {validateMovie} from './quality';
import {catalog} from '../src/catalog';
import {prepareStory} from './story';
import {findBrowserExecutable} from './runtime';
const app=express();app.use(express.json({limit:'100kb'}));
const root=process.cwd(),output=path.join(root,'renders');await mkdir(output,{recursive:true});
type Job={status:'queued'|'speaking'|'rendering'|'checking'|'done'|'error';progress:number;message:string;error?:string;file?:string;project?:Project;narration?:ReturnType<typeof buildNarration>};
const jobs=new Map<string,Job>();let busy=false;
const browserExecutable=findBrowserExecutable();
const browserReady=Boolean(browserExecutable&&existsSync(browserExecutable));
let serveUrlPromise:Promise<string>|undefined;
const getServeUrl=()=>serveUrlPromise??=(bundle({entryPoint:path.join(root,'src/remotion.tsx'),publicDir:path.join(root,'public')}).catch(error=>{serveUrlPromise=undefined;throw error;}));
const idPattern=/^[a-f0-9-]{36}$/;
// Credentials are writable only from the local browser on this computer.
app.use('/api/voice-settings',(req,res,next)=>{const ip=req.socket.remoteAddress;const local=ip==='127.0.0.1'||ip==='::1'||ip==='::ffff:127.0.0.1';const origin=req.headers.origin;const host=req.headers.host;let validOrigin=!origin;try{if(origin){const u=new URL(origin);validOrigin=['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&['3001','5173'].includes(u.port);}}catch{}if(!local||!host||!['localhost','127.0.0.1','[::1]'].some(h=>host===h||host.startsWith(h+':'))||!validOrigin)return res.status(403).json({error:'Configure as vozes no próprio computador, abrindo localhost.'});next();});
app.get('/api/voice-settings',async(_req,res)=>{try{res.json(publicVoiceConfig(await readVoiceConfig()));}catch(e){res.status(400).json({error:(e as Error).message});}});
app.post('/api/voice-settings',async(req,res)=>{if(busy)return res.status(409).json({error:'Aguarde o vídeo terminar antes de mudar as vozes.'});try{await saveVoiceConfig(req.body);res.json(publicVoiceConfig(await readVoiceConfig()));}catch{res.status(400).json({error:'Confira a chave, o provedor e os IDs das duas vozes.'});}});
app.get('/api/voice-settings/voices',async(_req,res)=>{try{res.json({voices:await elevenVoices(await readVoiceConfig())});}catch(e){res.status(400).json({error:(e as Error).message});}});
app.post('/api/voice-settings/test',async(req,res)=>{if(busy)return res.status(409).json({error:'Aguarde o vídeo terminar.'});const speaker=req.body?.speaker;if(!['PALITO','TICO'].includes(speaker))return res.status(400).json({error:'Personagem inválido.'});busy=true;const destination=path.join(root,'.cache',`voice-test-${randomUUID()}.wav`);try{await synthesize(speaker==='PALITO'?'Amor, o salário caiu. Mas os boletos chegaram primeiro.':'Então vamos fazer o jantar em casa. Hoje o restaurante é nosso.',speaker,destination);res.json({audio:`data:audio/wav;base64,${(await readFile(destination)).toString('base64')}`});}catch(e){res.status(400).json({error:(e as Error).message});}finally{busy=false;await unlink(destination).catch(()=>{});}});
app.get('/api/health',(_req,res)=>res.json({ok:true,renderer:'Remotion',busy,browserReady,browser:browserReady?path.basename(browserExecutable!):null}));
app.get('/api/voices',async(_req,res)=>{try{res.json(await voiceStatus());}catch{res.status(503).json({error:'Vozes locais indisponíveis. Execute npm ci e consulte docs/VOICES.md.'});}});
app.post('/api/render',async(req,res)=>{
 const parsed=projectSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Roteiro inválido: confira título, falas e duração.'});
 if(tooLong(parsed.data))return res.status(400).json({error:'Texto longo demais. Reduza as falas ou escolha 30 segundos.'});
 if(!browserReady)return res.status(503).json({error:'Google Chrome ou Microsoft Edge não foi encontrado. Instale um deles ou configure CHROMIUM_PATH antes de iniciar o aplicativo.'});
 if(busy)return res.status(409).json({error:'O estúdio já está gerando um vídeo. Aguarde a conclusão.'});
 busy=true;const id=randomUUID();const job:Job={status:'queued',progress:0,message:'Preparando sua história…'};jobs.set(id,job);res.status(202).json({id});
 const directory=path.join(output,id);
 try{
  await mkdir(directory,{recursive:true});
  // Automatic shortening uses distinct complete stories from the same category;
  // user-edited dialogue is never silently replaced or accelerated.
  let project=prepareStory(parsed.data);
  let reactionClip:{duration:number;envelope:number[];src:string}|undefined;
  let reactionInfo:unknown;
  // Audio supplied and explicitly authorized by the user; not labeled CC0.
  if(project.category==='Humor'&&project.sound&&project.laughter===true){
   const bytes=await readFile(path.join(root,'public/laugh.wav'));
   const info=JSON.parse(await readFile(path.join(root,'public/laugh.json'),'utf8'));
   await writeFile(path.join(directory,'reaction.wav'),bytes);
   reactionClip={duration:info.duration,envelope:info.envelope,src:`data:audio/wav;base64,${bytes.toString('base64')}`};
   reactionInfo={role:'reaction',engine:'user-recording',voice:'laughing-meme_NFCpcW5',duration:info.duration};
  }
  const alternatives=project.status==='roteiro'&&project.duration<60&&(await readVoiceConfig()).provider!=='elevenlabs'?(project.theme?everydayCatalog.filter(p=>p.theme===project.theme):catalog).filter(p=>p.category===project.category&&p.title!==project.title).sort((a,b)=>a.scenes.reduce((n,s)=>n+s.line.length,0)-b.scenes.reduce((n,s)=>n+s.line.length,0)).slice(0,3):[];
  let prepared:ReturnType<typeof buildNarration>|undefined;
  let voiceInfo:unknown[]=[];
  for(let attempt=0;attempt<=alternatives.length;attempt++){
   if(attempt)project={...project,...structuredClone(alternatives[attempt-1])};
   const clips=[];voiceInfo=[];
   job.status='speaking';job.message=attempt?'Ajustando a história ao tempo disponível…':'Preparando as vozes…';
   for(const [i,scene] of project.scenes.entries()){
    job.message=`Criando voz ${i+1} de ${project.scenes.length}…`;
    const wavPath=path.join(directory,`${i}.wav`);if(attempt)await unlink(wavPath).catch(()=>{});const audio=await synthesize(scene.line,scene.speaker,wavPath);const bytes=await readFile(wavPath);
    clips.push({duration:audio.duration,envelope:audio.envelope,src:`data:audio/wav;base64,${bytes.toString('base64')}`});
    voiceInfo.push({speaker:scene.speaker,voice:audio.voice,engine:audio.engine,duration:audio.duration,sha256:createHash('sha256').update(bytes).digest('hex')});job.progress=.05+.2*(i+1)/project.scenes.length;
   }
   try{prepared=buildNarration(project,clips,reactionClip);break;}catch(error){if(attempt===alternatives.length)throw error;}
  }
  if(!prepared)throw Error('Não foi possível ajustar as falas à duração. Escolha 30 segundos.');
  const narration=prepared;job.project=project;
  job.narration={...narration,scenes:narration.scenes.map((s,i)=>({...s,src:`/api/audio/${id}/${i}.wav`})),reaction:narration.reaction?{...narration.reaction,src:`/api/audio/${id}/reaction.wav`}:undefined};
  job.status='rendering';job.progress=.25;job.message='Preparando o renderizador…';
  const serveUrl=await getServeUrl();
  job.message='Abrindo o navegador instalado…';
  const inputProps={project,narration};const composition=await selectComposition({serveUrl,id:'PalitoShow',inputProps,browserExecutable,timeoutInMilliseconds:60000});
  const mp4=path.join(output,`${id}.mp4`);
  job.message='Animando e montando o MP4…';
  const cancellation=makeCancelSignal();let timedOut=false;
  const renderTimer=setTimeout(()=>{timedOut=true;cancellation.cancel();},12*60*1000);
  try{
   await renderMedia({serveUrl,composition,inputProps,codec:'h264',pixelFormat:'yuv420p',audioCodec:'aac',outputLocation:mp4,browserExecutable,concurrency:process.platform==='win32'?1:2,onProgress:({progress})=>job.progress=.25+.65*progress,chromiumOptions:{disableWebSecurity:false},crf:22,cancelSignal:cancellation.cancelSignal,timeoutInMilliseconds:60000});
  }catch(error){if(timedOut)throw new Error('A geração ultrapassou 12 minutos e foi interrompida. Feche programas pesados e tente novamente.');throw error;}finally{clearTimeout(renderTimer);}
  job.status='checking';job.progress=.92;job.message='Conferindo vídeo, vozes e sincronização…';
  const quality=await validateMovie(mp4,project.duration,narration);
  const manifest={id,project,voices:reactionInfo?[...voiceInfo,reactionInfo]:voiceInfo,narration:{...narration,scenes:narration.scenes.map((s,i)=>({...s,src:`/api/audio/${id}/${i}.wav`})),reaction:narration.reaction?{...narration.reaction,src:`/api/audio/${id}/reaction.wav`}:undefined},quality,created:new Date().toISOString()};
  await writeFile(path.join(directory,'production.json'),JSON.stringify(manifest,null,2));
  job.status='done';job.progress=1;job.message='Vídeo com vozes pronto para assistir.';job.file=`/api/files/${id}.mp4`;
  await writeFile(path.join(directory,'job.json'),JSON.stringify(job));
 }catch(e){job.status='error';job.error=e instanceof Error&&e.message.length<350?e.message:'Falha ao gerar o vídeo. Confira as vozes locais, o Chromium e o FFmpeg.';console.error('Geração:',e);await unlink(path.join(output,`${id}.mp4`)).catch(()=>{});}finally{busy=false;}
});
app.get('/api/jobs/:id',async(req,res)=>{if(!idPattern.test(req.params.id))return res.status(404).json({error:'Exportação não encontrada.'});let job=jobs.get(req.params.id);if(!job){try{job=JSON.parse(await readFile(path.join(output,req.params.id,'job.json'),'utf8'));}catch{return res.status(404).json({error:'Exportação não encontrada. Tente gerar novamente.'});}}res.json(job);});
app.get('/api/productions/:id',async(req,res)=>{if(!idPattern.test(req.params.id))return res.status(404).json({error:'Produção não encontrada.'});try{res.json(JSON.parse(await readFile(path.join(output,req.params.id,'production.json'),'utf8')));}catch{res.status(404).json({error:'Produção ainda não concluída ou removida.'});}});
app.get('/api/audio/:id/:file',(req,res)=>{if(!idPattern.test(req.params.id)||!/^(?:\d|reaction)\.wav$/.test(req.params.file))return res.status(404).end();res.sendFile(path.join(output,req.params.id,req.params.file),e=>{if(e&&!res.headersSent)res.status(404).end();});});
app.get('/api/files/:file',async(req,res)=>{if(!/^[a-f0-9-]{36}\.mp4$/.test(req.params.file))return res.status(404).json({error:'Arquivo não encontrado.'});const file=path.join(output,req.params.file);try{await stat(file);res.download(file,'palito-show.mp4');}catch{res.status(404).json({error:'Arquivo não encontrado. Gere o vídeo novamente.'});}});
app.use(express.static(path.join(root,'dist')));
app.use('/api',(_req,res)=>res.status(404).json({error:'Rota não encontrada.'}));
app.get('/{*path}',(_req,res)=>res.sendFile(path.join(root,'dist/index.html')));
app.use((_err:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(400).json({error:'Requisição inválida.'}));
app.listen(Number(process.env.PORT||3001),'0.0.0.0',()=>{console.log('PALITO SHOW: servidor na porta '+(process.env.PORT||3001));console.log(browserReady?`Navegador para vídeos: ${browserExecutable}`:'Navegador para vídeos: não encontrado');});
