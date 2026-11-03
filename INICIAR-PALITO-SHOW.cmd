@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
 echo Node.js nao foi encontrado. Instale a versao LTS em https://nodejs.org/
 pause
 exit /b 1
)

set "CHROMIUM_PATH="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROMIUM_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROMIUM_PATH if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROMIUM_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROMIUM_PATH if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROMIUM_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not defined CHROMIUM_PATH if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "CHROMIUM_PATH=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined CHROMIUM_PATH if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "CHROMIUM_PATH=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

if not defined CHROMIUM_PATH (
 echo Google Chrome ou Microsoft Edge nao foi encontrado.
 echo Instale um dos navegadores e execute este arquivo novamente.
 pause
 exit /b 1
)

if not exist "node_modules" (
 echo Instalando os componentes do aplicativo...
 call npm ci
 if errorlevel 1 (
  echo A instalacao falhou. Confira a mensagem acima.
  pause
  exit /b 1
 )
)

echo Navegador encontrado: %CHROMIUM_PATH%
echo.
echo Abra http://localhost:5173 no navegador.
echo Mantenha esta janela aberta enquanto usar o PALITO SHOW.
echo.
call npm run dev
echo.
echo O PALITO SHOW foi encerrado.
pause
