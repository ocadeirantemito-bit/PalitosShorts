import test from 'node:test';
import assert from 'node:assert/strict';
import {elevenRequest,publicVoiceConfig,voiceConfigSchema} from '../server/elevenlabs';
test('configuração pública nunca inclui a chave e IDs são validados',()=>{
 const value=publicVoiceConfig({provider:'elevenlabs',apiKey:'secret-test',palito:'roger',tica:'roberta'});
 assert.equal(JSON.stringify(value).includes('secret-test'),false);assert.equal(value.hasKey,true);
 assert.equal(voiceConfigSchema.safeParse({provider:'elevenlabs',palito:'../bad'}).success,false);
});
test('requisição ElevenLabs usa autenticação no servidor e esconde corpo de erros',async()=>{
 const original=globalThis.fetch;
 try{
 globalThis.fetch=async(input,options)=>{assert.equal(String(input),'https://api.elevenlabs.io/v1/voices');assert.equal((options?.headers as Record<string,string>)['xi-api-key'],'test-key');return new Response(JSON.stringify({secret:'test-key'}),{status:401});};
 await assert.rejects(elevenRequest('/v1/voices',{provider:'elevenlabs',apiKey:'test-key'}),e=>e instanceof Error&&e.message==='Chave ElevenLabs inválida.');
 globalThis.fetch=async()=>new Response('{}',{status:403});
 await assert.rejects(elevenRequest('/v1/voices',{provider:'elevenlabs',apiKey:'test-key'}),/permissões/);
 }finally{globalThis.fetch=original;}
});

test('áudio convertido preserva duração e cache evita nova cobrança para a mesma fala',async()=>{
 const {execFileSync}=await import('node:child_process');const {mediaExecutable}=await import('../server/runtime');
 const {mkdtemp,rm,readFile}=await import('node:fs/promises');const os=await import('node:os');const path=await import('node:path');
 const {elevenSpeech}=await import('../server/elevenlabs');
 const dir=await mkdtemp(path.join(os.tmpdir(),'eleven-test-'));const original=globalThis.fetch;
 const mp3=execFileSync(mediaExecutable('ffmpeg'),['-v','error','-f','lavfi','-i','sine=frequency=440:duration=1','-f','mp3','pipe:1']);let calls=0;
 const config={provider:'elevenlabs' as const,apiKey:'fake-test-key',palito:`test-${Date.now()}`,tica:'test-tica'};
 try{
 globalThis.fetch=async()=>{calls++;return new Response(mp3);};
 const a=await elevenSpeech('Teste de cache.','PALITO',path.join(dir,'a.wav'),config);
 const b=await elevenSpeech('Teste de cache.','PALITO',path.join(dir,'b.wav'),config);
 assert.equal(calls,1);assert.deepEqual(a,b);assert.ok(a.duration>=1&&a.duration<1.2);assert.ok(a.envelope.some(n=>n>.1));
 assert.deepEqual(await readFile(path.join(dir,'a.wav')),await readFile(path.join(dir,'b.wav')));
 }finally{globalThis.fetch=original;await rm(dir,{recursive:true,force:true});}
});
