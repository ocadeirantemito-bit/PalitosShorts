import React from 'react';
import {AbsoluteFill,Audio,Sequence,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {sceneTimes,type Project,type Scene} from './model';
import {narrationMouthAt,type Narration} from './narration';
import {Character} from './Character';
import {Foreground} from './Scenery';
import {Scenery} from './Scenery';
import {ActionAccent,inferStoryProp,StoryObject} from './SceneProps';
export type VideoProps={project:Project;narration?:Narration};
export function Video({project,narration}:VideoProps){
 const frame=useCurrentFrame();const times=narration?.scenes??sceneTimes(project);const index=Math.max(0,times.findIndex(s=>frame>=s.start&&frame<s.end));const scene=project.scenes[index];const t=frame-times[index].start;
 const mouthLevel=narration?narrationMouthAt(narration.scenes[index],frame):undefined;
 const fade=interpolate(t,[0,8],[0,1],{extrapolateRight:'clamp'});
 const setting=project.setting||(project.category==='Humor'?'sala':project.category==='Reflexões'?'cafe':'parque');
 const sceneLength=Math.max(1,times[index].end-times[index].start),progress=Math.min(1,t/sceneLength);
 const cameraZoom=1.018+progress*.026,cameraPan=scene.speaker==='PALITO'?18:-18;
 const storyProp=inferStoryProp(project,scene),activeX=scene.speaker==='PALITO'?330:745;
 const inactiveAction:Scene['action']=scene.action==='surpresa'?'surpresa':index===project.scenes.length-1?'acenar':'cruzar';
 const bg={creme:'#fff7e8',azul:'#e9f5ff',lilas:'#f0eaff'}[project.background];
 return <AbsoluteFill style={{background:bg,fontFamily:'Arial, sans-serif',color:'#24232c',overflow:'hidden'}}>
 <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position:'absolute'}}>
 <g transform={`translate(540 1080) scale(${cameraZoom}) translate(${-540+cameraPan} -1080)`}>
  <Scenery setting={setting} frame={frame}/>
  <StoryObject kind={storyProp} x={scene.speaker==='PALITO'?477:596} y={1095} t={t} active/>
  <Character x={330} female={false} action={scene.speaker==='PALITO'?scene.action:inactiveAction} t={t} active={scene.speaker==='PALITO'} look={1} depth={scene.speaker==='PALITO'?1.035:.97} mouthLevel={narration?(scene.speaker==='PALITO'?mouthLevel:0):undefined}/>
  <Character x={745} female={true} action={scene.speaker==='TICO'?scene.action:inactiveAction} t={t+17} active={scene.speaker==='TICO'} look={-1} depth={scene.speaker==='TICO'?1.035:.97} mouthLevel={narration?(scene.speaker==='TICO'?mouthLevel:0):undefined}/>
  <ActionAccent action={scene.action} x={activeX} y={805} t={t}/>
  <Foreground setting={setting} frame={frame}/>
 </g>
 </svg>
 <div style={{position:'absolute',top:112,left:80,right:80,display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:29,letterSpacing:7,fontWeight:900,textShadow:'0 2px 16px #fff9'}}>PALITO <span style={{color:'#8055dd',marginRight:'auto',marginLeft:13}}>SHOW</span><span style={{fontSize:20,letterSpacing:2,background:'#fff9',border:'2px solid #24232c',padding:'10px 18px',borderRadius:99}}>{project.category.toUpperCase()}</span></div>
 <div style={{position:'absolute',top:228,left:82,right:82,fontSize:project.title.length>50?46:64,lineHeight:1.08,fontWeight:900,overflowWrap:'anywhere',textShadow:'0 3px 22px #fff'}}>{project.title}</div>
 <div style={{position:'absolute',top:435,left:78,right:78,background:'rgba(255,255,255,.95)',border:'3px solid #24232c',borderRadius:34,padding:'29px 37px 32px',boxShadow:'9px 11px 0 #24232c',opacity:fade,transform:`translateY(${(1-fade)*24}px) scale(${.98+fade*.02})`,backdropFilter:'blur(8px)'}}>
 <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><span style={{fontSize:25,fontWeight:900,color:scene.speaker==='TICO'?'#6f55b5':'#b1781c'}}>{scene.speaker==='TICO'?'TICA':'PALITO'}</span><span style={{fontSize:17,fontWeight:800,letterSpacing:2,color:'#82788f'}}>CENA {index+1} · {String(project.scenes.length).padStart(2,'0')}</span></div><div style={{fontSize:scene.line.length>180?32:41,fontWeight:750,lineHeight:1.24,overflowWrap:'anywhere'}}>{scene.line}</div>
 <div style={{position:'absolute',bottom:-23,left:scene.speaker==='PALITO'?225:750,width:38,height:38,background:'white',borderRight:'3px solid #24232c',borderBottom:'3px solid #24232c',transform:'rotate(45deg)'}}/>
 </div>
 <div style={{position:'absolute',bottom:280,left:100,right:100,textAlign:'center',fontSize:38,fontWeight:700,lineHeight:1.3,opacity:fade}}>{scene.caption}</div>
 <div style={{position:'absolute',bottom:185,left:100,right:100,display:'flex',gap:12}}>{times.map((s,i)=><div key={i} style={{height:8,flex:1,borderRadius:8,background:i<=index?'#8055dd':'#24232c20'}}/>)}</div>
 {narration?.scenes.map((s,i)=><Sequence key={`speech-${i}`} from={s.audioStart} durationInFrames={s.audioEnd-s.audioStart}><Audio src={s.src} volume={1}/></Sequence>)}
 {project.sound&&times.map((s,i)=><Sequence key={i} from={s.start} durationInFrames={8}><Audio src={staticFile('pop.wav')} volume={narration ? 0.12 : 0.2}/></Sequence>) }
 </AbsoluteFill>;
}
