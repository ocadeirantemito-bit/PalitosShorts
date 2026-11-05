import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {z} from 'zod';
import {mediaExecutable} from './runtime';
import {waveBuffer,amplitudeEnvelope} from './audio';
import type {Speaker,SpeechResult} from './tts';
const directory=path.join(process.cwd(),'.cache','elevenlabs');
const file=path.join(directory,'config.json');
export const voiceConfigSchema=z.object({provider:z.enum(['local','elevenlabs']),apiKey:z.string().trim().max(500).optional(),palito:z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/).optional(),tica:z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/).optional()});
export type VoiceConfig=z.infer<typeof voiceConfigSchema>;
export async function readVoiceConfig():Promise<VoiceConfig>{try{return voiceConfigSchema.parse(JSON.parse(await readFile(file,'utf8')));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return {provider:'local'};throw Error('Configuração de vozes inválida. Configure novamente no aplicativo.');}}
export async function saveVoiceConfig(value:unknown){const next=voiceConfigSchema.parse(value);const old=await readVoiceConfig();if(!next.apiKey)next.apiKey=old.apiKey;if(next.provider==='elevenlabs'&&!next.apiKey)throw Error('Preencha a chave.');await mkdir(directory,{recursive:true});const temp=`${file}.${randomUUID()}`;await writeFile(temp,JSON.stringify(next),{mode:0o600});await rename(temp,file);}
export function publicVoiceConfig(c:VoiceConfig){return {provider:c.provider,palito:c.palito||'',tica:c.tica||'',hasKey:Boolean(c.apiKey)};}
export async function elevenRequest(endpoint:string,config:VoiceConfig,body?:unknown){
 if(!config.apiKey)throw Error('Configure a chave do ElevenLabs.');
 let r:Response;try{r=await fetch(`https://api.elevenlabs.io${endpoint}`,{method:body?'POST':'GET',headers:{'xi-api-key':config.apiKey,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(60000)});}catch{throw Error('Não foi possível conectar ao ElevenLabs. Confira a internet e tente novamente.');}
 if(!r.ok){const message=r.status===401?'Chave ElevenLabs inválida.':r.status===403?'Sua conta não permite usar esta voz ou recurso. Confira o plano e as permissões da chave.':r.status===429?'Limite ou créditos do ElevenLabs atingidos. Aguarde ou confira sua conta.':r.status===404?'Voz não encontrada. Confira o Voice ID.':'O ElevenLabs não concluiu o pedido. Confira os créditos e tente novamente.';await r.body?.cancel();throw Error(message);}return r;
}
export async function elevenVoices(config:VoiceConfig){const r=await elevenRequest('/v1/voices',config);const data=await r.json();return (data.voices||[]).map((v:{voice_id:string;name:string})=>({id:v.voice_id,name:v.name}));}
export async function elevenSpeech(text:string,speaker:Speaker,output:string,c:VoiceConfig):Promise<SpeechResult>{
 if(!c.palito||!c.tica)throw Error('Escolha e salve as duas vozes antes de gerar.');const voice=speaker==='PALITO'?c.palito:c.tica;if(!voice)throw Error('Escolha as duas vozes em Configurações.');
 const request={text,model_id:'eleven_multilingual_v2',voice_settings:{stability:.5,similarity_boost:.75,style:0,use_speaker_boost:true}};
 const hash=createHash('sha256').update(JSON.stringify({voice,request,format:'mp3_44100_128',version:1})).digest('hex');
 const cache=path.join(directory,'audio',hash);let wav:Buffer,result:SpeechResult;
 try{wav=await readFile(`${cache}.wav`);result=JSON.parse(await readFile(`${cache}.json`,'utf8'));}catch{
 const response=await elevenRequest(`/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,c,request);
 const mp3=Buffer.from(await response.arrayBuffer());
 if(mp3.length<100||mp3.length>20_000_000)throw Error('O ElevenLabs retornou áudio inválido.');
 const child=execFile(mediaExecutable('ffmpeg'),['-v','error','-i','pipe:0','-acodec','pcm_s16le','-f','wav','-ac','1','-ar','24000','pipe:1'],{encoding:'buffer',maxBuffer:20_000_000,timeout:60000});
 const decoded=await new Promise<Buffer>((resolve,reject)=>{const chunks:Buffer[]=[];child.stdout!.on('data',b=>chunks.push(b));child.on('error',()=>reject(Error('Não foi possível converter a voz. Verifique o FFmpeg.')));child.on('close',code=>code===0?resolve(Buffer.concat(chunks)):reject(Error('O áudio recebido não pôde ser convertido.')));child.stdin!.on('error',()=>{});child.stdin!.end(mp3);});
 let pcm:Buffer|undefined;for(let offset=12;offset+8<=decoded.length;){const size=decoded.readUInt32LE(offset+4);if(decoded.toString('ascii',offset,offset+4)==='data'){pcm=decoded.subarray(offset+8,Math.min(decoded.length,offset+8+size));break;}offset+=8+size+(size%2);}
 if(!pcm||pcm.length%2)throw Error('O áudio recebido não é um WAV válido.');
 const samples=new Int16Array(pcm.length/2);for(let i=0;i<samples.length;i++)samples[i]=pcm.readInt16LE(i*2);
 const envelope=amplitudeEnvelope(samples,24000);if(!samples.length||!envelope.some(n=>n>.1))throw Error('A voz recebida ficou silenciosa.');
 wav=waveBuffer(samples,24000);result={duration:samples.length/24000,envelope,sampleRate:24000,engine:'elevenlabs',voice};
 await mkdir(path.dirname(cache),{recursive:true});await writeFile(`${cache}.wav`,wav);await writeFile(`${cache}.json`,JSON.stringify(result));
 }
 await mkdir(path.dirname(output),{recursive:true});await writeFile(output,wav,{flag:'wx'});return result;
}
