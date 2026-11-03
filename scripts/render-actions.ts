import {bundle} from '@remotion/bundler';
import {renderStill,selectComposition} from '@remotion/renderer';
import {generate} from '../src/catalog';
import {sceneTimes} from '../src/model';

const project={...generate('Humor',15,false),setting:'sala' as const,title:'Academia de ideias'};
project.scenes[2]={speaker:'PALITO',line:'De imaginar que eu estava na academia.',caption:'A vida tem dessas.',action:'escorregar'};
const frame=sceneTimes(project)[2].start+34;
const inputProps={project};
const serveUrl=await bundle({entryPoint:'src/remotion.tsx',publicDir:'public'});
const browserExecutable=process.env.CHROMIUM_PATH||'/usr/bin/chromium';
const composition=await selectComposition({serveUrl,id:'PalitoShow',inputProps,browserExecutable});
await renderStill({serveUrl,composition,inputProps,browserExecutable,frame,output:'examples/visual-actions.png'});

const crossed={...project,scenes:project.scenes.map(scene=>({...scene}))};
crossed.scenes[1]={speaker:'TICO',line:'Estou prestando atenção.',caption:'',action:'cruzar'};
const crossedProps={project:crossed};
const crossedComposition=await selectComposition({serveUrl,id:'PalitoShow',inputProps:crossedProps,browserExecutable});
await renderStill({serveUrl,composition:crossedComposition,inputProps:crossedProps,browserExecutable,frame:sceneTimes(crossed)[1].start+34,output:'examples/visual-crossed-arms.png'});
