# ElevenLabs no Windows

Depois de atualizar o projeto e iniciar o servidor, abra http://localhost:5173 e vá a Configurações → Vozes dos personagens.

1. Escolha ElevenLabs, cole a chave no campo de senha e clique em Salvar vozes.
2. Clique em Carregar vozes da conta. Nos campos Voice ID, procure Roger para Palito e Roberta para Tica. Se a voz não aparecer, copie o Voice ID nos detalhes dela no ElevenLabs e cole no campo correspondente.
3. Salve novamente. Clique em Testar Palito e Testar Tica para gerar frases curtas e ouvi-las. Estes testes podem consumir créditos.
4. Só depois gere um vídeo. Os vídeos antigos mantêm o áudio anterior.

A chave é salva em `.cache/elevenlabs/config.json` no servidor local. Essa pasta é ignorada pelo Git e não entra no backup JSON dos projetos. Não compartilhe essa pasta nem inclua a chave em capturas de tela. Configure usando localhost no próprio computador; o endpoint de configuração não aceita acesso pela rede local.

A leitura de vozes exige permissão de leitura de Voices na chave. A geração exige Text to Speech. A disponibilidade de vozes da biblioteca e da API depende do plano; a Roberta pode não estar disponível na conta gratuita. Se ocorrer erro, o app exibe o problema e não usa outra voz sem avisar. Confira os termos do plano antes de usar os áudios comercialmente.

O modelo usado é `eleven_multilingual_v2`, com saída MP3 convertida para WAV local de 24 kHz. A sincronização usa a duração real e o volume medido do áudio recebido. Não altera o timbre nem acelera as falas. Quando uma história não cabe no tempo escolhido, aumente a duração ou reduza o texto; a integração não faz novas tentativas automáticas com outros roteiros consumindo créditos.

Falas com texto, voz e parâmetros idênticos são reutilizadas de `.cache/elevenlabs/audio`. Alterar fala ou Voice ID cria um áudio novo. Apagar o cache faz o próximo pedido consumir créditos novamente. Para voltar às vozes locais, selecione Local e salve.

Validação automatizada usa respostas simuladas, sem enviar sua chave ou gastar créditos. A conexão real precisa ser conferida pelos botões de teste na sua instalação.
