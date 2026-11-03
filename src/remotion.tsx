import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Video,type VideoProps} from './Video';
import {catalog} from './catalog';
import type {Project} from './model';
const fallback:Project={...catalog[0],id:'default',duration:15,background:'creme',created:'',status:'roteiro',sound:true};
const defaultProps:VideoProps={project:fallback};
registerRoot(()=> <Composition id="PalitoShow" component={Video} width={1080} height={1920} fps={30} durationInFrames={450} defaultProps={defaultProps} calculateMetadata={({props})=>({durationInFrames:props.narration?.durationInFrames??props.project.duration*30})}/>);
