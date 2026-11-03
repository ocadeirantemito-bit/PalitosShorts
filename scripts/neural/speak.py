"""Local neural speech. Invoked with a JSON request on stdin, never shell text."""
import json, sys
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
root = Path(__file__).resolve().parents[2]
assets = root / '.cache' / 'neural'
request = json.load(sys.stdin)
text = request['text'].strip()
if not text or len(text) > 500: raise ValueError('Fala inválida (1–500 caracteres).')
voice = {'PALITO': 'pm_alex', 'TICO': 'pf_dora'}[request['speaker']]
output = Path(request['output'])
if output.exists(): raise FileExistsError('O arquivo já existe.')
engine = Kokoro(str(assets/'kokoro-v1.0.onnx'), str(assets/'voices-v1.0.bin'))
samples, rate = engine.create(text, voice=voice, speed=1.0, lang='pt-br')
samples = np.asarray(samples)
if not len(samples) or not np.isfinite(samples).all() or np.max(np.abs(samples)) < .001:
    raise ValueError('O motor neural não produziu uma fala válida.')
output.parent.mkdir(parents=True, exist_ok=True)
sf.write(str(output), samples, rate, subtype='PCM_16')
# Measure the actual written PCM file, used unchanged by the video renderer.
samples, rate = sf.read(str(output))
envelope = []
for frame in range(int(np.ceil(len(samples)/rate*30))):
    part = samples[int(frame*rate/30):int((frame+1)*rate/30)]
    envelope.append(float(np.sqrt(np.mean(part*part))) if len(part) else 0)
peak = max(max(envelope), .00001)
envelope = [round(v/peak, 3) if v > .003 else 0 for v in envelope]
print(json.dumps(dict(duration=len(samples)/rate, envelope=envelope, sampleRate=rate, engine='kokoro-onnx', voice=voice)))
