import json, subprocess, sys, wave
from pathlib import Path
root=Path(__file__).resolve().parents[2]
for speaker in ['PALITO','TICO']:
    output=root/'examples'/f'voz-neural-{speaker.lower()}.wav'
    # Explicit test outputs only; user productions are never overwritten.
    output.unlink(missing_ok=True)
    payload={'speaker':speaker,'text':'Bom dia! Que tal transformar uma boa ideia em uma história divertida? Hoje vamos criar um vídeo juntos.','output':str(output)}
    result=subprocess.run([sys.executable,str(root/'scripts/neural/speak.py')],input=json.dumps(payload),text=True,encoding='utf-8',capture_output=True)
    if result.returncode:
        print(result.stderr,file=sys.stderr)
        raise SystemExit('Falha ao gerar a voz. Veja o erro acima.')
    info=json.loads(result.stdout)
    with wave.open(str(output)) as w:
        assert w.getnframes()>0 and w.getnchannels()==1
        assert abs(w.getnframes()/w.getframerate()-info['duration'])<.001
    assert max(info['envelope'])>=.9
    print(f"{speaker}: {info['voice']} · {info['duration']:.1f}s · {output}")
(root/'.cache/neural/ready.json').write_text(json.dumps({'engine':'kokoro-onnx','voices':['pm_alex','pf_dora']}))
print('As duas vozes passaram no teste. Reinicie o PALITO SHOW para usá-las.')
