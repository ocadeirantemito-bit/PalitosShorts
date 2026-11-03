"""Install a private Python environment and verified official model assets."""
import hashlib, os, subprocess, sys, urllib.request, venv
from pathlib import Path
root=Path(__file__).resolve().parents[2]
assets=root/'.cache/neural'
if sys.version_info[:2] != (3,12):
    raise SystemExit('Instale Python 3.12 (64 bits) de python.org e abra este instalador novamente.')
assets.mkdir(parents=True,exist_ok=True)
environment=assets/'venv'
python=environment/('Scripts/python.exe' if os.name=='nt' else 'bin/python')
if not python.exists(): venv.EnvBuilder(with_pip=True).create(environment)
subprocess.run([str(python),'-m','pip','install','-r',str(root/'scripts/neural/requirements.txt')],check=True)
base='https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/'
files={'kokoro-v1.0.onnx':'beb0d1848dee9a49da392cc3df26958d46cfa35d321edf434f52949153f0df3a','voices-v1.0.bin':'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'}
def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for part in iter(lambda:f.read(1024*1024),b''):h.update(part)
    return h.hexdigest()
for name,expected in files.items():
    target=assets/name
    if target.exists() and digest(target)==expected:
        print(name,': já verificado.',flush=True);continue
    print('Baixando',name,'(a primeira instalação pode levar alguns minutos)…',flush=True)
    temp=assets/(name+'.part')
    with urllib.request.urlopen(base+name,timeout=120) as response, temp.open('wb') as out:
        while part:=response.read(1024*1024):out.write(part)
    if digest(temp)!=expected:
        temp.unlink(missing_ok=True)
        raise SystemExit('A verificação do download falhou. Nenhum modelo foi ativado; tente novamente.')
    temp.replace(target)
subprocess.run([str(python),str(root/'scripts/neural/test.py')],check=True)
