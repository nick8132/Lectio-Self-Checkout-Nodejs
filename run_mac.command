#!/bin/bash
clear
echo -n -e "\033]0;Lectio-Self-Checkout-Nodejs\007"
if (which "node") then
	clear
    cd "$( cd "$(dirname "$0")" ; pwd -P )"
	node index.js
else
	echo "Stod der ikke at du skulle installere node inde på github..."
    echo "Tryk på enter for at installere node. Kør dette program igen når du har downloaded og installeret node.js"
    echo "Kom igen når du har installeret det!"
    echo ""
    echo "Tryk for at fortsættte"
    read
    echo "Åbner Node.js download side om:"
    for VARIABLE in 3 2 1
	do
		echo $VARIABLE
		sleep 1
	done
    open https://nodejs.org/en/download/
    killall -e Terminal
fi