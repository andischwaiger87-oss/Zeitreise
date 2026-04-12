@echo off
REM Push-Script für das Zeitreise-Projekt auf GitHub
REM Einmal doppelklicken und GitHub-Credentials eingeben (beim ersten Mal)

cd /d "%~dp0"
echo.
echo === Zeitreise - Push to GitHub ===
echo Repository: https://github.com/andischwaiger87-oss/Zeitreise.git
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Erfolgreich gepusht\!
) else (
    echo.
    echo Push fehlgeschlagen. Pruefe deine GitHub-Credentials.
)

pause
