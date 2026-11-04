import test from 'node:test';
import assert from 'node:assert/strict';
import {generate,initialState} from '../src/catalog';
import {everydayCatalog} from '../src/everyday';
import {themes,projectSchema,tooLong} from '../src/model';
import {parseBackup} from '../src/store';
import {prepareStory} from '../server/story';
test('cada tema possui três roteiros originais válidos e preserva o tema ao variar',()=>{
 assert.equal(new Set(everydayCatalog.map(s=>s.title)).size,24);
 for(const theme of themes){
  assert.equal(everydayCatalog.filter(s=>s.theme===theme).length,3);
  let p=generate('Humor',15,true,undefined,theme);
  for(let i=0;i<20;i++){
   const next=generate(p.category,15,true,p.title,theme);
   assert.equal(next.theme,theme);assert.notEqual(next.title,p.title);
   assert.ok(projectSchema.safeParse(next).success);assert.equal(tooLong(next),false);p=next;
  }
  const state={...initialState(),projects:[p]};assert.deepEqual(parseBackup(JSON.stringify(state)),state);
  const longer={...p,duration:30 as const};assert.deepEqual(prepareStory(longer),longer);
 }
});
