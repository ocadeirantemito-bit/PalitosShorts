import test from 'node:test';
import assert from 'node:assert/strict';
import {generate} from '../src/catalog';
import {series} from '../src/series';
import {projectSchema,tooLong} from '../src/model';
import {buildNarration} from '../src/narration';
import {synthesize} from '../server/tts';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
test('séries de 60 e 90 segundos têm roteiro completo e falas que cabem sem cortes',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'series-'));
 try{for(const s of series){for(const duration of [60,90] as const){
 const p=generate('Humor',duration,true,undefined,s.theme);
 assert.ok(projectSchema.safeParse(p).success);assert.equal(tooLong(p),false);
 assert.equal(p.scenes.length,duration===60?8:12);assert.equal(p.series,s.name);
 assert.equal(p.laughter,undefined);
 const clips=[];
 for(const [i,scene] of p.scenes.entries()){const a=await synthesize(scene.line,scene.speaker,path.join(dir,`${s.theme}-${duration}-${i}.wav`));clips.push({...a,src:`${s.theme}-${duration}-${i}.wav`});}
 const n=buildNarration(p,clips);assert.equal(n.scenes.at(-1)?.end,duration*30);
 assert.ok(n.scenes.at(-1)!.end-n.scenes.at(-1)!.audioEnd<300,'sem silêncio final de dez segundos');
 }}}finally{await rm(dir,{recursive:true,force:true});}
});
