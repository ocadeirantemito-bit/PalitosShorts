# Roteiros novos com IA

Em Configurações → IA para roteiros novos, ative a opção, informe uma chave de API OpenAI e salve. O modelo usado é GPT-4.1 mini. A chave fica em `.cache/writer/config.json`, fora do Git e do backup de projetos. Configure no próprio computador via localhost.

A API OpenAI tem faturamento separado do ChatGPT e do ElevenLabs. Não informe a chave ElevenLabs neste campo. Configure limites de uso na sua conta OpenAI. A geração de texto só acontece quando você pede um roteiro; os testes automatizados não usam sua conta.

O botão Criar roteiro neste tema gera o texto para revisão. Ele envia tema, duração e até 30 roteiros recentes como referência para evitar repetir títulos e diálogos. Não envia chaves ElevenLabs ou áudios. Uma validação local exige os dois personagens, tamanho adequado, cenário, roupa e título diferente. Não é garantia de criatividade ou de duração exata: confira antes de gerar vozes.

Gerar outro vídeo pede um novo roteiro e depois inicia a produção. Após concluir um MP4, o botão principal vira Gerar vídeo novo. Exportar MP4 continua baixando o vídeo atual. Textos editados são preservados ao gerar pela primeira vez.

Sem IA configurada, os roteiros curtos vêm do catálogo local e excluem o título imediatamente anterior. As séries locais longas têm um episódio por tema; o app pede ativar a IA para criar outro episódio, em vez de exportar uma cópia como se fosse novo.

Os cenários disponíveis são sala, parque, café, escritório, cozinha e varanda. A IA escolhe entre eles e entre roupas casual, trabalho, casa e esporte. No catálogo local, o cenário é inferido do assunto, respeitando uma escolha manual. Os campos Cenário e Roupa no editor permitem ajustar. Não é geração livre de imagens.

Se somente Palito funcionar no ElevenLabs, selecione para Tica uma voz disponível na API do seu plano e teste. A geração não deve ser concluída quando uma fala falhar. A prévia sem narração não tem voz; o MP4 final passa por verificação das amostras reais de áudio. Nenhuma troca de provedor é feita silenciosamente.
