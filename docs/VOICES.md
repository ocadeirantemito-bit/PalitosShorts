# Vozes locais da Etapa A

O PALITO SHOW inclui o sintetizador **eSpeak NG**, no pacote `@echogarden/espeak-ng-emscripten` **0.3.5**. Ele gera WAV PCM mono a 22050 Hz no Node, sem navegador, conta, chave, serviço de nuvem ou conexão durante a geração. O pacote inclui os dados do português brasileiro e os perfis usados pelo aplicativo.

| Personagem | Perfil | Característica |
| --- | --- | --- |
| PALITO | `pt-br+m3`, pitch 43, faixa 65, 155 palavras/min | Perfil masculino, expressivo |
| TICA (identificador TICO) | `pt-br+f3`, pitch 55, faixa 35, 150 palavras/min | Perfil feminino, contido |

São **duas variantes sintéticas da língua pt-BR**, com parâmetros e timbres distintos. Não são gravações de dois atores nem vozes neurais. O resultado é robótico, com entonação limitada. A pronúncia é gerada pelo mecanismo de português brasileiro; nomes próprios e frases ambíguas podem soar estranhos. A aplicação não promete qualidade de locutor profissional. Os parâmetros ficam fixos por personagem; o sistema não acelera o áudio para forçá-lo a caber.

Cada fala produz um arquivo WAV real. A duração vem da quantidade exata de amostras. Uma curva de amplitude RMS a 30 quadros/s permite animar a boca apenas durante a fala, inclusive fechar nas pausas. O WAV é o mesmo áudio usado na composição e no MP4. A síntese detecta saída vazia/silenciosa e recusa sobrescrever arquivos existentes.

## Instalação e recuperação

A síntese e os testes foram executados em Linux/Node 24. Os comandos Windows foram preparados, mas não executados em uma máquina Windows nesta etapa.

Com Node.js 22/24 e npm instalados, execute `npm ci` na raiz do projeto. Isso instala o motor e as duas variantes juntos, verificando a integridade do pacote pelo lockfile. Após a primeira instalação, a geração de fala funciona offline.

No Windows, um atalho de procedimento é:

```powershell
powershell -File scripts/install-voices.ps1
```

No Linux/macOS:

```sh
bash scripts/install-voices.sh
```

Os scripts apenas reinstalam as dependências declaradas e verificam as vozes; não alteram a política de execução do PowerShell nem baixam executáveis de terceiros fora do npm. No Windows, use o PowerShell do usuário e siga a política de execução administrada no seu computador. Se a política não permitir scripts, `npm ci` seguido de `npm run dev` é equivalente para instalar/iniciar.

Se os dados estiverem ausentes ou corrompidos, `voiceStatus()` retorna `ready: false` e um procedimento de recuperação. Reinstale com `npm ci` e reinicie o servidor. Não basta ter `speechSynthesis` no navegador: essa API não é utilizada.

## Licença e fontes

- Motor eSpeak NG: [projeto oficial](https://github.com/espeak-ng/espeak-ng), GNU GPL versão 3 ou posterior (consulte o `COPYING` da distribuição).
- Pacote utilizado: [Echogarden eSpeak NG Emscripten](https://github.com/echogarden-project/espeak-ng-emscripten), licença declarada `GPL-3.0`, arquivo completo em `node_modules/@echogarden/espeak-ng-emscripten/COPYING`.
- Código-fonte correspondente e instruções de compilação: [fork Echogarden, branch fork](https://github.com/echogarden-project/espeak-ng/tree/fork), referenciado pelo README do pacote.

Ao redistribuir o aplicativo com esse motor, preserve avisos, licença e cumpra as obrigações de fornecimento de código-fonte da GPL. O uso local não tem cobrança por geração. O motor não inclui músicas nem gravações comerciais de locutores.

## Piper e expansão futura

A opção neural agora integrada é Kokoro ONNX. A instalação e o teste usam `pm_alex` e `pf_dora` em português brasileiro. Piper continua sem integração no app; não é necessário para o fluxo atual.

A interface `SpeechProvider` em `server/tts.ts` separa a síntese da composição. Uma integração futura pode substituir a implementação, desde que produza WAV real, duração medida, envelope de amplitude e identificação da voz. Para Piper, será necessário avaliar individualmente a licença/model card de **cada voz brasileira** antes de distribuí-la, além da licença do motor. Uma integração em nuvem seria opcional e precisaria explicitar custos e credenciais.

## Kokoro neural

Consulte [docs/INSTALAR-VOZES-NEURAIS.md](INSTALAR-VOZES-NEURAIS.md). O instalador baixa o modelo da release oficial e verifica os hashes SHA-256 antes de ativar o motor.
