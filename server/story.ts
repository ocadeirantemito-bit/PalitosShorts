import type {Project,Scene} from '../src/model';
// A local editorial extension. This is a finite rules-based generator, not AI.
const bridges:Record<Project['category'],[string,string]>={
 'Humor':['Eu ensaiei esse plano a manhã inteira. Na minha cabeça tinha até trilha sonora.','Na prática, faltou combinar com a realidade. Ela nunca lê os meus planos.'],
 'Motivação':['Eu estava esperando a coragem aparecer. Agora vejo que ela cresce quando eu começo.','Guarde essa pequena vitória. Quando a dúvida voltar, lembre que você já conseguiu dar o primeiro passo.'],
 'Saudações':['Entre uma tarefa e outra, lembre de cuidar de você e de quem está por perto.','Mande um abraço para alguém. Uma mensagem simples pode deixar o dia de outra pessoa mais bonito.'],
 'Reflexões':['Às vezes eu procuro uma resposta enorme e esqueço de prestar atenção no que acontece bem aqui.','Quando a gente escuta com calma, as coisas pequenas mostram um valor que a pressa não deixa enxergar.']
};
export function prepareStory(project:Project):Project{
 if(project.theme||project.status!=='roteiro'||project.duration!==30||project.scenes.length!==3)return structuredClone(project);
 const [a,b]=bridges[project.category];
 const extra:Scene[]=[{speaker:'PALITO',line:a,caption:'',action:'apontar'},{speaker:'TICO',line:b,caption:'',action:'acenar'}];
 return {...structuredClone(project),scenes:[...project.scenes.slice(0,2),...extra,project.scenes[2]]};
}
