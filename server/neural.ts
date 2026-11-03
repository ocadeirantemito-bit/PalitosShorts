import {access,readFile,stat} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import path from 'node:path';
import type {Speaker,SpeechResult} from './tts';
const assets=path.join(process.cwd(),'.cache','neural');
const python=path.join(assets,'venv',process.platform==='win32'?'Scripts/python.exe':'bin/python');
export async function neuralReady(){try{const ready=JSON.parse(await readFile(path.join(assets,'ready.json'),'utf8'));if(ready.engine!=='kokoro-onnx')return false;await Promise.all([python,path.join(assets,'kokoro-v1.0.onnx'),path.join(assets,'voices-v1.0.bin')].map(p=>access(p)));return true;}catch{return false;}}
export async function neuralSpeech(text:string,speaker:Speaker,outputPath:string):Promise<SpeechResult>{
 const existing=await stat(outputPath).catch((e:NodeJS.ErrnoException)=>{if(e.code!=='ENOENT')throw e;return undefined;});
 if(existing)throw Object.assign(new Error('O arquivo de voz já existe.'),{code:'EEXIST'});
 return new Promise((resolve,reject)=>{
 const child=execFile(python,[path.join(process.cwd(),'scripts/neural/speak.py')],{timeout:180000,maxBuffer:2*1024*1024,windowsHide:true,encoding:'utf8'},(error,stdout)=>{
  if(error)return reject(new Error('Não foi possível gerar a voz neural. Execute TESTAR-VOZES.cmd para verificar a instalação.'));
  try{const result=JSON.parse(stdout);if(result.engine!=='kokoro-onnx'||!Number.isFinite(result.duration)||result.duration<=0||!Array.isArray(result.envelope))throw Error();resolve(result);}catch{reject(new Error('O sintetizador neural retornou áudio inválido.'));}
 });child.stdin?.on('error',()=>{});child.stdin?.end(JSON.stringify({text,speaker,output:path.resolve(outputPath)}));
});}
