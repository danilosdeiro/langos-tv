@echo off
title Lango's TV
echo ==============================================
echo       INICIANDO O LANGO'S TV
echo ==============================================
echo.
echo Abrindo o servidor local...
cd /d "%~dp0"
start "" http://localhost:5173/
npx vite --host --port 5173
pause
