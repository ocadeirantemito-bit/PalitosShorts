#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/.."
npm ci
node --import tsx --input-type=module -e "import {voiceStatus} from './server/tts.ts'; const s=await voiceStatus(); console.log(JSON.stringify(s,null,2)); if(!s.ready) process.exit(1);"
printf '%s\n' 'As duas vozes locais estão instaladas. Reinicie o PALITO SHOW.'
