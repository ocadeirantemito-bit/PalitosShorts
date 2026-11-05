import test from 'node:test';
import assert from 'node:assert/strict';
import {validateWrittenStory} from '../server/writer';
import {generate} from '../src/catalog';
import {storyAppearance} from '../src/artDirection';
test('IA valida duração, dois personagens e impede roteiro repetido',()=>{
 const p={...generate('Humor',15,true),setting:'escritorio',outfit:'trabalho'};
 const input={theme:'Trabalho' as const,duration:15 as const,sound:true,history:[]};
 assert.equal(validateWrittenStory(p,input).status,'editado');
 assert.throws(()=>validateWrittenStory(p,{...input,history:[{title:p.title,lines:p.scenes.map(s=>s.line).join(' ')}]}),/repetiu/);
 assert.throws(()=>validateWrittenStory({...p,scenes:p.scenes.map(s=>({...s,speaker:'PALITO'}))},input),/dois personagens/);
});
test('roteiro escolhe cenário e roupa coerentes e respeita edição',()=>{
 const p=generate('Humor',15,true);assert.deepEqual(storyAppearance({...p,title:'Chefe no expediente',setting:undefined}),{setting:'escritorio',outfit:'trabalho'});
 assert.deepEqual(storyAppearance({...p,title:'Jantar na cozinha',setting:undefined}),{setting:'cozinha',outfit:'casa'});
 assert.deepEqual(storyAppearance({...p,setting:'parque',outfit:'casual'}),{setting:'parque',outfit:'casual'});
});
