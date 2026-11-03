import {existsSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';

type Environment=NodeJS.ProcessEnv;

export function findBrowserExecutable(env:Environment=process.env,platform=process.platform,exists:(file:string)=>boolean=existsSync){
 const configured=env.CHROMIUM_PATH?.trim();
 if(configured)return configured;
 const candidates:string[]=[];
 if(platform==='win32'){
  const roots=[env.PROGRAMFILES,env['PROGRAMFILES(X86)'],env.LOCALAPPDATA].filter((value):value is string=>Boolean(value));
  for(const root of roots){
   candidates.push(path.join(root,'Google','Chrome','Application','chrome.exe'));
   candidates.push(path.join(root,'Microsoft','Edge','Application','msedge.exe'));
  }
 }else if(platform==='darwin'){
  candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
 }else{
  candidates.push('/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome','/usr/bin/google-chrome-stable');
 }
 return candidates.find(exists);
}

export function mediaExecutable(type:'ffmpeg'|'ffprobe',env:Environment=process.env){
 const configured=env[type==='ffmpeg'?'FFMPEG_PATH':'FFPROBE_PATH']?.trim();
 if(configured)return configured;
 return RenderInternals.getExecutablePath({type,binariesDirectory:null,indent:false,logLevel:'error'});
}
