@echo off
cd /d "%~dp0"
if not exist ".cache\neural\venv\Scripts\python.exe" (
 echo Execute INSTALAR-VOZES.cmd primeiro.
 pause
 exit /b 1
)
".cache\neural\venv\Scripts\python.exe" scripts\neural\test.py
if errorlevel 1 (
 echo Nao foi possivel testar as vozes. Confira a mensagem acima.
) else (
 start "" "examples\voz-neural-palito.wav"
 start "" "examples\voz-neural-tico.wav"
)
pause
