import test from 'node:test';
import assert from 'node:assert/strict';
import {generate} from '../src/catalog';
import {buildNarration,narrationMouthAt,narrationReactionMouthAt,MIN_SPEECH_PAUSE_FRAMES,REACTION_GAP_FRAMES,SPEECH_PREROLL_FRAMES} from '../src/narration';

const clip=(duration:number)=>({duration,src:'data:audio/wav;base64,test',envelope:Array.from({length:Math.ceil(duration*30)},(_,i)=>i%3===0?0:.75)});

test('timeline usa gravações reais e mantém falas completas em 15 e 30 segundos',()=>{
 for(const duration of [15,30] as const){
  const project=generate('Humor',duration,true);
  const clips=[clip(2.013),clip(1.8),clip(3.4)];
  const timeline=buildNarration(project,clips);
  assert.equal(timeline.durationInFrames,duration*30);
  assert.equal(timeline.scenes[0].start,0);
  assert.equal(timeline.scenes.at(-1)?.end,duration*30);
  timeline.scenes.forEach((s,i)=>{
   assert.equal(s.audioStart-s.start,SPEECH_PREROLL_FRAMES);
   assert.ok((s.audioEnd-s.audioStart)/30>=clips[i].duration);
   assert.ok(s.end-s.audioEnd>=MIN_SPEECH_PAUSE_FRAMES);
   assert.equal(s.speaker,project.scenes[i].speaker);
   if(i)assert.equal(s.start,timeline.scenes[i-1].end);
  });
 }
});

test('roteiro longo é rejeitado sem cortar áudio nem acelerar vozes',()=>{
 const project=generate('Humor',15,true);
 assert.throws(()=>buildNarration(project,[clip(5),clip(5),clip(5)]),/nenhuma fala será cortada/);
 // The same recordings fit naturally when the user selects 30 seconds.
 assert.equal(buildNarration({...project,duration:30},[clip(5),clip(5),clip(5)]).durationInFrames,900);
});

test('boca acompanha o áudio sem antecipar abertura no silêncio',()=>{
 const project=generate('Humor',15,true);
 const scene=buildNarration(project,[clip(1),clip(2),clip(3)]).scenes[0];
 assert.equal(narrationMouthAt(scene,scene.audioStart-1),0);
 assert.equal(narrationMouthAt(scene,scene.audioStart),0);
 assert.ok(narrationMouthAt(scene,scene.audioStart+1)>.7);
 assert.equal(narrationMouthAt(scene,scene.audioEnd),0);
 assert.equal(narrationMouthAt(scene,scene.end-1),0);
});

test('rejeita gravações ausentes, vazias ou metadados inválidos',()=>{
 const project=generate('Humor',15,true);
 assert.throws(()=>buildNarration(project,[clip(1)]));
 assert.throws(()=>buildNarration(project,[clip(0),clip(1),clip(1)]));
 assert.throws(()=>buildNarration(project,[{...clip(1),envelope:[NaN]},clip(1),clip(1)]));
 assert.throws(()=>buildNarration(project,[{...clip(1),envelope:[1.2]},clip(1),clip(1)]));
});

test('risada entra depois da última fala e também movimenta a boca',()=>{
 const project=generate('Humor',15,true);const reaction=clip(.8);
 const timeline=buildNarration(project,[clip(1),clip(1),clip(1)],reaction);
 assert.ok(timeline.reaction);assert.equal(timeline.reaction.start-timeline.scenes[2].audioEnd,REACTION_GAP_FRAMES);
 assert.ok(timeline.reaction.end<=timeline.scenes[2].end);
 assert.equal(narrationReactionMouthAt(timeline.reaction,timeline.reaction.start),0);
 assert.ok(narrationReactionMouthAt(timeline.reaction,timeline.reaction.start+1)>0);
 assert.equal(narrationReactionMouthAt(timeline.reaction,timeline.reaction.end),0);
});

test("pausas entre falas são limitadas mesmo em roteiros curtos",()=>{const n=buildNarration(generate("Humor",15,true),[clip(1),clip(1),clip(1)]);for(const s of n.scenes.slice(0,-1))assert.ok(s.end-s.audioEnd<=18);assert.equal(n.scenes.at(-1)?.end,450);});
