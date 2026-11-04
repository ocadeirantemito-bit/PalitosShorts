import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SupportedStoryObject,type StoryProp} from '../src/SceneProps';
import {Character} from '../src/Character';

test('objetos permanecem no mesmo apoio ao longo da cena',()=>{
 for(const kind of ['cafe','celular','presente','lista','halter','pizza','chuva','wifi'] as StoryProp[]){
  const render=(t:number)=>renderToStaticMarkup(React.createElement(SupportedStoryObject,{kind,t}));
  const transforms=(s:string)=>[...s.matchAll(/transform="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(transforms(render(0)),transforms(render(90)),kind);
  assert.ok(render(0).includes('data-supported-prop'));
 }
});

test('personagens voltam ao chão após um pulo e não pulam ao comemorar',()=>{
 const render=(action:'pular'|'comemorar',t:number)=>renderToStaticMarkup(React.createElement(Character,{x:330,female:false,action,t,active:true,mouthLevel:0}));
 assert.ok(render('pular',20).includes('translate(330,780)'));
 assert.ok(render('pular',90).includes('translate(330,810)'));
 assert.ok(render('comemorar',20).includes('translate(330,810)'));
});
