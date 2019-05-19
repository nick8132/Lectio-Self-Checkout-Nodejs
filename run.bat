@echo off
color 0a
title Lectio-Self-Checkout-Nodejs
node -v 2> Nul
if "%errorlevel%" == "9009" (
	cls
    echo Stod der ikke at du skulle installere node inde på github...
    echo Tryk på enter for at installere node. Kør dette program igen når du har downloaded og installeret node.js
    pause
    start https://nodejs.org/en/download/
) else (
    node index.js
)