import type {Project} from './model';
export function storyAppearance(p:Pick<Project,'title'|'scenes'|'theme'|'setting'|'outfit'>){
 const text=`${p.theme||''} ${p.title} ${p.scenes.map(s=>s.line).join(' ')}`.toLowerCase();
 const setting=p.setting||(/chefe|expediente|reunião|escritório|trabalho/.test(text)?'escritorio':/jantar|cozinh|panela|arroz|receita/.test(text)?'cozinha':/varanda|sextou|cerveja|petisco/.test(text)?'varanda':/correr|caminh|parque|treino/.test(text)?'parque':'sala');
 const outfit=p.outfit||(setting==='escritorio'?'trabalho':setting==='parque'?'esporte':setting==='cozinha'?'casa':'casual');
 return {setting,outfit} as const;
}
