import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {synthesize,voiceStatus,amplitudeEnvelope} from '../server/tts';

test('duas vozes brasileiras geram WAVs audíveis, distintos e com duração/envelope reais',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'palito-tts-test-'));
 try {
  const status=await voiceStatus();assert.equal(status.ready,true);assert.equal(status.voices.length,2);
  assert.ok(status.voices.every(v=>v.language==='pt-BR'));
  const hashes:string[]=[];
  for(const speaker of ['PALITO','TICO'] as const){
   const file=path.join(dir,`${speaker}.wav`);
   const result=await synthesize('Bom dia! Vamos contar uma história juntos?',speaker,file);
   const wav=await readFile(file);assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
   assert.equal(wav.readUInt16LE(20),1);assert.equal(wav.readUInt16LE(22),1);assert.equal(wav.readUInt16LE(34),16);
   assert.equal(wav.readUInt32LE(24),result.sampleRate);assert.equal(wav.readUInt32LE(40),wav.length-44);
   assert.equal(result.duration,(wav.length-44)/2/result.sampleRate);assert.ok(result.duration>1&&result.duration<15);
   assert.equal(result.envelope.length,Math.ceil(result.duration*30));assert.ok(result.envelope.some(v=>v===0));assert.ok(result.envelope.some(v=>v>.5));assert.ok(result.envelope.every(v=>v>=0&&v<=1));
   hashes.push(createHash('sha256').update(wav).digest('hex'));
   await assert.rejects(synthesize('Outra fala.',speaker,file),{code:'EEXIST'});
  }
  assert.notEqual(hashes[0],hashes[1]);
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('TTS rejeita texto vazio e personagem inválido; silêncio não abre a boca',async()=>{
 await assert.rejects(synthesize('   ','PALITO','unused.wav'),/fala deve conter/);
 await assert.rejects(synthesize('Olá!','INVALID' as 'PALITO','unused.wav'),/Personagem/);
 assert.deepEqual(amplitudeEnvelope(new Int16Array(22050),22050),Array(30).fill(0));
});
