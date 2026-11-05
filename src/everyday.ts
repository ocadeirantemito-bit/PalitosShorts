import type {Project,Scene} from './model';

type Entry=[NonNullable<Project['theme']>,Project['category'],string,string,string,string];
// Original scripts, not scraped quotations or claims about social-media trends.
const entries:Entry[]=[
 ['Trabalho','Humor','Só uma mensagem','Já encerrou o expediente?','Sim. Por quê?','Meu chefe escreveu só uma coisinha. Lá se foi minha noite.'],
 ['Trabalho','Humor','Reunião econômica','Conseguimos economizar hoje!','Dinheiro?','Não. Fizemos uma reunião para marcar outra reunião.'],
 ['Trabalho','Humor','Sexta no relógio','Você olha muito para o relógio.','Estou acompanhando um projeto.','Qual? A chegada das seis da tarde.'],
 ['Salário e boletos','Humor','Visita relâmpago','Seu salário já caiu?','Caiu.','O meu só passou para cumprimentar os boletos.'],
 ['Salário e boletos','Humor','O carrinho espera','Você comprou tudo que queria?','Coloquei no carrinho.','Comprar é outra etapa do meu planejamento financeiro.'],
 ['Salário e boletos','Humor','Dia de pagamento','Hoje eu vou pedir uma comida diferente.','Qual?','A que tiver entrega grátis.'],
 ['Casal','Humor','Qualquer coisa','O que você quer jantar?','Qualquer coisa.','Já sugeri cinco. Acho que qualquer coisa ainda não abriu.'],
 ['Casal','Reflexões','Amor no mercado','Como foi o seu dia?','Puxado.','Trouxe o pão que você gosta. A gente conversa enquanto come.'],
 ['Casal','Humor','Cobertor compartilhado','A gente divide tudo, né?','Claro, amor.','Então devolve a minha metade do cobertor.'],
 ['Solteiro','Humor','Compromisso marcado','Tem compromisso hoje?','Tenho.','Meu sofá reservou a noite inteira comigo.'],
 ['Solteiro','Reflexões','Boa companhia','Vai sair sozinho?','Vou.','Estou aprendendo a gostar dos meus próprios planos.'],
 ['Solteiro','Humor','Mensagem esperada','Meu celular não para de tocar!','É algum pretendente?','É a loja perguntando se esqueci o carrinho.'],
 ['Sextou e bebidas','Humor','Convite de sexta','Bora tomar uma cerveja depois do trabalho?','Bora. Como a gente volta?','De aplicativo. Hoje o carro também vai descansar.'],
 ['Sextou e bebidas','Humor','Mesa dos amigos','Qual é a melhor bebida da noite?','A mais cara?','A que vem com conversa boa e ninguém falando de trabalho.'],
 ['Sextou e bebidas','Humor','Sextou em casa','Vai para onde nessa sexta?','Já reservei meu lugar.','Sofá, petisco e bebida gelada. Sem fila para entrar.'],
 ['Cansaço e rotina','Humor','Mais cinco minutos','Por que colocou tantos alarmes?','Para acordar cedo.','Até agora só acordei a casa inteira.'],
 ['Cansaço e rotina','Humor','Faxina em etapas','Terminou a faxina?','Organizei tudo na minha cabeça.','Agora falta convencer meus braços a participar.'],
 ['Cansaço e rotina','Humor','Descanso agendado','Qual é seu plano para domingo?','Não fazer nada.','Ótimo. Deixa um horário livre para eu te acompanhar.'],
 ['Motivação diária','Motivação','Depois do ônibus','Cheguei cansado e quase desisti de estudar.','Conseguiu abrir o caderno?','Uma página hoje. Amanhã eu continuo.'],
 ['Motivação diária','Motivação','Tênis na porta','Não consegui correr como planejei.','Mas você saiu de casa?','Caminhei dez minutos. Já é um começo.'],
 ['Motivação diária','Motivação','Segunda tentativa','Errei de novo.','O que você faria diferente agora?','Já sei uma coisa. Vou tentar por ela.'],
 ['Prosperidade','Motivação','Uma conta por vez','Hoje consegui pagar uma dívida.','Só uma?','Uma a menos. Para mim, isso já é uma conquista.'],
 ['Prosperidade','Motivação','Meta pequena','Comecei a guardar um pouco por mês.','Mesmo sendo pouco?','O valor cresce depois. Primeiro eu construo o hábito.'],
 ['Prosperidade','Reflexões','Riqueza de domingo','O que você quer conquistar?','Uma casa maior?','Tempo para almoçar sem pressa com quem eu gosto.'],
];

export const everydayCatalog=entries.map(([theme,category,title,a,b,c])=>({
 theme,category,title,
 scenes:[
  {speaker:'PALITO',line:a,caption:'',action:'falar'},
  {speaker:'TICO',line:b,caption:'',action:'falar'},
  {speaker:'PALITO',line:c,caption:'',action:category==='Humor'?'rir':'falar'},
 ] as Scene[],
}));
