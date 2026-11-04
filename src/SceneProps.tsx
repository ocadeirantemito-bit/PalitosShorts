import React from 'react';
import type {Project,Scene} from './model';

export type StoryProp='cafe'|'celular'|'presente'|'lista'|'halter'|'pizza'|'chuva'|'wifi'|'nenhum';

export function inferStoryProp(project:Project,scene:Scene):StoryProp{
 const text=`${project.title} ${scene.line} ${scene.caption}`.toLocaleLowerCase('pt-BR');
 if(/caf[eé]|[áa]gua/.test(text))return 'cafe';
 if(/celular|telefone|playlist/.test(text))return 'celular';
 if(/presente|caixa|fam[ií]lia/.test(text))return 'presente';
 if(/lista|tarefas|disciplina/.test(text))return 'lista';
 if(/academia|exerc[ií]cio/.test(text))return 'halter';
 if(/pizza|receita|chef|fome/.test(text))return 'pizza';
 if(/chuva|janela|sol/.test(text))return 'chuva';
 if(/wi-?fi|conex[aã]o|senha/.test(text))return 'wifi';
 return 'nenhum';
}

export function StoryObject({kind,x,y,t,active}:{kind:StoryProp;x:number;y:number;t:number;active:boolean}){
 const ink='#302a3e';
 const transform=`translate(${x} ${y})`;
 if(kind==='nenhum')return null;
 return <g data-story-object={kind} transform={transform} opacity={active?.98:.72} stroke={ink} strokeLinecap="round" strokeLinejoin="round">
  {kind==='cafe'&&<><ellipse cx="0" cy="65" rx="58" ry="13" fill="#000" opacity=".12" stroke="none"/><path d="M-42 0h72v58q-2 18-36 18t-36-18Z" fill="#f7efe0" strokeWidth="6"/><path d="M30 13q43-3 35 27q-4 19-35 15" fill="none" strokeWidth="7"/><path d={`M-24-12q${-36+Math.sin(t*.12)*8}-23-12-39 M2-12q${-10+Math.sin(t*.1+1)*8}-28 5-44`} fill="none" stroke="#fff" strokeWidth="7" opacity=".85"/><ellipse cx="-6" cy="3" rx="35" ry="8" fill="#76513d" strokeWidth="4"/></>}
  {kind==='celular'&&<g transform="rotate(0)"><rect x="-34" y="-68" width="68" height="130" rx="13" fill="#3d4663" strokeWidth="7"/><rect x="-25" y="-51" width="50" height="88" rx="6" fill="#b9e7ed" strokeWidth="3"/><circle cy="50" r="5" fill="#fff" stroke="none"/><path d="M-14-25h28m-28 15h18m-18 15h25" stroke="#668a99" strokeWidth="5"/></g>}
  {kind==='presente'&&<><rect x="-58" y="-22" width="116" height="88" rx="7" fill="#df8a94" strokeWidth="7"/><path d="M0-22v88M-62 1h124" fill="none" stroke="#f7d27f" strokeWidth="14"/><path d="M0-23q-48-8-38-37q8-22 38 37Zm0 0q48-8 38-37q-8-22-38 37Z" fill="#f7d27f" strokeWidth="6"/></>}
  {kind==='lista'&&<g transform="rotate(0)"><rect x="-55" y="-67" width="110" height="142" rx="8" fill="#fffdf5" strokeWidth="7"/><rect x="-25" y="-78" width="50" height="22" rx="8" fill="#9c79d5" strokeWidth="5"/>{[-34,0,34].map((yy,i)=><g key={yy}><rect x="-39" y={yy-9} width="17" height="17" rx="3" fill={i<2?'#8ab995':'#fff'} strokeWidth="3"/><path d={`M-10 ${yy}h43`} strokeWidth="5"/></g>)}</g>}
  {kind==='halter'&&<g transform="rotate(0)" strokeWidth="8"><path d="M-56 0h112"/><rect x="-76" y="-31" width="25" height="62" rx="5" fill="#68738e"/><rect x="51" y="-31" width="25" height="62" rx="5" fill="#68738e"/><rect x="-91" y="-21" width="17" height="42" rx="4" fill="#424b62"/><rect x="74" y="-21" width="17" height="42" rx="4" fill="#424b62"/></g>}
  {kind==='pizza'&&<g transform="rotate(0)"><path d="M-78 15h156l-13 72H-65Z" fill="#d88b58" strokeWidth="7"/><path d="M-70 15L-47-24H49L71 15Z" fill="#f0b873" strokeWidth="7"/><path d="M-45-15L0 69 44-15Z" fill="#f5d278" strokeWidth="5"/><circle cx="-14" cy="5" r="9" fill="#c85e50" stroke="none"/><circle cx="17" cy="24" r="9" fill="#c85e50" stroke="none"/><circle cx="1" cy="48" r="8" fill="#c85e50" stroke="none"/></g>}
  {kind==='chuva'&&<><path d="M-83 3Q0-75 83 3Q0-22-83 3Z" fill="#8bb8d7" strokeWidth="7"/><path d="M0 0v83q0 26 24 12" fill="none" strokeWidth="8"/><path d="M-58-50l-14-22m28 12-7-27m101 34 14-23m-29 13 8-27" stroke="#82b8d8" strokeWidth="7"/></>}
  {kind==='wifi'&&<g fill="none" stroke="#6c82cd" strokeWidth="10"><path d="M-73-5q73-70 146 0"/><path d="M-48 21q48-46 96 0"/><path d="M-23 47q23-22 46 0"/><circle cy="70" r="7" fill="#6c82cd" stroke="none"/></g>}
 </g>;
}

export function ActionAccent({action,x,y,t}:{action:Scene['action'];x:number;y:number;t:number}){
 const pulse=.85+Math.sin(t*.2)*.08;
 if(!['surpresa','rir','comemorar','triste','escorregar'].includes(action))return null;
 return <g transform={`translate(${x} ${y}) scale(${pulse})`} fill="none" strokeLinecap="round">
  {action==='surpresa'&&<g stroke="#f0b949" strokeWidth="10"><path d="M0-65v-42M-55-36l-33-28M55-36l33-28"/></g>}
  {action==='rir'&&<g fill="#7e62c5" stroke="none"><path d="M-73-18q-27 22 0 43q-9-20 12-27Z"/><path d="M72-18q28 22 0 43q9-20-12-27Z"/></g>}
  {action==='comemorar'&&<g strokeWidth="8"><path d="M-82-22l-25-16M82-22l25-16" stroke="#ecb94f"/><circle cx="-103" cy="-66" r="8" fill="#8d6ad0" stroke="none"/><circle cx="103" cy="-66" r="8" fill="#d66f7a" stroke="none"/></g>}
  {action==='triste'&&<path d="M43-50q22 28 0 44q-22-16 0-44Z" fill="#78b9df" stroke="#4d7c9d" strokeWidth="4"/>}
  {action==='escorregar'&&<path d="M-95 30q47-29 96 0M-112 54q48-28 94 0" stroke="#8c7ca7" strokeWidth="8"/>}
 </g>;
}

// Each solid object has a stable base. Coordinates include the outline width.
export const propBottom:Record<Exclude<StoryProp,'nenhum'>,number>={cafe:79,celular:66,presente:70,lista:79,halter:35,pizza:91,chuva:110,wifi:82};
export function SupportedStoryObject({kind,t}:{kind:StoryProp;t:number}){
 if(kind==='nenhum')return null;
 const floor=kind==='halter',symbol=kind==='wifi',supportY=floor?1238:1128;
 return <g data-supported-prop={kind}>
  {floor?<ellipse cx="540" cy="1240" rx="101" ry="7" fill="#302a3e" opacity=".16"/>:<g stroke="#624a3b" strokeWidth="7" strokeLinejoin="round">
   <ellipse cx="540" cy="1240" rx="101" ry="9" fill="#302a3e" opacity=".12" stroke="none"/>
   <path d="M466 1141v96m148-96v96" fill="none"/>
   <rect x="433" y="1128" width="214" height="17" rx="6" fill="#c3976f"/>
  </g>}
  {symbol&&<rect x="463" y="994" width="154" height="134" rx="9" fill="#fffaf0" stroke="#624a3b" strokeWidth="5"/>}
  <StoryObject kind={kind} x={540} y={symbol?1035:supportY-propBottom[kind]} t={t} active/>
 </g>;
}
