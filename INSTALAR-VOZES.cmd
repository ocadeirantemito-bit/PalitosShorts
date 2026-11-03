@echo off
cd /d "%~dp0"
py -3.12 scripts\neural\install.py
if errorlevel 1 (
 echo.
 echo Instalacao nao concluida. Confira a mensagem acima.
 echo Requisito: Python 3.12 de 64 bits, disponivel em https://www.python.org/downloads/windows/
) else (
 echo.
 echo Vozes instaladas e testadas. Os audios estao na pasta examples.
 echo Reinicie o PALITO SHOW para ativar as novas vozes.
)
pause
