import type {Project,Scene} from './model';
export const series=[
 {name:'Vida de trabalhador',theme:'Trabalho',title:'O favor das 17h59',setting:'escritorio',lines:[
 'São cinco e cinquenta e nove. Guardei o computador, peguei a mochila e o chefe apareceu sorrindo.',
 'Deixa eu adivinhar: ele perguntou se você tinha um minutinho. Esse minuto nunca aparece no relógio.',
 'Disse que era só mudar uma cor na apresentação. Abri o arquivo e tinham quarenta páginas sem título.',
 'Uma cor em quarenta páginas? Isso já virou decoração de apartamento. Você perguntou para quando era?',
 'Ele falou que era urgente. Perguntei qual página precisava ficar pronta primeiro e ele pediu tudo.',
 'Aí você precisa mostrar o tamanho da tarefa. Às vezes o outro chama de rápido porque não vai fazer.',
 'Mostrei a lista. Tinha gráfico sem número, foto cortada e uma página inteira escrita: colocar ideia aqui.',
 'Essa última ficou pronta então. A ideia é combinar o prazo antes de alguém perder o último ônibus.',
 'Expliquei que podia corrigir a capa agora e terminar o restante amanhã. Fiquei esperando a resposta.',
 'E ele aceitou? Porque seu ônibus já deve estar chegando, e a mochila não vai trabalhar por você.',
 'Aceitou. Corrigi a capa, fechei tudo e ele perguntou se eu podia mandar uma versão no grupo.',
 'Manda amanhã. Hoje sua única apresentação é mostrar o cartão para o motorista e conseguir um banco.'
 ]},
 {name:'Casal na vida real',theme:'Casal',title:'O jantar de qualquer coisa',setting:'cozinha',lines:[
 'Estamos há meia hora escolhendo o jantar. Você disse qualquer coisa e recusou pizza, sopa e sanduíche.',
 'Porque eu quero uma comida diferente, mas com gosto conhecido, que chegue quente e não seja cara.',
 'Entendi. Você quer um restaurante novo, com o cardápio da sua mãe e o preço do mercado de dez anos atrás.',
 'E entrega grátis. Não esquece da entrega grátis. A fome está grande, mas minha coragem de pagar não.',
 'Abri um aplicativo e apareceu uma promoção. Quando coloquei o endereço, a promoção foi morar em outro bairro.',
 'Aqui aconteceu igual. Ganhei um cupom para minha primeira compra na loja onde já comprei quinze vezes.',
 'Então vamos cozinhar. Temos arroz, dois ovos e aquele tomate que está esperando uma decisão desde segunda.',
 'O tomate está mais maduro do que a gente nessa conversa. Vou cortar enquanto você coloca a panela.',
 'Fiz o arroz, você fez os ovos e conseguimos jantar antes do tempo estimado da primeira entrega.',
 'E ainda sobrou dinheiro. Amanhã a gente pode comprar alguma coisa diferente para não repetir o cardápio.',
 'Combinado. O que você quer que eu compre? Vou anotar agora para não passar outra meia hora decidindo.',
 'Qualquer coisa. Mas coloca tomate na lista, que esse pelo menos não precisou de cupom para salvar a noite.'
 ]},
 {name:'Sextou sem dinheiro',theme:'Sextou e bebidas',title:'Reserva na varanda',setting:'varanda',lines:[
 'O pessoal chamou para sair na sexta. Fui olhar o saldo e meu aplicativo abriu direto na parte de respirar fundo.',
 'Eu também queria sair. Mas o aluguel já saiu, a luz já saiu e o dinheiro saiu antes da gente.',
 'O grupo escolheu um lugar com música ao vivo. Olhei o preço da entrada e quase comecei a cantar aqui mesmo.',
 'Não esquece o transporte e a comida. Tem passeio que começa com uma cerveja e termina com uma prestação.',
 'Um amigo falou que era só dividir. Perguntei dividir o quê, porque o meu salário já está bem dividido.',
 'Então chama o pessoal para casa. Cada um traz um petisco, e quem quiser pode trazer uma bebida.',
 'Mas nossa varanda só tem duas cadeiras. Se vier todo mundo, alguém vai ter que sentar na caixa de ferramentas.',
 'A gente empresta cadeiras dos vizinhos. Só precisa devolver no sábado, antes de eles virem cobrar com café.',
 'Deu certo. Um trouxe pipoca, outro trouxe suco e até o amigo atrasado chegou antes de acabar a conversa.',
 'E ninguém ficou olhando o celular para calcular a conta. Foi a primeira sexta sem reunião sobre quem pagou.',
 'No final perguntaram se precisava reservar para a próxima semana. Falei que o lugar era bem disputado.',
 'Claro. Varanda com conversa boa, sem entrada e com direito a levar a própria cadeira não tem concorrência.'
 ]},
] as const;
export function seriesStory(theme:Project['theme'],duration:60|90){
 const story=series.find(s=>s.theme===theme)||series[0];
 const lines=duration===60?story.lines.filter((_,i)=>i<4||i>=8):story.lines;
 return {theme:story.theme,series:story.name,title:story.title,category:'Humor' as const,setting:story.setting,scenes:lines.map((line,i)=>({speaker:i%2?'TICO':'PALITO',line,caption:'',action:'falar'})) as Scene[]};
}
