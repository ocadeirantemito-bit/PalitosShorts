import React from 'react';
import {AbsoluteFill,Audio,Sequence,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {sceneTimes,type Project,type Scene} from './model';
import {narrationMouthAt,type Narration} from './narration';
import {Character} from './Character';
import {Scenery} from './Scenery';
export type VideoProps={project:Project;narration?:Narration};
export function Video({project,narration}:VideoProps){
 const frame=useCurrentFrame();const times=narration?.scenes??sceneTimes(project);const index=Math.max(0,times.findIndex(s=>frame>=s.start&&frame<s.end));const scene=project.scenes[index];const t=frame-times[index].start;
 const mouthLevel=narration?narrationMouthAt(narration.scenes[index],frame):undefined;
 const fade=interpolate(t,[0,8],[0,1],{extrapolateRight:'clamp'});
 const bg={creme:'#fff7e8',azul:'#e9f5ff',lilas:'#f0eaff'}[project.background];
 return <AbsoluteFill style={{background:bg,fontFamily:'Arial, sans-serif',color:'#24232c',overflow:'hidden'}}>
 <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position:'absolute'}}>
 <Scenery setting={project.setting||(project.category==='Humor'?'sala':project.category==='Reflexões'?'cafe':'parque')} frame={frame}/>
 <Character x={330} female={false} action={scene.speaker==='PALITO'?scene.action:'cruzar'} t={t} active={scene.speaker==='PALITO'} mouthLevel={narration?(scene.speaker==='PALITO'?mouthLevel:0):undefined}/>
 <Character x={745} female={true} action={scene.speaker==='TICO'?scene.action:index===2?'rir':'surpresa'} t={t+17} active={scene.speaker==='TICO'} mouthLevel={narration?(scene.speaker==='TICO'?mouthLevel:0):undefined}/>
 </svg>
 <div style={{position:'absolute',top:130,left:90,right:90,fontSize:30,letterSpacing:7,fontWeight:800}}>PALITO <span style={{color:'#8055dd'}}>SHOW</span><span style={{float:'right',fontSize:25,letterSpacing:2}}>{project.category.toUpperCase()}</span></div>
 <div style={{position:'absolute',top:240,left:90,right:90,fontSize:project.title.length>50?48:66,lineHeight:1.12,fontWeight:900,overflowWrap:'anywhere'}}>{project.title}</div>
 <div style={{position:'absolute',top:465,left:90,right:90,background:'white',border:'3px solid #24232c',borderRadius:36,padding:'30px 38px',boxShadow:'9px 10px 0 #24232c',opacity:fade,transform:`translateY(${(1-fade)*20}px)`}}>
 <div style={{fontSize:26,fontWeight:900,color:scene.speaker==='TICO'?'#3275d5':'#8055dd',marginBottom:12}}>{scene.speaker==='TICO'?'TICA':'PALITO'}</div><div style={{fontSize:scene.line.length>180?34:43,fontWeight:700,lineHeight:1.25,overflowWrap:'anywhere'}}>{scene.line}</div></div>
 <div style={{position:'absolute',bottom:280,left:100,right:100,textAlign:'center',fontSize:38,fontWeight:700,lineHeight:1.3,opacity:fade}}>{scene.caption}</div>
 <div style={{position:'absolute',bottom:185,left:100,right:100,display:'flex',gap:12}}>{times.map((s,i)=><div key={i} style={{height:8,flex:1,borderRadius:8,background:i<=index?'#8055dd':'#24232c20'}}/>)}</div>
 {narration?.scenes.map((s,i)=><Sequence key={`speech-${i}`} from={s.audioStart} durationInFrames={s.audioEnd-s.audioStart}><Audio src={s.src} volume={1}/></Sequence>)}
 {project.sound&&times.map((s,i)=><Sequence key={i} from={s.start} durationInFrames={8}><Audio src={staticFile('pop.wav')} volume={narration ? 0.12 : 0.2}/></Sequence>) }
 </AbsoluteFill>;
}
