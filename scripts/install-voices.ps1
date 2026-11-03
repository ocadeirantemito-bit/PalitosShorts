# Run from PowerShell with: powershell -File scripts/install-voices.ps1
# npm verifies package integrity from package-lock.json; no voice/model downloads outside npm.
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
  & npm.cmd ci
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar as dependências e as vozes.' }
  & node --import tsx --input-type=module -e "import {voiceStatus} from './server/tts.ts'; const s=await voiceStatus(); console.log(JSON.stringify(s,null,2)); if(!s.ready) process.exit(1);"
  if ($LASTEXITCODE -ne 0) { throw 'As vozes não ficaram disponíveis. Verifique o erro acima.' }
  Write-Host 'As duas vozes locais estão instaladas. Reinicie o PALITO SHOW.'
} finally { Pop-Location }
