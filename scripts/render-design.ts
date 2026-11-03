import {bundle} from '@remotion/bundler';
import {renderStill,selectComposition} from '@remotion/renderer';
import {generate} from '../src/catalog';
const serveUrl=await bundle({entryPoint:'src/remotion.tsx',publicDir:'public'});
const browserExecutable=process.env.CHROMIUM_PATH||'/usr/bin/chromium';
for(const setting of ['sala','parque','cafe'] as const){
 const project={...generate('Humor',15,false),setting,title:'Uma boa conversa muda o dia'};
 project.scenes[0].line='Trouxe café e uma ideia. Qual dos dois a gente testa primeiro?';
 project.scenes[0].action='acenar';
 const inputProps={project};const composition=await selectComposition({serveUrl,id:'PalitoShow',inputProps,browserExecutable});
 await renderStill({serveUrl,composition,inputProps,browserExecutable,frame:35,output:`examples/visual-${setting}.png`});
 console.log(setting);
}
