# Instalar e testar as vozes neurais

A versão atual já suporta Kokoro local: voz masculina Alex para Palito e feminina Dora para Tica. No Windows, instale Python 3.12 (64 bits), extraia o pacote e abra **INSTALAR-VOZES.cmd**. Depois abra **TESTAR-VOZES.cmd** para ouvir os exemplos. Reinicie o servidor do app; o painel indica quando Kokoro está ativo.

[Guia completo, requisitos e solução de erros](docs/INSTALAR-VOZES-NEURAIS.md). A primeira instalação baixa os modelos; a geração posterior funciona offline. O procedimento foi validado em Linux, não em Windows físico. Ainda não há instalador Electron do aplicativo.

Os registros abaixo descrevem as etapas anteriores; a informação de bloqueio de modelos foi superada pela instalação atual.

# PALITO SHOW — Etapa A: geração automática com vozes

Esta entrega implementa **somente a Etapa A**, aproveitando a aplicação existente. Electron, instalador Windows e agendamento não fazem parte desta entrega. Nada foi publicado novamente.

**Novo fluxo:** gerar vídeo → duas vozes locais → cenas sincronizadas → MP4 verificado → assistir → aprovar → baixar. Não há cobrança por geração nem chamada a serviço externo durante a síntese. O gerador é um catálogo com regras editoriais, não IA generativa. Projetos automáticos de 30s recebem desenvolvimento adicional; se não couberem, o sistema seleciona uma história mais curta. Falas editadas não são trocadas silenciosamente nem aceleradas.

**Vozes:** eSpeak NG, PALITO `pt-br+m3` e TICA `pt-br+f3`. As vozes são distintas, mas robóticas. Piper neural não foi instalado: o host de modelos foi bloqueado pela política de rede. Veja [instalação, qualidade e licenças](docs/VOICES.md). `npm ci` já instala ambas as vozes.

**Requisitos adicionais:** Node e Google Chrome ou Microsoft Edge. A renderização e a verificação básica usam componentes incluídos no Remotion; não é necessário instalar FFmpeg separadamente para criar o MP4. Quando FFmpeg está no PATH, o aplicativo também decodifica o arquivo inteiro e analisa amostras de áudio e imagem. `FFMPEG_PATH` e `FFPROBE_PATH` continuam disponíveis para instalações personalizadas. O código TTS usa WASM compatível com Node no Windows, mas a validação executada aqui foi em Linux/Chromium, sem teste em Windows físico.

**Evidência da entrega:** `examples/humor-15s-com-vozes.mp4` e `examples/motivacao-30s-com-vozes.mp4`. Cada arquivo tem um JSON ao lado com o roteiro efetivamente usado, vozes, tempos e relatório. Verificados H.264, 1080×1920, 30fps, AAC, duração de 15/30s, decodificação completa, energia de voz dentro das janelas esperadas e imagens por cena. A checagem não transcreve palavras nem faz reconhecimento semântico dos personagens; reveja o vídeo antes de publicar.

Os testes de navegador cobrem duas gerações reais, reprodução, aprovação, persistência, editor, backup, tema e layout. Execute `npm run test:e2e` com os arquivos estáveis durante o teste. A suíte pode levar vários minutos por renderizar ambos os vídeos completos.


Estúdio em português para criar histórias com Palito e Tico. React + TypeScript + Vite, composição SVG em Remotion e backend Node para exportação real. Sem chave de API, IA paga, fontes remotas ou imagens de terceiros.

## Executar

No Windows, dê dois cliques em **INICIAR-PALITO-SHOW.cmd**. Ele encontra o Chrome ou Edge instalado, evita o download de um segundo navegador e mostra no terminal qual navegador será usado. Mantenha a janela aberta e acesse `http://localhost:5173`.

Requisitos: Node.js 22 ou 24, npm e Chromium/Chrome. Chromium precisa das bibliotecas do sistema (em Linux, instale pelo gerenciador da distribuição). No Windows, instale o Google Chrome normalmente e indique seu executável, por exemplo no PowerShell:

```powershell
$env:CHROMIUM_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm ci
npm run dev
```

No Linux deste ambiente o Chromium está em `/usr/bin/chromium`, detectado por padrão. Para outro local defina `CHROMIUM_PATH`. O Remotion também pode obter seu navegador com `npx remotion browser ensure` se o Chrome não estiver disponível, mas prefira configurar explicitamente o executável instalado.

Abra a porta **5173** no computador. O frontend encaminha `/api` ao backend na porta **3001**. O terminal deve permanecer aberto.

```sh
npm ci
npm run dev
# Compilação e servidor único de produção:
npm run build
npm start
```

Em produção, o servidor na porta 3001 serve a interface compilada e a API. `PORT` muda essa porta. `CHROMIUM_PATH` seleciona o navegador. Execute todos os comandos na raiz deste repositório.

## Uso

1. Abra o estúdio: a data local do dispositivo gera e preserva sete sugestões diárias.
2. “Gerar vídeo de hoje” cria as vozes, sincroniza cenas, renderiza e verifica o MP4. “Gerar outro vídeo” escolhe outra história e inicia a produção.
3. “Editar roteiro” abre o editor abaixo do planejamento. A prévia reflete as alterações imediatamente. Edite falas, legendas, ações, personagens, fundo e duração. Salve as alterações.
4. “Exportar MP4” gera o vídeo se necessário ou baixa o resultado existente. Após a verificação, assista ao MP4 dentro do app e use “Aprovar vídeo”. O histórico e a referência ao arquivo ficam salvos.
5. “Meus vídeos” permite reabrir, duplicar, editar e exportar projetos anteriores.
6. Faça backups JSON em Configurações. A restauração valida todo o arquivo antes de pedir confirmação para substituir os dados.

São 28 histórias originais (7 em cada categoria), com 3 cenas de duração proporcional ao texto. Há movimento dos membros, respiração, piscadas e boca, além de caminhada, apontar, aceno, salto, riso, surpresa, tristeza, comemoração, negação, postura de braços cruzados e queda cômica. As ações são reutilizadas conforme cada história. Humor com som ativo usa a risada enviada pelo usuário, após a fala, em volume reduzido. Origem registrada em public/laugh-source.txt; não classificada como CC0. O efeito `public/pop.wav` foi sintetizado matematicamente neste projeto; não contém gravações de terceiros. O áudio de cada cena começa na mesma posição na prévia e no MP4.

A exportação tem 1080×1920, 30 fps, 15 ou 30 segundos, H.264/yuv420p e AAC quando os efeitos estão ativos. Falas e legendas são incorporadas ao vídeo. Os tempos de entrada e saída podem ser consultados por cena no editor. Textos excessivos impedem exportação até serem reduzidos ou receberem 30 segundos.

## iPhone e PWA

Computador e iPhone devem estar na mesma rede. Com `npm run dev`, acesse no Safari o IP local do computador na porta 5173. Libere a porta no Firewall do Windows somente para a rede privada. O backend é acessado pelo proxy do frontend: não coloque endereços de loopback nas configurações do iPhone.

Para instalação confiável na tela inicial e service worker, publique sob **HTTPS**, depois use Compartilhar → Adicionar à Tela de Início. Manifesto e ícone estão incluídos. A PWA não promete renderização nem uso completo offline. Ela precisa do servidor Node disponível para exportar; não executa FFmpeg no Safari. O layout foi testado com viewport de 390×844; não substitui teste em iPhone físico/Safari.

## Testes

```sh
npm test                 # catálogo, validação, planejamento, backups e tempos
npm run build            # TypeScript e bundle de produção
npm run test:e2e          # Chromium instalado; inicia os serviços automaticamente
# Com backend já rodando em 3001 (requer ffmpeg/ffprobe):
node --import tsx tests/render-smoke.ts
```

O teste de renderização gera `examples/palito-show.mp4`, verifica codec, tamanho, duração e áudio com ffprobe e decodifica o vídeo inteiro com FFmpeg. `TEST_ORIGIN` permite apontar para outra porta. Os testes de navegador verificam carregamento, data, personagens em movimento, edição e prévia, persistência após reload, backup/restauração, duplicação, tema, erros de API e largura mobile. Capturas desktop/mobile ficam em `examples/`.

## Arquitetura

- `src/catalog.ts`: histórias e gerador por regras; ponto de substituição por um provedor de IA futuro.
- `src/model.ts`: schemas compartilhados Zod, regras e distribuição temporal.
- `src/Video.tsx`: composição comum ao Player e ao renderizador; personagens SVG articulados.
- `src/remotion.tsx`: registro da composição e duração dinâmica.
- `src/store.ts`: armazenamento local e validação de backups.
- `src/main.tsx`: estúdio, editor, biblioteca e planejamento.
- `server/index.ts`: API de renderização, progresso e download.

## Limites e publicação futura

- Os projetos pertencem ao navegador/dispositivo, sem conta ou sincronização. Limpar os dados do site apaga o histórico. Exporte backups. Navegadores privados podem limitar o armazenamento.
- Há narração local automática com duas variantes pt-BR do eSpeak NG. Não há upload de narração, música, agendamento em segundo plano nem publicação automática nas redes nesta etapa.
- Um render por vez por servidor; demais solicitações recebem erro claro. O progresso de trabalhos ativos fica em memória. Reiniciar o backend interrompe trabalhos ativos; produções concluídas e seus relatórios permanecem no disco. Reiniciar a página não acompanha automaticamente uma exportação já iniciada.
- MP4s ficam em `renders/` até remoção administrativa. Os WAVs, tempos e relatórios ficam em `renders/<id>/`. O backup JSON contém projetos/configurações e referências, mas não os MP4s nem os WAVs; copie também `renders/` para preservar as produções. Trabalhos concluídos também permanecem em memória enquanto o servidor roda. Planeje limpeza de disco em uso prolongado.
- A API foi feita para desenvolvimento e rede local confiável, sem autenticação. Antes de expor na Internet, adicione login, autorização por projeto, limites de requisição, fila persistente, limpeza de arquivos e limites de armazenamento.
- Para publicar, use um servidor/container com Node e Chromium, armazenamento gravável e memória suficiente (recomendado 4 GB). Sirva `dist` e `/api` no mesmo domínio HTTPS. Hospedagem estática isolada não renderiza MP4: será necessário encaminhar `/api` ao serviço de renderização. Não use funções com tempo de execução curto para renders.
- Confira os termos atuais do Remotion para seu uso/organização antes de exploração comercial; não é necessário serviço de IA para executar este app.

## Atualização visual: dupla desenhada e cenários

Palito e Tica usam o modelo simples de bonecos-palito: tronco, braços e pernas são linhas; mãos, cabeça e expressões usam formas vetoriais mínimas. Palito tem cabelo curto e gravata amarela; Tica tem cabelo longo e laço roxo. O identificador interno TICO foi preservado para abrir projetos e backups existentes. Os personagens respiram, piscam, olham um para o outro e a boca continua sincronizada ao áudio.

Sala com sofá/janela/luminária, parque com árvores/banco/caminho e café com balcão/mesas. Os cenários têm movimento ambiente, profundidade em primeiro plano, luz e enquadramento que acompanha quem está falando. A categoria escolhe automaticamente o cenário; o editor permite selecionar outro.

O texto da história pode colocar objetos na cena, como café, celular, presente, lista, halter, pizza, chuva ou Wi-Fi. Surpresa, riso, comemoração, tristeza e queda também recebem efeitos visuais próprios. As imagens `examples/visual-sala.png`, `visual-parque.png` e `visual-cafe.png` vêm da composição real. Vídeos já exportados preservam o desenho anterior; gere novamente para usar o novo visual.

As vozes ainda são eSpeak sintéticas. O download de modelos neurais em huggingface.co continua bloqueado no ambiente atual. Foi salva uma adição desse domínio ao rascunho de rede, sem publicação. Depois de aplicar o acesso será necessário avaliar licença, português brasileiro, voz masculina/feminina, velocidade no computador e incorporar/testar o novo motor. A simples troca de pitch não torna as vozes neurais.
