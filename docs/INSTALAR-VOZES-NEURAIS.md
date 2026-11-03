# Instalar e ouvir as vozes no Windows

1. Baixe o pacote atualizado do PALITO SHOW e extraia o ZIP por inteiro. Não execute de dentro do ZIP.
2. Instale **Python 3.12 de 64 bits** pelo site oficial https://www.python.org/downloads/windows/ (inclua o Python Launcher `py`).
3. Na pasta extraída, dê dois cliques em **INSTALAR-VOZES.cmd**. Aguarde a instalação e o teste. A primeira vez precisa de Internet e baixa cerca de 340 MB de modelo/vozes, além das bibliotecas. Reserve pelo menos 2 GB de disco; mais memória pode melhorar o desempenho.
4. Ao terminar, abra **TESTAR-VOZES.cmd**. Serão gerados e abertos dois WAVs: `examples/voz-neural-palito.wav` e `examples/voz-neural-tico.wav` (Tico é o identificador antigo de Tica).
5. Para usar no app, abra **INICIAR-PALITO-SHOW.cmd**. Ele instala as dependências Node quando necessário, usa o Chrome ou Edge já instalado e inicia o servidor. A interface deve mostrar **Duas vozes neurais pt-BR · Kokoro local**. Gere um vídeo novo; MP4s antigos não mudam.

Não existe ainda instalador Electron do aplicativo. É preciso manter Node e Chrome ou Edge instalados. Os componentes necessários para renderizar e conferir os metadados do MP4 acompanham o Remotion; uma instalação separada do FFmpeg habilita apenas a verificação profunda adicional.

## O que foi instalado

Kokoro ONNX com `pm_alex` (Palito, masculino) e `pf_dora` (Tica, feminino), ambos pt-BR. O motor neural produz o áudio; eSpeak é usado apenas como fonemizador, para converter texto em sons linguísticos. Não é a antiga síntese robótica eSpeak. A pronúncia e a entonação ainda podem variar, especialmente em falas muito curtas e nomes próprios. Ouça os exemplos antes de decidir se a qualidade atende ao seu objetivo.

O processamento acontece na CPU, sem GPU obrigatória, conta, chave ou cobrança por fala. Depois da instalação, a geração funciona offline. Modelo e dependências ficam em `.cache/neural`; o programa ativa Kokoro após o teste criar `ready.json`. Se o motor instalado falhar, o erro é exibido, sem substituir silenciosamente por eSpeak.

O download usa HTTPS e verifica SHA-256 dos dois arquivos, fixados a partir da distribuição oficial. Bibliotecas Python têm versões fixadas em `scripts/neural/requirements.txt`. Os hashes do modelo não são alterados em caso de erro: refaça o download ou investigue a distribuição.

Fontes/licenças: [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) (MIT), [modelo Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0), [vozes brasileiras](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md). O fonemizador eSpeak NG mantém seus avisos GPL; consulte também docs/VOICES.md. Modelos são baixados da release oficial `model-files-v1.1` do kokoro-onnx, conforme o README do fornecedor.

Validação realizada neste ambiente Linux com Python 3.12. O procedimento Windows usa o mesmo código Python e pacotes com suporte a Windows; o arquivo CMD não foi executado em Windows físico.

## Se houver erro

- “py não reconhecido”: instale Python 3.12 com Python Launcher.
- Falha de download: confira Internet e acesso a github.com/release-assets.githubusercontent.com. Não desative a verificação TLS.
- Falta de memória ou geração demorada: feche outros programas; a primeira fala carrega o modelo.
- Não aparece Kokoro no app: confirme que o instalador terminou com sucesso, que `.cache/neural/ready.json` existe e reinicie o servidor na mesma pasta em que instalou as vozes.
