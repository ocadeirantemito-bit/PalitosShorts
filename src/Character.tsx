import React from 'react';
import type {Scene} from './model';
export function Character({x,female,action,t,active,mouthLevel}:{x:number;female:boolean;action:Scene['action'];t:number;active:boolean;mouthLevel?:number}){
 const ink='#252237',skin=female?'#d49371':'#efbe91',shirt=female?'#8963cc':'#e7ad40';
 const walk=action==='andar'?Math.sin(t*.16)*29:0;
 const jump=['pular','comemorar'].includes(action)?-Math.abs(Math.sin(t*.12))*58:0;
 const y=813+jump+Math.sin(t*.08)*3+(action==='rir'?Math.sin(t*.7)*3:0);
 const tilt=action==='escorregar'?Math.sin(Math.min(t/48,1)*Math.PI/2)*42:action==='negar'?Math.sin(t*.2)*4:0;
 const blink=t%130>123, mouth=mouthLevel===undefined?(active?Math.abs(Math.sin(t*.5)):.05):mouthLevel;
 const gesture=active?Math.sin(t*.15)*12:Math.sin(t*.06)*4;
 const rightY=action==='acenar'?135+Math.sin(t*.28)*26:action==='apontar'?205:['pular','comemorar'].includes(action)?120:280+gesture;
 const leftY=['pular','comemorar'].includes(action)?125:285-gesture;
 return <g data-character={female?'TICA':'PALITO'} stroke={ink} strokeLinecap="round" strokeLinejoin="round">
 <ellipse cx={x} cy="1260" rx="103" ry="18" fill="#29243b" opacity=".14" stroke="none"/>
 <g transform={`translate(${x+walk*.4},${y}) rotate(${tilt} 0 290)`}>
 {female&&<path d="M-77 68 Q-113 136-87 228 L-37 190 58 209 Q122 142 77 55Z" fill="#443044" strokeWidth="7"/>}
 <g strokeWidth="23" fill="none"><path d={`M-26 288 Q${-36+walk} 348 ${-50+walk} 418`} stroke="#3e455e"/><path d={`M26 288 Q${40-walk} 350 ${57-walk} 418`} stroke="#3e455e"/></g>
 <g strokeWidth="6" fill={female?'#e4c9ed':'#faf0d8'}><path d={`M${-66+walk} 408 l26 2 8 23 -66 0 q-5-18 32-25Z`}/><path d={`M${42-walk} 410 l28-2 q40 8 33 25 l-65 0Z`}/></g>
 <path d="M-41 181 Q0 167 41 181 L55 287 Q0 315-55 287Z" fill={shirt} strokeWidth="7"/>
 <path d="M-34 180 L-12 209 0 195 12 209 34 180" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="5"/>
 <path d="M-43 268 Q0 283 46 268" stroke={female?'#704ba8':'#ce902c'} fill="none" strokeWidth="7"/>
 <path d="M-15 157 L-16 184 Q0 199 17 184 L15 155" fill={skin} strokeWidth="6"/>
 {action==='cruzar'?<g fill="none" strokeWidth="15"><path d="M-43 195 Q-89 251 31 237" stroke={skin}/><path d="M43 195 Q90 260-28 226" stroke={skin}/><path d="M-37 234l39 7 M36 246l-39-9" stroke={ink} strokeWidth="3"/></g>:<g fill="none"><path d={`M-43 194 Q-83 232 -100 ${leftY}`} stroke={ink} strokeWidth="21"/><path d={`M-43 194 Q-83 232 -100 ${leftY}`} stroke={skin} strokeWidth="13"/><path d={`M43 194 Q81 ${rightY-8} 105 ${rightY}`} stroke={ink} strokeWidth="21"/><path d={`M43 194 Q81 ${rightY-8} 105 ${rightY}`} stroke={skin} strokeWidth="13"/><circle cx="-100" cy={leftY} r="12" fill={skin} strokeWidth="4"/><circle cx="105" cy={rightY} r="12" fill={skin} strokeWidth="4"/>{action==='apontar'&&<path d={`M111 ${rightY-6}l25-9`} stroke={skin} strokeWidth="8"/>}</g>}
 <g transform={`rotate(${action==='triste'?-8:active?Math.sin(t*.1)*2:3})`}>
 <ellipse cx="-75" cy="99" rx="13" ry="18" fill={skin} strokeWidth="5"/><ellipse cx="75" cy="99" rx="13" ry="18" fill={skin} strokeWidth="5"/>
 <path d="M-73 65 Q-76-9 0-9 Q81-9 74 67 L71 112 Q62 164 0 170 Q-62 164-71 111Z" fill={skin} strokeWidth="7"/>
 {female?<><path d="M-75 83 Q-103-26-9-32 Q86-44 84 83 Q43 55 20 4 Q-12 53-75 62Z" fill="#443044" strokeWidth="6"/><path d="M-50 3 Q-13-21 26-7" stroke="#74536a" strokeWidth="8" fill="none"/><path d="M57 21l22 6" stroke="#e4ba57" strokeWidth="8"/><circle cx="-76" cy="124" r="8" fill="#f4cf70" strokeWidth="3"/><circle cx="77" cy="124" r="8" fill="#f4cf70" strokeWidth="3"/></>:<><path d="M-74 69 L-82 19 -51 24 -51-17 -16-7 5-34 23-14 Q92-27 78 67 L55 37 Q-11 68-54 44Z" fill="#39303b" strokeWidth="6"/><path d="M-31 13Q12-2 41 12" stroke="#625064" strokeWidth="6" fill="none"/></>}
 <g strokeWidth="5" fill="none"><path d={action==='surpresa'?'M-47 65l25-9 M22 56l25 9':action==='triste'?'M-48 74l27-10 M21 64l27 10':'M-47 72q12-6 24-2 M23 70q12-4 24 2'}/></g>
 {blink?<path d="M-43 93q10 6 20 0 M23 93q10 6 20 0" strokeWidth="5" fill="none"/>:<g><ellipse cx="-33" cy="95" rx="12" ry="17" fill="#fff9ed" strokeWidth="3"/><ellipse cx="33" cy="95" rx="12" ry="17" fill="#fff9ed" strokeWidth="3"/><ellipse cx={female?-37:-29} cy="97" rx="5" ry="8" fill={ink} stroke="none"/><ellipse cx={female?29:37} cy="97" rx="5" ry="8" fill={ink} stroke="none"/>{female&&<path d="M-43 85l-7-5 M43 85l7-5" strokeWidth="4"/>}</g>}
 <path d="M0 97l-5 16 10 1" fill="none" stroke="#a87058" strokeWidth="3"/>
 <ellipse cx="-48" cy="119" rx="13" ry="6" fill="#dd7d76" opacity=".35" stroke="none"/><ellipse cx="48" cy="119" rx="13" ry="6" fill="#dd7d76" opacity=".35" stroke="none"/>
 {mouth>.08?<><ellipse cx="0" cy="139" rx={15+mouth*5} ry={3+mouth*13} fill="#522e3b" strokeWidth="3"/><path d="M-9 136h18" stroke="#fff9ed" strokeWidth="5"/></>:<path d={action==='triste'?'M-15 143q15-13 30 0':'M-15 136q15 12 30 0'} fill="none" strokeWidth="4"/>}
 </g></g></g>;
}
