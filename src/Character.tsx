import React from 'react';
import type {Scene} from './model';

export type CharacterAction=Scene['action']|'parado';
type CharacterProps={x:number;female:boolean;action:CharacterAction;t:number;active:boolean;mouthLevel?:number;look?:-1|1;depth?:number;outfit?:'casual'|'trabalho'|'casa'|'esporte'};

export function Character({x,female,action,t,active,mouthLevel,look=female?-1:1,depth=1,outfit}:CharacterProps){
 const ink='#211f2a',hair=female?'#603822':'#19171c',accent=outfit==='trabalho'?(female?'#327c88':'#4972aa'):outfit==='esporte'?(female?'#dd6b59':'#399a79'):outfit==='casa'?(female?'#ad779e':'#c88b49'):female?'#9137bd':'#f1ba16',face='#fffaf0';
 // Single bounded gesture, then rest. No perpetual bouncing or scene-long sliding.
 const gesture=Math.sin(Math.PI*Math.min(1,Math.max(0,t)/48));
 const walk=action==='andar'?Math.sin(t*.16)*12*gesture:0;
 const jump=action==='pular'?-Math.sin(Math.PI*Math.min(1,Math.max(0,t-8)/24))*30:0;
 const y=810+jump;
 const slipPhase=action==='escorregar'?gesture:0;
 const slideX=0;
 const deny=action==='negar'?Math.sin(t*.22)*3*gesture:0;
 const blink=t%130>123;
 const mouth=mouthLevel===undefined?(active?Math.abs(Math.sin(t*.5)):.04):mouthLevel;
 const idle=Math.sin(t*.08)*5;
 const wave=Math.sin(t*.28)*12*gesture;
 const rightHand=action==='acenar'?{x:101,y:136+wave}:action==='apontar'?{x:137,y:208}:['pular','comemorar'].includes(action)?{x:100,y:125}:action==='escorregar'?{x:116,y:236}:{x:88,y:278+idle};
 const leftHand=['pular','comemorar'].includes(action)?{x:-100,y:125}:action==='escorregar'?{x:-116,y:238}:{x:-88,y:278-idle};
 rightHand.x=88+(rightHand.x-88)*gesture;
 rightHand.y=278+idle+(rightHand.y-278-idle)*gesture;
 leftHand.x=-88+(leftHand.x+88)*gesture;
 leftHand.y=278-idle+(leftHand.y-278+idle)*gesture;
 const headTurn=deny,eyeShift=look*(active?4:2);
 const legLeft=-43+walk-slipPhase*10,legRight=45-walk+slipPhase*15;
 const armPath=(side:-1|1,hand:{x:number;y:number})=>`M0 184 Q${side*53} ${220-slipPhase*8} ${hand.x} ${hand.y}`;
 return <g data-character={female?'TICA':'PALITO'} stroke={ink} strokeLinecap="round" strokeLinejoin="round">
  <ellipse cx={x} cy={810+428*depth} rx={82*depth} ry={7*depth} fill={ink} opacity=".13" stroke="none"/>
  <g transform={`translate(${x+slideX},${y}) scale(${depth})`}>
   {female&&<path d="M-69 48Q-101 114-78 193Q-65 218-45 225L-36 175H42L48 225Q78 211 85 180Q102 94 64 43Z" fill={hair} strokeWidth="7"/>}
   <g fill="none" strokeWidth="12"><path d="M0 174L0 302"/><path d={`M0 300Q-15 349 ${legLeft} 420`}/><path d={`M0 300Q17 350 ${legRight} 420`}/></g>
   <path d={`M${legLeft-25} 422h50`} fill="none" strokeWidth="13"/><path d={`M${legRight-25} 422h50`} fill="none" strokeWidth="13"/>
   {outfit&&<g data-outfit={outfit}><path d="M-24 178L-44 205L-27 218V293H27V218L44 205L24 178Z" fill={accent} strokeWidth="5"/>{outfit==='trabalho'?<path d="M-18 179L0 196L18 179M0 196v72" fill="none" stroke="#fff4dc" strokeWidth="4"/>:outfit==='esporte'?<path d="M-18 187v86m36-86v86" stroke="#fff4dc" strokeWidth="4"/>:null}</g>}
   {action==='cruzar'?<g fill="none" strokeWidth="11"><path d="M-18 194L-55 226L23 248"/><path d="M18 194L55 224L-22 238"/><circle cx="23" cy="248" r="10" fill={face}/><circle cx="-22" cy="238" r="10" fill={face}/></g>:<g fill="none" strokeWidth="11">
    <path d={armPath(-1,leftHand)}/><path d={armPath(1,rightHand)}/><circle cx={leftHand.x} cy={leftHand.y} r="12" fill={face} strokeWidth="7"/><circle cx={rightHand.x} cy={rightHand.y} r="12" fill={face} strokeWidth="7"/>{action==='apontar'&&<path d={`M${rightHand.x+9} ${rightHand.y-3}l29-10`} strokeWidth="8"/>}
   </g>}
   {!female&&<g transform="translate(0 183)" fill={accent} strokeWidth="5"><path d="M0 0Q-28-20-32 8Q-27 29 0 11Z"/><path d="M0 0Q28-20 32 8Q27 29 0 11Z"/><circle cx="0" cy="7" r="8"/></g>}
   <g transform={`translate(${headTurn} 0)`}>
    <circle cx="0" cy="91" r="78" fill={face} strokeWidth="8"/>
    {female?<><path d="M-70 84Q-80 23-29 10Q25-8 70 39Q43 26 19 4Q-8 47-70 48Z" fill={hair} strokeWidth="7"/><g transform="translate(52 20) rotate(16)" fill={accent} strokeWidth="5"><path d="M0 0Q-29-19-31 9Q-24 29 0 11Z"/><path d="M0 0Q28-19 31 9Q24 29 0 11Z"/><circle cx="0" cy="7" r="8"/></g></>:<path d="M-72 61Q-86 18-48 25Q-58-3-27 12Q-11-21 3 8Q32-16 31 15Q67-1 72 42Q38 24 11 21Q-18 45-72 45Z" fill={hair} strokeWidth="7"/>}
    <g fill="none" strokeWidth="5"><path d={action==='surpresa'?'M-45 62l25-8M20 54l25 8':action==='triste'?'M-45 69l25-9M20 60l25 9':'M-45 67q12-6 24-1M21 66q12-5 24 1'}/></g>
    {blink?<path d="M-42 90q11 7 22 0M20 90q11 7 22 0" fill="none" strokeWidth="6"/>:<g><ellipse cx="-30" cy="91" rx="9" ry="14" fill={ink} stroke="none"/><ellipse cx="30" cy="91" rx="9" ry="14" fill={ink} stroke="none"/><circle cx={-28+eyeShift} cy="87" r="2.5" fill="#fff" stroke="none"/><circle cx={32+eyeShift} cy="87" r="2.5" fill="#fff" stroke="none"/>{female&&<path d="M-39 80l-8-6M39 80l8-6" fill="none" strokeWidth="4"/>}</g>}
    {mouth>.08?<ellipse cx="0" cy="126" rx={13+mouth*4} ry={4+mouth*12} fill="#532f3b" strokeWidth="4"/>:<path d={action==='triste'?'M-15 131q15-13 30 0':'M-16 121q16 15 32 0'} fill="none" strokeWidth="5"/>}
   </g>
  </g>
 </g>;
}
